// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from "react";
import { format } from 'date-fns';
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

type SortConfig = {
  key: keyof Attestation | null;
  direction: 'asc' | 'desc';
};

const SortArrow = ({ direction }: { direction: 'asc' | 'desc' | 'none' }) => {
  if (direction === 'asc') return <span className="ml-1">▲</span>;
  if (direction === 'desc') return <span className="ml-1">▼</span>;
  return null;
};

export default function DashboardPage() {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'numFeuillet', direction: 'desc' });

  // Nouveaux états pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Effet pour "débouncing" la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1); // Revenir à la page 1 à chaque nouvelle recherche
    }, 500); // Délai de 500ms

    return () => {
        clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchAttestations = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
          sortBy: sortConfig.key || 'numFeuillet',
          sortOrder: sortConfig.direction,
          search: debouncedSearchQuery, // Utiliser la valeur "débouncée"
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
  }, [currentPage, itemsPerPage, sortConfig, debouncedSearchQuery]); // Ajouter la dépendance


  const handleAttestationCreated = () => {
    setIsModalOpen(false);
    if (currentPage !== 1) setCurrentPage(1);
    else {
        // Forcer le re-fetch
        setDebouncedSearchQuery(prev => prev + ' '); 
        setDebouncedSearchQuery(searchQuery);
    }
  };

  const requestSort = (key: keyof Attestation) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold flex-shrink-0">Tableau de Bord</h1>
        {/* Barre de Recherche */}
        <div className="relative w-full max-w-md">
            <input
                type="text"
                placeholder="Rechercher (N° Feuillet, Police, Souscripteur...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-white"
            />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
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
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('numFeuillet')} className="flex items-center">N° Feuillet<SortArrow direction={sortConfig.key === 'numFeuillet' ? sortConfig.direction : 'none'} /></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('numeroPolice')} className="flex items-center">N° Police<SortArrow direction={sortConfig.key === 'numeroPolice' ? sortConfig.direction : 'none'} /></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('souscripteur')} className="flex items-center">Souscripteur<SortArrow direction={sortConfig.key === 'souscripteur' ? sortConfig.direction : 'none'} /></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('immatriculation')} className="flex items-center">Immatriculation<SortArrow direction={sortConfig.key === 'immatriculation' ? sortConfig.direction : 'none'} /></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('dateEffet')} className="flex items-center">Date d'Effet<SortArrow direction={sortConfig.key === 'dateEffet' ? sortConfig.direction : 'none'} /></button></th>
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
                        <td colSpan={6} className="text-center py-8 text-gray-500">Aucune attestation trouvée.</td>
                    </tr>
                )}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <div><span className="text-sm text-black">Page {currentPage} sur {totalPages}</span></div>
            <div className="flex items-center">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-lg disabled:opacity-50 text-black">Précédent</button>
                <span className="px-4 text-black">{currentPage}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-lg disabled:opacity-50 text-black">Suivant</button>
            </div>
            <div>
              <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1);}} className="border rounded-lg p-1 text-black">
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer une Nouvelle Attestation">
        <AttestationForm onSuccess={handleAttestationCreated} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
