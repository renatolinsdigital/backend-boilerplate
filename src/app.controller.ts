import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('Health')
@Controller()
export class AppController {
  private readonly startTime: number;

  constructor(private readonly prisma: PrismaService) {
    this.startTime = Date.now();
  }

  @Get()
  @ApiOperation({ summary: 'API health check' })
  @ApiResponse({
    status: 200,
    description: 'Returns API health status, uptime, and database connectivity',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: { type: 'string', example: 'BackEnd Boilerplate API is running' },
        timestamp: { type: 'string', example: '2026-02-15T12:00:00.000Z' },
        uptime: { type: 'string', example: '2d 5h 30m 15s' },
        version: { type: 'string', example: '0.0.1' },
        environment: { type: 'string', example: 'development' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'connected' },
          },
        },
      },
    },
  })
  async getHealthStatus() {
    const uptime = this.getUptime();
    let databaseStatus = 'disconnected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (_error) {
      databaseStatus = 'error';
    }

    return {
      status: 'ok',
      message: 'BackEnd Boilerplate API is running',
      timestamp: new Date().toISOString(),
      uptime,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: databaseStatus,
      },
    };
  }

  private getUptime(): string {
    const uptimeMs = Date.now() - this.startTime;
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
