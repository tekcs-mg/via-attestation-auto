// Fichier: src/app/api/attestations/print/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, type AttestationAuto } from "@prisma/client";
import puppeteer from 'puppeteer-core';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

import QRCode from 'qrcode';

const prisma = new PrismaClient();

type AttestationWithAgence = AttestationAuto & {
  agence: {
    nom: string;
    email: string;
    tel: string;
    code: string;
  }
};

// --- NOUVELLE FONCTION DE GÉNÉRATION HTML HAUTE FIDÉLITÉ ---
async function generateAttestationHTML(attestation: AttestationWithAgence): Promise<string> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify/${attestation.id}`;
    const logoUrl = `${process.env.NEXT_PUBLIC_URL}/logo/Logo_VIA.png`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 100 });

    const bilingualLabel = (malagasy: string, francais: string) => `
        <div style="font-size: 9px; color: #1e3a8a; line-height: 1.2; flex-shrink: 0;">
            <div style="font-weight: bold;">${malagasy}</div>
            <div style="font-weight: normal;">${francais}</div>
        </div>`;
        
    const attestationContent = `
        <div style="width: 26cm; height: 11cm; border: 1px solid black; display: flex; font-family: sans-serif; font-size: 10px; background-color: white; padding: 4px; box-sizing: border-box;">
            
            <!-- Colonne gauche : Talon -->
            <div style="width: 5.5cm; border-right: 1px dashed black; padding: 8px; display: flex; flex-direction: column;">
                <div style="font-weight: bold; color: #1e3a8a; font-size: 11px;">VIA Assurance Madagascar</div>
                <div style="font-size: 9px; margin-top: 8px; color: #1e3a8a;"><div style="font-weight: bold;">Masoivoho</div><div style="font-weight: normal;">Agence</div></div>
                <div style="font-weight: bold; font-size: 9px; color: black;">${attestation.agence.nom}</div>
                <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">${bilingualLabel("Fifanekena N°", "Police N°")} <div style="font-weight: bold; color: black;">${attestation.numeroPolice}</div></div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">${bilingualLabel("Fiara N°", "Véhicule N°")} <div style="font-weight: bold; color: black;">${attestation.immatriculation}</div></div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">${bilingualLabel("Mpaka fiantohana", "Souscripteur")} <div style="font-weight: bold; color: black;">${attestation.souscripteur}</div></div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">${bilingualLabel("Manan-kery", "Valable du")} <div style="font-weight: bold; color: black;">${format(new Date(attestation.dateEffet), 'dd/MM/yyyy')}</div></div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">${bilingualLabel("Ka hatramin'ny", "Au")} <div style="font-weight: bold; color: black;">${format(new Date(attestation.dateEcheance), 'dd/MM/yyyy')}</div></div>
                </div>
                <div style="margin-top: auto; font-size: 9px; color: #1e3a8a;">
                    <div style="font-weight: bold;">Tapakila haverina amin'ny Foibe miaraka amin'ny fifanekena vonjimaika na ny fifanekena</div>
                    <div style="font-weight: normal;">Talon à retourner au siège avec la note de couverture ou la police</div>
                </div>
            </div>

            <!-- Colonne centrale : Attestation -->
            <div style="width: 15cm; padding: 4px 8px; display: flex; flex-direction: column;">
                <div style="display: flex; width: 100%; align-items: center;">
                    <div style="width: 25%;"><img src='${logoUrl}' alt="logo" style="height: 40px; width: 80px; object-fit: contain;" /></div>
                    <div style="width: 50%; text-align: center;">
                        <div style="font-weight: bold; font-size: 11px; color: #1e3a8a;">FANAMARINAM-PIANTOHANA</div>
                        <div style="font-weight: bold; font-size: 11px; color: #1e3a8a;">ATTESTATION D'ASSURANCE</div>
                        <div style="font-size: 9px; color: #1e3a8a;">(Loi N°2020-005 du 02 Juin 2020)</div>
                    </div>
                    <div style="width: 25%;"></div>
                </div>
                <div style="border: 1px solid black; padding: 8px; margin-top: 20px; margin-bottom: 20px; font-size: 9px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                            ${bilingualLabel("Nomeran'ny fifanekena", "N° de la police")}
                            <div style="font-weight: bold; color: black; flex-grow: 1; text-align: center; border-bottom: 2px solid #bae6fd; padding-bottom: 4px;">${attestation.numeroPolice}</div>
                        </div>
                        <div style="text-align: right; flex-shrink: 0; padding-left: 16px;">
                            <div><span style="font-weight: normal; color: #1e3a8a;">Agence : </span><span style="font-weight: bold; color: black;">${attestation.agence.nom}</span></div>
                            <div><span style="font-weight: normal; color: #1e3a8a;">Tél : </span><span style="font-weight: bold; color: black;">${attestation.agence.tel}</span></div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">${bilingualLabel("Mpaka fiantohana", "Souscripteur (Nom et Prénoms)")}<div style="font-weight: bold; color: black; flex-grow: 1; text-align: center; border-bottom: 2px solid #bae6fd; padding-bottom: 4px;">${attestation.souscripteur}</div></div>
                    <div style="display: flex; align-items: center; gap: 8px;">${bilingualLabel("Fonenana", "Adresse")}<div style="font-weight: bold; color: black; flex-grow: 1; text-align: center; border-bottom: 2px solid #bae6fd; padding-bottom: 4px;">${attestation.adresse}</div></div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 4px;">
                        <div style="display: flex; align-items: flex-end; gap: 8px; flex-grow: 1;">${bilingualLabel("Manan-kery", "Valable du")}<div style="font-weight: bold; color: black; flex-grow: 1; text-align: center; border-bottom: 2px solid #bae6fd; padding-bottom: 4px;">${format(new Date(attestation.dateEffet), 'dd MMMM yyyy', { locale: fr })}</div></div>
                        <div style="display: flex; align-items: flex-end; gap: 8px; flex-grow: 1;">${bilingualLabel("ka hatramin'ny", "au")}<div style="font-weight: bold; color: black; flex-grow: 1; text-align: center; border-bottom: 2px solid #bae6fd; padding-bottom: 4px;">${format(new Date(attestation.dateEcheance), 'dd MMMM yyyy', { locale: fr })}</div></div>
                    </div>
                </div>
                <div style="display: flex; margin-top: 4px; font-size: 9px; flex-grow: 1;">
                    <div style="width: 70%; border: 1px solid black; padding: 8px;">
                        ${bilingualLabel("Fiarakodia iantohana", "Véhicule Assuré")}
                        <table style="width: 100%; text-align: center; margin-top: 4px; border-collapse: collapse;">
                            <thead style="background-color: #f3f4f6;"><tr>
                                <th style="border: 1px solid black; padding: 4px;">${bilingualLabel("Karazany", "Genre")}</th>
                                <th style="border: 1px solid black; padding: 4px;">${bilingualLabel("Anaran'ny karazany", "Marque")}</th>
                                <th style="border: 1px solid black; padding: 4px;"><div style="font-size: 9px; color: #1e3a8a; line-height: 1.2;"><div style="font-weight: bold;">Nomerao nanoratana azy na ny nomeraon'ny motera</div><div style="font-weight: normal;">N° d'immatriculation ou à défaut N° du moteur</div></div></th>
                                <th style="border: 1px solid black; padding: 4px;">${bilingualLabel("Isan-toerana", "Nombre de places")}</th>
                            </tr></thead>
                            <tbody><tr>
                                <td style="border: 1px solid black; padding: 4px; font-weight: bold; color: black; font-size: 9px">${attestation.usage}</td>
                                <td style="border: 1px solid black; padding: 4px; font-weight: bold; color: black; font-size: 9px">${attestation.marque}</td>
                                <td style="border: 1px solid black; padding: 4px; font-weight: bold; color: black; font-size: 9px">${attestation.immatriculation}</td>
                                <td style="border: 1px solid black; padding: 4px; font-weight: bold; color: black; font-size: 9px">${attestation.nombrePlaces}</td>
                            </tr></tbody>
                        </table>
                    </div>
                    <div style="width: 30%; padding-left: 12px; display: flex; flex-direction: column; text-align: left;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">${bilingualLabel("Nomena tamin'ny", "Délivrée le")} <div style="font-weight: bold; color: black;">${format(new Date(attestation.dateEdition), 'dd/MM/yyyy')}</div></div>
                        <br/>
                        <div style="margin-bottom: 8px; color: #1e3a8a; text-align: left;"><div style="font-weight: bold;">Sonian'ny mpiantoka sy fitomboka</div><div style="font-weight: normal;">Pour la société, cachet et signature</div></div>
                        <div style="flex-grow: 1;"></div>
                    </div>
                </div>
            </div>

            <!-- Colonne droite -->
            <div style="width: 5.5cm; border-left: 1px dashed black; display: flex; flex-direction: column;">
                <div style="height: 50%; padding: 8px; display: flex; flex-direction: column;">
                    <div style="font-size: 10px; text-align: left;">
                        <div style="font-weight: bold; color: #1e3a8a; text-align: center;">VIA Assurance Madagascar</div>
                        <div style="margin-top: 8px; display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 8px 8px;">
                            <span style="font-weight: bold; color: #1e3a8a;">MARQUE :</span><div style="font-weight: bold; color: black; text-align: right; border-bottom: 2px solid #bae6fd; padding-bottom: 4px;">${attestation.marque}</div>
                            <span style="font-weight: bold; color: #1e3a8a;">N° IMM :</span><div style="font-weight: bold; color: black; text-align: right; border-bottom: 2px solid #bae6fd; padding-bottom: 4px;">${attestation.immatriculation}</div>
                            <span style="font-weight: bold; color: #1e3a8a;">VALIDITE DU :</span><div style="font-weight: bold; color: black; text-align: right; border-bottom: 2px solid #bae6fd; padding-bottom: 4px;">${format(new Date(attestation.dateEffet), 'dd/MM/yyyy')}</div>
                            <span style="font-weight: bold; color: #1e3a8a;">AU :</span><div style="font-weight: bold; color: black; text-align: right; border-bottom: 2px solid #bae6fd; padding-bottom: 4px;">${format(new Date(attestation.dateEcheance), 'dd/MM/yyyy')}</div>
                        </div>
                    </div>
                    <div style="font-size: 9px; text-align: center; margin-top: auto; padding: 4px; border: 1px solid black;">
                        <div style="color: #1e3a8a; font-weight: bold;">Tapakila apetaka eo amin'ny fitaratra alohan'ny fiara</div>
                        <div style="color: #1e3a8a;">Volet à apposer sur le pare-brise de votre véhicule</div>
                    </div>
                </div>
                <div style="height: 50%; padding-top: 8px; border-top: 1px dashed black; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; padding: 4px; background-color: white; border: 1px solid black;">
                        <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 150px; height: 150px;" />
                    </div>
                </div>
            </div>
        </div>
    `;

    // On enveloppe l'attestation dans un conteneur qui la centrera sur la page
    return `
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; page-break-after: always;">
            ${attestationContent}
        </div>
    `;
}

// Fonction pour trouver le chemin de l'exécutable de Chrome
async function getChromeExecutablePath() {
    if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (process.platform === 'win32') return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    return '/usr/bin/google-chrome-stable';
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Non autorisé", { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const idsParam = searchParams.get('ids');

        if (!idsParam) {
            return new Response("Aucun ID d'attestation fourni", { status: 400 });
        }
        
        const ids = idsParam.split(',');

        const attestations = await prisma.attestationAuto.findMany({
            where: { id: { in: ids } },
            include: {agence: { select: { nom: true, email: true, tel: true, code: true } }}
        });
        console.log("attestations: ", attestations)

        if (attestations.length === 0) {
            return new Response("Aucune attestation trouvée pour les IDs fournis", { status: 404 });
        }

        const htmlPromises = attestations.map(att => generateAttestationHTML(att as AttestationWithAgence));
        const fullHtml = (await Promise.all(htmlPromises)).join('');
        
        const htmlWrapper = `
            <html>
                <head>
                    <style>
                        @media print { 
                            body { -webkit-print-color-adjust: exact; } 
                        }
                        @page { 
                            size: A4 landscape; 
                            margin: 0; 
                        }
                        html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                        }
                    </style>
                </head>
                <body>${fullHtml}</body>
            </html>`;
        
        const browser = await puppeteer.launch({ 
            executablePath: await getChromeExecutablePath(),
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        await page.setContent(htmlWrapper, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            printBackground: true,
            width: '26cm',
            height: '11cm',
            landscape: true,
        });

        await browser.close();

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="impression_attestations.pdf"`
            },
        });

    } catch (error) {
        console.error("Erreur de génération PDF pour impression:", error);
        return new Response("Erreur lors de la génération du PDF.", { status: 500 });
    }
}