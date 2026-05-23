import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { ScraperModule } from './scraper/scraper.module';
import { ProfileModule } from './profile/profile.module';
import { MatchmakerModule } from './matchmaker/matchmaker.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    SupabaseModule, 
    ScraperModule, 
    ProfileModule, 
    MatchmakerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
