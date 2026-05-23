import { Injectable, Logger } from '@nestjs/common';
import { CvParserService } from './cv-parser.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly cvParserService: CvParserService,
    private readonly prismaService: PrismaService,
  ) {}

  async processAndSaveCv(file: Express.Multer.File, userId: string = 'dummy-user-id') {
    // In a real scenario, we would parse PDF to text here.
    // For this example, we'll assume the file buffer can be converted to text directly or we simulate it.
    const resumeText = file.buffer.toString('utf-8');
    
    this.logger.log('Starting CV processing...');
    const parsedData = await this.cvParserService.parseCv(resumeText);
    
    this.logger.log('Saving parsed profile to PostgreSQL database via Prisma...');
    
    try {
      // Delete existing profile for the user to simulate upsert on user_id (done sequentially without transaction to avoid P2028 pooling timeout)
      await this.prismaService.$executeRaw`DELETE FROM "profiles" WHERE "user_id" = ${userId}::uuid`;
      
      const skillsArray = parsedData.extractedSkills || [];
      const embeddingStr = `[${parsedData.embedding.join(',')}]`;
      
      // Insert new profile
      await this.prismaService.$executeRaw`
        INSERT INTO "profiles" ("id", "user_id", "extracted_skills", "experience_level", "years_of_experience", "resume_text", "embedding", "updated_at")
        VALUES (
          gen_random_uuid(), 
          ${userId}::uuid, 
          ${skillsArray}, 
          ${parsedData.experienceLevel || null}, 
          ${parsedData.yearsOfExperience || null}, 
          ${resumeText}, 
          ${embeddingStr}::vector, 
          NOW()
        )
      `;
    } catch (dbError) {
      this.logger.error('Error saving profile to database:', dbError);
      throw new Error(`Failed to save profile: ${dbError.message}`);
    }

    // Remove embedding from the response for brevity
    delete parsedData.embedding;

    return {
      success: true,
      data: parsedData,
      message: 'CV successfully processed and saved.'
    };
  }
}
