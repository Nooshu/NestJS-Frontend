import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { FingerprintService } from './fingerprint.service';
import { join } from 'path';

// Mock the logger
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('FingerprintService', () => {
  let service: FingerprintService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FingerprintService],
    }).compile();

    service = module.get<FingerprintService>(FingerprintService);
    
    // Replace the service's logger with our mock
    (service as any).logger = mockLogger;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct paths', () => {
      expect((service as any).publicDir).toBe(join(process.cwd(), 'dist', 'public'));
      expect((service as any).assetsDir).toBe(join(process.cwd(), 'src', 'frontend'));
      expect((service as any).govukDir).toBe(join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk'));
      expect((service as any).manifestPath).toBe(join(process.cwd(), 'dist', 'public', 'asset-manifest.json'));
    });
  });

  describe('getAssetPath', () => {
    const manifestPath = '/dist/public/asset-manifest.json';

    beforeEach(() => {
      (service as any).manifestPath = manifestPath;
    });

    it('should return original path if manifest does not exist', () => {
      // Mock existsSync to return false
      const originalExistsSync = require('fs').existsSync;
      require('fs').existsSync = jest.fn().mockReturnValue(false);

      const result = service.getAssetPath('/css/app.css');

      expect(result).toBe('/css/app.css');
      expect(mockLogger.warn).toHaveBeenCalledWith('Asset manifest not found, returning original path');

      // Restore original function
      require('fs').existsSync = originalExistsSync;
    });

    it('should load manifest if not already loaded', () => {
      const manifest = { 'css/app.css': 'css/app.12345678.css' };
      
      // Mock fs functions
      const originalExistsSync = require('fs').existsSync;
      const originalReadFileSync = require('fs').readFileSync;
      
      require('fs').existsSync = jest.fn().mockReturnValue(true);
      require('fs').readFileSync = jest.fn().mockReturnValue(JSON.stringify(manifest));

      const result = service.getAssetPath('/css/app.css');

      expect(result).toBe('/css/app.12345678.css');

      // Restore original functions
      require('fs').existsSync = originalExistsSync;
      require('fs').readFileSync = originalReadFileSync;
    });

    it('should use cached manifest if already loaded', () => {
      const manifest = { 'css/app.css': 'css/app.12345678.css' };
      (service as any).manifest = manifest;
      
      // Mock existsSync to return true
      const originalExistsSync = require('fs').existsSync;
      require('fs').existsSync = jest.fn().mockReturnValue(true);

      const result = service.getAssetPath('/css/app.css');

      expect(result).toBe('/css/app.12345678.css');

      // Restore original function
      require('fs').existsSync = originalExistsSync;
    });

    it('should handle manifest loading errors', () => {
      // Mock fs functions
      const originalExistsSync = require('fs').existsSync;
      const originalReadFileSync = require('fs').readFileSync;
      
      require('fs').existsSync = jest.fn().mockReturnValue(true);
      require('fs').readFileSync = jest.fn().mockImplementation(() => {
        throw new Error('Manifest read error');
      });

      const result = service.getAssetPath('/css/app.css');

      expect(result).toBe('/css/app.css');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to load asset manifest: Manifest read error');

      // Restore original functions
      require('fs').existsSync = originalExistsSync;
      require('fs').readFileSync = originalReadFileSync;
    });

    it('should normalize paths by removing leading slash', () => {
      const manifest = { 'css/app.css': 'css/app.12345678.css' };
      (service as any).manifest = manifest;
      
      // Mock existsSync to return true
      const originalExistsSync = require('fs').existsSync;
      require('fs').existsSync = jest.fn().mockReturnValue(true);

      const result = service.getAssetPath('css/app.css');

      expect(result).toBe('/css/app.12345678.css');

      // Restore original function
      require('fs').existsSync = originalExistsSync;
    });

    it('should return original path if not found in manifest', () => {
      const manifest = { 'css/other.css': 'css/other.12345678.css' };
      (service as any).manifest = manifest;
      
      // Mock existsSync to return true
      const originalExistsSync = require('fs').existsSync;
      require('fs').existsSync = jest.fn().mockReturnValue(true);

      const result = service.getAssetPath('/css/app.css');

      expect(result).toBe('/css/app.css');

      // Restore original function
      require('fs').existsSync = originalExistsSync;
    });

    it('should handle non-Error exceptions when loading manifest', () => {
      // Mock fs functions
      const originalExistsSync = require('fs').existsSync;
      const originalReadFileSync = require('fs').readFileSync;
      
      require('fs').existsSync = jest.fn().mockReturnValue(true);
      require('fs').readFileSync = jest.fn().mockImplementation(() => {
        throw 'String error';
      });

      const result = service.getAssetPath('/css/app.css');

      expect(result).toBe('/css/app.css');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to load asset manifest: String error');

      // Restore original functions
      require('fs').existsSync = originalExistsSync;
      require('fs').readFileSync = originalReadFileSync;
    });
  });

  describe('fingerprint method', () => {
    it('should reset manifest at start', () => {
      (service as any).manifest = { 'existing': 'path' };

      // Mock the glob.sync calls to return empty arrays to avoid file system operations
      const originalGlobSync = require('glob').sync;
      require('glob').sync = jest.fn().mockReturnValue([]);

      service.fingerprint();

      expect((service as any).manifest).toEqual({});

      // Restore original function
      require('glob').sync = originalGlobSync;
    });

    it('should log start message', () => {
      // Mock the glob.sync calls to return empty arrays to avoid file system operations
      const originalGlobSync = require('glob').sync;
      require('glob').sync = jest.fn().mockReturnValue([]);

      service.fingerprint();

      expect(mockLogger.log).toHaveBeenCalledWith('Starting asset fingerprinting');

      // Restore original function
      require('glob').sync = originalGlobSync;
    });
  });

  describe('private methods', () => {
    it('should generate consistent hash for same content', () => {
      const filePath = '/test/file.css';
      const content = Buffer.from('test content');
      
      // Mock readFileSync
      const originalReadFileSync = require('fs').readFileSync;
      require('fs').readFileSync = jest.fn().mockReturnValue(content);

      const hash1 = (service as any).generateHash(filePath);
      const hash2 = (service as any).generateHash(filePath);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(8);

      // Restore original function
      require('fs').readFileSync = originalReadFileSync;
    });

    it('should create fingerprinted filename with hash', () => {
      const filePath = '/test/styles.css';
      const content = Buffer.from('css content');
      
      // Mock readFileSync
      const originalReadFileSync = require('fs').readFileSync;
      require('fs').readFileSync = jest.fn().mockReturnValue(content);

      const result = (service as any).fingerprintFilename(filePath);

      expect(result.original).toBe('styles.css');
      expect(result.fingerprinted).toMatch(/^styles\.[a-f0-9]{8}\.css$/);
      expect(result.fingerprinted).not.toBe(result.original);

      // Restore original function
      require('fs').readFileSync = originalReadFileSync;
    });

    it('should handle files without extension', () => {
      const filePath = '/test/script';
      const content = Buffer.from('js content');
      
      // Mock readFileSync
      const originalReadFileSync = require('fs').readFileSync;
      require('fs').readFileSync = jest.fn().mockReturnValue(content);

      const result = (service as any).fingerprintFilename(filePath);

      expect(result.original).toBe('script');
      expect(result.fingerprinted).toMatch(/^script\.[a-f0-9]{8}$/);

      // Restore original function
      require('fs').readFileSync = originalReadFileSync;
    });

    it('should handle files with multiple dots', () => {
      const filePath = '/test/app.min.js';
      const content = Buffer.from('js content');
      
      // Mock readFileSync
      const originalReadFileSync = require('fs').readFileSync;
      require('fs').readFileSync = jest.fn().mockReturnValue(content);

      const result = (service as any).fingerprintFilename(filePath);

      expect(result.original).toBe('app.min.js');
      expect(result.fingerprinted).toMatch(/^app\.min\.[a-f0-9]{8}\.js$/);

      // Restore original function
      require('fs').readFileSync = originalReadFileSync;
    });
  });

  describe('error handling', () => {
    it('should handle errors in processFile method', () => {
      const filePath = '/src/frontend/js/app.js';
      const error = new Error('File read error');
      
      // Mock fs functions to throw error
      const originalReadFileSync = require('fs').readFileSync;
      const originalExistsSync = require('fs').existsSync;
      const originalMkdirSync = require('fs').mkdirSync;
      
      require('fs').readFileSync = jest.fn().mockImplementation(() => {
        throw error;
      });
      require('fs').existsSync = jest.fn().mockReturnValue(false);
      require('fs').mkdirSync = jest.fn();

      expect(() => (service as any).processFile(filePath)).toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(`Failed to process file ${filePath}: File read error`);

      // Restore original functions
      require('fs').readFileSync = originalReadFileSync;
      require('fs').existsSync = originalExistsSync;
      require('fs').mkdirSync = originalMkdirSync;
    });

    it('should handle errors in processGovukFile method', () => {
      const filePath = '/node_modules/govuk-frontend/dist/govuk/all.js';
      const error = new Error('GOV.UK file error');
      
      // Mock fs functions to throw error
      const originalReadFileSync = require('fs').readFileSync;
      const originalExistsSync = require('fs').existsSync;
      const originalMkdirSync = require('fs').mkdirSync;
      
      require('fs').readFileSync = jest.fn().mockImplementation(() => {
        throw error;
      });
      require('fs').existsSync = jest.fn().mockReturnValue(false);
      require('fs').mkdirSync = jest.fn();

      (service as any).processGovukFile(filePath);

      expect(mockLogger.error).toHaveBeenCalledWith(`Failed to process GOV.UK file ${filePath}: GOV.UK file error`);

      // Restore original functions
      require('fs').readFileSync = originalReadFileSync;
      require('fs').existsSync = originalExistsSync;
      require('fs').mkdirSync = originalMkdirSync;
    });

    it('should handle errors in processGovukCssFile method', () => {
      const filePath = '/node_modules/govuk-frontend/dist/govuk/all.css';
      const error = new Error('CSS processing error');
      
      // Mock fs functions to throw error
      const originalReadFileSync = require('fs').readFileSync;
      const originalExistsSync = require('fs').existsSync;
      const originalMkdirSync = require('fs').mkdirSync;
      
      require('fs').readFileSync = jest.fn().mockImplementation(() => {
        throw error;
      });
      require('fs').existsSync = jest.fn().mockReturnValue(false);
      require('fs').mkdirSync = jest.fn();

      (service as any).processGovukCssFile(filePath);

      expect(mockLogger.error).toHaveBeenCalledWith(`Failed to process GOV.UK CSS file ${filePath}: CSS processing error`);

      // Restore original functions
      require('fs').readFileSync = originalReadFileSync;
      require('fs').existsSync = originalExistsSync;
      require('fs').mkdirSync = originalMkdirSync;
    });

    it('should handle errors in processGovukAssetFile method', () => {
      const assetFile = '/node_modules/govuk-frontend/dist/govuk/assets/test.jpg';
      const error = new Error('Asset processing error');
      
      // Mock fs functions to throw error
      const originalReadFileSync = require('fs').readFileSync;
      const originalExistsSync = require('fs').existsSync;
      const originalMkdirSync = require('fs').mkdirSync;
      
      require('fs').readFileSync = jest.fn().mockImplementation(() => {
        throw error;
      });
      require('fs').existsSync = jest.fn().mockReturnValue(false);
      require('fs').mkdirSync = jest.fn();

      (service as any).processGovukAssetFile(assetFile);

      expect(mockLogger.error).toHaveBeenCalledWith(`Failed to process GOV.UK asset file ${assetFile}: Asset processing error`);

      // Restore original functions
      require('fs').readFileSync = originalReadFileSync;
      require('fs').existsSync = originalExistsSync;
      require('fs').mkdirSync = originalMkdirSync;
    });
  });
});
