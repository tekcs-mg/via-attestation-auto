/*
  Warnings:

  - A unique constraint covering the columns `[numFeuillet]` on the table `AttestationAuto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AttestationAuto" ADD COLUMN     "numFeuillet" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "AttestationAuto_numFeuillet_key" ON "AttestationAuto"("numFeuillet");
