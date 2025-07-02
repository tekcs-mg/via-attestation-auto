// Fichier: src/app/dashboard/page.tsx
'use client';
import { useState, useEffect, useCallback } from "react";
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Modal from "@/components/Modal";
import AttestationForm from "@/components/AttestationForm";
import AttestationPreview from "@/components/AttestationPreview";

// --- TYPES ---
type Agence = { id: string; nom: string; };
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
  agence: Agence;
  creator: { name: string | null; };
};
type SortConfig = { key: keyof Attestation | 'actions' | 'status' | 'agence' | null; direction: 'asc' | 'desc'; };

// --- COMPOSANTS INTERNES ---

const StatusPill = ({ dateEcheance }: { dateEcheance: string }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const echeance = new Date(dateEcheance);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    let status: 'Actif' | 'Expire bientôt' | 'Expiré' = 'Actif';
    let bgColor = 'bg-green-100';
    let textColor = 'text-green-800';

    if (echeance < today) {
        status = 'Expiré';
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
    } else if (echeance <= thirtyDaysFromNow) {
        status = 'Expire bientôt';
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
    }

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
            {status}
        </span>
    );
};

const TableSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/12"></div>
                <div className="h-4 bg-gray-200 rounded w-1/12"></div>
                <div className="h-4 bg-gray-200 rounded w-2/12"></div>
                <div className="h-4 bg-gray-200 rounded w-2/12"></div>
                <div className="h-4 bg-gray-200 rounded w-1/12"></div>
                <div className="h-4 bg-gray-200 rounded w-1/12"></div>
                <div className="h-4 bg-gray-200 rounded w-2/12"></div>
            </div>
        ))}
    </div>
);

const ConfirmationModal = ({ onConfirm, onCancel, title, message }: { onConfirm: () => void, onCancel: () => void, title: string, message: string }) => ( <Modal isOpen={true} onClose={onCancel} title={title}> <p className="text-black mb-6">{message}</p> <div className="flex justify-end gap-4"> <button onClick={onCancel} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Annuler</button> <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Confirmer</button> </div> </Modal> );
const PreviewModal = ({ attestation, onClose }: { attestation: Attestation, onClose: () => void }) => ( <Modal isOpen={true} fitContent={true} onClose={onClose} title={`Aperçu de l'Attestation N° ${attestation.numFeuillet}`} > <div className="p-4 bg-gray-200"> <AttestationPreview attestation={attestation} /> </div> </Modal> );
const SortArrow = ({ direction }: { direction: 'asc' | 'desc' | 'none' }) => {
  if (direction === 'asc') return <span className="ml-1">▲</span>;
  if (direction === 'desc') return <span className="ml-1">▼</span>;
  return null;
};

const ImportModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: (message: string, processedNumFeuillets: number[]) => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!file) { setError("Veuillez sélectionner un fichier."); return; }
        setIsImporting(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/attestations/import', { method: 'POST', body: formData });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Une erreur inconnue est survenue.");
            onSuccess(result.message, result.processedNumFeuillets);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Importer des Attestations depuis un CSV">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Sélectionnez un fichier CSV avec les colonnes requises.</p>
                <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">Annuler</button>
                    <button onClick={handleImport} disabled={!file || isImporting} className="bg-[#1f308c] text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">{isImporting ? "Importation..." : "Importer"}</button>
                </div>
            </div>
        </Modal>
    );
};


