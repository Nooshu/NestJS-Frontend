# NestJS Frontend Application

A NestJS application with GOV.UK Frontend integration.

## Project Structure

```
src/
├── modules/         # Feature modules
├── shared/          # Shared utilities and services
│   ├── config/     # Configuration files
│   ├── constants/  # Application constants
│   ├── decorators/ # Custom decorators
│   ├── guards/     # Authentication/Authorization guards
│   ├── interfaces/ # TypeScript interfaces
│   ├── middleware/ # Custom middleware
│   ├── services/   # Shared services
│   └── utils/      # Utility functions
├── views/          # Nunjucks templates
└── public/         # Static assets
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build SCSS and start development server
npm run start:dev
```

### Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Create feature branches for new development

### Testing

- Write unit tests for services and controllers
- Use Jest for testing
- Maintain good test coverage

### Documentation

- Document complex functions and classes
- Keep README up to date
- Use JSDoc for API documentation

## Deployment

The application can be deployed using:

```bash
npm run build
npm run start:prod
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the ISC License. 