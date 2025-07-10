// Fichier: src/components/AttestationPreview.tsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCodeGenerator from './QRCodeGenerator'; // Importer le nouveau composant
import Image from 'next/image';

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
  agence: {
    nom: string;
    code?: string;
    tel?: string;
    email?: string;
  }
};

// Composant utilitaire pour les labels bilingues pour éviter la répétition
const BilingualLabel = ({ malagasy, francais }: { malagasy: string, francais: string }) => (
  <div className="text-[11px] text-blue-900 leading-tight flex-shrink-0">
    <div className="font-bold">{malagasy}</div>
    <div className="font-normal">{francais}</div>
  </div>
);

export default function AttestationPreview({ attestation }: { attestation: Attestation }) {
  // Construire l'URL de vérification pour le QR code
  const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify/${attestation.id}`;

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  return (
    <div className="w-[28cm] h-[12cm] border border-black flex text-[10px] font-sans bg-white">

      {/* Colonne gauche : Talon */}
      <div className="w-[5.5cm] border-r border-dashed border-black px-2 py-1 flex flex-col">
        <div className="font-bold text-blue-900 text-[13px]">VIA Assurance Madagascar</div>

        <div className="mt-3 space-y-2">
        <div className="flex justify-between items-center">
            <BilingualLabel malagasy="Masoivoho" francais="Agence" />
            <div className="font-bold text-black">{attestation?.agence?.nom || ''}</div>
          </div>
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
            <div className="font-bold text-black">
              {isValidDate(attestation.dateEffet)
                ? format(new Date(attestation.dateEffet), 'dd/MM/yyyy')
                : 'Date invalide'}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <BilingualLabel malagasy="Ka hatramin'ny" francais="Au" />
            <div className="font-bold text-black">{isValidDate(attestation.dateEcheance)
              ? format(new Date(attestation.dateEcheance), 'dd/MM/yyyy')
              : 'Date invalide'}
            </div>
          </div>
        </div>

        <div className="mt-auto text-[11px] text-blue-900 mb-8">
          <div className="font-bold">Tapakila haverina amin'ny Foibe miaraka amin'ny fifanekena vonjimaika na ny fifanekena</div>
          <div className="font-normal">Talon à retourner au siège avec la note de couverture ou la police</div>
        </div>
      </div>

      {/* Colonne centrale : Attestation */}
      <div className="w-[17cm] px-2 py-1 flex flex-col">
        <div className="flex w-full items-center">
          {/* Colonne de gauche pour le logo (prend 1/4 de la largeur) */}
          <div className="w-1/4">
            <Image src={'/logo/Logo_VIA.png'} alt='logo VIA' height={100} width={100} />
          </div>

          {/* Colonne centrale pour le texte (prend la moitié de la largeur) */}
          <div className="w-1/2 text-center">
            <div className="font-bold text-[16px] text-blue-900">FANAMARINAM-PIANTOHANA</div>
            <div className="font-bold text-[16px] text-blue-900">ATTESTATION D'ASSURANCE</div>
            <div className="text-[12px] text-blue-900">(Loi N°2020-005 du 02 Juin 2020)</div>
          </div>

          {/* Colonne de droite, invisible, pour équilibrer (prend 1/4 de la largeur) */}
          <div className="w-1/4"></div>
        </div>

        <div className="p-0 mt-5 mb-5 text-[11px] space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2 w-full">
              <BilingualLabel malagasy="Nomeran'ny fifanekena" francais="N° de la police" />
              <div className="font-bold text-black flex-grow text-center border-b-2 border-sky-200 pb-1">{attestation.numeroPolice}</div>
            </div>
            <div className="text-right flex-shrink-0 pl-4">
              <div><span className="font-normal text-blue-900">Agent : </span><span className="font-bold text-black">{attestation?.agence?.nom || ''}</span></div>
              <div><span className="font-normal text-blue-900">Tél : </span><span className="font-bold text-black">{attestation?.agence?.tel || ''}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BilingualLabel malagasy="Mpaka fiantohana" francais="Souscripteur (Nom et Prénoms)" />
            <div className="font-bold text-black flex-grow text-center border-b-2 border-sky-200 pb-1">{attestation.souscripteur}</div>
          </div>
          <div className="flex items-center gap-2">
            <BilingualLabel malagasy="Fonenana" francais="Adresse" />
            <div className="font-bold text-black flex-grow text-center border-b-2 border-sky-200 pb-1">{attestation.adresse}</div>
          </div>
          <div className="flex justify-between items-end pt-1">
            <div className="flex items-end gap-2 flex-grow">
              <BilingualLabel malagasy="Manan-kery" francais="Valable du" />
              <div className="font-bold text-black flex-grow text-center border-b-2 border-sky-200 pb-1">                {isValidDate(attestation.dateEffet)
                ? format(new Date(attestation.dateEffet), 'dd/MM/yyyy', { locale: fr })
                : 'Date invalide'}</div>
            </div>
            <div className="flex items-end gap-2 flex-grow">
              <BilingualLabel malagasy="ka hatramin'ny" francais="au" />
              <div className="font-bold text-black flex-grow text-center border-b-2 border-sky-200 pb-1">{isValidDate(attestation.dateEcheance)
                ? format(new Date(attestation.dateEcheance), 'dd/MM/yyyy', { locale: fr })
                : 'Date invalide'}</div>
            </div>
          </div>
        </div>


        <BilingualLabel malagasy="Fiarakodia iantohana" francais="Véhicule Assuré" />
        <div className="flex mt-1 text-[11px] flex-grow">
          <div className="w-[70%]">
            <table className="w-full text-center mt-1 border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-1"><BilingualLabel malagasy="Karazany" francais="Genre" /></th>
                  <th className="border border-black p-1"><BilingualLabel malagasy="Anaran'ny karazany (na karazan'ny fiara tarihiny)" francais="Marque (et type pour les remorques et semi remorques)" /></th>
                  <th className="border border-black p-1"><div className="text-[11px] text-blue-900 leading-tight"><div className="font-bold">Nomerao nanoratana azy na ny nomeraon'ny motera</div><div className="font-normal">N° d'immatriculation ou à défaut N° du moteur</div></div></th>
                  <th className="border border-black p-1"><BilingualLabel malagasy="Isan-toerana" francais="Nombre de places" /></th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ height: '50px' }}>
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
            <br />
            <div className="text-blue-900 text-left mb-2">
              <div className="font-bold">Sonian'ny mpiantoka sy fitomboka</div>
              <div className="font-normal">Pour la société, cachet et signature</div>
            </div>
            <div className="flex-grow"></div>
          </div>
        </div>
      </div>

      {/* Colonne droite : Volet à coller */}
      <div className="w-[5.5cm] border-l border-dashed border-black flex flex-col">
        <div className="h-1/2 p-2 flex flex-col">
          <div className="text-[11px] text-left">
            <div className="font-bold text-blue-900 text-[13px]">VIA Assurance Madagascar</div>
            {/* --- SECTION MISE À JOUR --- */}
            <div className="mt-2 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-2">
              <span className="font-bold text-blue-900">MARQUE :</span>
              <div className="font-bold text-black text-end border-b-2 border-sky-200 pb-1">{attestation.marque}</div>

              <span className="font-bold text-blue-900">N° IMM :</span>
              <div className="font-bold text-black text-end border-b-2 border-sky-200 pb-1">{attestation.immatriculation}</div>

              <span className="font-bold text-blue-900">VALIDITE DU :</span>
              <div className="font-bold text-black text-end border-b-2 border-sky-200 pb-1">                {isValidDate(attestation.dateEffet)
                ? format(new Date(attestation.dateEffet), 'dd/MM/yyyy')
                : 'Date invalide'}</div>

              <span className="font-bold text-blue-900">AU :</span>
              <div className="font-bold text-black text-end border-b-2 border-sky-200 pb-1">                {isValidDate(attestation.dateEcheance)
                ? format(new Date(attestation.dateEcheance), 'dd/MM/yyyy')
                : 'Date invalide'}</div>
            </div>
          </div>

          <div className="text-[10px] mt-auto ">
            <div className="text-blue-900 font-bold">Tapakila apetaka eo amin'ny fitaratra alohan'ny fiara</div>
            <div className="text-blue-900">Volet à apposer sur le pare-brise de votre véhicule</div>
          </div>
        </div>

        <div className="h-1/2 pt-2 border-t border-dashed border-black flex items-center justify-center">
          <div className="w-24 h-24 flex items-center justify-center p-1 bg-white border">
            <QRCodeGenerator url={verificationUrl} size={88} />
          </div>
        </div>
      </div>
    </div>
  );
}