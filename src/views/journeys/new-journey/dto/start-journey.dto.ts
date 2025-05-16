/**
 * Data Transfer Object (DTO) for the journey start form.
 * Defines the validation rules and transformations for the initial journey data.
 * Uses class-validator decorators to enforce data integrity and format requirements.
 * 
 * @class StartJourneyDto
 * @property {string} fullName - User's full name (letters, spaces, hyphens, and apostrophes only)
 * @property {string} email - User's email address (must be valid email format)
 * @property {('personal'|'business'|'other')} journeyType - Type of journey being undertaken
 */
import { IsEmail, IsNotEmpty, IsEnum, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class StartJourneyDto {
  /**
   * User's full name.
   * Must not be empty and can only contain letters, spaces, hyphens, and apostrophes.
   * Will be trimmed of leading/trailing whitespace.
   */
  @IsNotEmpty({ message: 'Please enter your full name' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Full name can only contain letters, spaces, hyphens and apostrophes' })
  @Transform(({ value }) => value?.trim())
  fullName!: string;

  /**
   * User's email address.
   * Must be a valid email format and will be converted to lowercase.
   * Will be trimmed of leading/trailing whitespace.
   */
  @IsNotEmpty({ message: 'Please enter your email address' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email!: string;

  /**
   * Type of journey being undertaken.
   * Must be one of: 'personal', 'business', or 'other'.
   */
  @IsNotEmpty({ message: 'Please select a journey type' })
  @IsEnum(['personal', 'business', 'other'], { message: 'Please select a valid journey type' })
  journeyType!: 'personal' | 'business' | 'other';
} 