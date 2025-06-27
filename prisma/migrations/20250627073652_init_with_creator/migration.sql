/*
  Warnings:

  - Added the required column `creatorId` to the `AttestationAuto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttestationAuto" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "AttestationAuto" ADD CONSTRAINT "AttestationAuto_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
