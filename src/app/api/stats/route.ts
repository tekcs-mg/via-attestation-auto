// Fichier : src/app/api/stats/route.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { startOfMonth, endOfMonth, subMonths, format, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);
    const startOfCurrentYear = startOfYear(today); // Date de début de l'année

    // --- Calcul de l'activité mensuelle sur les 12 derniers mois ---
    const monthlyActivityPromises = [];
    for (let i = 11; i >= 0; i--) {
        const date = subMonths(today, i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        monthlyActivityPromises.push(
            prisma.attestationAuto.count({
                where: { createdAt: { gte: monthStart, lt: monthEnd } },
            }).then(count => ({
                name: format(monthStart, 'MMM', { locale: fr }),
                créées: count,
            }))
        );
    }

    // --- Logique améliorée pour les attestations à renouveler ---
    const expiringSoonCandidates = await prisma.attestationAuto.findMany({
        where: {
            dateEcheance: {
                gte: today,
                lt: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // Dans 30 jours
            }
        },
        orderBy: { dateEcheance: 'asc' }
    });
    
    let trulyExpiringSoon: { id: string; numFeuillet: number; numeroPolice: string; agent: string; telephoneAgent: string; souscripteur: string; adresse: string; dateEffet: Date; dateEcheance: Date; usage: string; marque: string; nombrePlaces: number; immatriculation: string; dateEdition: Date; createdAt: Date; updatedAt: Date; }[] = [];
    if (expiringSoonCandidates.length > 0) {
        const immatriculations = [...new Set(expiringSoonCandidates.map(a => a.immatriculation))];
        const latestAttestationsForVehicles = await prisma.attestationAuto.groupBy({
            by: ['immatriculation'],
            _max: { dateEcheance: true },
            where: { immatriculation: { in: immatriculations } }
        });

        const latestMap = new Map(latestAttestationsForVehicles.map(item => [item.immatriculation, item._max.dateEcheance]));
        
        trulyExpiringSoon = expiringSoonCandidates.filter(att => {
            const latestEcheance = latestMap.get(att.immatriculation);
            return latestEcheance && new Date(att.dateEcheance).getTime() === new Date(latestEcheance).getTime();
        });
    }


    // --- Requêtes pour les autres statistiques ---
    const [
      totalAttestations, 
      activeAttestations, 
      createdThisMonth,
      createdThisYear, // Nouvelle statistique
      brandDistribution,
      usageDistribution,
      monthlyActivity
    ] = await Promise.all([
      prisma.attestationAuto.count(),
      prisma.attestationAuto.count({ where: { dateEcheance: { gte: today } } }),
      prisma.attestationAuto.count({ where: { createdAt: { gte: startOfCurrentMonth, lt: endOfCurrentMonth } } }),
      prisma.attestationAuto.count({ where: { createdAt: { gte: startOfCurrentYear } } }), // Calcul pour l'année
      prisma.attestationAuto.groupBy({ by: ['marque'], _count: { marque: true }, orderBy: { _count: { marque: 'desc' } }, take: 5 }),
      prisma.attestationAuto.groupBy({ by: ['usage'], _count: { usage: true }, orderBy: { _count: { usage: 'desc' } }, take: 5 }),
      Promise.all(monthlyActivityPromises),
    ]);

    const formattedBrandData = brandDistribution.map(item => ({ name: item.marque, value: item._count.marque }));
    const formattedUsageData = usageDistribution.map(item => ({ name: item.usage, value: item._count.usage }));

    return NextResponse.json({
      totalAttestations,
      activeAttestations,
      createdThisMonth,
      createdThisYear, // Ajout au retour JSON
      brandDistribution: formattedBrandData,
      usageDistribution: formattedUsageData,
      expiringSoon: trulyExpiringSoon, // On retourne la liste filtrée
      monthlyActivity,
    });

  } catch (error) {
     console.error("Erreur dans GET /api/stats:", error); 
     return NextResponse.json({ error: "Erreur interne du serveur lors de la récupération des statistiques." }, { status: 500 });
  }
}
