/*
  Warnings:

  - You are about to drop the `reactboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reactboardPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reactboardPost" DROP CONSTRAINT "reactboardPost_reactboardId_fkey";

-- DropTable
DROP TABLE "reactboard";

-- DropTable
DROP TABLE "reactboardPost";

-- CreateTable
CREATE TABLE "Reactboard" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "react" TEXT NOT NULL,
    "isCustomReact" BOOLEAN NOT NULL,
    "threshold" INTEGER NOT NULL,

    CONSTRAINT "Reactboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReactboardPost" (
    "id" SERIAL NOT NULL,
    "reactboardId" INTEGER NOT NULL,
    "originalMessageId" TEXT NOT NULL,
    "reactboardMessageId" TEXT NOT NULL,

    CONSTRAINT "ReactboardPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reactboard_guildId_channelId_key" ON "Reactboard"("guildId", "channelId");

-- AddForeignKey
ALTER TABLE "ReactboardPost" ADD CONSTRAINT "ReactboardPost_reactboardId_fkey" FOREIGN KEY ("reactboardId") REFERENCES "Reactboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
