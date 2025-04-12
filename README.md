# NestJS Frontend with GOV.UK Design System

A NestJS application that integrates Express.js and Nunjucks for rendering GOV.UK Frontend components.

## Features

- NestJS with Express.js
- Nunjucks templating engine
- GOV.UK Frontend Design System
- SCSS compilation
- TypeScript support

## Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nest-frontend
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the application in development mode:
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm run start:prod
```

## Project Structure

```
src/
├── views/           # Nunjucks templates
├── public/          # Static assets
├── app.module.ts    # Main application module
├── main.ts          # Application entry point
└── nunjucks.engine.ts # Nunjucks configuration
```

## License

MIT 