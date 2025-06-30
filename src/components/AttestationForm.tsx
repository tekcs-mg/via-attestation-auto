// Fichier: src/components/AttestationForm.tsx
'use client';

import { useState, type FormEvent, useEffect } from 'react';

type FormData = {
  id?: string;
  numFeuillet: number | string; // Accepte string pour la saisie
  numeroPolice: string;
  souscripteur: string;
  adresse: string;
  dateEffet: string;
  dateEcheance: string;
  usage: string;
  marque: string;
  nombrePlaces: number | string;
  immatriculation: string;
};

type AttestationFormProps = {
  initialData?: Partial<FormData> | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AttestationForm({ initialData, onSuccess, onCancel }: AttestationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    numFeuillet: '',
    numeroPolice: '',
    souscripteur: '', // Champ ajouté à l'état initial
    adresse: '',
    dateEffet: '',
    dateEcheance: '',
    usage: '',
    marque: '',
    nombrePlaces: 5,
    immatriculation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateForInput = (date: string | Date | undefined): string => {
      if (!date) return '';
      return new Date(date).toISOString().split('T')[0];
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        numFeuillet: initialData.numFeuillet || '',
        numeroPolice: initialData.numeroPolice || '',
        souscripteur: initialData.souscripteur || '', // Champ ajouté à l'initialisation
        adresse: initialData.adresse || '',
        dateEffet: formatDateForInput(initialData.dateEffet),
        dateEcheance: formatDateForInput(initialData.dateEcheance),
        usage: initialData.usage || '',
        marque: initialData.marque || '',
        nombrePlaces: initialData.nombrePlaces || 5,
        immatriculation: initialData.immatriculation || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || '' : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const isEditing = !!initialData?.id;
    const url = isEditing ? `/api/attestations/${initialData.id}` : '/api/attestations';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
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
      
      onSuccess();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="numFeuillet" className="block text-sm font-medium text-gray-700">Numéro de Feuillet</label>
          <input 
            type="number" 
            name="numFeuillet" 
            id="numFeuillet" 
            required 
            value={formData.numFeuillet} 
            onChange={handleChange}
            readOnly={!!initialData}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] read-only:bg-gray-100 text-black" 
          />
        </div>
        
        <div>
          <label htmlFor="numeroPolice" className="block text-sm font-medium text-gray-700">Numéro de Police</label>
          <input type="text" name="numeroPolice" id="numeroPolice" required value={formData.numeroPolice} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
        </div>

        {/* --- CHAMP SOUSCRIPTEUR RESTAURÉ --- */}
        <div className="md:col-span-2">
          <label htmlFor="souscripteur" className="block text-sm font-medium text-gray-700">Souscripteur</label>
          <input type="text" name="souscripteur" id="souscripteur" required value={formData.souscripteur} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
          <input type="text" name="adresse" id="adresse" required value={formData.adresse} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
        </div>
        
        <div>
          <label htmlFor="dateEffet" className="block text-sm font-medium text-gray-700">Date d'Effet</label>
          <input type="date" name="dateEffet" id="dateEffet" required value={formData.dateEffet} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
        </div>

        <div>
          <label htmlFor="dateEcheance" className="block text-sm font-medium text-gray-700">Date d'Echéance</label>
          <input type="date" name="dateEcheance" id="dateEcheance" required value={formData.dateEcheance} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
        </div>

        <div>
          <label htmlFor="usage" className="block text-sm font-medium text-gray-700">Usage</label>
          <input type="text" name="usage" id="usage" required value={formData.usage} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
        </div>

        <div>
          <label htmlFor="marque" className="block text-sm font-medium text-gray-700">Marque</label>
          <input type="text" name="marque" id="marque" required value={formData.marque} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
        </div>

        <div>
          <label htmlFor="immatriculation" className="block text-sm font-medium text-gray-700">Immatriculation</label>
          <input type="text" name="immatriculation" id="immatriculation" required value={formData.immatriculation} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
        </div>

        <div>
          <label htmlFor="nombrePlaces" className="block text-sm font-medium text-gray-700">Nombre de Places</label>
          <input type="number" name="nombrePlaces" id="nombrePlaces" required value={formData.nombrePlaces} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1f308c] focus:border-[#1f308c] text-black" />
        </div>
        
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <div className="flex justify-end pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-4 hover:bg-gray-300">Annuler</button>
        <button type="submit" disabled={isLoading} className="bg-[#1f308c] text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300">{isLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}