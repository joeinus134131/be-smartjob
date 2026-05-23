import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class CvParserService {
  private readonly logger = new Logger(CvParserService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NVIDIA_NIM_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }

  async parseCv(resumeText: string) {
    this.logger.log('Parsing CV with Nvidia NIM and Stepfun...');
    
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
      const completion = await this.openai.chat.completions.create({
        model: 'stepfun-ai/step-3.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 1,
        top_p: 0.9,
        max_tokens: 16384,
        stream: true
      });

      let content = '';
      let reasoningContent = '';

      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta;
        
        const reasoning = (delta as any)?.reasoning_content;
        if (reasoning) {
          reasoningContent += reasoning;
        }

        if (delta?.content) {
          content += delta.content;
        }
      }

      if (reasoningContent) {
        this.logger.log(`Model Reasoning:\n${reasoningContent}`);
      }

      // Clean the content in case the model returns markdown code block formatting
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.substring(7);
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.substring(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.substring(0, cleanedContent.length - 3);
      }
      cleanedContent = cleanedContent.trim();

      const parsedData = JSON.parse(cleanedContent || '{}');
      
      // Generate embedding for the entire resume text using Nvidia embedding model
      this.logger.log('Generating embedding with Nvidia NIM Llama Nemotron...');
      const embeddingResponse = await this.openai.embeddings.create({
        model: 'nvidia/llama-nemotron-embed-1b-v2',
        input: resumeText,
        input_type: 'passage',
        dimensions: 1536
      } as any);

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

