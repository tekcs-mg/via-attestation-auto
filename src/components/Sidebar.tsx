// Fichier: src/components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Icons } from './Icons';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(true);

  // Le tableau des liens a été mis à jour
  const navItems = [
    { href: '/dashboard', icon: Icons.dashboard, label: 'Tableau de Bord' },
    { href: '/dashboard/new', icon: Icons.add, label: 'Créer une Attestation' },
    { href: '/dashboard/reports', icon: Icons.reports, label: 'Rapports' }, // NOUVEAU LIEN
    // Ajoutez ici d'autres liens de menu...
  ];

  const adminNavItems = [
    { href: '/dashboard/admin/users', icon: Icons.users, label: 'Gestion des Utilisateurs' },
    { href: '/dashboard/admin/settings', icon: Icons.settings, label: 'Paramètres' },
  ];

  const NavLink = ({ href, icon: Icon, label }: { href: string, icon: React.FC<any>, label: string }) => (
    <Link href={href}>
      <span className={`flex items-center p-2 rounded-lg hover:bg-gray-200 ${pathname === href ? 'bg-gray-200 font-bold' : ''}`}>
        <Icon className="w-6 h-6 text-gray-700" />
        {isExpanded && <span className="ml-3 text-black">{label}</span>}
      </span>
    </Link>
  );

  return (
    <aside className={`relative bg-white border-r transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-4 border-b">
          <span className="text-2xl font-bold text-blue-800">{isExpanded ? 'VIA' : 'V'}</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map(item => <NavLink key={item.href} {...item} />)}

          {session?.user?.role === 'ADMIN' && (
            <div className="pt-4 mt-4 border-t">
              {isExpanded && <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</h3>}
              <div className="mt-2 space-y-2">
                {adminNavItems.map(item => <NavLink key={item.href} {...item} />)}
              </div>
            </div>
          )}
        </nav>
        <div className="p-4 border-t">
          {session && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-black">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
              {isExpanded && (
                <div className="ml-3">
                  <div className="font-bold text-black">{session.user.name}</div>
                  <div className="text-xs text-gray-500">{session.user.email}</div>
                </div>
              )}
            </div>
          )}
          <button onClick={() => signOut()} className="w-full flex items-center p-2 mt-4 rounded-lg hover:bg-gray-200">
            <Icons.logout className="w-6 h-6 text-gray-700" />
            {isExpanded && <span className="ml-3 text-black">Déconnexion</span>}
          </button>
        </div>
      </div>
      <button onClick={() => setIsExpanded(!isExpanded)} className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border rounded-full p-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}><path d="m15 18-6-6 6-6"/></svg>
      </button>
    </aside>
  );
}
