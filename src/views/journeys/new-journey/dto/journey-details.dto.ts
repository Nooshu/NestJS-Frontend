/**
 * Data Transfer Object (DTO) for the journey details form.
 * Defines the validation rules and transformations for the journey-specific data.
 * Uses class-validator decorators to enforce data integrity and format requirements.
 *
 * @class JourneyDetailsDto
 * @property {string} journeyDate-day - Day component of journey start date (1-31)
 * @property {string} journeyDate-month - Month component of journey start date (1-12)
 * @property {string} journeyDate-year - Year component of journey start date (4 digits)
 * @property {string} journeyDuration - Duration of the journey (predefined options)
 * @property {string} journeyDescription - Detailed description of the journey (10-500 chars)
 */
import { IsNotEmpty, IsEnum, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class JourneyDetailsDto {
  /**
   * Day component of the journey start date.
   * Must be a valid day number (1-31).
   */
  @IsNotEmpty({ message: 'Please enter a valid journey start date' })
  @Matches(/^\d{1,2}$/, { message: 'Please enter a valid day' })
  'journeyDate-day'!: string;

  /**
   * Month component of the journey start date.
   * Must be a valid month number (1-12).
   */
  @IsNotEmpty({ message: 'Please enter a valid journey start date' })
  @Matches(/^([1-9]|1[0-2])$/, { message: 'Please enter a valid month (1-12)' })
  'journeyDate-month'!: string;

  /**
   * Year component of the journey start date.
   * Must be a 4-digit year number.
   */
  @IsNotEmpty({ message: 'Please enter a valid journey start date' })
  @Matches(/^\d{4}$/, { message: 'Please enter a valid year' })
  'journeyDate-year'!: string;

  /**
   * Duration of the journey.
   * Must be one of the predefined duration options:
   * - 1-week
   * - 2-weeks
   * - 1-month
   * - 3-months
   * - 6-months
   * - 1-year
   */
  @IsNotEmpty({ message: 'Please select a journey duration' })
  @IsEnum(['1-week', '2-weeks', '1-month', '3-months', '6-months', '1-year'], {
    message: 'Please select a valid journey duration',
  })
  journeyDuration!: string;

  /**
   * Detailed description of the journey.
   * Must be between 10 and 500 characters long.
   * Will be trimmed of leading/trailing whitespace.
   */
  @IsNotEmpty({ message: 'Please describe your journey' })
  @IsString()
  @MinLength(10, { message: 'Journey description must be at least 10 characters long' })
  @MaxLength(500, { message: 'Journey description must not exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  journeyDescription!: string;
}
