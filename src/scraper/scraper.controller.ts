import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { CreateScrapingJobDto } from './dto/create-scraping-job.dto';

@ApiTags('Scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Tarik data pekerjaan (Sync)', description: 'Mengambil data dari free APIs secara langsung' })
  @ApiResponse({ status: 200, description: 'Data berhasil diambil dari platform' })
  async createJob(@Body() createScrapingJobDto: CreateScrapingJobDto) {
    return this.scraperService.runScrapingJob(createScrapingJobDto);
  }
}


