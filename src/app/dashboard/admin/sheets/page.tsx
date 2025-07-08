// Fichier: src/app/dashboard/admin/sheets/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';
import { FeuilletType } from '@prisma/client';

type AgenceStock = {
  id: string;
  nom: string;
  stockFeuilletsJaunes: number;
  stockFeuilletsRouges: number;
  stockFeuilletsVerts: number;
};

// Formulaire pour l'approvisionnement
const ApprovisionnementForm = ({ agence, onSuccess, onCancel }: { agence: AgenceStock, onSuccess: () => void, onCancel: () => void }) => {
    const [type, setType] = useState<FeuilletType>(FeuilletType.JAUNE);
    const [quantite, setQuantite] = useState<number>(100);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const promise = fetch('/api/admin/stocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agenceId: agence.id, type, quantite }),
        }).then(res => {
            if (!res.ok) throw new Error("Échec de l'approvisionnement.");
            return res.json();
        });

        toast.promise(promise, {
            loading: 'Approvisionnement en cours...',
            success: 'Stock mis à jour !',
            error: 'Une erreur est survenue.',
        });

        try {
            await promise;
            onSuccess();
        } catch (error) {
            // Le toast gère l'erreur
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Type de Feuillet</label>
                <select value={type} onChange={e => setType(e.target.value as FeuilletType)} className="w-full p-2 mt-1 border rounded text-black">
                    <option value={FeuilletType.JAUNE}>Jaune</option>
                    <option value={FeuilletType.ROUGE}>Rouge</option>
                    <option value={FeuilletType.VERT}>Vert</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Quantité à Ajouter</label>
                <input type="number" value={quantite} onChange={e => setQuantite(Number(e.target.value))} min="1" className="w-full p-2 mt-1 border rounded text-black" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">Annuler</button>
                <button type="submit" disabled={isLoading} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">{isLoading ? 'Ajout...' : 'Ajouter au Stock'}</button>
            </div>
        </form>
    );
};


export default function SheetsManagementPage() {
  const { data: session } = useSession();
  const [stocks, setStocks] = useState<AgenceStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgence, setSelectedAgence] = useState<AgenceStock | null>(null);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stocks');
      if (res.ok) setStocks(await res.json());
    } catch (error) { console.error("Failed to fetch stocks", error); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStocks(); }, [fetchStocks]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-black mb-6">Gestion des Stocks de Feuillets</h1>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full">
            <thead className="border-b">
                <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black">Agence</th>
                    <th className="px-4 py-3 text-center font-semibold text-black">Stock Jaune</th>
                    <th className="px-4 py-3 text-center font-semibold text-black">Stock Rouge</th>
                    <th className="px-4 py-3 text-center font-semibold text-black">Stock Vert</th>
                    {session?.user?.role === 'ADMIN' && <th className="px-4 py-3 text-left font-semibold text-black">Actions</th>}
                </tr>
            </thead>
            <tbody>
                {stocks.map((agence) => (
                    <tr key={agence.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-black font-bold">{agence.nom}</td>
                        <td className="px-4 py-3 text-black text-center">{agence.stockFeuilletsJaunes}</td>
                        <td className="px-4 py-3 text-black text-center">{agence.stockFeuilletsRouges}</td>
                        <td className="px-4 py-3 text-black text-center">{agence.stockFeuilletsVerts}</td>
                        {session?.user?.role === 'ADMIN' && (
                            <td className="px-4 py-3">
                                <button onClick={() => setSelectedAgence(agence)} className="text-blue-600 hover:underline">Approvisionner</button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      
      {selectedAgence && (
        <Modal 
          isOpen={!!selectedAgence} 
          onClose={() => setSelectedAgence(null)}
          title={`Approvisionner l'agence ${selectedAgence.nom}`}
        >
          <ApprovisionnementForm 
            agence={selectedAgence}
            onSuccess={() => { setSelectedAgence(null); fetchStocks(); }} 
            onCancel={() => setSelectedAgence(null)} 
          />
        </Modal>
      )}
    </div>
  );
}
