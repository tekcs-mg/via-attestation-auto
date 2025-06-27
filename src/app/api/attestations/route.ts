import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
const prisma = new PrismaClient();
// GET : Gère maintenant les filtres par statut, date, recherche, tri et pagination
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'numFeuillet';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    let whereClause: Prisma.AttestationAutoWhereInput = {};

    if (search) {
      const searchNumber = parseInt(search, 10);
      const isNumericSearch = !isNaN(searchNumber);
      whereClause.OR = [
        { numeroPolice: { contains: search, mode: 'insensitive' } },
        { souscripteur: { contains: search, mode: 'insensitive' } },
        { immatriculation: { contains: search, mode: 'insensitive' } },
        { marque: { contains: search, mode: 'insensitive' } },
        { usage: { contains: search, mode: 'insensitive' } },
        ...(isNumericSearch ? [{ numFeuillet: { equals: searchNumber } }] : [])
      ];
    }

    if (dateFrom && dateTo) {
      whereClause.dateEffet = { gte: new Date(dateFrom), lte: new Date(dateTo) };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (status === 'ACTIVE') whereClause.dateEcheance = { gte: today };
    if (status === 'EXPIRED') whereClause.dateEcheance = { lt: today };
    if (status === 'EXPIRING_SOON') {
      whereClause.dateEcheance = { gte: today, lte: thirtyDaysFromNow };
    }

    const total = await prisma.attestationAuto.count({ where: whereClause });
    const attestations = await prisma.attestationAuto.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        // include: { creator: { select: { name: true, email: true } } },
    });
    
    return NextResponse.json({ 
      data: attestations, 
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Erreur dans GET /api/attestations:", error); 
    return NextResponse.json({ error: "Erreur interne du serveur lors de la récupération des attestations." }, { status: 500 });
  }
}

// POST : Logique améliorée avec journalisation pour le débogage
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  console.log("session", session)
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("--- Données reçues par l'API (body) ---");
    console.log(body);

    const {
        numFeuillet, numeroPolice, souscripteur, immatriculation, dateEffet,
        dateEcheance, adresse, usage, marque, nombrePlaces, agent, telephoneAgent
    } = body;
    
    if (!numFeuillet || !numeroPolice || !souscripteur) {
        return NextResponse.json({ error: "Les champs N° Feuillet, N° Police et Souscripteur sont requis." }, { status: 400 });
    }

    const dataForPrisma = {
      numFeuillet: Number(numFeuillet), numeroPolice, souscripteur, immatriculation,
      dateEffet: new Date(dateEffet), dateEcheance: new Date(dateEcheance),
      adresse, usage, marque, nombrePlaces: Number(nombrePlaces),
      agent, telephoneAgent,
      creatorId: session.user.id,
    };

    console.log("--- Données préparées pour Prisma ---");
    console.log(dataForPrisma);

    console.log("Tentative de création dans la base de données...");
    const newAttestation = await prisma.attestationAuto.create({ data: dataForPrisma });
    console.log("✅ Création réussie !");

    return NextResponse.json(newAttestation, { status: 201 });

  } catch (error) {
    console.error("❌ Erreur dans POST /api/attestations:", error); // Log détaillé de l'erreur serveur

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
         return NextResponse.json({ error: `Le N° Feuillet existe déjà.` }, { status: 409 });
      }
      return NextResponse.json({ error: `Erreur de base de données connue: ${error.message}` }, { status: 400 });
    }
    if (error instanceof Error && error.name === 'PrismaClientValidationError') {
       return NextResponse.json({ error: "Erreur de validation des données.", details: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Erreur interne du serveur lors de la création." }, { status: 500 });
  }
}