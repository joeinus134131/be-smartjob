import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('cv/upload')
  @ApiOperation({ summary: 'Upload dan Parse CV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cvFile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'CV berhasil diproses.' })
  @UseInterceptors(FileInterceptor('cvFile'))
  async uploadCv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    // Note: Assuming a hardcoded user ID for testing. In production, get from req.user
    const userId = '11111111-1111-1111-1111-111111111111'; 
    return this.profileService.processAndSaveCv(file, userId);
  }
}

