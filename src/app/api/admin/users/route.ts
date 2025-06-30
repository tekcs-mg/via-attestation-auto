// Fichier : src/app/api/admin/users/route.ts

import { Prisma, PrismaClient, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// GET : Récupérer tous les utilisateurs avec recherche, tri, filtre et pagination
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
  
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const sortBy = searchParams.get('sortBy') || 'name';
      const sortOrder = searchParams.get('sortOrder') || 'asc';
      const search = searchParams.get('search') || '';
      const role = searchParams.get('role') as Role | 'ALL' || 'ALL';
  
      const skip = (page - 1) * limit;
  
      let whereClause: Prisma.UserWhereInput = {};
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (role && role !== 'ALL') {
        whereClause.role = role;
      }
  
      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          where: whereClause,
          skip: skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {agence: {select: {nom: true}}} // Inclure l'agence}
        }),
        prisma.user.count({ where: whereClause }),
      ]);
  
      return NextResponse.json({
        data: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
  
    } catch (error) {
      return NextResponse.json({ error: "Erreur lors de la récupération des utilisateurs." }, { status: 500 });
    }
  }
  
  
  // POST : Créer un nouvel utilisateur
  export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    
    try {
      const { name, email, password, role, agenceId } = await request.json();
  
      if (!name || !email || !password || !role) {
        return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword, role, agenceId },
      });
  
      // On ne retourne pas le mot de passe hashé
      const { password: _, ...userWithoutPassword } = newUser;
      return NextResponse.json(userWithoutPassword, { status: 201 });
  
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà." }, { status: 409 });
      }
      return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur." }, { status: 500 });
    }
  }