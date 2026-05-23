import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type MatchedJob = {
  id: string;
  title: string;
  company: string;
  url: string;
  similarity: number;
};

@Injectable()
export class MatchmakerService {
  private readonly logger = new Logger(MatchmakerService.name);

  constructor(private readonly prismaService: PrismaService) { }

  async getRecommendations(
    userId: string,
    page: number = 1,
    limit: number = 10,
    minSimilarityScore: number = 0.75
  ) {
    this.logger.log(`Fetching recommendations for user ${userId}...`);

    // 1. Get user profile and embedding
    const profiles = await this.prismaService.$queryRaw<any[]>`
      SELECT "id", "embedding"::text as embedding, "extracted_skills"
      FROM "profiles"
      WHERE "user_id" = ${userId}::uuid
      LIMIT 1
    `;

    const profile = profiles?.[0];

    if (!profile || !profile.embedding) {
      this.logger.error(`Profile not found or missing embedding for user ${userId}`);
      throw new NotFoundException('User profile with valid CV embedding not found.');
    }

    // 2. Perform Vector Similarity Search via RPC function
    let matchedJobs: MatchedJob[] = [];
    try {
      matchedJobs = await this.prismaService.$queryRaw<MatchedJob[]>`
        SELECT * FROM match_jobs(
          ${profile.embedding}::vector, 
          ${minSimilarityScore}::float8, 
          ${limit}::int
        )
      `;
    } catch (searchError) {
      this.logger.error('Error searching vector database:', searchError);
      throw new Error(`Vector search failed: ${searchError.message}`);
    }

    // Calculate mock pagination meta
    const meta = {
      totalItems: matchedJobs.length, // Mock total
      totalPages: 1,
      currentPage: page,
    };

    return {
      data: matchedJobs.map((job) => ({
        jobId: job.id,
        title: job.title,
        company: job.company,
        url: job.url,
        matchScore: job.similarity,
        missingSkills: [] // In a real scenario, compare profile.extracted_skills with job.required_skills
      })),
      meta
    };
  }
}
