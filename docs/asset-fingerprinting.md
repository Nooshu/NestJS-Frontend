# Asset Fingerprinting

This project implements static asset fingerprinting without using bundlers like Webpack. Asset fingerprinting adds a content hash to filenames, which enables efficient browser caching while ensuring users always get the latest version when files change.

## How It Works

1. During the build process, a hash is generated for each static asset based on its content
2. Files are copied to the dist folder with the hash included in their filename (e.g., `main.css` becomes `main.a1b2c3d4.css`)
3. A manifest file (`asset-manifest.json`) is created mapping original paths to fingerprinted paths
4. At runtime, the `assetPath` Nunjucks global function resolves paths to their fingerprinted versions

## Using Fingerprinted Assets in Templates

Instead of hardcoding paths to assets, use the `assetPath` function:

```nunjucks
<!-- Instead of this -->
<link rel="stylesheet" href="/css/main.css">

<!-- Use this -->
<link rel="stylesheet" href="{{ assetPath('/css/main.css') }}">

<!-- For images -->
<img src="{{ assetPath('/images/logo.png') }}" alt="Logo">

<!-- For JavaScript -->
<script src="{{ assetPath('/js/app.js') }}"></script>
```

## Build Process

The fingerprinting process is automatically included in the build workflow when running:

```bash
npm run build:frontend
```

This command:
1. Compiles SCSS to CSS
2. Copies static assets to the dist folder
3. Fingerprints the assets and creates the manifest

## Manual Fingerprinting

To manually run the fingerprinting process:

```bash
npm run fingerprint:assets
```

## Implementation Details

- `FingerprintService`: Core service that handles file hashing and manifest generation
- `AssetPathExtension`: Nunjucks extension that exposes the `assetPath` function
- The fingerprinting process generates an 8-character MD5 hash of each file's content

## Advantages Over Bundlers

This approach provides several advantages:
- Simpler build pipeline without complex bundler configuration
- Lower build times for large projects
- More transparent asset handling
- Better control over how assets are processed
- No dependencies on external bundlers 