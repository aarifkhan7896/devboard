import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HealthCheckService } from './health-check.service';
import { HealthStatus } from '../common/health-status.enum';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @ApiOkResponse({
    description: 'Health check successful',
    type: Object,
    example: { status: HealthStatus.OK },
  })
  async healthCheck(): Promise<{ status: string }> {
    return { status: HealthStatus.OK };
  }

  @Get('mongo')
  @ApiOkResponse({
    description: 'MongoDB health check successful',
    type: Object,
    example: { status: HealthStatus.OK },
  })
  @ApiServiceUnavailableResponse({
    description: 'MongoDB health check failed',
    type: Object,
    example: { status: HealthStatus.ERROR },
  })
  async mongoHealthCheck(): Promise<{ status: string }> {
    const result = await this.healthCheckService.checkMongoHealth();

    if (result.status === HealthStatus.ERROR) {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result;
  }
}
