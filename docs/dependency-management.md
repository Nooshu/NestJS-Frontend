# Dependency Management

## Overview
This project uses npm for dependency management with all dependencies pinned to exact versions for security and reproducibility. The project requires Node.js version 25.5.0 or higher (LTS Krypton).

## Key Dependencies

### Core Dependencies
- @nestjs/common: 11.1.12
- @nestjs/core: 11.1.12
- @nestjs/platform-express: 11.1.12
- govuk-frontend: 5.14.0
- nunjucks: 3.2.4

### Security Dependencies
- helmet: 8.1.0
- @nestjs/throttler: 6.5.0

### API and Integration
- @nestjs/axios: 4.0.1
- axios: 1.13.4
- @nestjs/swagger: 11.2.5
- swagger-ui-express: 5.0.1

### Caching
- @nestjs/cache-manager: 3.1.0
- cache-manager: 7.2.8
- cache-manager-redis-store: 3.0.1
- ioredis: 5.9.2

### Logging and Monitoring
- nest-winston: 1.10.2
- winston: 3.19.0
- pino: 10.2.0
- pino-pretty: 13.1.3

### Development Dependencies
- @nestjs/cli: 11.0.15
- jest: 30.2.0
- typescript: 5.9.3
- prettier: 3.8.0
- sass: 1.97.2
- @playwright/test: 1.58.0
- @babel/core: 7.28.6
- @babel/preset-env: 7.28.6

## Table of Contents

