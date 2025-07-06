// Fichier: src/app/api/attestations/for-print/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";import Papa from 'papaparse';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Non autorisé", { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const idsParam = searchParams.get('ids');

        if (!idsParam) {
            return NextResponse.json({ error: "Aucun ID d'attestation fourni" }, { status: 400 });
        }
        
        const ids = idsParam.split(',');

        const attestations = await prisma.attestationAuto.findMany({
            where: { id: { in: ids } },
            include: {
                agence: { select: { nom: true, tel: true } },
                creator: { select: { name: true } }
            }
        });

        return NextResponse.json(attestations);

    } catch (error) {
        console.error("Erreur lors de la récupération des attestations pour impression:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération des données." }, { status: 500 });
    }
}
