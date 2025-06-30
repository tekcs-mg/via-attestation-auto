// Fichier: src/app/api/attestations/import/route.ts

import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";import Papa from 'papaparse';

const prisma = new PrismaClient();

// Fonction utilitaire pour parser les dates au format JJ/MM/AAAA
function parseDate(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') return new Date('Invalid Date');
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        // parts[2] = Année, parts[1] = Mois, parts[0] = Jour
        // Le mois en JS est 0-indexé, d'où la soustraction de 1
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    // Si un autre format est utilisé (ex: AAAA-MM-JJ), on le laisse être parsé directement
    return new Date(dateStr);
}


export async function POST(request: NextRequest) {
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

        // --- NOUVELLE LOGIQUE DE TRAITEMENT ---
        
        // 1. Extraire tous les numéros de feuillet et les noms d'agences du CSV
        const allNumFeuillets = parseResult.data.map((row: any) => Number(row["N° Feuillet"])).filter(n => !isNaN(n));
        const agenceNames = [...new Set(parseResult.data.map((row: any) => row["Agence"]?.trim()).filter(Boolean))];

        // 2. Récupérer les agences correspondantes depuis la base de données en une seule requête
        const agencesInDb = await prisma.agence.findMany({
            where: { nom: { in: agenceNames } },
            select: { id: true, nom: true }
        });
        const agenceMap = new Map(agencesInDb.map(a => [a.nom, a.id]));

        // 3. Préparer les données pour l'insertion
        const attestationsToCreate = parseResult.data.map((row: any) => {
            const agenceNom = row["Agence"]?.trim();
            if (!row["N° Feuillet"] || !row["N° Police"] || !row["Souscripteur"] || !agenceNom) {
                throw new Error(`Ligne invalide : ${JSON.stringify(row)}. Champs requis manquants (N° Feuillet, N° Police, Souscripteur, Agence).`);
            }
            
            const agenceId = agenceMap.get(agenceNom);
            if (!agenceId) {
                throw new Error(`L'agence "${agenceNom}" spécifiée dans le CSV n'a pas été trouvée dans la base de données.`);
            }

            const dateEffet = parseDate(row["Date d'Effet"]);
            const dateEcheance = parseDate(row["Date d'Echéance"]);

            if (isNaN(dateEffet.getTime()) || isNaN(dateEcheance.getTime())) {
                throw new Error(`Format de date invalide pour la ligne : ${JSON.stringify(row)}`);
            }

            return {
                numFeuillet: Number(row["N° Feuillet"]),
                numeroPolice: row["N° Police"],
                souscripteur: row["Souscripteur"],
                immatriculation: row["Immatriculation"] || '',
                dateEffet: dateEffet,
                dateEcheance: dateEcheance,
                adresse: row["Adresse"] || '',
                usage: row["Usage"] || '',
                marque: row["Marque"] || '',
                nombrePlaces: Number(row["Nombre de Places"] || 0),
                agenceId: agenceId, // Utiliser l'ID de l'agence trouvée
                creatorId: session.user!.id,
            };
        }).filter(item => item.numFeuillet); 

        // 4. Insérer les données en masse
        const result = await prisma.attestationAuto.createMany({
            data: attestationsToCreate,
            skipDuplicates: true, // Ignore les lignes avec un numFeuillet qui existe déjà
        });

        return NextResponse.json({ 
            message: `${result.count} attestations importées avec succès.`,
            count: result.count,
            processedNumFeuillets: allNumFeuillets 
        });

    } catch (error) {
        console.error("Erreur d'import CSV:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return NextResponse.json({ error: "Erreur de doublon : un ou plusieurs N° Feuillet existent déjà." }, { status: 409 });
        }
        return NextResponse.json({ error: "Erreur interne du serveur lors de l'import.", details: (error as Error).message }, { status: 500 });
    }
}
