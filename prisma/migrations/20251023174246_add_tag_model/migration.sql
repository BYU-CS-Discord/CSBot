-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "useCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "Tag_guildId_idx" ON "Tag"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_guildId_name_key" ON "Tag"("guildId", "name");
