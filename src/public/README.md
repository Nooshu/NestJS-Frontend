# Static Assets Directory

This directory contains all static assets used throughout the application. Static assets are files that are served directly to the client without any server-side processing.

## Directory Structure

```
public/
├── images/          # Image files (PNG, JPG, SVG, WebP)
│   ├── first-journey/    # Assets specific to the first journey
│   └── second-journey/   # Assets specific to the second journey
├── diagrams/        # Diagrams and flowcharts (SVG, PNG)
├── documents/       # Document files (PDF, DOC)
└── styles/          # Additional CSS files
```

## Usage in Views

### Nunjucks Templates

To reference static assets in Nunjucks templates, use the following syntax:

```html
<!-- Images -->
<img src="/images/second-journey/example.png" alt="Example image">

<!-- Documents -->
<a href="/documents/guide.pdf">Download Guide</a>

<!-- CSS -->
<link rel="stylesheet" href="/styles/custom.css">
```

### Best Practices

1. **File Naming**
   - Use lowercase letters
   - Use hyphens for spaces (e.g., `user-journey-flow.png`)
   - Include descriptive names
   - Avoid special characters

2. **Image Optimization**
   - Use appropriate formats:
     - SVG for diagrams and icons
     - WebP with JPG fallback for photos
     - PNG for images requiring transparency
   - Optimize images for web use
   - Consider using responsive images with `srcset` for different screen sizes

3. **Organization**
   - Group assets by journey/feature
   - Use consistent naming conventions
   - Keep related assets together
   - Document any special requirements or dependencies

4. **Accessibility**
   - Always include alt text for images
   - Use descriptive link text for documents
   - Ensure sufficient color contrast
   - Provide text alternatives for diagrams

## Adding New Assets

1. Place new assets in the appropriate subdirectory
2. Follow the naming conventions
3. Optimize the assets for web use
4. Update this documentation if adding new asset types or directories

## Asset Versioning

For production assets that may be cached by browsers, consider using a versioning strategy:

```html
<!-- Example with version query parameter -->
<img src="/images/logo.png?v=1.0.0" alt="Logo">
```

## Security Considerations

- Only place public assets in this directory
- Do not store sensitive information in static files
- Validate file types and sizes when uploading
- Use appropriate content security policies 