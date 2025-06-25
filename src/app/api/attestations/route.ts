import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
const prisma = new PrismaClient();

// Fonction GET avec une gestion d'erreur plus détaillée
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const sortBy = searchParams.get('sortBy') || 'numFeuillet';
      const sortOrder = searchParams.get('sortOrder') || 'desc';
      const search = searchParams.get('search') || '';
  
      const skip = (page - 1) * limit;
  
      let whereClause: Prisma.AttestationAutoWhereInput = {};
      if (search) {
        const searchNumber = parseInt(search, 10);
        const isNumericSearch = !isNaN(searchNumber);
        const orConditions: Prisma.AttestationAutoWhereInput[] = [
            { numeroPolice: { contains: search, mode: 'insensitive' } },
            { souscripteur: { contains: search, mode: 'insensitive' } },
            { immatriculation: { contains: search, mode: 'insensitive' } },
            { marque: { contains: search, mode: 'insensitive' } },
            { usage: { contains: search, mode: 'insensitive' } },
        ];
        if (isNumericSearch) {
            orConditions.push({ numFeuillet: { equals: searchNumber } });
        }
        whereClause = { OR: orConditions };
      }
  
      const [attestations, total] = await prisma.$transaction([
        prisma.attestationAuto.findMany({
          where: whereClause,
          skip: skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.attestationAuto.count({ where: whereClause }),
      ]);
      
      return NextResponse.json({
        data: attestations,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
  
    } catch (error) {
       // Affiche l'erreur complète dans la console du serveur pour un débogage précis
       console.error("Erreur dans GET /api/attestations:", error); 
       return NextResponse.json({ error: "Erreur interne du serveur lors de la récupération des attestations." }, { status: 500 });
    }
  }
  
  // Fonction POST pour créer une attestation
  export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  
    try {
      const body = await request.json();
      const dataForPrisma = {
        ...body,
        numFeuillet: Number(body.numFeuillet),
        dateEffet: new Date(body.dateEffet),
        dateEcheance: new Date(body.dateEcheance),
      };
  
      const newAttestation = await prisma.attestationAuto.create({ data: dataForPrisma });
      return NextResponse.json(newAttestation, { status: 201 });
  
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         return NextResponse.json({ error: `Le N° Feuillet existe déjà.` }, { status: 409 });
      }
      if (error instanceof Error && error.name === 'PrismaClientValidationError') {
         return NextResponse.json({ error: "Erreur de validation des données.", details: error.message }, { status: 400 });
      }
      console.error("Erreur dans POST /api/attestations:", error);
      return NextResponse.json({ error: "Erreur lors de la création de l'attestation" }, { status: 500 });
    }
  }
  