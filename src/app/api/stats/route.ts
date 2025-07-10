// Fichier : src/app/api/stats/route.ts

import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { startOfMonth, endOfMonth, subMonths, format, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';

import prisma from "@/lib/prisma";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);
    const startOfCurrentYear = startOfYear(today);

    // --- NOUVELLE LOGIQUE DE FILTRAGE PAR RÔLE ---
    let baseWhereClause: Prisma.AttestationAutoWhereInput = {};

    if (session.user.role !== 'ADMIN') {
        const userWithAgence = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { agenceId: true }
        });

        if (userWithAgence?.agenceId) {
            baseWhereClause = { agenceId: userWithAgence.agenceId };
        } else {
            // Si l'utilisateur n'a pas d'agence, il n'a pas de stats
            return NextResponse.json({
                totalAttestations: 0, activeAttestations: 0, createdThisMonth: 0, createdThisYear: 0,
                brandDistribution: [], usageDistribution: [], expiringSoon: [], monthlyActivity: []
            });
        }
    }
    // Pour les ADMINS, baseWhereClause reste un objet vide, donc aucun filtre n'est appliqué.
    // --- FIN DE LA NOUVELLE LOGIQUE ---


    // --- Calcul de l'activité mensuelle sur les 12 derniers mois ---
    const monthlyActivityPromises = [];
    for (let i = 11; i >= 0; i--) {
        const date = subMonths(today, i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        monthlyActivityPromises.push(
            prisma.attestationAuto.count({
                where: { ...baseWhereClause, createdAt: { gte: monthStart, lt: monthEnd } },
            }).then(count => ({
                name: format(monthStart, 'MMM', { locale: fr }),
                créées: count,
            }))
        );
    }

    // --- Logique améliorée pour les attestations à renouveler ---
    const expiringSoonCandidates = await prisma.attestationAuto.findMany({
        where: { 
            ...baseWhereClause,
            dateEcheance: {
                gte: today,
                lt: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
            }
        },
        orderBy: { dateEcheance: 'asc' }
    });
    
    let trulyExpiringSoon: any[] = [];
    if (expiringSoonCandidates.length > 0) {
        const immatriculations = [...new Set(expiringSoonCandidates.map(a => a.immatriculation))];
        const latestAttestationsForVehicles = await prisma.attestationAuto.groupBy({
            by: ['immatriculation'],
            _max: { dateEcheance: true },
            where: { ...baseWhereClause, immatriculation: { in: immatriculations } }
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
      createdThisYear,
      brandDistribution,
      usageDistribution,
      monthlyActivity
    ] = await Promise.all([
      prisma.attestationAuto.count({ where: baseWhereClause }),
      prisma.attestationAuto.count({ where: { ...baseWhereClause, dateEcheance: { gte: today } } }),
      prisma.attestationAuto.count({ where: { ...baseWhereClause, createdAt: { gte: startOfCurrentMonth, lt: endOfCurrentMonth } } }),
      prisma.attestationAuto.count({ where: { ...baseWhereClause, createdAt: { gte: startOfCurrentYear } } }),
      prisma.attestationAuto.groupBy({ by: ['marque'], _count: { marque: true }, where: baseWhereClause, orderBy: { _count: { marque: 'desc' } }, take: 5 }),
      prisma.attestationAuto.groupBy({ by: ['usage'], _count: { usage: true }, where: baseWhereClause, orderBy: { _count: { usage: 'desc' } }, take: 5 }),
      Promise.all(monthlyActivityPromises),
    ]);

    const formattedBrandData = brandDistribution.map(item => ({ name: item.marque, value: item._count.marque }));
    const formattedUsageData = usageDistribution.map(item => ({ name: item.usage, value: item._count.usage }));

    return NextResponse.json({
      totalAttestations,
      activeAttestations,
      createdThisMonth,
      createdThisYear,
      brandDistribution: formattedBrandData,
      usageDistribution: formattedUsageData,
      expiringSoon: trulyExpiringSoon,
      monthlyActivity,
    });

  } catch (error) {
     console.error("Erreur dans GET /api/stats:", error); 
     return NextResponse.json({ error: "Erreur interne du serveur lors de la récupération des statistiques." }, { status: 500 });
  }
}
