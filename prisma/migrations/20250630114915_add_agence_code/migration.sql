/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Agence` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Agence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agence" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Agence_code_key" ON "Agence"("code");
