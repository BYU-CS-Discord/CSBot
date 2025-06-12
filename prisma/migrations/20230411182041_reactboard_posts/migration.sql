-- CreateTable
CREATE TABLE "reactboardPost" (
    "id" SERIAL NOT NULL,
    "reactboardId" INTEGER NOT NULL,
    "originalMessageId" TEXT NOT NULL,
    "reactboardMessageId" TEXT NOT NULL,

    CONSTRAINT "reactboardPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reactboardPost" ADD CONSTRAINT "reactboardPost_reactboardId_fkey" FOREIGN KEY ("reactboardId") REFERENCES "reactboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
