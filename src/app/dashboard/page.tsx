// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect, useMemo } from "react";
import { format } from 'date-fns';
import Modal from "@/components/Modal";
import AttestationForm from "@/components/AttestationForm";

// Définition du type pour une seule attestation
type Attestation = {
  id: string;
  numFeuillet: number;
  numeroPolice: string;
  souscripteur: string;
  immatriculation: string;
  dateEffet: string;
  dateEcheance: string;
};

// Définition du type pour la configuration du tri
type SortConfig = {
  key: keyof Attestation | null;
  direction: 'asc' | 'desc';
};

// Composant pour les flèches de tri
const SortArrow = ({ direction }: { direction: 'asc' | 'desc' | 'none' }) => {
  if (direction === 'asc') return <span className="ml-1">▲</span>;
  if (direction === 'desc') return <span className="ml-1">▼</span>;
  return null;
};


export default function DashboardPage() {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Nouveaux états pour la pagination et le tri
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'numFeuillet', direction: 'desc' });

  // La fonction de fetch est maintenant déclenchée par les changements de page, de tri, etc.
  useEffect(() => {
    const fetchAttestations = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
          sortBy: sortConfig.key || 'numFeuillet',
          sortOrder: sortConfig.direction,
        });
        const res = await fetch(`/api/attestations?${params.toString()}`);

        if (res.ok) {
          const { data, totalPages: total } = await res.json();
          setAttestations(data);
          setTotalPages(total);
        }
      } catch (error) {
        console.error("Failed to fetch attestations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttestations();
  }, [currentPage, itemsPerPage, sortConfig]);


  const handleAttestationCreated = () => {
    setIsModalOpen(false);
    // Rafraîchir la première page pour voir la nouvelle entrée
    if (currentPage !== 1) setCurrentPage(1);
    // Sinon, déclencher une re-fetch en changeant une dépendance (ou avoir une fonction fetch dédiée)
    else {
        // Pour forcer le re-fetch si on est déjà sur la page 1
        const tempConfig = {...sortConfig};
        setSortConfig(tempConfig);
    }
  };

  // Fonction pour gérer le clic sur un en-tête de colonne
  const requestSort = (key: keyof Attestation) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Revenir à la première page après un tri
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tableau de Bord des Attestations</h1>
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
            <thead className="border-b">
                <tr>
                    {/* Les en-têtes sont maintenant des boutons */}
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      <button onClick={() => requestSort('numFeuillet')} className="flex items-center">
                        N° Feuillet
                        <SortArrow direction={sortConfig.key === 'numFeuillet' ? sortConfig.direction : 'none'} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      <button onClick={() => requestSort('numeroPolice')} className="flex items-center">
                        N° Police
                        <SortArrow direction={sortConfig.key === 'numeroPolice' ? sortConfig.direction : 'none'} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      <button onClick={() => requestSort('souscripteur')} className="flex items-center">
                        Souscripteur
                        <SortArrow direction={sortConfig.key === 'souscripteur' ? sortConfig.direction : 'none'} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      <button onClick={() => requestSort('immatriculation')} className="flex items-center">
                        Immatriculation
                        <SortArrow direction={sortConfig.key === 'immatriculation' ? sortConfig.direction : 'none'} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-black">
                      <button onClick={() => requestSort('dateEffet')} className="flex items-center">
                        Date d'Effet
                        <SortArrow direction={sortConfig.key === 'dateEffet' ? sortConfig.direction : 'none'} />
                      </button>
                    </th>
                </tr>
            </thead>
            <tbody>
                {attestations.length > 0 ? (
                    attestations.map((att) => (
                        <tr key={att.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-sm text-black">{`${att.numFeuillet}`.padStart(6, '0')}</td>
                            <td className="px-4 py-3 text-black">{att.numeroPolice}</td>
                            <td className="px-4 py-3 text-black">{att.souscripteur}</td>
                            <td className="px-4 py-3 text-black">{att.immatriculation}</td>
                            <td className="px-4 py-3 text-black">{format(new Date(att.dateEffet), 'dd/MM/yyyy')}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500 text-black">Aucune attestation trouvée.</td>
                    </tr>
                )}
            </tbody>
          </table>
          {/* Contrôles de Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div>
                <span className="text-sm text-black">Page {currentPage} sur {totalPages}</span>
            </div>
            <div className="flex items-center">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 text-black"
                >
                  Précédent
                </button>
                <span className="px-4 text-black">{currentPage}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 text-black"
                >
                  Suivant
                </button>
            </div>
            <div>
              <select 
                value={itemsPerPage} 
                onChange={e => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Revenir à la première page
                }}
                className="border rounded-lg p-1 text-black"
              >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
