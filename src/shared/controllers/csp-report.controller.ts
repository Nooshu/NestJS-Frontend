import { Body, Controller, Post } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

@Controller('api')
export class CspReportController {
  constructor(private readonly loggerService: LoggerService) {}

  @Post('csp-report')
  async handleCspViolation(@Body() report: any) {
    this.loggerService.warn('CSP Violation Report', {
      'csp-report': report,
      timestamp: new Date().toISOString(),
    });

    // You could also store the violation in a database or send it to a monitoring service
    // await this.cspViolationService.storeViolation(report);

    return { status: 'received' };
  }
}
