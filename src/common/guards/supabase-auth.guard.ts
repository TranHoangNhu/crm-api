import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../supabase/supabase.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip auth for routes decorated with @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Method 1: API Key authentication (for next-auth apps)
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('API_SECRET_KEY');
    if (apiKey && validApiKey && apiKey === validApiKey) {
      request.user = { id: 'api-key-user', role: 'admin' };
      return true;
    }

    // Method 2: Bearer JWT authentication (Supabase Auth)
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const user = await this.supabaseService.verifyToken(token);
      if (user) {
        request.user = user;
        return true;
      }
    }

    throw new UnauthorizedException('Missing or invalid Authorization header');
  }
}
