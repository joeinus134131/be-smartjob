import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateScrapingJobDto } from './dto/create-scraping-job.dto';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(@InjectQueue('scrape-jobs') private scrapeQueue: Queue) {}

  async queueScrapingJob(createScrapingJobDto: CreateScrapingJobDto) {
    this.logger.log(`Queueing new scraping job for platforms: ${createScrapingJobDto.platforms.join(', ')}`);
    
    const job = await this.scrapeQueue.add('scrape', createScrapingJobDto, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return {
      jobId: job.id,
      status: 'queued',
      message: 'Scraping task is queued successfully.',
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.scrapeQueue.getJob(jobId);
    
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;

    return {
      jobId: job.id,
      status: state,
      progress,
      resultSummary: result || null,
    };
  }
}

