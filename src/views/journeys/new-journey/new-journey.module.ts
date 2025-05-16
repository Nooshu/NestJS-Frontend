import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NewJourneyController } from './new-journey.controller';
import { ViewsModule } from '../../views.module';

@Module({
  imports: [
    ViewsModule,
    ConfigModule
  ],
  controllers: [NewJourneyController],
})
export class NewJourneyModule {} 