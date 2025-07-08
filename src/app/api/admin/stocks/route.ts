// Fichier: src/app/api/admin/stocks/route.ts

import { Prisma, PrismaClient, FeuilletType } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";   

const prisma = new PrismaClient();

/**
 * GET: Récupère les stocks des agences.
 * - ADMIN: Retourne les stocks de toutes les agences.
 * - USER: Retourne uniquement le stock de son agence.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    let whereClause: Prisma.AgenceWhereInput = {};

    // Si l'utilisateur n'est pas ADMIN, on filtre par son agence
    if (session.user.role !== 'ADMIN') {
      const userWithAgence = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { agenceId: true }
      });

      if (userWithAgence?.agenceId) {
        whereClause = { id: userWithAgence.agenceId };
      } else {
        // Un utilisateur sans agence ne voit aucun stock
        return NextResponse.json([]);
      }
    }

    const agences = await prisma.agence.findMany({
      where: whereClause,
      select: {
        id: true,
        nom: true,
        stockFeuilletsJaunes: true,
        stockFeuilletsRouges: true,
        stockFeuilletsVerts: true,
      },
      orderBy: { nom: 'asc' }
    });
    return NextResponse.json(agences);

  } catch (error) {
    console.error("Erreur lors de la récupération des stocks:", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

/**
 * POST: Approvisionne le stock d'une agence (Admin seulement).
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  
  try {
    const { agenceId, type, quantite } = await request.json();
    const quantity = Number(quantite);

    if (!agenceId || !type || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }

    let updateData: Prisma.AgenceUpdateInput = {};
    if (type === FeuilletType.JAUNE) {
      updateData = { stockFeuilletsJaunes: { increment: quantity } };
    } else if (type === FeuilletType.ROUGE) {
      updateData = { stockFeuilletsRouges: { increment: quantity } };
    } else if (type === FeuilletType.VERT) {
      updateData = { stockFeuilletsVerts: { increment: quantity } };
    } else {
      return NextResponse.json({ error: "Type de feuillet inconnu." }, { status: 400 });
    }

    await prisma.agence.update({
      where: { id: agenceId },
      data: updateData,
    });

    return NextResponse.json({ message: "Stock mis à jour avec succès." });

  } catch (error) {
    console.error("Erreur d'approvisionnement:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du stock." }, { status: 500 });
  }
}
