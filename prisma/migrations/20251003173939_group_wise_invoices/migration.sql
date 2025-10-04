-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_userId_idx" ON "group"("userId");

-- CreateIndex
CREATE INDEX "group_parentId_idx" ON "group"("parentId");

-- CreateIndex
CREATE INDEX "invoice_groupId_idx" ON "invoice"("groupId");

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
