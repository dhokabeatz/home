-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "browserNotifications" BOOLEAN NOT NULL DEFAULT false,
    "newContactMessages" BOOLEAN NOT NULL DEFAULT true,
    "projectViews" BOOLEAN NOT NULL DEFAULT false,
    "weeklyReports" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "loginAlerts" BOOLEAN NOT NULL DEFAULT true,
    "passwordLastChanged" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeSessions" INTEGER NOT NULL DEFAULT 1,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "contactFormEnabled" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT NOT NULL DEFAULT 'Henry Agyemang - Full Stack Developer',
    "seoDescription" TEXT NOT NULL DEFAULT 'Experienced full-stack developer specializing in React, Node.js, and cloud solutions.',
    "aboutHeading" TEXT NOT NULL DEFAULT 'About Me',
    "aboutSubtitle" TEXT NOT NULL DEFAULT 'Full Stack Developer',
    "aboutParagraph1" TEXT NOT NULL DEFAULT 'Welcome to my portfolio. I am a passionate developer with years of experience.',
    "aboutParagraph2" TEXT NOT NULL DEFAULT 'I create amazing web applications using modern technologies and best practices.',
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "emailUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_settings" ("activeSessions", "analyticsEnabled", "browserNotifications", "contactFormEnabled", "createdAt", "emailNotifications", "emailUrl", "githubUrl", "id", "linkedinUrl", "loginAlerts", "maintenanceMode", "newContactMessages", "passwordLastChanged", "projectViews", "securityAlerts", "seoDescription", "seoTitle", "twitterUrl", "twoFactorEnabled", "updatedAt", "userId", "weeklyReports") SELECT "activeSessions", "analyticsEnabled", "browserNotifications", "contactFormEnabled", "createdAt", "emailNotifications", "emailUrl", "githubUrl", "id", "linkedinUrl", "loginAlerts", "maintenanceMode", "newContactMessages", "passwordLastChanged", "projectViews", "securityAlerts", "seoDescription", "seoTitle", "twitterUrl", "twoFactorEnabled", "updatedAt", "userId", "weeklyReports" FROM "user_settings";
DROP TABLE "user_settings";
ALTER TABLE "new_user_settings" RENAME TO "user_settings";
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
