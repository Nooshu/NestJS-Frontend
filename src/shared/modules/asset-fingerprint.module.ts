import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetFingerprintService } from '../services/asset-fingerprint.service';

@Module({
  imports: [ConfigModule],
  providers: [AssetFingerprintService],
  exports: [AssetFingerprintService],
})
export class AssetFingerprintModule {} 