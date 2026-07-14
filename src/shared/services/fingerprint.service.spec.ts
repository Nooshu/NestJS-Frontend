import { Test, TestingModule } from '@nestjs/testing';
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
      expect((service as any).govukDir).toBe(
        join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist', 'govuk')
      );
      expect((service as any).manifestPath).toBe(
        join(process.cwd(), 'dist', 'public', 'asset-manifest.json')
      );
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
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Asset manifest not found, returning original path'
      );

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
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to load asset manifest: Manifest read error'
      );

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
      (service as any).manifest = { existing: 'path' };

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

    it('should process css, js (including main.*), images, govuk, and create manifest dir', () => {
      const publicDir = (service as any).publicDir;
      const assetsDir = (service as any).assetsDir;
      const govukDir = (service as any).govukDir;

      const cssFile = join(publicDir, 'css', 'main.css');
      const jsMain = join(publicDir, 'js', 'main.abc123.js');
      const jsOther = join(publicDir, 'js', 'util.js');
      const imageFile = join(assetsDir, 'images', 'logo.png');
      const govukCss = join(govukDir, 'all.css');
      const govukJs = join(govukDir, 'all.js');
      const govukFont = join(govukDir, 'assets', 'fonts', 'font.woff2');
      const govukImg = join(govukDir, 'assets', 'images', 'crest.png');

      const originalGlobSync = require('glob').sync;
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      const originalMkdirSync = fs.mkdirSync;

      require('glob').sync = jest.fn((pattern: string) => {
        if (pattern.includes(`${join(publicDir, 'css')}`)) return [cssFile];
        if (pattern.includes(`${join(publicDir, 'js')}`)) return [jsMain, jsOther];
        if (pattern.includes(join(assetsDir, 'images'))) return [imageFile];
        if (pattern === join(govukDir, '*.css') || pattern.endsWith('*.css')) return [govukCss];
        if (pattern === join(govukDir, '*.js') || (pattern.endsWith('*.js') && pattern.includes('govuk')))
          return [govukJs];
        if (pattern.includes(join(govukDir, 'assets'))) return [govukFont, govukImg];
        return [];
      });

      fs.existsSync = jest.fn((p: string) => {
        // source map for govuk css
        if (String(p).endsWith('.css.map') || String(p).endsWith('all.css.map')) return true;
        // output dirs missing to exercise mkdir
        if (String(p).includes('dist')) return false;
        return false;
      });
      fs.readFileSync = jest.fn((p: string, encoding?: string) => {
        if (encoding === 'utf8' && String(p).endsWith('.css')) {
          return 'body{}\n/*# sourceMappingURL=all.css.map */';
        }
        return Buffer.from('content');
      });
      fs.writeFileSync = jest.fn();
      fs.mkdirSync = jest.fn();

      service.fingerprint();

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Asset manifest created at')
      );
      expect((service as any).manifest['js/main.js']).toBeDefined();

      require('glob').sync = originalGlobSync;
      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    });
  });

  describe('process success paths', () => {
    it('processFile writes fingerprinted asset and updates manifest', () => {
      const filePath = join((service as any).assetsDir, 'images', 'icon.png');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      const originalMkdirSync = fs.mkdirSync;

      fs.existsSync = jest.fn().mockReturnValue(false);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockReturnValue(Buffer.from('img'));
      fs.writeFileSync = jest.fn();

      const result = (service as any).processFile(filePath);
      expect(result).toContain('icon.');
      expect((service as any).manifest['icon.png']).toMatch(/^icon\.[a-f0-9]{8}\.png$/);

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    });

    it('processFile logs non-Error failures', () => {
      const filePath = join((service as any).assetsDir, 'images', 'icon.png');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalMkdirSync = fs.mkdirSync;
      const originalReadFileSync = fs.readFileSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockImplementation(() => {
        throw 'boom';
      });

      expect(() => (service as any).processFile(filePath)).toThrow('boom');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process file')
      );

      fs.existsSync = originalExistsSync;
      fs.mkdirSync = originalMkdirSync;
      fs.readFileSync = originalReadFileSync;
    });

    it('processGovukFile writes fingerprinted govuk js', () => {
      const filePath = join((service as any).govukDir, 'all.js');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      const originalMkdirSync = fs.mkdirSync;

      fs.existsSync = jest.fn().mockReturnValue(false);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockReturnValue(Buffer.from('js'));
      fs.writeFileSync = jest.fn();

      (service as any).processGovukFile(filePath);
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect((service as any).manifest['govuk/all.js']).toMatch(/govuk\/.*all\.[a-f0-9]{8}\.js/);

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    });

    it('processGovukFile logs non-Error failures', () => {
      const filePath = join((service as any).govukDir, 'all.js');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalMkdirSync = fs.mkdirSync;
      const originalReadFileSync = fs.readFileSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockImplementation(() => {
        throw 'govuk-fail';
      });

      (service as any).processGovukFile(filePath);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process GOV.UK file')
      );

      fs.existsSync = originalExistsSync;
      fs.mkdirSync = originalMkdirSync;
      fs.readFileSync = originalReadFileSync;
    });

    it('processGovukCssFile without source map', () => {
      const filePath = join((service as any).govukDir, 'all.css');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      const originalMkdirSync = fs.mkdirSync;

      fs.existsSync = jest.fn((p: string) => !String(p).endsWith('.map') && false);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockReturnValue('body{}');
      fs.writeFileSync = jest.fn();

      (service as any).processGovukCssFile(filePath);
      expect((service as any).manifest['govuk/all.css']).toMatch(/govuk\/all\.[a-f0-9]{8}\.css/);

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    });

    it('processGovukCssFile with source map updates reference', () => {
      const filePath = join((service as any).govukDir, 'all.css');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      const originalMkdirSync = fs.mkdirSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn((p: string, encoding?: string) => {
        if (encoding === 'utf8') return 'x{}\n/*# sourceMappingURL=all.css.map */';
        return Buffer.from('map');
      });
      fs.writeFileSync = jest.fn();

      (service as any).processGovukCssFile(filePath);
      expect((service as any).manifest['govuk/all.css.map']).toBeDefined();
      const cssWrite = (fs.writeFileSync as jest.Mock).mock.calls.find((c: any[]) =>
        String(c[0]).endsWith('.css')
      );
      expect(String(cssWrite[1])).toContain('sourceMappingURL=');

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    });

    it('processGovukCssFile logs non-Error failures', () => {
      const filePath = join((service as any).govukDir, 'all.css');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalMkdirSync = fs.mkdirSync;
      const originalReadFileSync = fs.readFileSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockImplementation(() => {
        throw 'css-fail';
      });

      (service as any).processGovukCssFile(filePath);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process GOV.UK CSS file')
      );

      fs.existsSync = originalExistsSync;
      fs.mkdirSync = originalMkdirSync;
      fs.readFileSync = originalReadFileSync;
    });

    it('processGovukAssetFile copies woff fonts without fingerprinting', () => {
      const font = join((service as any).govukDir, 'assets', 'fonts', 'f.woff');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      const originalMkdirSync = fs.mkdirSync;

      fs.existsSync = jest.fn().mockReturnValue(false);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockReturnValue(Buffer.from('font'));
      fs.writeFileSync = jest.fn();

      (service as any).processGovukAssetFile(font);
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(Object.keys((service as any).manifest)).toHaveLength(0);

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    });

    it('processGovukAssetFile skips mkdir when font output dir exists', () => {
      const font = join((service as any).govukDir, 'assets', 'fonts', 'f.woff');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      const originalMkdirSync = fs.mkdirSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockReturnValue(Buffer.from('font'));
      fs.writeFileSync = jest.fn();

      (service as any).processGovukAssetFile(font);
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    });

    it('processGovukAssetFile copies woff2 fonts without fingerprinting', () => {
      const font = join((service as any).govukDir, 'assets', 'fonts', 'f.woff2');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      const originalMkdirSync = fs.mkdirSync;

      fs.existsSync = jest.fn().mockReturnValue(false);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockReturnValue(Buffer.from('font'));
      fs.writeFileSync = jest.fn();

      (service as any).processGovukAssetFile(font);
      expect(fs.writeFileSync).toHaveBeenCalled();

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    });

    it('processGovukAssetFile fingerprints non-font assets', () => {
      const img = join((service as any).govukDir, 'assets', 'images', 'crest.png');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;
      const originalWriteFileSync = fs.writeFileSync;
      const originalMkdirSync = fs.mkdirSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockReturnValue(Buffer.from('img'));
      fs.writeFileSync = jest.fn();

      (service as any).processGovukAssetFile(img);
      expect((service as any).manifest['assets/images/crest.png']).toMatch(
        /assets\/images\/crest\.[a-f0-9]{8}\.png/
      );

      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    });

    it('processGovukAssetFile logs non-Error failures', () => {
      const img = join((service as any).govukDir, 'assets', 'images', 'crest.png');
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalMkdirSync = fs.mkdirSync;
      const originalReadFileSync = fs.readFileSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.mkdirSync = jest.fn();
      fs.readFileSync = jest.fn().mockImplementation(() => {
        throw 'asset-fail';
      });

      (service as any).processGovukAssetFile(img);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process GOV.UK asset file')
      );

      fs.existsSync = originalExistsSync;
      fs.mkdirSync = originalMkdirSync;
      fs.readFileSync = originalReadFileSync;
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
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to process file ${filePath}: File read error`
      );

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

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to process GOV.UK file ${filePath}: GOV.UK file error`
      );

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

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to process GOV.UK CSS file ${filePath}: CSS processing error`
      );

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

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to process GOV.UK asset file ${assetFile}: Asset processing error`
      );

      // Restore original functions
      require('fs').readFileSync = originalReadFileSync;
      require('fs').existsSync = originalExistsSync;
      require('fs').mkdirSync = originalMkdirSync;
    });
  });
});
