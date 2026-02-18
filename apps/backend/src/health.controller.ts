import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  status(): { success: boolean; status: string; timestamp: string } {
    return {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
