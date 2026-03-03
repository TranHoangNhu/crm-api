import { Controller, Get, Logger } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { SupabaseService } from './common/supabase/supabase.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  @Public()
  @Get()
  async check() {
    let dbStatus = 'ok';
    let dbLatency = 0;

    try {
      const start = Date.now();
      // Truy vấn siêu nhẹ, chỉ lấy ra ID 1 record để đánh thức Supabase (tránh ngủ đông xoá tài nguyên CPU tắt trên gói Free)
      const { error } = await this.supabaseService
        .getAdminClient()
        .from('modules') // Bất cứ table nào nhẹ nhàng cũng được
        .select('id')
        .limit(1);

      if (error) {
        dbStatus = 'error';
        this.logger.error('Supabase ping failed: ' + error.message);
      }
      dbLatency = Date.now() - start;
    } catch (err: any) {
      dbStatus = 'error';
      this.logger.error('Supabase ping crashed: ' + err.message);
    }

    const fs = require('fs');
    let files = [];
    try {
      files = fs.readdirSync(process.cwd());
    } catch (e) {}

    return {
      status: 'ok',
      supabase: dbStatus,
      latency: `${dbLatency}ms`,
      timestamp: new Date().toISOString(),
      service: 'crm-api',
      cwd: process.cwd(),
      dirname: __dirname,
      files,
    };
  }
}
