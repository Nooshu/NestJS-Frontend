# Migrating to TypeORM

## Overview

This guide provides step-by-step instructions for migrating your database layer to TypeORM in a NestJS application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Entity Migration](#entity-migration)
5. [Repository Migration](#repository-migration)
6. [Query Migration](#query-migration)
7. [Transaction Management](#transaction-management)
8. [Testing Considerations](#testing-considerations)

## Prerequisites

- NestJS application
- Existing database setup
- Node.js v20 or later
- npm or yarn

## Installation

```bash
# Install TypeORM and required dependencies
npm install @nestjs/typeorm typeorm pg
```

## Configuration

1. Update your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class AppModule {}
```

## Entity Migration

1. Create entity classes:

```typescript
// user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;
}
```

2. Register entities in modules:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  // ...
})
export class UserModule {}
```

## Repository Migration

1. Update service classes to use TypeORM repositories:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

## Query Migration

### Basic Queries

```typescript
// Find with conditions
const users = await userRepository.find({
  where: { active: true },
  order: { createdAt: 'DESC' },
});

// Find one with relations
const user = await userRepository.findOne({
  where: { id },
  relations: ['profile', 'roles'],
});
```

### Complex Queries

```typescript
// Using QueryBuilder
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.profile', 'profile')
  .where('user.active = :active', { active: true })
  .orderBy('user.createdAt', 'DESC')
  .getMany();
```

## Transaction Management

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUserWithProfile(userData: CreateUserDto): Promise<User> {
    return this.userRepository.manager.transaction(async (manager) => {
      const user = manager.create(User, userData);
      await manager.save(user);
      
      const profile = manager.create(Profile, {
        userId: user.id,
        // ... profile data
      });
      await manager.save(profile);
      
      return user;
    });
  }
}
```

## Testing Considerations

1. Use TypeORM's test utilities:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });
});
```

2. Use test database:

```typescript
// test-database.config.ts
export const testDatabaseConfig = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'test_db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
};
```

## Best Practices

1. **Entity Design**
   - Use decorators for column definitions
   - Define relationships explicitly
   - Use appropriate column types
   - Implement soft deletes when needed

2. **Query Optimization**
   - Use relations sparingly
   - Implement pagination
   - Use appropriate indexes
   - Monitor query performance

3. **Error Handling**
   - Implement proper error handling
   - Use TypeORM's error types
   - Log database errors
   - Implement retry mechanisms

4. **Security**
   - Use parameterized queries
   - Implement proper access control
   - Sanitize user input
   - Use appropriate column types

## Common Issues and Solutions

1. **Performance Issues**
   - Use query builder for complex queries
   - Implement proper indexing
   - Use appropriate relations
   - Monitor query execution time

2. **Migration Issues**
   - Use TypeORM migrations
   - Test migrations in development
   - Backup data before migration
   - Plan for rollback

3. **Connection Issues**
   - Implement connection pooling
   - Handle connection errors
   - Implement retry mechanisms
   - Monitor connection status

## Additional Resources

- [TypeORM Documentation](https://typeorm.io/)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [TypeORM GitHub Repository](https://github.com/typeorm/typeorm)
- [NestJS GitHub Repository](https://github.com/nestjs/nest) 