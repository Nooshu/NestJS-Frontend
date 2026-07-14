# Contributing to NestJS Frontend

Thank you for your interest in contributing to the NestJS Frontend application! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style and Standards](#code-style-and-standards)
- [Testing Guidelines](#testing-guidelines)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
- [Code Review Process](#code-review-process)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Getting Help](#getting-help)

## Getting Started

### Prerequisites

Before contributing, ensure you have the following installed:

- **Node.js** >= 20.12.2
- **npm** (comes with Node.js)
- **Git**
- **Docker** (optional, for containerized development)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/NestJS-frontend.git
   cd NestJS-frontend
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/hmcts/NestJS-frontend.git
   ```

## Development Setup

### Install Dependencies

```bash
npm install
```

### Environment Configuration

The application uses environment variables for configuration. Copy the example configuration:

```bash
cp .env.example .env
```

Key environment variables:
- `NODE_ENV` - Environment (development, production, test)
- `PORT` - Application port
- `LOG_LEVEL` - Logging level
- `REDIS_URL` - Redis connection string (optional)

### Database Setup (if using TypeORM/Prisma)

```bash
# For TypeORM
npm run typeorm:run-migrations

# For Prisma
npm run prisma:generate
npm run prisma:migrate:dev
```

## Code Style and Standards

### TypeScript

- Use **strict TypeScript** mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add proper JSDoc comments for public APIs
- Follow NestJS decorator patterns

### Code Formatting

We use **Prettier** and **ESLint** for consistent code formatting:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Check linting without fixing
npm run lint:check
```

### File Naming Conventions

- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **Modules**: `*.module.ts`
- **DTOs**: `*.dto.ts`
- **Tests**: `*.spec.ts`
- **Views**: `*.njk` (Nunjucks templates)

### Import Organization

```typescript
// 1. Node.js built-ins
import { join } from 'path';

// 2. Third-party packages
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 3. Local imports (relative paths)
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
```

## Testing Guidelines

### Test Structure

Tests are organized by type:

- **Unit Tests** (`test/` directory) - Test individual components
- **Integration Tests** (`test/` directory) - Test component interactions
- **GOV.UK Component Tests** (`test/govuk-components/`) - Test GOV.UK Frontend components
- **End-to-End Tests** (`tests/` directory) - Test complete user journeys

### Writing Tests

#### Unit Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const result = await service.createUser(userData);
      
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(userData.name);
    });
  });
});
```

#### Integration Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200);
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:govuk         # GOV.UK component tests
npm run test:e2e           # End-to-end tests

# Run tests in watch mode
npm run test:unit:watch
npm run test:integration:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests locally
npm run test:e2e:local
```

### Test Coverage Requirements

- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: Minimum 70% coverage
- **All Tests**: Minimum 75% overall coverage

## Development Workflow

### Branch Strategy

1. **Main Branch**: Production-ready code
2. **Development Branch**: Integration branch for features
3. **Feature Branches**: Individual features/fixes

### Creating a Feature Branch

```bash
# Ensure you're on the latest main branch
git checkout main
git pull upstream main

# Create and checkout a new feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-description
```

### Development Commands

```bash
# Start development server with hot reload
npm run start:dev

# Build frontend assets
npm run build:frontend

# Watch for changes
npm run build:frontend:watch

# Run tests
npm run test:all

# Format and lint code
npm run format
npm run lint
```

### Commit Guidelines

Use conventional commit format:

```bash
# Format: type(scope): description
git commit -m "feat(user): add user authentication service"
git commit -m "fix(api): resolve validation error in user creation"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(user): add unit tests for user service"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Keeping Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch on latest main
git rebase upstream/main

# Or merge (if you prefer)
git merge upstream/main
```

## Submitting Changes

### Pull Request Process

1. **Ensure Tests Pass**: Run all tests locally before submitting
2. **Update Documentation**: Update relevant documentation if needed
3. **Create Pull Request**: Use the PR template and provide clear description
4. **Link Issues**: Reference related issues in your PR description

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Documentation has been updated
- [ ] No new warnings or errors

## Related Issues
Closes #(issue number)
```

### Code Review Requirements

- **Minimum 2 approvals** required for merge
- **All CI checks must pass**
- **Code coverage must not decrease**
- **No merge conflicts**

## Documentation

### Updating Documentation

- Keep documentation in sync with code changes
- Use clear, concise language
- Include code examples where appropriate
- Update the main README.md if adding new features

### Documentation Structure

```
docs/
├── README.md                 # Main documentation index
├── readme/                   # Getting started guides
├── api-integration/          # API integration guides
├── testing/                  # Testing documentation
├── security/                 # Security documentation
└── performance/              # Performance guides
```

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
npm run build
```

#### Test Failures

```bash
# Clear Jest cache
npm run test:clear-cache

# Run tests with verbose output
npm run test:unit -- --verbose
```

#### Frontend Asset Issues

```bash
# Rebuild frontend assets
npm run build:frontend

# Clear browser cache and hard refresh
# Check asset fingerprinting is working
```

### Docker Issues

```bash
# Clean Docker environment
docker-compose down --rmi all --volumes --remove-orphans

# Rebuild containers
docker-compose build --no-cache
docker-compose up
```

## Getting Help

### Resources

- **Project Documentation**: [docs/README.md](docs/README.md)
- **NestJS Documentation**: [https://nestjs.com/](https://nestjs.com/)
- **GOV.UK Frontend**: [https://design-system.service.gov.uk/](https://design-system.service.gov.uk/)
- **TypeScript Handbook**: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Request Comments**: For code review discussions

### Before Asking for Help

1. Check existing documentation
2. Search existing issues and discussions
3. Try to reproduce the issue in isolation
4. Provide clear reproduction steps
5. Include relevant error messages and logs

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to the NestJS Frontend project! Your contributions help make this a better tool for the HMCTS community and beyond.
