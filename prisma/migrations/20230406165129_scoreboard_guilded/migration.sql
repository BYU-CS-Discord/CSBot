/*
  Warnings:

  - Added the required column `guildId` to the `Scoreboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Scoreboard" ADD COLUMN     "guildId" TEXT NOT NULL;
