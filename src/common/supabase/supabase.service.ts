import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private adminClient: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /** Full-access client (bypass RLS) — for backend operations */
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  /** Verify a Supabase JWT token and return the user */
  async verifyToken(token: string) {
    const {
      data: { user },
      error,
    } = await this.adminClient.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  }
}
