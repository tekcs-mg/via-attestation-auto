// Fichier: src/components/AttestationPreview.tsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Le type complet pour une attestation
type Attestation = {
  id: string;
  numFeuillet: number;
  numeroPolice: string;
  souscripteur: string;
  immatriculation: string;
  dateEffet: string;
  dateEcheance: string;
  adresse: string;
  usage: string;
  marque: string;
  nombrePlaces: number;
  dateEdition: string;
};

// Ce composant rend le visuel de l'attestation
export default function AttestationPreview({ attestation }: { attestation: Attestation }) {
    return (
        <div className="bg-white p-4 font-sans text-[10px] w-[840px] border border-gray-300 flex">
            {/* Section Gauche (Talon) */}
            <div className="flex-[1.5] border-r border-dashed border-gray-400 pr-4 flex flex-col">
                <div className="mb-2">
                    <div className="font-bold text-black">VIA Assurance Madagascar</div>
                    <div className="text-gray-600 text-xs">Masivolva</div>
                </div>
                <div className="space-y-2 mt-2">
                    <div><span className="text-gray-600 block">Fifanekena N° / Police N°</span><span className="font-bold block text-black">{attestation.numeroPolice}</span></div>
                    <div><span className="text-gray-600 block">Fiara N° / Véhicule N°</span><span className="font-bold block text-black">{attestation.immatriculation}</span></div>
                    <div><span className="text-gray-600 block">Mpaka fiantohana</span><span className="font-bold block text-black">{attestation.souscripteur}</span></div>
                    <div><span className="text-gray-600 block">Manan-kery / Valable du</span><span className="font-bold block text-black">{format(new Date(attestation.dateEffet), 'dd/MM/yyyy')}</span></div>
                    <div><span className="text-gray-600 block">Ka hatramin'ny / Au</span><span className="font-bold block text-black">{format(new Date(attestation.dateEcheance), 'dd/MM/yyyy')}</span></div>
                </div>
                <div className="mt-auto text-xs text-gray-600">
                    <div className="font-bold">Tapakila haverina amin'ny Foibe...</div>
                    <div>Talon à retourner au siège...</div>
                </div>
            </div>

            {/* Sections Centrale & Droite */}
            <div className="flex-[4.5] pl-4 flex">
                {/* Contenu Principal */}
                <div className="flex-[3] flex flex-col">
                    <div className="text-center mb-2">
                        <div className="text-4xl font-bold text-blue-600">VIA</div>
                        <div className="font-bold text-sm text-black">FANAMARINAM-PIANTOHANA</div>
                        <div className="font-bold text-sm text-black">ATTESTATION D'ASSURANCE</div>
                        <div className="text-xs text-black">(Loi N°2020-005 du 02 Juin 2020)</div>
                    </div>
                    <div className="border border-black p-2 space-y-2">
                        <div><span className="text-gray-600 block">Nomeran'ny fifanekena / N° de la police</span><span className="font-bold block text-black">{attestation.numeroPolice}</span></div>
                        <div><span className="text-gray-600 block">Mpaka fiantohana / Souscripteur (Nom et Prénoms)</span><span className="font-bold block text-black">{attestation.souscripteur}</span></div>
                        <div><span className="text-gray-600 block">Fonenana / Adresse</span><span className="font-bold block text-black">{attestation.adresse}</span></div>
                        <div className="flex justify-between items-end">
                            <div><span className="text-gray-600 block">Manan-kery / Valable du</span><span className="font-bold text-black">{format(new Date(attestation.dateEffet), 'dd MMMM yyyy', { locale: fr })}</span></div>
                            <div className="font-bold text-black">0:00</div>
                            <div><span className="text-gray-600 block">ka hatramin'ny / au</span><span className="font-bold text-black">{format(new Date(attestation.dateEcheance), 'dd MMMM yyyy', { locale: fr })}</span></div>
                        </div>
                    </div>
                    <div className="border border-black p-2 mt-2">
                        <div className="text-gray-600">Fiarakodia iantohana / Véhicule Assuré</div>
                        <table className="w-full text-center text-[9px] mt-1 border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-1 text-black">Karazany<br/>Genre</th>
                                    <th className="border border-black p-1 text-black">Anaran'ny karazany<br/>Marque</th>
                                    <th className="border border-black p-1 text-black">Nomerao nanoratana<br/>N° d'immatriculation</th>
                                    <th className="border border-black p-1 text-black">Isan-toerana<br/>Nombre de places</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-1 text-black">{attestation.usage}</td>
                                    <td className="border border-black p-1 text-black">{attestation.marque}</td>
                                    <td className="border border-black p-1 text-black">{attestation.immatriculation}</td>
                                    <td className="border border-black p-1 text-black">{attestation.nombrePlaces}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section Droite */}
                <div className="flex-[1.5] border-l border-dashed border-gray-400 pl-4 flex flex-col text-center">
                    <div className="font-bold text-black">VIA Assurance Madagascar</div>
                    <div className="mt-4 space-y-2">
                        <div><span className="text-gray-600 block">MARQUE :</span><span className="font-bold text-black">{attestation.marque}</span></div>
                        <div><span className="text-gray-600 block">N° IMM :</span><span className="font-bold text-black">{attestation.immatriculation}</span></div>
                        <div><span className="text-gray-600 block">VALIDITE DU :</span><span className="font-bold text-black">{format(new Date(attestation.dateEffet), 'dd/MM/yyyy')}</span></div>
                        <div><span className="text-gray-600 block">AU :</span><span className="font-bold text-black">{format(new Date(attestation.dateEcheance), 'dd/MM/yyyy')}</span></div>
                    </div>
                    <div className="border border-black p-2 mt-4">
                        <div className="text-gray-600">Tapakila apetaka...</div>
                        <div className="font-bold text-black">Volet à apposer...</div>
                    </div>
                    <div className="mt-auto text-xs">
                        <div>Nomena tamin'ny / Délivrée le: {format(new Date(attestation.dateEdition), 'dd/MM/yyyy')}</div>
                        <div className="mt-2">Sonian'ny mpiantoka sy fitomboka...</div>
                    </div>
                    <div className="w-24 h-24 bg-gray-200 mx-auto mt-2 flex items-center justify-center text-gray-500">QR Code</div>
                </div>
            </div>
        </div>
    );
}
