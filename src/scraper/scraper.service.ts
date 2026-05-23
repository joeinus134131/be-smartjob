import { Injectable, Logger } from '@nestjs/common';
import { CreateScrapingJobDto, Platform } from './dto/create-scraping-job.dto';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor() {}

  async runScrapingJob(createScrapingJobDto: CreateScrapingJobDto) {
    this.logger.log(`Starting synchronous API extraction for platforms: ${createScrapingJobDto.platforms.join(', ')}`);
    
    const { platforms, keywords, location } = createScrapingJobDto;
    const keywordStr = keywords && keywords.length > 0 ? keywords.join(' ') : 'developer';
    let totalCrawled = 0;
    
    try {
      for (const platform of platforms) {
        if (platform === Platform.REMOTIVE) {
          this.logger.log(`Fetching from Remotive for keyword: ${keywordStr}...`);
          const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keywordStr)}`);
          if (res.ok) {
            const data = await res.json();
            totalCrawled += data.jobs ? data.jobs.length : 0;
            this.logger.log(`Found ${data.jobs?.length || 0} jobs from Remotive`);
          }
        } 
        else if (platform === Platform.ARBEITNOW) {
          this.logger.log(`Fetching from Arbeitnow...`);
          const res = await fetch(`https://www.arbeitnow.com/api/job-board-api`);
          if (res.ok) {
            const data = await res.json();
            totalCrawled += data.data ? data.data.length : 0;
            this.logger.log(`Found ${data.data?.length || 0} jobs from Arbeitnow`);
          }
        }
        else if (platform === Platform.HIMALAYAS) {
          this.logger.log(`Fetching from Himalayas...`);
          const res = await fetch(`https://himalayas.app/jobs/api?limit=50`);
          if (res.ok) {
            const data = await res.json();
            totalCrawled += data.jobs ? data.jobs.length : 0;
            this.logger.log(`Found ${data.jobs?.length || 0} jobs from Himalayas`);
          }
        }
      }
      
      return {
        status: 'completed',
        totalCrawled,
        platformsProcessed: platforms,
        message: 'Data successfully aggregated via free APIs.',
      };
    } catch (error) {
      this.logger.error('Error during API aggregation:', error);
      throw new Error(`Failed to aggregate jobs: ${error.message}`);
    }
  }

  // getJobStatus removed as it's no longer applicable for synchronous execution
}


