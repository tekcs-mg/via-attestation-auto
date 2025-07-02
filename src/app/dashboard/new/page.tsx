// Fichier: src/app/dashboard/new/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AttestationPreview from '@/components/AttestationPreview';

// Types pour les données
type Agence = { id: string; nom: string; tel?: string; };
type AttestationData = {
  agenceId?: string;
  numFeuillet: number | string;
  numeroPolice: string;
  souscripteur: string;
  immatriculation: string;
  dateEffet: string;
  dateEcheance: string;
  adresse: string;
  usage: string;
  marque: string;
  nombrePlaces: number | string;
};

export default function NewAttestationPage() {
  const router = useRouter();
  const [agences, setAgences] = useState<Agence[]>([]);
  
  const [formData, setFormData] = useState<AttestationData>({
    agenceId: undefined,
    numFeuillet: '',
    numeroPolice: '',
    souscripteur: '',
    immatriculation: '',
    dateEffet: new Date().toISOString().split('T')[0],
    dateEcheance: (() => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      date.setDate(date.getDate() - 1);
      return date.toISOString().split('T')[0];
    })(),
    adresse: '',
    usage: '',
    marque: '',
    nombrePlaces: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch la liste des agences au montage
  useEffect(() => {
    const fetchAgences = async () => {
      try {
        const res = await fetch('/api/admin/agences');
        const data = await res.json();
        setAgences(data);
        // Pré-sélectionner la première agence de la liste si elle existe
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, agenceId: data[0].id }));
        }
      } catch (e) { console.error("Impossible de charger les agences"); }
    };
    fetchAgences();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || '' : value,
    }));
  };

  // Gère la soumission du formulaire
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    if (!formData.agenceId) {
        setError("Veuillez sélectionner une agence.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/attestations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            numFeuillet: Number(formData.numFeuillet),
            nombrePlaces: Number(formData.nombrePlaces)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur s'est produite.");
      }
      
      router.push('/dashboard');
      router.refresh();
    
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prépare les données pour l'aperçu en trouvant l'objet agence complet
  const previewData = useMemo(() => {
    const selectedAgence = agences.find(a => a.id === formData.agenceId);
    return {
      id: '',
      dateEdition: new Date().toISOString(),
      ...formData,
      numFeuillet: Number(formData.numFeuillet) || 0,
      nombrePlaces: Number(formData.nombrePlaces) || 0,
      agence: selectedAgence ?? { nom: '', code: '', tel: '', email: '' }
    };
  }, [formData, agences]);

  return (
    <div className="fixed inset-0 bg-white flex h-screen">
      {/* Colonne de Gauche : Formulaire */}
      <div className="w-full md:w-1/3 h-full overflow-y-auto p-8 border-r border-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Nouvelle Attestation</h1>
        </div>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="agenceId" className="block text-sm font-medium text-gray-700">Agence</label>
            <select name="agenceId" id="agenceId" value={formData.agenceId || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black">
              <option value="" disabled>-- Sélectionner une agence --</option>
              {agences.map(agence => (
                <option key={agence.id} value={agence.id}>{agence.nom}</option>
              ))}
            </select>
          </div>
          {/* --- SECTION MISE À JOUR --- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="numFeuillet" className="block text-sm font-medium text-gray-700">Numéro de Feuillet</label>
              <input type="number" name="numFeuillet" value={formData.numFeuillet} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
            </div>
            <div>
              <label htmlFor="numeroPolice" className="block text-sm font-medium text-gray-700">Numéro de Police</label>
              <input type="text" name="numeroPolice" value={formData.numeroPolice} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
            </div>
          </div>

          <div>
            <label htmlFor="souscripteur" className="block text-sm font-medium text-gray-700">Souscripteur</label>
            <input type="text" name="souscripteur" value={formData.souscripteur} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
          </div>
          <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
            <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateEffet" className="block text-sm font-medium text-gray-700">Date d'Effet</label>
              <input type="date" name="dateEffet" value={formData.dateEffet} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
            </div>
            <div>
              <label htmlFor="dateEcheance" className="block text-sm font-medium text-gray-700">Date d'Echéance</label>
              <input type="date" name="dateEcheance" value={formData.dateEcheance} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="immatriculation" className="block text-sm font-medium text-gray-700">Immatriculation</label>
              <input type="text" name="immatriculation" value={formData.immatriculation} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
            </div>
            <div>
              <label htmlFor="marque" className="block text-sm font-medium text-gray-700">Marque</label>
              <input type="text" name="marque" value={formData.marque} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="usage" className="block text-sm font-medium text-gray-700">Usage (ex: PA)</label>
              <input type="text" name="usage" value={formData.usage} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
            </div>
            <div>
              <label htmlFor="nombrePlaces" className="block text-sm font-medium text-gray-700">Nombre de Places</label>
              <input type="number" name="nombrePlaces" value={formData.nombrePlaces} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-2/3 h-full flex-col bg-gray-100 p-4">
        <div className="flex-grow flex items-center justify-center overflow-auto">
            <div className="transform scale-90 origin-center">
                <AttestationPreview attestation={previewData} />
            </div>
        </div>
        <div className="flex-shrink-0 flex justify-end gap-2 pt-4">
            <button 
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isLoading} 
              className="bg-[#1f308c] text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
        </div>
      </div>
    </div>
  );
}
