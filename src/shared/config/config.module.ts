import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { configurationSchema } from './configuration.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configuration],
      validationSchema: configurationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {} 