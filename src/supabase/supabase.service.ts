import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase URL or Key is not defined in environment variables');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      this.logger.log('Supabase client initialized');
    }
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client is not properly initialized. Check your environment variables.');
    }
    return this.supabase;
  }
}
