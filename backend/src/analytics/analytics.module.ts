import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsCollectionService } from './analytics-collection.service';
import { AnalyticsGateway } from './analytics.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsCollectionService, AnalyticsGateway],
  exports: [AnalyticsService, AnalyticsCollectionService, AnalyticsGateway],
})
export class AnalyticsModule {
  constructor(
    private analyticsCollection: AnalyticsCollectionService,
    private analyticsGateway: AnalyticsGateway,
  ) {
    // Set up circular dependency
    this.analyticsCollection.setAnalyticsGateway(this.analyticsGateway);
  }
}
