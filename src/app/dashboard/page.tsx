// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from "react";
import { format } from 'date-fns';
import Modal from "@/components/Modal";
import AttestationForm from "@/components/AttestationForm";
import AttestationPreview from "@/components/AttestationPreview";

// Définition du type pour une seule attestation
// Type Attestation mis à jour pour inclure tous les champs nécessaires à l'aperçu
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
  };

// Définition du type pour la configuration du tri
type SortConfig = {
  key: keyof Attestation | 'actions' | null;
  direction: 'asc' | 'desc';
};

// Composant pour les flèches de tri
const SortArrow = ({ direction }: { direction: 'asc' | 'desc' | 'none' }) => {
  if (direction === 'asc') return <span className="ml-1">▲</span>;
  if (direction === 'desc') return <span className="ml-1">▼</span>;
  return null;
};

// Modale de confirmation de suppression
const ConfirmationModal = ({ onConfirm, onCancel, title, message }: { onConfirm: () => void, onCancel: () => void, title: string, message: string }) => (
    <Modal isOpen={true} onClose={onCancel} title={title}>
        <p className="text-black mb-6">{message}</p>
        <div className="flex justify-end gap-4">
            <button onClick={onCancel} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button>
            <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Confirmer</button>
        </div>
    </Modal>
);

// Modale d'Aperçu PDF
// LA MODALE A ÉTÉ MISE À JOUR ICI POUR UTILISER LE COMPOSANT REACT
const PreviewModal = ({ attestation, onClose }: { attestation: Attestation, onClose: () => void }) => (
    <Modal 
        isOpen={true} 
        fitContent={true} // Utilise la prop pour s'adapter au contenu
        onClose={onClose} 
        title={`Aperçu de l'Attestation N° ${attestation.numFeuillet}`}
    >
        {/* Affiche directement le composant d'aperçu */}
        <div className="p-4 bg-gray-200">
             <AttestationPreview attestation={attestation} />
        </div>
    </Modal>
);

export default function DashboardPage() {
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAttestation, setEditingAttestation] = useState<Attestation | null>(null);
  const [deletingAttestation, setDeletingAttestation] = useState<Attestation | null>(null);
  const [pdfPreviewAttestation, setPdfPreviewAttestation] = useState<Attestation | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'numFeuillet', direction: 'desc' });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAttestations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        sortBy: sortConfig.key !== 'actions' ? sortConfig.key || 'numFeuillet' : 'numFeuillet',
        sortOrder: sortConfig.direction,
        search: debouncedSearchQuery,
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

  useEffect(() => {
    fetchAttestations();
  }, [currentPage, itemsPerPage, sortConfig, debouncedSearchQuery]);

  const handleFormSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingAttestation(null);
    fetchAttestations();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAttestation) return;
    try {
        await fetch(`/api/attestations/${deletingAttestation.id}`, { method: 'DELETE' });
        setDeletingAttestation(null);
        fetchAttestations();
    } catch (error) {
        console.error("Failed to delete attestation", error);
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
        <div className="relative w-full max-w-md">
            <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-black"
            />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
        >
          Créer une Attestation
        </button>
      </div>
      
      {loading ? (
        <p className="text-black">Chargement...</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
                <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('numFeuillet')} className="flex items-center">N° Feuillet<SortArrow direction={sortConfig.key === 'numFeuillet' ? sortConfig.direction : 'none'} /></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('numeroPolice')} className="flex items-center">N° Police<SortArrow direction={sortConfig.key === 'numeroPolice' ? sortConfig.direction : 'none'} /></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('souscripteur')} className="flex items-center">Souscripteur<SortArrow direction={sortConfig.key === 'souscripteur' ? sortConfig.direction : 'none'} /></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('immatriculation')} className="flex items-center">Immatriculation<SortArrow direction={sortConfig.key === 'immatriculation' ? sortConfig.direction : 'none'} /></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('dateEffet')} className="flex items-center">Date d'Effet<SortArrow direction={sortConfig.key === 'dateEffet' ? sortConfig.direction : 'none'} /></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Actions</th>
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
                            <td className="px-4 py-3 text-black">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPdfPreviewAttestation(att)} className="p-1 text-gray-600 hover:text-blue-600" title="Afficher l'attestation">📄</button>
                                    <button onClick={() => setEditingAttestation(att)} className="p-1 text-gray-600 hover:text-green-600" title="Éditer">✏️</button>
                                    <button onClick={() => setDeletingAttestation(att)} className="p-1 text-gray-600 hover:text-red-600" title="Supprimer">🗑️</button>
                                </div>
                            </td>
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

      {/* Modale de Création */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Créer une Nouvelle Attestation">
        <AttestationForm onSuccess={handleFormSuccess} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      {/* Modale d'Édition */}
      {editingAttestation && (
          <Modal isOpen={!!editingAttestation} onClose={() => setEditingAttestation(null)} title={`Éditer l'Attestation N° ${editingAttestation.numFeuillet}`}>
            <AttestationForm initialData={editingAttestation} onSuccess={handleFormSuccess} onCancel={() => setEditingAttestation(null)} />
          </Modal>
      )}

      {/* Modale de Suppression */}
      {deletingAttestation && (
        <ConfirmationModal
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingAttestation(null)}
            title="Confirmer la Suppression"
            message={`Êtes-vous sûr de vouloir supprimer l'attestation N° Feuillet ${deletingAttestation.numFeuillet} ? Cette action est irréversible.`}
        />
      )}

      {/* Modale d'Aperçu PDF */}
      {pdfPreviewAttestation && (
        <PreviewModal
            attestation={pdfPreviewAttestation}
            onClose={() => setPdfPreviewAttestation(null)}
        />
      )}
    </div>
  );
}
