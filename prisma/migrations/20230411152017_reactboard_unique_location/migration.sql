/*
  Warnings:

  - A unique constraint covering the columns `[guildId,channelId]` on the table `reactboard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reactboard_guildId_channelId_key" ON "reactboard"("guildId", "channelId");
