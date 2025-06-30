-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agenceId" TEXT;

-- CreateTable
CREATE TABLE "Agence" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "tel" TEXT,
    "email" TEXT,
    "adresse" TEXT,

    CONSTRAINT "Agence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agence_nom_key" ON "Agence"("nom");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
