/*
  Warnings:

  - Added the required column `originalChannelId` to the `ReactboardPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReactboardPost" ADD COLUMN     "originalChannelId" TEXT NOT NULL;
