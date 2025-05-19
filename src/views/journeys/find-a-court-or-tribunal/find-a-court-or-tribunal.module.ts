import { Module } from '@nestjs/common';
import { FindCourtTribunalController } from './find-a-court-or-tribunal.controller';
import { ViewsModule } from '../../views.module';

@Module({
  imports: [ViewsModule],
  controllers: [FindCourtTribunalController],
})
export class FindCourtTribunalModule {}
