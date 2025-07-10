// Fichier: src/app/api/admin/agences/route.ts

import { Prisma } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
// GET: Récupérer toutes les agences
/**
 * GET: Récupère la liste des agences en fonction du rôle de l'utilisateur.
 * - ADMIN: Retourne toutes les agences.
 * - USER: Retourne uniquement l'agence à laquelle l'utilisateur est assigné.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    // Si l'utilisateur est un ADMIN, retourner toutes les agences
    if (session.user.role === 'ADMIN') {
      const agences = await prisma.agence.findMany({
        orderBy: { nom: 'asc' }
      });
      return NextResponse.json(agences);
    }

    // Si c'est un USER, récupérer son profil pour trouver son agence
    if (session.user.role === 'USER') {
      const userWithAgence = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { agence: true } // On ne récupère que l'agence liée
      });

      // Si l'utilisateur a une agence, la retourner dans un tableau
      if (userWithAgence?.agence) {
        return NextResponse.json([userWithAgence.agence]);
      } else {
        // Sinon, retourner un tableau vide
        return NextResponse.json([]);
      }
    }

    // Par défaut, si le rôle n'est ni ADMIN ni USER, refuser l'accès
    return NextResponse.json({ error: "Rôle non autorisé" }, { status: 403 });

  } catch (error) {
    console.error("Erreur lors de la récupération des agences:", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

// POST: Créer une nouvelle agence
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  
  try {
    const body = await request.json();
    const { nom, tel, email, adresse } = body;

    if (!nom) {
      return NextResponse.json({ error: "Le nom de l'agence est requis." }, { status: 400 });
    }

    const newAgence = await prisma.agence.create({
      data: { nom, tel, email, adresse },
    });

    return NextResponse.json(newAgence, { status: 201 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
       return NextResponse.json({ error: "Une agence avec ce nom existe déjà." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur lors de la création de l'agence." }, { status: 500 });
  }
}