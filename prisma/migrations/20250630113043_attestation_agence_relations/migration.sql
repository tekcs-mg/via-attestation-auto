/*
  Warnings:

  - You are about to drop the column `agent` on the `AttestationAuto` table. All the data in the column will be lost.
  - You are about to drop the column `telephoneAgent` on the `AttestationAuto` table. All the data in the column will be lost.
  - Added the required column `agenceId` to the `AttestationAuto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttestationAuto" DROP COLUMN "agent",
DROP COLUMN "telephoneAgent",
ADD COLUMN     "agenceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AttestationAuto" ADD CONSTRAINT "AttestationAuto_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
