// Fichier: src/app/api/attestations/import/route.ts

import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";import Papa from 'papaparse';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
        }

        const fileContent = await file.text();

        const parseResult = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
        });

        if (parseResult.errors.length > 0) {
            return NextResponse.json({ error: "Erreur lors de l'analyse du fichier CSV.", details: parseResult.errors }, { status: 400 });
        }

        const attestationsToCreate = parseResult.data.map((row: any) => {
            // Valider et formater chaque ligne du CSV
            if (!row["N° Feuillet"] || !row["N° Police"] || !row["Souscripteur"]) {
                throw new Error(`Ligne invalide : ${JSON.stringify(row)}. Champs requis manquants.`);
            }
            return {
                numFeuillet: Number(row["N° Feuillet"]),
                numeroPolice: row["N° Police"],
                souscripteur: row["Souscripteur"],
                immatriculation: row["Immatriculation"] || '',
                dateEffet: new Date(row["Date d'Effet"]),
                dateEcheance: new Date(row["Date d'Echéance"]),
                adresse: row["Adresse"] || '',
                usage: row["Usage"] || '',
                marque: row["Marque"] || '',
                nombrePlaces: Number(row["Nombre de Places"] || 0),
                agent: row["Agent"] || 'VIA Assurance Madagascar',
                telephoneAgent: row["Téléphone Agent"] || '+261 38 00 842 00',
                creatorId: session.user!.id,
            };
        });

        // Utiliser une transaction pour s'assurer que toutes les lignes sont créées ou aucune ne l'est
        const result = await prisma.attestationAuto.createMany({
            data: attestationsToCreate,
            skipDuplicates: true, // Ignore les lignes avec un numFeuillet qui existe déjà
        });

        return NextResponse.json({ message: `${result.count} attestations importées avec succès.` });

    } catch (error) {
        console.error("Erreur d'import CSV:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: "Erreur de doublon : un ou plusieurs N° Feuillet existent déjà." }, { status: 409 });
        }
        return NextResponse.json({ error: "Erreur interne du serveur lors de l'import.", details: (error as Error).message }, { status: 500 });
    }
}
