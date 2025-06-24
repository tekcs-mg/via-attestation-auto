// src/components/AttestationForm.tsx
'use client';

import { useState, type FormEvent } from 'react';
// Le router n'est plus nécessaire pour la redirection, mais peut être gardé pour d'autres usages
// import { useRouter } from 'next/navigation';

// On ajoute des props pour communiquer avec le parent
type AttestationFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AttestationForm({ onSuccess, onCancel }: AttestationFormProps) {
  // const router = useRouter(); // Plus besoin pour la redirection
  const [formData, setFormData] = useState({
    numeroPolice: '',
    souscripteur: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/attestations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            nombrePlaces: Number(formData.nombrePlaces)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur s'est produite.");
      }
      
      // Au lieu de rediriger, on appelle la fonction onSuccess
      onSuccess();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ... Le contenu du formulaire (grid, champs, etc.) reste identique ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Champ Numéro de Police */}
        <div>
          <label htmlFor="numeroPolice" className="block text-sm font-medium text-gray-700">Numéro de Police</label>
          <input type="text" name="numeroPolice" id="numeroPolice" required value={formData.numeroPolice} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" />
        </div>
        {/* ... Autres champs du formulaire ... */}
        {/* Champ Souscripteur */}
        <div>
          <label htmlFor="souscripteur" className="block text-sm font-medium text-gray-700">Souscripteur</label>
          <input type="text" name="souscripteur" id="souscripteur" required value={formData.souscripteur} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" />
        </div>
        {/* Champ Adresse */}
        <div className="md:col-span-2">
          <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
          <input type="text" name="adresse" id="adresse" required value={formData.adresse} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" />
        </div>
        {/* Champ Date d'Effet */}
        <div>
          <label htmlFor="dateEffet" className="block text-sm font-medium text-gray-700">Date d'Effet</label>
          <input type="date" name="dateEffet" id="dateEffet" required value={formData.dateEffet} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500  text-black" />
        </div>
        {/* Champ Date d'Echéance */}
        <div>
          <label htmlFor="dateEcheance" className="block text-sm font-medium text-gray-700">Date d'Echéance</label>
          <input type="date" name="dateEcheance" id="dateEcheance" required value={formData.dateEcheance} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" />
        </div>
        {/* Champ Usage */}
        <div>
          <label htmlFor="usage" className="block text-sm font-medium text-gray-700">Usage</label>
          <input type="text" name="usage" id="usage" required value={formData.usage} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" />
        </div>
        {/* Champ Marque */}
        <div>
          <label htmlFor="marque" className="block text-sm font-medium text-gray-700">Marque</label>
          <input type="text" name="marque" id="marque" required value={formData.marque} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" />
        </div>
        {/* Champ Immatriculation */}
        <div>
          <label htmlFor="immatriculation" className="block text-sm font-medium text-gray-700">Immatriculation</label>
          <input type="text" name="immatriculation" id="immatriculation" required value={formData.immatriculation} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" />
        </div>
        {/* Champ Nombre de Places */}
        <div>
          <label htmlFor="nombrePlaces" className="block text-sm font-medium text-gray-700">Nombre de Places</label>
          <input type="number" name="nombrePlaces" id="nombrePlaces" required value={formData.nombrePlaces} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black" />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <div className="flex justify-end pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-4 hover:bg-gray-300">
          Annuler
        </button>
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
          {isLoading ? 'Enregistrement...' : 'Enregistrer l\'Attestation'}
        </button>
      </div>
    </form>
  );
}