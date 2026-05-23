import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { CreateScrapingJobDto } from './dto/create-scraping-job.dto';

@ApiTags('Scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Trigger scraping job baru', description: 'Memulai proses crawling secara asinkron' })
  @ApiResponse({ status: 202, description: 'Job scraping berhasil diterima dan masuk ke dalam antrean.' })
  async createJob(@Body() createScrapingJobDto: CreateScrapingJobDto) {
    return this.scraperService.queueScrapingJob(createScrapingJobDto);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Cek status scraping job' })
  @ApiParam({ name: 'jobId', required: true })
  @ApiResponse({ status: 200, description: 'Status terkini dari tugas crawling.' })
  @ApiResponse({ status: 404, description: 'Job tidak ditemukan' })
  async getJobStatus(@Param('jobId') jobId: string) {
    const status = await this.scraperService.getJobStatus(jobId);
    if (!status) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }
    return status;
  }
}

