/**
 * Module that encapsulates the new journey functionality.
 * This module provides the necessary components for handling the multi-step journey process,
 * including the controller and its dependencies.
 * 
 * The module imports:
 * - ViewsModule: For view rendering capabilities
 * - ConfigModule: For accessing environment configuration
 * 
 * @module NewJourneyModule
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NewJourneyController } from './new-journey.controller';
import { ViewsModule } from '../../views.module';

@Module({
  imports: [
    ViewsModule,  // Required for view rendering
    ConfigModule  // Required for environment configuration
  ],
  controllers: [NewJourneyController],
})
export class NewJourneyModule {} 