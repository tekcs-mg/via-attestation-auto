// Fichier : src/components/DigitalCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

// Le type des props a été mis à jour pour inclure une image optionnelle
type DigitalCardProps = {
  name: string;
  policyNumber: string;
  expiryDate: string;
  imageUrl?: string; // URL de l'image de l'assuré ou d'une image générique
};

/**
 * Composant pour afficher une carte d'assuré numérique verticale,
 * en accord avec la charte graphique de VIA.
 */
export default function DigitalCard({ name, policyNumber, expiryDate, imageUrl }: DigitalCardProps) {
  return (
    // Conteneur principal mis à jour pour occuper tout l'écran
    <div className="w-screen h-screen bg-white flex flex-col font-sans">
      
      {/* En-tête avec le logo */}
      <div className="flex-shrink-0 h-24 flex items-center justify-center">
        <Image 
            src="/logo/Logo_VIA.png" // Assurez-vous que le chemin est correct
            alt="Logo VIA" 
            width={80} 
            height={30} 
            style={{ objectFit: 'contain' }}
         />
      </div>

      {/* Conteneur principal pour la partie bleue et la photo */}
      <div className="flex-grow relative bg-[#1F308C]">
        {/* Diagonale qui coupe la section bleue */}
        <div 
          className="absolute inset-0 bg-[#1F308C] text-white p-8 flex flex-col"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 85%)' }}
        >
          <p className="text-sm font-light text-blue-200">Insured person</p>
          <h2 className="text-3xl font-bold tracking-wide mt-1">{name}</h2>
          
          <div className="mt-8 space-y-3">
            <div>
              <p className="text-sm font-light text-blue-200">Policy no.</p>
              <p className="font-mono font-semibold tracking-wider text-lg">{policyNumber}</p>
            </div>
            <div>
              <p className="text-sm font-light text-blue-200">Expiry date</p>
              <p className="font-semibold text-lg">{format(new Date(expiryDate), 'dd/MM/yy')}</p>
            </div>
          </div>
        </div>

        {/* Image en bas, sous la diagonale */}
        <div className="absolute bottom-0 left-0 w-full h-2/5">
            <Image
                src={imageUrl || "https://www.via-assurance.mg/wp-content/uploads/2025/05/Valeurs_audace_Via.jpg"}
                alt="Image de l'assuré"
                fill
                style={{ objectFit: 'cover' }}
            />
        </div>
      </div>
    </div>
  );
}

/*
--- EXEMPLE D'UTILISATION ---

Pour que ce composant occupe bien tout l'écran, la page qui l'appelle
ne doit avoir aucun padding ou marge.

import DigitalCard from '@/components/DigitalCard';

export default function PageCarteNumerique() {
  
  return (
    // Le conteneur parent n'a aucun style d'espacement
    <div>
      <DigitalCard 
        name="John Smith"
        policyNumber="VIA1234567890"
        expiryDate="2024-12-31"
        imageUrl="https://images.unsplash.com/photo-1559028006-44a3a99403f4" // Optionnel
      />
    </div>
  );
}

*/