1. [Package Management](#package-management)
2. [Version Control](#version-control)
3. [Security Scanning](#security-scanning)
4. [Update Procedures](#update-procedures)
5. [Dependency Documentation](#dependency-documentation)
6. [License Management](#license-management)
7. [Performance Impact](#performance-impact)

## Package Management

### Package Configuration

1. **Package.json Structure**
   ```json
   {
     "name": "nest-frontend",
     "version": "1.0.0",
     "dependencies": {
       "@nestjs/common": "^9.0.0",
       "@nestjs/core": "^9.0.0",
       "govuk-frontend": "^4.0.0"
     },
     "devDependencies": {
       "@types/node": "^16.0.0",
       "typescript": "^4.0.0"
     }
   }
   ```

2. **Dependency Categories**
   - Production dependencies
   - Development dependencies
   - Peer dependencies
   - Optional dependencies

### Package Installation

1. **Installation Commands**
   ```bash
   # Install production dependencies
   npm install --save package-name
   
   # Install development dependencies
   npm install --save-dev package-name
   
   # Install peer dependencies
   npm install --save-peer package-name
   ```

2. **Installation Best Practices**
   - Use exact versions for critical packages
   - Document installation requirements
   - Verify package integrity
   - Check for conflicts

## Version Control

### Version Policies

**All dependencies are pinned to exact versions** (no `^` or `~` prefixes) for security and reproducibility. This ensures:
- Consistent builds across environments
- SHA integrity verification via package-lock.json
- Predictable behavior in production
- Easier security auditing

1. **Version Constraints**
   ```json
   {
     "dependencies": {
       // Exact version (required for all packages)
       "package-a": "1.2.3",
       "package-b": "1.2.3",
       "package-c": "1.2.3"
     }
   }
   ```

2. **Version Management**
   - All dependencies use exact versions (no ranges)
   - SHA integrity checksums in package-lock.json
   - Automated updates via Renovate Bot
   - Manual review required for major updates

### Version Updates

1. **Update Process**
   ```bash
   # Check for updates
   npm outdated
   
   # Update packages
   npm update
   
   # Update specific package
   npm update package-name
   ```

2. **Update Validation**
   - Test updates
   - Check compatibility
   - Verify functionality
   - Document changes

## Security Scanning

### Security Tools

1. **Scanning Configuration**
   ```json
   {
     "scripts": {
       "security": "npm audit",
       "security:fix": "npm audit fix",
       "security:check": "npm audit --json"
     }
   }
   ```

2. **Security Checks**
   - Vulnerability scanning
   - Dependency checking
   - License compliance
   - Code analysis

### Security Monitoring

1. **Monitoring Setup**
   ```typescript
   // Security monitoring configuration
   const securityConfig = {
     scanFrequency: 'daily',
     alertThreshold: 'high',
     autoUpdate: false,
     reportFormat: 'json'
   };
   ```

2. **Alert Management**
   - Security alerts
   - Vulnerability reports
   - Update notifications
   - Action items

## Automated Dependency Updates with Renovate Bot

This project uses [Renovate Bot](https://renovatebot.com/) to automatically manage dependency updates. The configuration is defined in `renovate.json`.

### Renovate Configuration Features

1. **Update Scheduling**
   - Regular updates: Monday mornings (before 10am)
   - Security updates: Anytime (high priority)
   - Timezone: Europe/London

2. **Update Grouping**
   - NestJS packages grouped together
   - Babel packages grouped together
   - TypeScript ESLint packages grouped together
   - Testing library packages grouped together
   - TypeScript type definitions grouped together

3. **Priority Levels**
   - Security updates: Priority 20 (highest)
   - GOV.UK Frontend: Priority 15
   - Node.js/npm engines: Priority 12
   - NestJS packages: Priority 10
   - Production patch updates: Priority 8
   - Production minor updates: Priority 6
   - Dev dependency updates: Priority 3-5
   - Major updates: Priority 1 (requires manual review)

4. **Labels and Categorization**
   - Security updates: `security`, `vulnerability`
   - Production dependencies: `dependencies`, `production`
   - Dev dependencies: `dependencies`, `dev-dependencies`
   - Major updates: `breaking-change`
   - Package-specific labels (e.g., `govuk-frontend`, `typescript`)

5. **Automerge Settings**
   - Automerge disabled by default (manual review required)
   - Security updates require manual approval
   - Major updates require manual approval

### Update Process

1. **Automated Update Checklist**
   ```markdown
   - [ ] Renovate creates PR with updates
   - [ ] Review changelog and breaking changes
   - [ ] Run tests: `npm test`
   - [ ] Verify build: `npm run build:prod`
   - [ ] Check for security issues: `npm audit`
   - [ ] Update documentation if needed
   - [ ] Merge PR after approval
   ```

2. **Manual Update Steps** (if needed)
   ```bash
   # Check for outdated packages
   npm outdated
   
   # Update specific package
   npm install --save-exact package-name@latest
   
   # Update all packages (use with caution)
   npm update
   
   # Verify integrity
   npm audit
   npm test
   ```

### Rollback Procedures

1. **Rollback Configuration**
   ```typescript
   // Rollback configuration
   const rollbackConfig = {
     maxVersions: 5,
     backupEnabled: true,
     autoRollback: false
   };
   ```

2. **Rollback Process**
   - Identify issues
   - Restore previous version
   - Verify functionality
   - Document changes

## Dependency Documentation

### Documentation Requirements

1. **Required Information**
   ```markdown
   - Package name
   - Version
   - Purpose
   - Usage
   - Dependencies
   - Security considerations
   ```

2. **Documentation Format**
   - Package description
   - Installation instructions
   - Configuration options
   - Usage examples

### Documentation Management

1. **Version Control**
   - Document repository
   - Version history
   - Change tracking
   - Review process

2. **Maintenance**
   - Regular updates
   - Review process
   - Quality checks
   - Archival process

## License Management

### License Types

1. **License Categories**
   ```typescript
   // License configuration
   const licenseConfig = {
     allowed: [
       'MIT',
       'Apache-2.0',
       'BSD-3-Clause'
     ],
     restricted: [
       'GPL',
       'AGPL'
     ]
   };
   ```

2. **License Requirements**
   - License compliance
   - Attribution requirements
   - Usage restrictions
   - Distribution rights

### License Compliance

1. **Compliance Checks**
   ```bash
   # Check licenses
   npm license-checker
   
   # Generate report
   npm license-checker --json
   ```

2. **Compliance Documentation**
   - License inventory
   - Compliance reports
   - Usage documentation
   - Audit trails

## Performance Impact

### Performance Monitoring

1. **Metrics Collection**
   ```typescript
   // Performance metrics
   interface DependencyMetrics {
     loadTime: number;
     memoryUsage: number;
     cpuUsage: number;
     networkUsage: number;
   }
   ```

2. **Impact Analysis**
   - Load time impact
   - Memory usage
   - CPU usage
   - Network impact

### Optimisation Strategies

1. **Optimisation Techniques**
   ```typescript
   // Optimisation configuration
   const optimizationConfig = {
     treeShaking: true,
     codeSplitting: true,
     lazyLoading: true,
     caching: true
   };
   ```

2. **Performance Improvements**
   - Bundle optimisation
   - Code splitting
   - Lazy loading
   - Caching strategies

## References

- [npm Documentation](https://docs.npmjs.com/)
- [Security Best Practices](https://www.gov.uk/service-manual/technology/vulnerability-management)
- [License Management](https://www.gov.uk/government/publications/open-source-guidance)
- [Performance Optimization](https://www.gov.uk/service-manual/technology/performance) 
