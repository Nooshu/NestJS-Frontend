/**
 * Asset path Nunjucks extension.
 *
 * This extension provides a function to resolve fingerprinted asset paths in Nunjucks templates.
 */
import { Injectable } from '@nestjs/common';
import { FingerprintService } from '../../shared/services/fingerprint.service';

@Injectable()
export class AssetPathExtension {
  constructor(private readonly fingerprintService: FingerprintService) {}

  /**
   * Get the extension name
   */
  getName(): string {
    return 'assetPath';
  }

  /**
   * Resolve an asset path to its fingerprinted version
   * @param assetPath Original asset path
   */
  getExtension(): (assetPath: string) => string {
    return (assetPath: string): string => {
      return this.fingerprintService.getAssetPath(assetPath);
    };
  }
}
