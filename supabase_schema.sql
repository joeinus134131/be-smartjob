-- Supabase Schema for SmartJob
-- Run this in your Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Profiles table (for CV data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- References auth.users if you use Supabase Auth
  name TEXT,
  extracted_skills TEXT[],
  experience_level TEXT,
  years_of_experience INTEGER,
  resume_text TEXT,
  embedding vector(1536), -- 1536 is for OpenAI text-embedding-3-small/ada-002
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Jobs table (for Crawled Jobs)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  url TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL,
  required_skills TEXT[],
  embedding vector(1536), -- Embedding of the job description/requirements
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Match/Search Function (RPC)
-- This function allows vector similarity search
CREATE OR REPLACE FUNCTION match_jobs(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company TEXT,
  url TEXT,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    jobs.id,
    jobs.title,
    jobs.company,
    jobs.url,
    1 - (jobs.embedding <=> query_embedding) AS similarity
  FROM public.jobs
  WHERE 1 - (jobs.embedding <=> query_embedding) > match_threshold
  ORDER BY jobs.embedding <=> query_embedding
  LIMIT match_count;
$$;
