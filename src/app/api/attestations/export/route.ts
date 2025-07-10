// Fichier: src/app/api/attestations/export/route.ts

import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Papa from 'papaparse';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Non autorisé", { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const idsParam = searchParams.get('ids');

        let whereClause: Prisma.AttestationAutoWhereInput = {};

        // Si des IDs sont fournis, on exporte uniquement la sélection
        if (idsParam) {
            const ids = idsParam.split(',');
            whereClause = {
                id: { in: ids },
            };
        } else {
            // Sinon, on applique les filtres généraux (identiques à la recherche du tableau de bord)
            const search = searchParams.get('search') || '';
            const agenceId = searchParams.get('agenceId');
            const status = searchParams.get('status');
            const dateEffetFrom = searchParams.get('dateEffetFrom');
            const dateEffetTo = searchParams.get('dateEffetTo');
            const dateEcheanceFrom = searchParams.get('dateEcheanceFrom');
            const dateEcheanceTo = searchParams.get('dateEcheanceTo');
            const dateEmissionFrom = searchParams.get('dateEmissionFrom');
            const dateEmissionTo = searchParams.get('dateEmissionTo');

            const andConditions: Prisma.AttestationAutoWhereInput[] = [];

            if (search) {
                const searchNumber = parseInt(search, 10);
                const isNumericSearch = !isNaN(searchNumber);
                andConditions.push({
                    OR: [
                        { numeroPolice: { contains: search, mode: 'insensitive' } },
                        { souscripteur: { contains: search, mode: 'insensitive' } },
                        { immatriculation: { contains: search, mode: 'insensitive' } },
                        ...(isNumericSearch ? [{ numFeuillet: { equals: searchNumber } }] : [])
                    ]
                });
            }
            if (agenceId) andConditions.push({ agenceId });
            if (dateEmissionFrom && dateEmissionTo) andConditions.push({ createdAt: { gte: new Date(dateEmissionFrom), lte: new Date(dateEmissionTo) } });
            if (dateEffetFrom && dateEffetTo) andConditions.push({ dateEffet: { gte: new Date(dateEffetFrom), lte: new Date(dateEffetTo) } });
            if (dateEcheanceFrom && dateEcheanceTo) andConditions.push({ dateEcheance: { gte: new Date(dateEcheanceFrom), lte: new Date(dateEcheanceTo) } });

            if (status && status !== 'ALL') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                if (status === 'ACTIVE') andConditions.push({ dateEcheance: { gte: today } });
                if (status === 'EXPIRED') andConditions.push({ dateEcheance: { lt: today } });
                if (status === 'EXPIRING_SOON') andConditions.push({ dateEcheance: { gte: today, lte: thirtyDaysFromNow } });
            }

            if (andConditions.length > 0) {
                whereClause = { AND: andConditions };
            }
        }

        const attestations = await prisma.attestationAuto.findMany({
            where: whereClause,
            include: { creator: { select: { name: true } }, agence : { select: { nom: true, tel: true } }},
            orderBy: { numFeuillet: 'desc' },
        });

        // Formatage des données pour le fichier CSV
        const dataForCsv = attestations.map(att => ({
            "N° Feuillet": att.numFeuillet,
            "Type de Feuillet": att.typeFeuillet, // CHAMP AJOUTÉ
            "N° Police": att.numeroPolice,
            "Souscripteur": att.souscripteur,
            "Immatriculation": att.immatriculation,
            "Date d'Effet": att.dateEffet.toLocaleDateString('fr-FR'),
            "Date d'Echéance": att.dateEcheance.toLocaleDateString('fr-FR'),
            "Marque": att.marque,
            "Usage": att.usage,
            "Nombre de Places": att.nombrePlaces,
            "Adresse": att.adresse,
            "Créé par": att.creator.name,
            "Agence": att.agence.nom,
            "Tel Agence": att.agence.tel,
            "Date de Création": att.createdAt.toLocaleDateString('fr-FR'),
        }));

        const csv = Papa.unparse(dataForCsv);
        
        // Configuration des en-têtes pour forcer le téléchargement
        const headers = new Headers();
        headers.set('Content-Type', 'text/csv; charset=utf-8');
        headers.set('Content-Disposition', `attachment; filename="export_attestations_${new Date().toISOString().split('T')[0]}.csv"`);

        return new Response(csv, { headers });

    } catch (error) {
        console.error("Erreur lors de la génération de l'export:", error);
        return new Response("Erreur lors de la génération de l'export.", { status: 500 });
    }
}
