// Fichier : src/app/api/attestations/[id]/pdf/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AttestationAuto, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';


const prisma = new PrismaClient();
// --- FONCTION POUR GENERER LE HTML DE L'ATTESTATION ---
function generateAttestationHTML(attestation: AttestationAuto): string {
    const styles = {
        page: `font-family: Arial, sans-serif; font-size: 10px; width: 840px; border: 1px solid #ccc; padding: 10px; display: flex; box-sizing: border-box; margin: 20px auto; background-color: white;`,
        section: `border: 1px solid #000; padding: 5px;`,
        leftSection: `flex: 1.5; border-right: 1px dashed #ccc; padding-right: 10px;`,
        mainSection: `flex: 3; padding: 0 10px;`,
        rightSection: `flex: 1.5; border-left: 1px dashed #ccc; padding-left: 10px; text-align: center;`,
        header: `margin-bottom: 10px;`,
        label: `color: #555; display: block; line-height: 1.4;`,
        value: `font-weight: bold; color: #000; display: block; margin-bottom: 8px; line-height: 1.4;`,
        table: `width: 100%; border-collapse: collapse; margin-top: 10px;`,
        th: `border: 1px solid #000; padding: 4px; text-align: center; background-color: #f0f0f0;`,
        td: `border: 1px solid #000; padding: 4px; text-align: center;`,
        logo: `font-size: 42px; font-weight: bold; color: #007bff; margin-bottom: 10px;`,
        title: `text-align: center; font-weight: bold; font-size: 12px;`
    };

    return `
        <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; background-color: #f0f0f0; }
                </style>
            </head>
            <body>
                <div style="${styles.page}">
                    <div style="${styles.leftSection}">
                        <div style="${styles.header}"><div style="${styles.value}">VIA Assurance Madagascar</div><div style="${styles.label}">Masivolva</div></div>
                        <div><span style="${styles.label}">Fifanekena N° / Police N°</span> <span style="${styles.value}">${attestation.numeroPolice}</span></div>
                        <div><span style="${styles.label}">Fiara N° / Véhicule N°</span> <span style="${styles.value}">${attestation.immatriculation}</span></div>
                        <div><span style="${styles.label}">Mpaka fiantohana</span> <span style="${styles.value}">${attestation.souscripteur}</span></div>
                        <div><span style="${styles.label}">Manan-kery / Valable du</span> <span style="${styles.value}">${format(attestation.dateEffet, 'dd/MM/yyyy')}</span></div>
                        <div><span style="${styles.label}">Ka hatramin'ny / Au</span> <span style="${styles.value}">${format(attestation.dateEcheance, 'dd/MM/yyyy')}</span></div>
                        <div style="margin-top: 20px;"><span style="${styles.label}">Tapakila haverina amin'ny Foibe miaraka amin'ny fifanekena vonjimaika na ny fifanekena</span> <span style="${styles.value}">Talon à retourner au siège avec la note de couverture ou la police</span></div>
                    </div>
                    <div style="${styles.mainSection}">
                         <div style="${styles.title} ${styles.header}"><div style="${styles.logo}">VIA</div><div>FANAMARINAM-PIANTOHANA</div><div>ATTESTATION D'ASSURANCE</div><div style="font-size: 9px; font-weight: normal;">(Loi N°2020-005 du 02 Juin 2020)</div></div>
                         <div style="${styles.section}">
                            <div><span style="${styles.label}">Nomeran'ny fifanekena / N° de la police</span> <span style="${styles.value}">${attestation.numeroPolice}</span></div>
                            <div><span style="${styles.label}">Mpaka fiantohana / Souscripteur (Nom et Prénoms)</span> <span style="${styles.value}">${attestation.souscripteur}</span></div>
                            <div><span style="${styles.label}">Fonenana / Adresse</span> <span style="${styles.value}">${attestation.adresse}</span></div>
                            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                                <div><span style="${styles.label}">Manan-kery / Valable du</span><span style="${styles.value}">${format(attestation.dateEffet, 'dd MMMM yyyy', { locale: fr })}</span></div>
                                <div><span style="${styles.value}">0:00</span></div>
                                <div><span style="${styles.label}">ka hatramin'ny / au</span><span style="${styles.value}">${format(attestation.dateEcheance, 'dd MMMM yyyy', { locale: fr })}</span></div>
                            </div>
                         </div>
                         <div style="${styles.section}; margin-top: 10px;">
                            <div style="${styles.label}">Fiarakodia iantohana / Véhicule Assuré</div>
                            <table style="${styles.table}">
                                <thead>
                                    <tr><th style="${styles.th}">Karazany<br/>Genre</th><th style="${styles.th}">Anaran'ny karazany<br/>Marque</th><th style="${styles.th}">Nomerao nanoratana<br/>N° d'immatriculation</th><th style="${styles.th}">Isan-toerana<br/>Nombre de places</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td style="${styles.td}">${attestation.usage}</td><td style="${styles.td}">${attestation.marque}</td><td style="${styles.td}">${attestation.immatriculation}</td><td style="${styles.td}">${attestation.nombrePlaces}</td></tr>
                                </tbody>
                            </table>
                         </div>
                    </div>
                    <div style="${styles.rightSection}">
                        <div><span style="${styles.label}">VIA Assurance Madagascar</span></div>
                        <div style="margin-top: 15px;"><span style="${styles.label}">MARQUE :</span> <span style="${styles.value}">${attestation.marque}</span></div>
                        <div><span style="${styles.label}">N° IMM :</span> <span style="${styles.value}">${attestation.immatriculation}</span></div>
                        <div><span style="${styles.label}">VALIDITE DU :</span> <span style="${styles.value}">${format(attestation.dateEffet, 'dd/MM/yyyy')}</span></div>
                        <div><span style="${styles.label}">AU :</span> <span style="${styles.value}">${format(attestation.dateEcheance, 'dd/MM/yyyy')}</span></div>
                        <div style="${styles.section}; margin-top: 20px;"><span style="${styles.label}">Tapakila apetaka eo amin'ny fitaratra alohan'ny fiara</span><span style="${styles.value}">Volet à apposer sur le pare brise de votre véhicule</span></div>
                        <div style="flex-grow: 1;"></div>
                        <div style="font-size: 8px; margin-top: 10px;">Nomena tamin'ny / Délivrée le: ${format(attestation.dateEdition, 'dd/MM/yyyy')}</div>
                        <div style="font-size: 8px; margin-top: 5px;">Sonian'ny mpiantoka sy fitomboka<br/>Pour la société, cachet et signature</div>
                    </div>
                </div>
            </body>
        </html>
    `;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Non autorisé", { status: 401 });
    }

    try {
        const { id } = await params;
        const attestation = await prisma.attestationAuto.findUnique({ where: { id } });

        if (!attestation) {
            return new Response("Attestation non trouvée", { status: 404 });
        }

        // On appelle notre fonction pour générer le HTML
        const html = generateAttestationHTML(attestation);

        // On retourne le HTML directement
        return new Response(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
        });

    } catch (error) {
        console.error("Erreur de génération de l'aperçu HTML:", error);
        return new Response("Erreur lors de la génération de l'aperçu.", { status: 500 });
    }
}