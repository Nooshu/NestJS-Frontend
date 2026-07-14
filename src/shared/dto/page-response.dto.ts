/**
 * Data Transfer Object (DTO) for page response data.
 * This DTO defines the structure of data returned when rendering pages.
 * It includes Swagger/OpenAPI decorators for documentation purposes.
 */

import { ApiProperty } from '@nestjs/swagger';

export class PageResponseDto {
  /**
   * The title of the page
   *
   * @example 'NestJS GOV.UK Frontend'
   */
  @ApiProperty({
    description: 'The page title displayed in the browser and page header',
    example: 'NestJS GOV.UK Frontend',
    required: true,
  })
  title!: string;

  /**
   * The welcome message displayed on the page
   *
   * @example 'Welcome to the NestJS GOV.UK Frontend application'
   */
  @ApiProperty({
    description: 'The welcome message displayed on the page',
    example: 'Welcome to the NestJS GOV.UK Frontend application',
    required: true,
  })
  message!: string;
}
