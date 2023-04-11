-- CreateTable
CREATE TABLE "reactboard" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "react" TEXT NOT NULL,
    "isCustomReact" BOOLEAN NOT NULL,
    "threshold" INTEGER NOT NULL,

    CONSTRAINT "reactboard_pkey" PRIMARY KEY ("id")
);
