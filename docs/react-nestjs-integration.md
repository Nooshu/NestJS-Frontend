# React Integration with NestJS

> ⚠️ **Important Warning: Performance and Complexity Considerations for Government Services**
> 
> This implementation approach is **not recommended** for government services that need to be accessible to all users, regardless of their location or device capabilities. The additional JavaScript bundle size and client-side processing requirements can significantly impact:
> - Users on legacy devices
> - Users in rural areas with unreliable internet connections
> - Users on limited data plans
> - Users with older browsers
> - Users on low-powered mobile devices
> 
> Additionally, this approach adds significant complexity to your application:
> - Requires maintaining two separate codebases (NestJS and React)
> - Increases development and maintenance overhead
> - Requires additional server resources and configuration
> - Adds complexity to the build and deployment process
> - Requires additional testing and security considerations
> - Increases the risk of accessibility issues
> - Makes it harder to maintain consistency with other government services
> 
> For government services, we strongly recommend using Nunjucks Macros from GOV.UK Frontend, which provides:
> - Smaller bundle sizes
> - Better performance on all devices
> - Improved accessibility out of the box
> - Better support for users with limited connectivity
> - Compliance with government [WCAG 2.2 accessibility standards](https://design-system.service.gov.uk/accessibility/wcag-2.2/)
> - Simpler development and maintenance
> - Easier integration with existing government services
> - Reduced complexity in the codebase

This guide demonstrates how to integrate React with NestJS, focusing on server-side rendering (SSR) and testing best practices.

## Table of Contents
- [Important Warning](#important-warning-performance-and-complexity-considerations-for-government-services)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Server-Side Rendering Implementation](#server-side-rendering-implementation)
  - [Create a React Controller](#1-create-a-react-controller)
  - [Configure NestJS Module](#2-configure-nestjs-module)
  - [Create React Components](#3-create-react-components)
- [Testing Best Practices](#testing-best-practices)
  - [Unit Tests for React Components](#1-unit-tests-for-react-components)
  - [Integration Tests for NestJS Controllers](#2-integration-tests-for-nestjs-controllers)
  - [E2E Tests](#3-e2e-tests)
- [Best Practices and Guidelines](#best-practices-and-guidelines)
- [React vs Nunjucks Macros (GOV.UK Frontend)](#react-vs-nunjucks-macros-govuk-frontend)
  - [Pros of Using React](#pros-of-using-react)
  - [Cons of Using React](#cons-of-using-react)
  - [Pros of Using Nunjucks Macros](#pros-of-using-nunjucks-macros)
  - [Cons of Using Nunjucks Macros](#cons-of-using-nunjucks-macros)
- [Recommendation](#recommendation)
  - [Choose React When](#choose-react-when)
  - [Choose Nunjucks Macros When](#choose-nunjucks-macros-when)
  - [Balanced Approach](#balanced-approach)
  - [Final Recommendation](#final-recommendation)
- [Additional Resources](#additional-resources)

## Prerequisites

Before starting, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- NestJS CLI (`npm install -g @nestjs/cli`)

## Project Setup

1. First, install the required dependencies:

```bash
npm install @nestjs/platform-express @nestjs/serve-static react react-dom next @types/react @types/react-dom
```

2. Create a Next.js configuration file (`next.config.js`):

```javascript
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable server-side rendering
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: 'secret',
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
};
```

## Server-Side Rendering Implementation

### 1. Create a React Controller

```typescript
// src/controllers/react.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '../client/App';

@Controller()
export class ReactController {
  @Get('*')
  async renderReact(@Res() res: Response) {
    const html = renderToString(
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    );

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NestJS + React SSR</title>
          <link rel="stylesheet" href="/static/styles.css">
        </head>
        <body>
          <div id="root">${html}</div>
          <script src="/static/client.js"></script>
        </body>
      </html>
    `);
  }
}
```

### 2. Configure NestJS Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ReactController } from './controllers/react.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
    }),
  ],
  controllers: [ReactController],
})
export class AppModule {}
```

### 3. Create React Components

```typescript
// src/client/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default App;
```

## Testing Best Practices

### 1. Unit Tests for React Components

```typescript
// src/client/__tests__/App.test.tsx
import { render, screen } from '@testing-library/react';
import { StaticRouter } from 'react-router-dom/server';
import App from '../App';

describe('App Component', () => {
  it('renders home page by default', () => {
    render(
      <StaticRouter location="/">
        <App />
      </StaticRouter>
    );
    expect(screen.getByText(/Welcome to Home/i)).toBeInTheDocument();
  });

  it('renders about page', () => {
    render(
      <StaticRouter location="/about">
        <App />
      </StaticRouter>
    );
    expect(screen.getByText(/About Us/i)).toBeInTheDocument();
  });
});
```

### 2. Integration Tests for NestJS Controllers

```typescript
// src/controllers/__tests__/react.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ReactController } from '../react.controller';
import { Response } from 'express';

describe('ReactController', () => {
  let controller: ReactController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactController],
    }).compile();

    controller = module.get<ReactController>(ReactController);
  });

  it('should render React app', () => {
    const mockResponse = {
      send: jest.fn(),
    } as unknown as Response;

    controller.renderReact(mockResponse);
    expect(mockResponse.send).toHaveBeenCalled();
    expect(mockResponse.send.mock.calls[0][0]).toContain('<!DOCTYPE html>');
  });
});
```

### 3. E2E Tests

```typescript
// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(/<!DOCTYPE html>/);
  });

  afterEach(async () => {
    await app.close();
  });
});
```

## Best Practices and Guidelines

1. **Code Organization**
   - Keep React components in a separate `client` directory
   - Use TypeScript for both NestJS and React code
   - Implement proper type definitions for all components and props

2. **Performance Optimization**
   - Implement code splitting using React.lazy()
   - Use proper caching strategies for static assets
   - Implement proper error boundaries in React components

3. **Security Considerations**
   - Implement proper CSRF protection
   - Use environment variables for sensitive data
   - Implement proper input validation

4. **State Management**
   - Use React Context for simple state management
   - Consider Redux or MobX for complex state management
   - Implement proper data fetching strategies

5. **Testing Strategy**
   - Write unit tests for all React components
   - Implement integration tests for NestJS controllers
   - Use E2E tests for critical user flows
   - Maintain good test coverage

6. **Development Workflow**
   - Use proper linting and formatting tools
   - Implement proper CI/CD pipelines
   - Use proper version control practices

## React vs Nunjucks Macros (GOV.UK Frontend)

### Pros of Using React

1. **Component Reusability**
   - React components are highly reusable and can be shared across different parts of the application
   - Components can be published as npm packages for use in other projects
   - Better encapsulation of component logic and styling

2. **State Management**
   - Rich ecosystem of state management solutions (Redux, MobX, Context API)
   - Better handling of complex UI state
   - Easier implementation of real-time updates and dynamic content

3. **Developer Experience**
   - Strong TypeScript support
   - Rich ecosystem of development tools and libraries
   - Better debugging capabilities with React DevTools
   - Hot module replacement for faster development

4. **Performance**
   - Virtual DOM for efficient updates
   - Better handling of complex UI interactions
   - Easier implementation of code splitting and lazy loading
   - Better support for progressive web apps (PWAs)

5. **Testing**
   - Rich ecosystem of testing tools (Jest, React Testing Library)
   - Easier unit testing of components
   - Better support for snapshot testing
   - More comprehensive testing capabilities

### Cons of Using React

1. **Complexity**
   - Steeper learning curve compared to Nunjucks
   - Requires more setup and configuration
   - More complex build process
   - Larger bundle size

2. **Server-Side Rendering**
   - More complex SSR implementation
   - Requires additional server-side JavaScript execution
   - Higher server resource usage
   - More complex caching strategies

3. **Maintenance**
   - More dependencies to maintain
   - Regular updates required for React and related libraries
   - More complex deployment process
   - Higher hosting costs due to increased server requirements

4. **Accessibility**
   - Requires more effort to maintain accessibility standards
   - Need to implement additional accessibility features
   - More complex ARIA implementation
   - Higher risk of accessibility issues

5. **Performance Impact**
   - Larger JavaScript bundle size (typically 100-300KB gzipped for basic React apps)
   - Additional network requests for JavaScript files
   - Slower initial page load compared to server-rendered HTML
   - Higher memory usage in the browser
   - Potential impact on mobile devices with limited resources
   - Additional processing time for JavaScript execution
   - Impact on Time to Interactive (TTI) metrics
   - Potential impact on Core Web Vitals scores
   - Higher bandwidth usage for users on limited data plans
   - Additional battery drain on mobile devices

### Pros of Using Nunjucks Macros

1. **Simplicity**
   - Easier to learn and implement
   - Less setup required
   - Simpler build process
   - Smaller bundle size

2. **Server-Side Rendering**
   - Native server-side rendering support
   - Lower server resource usage
   - Simpler caching strategies
   - Better initial page load performance

3. **Accessibility**
   - Built-in accessibility features
   - Follows GOV.UK Design System standards
   - Less risk of accessibility issues
   - Easier to maintain accessibility compliance

4. **Maintenance**
   - Fewer dependencies to maintain
   - Simpler deployment process
   - Lower hosting costs
   - Better suited for government websites

### Cons of Using Nunjucks Macros

1. **Limited Interactivity**
   - Less suitable for complex UI interactions
   - Limited client-side state management
   - More difficult to implement real-time updates
   - Less suitable for single-page applications

2. **Component Reusability**
   - Less flexible component system
   - More difficult to share components across projects
   - Limited component encapsulation
   - Less suitable for complex UI patterns

3. **Developer Experience**
   - Limited TypeScript support
   - Fewer development tools available
   - Less sophisticated debugging capabilities
   - Limited hot module replacement

4. **Testing**
   - Limited testing capabilities
   - More difficult to unit test templates
   - Less comprehensive testing tools
   - More difficult to implement automated testing

## Recommendation

When choosing between React and Nunjucks Macros for your NestJS application, consider the following factors:

### Choose React When:

1. **Complex User Interfaces**
   - Your application requires rich, interactive user interfaces
   - You need complex state management
   - Real-time updates are essential
   - You're building a single-page application (SPA)

2. **Large Development Team**
   - You have experienced React developers
   - Your team is comfortable with modern JavaScript/TypeScript
   - You need strong type safety and better development tools
   - You want to leverage a rich ecosystem of libraries and tools

3. **Long-term Scalability**
   - You anticipate significant growth in application complexity
   - You need to maintain a large codebase
   - You want to implement advanced features like code splitting
   - You need to support multiple platforms (web, mobile, desktop)

4. **Performance Requirements**
   - You need optimal client-side performance
   - You want to implement progressive web app features
   - You need efficient handling of complex UI updates
   - You want to leverage modern browser capabilities

### Choose Nunjucks Macros When:

1. **Government Websites**
   - You're building a government service
   - You need to strictly follow GOV.UK Design System
   - Accessibility is a primary concern
   - You need to maintain consistency with other government services

2. **Simple Applications**
   - Your application has mostly static content
   - You need minimal client-side interactivity
   - You want to minimize bundle size
   - You need faster initial page loads

3. **Small Development Team**
   - Your team is more familiar with traditional server-side rendering
   - You want to minimize development complexity
   - You need to onboard new developers quickly
   - You want to reduce maintenance overhead

4. **Resource Constraints**
   - You have limited server resources
   - You need to minimize hosting costs
   - You want to reduce deployment complexity
   - You need to maintain a smaller codebase

### Balanced Approach

For many applications, a hybrid approach might be the best solution:

1. **Use Nunjucks for:**
   - Main page layouts and static content
   - Forms and basic user interactions
   - Accessibility-critical components
   - Government service compliance

2. **Use React for:**
   - Complex interactive components
   - Real-time data updates
   - Advanced UI features
   - Progressive web app features

This hybrid approach allows you to:
- Maintain accessibility and compliance standards
- Leverage the best of both worlds
- Optimize for both performance and user experience
- Scale your application as needed

### Final Recommendation

For government services and applications that need to be accessible to all users, **Nunjucks Macros is the strongly recommended choice** due to:

1. **Universal Accessibility**
   - Better performance on all devices
   - Smaller bundle sizes
   - Reduced network requirements
   - Better support for users with limited connectivity
   - Compliance with government accessibility standards

2. **Performance Considerations**
   - Faster initial page loads
   - Lower bandwidth usage
   - Better support for legacy devices
   - Reduced battery drain on mobile devices
   - Better performance in areas with poor connectivity

3. **Government Service Requirements**
   - Built-in compliance with GOV.UK Design System
   - Better accessibility out of the box
   - Simpler maintenance and updates
   - Lower hosting costs
   - Better support for government service standards

4. **Development and Maintenance**
   - Simpler codebase structure
   - Easier onboarding for new developers
   - Reduced development overhead
   - Simpler deployment process
   - Easier integration with existing government services
   - Lower maintenance costs
   - Reduced risk of technical debt
   - Better alignment with government development practices

React should only be considered for government services when:
- The application requires complex, real-time interactions
- The user base is known to have modern devices and reliable connections
- The performance impact has been thoroughly tested and mitigated
- Alternative solutions have been evaluated and rejected
- The benefits of React outweigh the performance costs
- The development team has the necessary expertise and resources
- The added complexity can be properly managed and maintained
- The long-term maintenance costs are acceptable

For most government services, the performance, accessibility, and simplicity benefits of Nunjucks Macros make it the more appropriate choice, ensuring that services remain accessible to all users, regardless of their location or device capabilities, while maintaining a manageable and maintainable codebase.

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/) 
