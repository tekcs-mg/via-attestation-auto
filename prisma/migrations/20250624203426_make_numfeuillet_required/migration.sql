/*
  Warnings:

  - Made the column `numFeuillet` on table `AttestationAuto` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AttestationAuto" ALTER COLUMN "numFeuillet" SET NOT NULL;
