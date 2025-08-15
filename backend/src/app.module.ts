import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";

import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ProjectsModule } from "./projects/projects.module";
import { ServicesModule } from "./services/services.module";
import { SkillsModule } from "./skills/skills.module";
import { TeamModule } from "./team/team.module";
import { TechnologiesModule } from "./technologies/technologies.module";
import { ContactsModule } from "./contacts/contacts.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { PaymentsModule } from "./payments/payments.module";
import { HealthModule } from "./health/health.module";
import { UploadModule } from "./upload/upload.module";
import { UsersModule } from "./users/users.module";
import { AnalyticsModule } from "./analytics/analytics.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore as any,
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        ttl: 300, // 5 minutes
      }),
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ServicesModule,
    SkillsModule,
    TeamModule,
    TechnologiesModule,
    ContactsModule,
    NotificationsModule,
    PaymentsModule,
    AnalyticsModule,
    HealthModule,
    UploadModule,
  ],
})
export class AppModule {}
