import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export enum Platform {
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  GLASSDOOR = 'glassdoor',
  JOBSTREET = 'jobstreet',
}

export class CreateScrapingJobDto {
  @ApiProperty({
    description: 'Platform yang ingin di-crawl',
    enum: Platform,
    isArray: true,
    example: ['linkedin', 'indeed'],
  })
  @IsArray()
  @IsEnum(Platform, { each: true })
  platforms: Platform[];

  @ApiProperty({
    description: 'Kata kunci pekerjaan',
    isArray: true,
    example: ['Backend Engineer', 'NestJS'],
  })
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @ApiProperty({
    description: 'Lokasi spesifik untuk mencari pekerjaan',
    required: false,
    example: 'Jakarta, Indonesia',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
