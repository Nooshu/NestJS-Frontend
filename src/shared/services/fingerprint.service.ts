/**
 * Fingerprinting service for static assets.
 * 
 * This service implements content-based fingerprinting for static assets (CSS, JS, images)
 * without relying on bundler tools like Webpack. The fingerprinting process involves:
 * 
 * 1. Generating an MD5 hash of each file's content
 * 2. Appending the hash to the filename before the extension (e.g., main.a1b2c3d4.css)
 * 3. Creating a manifest file that maps original filenames to fingerprinted versions
 * 4. Providing a lookup function to resolve original paths to fingerprinted paths at runtime
 * 
 * Fingerprinting enables efficient browser caching while ensuring users always get
 * the latest version when content changes. When a file changes, its hash changes,
 * resulting in a new URL that bypasses the browser cache.
 * 
 * Special cases:
 * - Font files (*.woff, *.woff2) are excluded from fingerprinting as they already include hashes
 * - CSS source maps are processed to maintain the link between CSS and map files
 */

import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { join, dirname, basename, extname, relative } from 'path';
import * as glob from 'glob';

/**
 * Interface for the asset manifest that maps original paths to fingerprinted paths
 */
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
    // Configure paths for asset processing
    this.publicDir = join(process.cwd(), 'dist', 'public');
    this.assetsDir = join(process.cwd(), 'src', 'frontend');
    this.govukDir = join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk');
    this.manifestPath = join(this.publicDir, 'asset-manifest.json');
  }

  /**
   * Generate a content hash for a file
   * Creates an MD5 hash of the file's content and returns a shortened version (8 characters)
   * 
   * @param filePath Path to the file
   * @returns Shortened MD5 hash of the file content (8 characters)
   */
  private generateHash(filePath: string): string {
    const fileContent = readFileSync(filePath);
    return createHash('md5').update(fileContent).digest('hex').substring(0, 8);
  }

  /**
   * Create a fingerprinted filename based on the file's content
   * Takes the original filename, generates a hash, and inserts it before the extension
   * 
   * @param filePath Path to the file
   * @returns Object containing original and fingerprinted filenames
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
   * Reads the file, creates a fingerprinted copy, and updates the manifest
   * 
   * @param filePath Path to the file to process
   * @returns The path to the fingerprinted file
   */
  private processFile(filePath: string): string {
    try {
      // Determine output directory in dist/public that matches the source structure
      const outputDir = dirname(
        join(this.publicDir, relative(this.assetsDir, filePath))
      );
      
      // Make sure output directory exists
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate fingerprinted filename
      const { original: _, fingerprinted } = this.fingerprintFilename(filePath);
      const content = readFileSync(filePath);
      
      // Write the fingerprinted file
      const fingerprintedPath = join(outputDir, fingerprinted);
      writeFileSync(fingerprintedPath, content);
      
      // Update manifest with path mapping
      // Strip the section prefix (scss/js/images) for cleaner paths
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
   * Handles the fingerprinting of JS files from the GOV.UK Frontend package
   * 
   * @param filePath Path to the file to process
   */
  private processGovukFile(filePath: string): void {
    try {
      // Determine the relative path and create output directory
      const relPath = relative(this.govukDir, filePath);
      const outputDir = dirname(join(this.publicDir, 'govuk', relPath));
      
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate fingerprinted filename
      const { original: _, fingerprinted } = this.fingerprintFilename(filePath);
      const content = readFileSync(filePath);
      
      // Write the fingerprinted file
      const fingerprintedPath = join(outputDir, fingerprinted);
      writeFileSync(fingerprintedPath, content);
      
      // Update manifest with path mapping
      this.manifest[`govuk/${relPath}`] = `govuk/${dirname(relPath)}/${fingerprinted}`;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process GOV.UK file ${filePath}: ${errorMessage}`);
    }
  }

  /**
   * Process GOV.UK Frontend CSS assets ensuring source maps are properly linked
   * Special handling for CSS files to maintain source map references
   * 
   * @param filePath Path to the CSS file
   */
  private processGovukCssFile(filePath: string): void {
    try {
      // Create destination directory in our public directory
      const relPath = relative(this.govukDir, filePath);
      const outputDir = dirname(join(this.publicDir, 'govuk', relPath));
      
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      // Get fingerprinted filename
      const { original, fingerprinted } = this.fingerprintFilename(filePath);
      let content = readFileSync(filePath, 'utf8');
      
      // Check for source map reference and handle it specially
      const sourceMapFile = `${filePath}.map`;
      if (existsSync(sourceMapFile)) {
        // Get fingerprinted name for the source map
        const { fingerprinted: fingerprintedMap } = this.fingerprintFilename(sourceMapFile);
        
        // Update source map reference in CSS to point to the fingerprinted map file
        content = content.replace(/\/\*# sourceMappingURL=.*? \*\//, `/*# sourceMappingURL=${fingerprintedMap} */`);
        
        // Copy and fingerprint the source map file
        const mapContent = readFileSync(sourceMapFile);
        const mapOutputPath = join(outputDir, fingerprintedMap);
        writeFileSync(mapOutputPath, mapContent);
        
        // Add source map to manifest
        this.manifest[`govuk/${original}.map`] = `govuk/${fingerprintedMap}`;
      }
      
      // Write the fingerprinted CSS file
      const fingerprintedPath = join(outputDir, fingerprinted);
      writeFileSync(fingerprintedPath, content);
      
      // Update manifest
      this.manifest[`govuk/${original}`] = `govuk/${fingerprinted}`;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process GOV.UK CSS file ${filePath}: ${errorMessage}`);
    }
  }

  /**
   * Process GOV.UK assets (fonts, images, etc.)
   * Special handling for font files which are already fingerprinted
   * 
   * @param file Path to the file to process
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
      
      // For other assets, apply normal fingerprinting
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
   * This is the main method called by the CLI script to process all assets
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
    
    // Process GOV.UK Frontend CSS files (with special handling for source maps)
    const govukCssFiles = glob.sync(join(this.govukDir, '*.css'));
    govukCssFiles.forEach(file => this.processGovukCssFile(file));
    
    // Process GOV.UK Frontend JS files
    const govukJsFiles = glob.sync(join(this.govukDir, '*.js'));
    govukJsFiles.forEach(file => this.processGovukFile(file));
    
    // Process GOV.UK assets (fonts, images, etc.)
    const govukAssetFiles = glob.sync(join(this.govukDir, 'assets', '**', '*.*'));
    govukAssetFiles.forEach(file => this.processGovukAssetFile(file));
    
    // Save manifest
    if (!existsSync(dirname(this.manifestPath))) {
      mkdirSync(dirname(this.manifestPath), { recursive: true });
    }
    
    // Write the manifest file as formatted JSON for readability
    writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2));
    this.logger.log(`Asset manifest created at ${this.manifestPath}`);
  }

  /**
   * Get the fingerprinted path for an asset
   * This method is used at runtime to resolve asset paths in templates
   * 
   * @param assetPath Original asset path
   * @returns Fingerprinted asset path if it exists, otherwise the original path
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