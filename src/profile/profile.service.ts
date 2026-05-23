import { Injectable, Logger } from '@nestjs/common';
import { CvParserService } from './cv-parser.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly cvParserService: CvParserService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async processAndSaveCv(file: Express.Multer.File, userId: string = 'dummy-user-id') {
    // In a real scenario, we would parse PDF to text here.
    // For this example, we'll assume the file buffer can be converted to text directly or we simulate it.
    const resumeText = file.buffer.toString('utf-8');
    
    this.logger.log('Starting CV processing...');
    const parsedData = await this.cvParserService.parseCv(resumeText);
    
    this.logger.log('Saving parsed profile to Supabase...');
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        extracted_skills: parsedData.extractedSkills,
        experience_level: parsedData.experienceLevel,
        years_of_experience: parsedData.yearsOfExperience,
        resume_text: resumeText,
        embedding: parsedData.embedding, // Requires pgvector
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      this.logger.error('Error saving profile to Supabase:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
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

