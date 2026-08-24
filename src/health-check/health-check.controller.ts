import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthCheckService } from './health-check.service';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @ApiOkResponse({
    description: 'Health check successful',
    type: Object,
    example: { status: 'ok' },
  })
  async healthCheck(): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  @Get('mongo')
  @ApiOkResponse({
    description: 'MongoDB health check successful',
    type: Object,
    example: { status: 'ok' },
  })
  @ApiServiceUnavailableResponse({
    description: 'MongoDB health check failed',
    type: Object,
    example: { status: 'error' },
  })
  async mongoHealthCheck(): Promise<{ status: string }> {
    const result = await this.healthCheckService.checkMongoHealth();

    if (result.status === 'error') {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result;
  }
}
