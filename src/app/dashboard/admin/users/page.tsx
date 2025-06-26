// Fichier: src/app/dashboard/admin/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import Modal from '@/components/Modal';
import UserForm from '@/components/UserForm';

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type SortConfig = {
  key: keyof User;
  direction: 'asc' | 'desc';
};

const SortArrow = ({ direction }: { direction: 'asc' | 'desc' | 'none' }) => {
  if (direction === 'asc') return <span className="ml-1">▲</span>;
  if (direction === 'desc') return <span className="ml-1">▼</span>;
  return null;
};

export default function UserManagementPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // États pour le tri, la recherche et la pagination
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
        setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '10',
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        search: debouncedSearchQuery,
        role: roleFilter,
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`);

      if (res.ok) {
        const { data, totalPages: total } = await res.json();
        setUsers(data);
        setTotalPages(total);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortConfig, debouncedSearchQuery, roleFilter]);

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleCreateClick = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (userId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
        await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
        fetchUsers();
    } catch (error) {
        console.error("Failed to delete user", error);
    }
  };

  const requestSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-8"><h1 className="text-2xl text-red-600">Accès refusé</h1></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-black">Gestion des Utilisateurs</h1>
        <div className="flex items-center gap-4">
            <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-xs pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-black"
            />
            <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role | 'ALL')}
                className="border border-gray-300 rounded-lg p-2 text-black"
            >
                <option value="ALL">Tous les rôles</option>
                <option value="ADMIN">Administrateur</option>
                <option value="USER">Utilisateur</option>
            </select>
            <button onClick={handleCreateClick} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0">
              Créer un Utilisateur
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full">
            <thead className="border-b">
                <tr>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('name')} className="flex items-center">Nom <SortArrow direction={sortConfig.key === 'name' ? sortConfig.direction : 'none'}/></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('email')} className="flex items-center">Email <SortArrow direction={sortConfig.key === 'email' ? sortConfig.direction : 'none'}/></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black"><button onClick={() => requestSort('role')} className="flex items-center">Rôle <SortArrow direction={sortConfig.key === 'role' ? sortConfig.direction : 'none'}/></button></th>
                    <th className="px-4 py-3 text-left font-semibold text-black">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-black">{user.name}</td>
                        <td className="px-4 py-3 text-black">{user.email}</td>
                        <td className="px-4 py-3 text-black">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="px-4 py-3">
                            <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:underline mr-4">Éditer</button>
                            {session.user.id !== user.id && (
                                <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline">Supprimer</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {/* Contrôles de Pagination */}
        <div className="flex justify-between items-center mt-4">
            <div><span className="text-sm text-black">Page {currentPage} sur {totalPages}</span></div>
            <div className="flex items-center">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-lg disabled:opacity-50 text-black">Précédent</button>
                <span className="px-4 text-black">{currentPage}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-lg disabled:opacity-50 text-black">Suivant</button>
            </div>
        </div>
      </div>
      
      {(isModalOpen || editingUser) && (
        <Modal 
          isOpen={isModalOpen || !!editingUser} 
          onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
          title={editingUser ? "Éditer l'Utilisateur" : "Créer un Utilisateur"}
        >
          <UserForm 
            initialData={editingUser} 
            onSuccess={handleFormSuccess} 
            onCancel={() => { setIsModalOpen(false); setEditingUser(null); }} 
          />
        </Modal>
      )}
    </div>
  );
}
