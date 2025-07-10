import { FeuilletType, Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// GET : Gère maintenant les filtres par statut, date, recherche, tri et pagination
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'numFeuillet';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const search = searchParams.get('search') || '';
    const agenceId = searchParams.get('agenceId');
    const status = searchParams.get('status');
    const dateEffetFrom = searchParams.get('dateEffetFrom');
    const dateEffetTo = searchParams.get('dateEffetTo');
    const dateEcheanceFrom = searchParams.get('dateEcheanceFrom');
    const dateEcheanceTo = searchParams.get('dateEcheanceTo');
    const dateEmissionFrom = searchParams.get('dateEmissionFrom');
    const dateEmissionTo = searchParams.get('dateEmissionTo');

    const skip = (page - 1) * limit;

    const andConditions: Prisma.AttestationAutoWhereInput[] = [];

    // --- NOUVELLE LOGIQUE DE FILTRAGE PAR RÔLE ---
    // Si l'utilisateur n'est pas un ADMIN, on force le filtre sur son agence
    if (session.user.role !== 'ADMIN') {
        const userWithAgence = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { agenceId: true }
        });

        // Si l'utilisateur est assigné à une agence, on ajoute cette condition
        if (userWithAgence?.agenceId) {
            andConditions.push({ agenceId: userWithAgence.agenceId });
        } else {
            // Un utilisateur sans agence ne voit aucune attestation
            return NextResponse.json({ data: [], total: 0, page: 1, limit, totalPages: 0 });
        }
    } else {
        // Si c'est un ADMIN, on applique le filtre d'agence de l'interface (s'il y en a un)
        if (agenceId) {
            andConditions.push({ agenceId });
        }
    }
    // --- FIN DE LA NOUVELLE LOGIQUE ---


    // Filtre de recherche globale
    if (search) {
      const searchNumber = parseInt(search, 10);
      const isNumericSearch = !isNaN(searchNumber);
      andConditions.push({
        OR: [
          { numeroPolice: { contains: search, mode: 'insensitive' } },
          { souscripteur: { contains: search, mode: 'insensitive' } },
          { immatriculation: { contains: search, mode: 'insensitive' } },
          { marque: { contains: search, mode: 'insensitive' } },
          { usage: { contains: search, mode: 'insensitive' } },
          ...(isNumericSearch ? [{ numFeuillet: { equals: searchNumber } }] : [])
        ]
      });
    }

    // Filtre par statut
    if (status && status !== 'ALL') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (status === 'ACTIVE') andConditions.push({ dateEcheance: { gte: today } });
        if (status === 'EXPIRED') andConditions.push({ dateEcheance: { lt: today } });
        if (status === 'EXPIRING_SOON') andConditions.push({ dateEcheance: { gte: today, lte: thirtyDaysFromNow } });
    }
    
    // Filtres par plages de dates
    if (dateEmissionFrom && dateEmissionTo) andConditions.push({ createdAt: { gte: new Date(dateEmissionFrom), lte: new Date(dateEmissionTo) } });
    if (dateEffetFrom && dateEffetTo) andConditions.push({ dateEffet: { gte: new Date(dateEffetFrom), lte: new Date(dateEffetTo) } });
    if (dateEcheanceFrom && dateEcheanceTo) andConditions.push({ dateEcheance: { gte: new Date(dateEcheanceFrom), lte: new Date(dateEcheanceTo) } });

    const whereClause: Prisma.AttestationAutoWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const total = await prisma.attestationAuto.count({ where: whereClause });
    const attestations = await prisma.attestationAuto.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { creator: { select: { name: true } }, agence: { select: { nom: true } } },
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const {
        agenceId,
        numFeuillet, numeroPolice, souscripteur, immatriculation, dateEffet, typeFeuillet,
        dateEcheance, adresse, usage, marque, nombrePlaces
    } = body;
    
    if (!agenceId || !numFeuillet || !numeroPolice || !souscripteur || !immatriculation) {
        return NextResponse.json({ error: "Les champs Agence, N° Feuillet, N° Police, Souscripteur et Immatriculation sont requis." }, { status: 400 });
    }

    if (!typeFeuillet) {
        return NextResponse.json({ error: "Le type de feuillet est requis." }, { status: 400 });
    }

    const newAttestation = await prisma.$transaction(async (tx) => {
            // --- NOUVELLE LOGIQUE DE VALIDATION ---
    const newDateEffet = new Date(dateEffet);
    const newDateEcheance = new Date(dateEcheance);

    // 1. Trouver la dernière attestation existante pour cette immatriculation
    const lastExistingAttestation = await prisma.attestationAuto.findFirst({
        where: { immatriculation: immatriculation },
        orderBy: { dateEcheance: 'desc' }
    });

    // 2. Si une attestation existe, vérifier la cohérence des dates
    if (lastExistingAttestation) {
        console.log("DBG: lastExisting ===> ", lastExistingAttestation)
        const lastEcheance = new Date(lastExistingAttestation.dateEcheance);
        console.log("DBG: lastECheance ===> ", lastEcheance)
        if (newDateEffet <= lastEcheance) {
          console.log("DBG: ERREUR MBOLA VALIDE ===> ", (newDateEffet <= lastEcheance))
            throw new Error(`Une attestation pour ce véhicule ${immatriculation} existe déjà et est valide jusqu'au ${lastEcheance.toLocaleDateString('fr-FR')}. La nouvelle date d'effet doit être postérieure.`);

            return NextResponse.json({ 
                error: `Une attestation pour ce véhicule ${immatriculation} existe déjà et est valide jusqu'au ${lastEcheance.toLocaleDateString('fr-FR')}. La nouvelle date d'effet doit être postérieure.` 
            }, { status: 409 }); // 409 Conflict
        }
    }

      // 1. Récupérer l'agence et son stock actuel
      const agence = await tx.agence.findUnique({
        where: { id: agenceId },
        select: { stockFeuilletsJaunes: true, stockFeuilletsRouges: true, stockFeuilletsVerts: true }
      });

      if (!agence) {
        throw new Error("Agence non trouvée.");
      }

      // 2. Vérifier et préparer la décrémentation du stock
      let stockUpdateData: Prisma.AgenceUpdateInput = {};
      if (typeFeuillet === FeuilletType.JAUNE) {
        if (agence.stockFeuilletsJaunes < 1) throw new Error("Stock de feuillets jaunes épuisé pour cette agence.");
        stockUpdateData = { stockFeuilletsJaunes: { decrement: 1 } };
      } else if (typeFeuillet === FeuilletType.ROUGE) {
        if (agence.stockFeuilletsRouges < 1) throw new Error("Stock de feuillets rouges épuisé pour cette agence.");
        stockUpdateData = { stockFeuilletsRouges: { decrement: 1 } };
      } else if (typeFeuillet === FeuilletType.VERT) {
        if (agence.stockFeuilletsVerts < 1) throw new Error("Stock de feuillets verts épuisé pour cette agence.");
        stockUpdateData = { stockFeuilletsVerts: { decrement: 1 } };
      }

      // 3. Mettre à jour le stock de l'agence
      await tx.agence.update({
        where: { id: agenceId },
        data: stockUpdateData
      });

      // 4. Créer l'attestation
      const dataForPrisma = {
        agenceId,
        numFeuillet: Number(numFeuillet),
        typeFeuillet,
        numeroPolice, souscripteur, immatriculation,
        dateEffet: new Date(dateEffet),
        dateEcheance: new Date(dateEcheance),
        adresse, usage, marque,
        nombrePlaces: Number(nombrePlaces),
        creatorId: session.user!.id,
      };
      
      return tx.attestationAuto.create({ data: dataForPrisma });
    });

    return NextResponse.json(newAttestation, { status: 201 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
         return NextResponse.json({ error: `Le N° Feuillet existe déjà.` }, { status: 409 });
      }
      return NextResponse.json({ error: `Erreur de base de données connue: ${error.message}` }, { status: 400 });
    }
    if (error instanceof Error && error.name === 'PrismaClientValidationError') {
       return NextResponse.json({ error: "Erreur de validation des données.", details: error.message }, { status: 400 });
    }
    console.error("Erreur dans POST /api/attestations:", error);
    return NextResponse.json({ error: `Erreur interne du serveur lors de la création. : ${error}` }, { status: 500 });
  }
}