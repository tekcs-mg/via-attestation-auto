// Fichier: src/components/AttestationPreview.tsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCodeGenerator from './QRCodeGenerator'; // Importer le nouveau composant

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
  agent: string;
  telephoneAgent: string;
};

// Composant utilitaire pour les labels bilingues pour éviter la répétition
const BilingualLabel = ({ malagasy, francais }: { malagasy: string, francais: string }) => (
  <div className="text-[9px] text-blue-900 leading-tight">
    <div className="font-bold">{malagasy}</div>
    <div className="font-normal">{francais}</div>
  </div>
);

export default function AttestationPreview({ attestation }: { attestation: Attestation }) {
  // Construire l'URL de vérification pour le QR code
  const verificationUrl = `https://via-assurance.mg/verify/${attestation.id}`;

  return (
    <div className="w-[1120px] h-[400px] border border-black flex text-[10px] font-sans bg-white p-1">
      
      {/* Colonne gauche : Talon */}
      <div className="w-[23%] border-r border-dashed border-black px-2 py-1 flex flex-col">
        <div className="font-bold text-blue-900 text-[11px]">VIA Assurance Madagascar</div>
        <div className="text-[9px] mt-2 text-blue-900"><div className="font-bold">Masovohatra</div><div className="font-normal">Agence</div></div>
        <div className="font-bold text-[9px] text-black">{attestation.agent}</div>

        <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <BilingualLabel malagasy="Fifanekena N°" francais="Police N°" />
              <div className="font-bold text-black">{attestation.numeroPolice}</div>
            </div>
            <div className="flex justify-between items-center">
              <BilingualLabel malagasy="Fiara N°" francais="Véhicule N°" />
              <div className="font-bold text-black">{attestation.immatriculation}</div>
            </div>
            <div className="flex justify-between items-center">
              <BilingualLabel malagasy="Mpaka fiantohana" francais="Souscripteur" />
              <div className="font-bold text-black">{attestation.souscripteur}</div>
            </div>
            <div className="flex justify-between items-center">
              <BilingualLabel malagasy="Manan-kery" francais="Valable du" />
              <div className="font-bold text-black">{format(new Date(attestation.dateEffet), 'dd/MM/yyyy')}</div>
            </div>
            <div className="flex justify-between items-center">
              <BilingualLabel malagasy="Ka hatramin'ny" francais="Au" />
              <div className="font-bold text-black">{format(new Date(attestation.dateEcheance), 'dd/MM/yyyy')}</div>
            </div>
        </div>
        
        <div className="mt-auto text-[9px] text-blue-900">
          <div className="font-bold">Tapakila haverina amin'ny Foibe miaraka amin'ny fifanekena vonjimaika na ny fifanekena</div>
          <div className="font-normal">Talon à retourner au siège avec la note de couverture ou la police</div>
        </div>
      </div>

      {/* Colonne centrale : Attestation */}
      <div className="w-[57%] px-2 py-1 flex flex-col">
        <div className="text-center">
          <div className="text-[32px] font-bold text-blue-800 leading-none">VIA</div>
          <div className="font-bold text-[11px]">FANAMARINAM-PIANTOHANA</div>
          <div className="font-bold text-[11px]">ATTESTATION D'ASSURANCE</div>
          <div className="text-[9px]">(Loi N°2020-005 du 02 Juin 2020)</div>
        </div>

        <div className="border border-black p-2 mt-1 text-[9px]">
            <div className="flex justify-between">
                <div>
                  <BilingualLabel malagasy="Nomeran'ny fifanekena" francais="N° de la police" />
                  <div className="font-bold text-black">{attestation.numeroPolice}</div>
                </div>
                <div className="text-right">
                    <div><span className="font-normal text-blue-900">Agent : </span><span className="font-bold text-black">{attestation.agent}</span></div>
                    <div><span className="font-normal text-blue-900">Tél : </span><span className="font-bold text-black">{attestation.telephoneAgent}</span></div>
                </div>
            </div>
            <div className="mt-1">
              <BilingualLabel malagasy="Mpaka fiantohana" francais="Souscripteur (Nom et Prénoms)" />
              <div className="font-bold text-black">{attestation.souscripteur}</div>
            </div>
            <div className="mt-1">
              <BilingualLabel malagasy="Fonenana" francais="Adresse" />
              <div className="font-bold text-black">{attestation.adresse}</div>
            </div>
            <div className="flex justify-between items-end mt-1">
                <div>
                  <BilingualLabel malagasy="Manan-kery" francais="Valable du" />
                  <div className="font-bold text-black">{format(new Date(attestation.dateEffet), 'dd MMMM yyyy', { locale: fr })}</div>
                </div>
                <div className="font-bold text-black text-sm">0:00</div>
                <div>
                  <BilingualLabel malagasy="ka hatramin'ny" francais="au" />
                  <div className="font-bold text-black">{format(new Date(attestation.dateEcheance), 'dd MMMM yyyy', { locale: fr })}</div>
                </div>
            </div>
        </div>

        <div className="flex mt-1 text-[9px] flex-grow">
          <div className="border border-black p-2 w-[70%]">
            <div className="text-blue-900"><span className="font-bold">Fiarakodia iantohana</span> / <span className="font-normal">Véhicule Assuré</span></div>
            <table className="w-full text-center mt-1 border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-1"><BilingualLabel malagasy="Karazany" francais="Genre" /></th>
                  <th className="border border-black p-1"><BilingualLabel malagasy="Anaran'ny karazany" francais="Marque" /></th>
                  <th className="border border-black p-1"><div className="text-[9px] text-blue-900 leading-tight"><div className="font-bold">Nomerao nanoratana azy...</div><div className="font-normal">N° d'immatriculation...</div></div></th>
                  <th className="border border-black p-1"><BilingualLabel malagasy="Isan-toerana" francais="Nombre de places" /></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-1 font-bold text-black">{attestation.usage}</td>
                  <td className="border border-black p-1 font-bold text-black">{attestation.marque}</td>
                  <td className="border border-black p-1 font-bold text-black">{attestation.immatriculation}</td>
                  <td className="border border-black p-1 font-bold text-black">{attestation.nombrePlaces}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-[30%] pl-3 flex flex-col text-left">
            <div className="flex justify-between items-start">
                <BilingualLabel malagasy="Nomena tamin'ny" francais="Délivrée le" />
                <div className="font-bold text-black">{format(new Date(attestation.dateEdition), 'dd/MM/yyyy')}</div>
            </div>
            <br/>
            <div className="text-blue-900 text-left mb-2">
                <div className="font-bold">Sonian'ny mpiantoka sy fitomboka</div>
                <div className="font-normal">Pour la société, cachet et signature</div>
            </div>
              <div className="flex-grow"></div> {/* Espaceur pour pousser le contenu en bas */}
          </div>
        </div>
      </div>

      {/* Colonne droite : Volet à coller */}
      <div className="w-[20%] border-l border-dashed border-black px-2 py-1 flex flex-col">
        {/* --- SECTION MISE À JOUR --- */}
        <div className="text-[10px] text-left">
            <div className="font-bold text-blue-900 text-center">VIA Assurance Madagascar</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between"><span className="font-normal text-blue-900">MARQUE :</span><span className="font-bold text-black">{attestation.marque}</span></div>
              <div className="flex justify-between"><span className="font-normal text-blue-900">N° IMM :</span><span className="font-bold text-black">{attestation.immatriculation}</span></div>
              <div className="flex justify-between"><span className="font-normal text-blue-900">VALIDITE DU :</span><span className="font-bold text-black">{format(new Date(attestation.dateEffet), 'dd/MM/yyyy')}</span></div>
              <div className="flex justify-between"><span className="font-normal text-blue-900">AU :</span><span className="font-bold text-black">{format(new Date(attestation.dateEcheance), 'dd/MM/yyyy')}</span></div>
            </div>
        </div>

        <div className="text-[9px] text-center mt-2 border border-black p-1">
          <div className="text-blue-900 font-bold">Tapakila apetaka eo amin'ny fitaratra alohan'ny fiara</div>
          <div className="text-black font-bold">Volet à apposer sur le pare-brise de votre véhicule</div>
        </div>

        <div className="w-24 h-24 mt-auto mx-auto flex items-center justify-center p-1 bg-white border">
          <QRCodeGenerator url={verificationUrl} size={88} />
        </div>
      </div>
    </div>
  );
}
