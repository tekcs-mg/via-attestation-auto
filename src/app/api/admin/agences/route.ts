// Fichier: src/app/api/admin/agences/route.ts

import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
const prisma = new PrismaClient();

// GET: Récupérer toutes les agences
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const agences = await prisma.agence.findMany({
      orderBy: { nom: 'asc' }
    });
    return NextResponse.json(agences);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des agences." }, { status: 500 });
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