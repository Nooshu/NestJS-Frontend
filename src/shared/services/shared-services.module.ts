/**
 * Shared services module providing common services across the application.
 */

import { Module } from '@nestjs/common';
import { FingerprintService } from './fingerprint.service';

@Module({
  providers: [FingerprintService],
  exports: [FingerprintService],
})
export class SharedServicesModule {}
