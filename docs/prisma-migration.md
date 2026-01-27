# Migrating to Prisma

## Overview

This guide provides step-by-step instructions for migrating your database layer to Prisma in a NestJS application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Schema Migration](#schema-migration)
5. [Service Migration](#service-migration)
6. [Query Migration](#query-migration)
7. [Transaction Management](#transaction-management)
8. [Testing Considerations](#testing-considerations)

## Prerequisites

- NestJS application
- Existing database setup
- Node.js v25.5.0 or later (LTS Krypton)
- npm or yarn

## Installation

```bash
# Install Prisma and required dependencies
npm install @prisma/client
npm install prisma --save-dev
```

## Configuration

1. Initialize Prisma in your project:

```bash
npx prisma init
```

2. Update your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
```

3. Create a Prisma service:

```typescript
// prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

## Schema Migration

1. Define your schema in `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile?
  posts     Post[]
}

model Profile {
  id     String @id @default(uuid())
  bio    String?
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. Generate Prisma Client:

```bash
npx prisma generate
```

## Service Migration

1. Update service classes to use Prisma:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
```

## Query Migration

### Basic Queries

```typescript
// Find with conditions
const users = await prisma.user.findMany({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
});

// Find one with relations
const user = await prisma.user.findUnique({
  where: { id },
  include: { profile: true, posts: true },
});
```

### Complex Queries

```typescript
// Using Prisma's query API
const users = await prisma.user.findMany({
  where: {
    AND: [
      { active: true },
      { posts: { some: { published: true } } },
    ],
  },
  include: {
    profile: true,
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    },
  },
});
```

## Transaction Management

```typescript
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUserWithProfile(userData: CreateUserDto): Promise<User> {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          ...userData,
          profile: {
            create: {
              // ... profile data
            },
          },
        },
      });
      return user;
    });
  }
}
```

## Testing Considerations

1. Use Prisma's test utilities:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });
});
```

2. Use test database:

```typescript
// test-database.config.ts
export const testDatabaseConfig = {
  datasource: {
    db: {
      url: 'postgresql://test:test@localhost:5432/test_db',
    },
  },
};
```

## Best Practices

1. **Schema Design**
   - Use appropriate field types
   - Define relationships explicitly
   - Use indexes for performance
   - Implement soft deletes when needed

2. **Query Optimization**
   - Use selective includes
   - Implement pagination
   - Use appropriate indexes
   - Monitor query performance

3. **Error Handling**
   - Implement proper error handling
   - Use Prisma's error types
   - Log database errors
   - Implement retry mechanisms

4. **Security**
   - Use parameterized queries
   - Implement proper access control
   - Sanitize user input
   - Use appropriate field types

## Common Issues and Solutions

1. **Performance Issues**
   - Use selective includes
   - Implement proper indexing
   - Use appropriate relations
   - Monitor query execution time

2. **Migration Issues**
   - Use Prisma migrations
   - Test migrations in development
   - Backup data before migration
   - Plan for rollback

3. **Connection Issues**
   - Implement connection pooling
   - Handle connection errors
   - Implement retry mechanisms
   - Monitor connection status

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NestJS Prisma Integration](https://docs.nestjs.com/recipes/prisma)
- [Prisma GitHub Repository](https://github.com/prisma/prisma)
- [NestJS GitHub Repository](https://github.com/nestjs/nest) 