// Fichier: src/components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Icons } from './Icons';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = [
    { href: '/dashboard', icon: Icons.dashboard, label: 'Tableau de Bord' },
    { href: '/dashboard/new', icon: Icons.add, label: 'Créer une Attestation' },
    { href: '/dashboard/reports', icon: Icons.reports, label: 'Rapports' },
  ];

  const adminNavItems = [
    { href: '/dashboard/admin/users', icon: Icons.users, label: 'Utilisateurs' },
    { href: '/dashboard/admin/agences', icon: Icons.agency, label: 'Agences' },
    { href: '/dashboard/admin/sheets', icon: Icons.sheets, label: 'Feuillets' },
  ];

  const NavLink = ({ href, icon: Icon, label }: { href: string, icon: React.FC<any>, label: string }) => {
    const isActive = pathname === href;
    return (
        <Link href={href} title={label}>
          <span className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-100 text-[#1F308C]' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-[#1F308C]' : 'text-[#3F5568]'}`} />
            {isExpanded && <span className="ml-3 font-medium">{label}</span>}
          </span>
        </Link>
    );
  };

  return (
    <aside className={`relative bg-white border-r transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center p-4 border-b h-20">
            {isExpanded ? (
                <Image src={'/logo/Logo_VIA.png'} alt='logo VIA' height={40} width={100} style={{ objectFit: 'contain' }}/>
            ) : (
                <div className="text-2xl font-bold text-[#1F308C]">V</div>
            )}
        </div>

        <nav className="flex-grow p-3 space-y-1">
          {navItems.map(item => <NavLink key={item.href} {...item} />)}

          {session?.user?.role === 'ADMIN' && (
            <div className="pt-4 mt-4 border-t">
              {isExpanded && <h3 className="px-2 mb-2 text-xs font-bold text-[#3F5568] uppercase tracking-wider">Administration</h3>}
              <div className="space-y-1">
                {adminNavItems.map(item => <NavLink key={item.href} {...item} />)}
              </div>
            </div>
          )}
        </nav>

        <div className="p-3 border-t">
          {session && (
            <div className="flex items-center p-2 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#1F308C] text-white flex items-center justify-center font-bold flex-shrink-0">
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
              {isExpanded && (
                <div className="ml-3 overflow-hidden">
                  <div className="font-bold text-black truncate">{session.user.name}</div>
                  <div className="text-xs text-gray-500 truncate">{session.user.email}</div>
                </div>
              )}
            </div>
          )}
          <button onClick={() => signOut()} className="w-full flex items-center p-2 mt-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <Icons.logout className="w-6 h-6 text-[#3F5568] flex-shrink-0" />
            {isExpanded && <span className="ml-3 font-medium">Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* --- LIGNE MODIFIÉE --- */}
      <button onClick={() => setIsExpanded(!isExpanded)} className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 text-black rounded-full p-1.5 shadow-sm hover:bg-gray-100 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}><path d="m15 18-6-6 6-6"/></svg>
      </button>
    </aside>
  );
}
