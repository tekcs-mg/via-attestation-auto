// Fichier: src/app/dashboard/admin/agences/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';
import AgenceForm from '@/components/AgenceForm';
import toast from 'react-hot-toast';

type Agence = {
  id: string;
  nom: string;
  tel?: string;
  email?: string;
  adresse?: string;
};

export default function AgenceManagementPage() {
  const { data: session } = useSession();
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgence, setEditingAgence] = useState<Agence>();

  const fetchAgences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agences');
      if (res.ok) {
        const data = await res.json();
        setAgences(data);
      }
    } catch (error) {
      console.error("Failed to fetch agences", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgences();
  }, [fetchAgences]);

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingAgence(undefined);
    fetchAgences();
  };

  const handleCreateClick = () => {
    setEditingAgence(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (agence: Agence) => {
    setEditingAgence(agence);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (agenceId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette agence ?")) return;

    const promise = fetch(`/api/admin/agences/${agenceId}`, { method: 'DELETE' }).then(async (res) => {
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error);
        }
    });

    toast.promise(promise, {
       loading: 'Suppression...',
       success: 'Agence supprimée !',
       error: (err) => err.message,
    });
    
    try {
        await promise;
        fetchAgences();
    } catch(err) {}
  };

  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-8"><h1 className="text-2xl text-red-600">Accès refusé</h1></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Gestion des Agences</h1>
        <button onClick={handleCreateClick} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">
          Créer une Agence
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full">
            <thead className="border-b">
                <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">Nom</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Téléphone</th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Actions</th>
                </tr>
            </thead>
            <tbody>
                {agences.map((agence) => (
                    <tr key={agence.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-black">{agence.nom}</td>
                        <td className="px-4 py-3 text-black">{agence.email || 'N/A'}</td>
                        <td className="px-4 py-3 text-black">{agence.tel || 'N/A'}</td>
                        <td className="px-4 py-3">
                            <button onClick={() => handleEditClick(agence)} className="text-blue-600 hover:underline mr-4">Éditer</button>
                            <button onClick={() => handleDelete(agence.id)} className="text-red-600 hover:underline">Supprimer</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      
      {(isModalOpen || editingAgence) && (
        <Modal 
          isOpen={isModalOpen || !!editingAgence} 
          onClose={() => { setIsModalOpen(false); setEditingAgence(undefined); }}
          title={editingAgence ? "Éditer l'Agence" : "Créer une Agence"}
        >
          <AgenceForm 
            initialData={editingAgence} 
            onSuccess={handleFormSuccess} 
            onCancel={() => { setIsModalOpen(false); setEditingAgence(undefined); }} 
          />
        </Modal>
      )}
    </div>
  );
}
