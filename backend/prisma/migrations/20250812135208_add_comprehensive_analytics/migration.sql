-- AlterTable
ALTER TABLE "visit_aggregates" ADD COLUMN     "uniqueVisitors" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "visit_events" ADD COLUMN     "isBounce" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUnique" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "os" TEXT;

-- CreateTable
CREATE TABLE "traffic_sources" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "source" TEXT NOT NULL,
    "medium" TEXT,
    "campaign" TEXT,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traffic_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_analytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "deviceType" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION,
    "avgDuration" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_analytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "avgTimeOnPage" DOUBLE PRECISION,
    "exitRate" DOUBLE PRECISION,
    "bounceRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interactions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "element" TEXT,
    "value" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_goals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversion_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_events" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "value" DECIMAL(65,30),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversion_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "traffic_sources_date_source_medium_campaign_key" ON "traffic_sources"("date", "source", "medium", "campaign");

-- CreateIndex
CREATE UNIQUE INDEX "device_analytics_date_deviceType_browser_os_key" ON "device_analytics"("date", "deviceType", "browser", "os");

-- CreateIndex
CREATE UNIQUE INDEX "page_analytics_date_path_key" ON "page_analytics"("date", "path");

-- AddForeignKey
ALTER TABLE "conversion_events" ADD CONSTRAINT "conversion_events_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "conversion_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
