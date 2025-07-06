// Fichier: src/app/api/admin/agences/[id]/route.ts

import { PrismaClient } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
const prisma = new PrismaClient();

// PUT: Mettre à jour une agence
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    
    try {
        const { id } = params;
        const body = await request.json();

        const updatedAgence = await prisma.agence.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(updatedAgence);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la mise à jour de l'agence." }, { status: 500 });
    }
}

// DELETE: Supprimer une agence
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    try {
        const { id } = params;
        // Ajouter une vérification pour empêcher la suppression si des utilisateurs sont liés
        const usersInAgence = await prisma.user.count({ where: { agenceId: id } });
        if (usersInAgence > 0) {
            return NextResponse.json({ error: "Impossible de supprimer l'agence, des utilisateurs y sont encore assignés." }, { status: 400 });
        }

        await prisma.agence.delete({ where: { id } });
        return NextResponse.json({ message: "Agence supprimée avec succès." }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la suppression de l'agence." }, { status: 500 });
    }
}
