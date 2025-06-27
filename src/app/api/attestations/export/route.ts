// Fichier: src/app/api/attestations/export/route.ts

import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Papa from 'papaparse';

const prisma = new PrismaClient();

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
            const dateFrom = searchParams.get('dateFrom');
            const dateTo = searchParams.get('dateTo');
            const status = searchParams.get('status');

            if (search) {
                const searchNumber = parseInt(search, 10);
                const isNumericSearch = !isNaN(searchNumber);
                whereClause.OR = [
                    { numeroPolice: { contains: search, mode: 'insensitive' } },
                    { souscripteur: { contains: search, mode: 'insensitive' } },
                    { immatriculation: { contains: search, mode: 'insensitive' } },
                    // ... autres champs de recherche
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
        }

        const attestations = await prisma.attestationAuto.findMany({
            where: whereClause,
            // include: { creator: { select: { name: true } } },
            orderBy: { numFeuillet: 'desc' },
        });

        // Formatage des données pour le fichier CSV
        const dataForCsv = attestations.map(att => ({
            "N° Feuillet": att.numFeuillet,
            "N° Police": att.numeroPolice,
            "Souscripteur": att.souscripteur,
            "Immatriculation": att.immatriculation,
            "Date d'Effet": att.dateEffet.toLocaleDateString('fr-FR'),
            "Date d'Echéance": att.dateEcheance.toLocaleDateString('fr-FR'),
            "Marque": att.marque,
            "Usage": att.usage,
            "Nombre de Places": att.nombrePlaces,
            "Adresse": att.adresse,
            // "Créé par": att.creator.name,
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
