-- CreateTable
CREATE TABLE "Reactboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "react" TEXT NOT NULL,
    "isCustomReact" BOOLEAN NOT NULL,
    "threshold" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ReactboardPost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reactboardId" INTEGER NOT NULL,
    "originalMessageId" TEXT NOT NULL,
    "originalChannelId" TEXT NOT NULL,
    "reactboardMessageId" TEXT NOT NULL,
    CONSTRAINT "ReactboardPost_reactboardId_fkey" FOREIGN KEY ("reactboardId") REFERENCES "Reactboard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scoreboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Buildings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Rooms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "buildingId" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Rooms_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "days" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    CONSTRAINT "Events_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "smitten" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "Reactboard_guildId_channelId_key" ON "Reactboard"("guildId", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_guildId_key" ON "User"("userId", "guildId");
