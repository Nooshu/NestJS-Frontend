import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateFingerprintMap } from '../utils/file-fingerprint.util';

@Injectable()
export class AssetFingerprintService {
  private fingerprintMap: Map<string, string> = new Map();
  private readonly staticDir: string;
  private readonly filePatterns: string[];

  constructor(private configService: ConfigService) {
    this.staticDir = this.configService.get<string>('static.dir') || 'public';
    this.filePatterns = ['*.css', '*.js'];
    this.initializeFingerprintMap();
  }

  private initializeFingerprintMap(): void {
    this.fingerprintMap = generateFingerprintMap(this.staticDir, this.filePatterns);
  }

  /**
   * Gets the hashed version of a static asset path
   * @param originalPath - Original path to the static asset
   * @returns Hashed path if found, original path if not found
   */
  getHashedPath(originalPath: string): string {
    return this.fingerprintMap.get(originalPath) || originalPath;
  }

  /**
   * Regenerates the fingerprint map
   * Useful after deploying new static assets
   */
  regenerateFingerprintMap(): void {
    this.initializeFingerprintMap();
  }
} 