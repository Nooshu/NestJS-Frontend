import { join } from 'path';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import {
  generateFileHash,
  addHashToFilename,
  generateFingerprintMap,
} from './file-fingerprint.util';

describe('FileFingerprintUtil', () => {
  const testDir = join(__dirname, 'test-files');
  const testFile = join(testDir, 'test.txt');
  const testContent = 'Hello, World!';

  beforeAll(() => {
    // Create test directory and file
    mkdirSync(testDir, { recursive: true });
    writeFileSync(testFile, testContent);
  });

  afterAll(() => {
    // Clean up test files
    unlinkSync(testFile);
    rmdirSync(testDir);
  });

  describe('generateFileHash', () => {
    it('should generate a consistent hash for the same file content', () => {
      const hash1 = generateFileHash(testFile);
      const hash2 = generateFileHash(testFile);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(8); // Should return first 8 characters
    });

    it('should generate different hashes for different content', () => {
      const differentFile = join(testDir, 'different.txt');
      writeFileSync(differentFile, 'Different content');

      const hash1 = generateFileHash(testFile);
      const hash2 = generateFileHash(differentFile);

      expect(hash1).not.toBe(hash2);

      unlinkSync(differentFile);
    });

    it('should throw an error for non-existent file', () => {
      expect(() => generateFileHash('non-existent-file.txt')).toThrow();
    });
  });

  describe('addHashToFilename', () => {
    let testFileWithoutExt: string;
    let testFileWithExt: string;

    beforeEach(() => {
      // Create test files
      testFileWithoutExt = join(testDir, 'testfile');
      testFileWithExt = join(testDir, 'testfile.css');
      writeFileSync(testFileWithoutExt, 'Content for file without extension');
      writeFileSync(testFileWithExt, 'Content for CSS file');
    });

    afterEach(() => {
      // Clean up test files
      unlinkSync(testFileWithoutExt);
      unlinkSync(testFileWithExt);
    });

    it('should add hash to filename while preserving extension', () => {
      const hashedPath = addHashToFilename(testFileWithExt);

      // Extract just the filename part for testing
      const filename = hashedPath.split('/').pop();
      expect(filename).toMatch(/^testfile\.[a-f0-9]{8}\.css$/);
      expect(hashedPath).not.toBe(testFileWithExt);
    });

    it('should handle filenames without extension', () => {
      const hashedPath = addHashToFilename(testFileWithoutExt);

      // Extract just the filename part for testing
      const filename = hashedPath.split('/').pop();
      expect(filename).toMatch(/^testfile\.[a-f0-9]{8}$/);
      expect(hashedPath).not.toBe(testFileWithoutExt);
    });

    it('should throw an error for non-existent file', () => {
      expect(() => addHashToFilename('non-existent-file.txt')).toThrow();
    });
  });

  describe('generateFingerprintMap', () => {
    beforeEach(() => {
      // Create test files with different extensions
      writeFileSync(join(testDir, 'test1.css'), 'CSS content');
      writeFileSync(join(testDir, 'test2.js'), 'JS content');
      writeFileSync(join(testDir, 'test3.txt'), 'Text content');
    });

    afterEach(() => {
      // Clean up test files
      unlinkSync(join(testDir, 'test1.css'));
      unlinkSync(join(testDir, 'test2.js'));
      unlinkSync(join(testDir, 'test3.txt'));
    });

    it('should generate a map of original to hashed filenames', () => {
      const map = generateFingerprintMap(testDir, ['*.css', '*.js']);

      expect(map.size).toBe(2); // Only CSS and JS files
      expect(map.has('/test1.css')).toBe(true);
      expect(map.has('/test2.js')).toBe(true);
      expect(map.has('/test3.txt')).toBe(false); // Should not include .txt files

      // Check that the mapped values contain hashes
      map.forEach((hashedPath, originalPath) => {
        expect(hashedPath).toMatch(/\/test[12]\.[a-f0-9]{8}\.(css|js)$/);
        expect(hashedPath).not.toBe(originalPath);
      });
    });

    it('should handle empty file patterns', () => {
      const map = generateFingerprintMap(testDir, []);
      expect(map.size).toBe(0);
    });

    it('should handle non-existent directory', () => {
      const map = generateFingerprintMap('non-existent-dir', ['*.css']);
      expect(map.size).toBe(0);
    });

    it('should handle patterns with no matches', () => {
      const map = generateFingerprintMap(testDir, ['*.xyz']);
      expect(map.size).toBe(0);
    });
  });
});
