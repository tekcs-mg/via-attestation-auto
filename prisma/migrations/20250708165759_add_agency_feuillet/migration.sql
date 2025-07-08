/*
  Warnings:

  - Added the required column `typeFeuillet` to the `AttestationAuto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FeuilletType" AS ENUM ('JAUNE', 'ROUGE', 'VERT');

-- AlterTable
ALTER TABLE "Agence" ADD COLUMN     "stockFeuilletsJaunes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockFeuilletsRouges" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockFeuilletsVerts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AttestationAuto" ADD COLUMN     "typeFeuillet" "FeuilletType" NOT NULL;
