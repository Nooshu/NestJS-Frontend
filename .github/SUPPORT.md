# Support

**This repository is archived / unmaintained and is not supported.** Issues and pull requests are not monitored.

## 📚 Documentation

- **[Project README](https://github.com/hmcts/NestJS-frontend/blob/main/README.md)** - Project overview and setup (historical)
- **[Security Policy](https://github.com/hmcts/NestJS-frontend/blob/main/SECURITY.md)** - How to report security vulnerabilities

## 🐛 Issues and Bug Reports

Issues are not monitored for this archived repository.

## 💬 Community Support

- **GitHub Discussions** - Ask questions and get help from the community
- **GitHub Issues** - For bug reports and feature requests
- **Pull Requests** - For code contributions

## 🛠️ Development Setup

If you're having trouble setting up the development environment:

1. Check the [Getting Started](https://github.com/[username]/NestJS-frontend/blob/main/docs/readme/getting-started.md) guide
2. Ensure you have the correct Node.js version (check `.nvmrc`)
3. Verify all dependencies are installed (`npm install`)
4. Check the [Docker setup](https://github.com/[username]/NestJS-frontend/blob/main/docs/docker-setup.md) if using containers

## 🔧 Common Issues

### Build Problems
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript configuration in `tsconfig.json`
- Verify Jest configuration in `jest.config.js`

### Test Failures
- Run tests with verbose output: `npm test -- --verbose`
- Check Playwright configuration in `playwright.config.ts`
- Ensure test database is properly configured

### Docker Issues
- Verify Docker and Docker Compose are running
- Check the [Docker setup guide](https://github.com/[username]/NestJS-frontend/blob/main/docs/docker-setup.md)
- Run validation scripts: `./scripts/validate-docker.sh`

## 📞 Contact

- **Security issues**: see [SECURITY.md](https://github.com/hmcts/NestJS-frontend/blob/main/SECURITY.md)

## 🚀 Getting Help Faster

To get help more quickly:

1. **Provide context** - Include your OS, Node.js version, and error messages
2. **Show what you've tried** - Describe the steps you've already attempted
3. **Include logs** - Share relevant console output or error logs
4. **Be specific** - Describe the exact problem you're experiencing

## 📖 Additional Resources

- **[NestJS Documentation](https://docs.nestjs.com/)** - Official NestJS guides
- **[GOV.UK Design System](https://design-system.service.gov.uk/)** - Frontend component library
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript language reference
- **[Jest Testing Framework](https://jestjs.io/docs/getting-started)** - Testing documentation
- **[Playwright Testing](https://playwright.dev/docs/intro)** - End-to-end testing guide

---

**Note**: This is a community-driven project. Please be patient and respectful when seeking help. We're all here to learn and improve together!
