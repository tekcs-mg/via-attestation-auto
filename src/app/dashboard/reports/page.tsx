// Fichier: src/app/dashboard/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

type Stats = {
  totalAttestations: number;
  activeAttestations: number;
  createdThisMonth: number;
  createdThisYear: number; // Nouveau champ
  brandDistribution: { name: string; value: number }[];
  usageDistribution: { name: string; value: number }[];
  expiringSoon: any[];
  monthlyActivity: { name: string; créées: number }[];
};

const StatCard = ({ title, value, isLoading }: { title: string; value: number; isLoading: boolean }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    {isLoading ? (
      <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
    ) : (
      <p className="mt-1 text-3xl font-semibold text-black">{value.toLocaleString()}</p>
    )}
  </div>
);

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-black mb-6">Rapports & Statistiques</h1>

      {/* Cartes des indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total des Attestations" value={stats?.totalAttestations ?? 0} isLoading={loading} />
        <StatCard title="Attestations Actives" value={stats?.activeAttestations ?? 0} isLoading={loading} />
        <StatCard title="Créées ce Mois-ci" value={stats?.createdThisMonth ?? 0} isLoading={loading} />
        {/* NOUVELLE CARTE STATISTIQUE */}
        <StatCard title="Créées cette Année" value={stats?.createdThisYear ?? 0} isLoading={loading} />
      </div>
      
      {/* Section des graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-black mb-4">Top 5 des Marques</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={stats?.brandDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {stats?.brandDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-black mb-4">Top 5 des Usages</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={stats?.usageDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                             {stats?.usageDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* Graphique de l'activité mensuelle */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-black mb-4">Activité des 12 Derniers Mois</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={stats?.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="créées" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau des attestations expirant bientôt */}
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-black mb-4">Attestations à Renouveler (30 prochains jours)</h2>
          <div className="overflow-x-auto">
              <table className="w-full">
                  <thead className="border-b">
                      <tr>
                          <th className="px-4 py-2 text-left font-semibold text-black">N° Feuillet</th>
                          <th className="px-4 py-2 text-left font-semibold text-black">Souscripteur</th>
                          <th className="px-4 py-2 text-left font-semibold text-black">Immatriculation</th>
                          <th className="px-4 py-2 text-left font-semibold text-black">Date d'Échéance</th>
                      </tr>
                  </thead>
                  <tbody>
                      {stats?.expiringSoon && stats.expiringSoon.length > 0 ? (
                          stats.expiringSoon.map((att) => (
                              <tr key={att.id} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-2 text-black">{att.numFeuillet}</td>
                                  <td className="px-4 py-2 text-black">{att.souscripteur}</td>
                                  <td className="px-4 py-2 text-black">{att.immatriculation}</td>
                                  <td className="px-4 py-2 text-red-600 font-bold">{format(new Date(att.dateEcheance), 'dd/MM/yyyy')}</td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan={4} className="text-center py-4 text-gray-500">Aucune attestation à renouveler.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
