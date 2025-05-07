/**
 * Fingerprinting service for static assets.
 * 
 * This service generates content-based hashes for static assets like CSS, JS, and images,
 * creating a manifest file that maps original filenames to their fingerprinted versions.
 * This enables proper cache busting without using bundlers like Webpack.
 */

import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { join, dirname, basename, extname, relative } from 'path';
import * as glob from 'glob';

interface AssetManifest {
  [key: string]: string;
}

@Injectable()
export class FingerprintService {
  private readonly logger = new Logger(FingerprintService.name);
  private manifest: AssetManifest = {};
  private manifestPath: string;
  private publicDir: string;
  private assetsDir: string;
  private govukDir: string;

  constructor() {
    this.publicDir = join(process.cwd(), 'dist', 'public');
    this.assetsDir = join(process.cwd(), 'src', 'frontend');
    this.govukDir = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk');
    this.manifestPath = join(this.publicDir, 'asset-manifest.json');
  }

  /**
   * Generate a content hash for a file
   * @param filePath Path to the file
   * @returns Hash string
   */
  private generateHash(filePath: string): string {
    const fileContent = readFileSync(filePath);
    return createHash('md5').update(fileContent).digest('hex').substring(0, 8);
  }

  /**
   * Create a fingerprinted filename based on the file's content
   * @param filePath Path to the file
   * @returns Fingerprinted filename
   */
  private fingerprintFilename(filePath: string): { original: string; fingerprinted: string } {
    const hash = this.generateHash(filePath);
    const ext = extname(filePath);
    const fileBasename = basename(filePath, ext);
    const fingerprinted = `${fileBasename}.${hash}${ext}`;
    
    return {
      original: basename(filePath),
      fingerprinted,
    };
  }

  /**
   * Process a file by creating a fingerprinted copy
   * @param filePath Path to the file
   * @returns The fingerprinted file path
   */
  private processFile(filePath: string): string {
    try {
      const outputDir = dirname(
        join(this.publicDir, relative(this.assetsDir, filePath))
      );
      
      // Make sure output directory exists
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      const { original: _, fingerprinted } = this.fingerprintFilename(filePath);
      const content = readFileSync(filePath);
      
      // Write the fingerprinted file
      const fingerprintedPath = join(outputDir, fingerprinted);
      writeFileSync(fingerprintedPath, content);
      
      // Update manifest
      const assetPath = relative(this.assetsDir, filePath);
      const publicPath = assetPath.replace(/^(scss|js|images)\//, '');
      this.manifest[publicPath] = fingerprinted;
      
      return fingerprintedPath;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process file ${filePath}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Process GOV.UK Frontend assets
   * @param filePath Path to the file
   */
  private processGovukFile(filePath: string): void {
    try {
      // Create destination directory in our public directory
      const relPath = relative(this.govukDir, filePath);
      const outputDir = dirname(join(this.publicDir, 'govuk', relPath));
      
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      const { original: _, fingerprinted } = this.fingerprintFilename(filePath);
      const content = readFileSync(filePath);
      
      // Write the fingerprinted file
      const fingerprintedPath = join(outputDir, fingerprinted);
      writeFileSync(fingerprintedPath, content);
      
      // Update manifest with path relative to the govuk directory
      this.manifest[`govuk/${relPath}`] = `govuk/${dirname(relPath)}/${fingerprinted}`;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process GOV.UK file ${filePath}: ${errorMessage}`);
    }
  }

  /**
   * Process GOV.UK assets (fonts, images, etc.)
   * @param file Path to the file
   */
  private processGovukAssetFile(file: string): void {
    try {
      // Skip woff and woff2 files as they are already fingerprinted
      if (file.endsWith('.woff') || file.endsWith('.woff2')) {
        // Just copy these files without fingerprinting
        const relPath = relative(join(this.govukDir, 'assets'), file);
        const outputPath = join(this.publicDir, 'assets', relPath);
        const outputDir = dirname(outputPath);
        
        if (!existsSync(outputDir)) {
          mkdirSync(outputDir, { recursive: true });
        }
        
        const content = readFileSync(file);
        writeFileSync(outputPath, content);
        
        return;
      }
      
      // Create destination directory in our public directory
      const relPath = relative(join(this.govukDir, 'assets'), file);
      const outputDir = dirname(join(this.publicDir, 'assets', relPath));
      
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      const { original: _, fingerprinted } = this.fingerprintFilename(file);
      const content = readFileSync(file);
      
      // Write the fingerprinted file
      const fingerprintedPath = join(outputDir, fingerprinted);
      writeFileSync(fingerprintedPath, content);
      
      // Update manifest with path relative to the assets directory
      this.manifest[`assets/${relPath}`] = `assets/${dirname(relPath)}/${fingerprinted}`;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process GOV.UK asset file ${file}: ${errorMessage}`);
    }
  }

  /**
   * Fingerprint all static assets and generate a manifest
   */
  public fingerprint(): void {
    this.logger.log('Starting asset fingerprinting');
    this.manifest = {};
    
    // Process CSS files (compiled from SCSS)
    const cssFiles = glob.sync(join(this.publicDir, 'css', '*.css'));
    cssFiles.forEach(file => {
      const { original, fingerprinted } = this.fingerprintFilename(file);
      const content = readFileSync(file);
      
      // Write the fingerprinted file
      const fingerprintedPath = join(dirname(file), fingerprinted);
      writeFileSync(fingerprintedPath, content);
      
      // Update manifest
      this.manifest[`css/${original}`] = `css/${fingerprinted}`;
    });
    
    // Process JS files
    const jsFiles = glob.sync(join(this.assetsDir, 'js', '**', '*.js'));
    jsFiles.forEach(file => this.processFile(file));
    
    // Process images
    const imageFiles = glob.sync(join(this.assetsDir, 'images', '**', '*.*'));
    imageFiles.forEach(file => this.processFile(file));
    
    // Process GOV.UK Frontend assets
    const govukCssFiles = glob.sync(join(this.govukDir, '*.css'));
    govukCssFiles.forEach(file => this.processGovukFile(file));
    
    const govukJsFiles = glob.sync(join(this.govukDir, '*.js'));
    govukJsFiles.forEach(file => this.processGovukFile(file));
    
    // Process GOV.UK assets (fonts, images, etc.)
    const govukAssetFiles = glob.sync(join(this.govukDir, 'assets', '**', '*.*'));
    govukAssetFiles.forEach(file => this.processGovukAssetFile(file));
    
    // Save manifest
    if (!existsSync(dirname(this.manifestPath))) {
      mkdirSync(dirname(this.manifestPath), { recursive: true });
    }
    
    writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2));
    this.logger.log(`Asset manifest created at ${this.manifestPath}`);
  }

  /**
   * Get the fingerprinted path for an asset
   * @param assetPath Original asset path
   * @returns Fingerprinted asset path
   */
  public getAssetPath(assetPath: string): string {
    // Make sure the manifest exists
    if (!existsSync(this.manifestPath)) {
      this.logger.warn('Asset manifest not found, returning original path');
      return assetPath;
    }
    
    // Load manifest if not already loaded
    if (Object.keys(this.manifest).length === 0) {
      try {
        this.manifest = JSON.parse(readFileSync(this.manifestPath, 'utf8'));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to load asset manifest: ${errorMessage}`);
        return assetPath;
      }
    }
    
    // Normalize the path (remove leading slash)
    const normalizedPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
    
    // Return fingerprinted path if it exists, otherwise return original
    return this.manifest[normalizedPath] ? 
      `/${this.manifest[normalizedPath]}` : 
      assetPath;
  }
} 