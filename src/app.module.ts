import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { ScraperModule } from './scraper/scraper.module';
import { ProfileModule } from './profile/profile.module';
import { MatchmakerModule } from './matchmaker/matchmaker.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule, 
    ScraperModule, 
    ProfileModule, 
    MatchmakerModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
