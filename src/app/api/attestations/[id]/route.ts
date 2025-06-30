// Fichier : src/app/api/attestations/[id]/route.ts

import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Fonction pour récupérer une seule attestation par son ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        const { id } = params;
        const attestation = await prisma.attestationAuto.findUnique({
            where: { id },
        });

        if (!attestation) {
            return NextResponse.json({ error: "Attestation non trouvée" }, { status: 404 });
        }
        return NextResponse.json(attestation);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération de l'attestation" }, { status: 500 });
    }
}

// Fonction pour mettre à jour une attestation
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    try {
        const { id } = params;
        const body = await request.json();
        const { numFeuillet, ...dataToUpdate } = body; // On ne peut pas modifier le numFeuillet

        const dataForPrisma = {
            ...dataToUpdate,
            dateEffet: new Date(body.dateEffet),
            dateEcheance: new Date(body.dateEcheance),
        };

        const updatedAttestation = await prisma.attestationAuto.update({
            where: { id },
            data: dataForPrisma,
        });

        return NextResponse.json(updatedAttestation);
    } catch (error) {
        console.error("Erreur dans PUT /api/attestations/[id]:", error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour de l'attestation" }, { status: 500 });
    }
}

// Fonction pour supprimer une attestation
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        const { id } = params;
        await prisma.attestationAuto.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Attestation supprimée avec succès" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la suppression de l'attestation" }, { status: 500 });
    }
}
