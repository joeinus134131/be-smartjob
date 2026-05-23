import { Module } from '@nestjs/common';
import { MatchmakerController } from './matchmaker.controller';
import { MatchmakerService } from './matchmaker.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MatchmakerController],
  providers: [MatchmakerService]
})
export class MatchmakerModule {}
