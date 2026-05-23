import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export enum Platform {
  REMOTIVE = 'remotive',
  ARBEITNOW = 'arbeitnow',
  HIMALAYAS = 'himalayas',
}

export class CreateScrapingJobDto {
  @ApiProperty({
    description: 'Platform yang ingin ditarik (Free APIs)',
    enum: Platform,
    isArray: true,
    example: ['remotive', 'arbeitnow'],
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