export default function DashboardPage() {
    const router = useRouter();
    const [attestations, setAttestations] = useState<Attestation[]>([]);
    const [loading, setLoading] = useState(true);
    const [agences, setAgences] = useState<Agence[]>([]);
    const [editingAttestation, setEditingAttestation] = useState<Attestation | null>(null);
    const [deletingAttestation, setDeletingAttestation] = useState<Attestation | null>(null);
    const [previewAttestation, setPreviewAttestation] = useState<Attestation | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'numFeuillet', direction: 'desc' });
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: 'ALL',
        agenceId: '',
        dateEmissionFrom: '', dateEmissionTo: '',
        dateEffetFrom: '', dateEffetTo: '',
        dateEcheanceFrom: '', dateEcheanceTo: ''
    });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.search), 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const fetchAttestations = useCallback(async (selectAfterFetch?: number[]) => {
      setLoading(true);
      if(!selectAfterFetch) setSelectedRows([]);
      try {
          const params = new URLSearchParams({
              page: String(currentPage),
              limit: String(itemsPerPage),
              sortBy: sortConfig.key !== 'actions' && sortConfig.key !== 'status' ? sortConfig.key || 'numFeuillet' : 'numFeuillet',
              sortOrder: sortConfig.direction,
              search: debouncedSearch,
              status: filters.status,
              agenceId: filters.agenceId,
              dateEmissionFrom: filters.dateEmissionFrom, dateEmissionTo: filters.dateEmissionTo,
              dateEffetFrom: filters.dateEffetFrom, dateEffetTo: filters.dateEffetTo,
              dateEcheanceFrom: filters.dateEcheanceFrom, dateEcheanceTo: filters.dateEcheanceTo,
          });
          
          const res = await fetch(`/api/attestations?${params.toString()}`);
          if (res.ok) {
              const { data, totalPages: total } = await res.json();
              setAttestations(data);
              setTotalPages(total);

              if (selectAfterFetch) {
                  const idsToSelect = data.filter((att: Attestation) => selectAfterFetch.includes(att.numFeuillet)).map((att: Attestation) => att.id);
                  setSelectedRows(idsToSelect);
              }
          }
      } catch (error) { console.error("Failed to fetch attestations", error); } 
      finally { setLoading(false); }
    }, [currentPage, itemsPerPage, sortConfig, debouncedSearch, filters]);
  
    useEffect(() => { fetchAttestations(); }, [fetchAttestations]);
    
    useEffect(() => {
        const fetchAgences = async () => {
            const res = await fetch('/api/admin/agencies');
            if (res.ok) setAgences(await res.json());
        };
        fetchAgences();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    };

    const handleFormSuccess = () => { setEditingAttestation(null); fetchAttestations(); };
    const handleDeleteConfirm = async () => { if (!deletingAttestation) return; try { await fetch(`/api/attestations/${deletingAttestation.id}`, { method: 'DELETE' }); setDeletingAttestation(null); fetchAttestations(); } catch (error) { console.error("Failed to delete attestation", error); } };
    const handleRenew = (attestation: Attestation) => { const { id, numFeuillet, creator, ...renewalData } = attestation; const query = new URLSearchParams(renewalData as any).toString(); router.push(`/dashboard/new?${query}`); };
    const handleExport = (all = true) => {
        let params = new URLSearchParams();
        if (all) {
          params = new URLSearchParams({
            ...filters,
            search: debouncedSearch,
            status: filters.status,
          });
        } else {
          params.set('ids', selectedRows.join(','));
        }
        window.location.href = `/api/attestations/export?${params.toString()}`;
      };    const handlePrintSelection = () => { if (selectedRows.length === 0) return; const params = new URLSearchParams({ ids: selectedRows.join(',') }); window.open(`/api/attestations/print?${params.toString()}`, '_blank'); };
    const handleSelectRow = (id: string) => { setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]); };
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedRows(e.target.checked ? attestations.map(att => att.id) : []); };
    const requestSort = (key: keyof Attestation | 'agence') => { let direction: 'asc' | 'desc' = 'asc'; if (sortConfig.key === key && sortConfig.direction === 'asc') { direction = 'desc'; } setSortConfig({ key, direction }); setCurrentPage(1); };
    const isAllSelected = attestations.length > 0 && selectedRows.length === attestations.length;
    const handleImportSuccess = (message: string, processedNumFeuillets: number[]) => { setIsImportModalOpen(false); alert(message); fetchAttestations(processedNumFeuillets); };

    return (
      <div className="p-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1f308c]">Tableau de Bord</h1>
        </div>

        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <input type="text" name="search" placeholder="Rechercher..." value={filters.search} onChange={handleFilterChange} className="w-full max-w-xs p-2 border rounded-lg text-black" />
            <button onClick={() => setShowFilters(!showFilters)} className="p-2 border rounded-lg hover:bg-gray-100 text-black">{showFilters ? 'Masquer les filtres' : 'Filtres avancés'}</button>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 ? ( <> <button onClick={handlePrintSelection} className="p-2 bg-[#1F308C] text-white font-bold rounded-lg hover:bg-blue-800">Imprimer ({selectedRows.length})</button> <button onClick={() => handleExport(false)} className="p-2 bg-[#3DBA94] text-white font-bold rounded-lg hover:bg-green-600">Exporter ({selectedRows.length})</button> </> ) : ( <button onClick={() => handleExport(true)} className="p-2 border rounded-lg hover:bg-gray-100 text-black"> Tout Exporter </button> )}
            <button onClick={() => setIsImportModalOpen(true)} className="p-2 border rounded-lg hover:bg-gray-100 text-black">Importer</button>
            <Link href="/dashboard/new"><button className="bg-[#1F308C] text-white font-bold py-2 px-4 rounded-lg hover:cursor-pointer">Créer</button></Link>
          </div>
        </div>
        
        {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg mb-6">
                <div> 
                    <label className="block text-sm font-medium text-gray-700">Agence</label> 
                    <select name="agenceId" value={filters.agenceId} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-lg text-black"> 
                        <option value="">Toutes les agences</option> 
                        {agences.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)} 
                    </select> 
                </div>
                <div> 
                    <label className="block text-sm font-medium text-gray-700">Statut</label> 
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-lg text-black"> 
                        <option value="ALL">Tous</option> 
                        <option value="ACTIVE">Actifs</option> 
                        <option value="EXPIRING_SOON">Expire bientôt</option> 
                        <option value="EXPIRED">Expirés</option> 
                    </select> 
                </div>
                <div></div> {/* Spacer */}
                <div> 
                    <label className="block text-sm font-medium text-gray-700">Date d'effet</label> 
                    <div className="flex gap-2 mt-1">
                        <input type="date" name="dateEffetFrom" value={filters.dateEffetFrom} onChange={handleFilterChange} className="w-full p-2 border rounded-lg text-black" />
                        <input type="date" name="dateEffetTo" value={filters.dateEffetTo} onChange={handleFilterChange} className="w-full p-2 border rounded-lg text-black" />
                    </div>
                </div>
                <div> 
                    <label className="block text-sm font-medium text-gray-700">Date d'échéance</label> 
                    <div className="flex gap-2 mt-1">
                        <input type="date" name="dateEcheanceFrom" value={filters.dateEcheanceFrom} onChange={handleFilterChange} className="w-full p-2 border rounded-lg text-black" />
                        <input type="date" name="dateEcheanceTo" value={filters.dateEcheanceTo} onChange={handleFilterChange} className="w-full p-2 border rounded-lg text-black" />
                    </div>
                </div>
                <div> 
                    <label className="block text-sm font-medium text-gray-700">Date d'émission</label> 
                    <div className="flex gap-2 mt-1">
                        <input type="date" name="dateEmissionFrom" value={filters.dateEmissionFrom} onChange={handleFilterChange} className="w-full p-2 border rounded-lg text-black" />
                        <input type="date" name="dateEmissionTo" value={filters.dateEmissionTo} onChange={handleFilterChange} className="w-full p-2 border rounded-lg text-black" />
                    </div>
                </div>
            </div>
        )}
        
        {loading ? <TableSkeleton /> : (
          <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full">
                <thead className="border-b">
                    <tr>
                        <th className="px-4 py-3"><input type="checkbox" checked={isAllSelected} ref={input => { if (input) input.indeterminate = selectedRows.length > 0 && !isAllSelected; }} onChange={handleSelectAll} className="form-checkbox h-4 w-4 text-[#1F308C] focus:ring-[#1478FF]" /></th>
                        <th className="px-4 py-3 text-left font-semibold text-black text-sm"><button onClick={() => requestSort('numFeuillet')} className="flex items-center">N° Feuillet<SortArrow direction={sortConfig.key === 'numFeuillet' ? sortConfig.direction : 'none'} /></button></th>
                        <th className="px-4 py-3 text-left font-semibold text-black text-sm"><button onClick={() => requestSort('agence')} className="flex items-center">Agence<SortArrow direction={sortConfig.key === 'agence' ? sortConfig.direction : 'none'} /></button></th>
                        <th className="px-4 py-3 text-left font-semibold text-black text-sm"><button onClick={() => requestSort('numeroPolice')} className="flex items-center">N° Police<SortArrow direction={sortConfig.key === 'numeroPolice' ? sortConfig.direction : 'none'} /></button></th>
                        <th className="px-4 py-3 text-left font-semibold text-black text-sm"><button onClick={() => requestSort('souscripteur')} className="flex items-center">Souscripteur<SortArrow direction={sortConfig.key === 'souscripteur' ? sortConfig.direction : 'none'} /></button></th>
                        <th className="px-4 py-3 text-left font-semibold text-black text-sm"><button onClick={() => requestSort('immatriculation')} className="flex items-center">Immatriculation<SortArrow direction={sortConfig.key === 'immatriculation' ? sortConfig.direction : 'none'} /></button></th>
                        <th className="px-4 py-3 text-left font-semibold text-black text-sm">Statut</th>
                        <th className="px-4 py-3 text-left font-semibold text-black text-sm">Créé par</th>
                        <th className="px-4 py-3 text-left font-semibold text-black text-sm">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {attestations.map((att) => (
                        <tr key={att.id} className={`border-b hover:bg-gray-50 ${selectedRows.includes(att.id) ? 'bg-blue-50' : ''}`}>
                            <td className="px-4 py-3"><input type="checkbox" checked={selectedRows.includes(att.id)} onChange={() => handleSelectRow(att.id)} className="form-checkbox h-4 w-4 text-[#1F308C] focus:ring-[#1478FF]" /></td>
                            <td className="px-4 py-3 font-mono text-sm text-black text-sm">{`${att.numFeuillet}`.padStart(6, '0')}</td>
                            <td className="px-4 py-3 text-black text-sm">{att.agence?.nom || 'N/A'}</td>
                            <td className="px-4 py-3 text-black text-sm">{att.numeroPolice}</td>
                            <td className="px-4 py-3 text-black text-sm">{att.souscripteur}</td>
                            <td className="px-4 py-3 text-black text-sm">{att.immatriculation}</td>
                            <td className="px-4 py-3"><StatusPill dateEcheance={att.dateEcheance} /></td>
                            <td className="px-4 py-3 text-black text-sm">{att.creator?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-black text-sm">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleRenew(att)} title="Renouveler">🔄</button>
                                    <button onClick={() => setPreviewAttestation(att)} title="Afficher">📄</button>
                                    <button onClick={() => setEditingAttestation(att)} title="Éditer">✏️</button>
                                    <button onClick={() => setDeletingAttestation(att)} title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
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
        {editingAttestation && ( <Modal isOpen={!!editingAttestation} onClose={() => setEditingAttestation(null)} title={`Éditer l'Attestation N° ${editingAttestation.numFeuillet}`}> <AttestationForm initialData={editingAttestation} onSuccess={handleFormSuccess} onCancel={() => setEditingAttestation(null)} /> </Modal> )}
        {deletingAttestation && ( <ConfirmationModal onConfirm={handleDeleteConfirm} onCancel={() => setDeletingAttestation(null)} title="Confirmer la Suppression" message={`Êtes-vous sûr de vouloir supprimer l'attestation N° Feuillet ${deletingAttestation.numFeuillet} ?`} /> )}
        {previewAttestation && ( <PreviewModal attestation={previewAttestation} onClose={() => setPreviewAttestation(null)} /> )}
        {isImportModalOpen && (
            <ImportModal 
                onClose={() => setIsImportModalOpen(false)} 
                onSuccess={handleImportSuccess}
            />
        )}
      </div>
    );
}
