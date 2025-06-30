-- DropIndex
DROP INDEX "Agence_code_key";

-- AlterTable
ALTER TABLE "Agence" ALTER COLUMN "code" DROP NOT NULL;
