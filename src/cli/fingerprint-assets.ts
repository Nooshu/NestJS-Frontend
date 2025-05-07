/**
 * CLI script to fingerprint static assets.
 * 
 * This script is used during the build process to generate content-based hashes
 * for static assets and create a manifest file for runtime asset path resolution.
 */

import { FingerprintService } from '../shared/services/fingerprint.service';

console.log('Starting asset fingerprinting...');

const fingerprintService = new FingerprintService();
fingerprintService.fingerprint();

console.log('Asset fingerprinting completed.'); 