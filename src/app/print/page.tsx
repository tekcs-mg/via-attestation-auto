// Fichier: src/app/print/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AttestationPreview from '@/components/AttestationPreview';

// Le type complet de l'attestation, incluant les relations
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
    tel?: string | null;
  };
};

export default function PrintPage() {
  const searchParams = useSearchParams();
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      const fetchAttestationsForPrint = async () => {
        try {
          const res = await fetch(`/api/attestations/for-print?ids=${ids}`);
          if (res.ok) {
            const data = await res.json();
            setAttestations(data);
          }
        } catch (error) {
          console.error("Failed to fetch attestations for printing", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAttestationsForPrint();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Déclenche l'impression une fois que les données sont chargées et rendues
  useEffect(() => {
    if (!loading && attestations.length > 0) {
      setTimeout(() => window.print(), 500); // Petit délai pour s'assurer que tout est bien dessiné
    }
  }, [loading, attestations]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement du document...</div>;
  }

  if (attestations.length === 0) {
    return <div className="flex items-center justify-center h-screen">Aucune attestation à imprimer.</div>;
  }

  return (
    <div>
      {/* On mappe chaque attestation pour l'afficher */}
      {attestations.map((att) => (
        <div key={att.id} className="page-container">
          <AttestationPreview attestation={att as any} />
        </div>
      ))}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .page-container, .page-container * {
            visibility: visible;
          }
          .page-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
        .page-container {
          page-break-after: always;
        }
      `}</style>
    </div>
  );
}
