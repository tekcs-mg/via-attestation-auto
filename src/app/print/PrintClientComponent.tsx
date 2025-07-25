// // src/app/print/PrintClientComponent.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import AttestationPreview from '@/components/AttestationPreview';

// // Le type complet de l'attestation, incluant les relations
// type Attestation = {
//   id: string;
//   numFeuillet: number;
//   numeroPolice: string;
//   souscripteur: string;
//   immatriculation: string;
//   dateEffet: string;
//   dateEcheance: string;
//   adresse: string;
//   usage: string;
//   marque: string;
//   nombrePlaces: number;
//   dateEdition: string;
//   agence: {
//     nom: string;
//     tel?: string | null;
//   };
// };

// export default function PrintClientComponent() {
//   const searchParams = useSearchParams();
//   const [attestations, setAttestations] = useState<Attestation[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const ids = searchParams.get('ids');
//     if (ids) {
//       const fetchAttestationsForPrint = async () => {
//         try {
//           const res = await fetch(`/api/attestations/for-print?ids=${ids}`);
//           if (res.ok) {
//             const data = await res.json();
//             setAttestations(data);
//           }
//         } catch (error) {
//           console.error("Failed to fetch attestations for printing", error);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchAttestationsForPrint();
//     } else {
//       setLoading(false);
//     }
//   }, [searchParams]);

//   // Déclenche l'impression une fois que les données sont chargées et rendues
//   useEffect(() => {
//     if (!loading && attestations.length > 0) {
//       setTimeout(() => window.print(), 500); // Petit délai pour s'assurer que tout est bien dessiné
//     }
//   }, [loading, attestations]);

//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Chargement du document pour impression...</div>;
//   }

//   if (attestations.length === 0) {
//     return <div className="flex items-center justify-center h-screen">Aucune attestation à imprimer.</div>;
//   }

//   return (
//     <>
//       {/* On mappe chaque attestation pour l'afficher */}
//       {attestations.map((att) => (
//         <div key={att.id} className="page-container">
//           <AttestationPreview attestation={{
//             ...att,
//             agence: {
//               ...att.agence,
//               tel: att.agence.tel ?? undefined
//             },
//             // Assurer la compatibilité avec le composant Preview
//             agent: att.agence.nom,
//             telephoneAgent: att.agence.tel || ''
//           } as any} />
//         </div>
//       ))}
//       <style jsx global>{`
//         @media print {
//           body * {
//             visibility: hidden;
//           }
//           .page-container, .page-container * {
//             visibility: visible;
//           }
//           .page-container {
//             position: absolute;
//             left: 0;
//             top: 0;
//             width: 100%;
//             height: 100%;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//           }
//           @page {
//             size: A4 landscape;
//             margin: 0;
//           }
//         }
//         .page-container {
//           page-break-after: always;
//         }
//       `}</style>
//     </>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
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
  agent: string; // Gardé pour la compatibilité du composant Preview
  telephoneAgent: string; // Gardé pour la compatibilité du composant Preview
  agence: {
    nom: string;
    tel?: string | null;
  };
};

export default function PrintClientComponent() {
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
    return <div className="flex items-center justify-center h-screen">Chargement du document pour impression...</div>;
  }

  if (attestations.length === 0) {
    return <div className="flex items-center justify-center h-screen">Aucune attestation à imprimer.</div>;
  }

  return (
    <>
      {/* On mappe chaque attestation pour l'afficher */}
      {attestations.map((att) => (
        <div key={att.id} className="page-container">
            <AttestationPreview attestation={{
              ...att,
              agence: {
                ...att.agence,
                tel: att.agence.tel ?? undefined
              },
              // Assurer la compatibilité avec le composant Preview
            //   agent: att.agence.nom,
            //   telephoneAgent: att.agence.tel || ''
            }} />
        </div>
      ))}
      {/* --- CSS CORRIGÉ POUR L'IMPRESSION MULTI-PAGE --- */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .page-container {
            page-break-after: always;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .page-container:last-child {
            page-break-after: auto;
          }
        }
        @media screen {
          .page-container {
            margin: 20px auto;
            border: 1px solid #eee;
            box-shadow: 0 0 5px rgba(0,0,0,0.1);
            width: 29.7cm; /* A4 landscape width */
            height: 21cm; /* A4 landscape height */
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}