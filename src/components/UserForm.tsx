// Fichier: src/components/UserForm.tsx
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { Role } from '@prisma/client';
import toast from 'react-hot-toast';

// Type pour les agences récupérées de l'API
type Agence = { id: string; nom: string; };

// Type pour les données du formulaire, incluant l'ID de l'agence
type UserFormData = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  agenceId?: string;
};

// Les props du composant peuvent maintenant inclure une agence dans les données initiales
type UserFormProps = {
  initialData?: Partial<UserFormData> & { agence?: Agence | null };
  onSuccess: () => void;
  onCancel: () => void;
};

export default function UserForm({ initialData, onSuccess, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '', email: '', password: '', role: 'USER', agenceId: undefined
  });
  const [agences, setAgences] = useState<Agence[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!initialData?.id;

  // Récupère la liste des agences au montage du composant
  useEffect(() => {
    const fetchAgences = async () => {
        try {
            const res = await fetch('/api/admin/agences');
            if (res.ok) {
                const data = await res.json();
                setAgences(data);
            } else {
                toast.error("Impossible de charger la liste des agences.");
            }
        } catch (e) {
            console.error("Impossible de charger les agences", e);
            toast.error("Erreur réseau lors du chargement des agences.");
        }
    };
    fetchAgences();
  }, []);

  // Pré-remplit le formulaire si des données initiales sont fournies (pour l'édition)
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        email: initialData.email || '',
        role: initialData.role || 'USER',
        agenceId: initialData.agence?.id || undefined
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    setFormData(prev => ({
        ...prev,
        role: newRole,
        // Si le nouveau rôle est ADMIN, on désassigne l'agence
        agenceId: newRole === 'ADMIN' ? undefined : prev.agenceId
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const url = isEditing ? `/api/admin/users/${initialData?.id}` : '/api/admin/users';
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
       success: `Utilisateur ${isEditing ? 'mis à jour' : 'créé'} avec succès !`,
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
        <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black" />
      </div>
      {!isEditing && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input type="password" name="password" id="password" required={!isEditing} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black" />
        </div>
      )}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
        <select name="role" id="role" required value={formData.role} onChange={handleRoleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black">
          <option value="USER">Utilisateur</option>
          <option value="ADMIN">Administrateur</option>
        </select>
      </div>
      
      {/* --- NOUVEAU CHAMP AGENCE --- */}
      <div>
        <label htmlFor="agenceId" className="block text-sm font-medium text-gray-700">Agence</label>
        <select 
            name="agenceId" 
            id="agenceId" 
            value={formData.agenceId || ''} 
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black disabled:bg-gray-100"
            disabled={formData.role === 'ADMIN'}
        >
          <option value="">Aucune agence</option>
          {agences.map(agence => (
              <option key={agence.id} value={agence.id}>{agence.nom}</option>
          ))}
        </select>
        {formData.role === 'ADMIN' && <p className="text-xs text-gray-500 mt-1">Les administrateurs ne sont pas liés à une agence.</p>}
      </div>

      <div className="flex justify-end pt-4 gap-2">
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">Annuler</button>
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">{isLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
      </div>
    </form>
  );
}
