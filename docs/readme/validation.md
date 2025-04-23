# Request Validation

The application uses class-validator and class-transformer for request validation. This provides automatic validation of all incoming client payloads against DTO classes.

## Validation Features

- Automatic validation of request payloads
- Type transformation and conversion
- Whitelisting of properties
- Custom validation decorators
- Nested object validation
- Array validation
- Conditional validation

## Basic Usage

1. **Create a DTO (Data Transfer Object)**

```typescript
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

2. **Use in Controller**

```typescript
@Controller('users')
export class UsersController {
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    // The DTO will be automatically validated
    return this.userService.create(createUserDto);
  }
}
```

## Common Validation Decorators

- `@IsString()` - Must be a string
- `@IsNumber()` - Must be a number
- `@IsEmail()` - Must be a valid email
- `@IsOptional()` - Field is optional
- `@MinLength()` - Minimum string length
- `@MaxLength()` - Maximum string length
- `@IsArray()` - Must be an array
- `@ValidateNested()` - Validate nested objects
- `@IsEnum()` - Must be a value from enum
- `@Matches()` - Must match regex pattern

## Custom Validation

You can create custom validation decorators:

```typescript
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'customText', async: false })
export class CustomTextValidator implements ValidatorConstraintInterface {
  validate(text: string) {
    return text.startsWith('custom');
  }

  defaultMessage() {
    return 'Text must start with "custom"';
  }
}

// Usage
export class CustomDto {
  @Validate(CustomTextValidator)
  text: string;
}
```

## Validation Groups

You can use validation groups for conditional validation:

```typescript
export class UserDto {
  @IsString()
  @MinLength(3, { groups: ['create'] })
  name: string;

  @IsEmail()
  email: string;
}

// In controller
@Post()
createUser(@Body(new ValidationPipe({ groups: ['create'] })) userDto: UserDto) {
  // ...
}
```

## Error Handling

Validation errors are automatically handled and return a 400 Bad Request response with detailed error messages:

```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "name must be longer than or equal to 3 characters"
  ],
  "error": "Bad Request"
}
```

## Best Practices

1. **DTO Organisation**
   - Keep DTOs in a dedicated directory (e.g., `src/dto`)
   - Use clear naming conventions (e.g., `CreateUserDto`, `UpdateUserDto`)
   - Document DTOs with comments and examples

2. **Validation Rules**
   - Use appropriate validation decorators
   - Consider using validation groups for complex scenarios
   - Add custom validation when needed
   - Keep validation rules consistent

3. **Error Messages**
   - Use descriptive error messages
   - Consider internationalisation
   - Provide helpful error details
   - Handle validation errors gracefully 