import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const attestations = await prisma.attestationAuto.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(attestations);
}

// La fonction POST pour créer une nouvelle attestation avec l'incrémentation
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  
    try {
      const body = await request.json();
  
      // On utilise une transaction interactive pour garantir l'intégrité des données
      const newAttestation = await prisma.$transaction(async (tx) => {
        // 1. Trouver l'attestation avec le plus haut numFeuillet
        const lastAttestation = await tx.attestationAuto.findFirst({
          orderBy: {
            numFeuillet: 'desc',
          },
        });
  
        // 2. Déterminer le nouveau numFeuillet
        const newNumFeuillet = lastAttestation ? lastAttestation.numFeuillet + 1 : 1;
  
        // 3. Préparer les données pour la création
        const dataForPrisma = {
          ...body,
          numFeuillet: newNumFeuillet, // On assigne le nouveau numéro
          dateEffet: new Date(body.dateEffet),
          dateEcheance: new Date(body.dateEcheance),
        };
  
        // 4. Créer la nouvelle attestation à l'intérieur de la transaction
        const createdAttestation = await tx.attestationAuto.create({
          data: dataForPrisma,
        });
  
        return createdAttestation;
      });
  
      return NextResponse.json(newAttestation, { status: 201 });
  
    } catch (error) {
      if (error instanceof Error && error.name === 'PrismaClientValidationError') {
         return NextResponse.json({ error: "Erreur de validation des données.", details: error.message }, { status: 400 });
      }
      console.error(error); // Affiche l'erreur complète dans la console du serveur pour le débogage
      return NextResponse.json({ error: "Erreur lors de la création de l'attestation" }, { status: 500 });
    }
  }