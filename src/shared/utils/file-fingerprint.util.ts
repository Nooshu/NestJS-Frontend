import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Generates a hash of a file's contents
 * @param filePath - Path to the file
 * @returns The first 8 characters of the file's hash
 */
export function generateFileHash(filePath: string): string {
  const fileBuffer = readFileSync(filePath);
  const hashSum = createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex').slice(0, 8);
}

/**
 * Adds a hash to a filename
 * @param filePath - Original file path
 * @returns New file path with hash inserted before the extension
 */
export function addHashToFilename(filePath: string): string {
  const hash = generateFileHash(filePath);
  const ext = filePath.split('.').pop();
  const baseName = filePath.slice(0, -(ext!.length + 1));
  return `${baseName}.${hash}.${ext}`;
}

/**
 * Maps original filenames to their hashed versions
 * @param staticDir - Directory containing static assets
 * @param filePatterns - Array of file patterns to process (e.g., ['*.css', '*.js'])
 * @returns Map of original filenames to hashed filenames
 */
export function generateFingerprintMap(staticDir: string, filePatterns: string[]): Map<string, string> {
  const fingerprintMap = new Map<string, string>();
  const glob = require('glob');
  
  filePatterns.forEach(pattern => {
    const files = glob.sync(join(staticDir, pattern));
    files.forEach((file: string) => {
      const hashedPath = addHashToFilename(file);
      const relativePath = file.replace(staticDir, '');
      const relativeHashedPath = hashedPath.replace(staticDir, '');
      fingerprintMap.set(relativePath, relativeHashedPath);
    });
  });
  
  return fingerprintMap;
} 