/**
 * CLI script to fingerprint static assets.
 *
 * This script is used as part of the build process to generate content-based hashes
 * for static assets and create a manifest file for runtime asset path resolution.
 *
 * The script:
 * 1. Initializes the FingerprintService
 * 2. Calls its fingerprint() method to process all assets
 * 3. Outputs simple logging messages to the console
 *
 * This is typically run as part of the build:frontend npm script after the CSS
 * compilation and asset copying steps have completed.
 *
 * @see FingerprintService for the implementation details of the fingerprinting process
 */

import { FingerprintService } from '../shared/services/fingerprint.service';

async function main() {
  try {
    console.log('Starting asset fingerprinting...');

    // Create an instance of the fingerprint service and run the fingerprinting process
    const fingerprintService = new FingerprintService();
    await fingerprintService.fingerprint();

    console.log('Asset fingerprinting completed.');
  } catch (error) {
    console.error(
      'Asset fingerprinting failed:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Only run if this file is being executed directly (not imported)
if (require.main === module) {
  main();
}

// Export for testing
export { main };
