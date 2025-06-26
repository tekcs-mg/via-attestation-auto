// Fichier: src/components/CentralAttestation.tsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Type pour les données de l'attestation
type Attestation = {
  numeroPolice: string;
  souscripteur: string;
  immatriculation: string;
  dateEffet: string | Date;
  dateEcheance: string | Date;
  adresse: string;
  usage: string;
  marque: string;
  nombrePlaces: number;
  dateEdition: string | Date;
  agent: string;
  telephoneAgent: string;
};

// Composant utilitaire pour les labels bilingues
const BilingualLabel = ({ malagasy, francais }: { malagasy: string, francais: string }) => (
  <div className="text-[9px] text-blue-900 leading-tight flex-shrink-0">
    <div className="font-bold">{malagasy}</div>
    <div className="font-normal">{francais}</div>
  </div>
);

// Ce composant ne rend que la partie centrale
export default function CentralAttestation({ attestation }: { attestation: Attestation }) {
  return (
    <div className="w-[560px] px-2 py-1 flex flex-col bg-white">
      <div className="text-center">
          <div className="text-[32px] font-bold text-blue-800 leading-none">VIA</div>
          <div className="font-bold text-[11px] text-blue-900">FANAMARINAM-PIANTOHANA</div>
          <div className="font-bold text-[11px] text-blue-900">ATTESTATION D'ASSURANCE</div>
          <div className="text-[9px] text-blue-900">(Loi N°2020-005 du 02 Juin 2020)</div>
      </div>

      <div className="border border-black p-2 mt-1 text-[9px] space-y-2">
          <div className="flex justify-between">
              <div className="flex items-center gap-2 w-full">
                  <BilingualLabel malagasy="Nomeran'ny fifanekena" francais="N° de la police" />
                  <div className="font-bold text-black flex-grow text-center border-b-2 border-sky-200 pb-1">{attestation.numeroPolice}</div>
              </div>
              <div className="text-right flex-shrink-0 pl-4">
                  <div><span className="font-normal text-blue-900">Agent : </span><span className="font-bold text-black">{attestation.agent}</span></div>
                  <div><span className="font-normal text-blue-900">Tél : </span><span className="font-bold text-black">{attestation.telephoneAgent}</span></div>
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
                  <div className="font-bold text-black flex-grow text-center border-b-2 border-sky-200 pb-1">{format(new Date(attestation.dateEffet), 'dd MMMM yyyy', { locale: fr })}</div>
              </div>
              <div className="flex items-end gap-2 flex-grow">
                  <BilingualLabel malagasy="ka hatramin'ny" francais="au" />
                  <div className="font-bold text-black flex-grow text-center border-b-2 border-sky-200 pb-1">{format(new Date(attestation.dateEcheance), 'dd MMMM yyyy', { locale: fr })}</div>
              </div>
          </div>
      </div>

      <div className="flex mt-1 text-[9px] flex-grow border border-black p-2">
          <div className="w-[70%]">
              <BilingualLabel malagasy="Fiarakodia iantohana" francais="Véhicule Assuré" />
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
              <br />
              <div className="text-blue-900 text-left mb-2">
                  <div className="font-bold">Sonian'ny mpiantoka sy fitomboka</div>
                  <div className="font-normal">Pour la société, cachet et signature</div>
              </div>
              <div className="flex-grow"></div>
          </div>
      </div>
    </div>
  );
}
