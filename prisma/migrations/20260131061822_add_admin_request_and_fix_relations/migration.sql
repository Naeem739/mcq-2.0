/*
  Warnings:

  - A unique constraint covering the columns `[siteId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `siteId` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "siteCode" TEXT,
    "siteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Site_code_key" ON "Site"("code");

-- CreateIndex
CREATE INDEX "Admin_siteId_idx" ON "Admin"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRequest_email_key" ON "AdminRequest"("email");

-- CreateIndex
CREATE INDEX "AdminRequest_status_idx" ON "AdminRequest"("status");

-- Insert a default site for existing data
INSERT INTO "Site" ("id", "name", "code", "createdAt", "updatedAt")
VALUES ('default_site', 'Default Site', '000000000000', NOW(), NOW());

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable: Add siteId column with default value first
ALTER TABLE "Quiz" ADD COLUMN "siteId" TEXT DEFAULT 'default_site';
UPDATE "Quiz" SET "siteId" = 'default_site' WHERE "siteId" IS NULL;
ALTER TABLE "Quiz" ALTER COLUMN "siteId" SET NOT NULL;
ALTER TABLE "Quiz" ALTER COLUMN "siteId" DROP DEFAULT;

-- AlterTable: Add siteId column with default value first
ALTER TABLE "User" ADD COLUMN "siteId" TEXT DEFAULT 'default_site';
UPDATE "User" SET "siteId" = 'default_site' WHERE "siteId" IS NULL;
ALTER TABLE "User" ALTER COLUMN "siteId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "siteId" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Quiz_siteId_idx" ON "Quiz"("siteId");

-- CreateIndex
CREATE INDEX "User_siteId_idx" ON "User"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "User_siteId_email_key" ON "User"("siteId", "email");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRequest" ADD CONSTRAINT "AdminRequest_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
