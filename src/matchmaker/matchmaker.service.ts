import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MatchmakerService {
  private readonly logger = new Logger(MatchmakerService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getRecommendations(
    userId: string,
    page: number = 1,
    limit: number = 10,
    minSimilarityScore: number = 0.75
  ) {
    this.logger.log(`Fetching recommendations for user ${userId}...`);
    const supabase = this.supabaseService.getClient();

    // 1. Get user profile and embedding
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('embedding, extracted_skills')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile || !profile.embedding) {
      this.logger.error(`Profile not found or missing embedding for user ${userId}`);
      throw new NotFoundException('User profile with valid CV embedding not found.');
    }

    // 2. Perform Vector Similarity Search via RPC (match_jobs)
    const { data: matchedJobs, error: searchError } = await supabase.rpc('match_jobs', {
      query_embedding: profile.embedding,
      match_threshold: minSimilarityScore,
      match_count: limit,
    });

    if (searchError) {
      this.logger.error('Error searching vector database:', searchError);
      throw new Error(`Vector search failed: ${searchError.message}`);
    }

    // Calculate mock pagination meta
    const meta = {
      totalItems: matchedJobs ? matchedJobs.length : 0, // Mock total
      totalPages: 1,
      currentPage: page,
    };

    return {
      data: matchedJobs?.map((job: any) => ({
        jobId: job.id,
        title: job.title,
        company: job.company,
        url: job.url,
        matchScore: job.similarity,
        missingSkills: [] // In a real scenario, compare profile.extracted_skills with job.required_skills
      })) || [],
      meta
    };
  }
}

