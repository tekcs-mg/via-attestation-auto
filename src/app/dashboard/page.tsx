// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from "react";
import { format } from 'date-fns';
// On importe les nouveaux composants
import Modal from "@/components/Modal";
import AttestationForm from "@/components/AttestationForm";

type Attestation = {
  id: string;
  numFeuillet: number;
  numeroPolice: string;
  souscripteur: string;
  immatriculation: string;
  dateEffet: string;
  dateEcheance: string;
};

export default function DashboardPage() {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  // État pour contrôler la visibilité de la modale
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAttestations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/attestations');
      if (res.ok) {
        const data = await res.json();
        setAttestations(data);
      }
    } catch (error) {
      console.error("Failed to fetch attestations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttestations();
  }, []);

  // Fonction appelée lorsque l'attestation est créée avec succès
  const handleAttestationCreated = () => {
    setIsModalOpen(false); // Ferme la modale
    fetchAttestations();  // Rafraîchit la liste des attestations
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tableau de Bord des Attestations</h1>
        {/* Le bouton ouvre maintenant la modale */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Créer une Attestation
        </button>
      </div>
      
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="w-full">
            {/* ... Le tableau reste identique ... */}
            <thead className="border-b">
                <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">N° Feuillet</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">N° Police</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Souscripteur</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Immatriculation</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Date d'Effet</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Date d'Echéance</th>
                </tr>
            </thead>
            <tbody>
                {attestations.length > 0 ? (
                    attestations.map((att) => (
                        <tr key={att.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-black">{`${att.numFeuillet}`.padStart(6, '0')}</td>
                            <td className="px-4 py-3 text-black">{att.numeroPolice}</td>
                            <td className="px-4 py-3 text-black">{att.souscripteur}</td>
                            <td className="px-4 py-3 text-black">{att.immatriculation}</td>
                            <td className="px-4 py-3 text-black">{format(new Date(att.dateEffet), 'dd/MM/yyyy')}</td>
                            <td className="px-4 py-3 text-black">{format(new Date(att.dateEcheance), 'dd/MM/yyyy')}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-8 text-black">Aucune attestation trouvée.</td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
      )}

      {/* Rendu conditionnel de la Modale */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Créer une Nouvelle Attestation"
      >
        <AttestationForm 
          onSuccess={handleAttestationCreated}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
