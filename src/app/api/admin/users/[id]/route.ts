// Fichier : src/app/api/admin/users/[id]/route.ts

import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// PUT : Mettre à jour un utilisateur
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    
    try {
        const { id } = params;
        const { name, email, role, agenceId } = await request.json();

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email, role, agenceId },
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la mise à jour de l'utilisateur." }, { status: 500 });
    }
}

// DELETE : Supprimer un utilisateur
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    try {
        const { id } = params;
        
        // Sécurité : un admin ne peut pas se supprimer lui-même
        if (id === session.user.id) {
            return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
        }

        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ message: "Utilisateur supprimé avec succès." }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la suppression de l'utilisateur." }, { status: 500 });
    }
}