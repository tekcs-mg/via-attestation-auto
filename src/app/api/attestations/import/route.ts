// Fichier: src/app/api/attestations/import/route.ts

import { Prisma, PrismaClient, FeuilletType } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Papa from 'papaparse';
import prisma from "@/lib/prisma";

// Fonction utilitaire pour parser les dates au format JJ/MM/AAAA
function parseDate(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') return new Date('Invalid Date');
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        // parts[2] = Année, parts[1] = Mois, parts[0] = Jour
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
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

        const allNumFeuillets = parseResult.data.map((row: any) => Number(row["N° Feuillet"])).filter(n => !isNaN(n));
        const agenceNames = [...new Set(parseResult.data.map((row: any) => row["Agence"]?.trim()).filter(Boolean))];

        const agencesInDb = await prisma.agence.findMany({
            where: { nom: { in: agenceNames } },
        });
        const agenceMap = new Map(agencesInDb.map(a => [a.nom, a]));

        // 1. Calculer les décrémentations nécessaires par agence et par type
        const stockDecrements: { [agenceId: string]: { JAUNE: number, ROUGE: number, VERT: number } } = {};
        
        const attestationsToCreate = parseResult.data.map((row: any) => {
            const agenceNom = row["Agence"]?.trim();
            const typeFeuilletValue = row["Type de Feuillet"]?.trim().toUpperCase() as FeuilletType;

            if (!row["N° Feuillet"] || !row["N° Police"] || !row["Souscripteur"] || !agenceNom || !typeFeuilletValue) {
                throw new Error(`Ligne invalide : ${JSON.stringify(row)}. Champs requis manquants.`);
            }
            if (!Object.values(FeuilletType).includes(typeFeuilletValue)) {
                throw new Error(`Type de feuillet invalide "${row["Type de Feuillet"]}" pour la ligne.`);
            }
            
            const agence = agenceMap.get(agenceNom);
            if (!agence) throw new Error(`L'agence "${agenceNom}" n'a pas été trouvée.`);

            if (!stockDecrements[agence.id]) {
                stockDecrements[agence.id] = { JAUNE: 0, ROUGE: 0, VERT: 0 };
            }
            stockDecrements[agence.id][typeFeuilletValue]++;

            const dateEffet = parseDate(row["Date d'Effet"]);
            const dateEcheance = parseDate(row["Date d'Echéance"]);
            if (isNaN(dateEffet.getTime()) || isNaN(dateEcheance.getTime())) {
                throw new Error(`Format de date invalide pour la ligne : ${JSON.stringify(row)}`);
            }

            return {
                numFeuillet: Number(row["N° Feuillet"]),
                typeFeuillet: typeFeuilletValue,
                numeroPolice: row["N° Police"],
                souscripteur: row["Souscripteur"],
                immatriculation: row["Immatriculation"] || '',
                dateEffet, dateEcheance,
                adresse: row["Adresse"] || '',
                usage: row["Usage"] || '',
                marque: row["Marque"] || '',
                nombrePlaces: Number(row["Nombre de Places"] || 0),
                agenceId: agence.id,
                creatorId: session.user!.id,
            };
        }).filter(item => item.numFeuillet);

        // 2. Vérifier si les stocks sont suffisants
        for (const agenceId in stockDecrements) {
            const agence = agenceMap.get(agencesInDb.find(a => a.id === agenceId)!.nom)!;
            if (agence.stockFeuilletsJaunes < stockDecrements[agenceId].JAUNE) throw new Error(`Stock de feuillets jaunes insuffisant pour l'agence ${agence.nom}.`);
            if (agence.stockFeuilletsRouges < stockDecrements[agenceId].ROUGE) throw new Error(`Stock de feuillets rouges insuffisant pour l'agence ${agence.nom}.`);
            if (agence.stockFeuilletsVerts < stockDecrements[agenceId].VERT) throw new Error(`Stock de feuillets verts insuffisant pour l'agence ${agence.nom}.`);
        }

        // 3. Exécuter la création et la mise à jour des stocks dans une transaction
        const result = await prisma.$transaction(async (tx) => {
            const creationResult = await tx.attestationAuto.createMany({
                data: attestationsToCreate,
                skipDuplicates: true,
            });

            for (const agenceId in stockDecrements) {
                await tx.agence.update({
                    where: { id: agenceId },
                    data: {
                        stockFeuilletsJaunes: { decrement: stockDecrements[agenceId].JAUNE },
                        stockFeuilletsRouges: { decrement: stockDecrements[agenceId].ROUGE },
                        stockFeuilletsVerts: { decrement: stockDecrements[agenceId].VERT },
                    }
                });
            }
            return creationResult;
        });

        return NextResponse.json({ 
            message: `${result.count} attestations importées avec succès.`,
            count: result.count,
            processedNumFeuillets: allNumFeuillets 
        });

    } catch (error) {
        console.error("Erreur d'import CSV:", error);
        return NextResponse.json({ error: "Erreur lors de l'import.", details: (error as Error).message }, { status: 500 });
    }
}
