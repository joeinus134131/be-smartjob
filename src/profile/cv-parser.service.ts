import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class CvParserService {
  private readonly logger = new Logger(CvParserService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-to-prevent-crash-on-boot',
    });
  }

  async parseCv(resumeText: string) {
    this.logger.log('Parsing CV with OpenAI...');
    
    const prompt = `
      Extract the following information from the provided resume text:
      1. A list of technical skills (return as JSON array of strings).
      2. The overall experience level (e.g., Junior, Mid, Senior, Lead).
      3. Total years of experience (as an integer).

      Resume Text:
      ${resumeText}

      Respond strictly in JSON format like this:
      {
        "extractedSkills": ["skill1", "skill2"],
        "experienceLevel": "Senior",
        "yearsOfExperience": 5
      }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const parsedData = JSON.parse(response.choices[0].message.content || '{}');
      
      // Also generate embedding for the entire resume text
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: resumeText,
      });

      const embedding = embeddingResponse.data[0].embedding;

      return {
        ...parsedData,
        embedding
      };
    } catch (error) {
      this.logger.error('Error parsing CV:', error);
      throw error;
    }
  }
}
