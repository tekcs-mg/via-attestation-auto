// Fichier: src/components/AgenceForm.tsx
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import toast from 'react-hot-toast';

type Agence = {
  id?: string;
  nom: string;
  tel?: string;
  email?: string;
  adresse?: string;
};

type AgenceFormProps = {
  initialData?: Agence;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function AgenceForm({ initialData, onSuccess, onCancel }: AgenceFormProps) {
  const [formData, setFormData] = useState<Agence>({
    nom: '', tel: '', email: '', adresse: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nom: initialData.nom || '',
        tel: initialData.tel || '',
        email: initialData.email || '',
        adresse: initialData.adresse || '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const url = isEditing ? `/api/admin/agences/${initialData?.id}` : '/api/admin/agences';
    const method = isEditing ? 'PUT' : 'POST';

    const promise = fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(async (res) => {
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Une erreur est survenue.');
        }
        return res.json();
    });

    toast.promise(promise, {
       loading: 'Enregistrement...',
       success: `Agence ${isEditing ? 'mise à jour' : 'créée'} avec succès !`,
       error: (err) => err.message,
    });
    
    try {
        await promise;
        onSuccess();
    } catch (err) {
        // Le toast gère déjà l'affichage de l'erreur
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom de l'agence</label>
        <input type="text" name="nom" id="nom" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black" />
      </div>
      <div>
        <label htmlFor="tel" className="block text-sm font-medium text-gray-700">Téléphone</label>
        <input type="tel" name="tel" id="tel" value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black" />
      </div>
       <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black" />
      </div>
       <div>
        <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
        <input type="text" name="adresse" id="adresse" value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black" />
      </div>

      <div className="flex justify-end pt-4 gap-2">
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">Annuler</button>
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">{isLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}
