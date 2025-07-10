// Fichier: src/app/verify/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import CentralAttestation from "@/components/CentralAttestation";
import DigitalCard from "@/components/DigitalCard";

import prisma from "@/lib/prisma";


type VerifyPageProps = {
  params: {
    id: string;
  };
};

// C'est un Server Component, il peut directement accéder à la base de données
export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;

  // Récupérer les données de l'attestation
  const attestation = await prisma.attestationAuto.findUnique({
    where: { id },
    include: {
      agence: true, // Inclure les données de l'agence associée
    },
  });

  // Si l'attestation n'est pas trouvée, afficher un message d'erreur
  if (!attestation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600">Attestation Invalide</h1>
          <p className="text-gray-700 mt-2">L'attestation que vous essayez de vérifier n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  // Si l'attestation est trouvée, afficher la partie centrale
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* <CentralAttestation attestation={{
          ...attestation,
          dateEffet: attestation.dateEffet.toISOString(),
          dateEcheance: attestation.dateEcheance.toISOString(),
          dateEdition: attestation.dateEdition.toISOString(),
          agence: {
            nom: attestation.agence.nom,
            code: attestation.agence.code ?? undefined,
            tel: attestation.agence.tel ?? undefined,
            email: attestation.agence.email ?? undefined,
          }
        }} /> */}
        <DigitalCard name={attestation.souscripteur} policyNumber={attestation.numeroPolice} expiryDate={attestation.dateEcheance.toISOString()}/>
    </div>
  );
}
