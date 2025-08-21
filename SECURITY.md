# Security Policy

## Supported Versions

This project is actively maintained and security updates are provided for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of our NestJS-frontend application seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

### How to Report

1. **Email Security Team**: Send an email to [security@hmcts.gov.uk](mailto:security@hmcts.gov.uk)
2. **Subject Line**: Use the format `[SECURITY] NestJS-frontend - [Brief Description]`
3. **Include Details**: Provide as much information as possible about the vulnerability

### What to Include

Please include the following information in your report:

- **Description**: A clear description of the vulnerability
- **Impact**: Potential impact if exploited
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Environment**: Operating system, browser, and version information
- **Proof of Concept**: If possible, include a proof of concept
- **Timeline**: When you discovered the vulnerability
- **Contact Information**: Your preferred method of contact

### Response Timeline

- **Initial Response**: Within 48 hours of receiving your report
- **Status Update**: Within 7 days with an assessment
- **Resolution**: Target resolution within 30 days for critical issues
- **Public Disclosure**: Coordinated disclosure after fixes are deployed

## Security Features

Our application implements comprehensive security measures to protect against common web vulnerabilities:

### 🔒 CSRF Protection
- Custom CSRF middleware using Node's native `crypto` module
- Secure token generation with cryptographically strong random values
- HttpOnly cookies with SameSite flags
- Automatic token rotation and expiration

### 🛡️ Content Security Policy (CSP)
- Comprehensive CSP implementation using Helmet.js
- Nonce-based script security
- Strict resource restrictions
- Violation reporting and monitoring

### 🔐 Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy with strict restrictions

### 🚫 CORS Configuration
- Configurable origin restrictions
- Method and header controls
- Secure credential handling
- Cache control implementation

### 🔍 Rate Limiting
- Express rate limiting middleware
- Configurable thresholds and timeframes
- IP-based rate limiting
- Customizable rate limit policies

### 🧹 Input Validation & Sanitization
- Request sanitization middleware
- Class-validator integration
- Input filtering and validation
- XSS prevention measures

## Security Best Practices

### Development Guidelines
- Always use CSRF tokens in forms
- Keep security headers up to date
- Monitor CSP violations
- Regularly update dependencies
- Use secure cookie settings
- Implement proper error handling
- Follow the principle of least privilege

### Code Security
- Input validation and sanitization
- Secure authentication and authorization
- Proper session management
- Secure data storage and transmission
- Regular security audits and code reviews

## Vulnerability Management

### Assessment Process
- Automated vulnerability scanning (npm audit, Snyk)
- Manual security testing
- Penetration testing
- Regular dependency updates
- Security-focused code reviews

### Patch Management
- **Critical**: 24-hour response time
- **High**: 7-day response time
- **Medium**: 30-day response time
- **Low**: 90-day response time

## Compliance & Standards

Our application adheres to the following security standards and frameworks:

- **OWASP Top 10**: Protection against common web vulnerabilities
- **Government Security Standards**: UK government security requirements
- **GDPR Compliance**: Data protection and privacy controls
- **ISO 27001**: Information security management
- **NIST Framework**: Cybersecurity best practices

## Security Monitoring

### Active Monitoring
- Security event logging
- CSP violation reporting
- Rate limiting alerts
- Authentication failure monitoring
- Suspicious activity detection

### Incident Response
- 24/7 security monitoring
- Automated alerting systems
- Incident classification and response
- Post-incident analysis and reporting

## Responsible Disclosure

We believe in responsible disclosure and will:

- Acknowledge receipt of vulnerability reports
- Provide regular updates on progress
- Credit researchers in security advisories
- Coordinate public disclosure after fixes are deployed
- Work with researchers to validate fixes

## Security Contacts

- **Security Team**: [security@hmcts.gov.uk](mailto:security@hmcts.gov.uk)
- **Project Maintainers**: [matt.hobbs@hmcts.gov.uk](mailto:matt.hobbs@hmcts.gov.uk)
- **Emergency Contact**: [security-emergency@hmcts.gov.uk](mailto:security-emergency@hmcts.gov.uk)

## Security Resources

### Documentation
- [Security Features](docs/security.md)
- [Security Best Practices](docs/security-best-practices.md)
- [Security Enhancements](docs/security-enhancements.md)
- [API Security](docs/api-integration.md)

### External Resources
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [UK Government Security Standards](https://www.gov.uk/government/publications/security-policy-framework)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Helmet.js Security Headers](https://helmetjs.github.io/)

## Acknowledgments

We appreciate the security research community and individuals who responsibly report vulnerabilities. Your contributions help make our application more secure for all users.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: HMCTS Development Team
