import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { MatchmakerService } from './matchmaker.service';

@ApiTags('Matchmaker')
@Controller('recommendations')
export class MatchmakerController {
  constructor(private readonly matchmakerService: MatchmakerService) {}

  @Get()
  @ApiOperation({ summary: 'Dapatkan rekomendasi pekerjaan' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'minSimilarityScore', required: false, type: Number, example: 0.75 })
  @ApiResponse({ status: 200, description: 'Daftar rekomendasi pekerjaan yang presisi.' })
  async getRecommendations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('minSimilarityScore') minSimilarityScore: number = 0.75
  ) {
    // Note: Assuming a hardcoded user ID for testing. In production, get from req.user
    const userId = '11111111-1111-1111-1111-111111111111'; 
    return this.matchmakerService.getRecommendations(userId, Number(page), Number(limit), Number(minSimilarityScore));
  }
}

