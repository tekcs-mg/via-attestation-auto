// Fichier: src/app/dashboard/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
// Nouveaux imports pour Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

type Stats = {
  totalAttestations: number;
  activeAttestations: number;
  createdThisMonth: number;
  createdThisYear: number;
  brandDistribution: { name: string; value: number }[];
  usageDistribution: { name: string; value: number }[];
  expiringSoon: any[];
  monthlyActivity: { name: string; créées: number }[];
};

const StatCard = ({ title, value, isLoading }: { title: string; value: number; isLoading: boolean }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-sm font-medium text-[#3F5568]">{title}</h3>
    {isLoading ? (
      <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
    ) : (
      <p className="mt-1 text-3xl font-semibold text-[#1F308C]">{value.toLocaleString()}</p>
    )}
  </div>
);

// Couleurs de la charte graphique
const BRAND_COLORS = ['#1F308C', '#1478FF', '#3DBA94', '#91CFA6', '#3F5568'];

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartKey, setChartKey] = useState(0); // Clé pour forcer le re-rendu

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          setStats(await res.json());
          setChartKey(prevKey => prevKey + 1); // Changer la clé pour forcer le re-rendu
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Préparation des données pour les graphiques Chart.js
  const pieChartData = (data: { name: string; value: number }[]) => ({
    labels: data.map(d => d.name),
    datasets: [{
      label: 'Répartition',
      data: data.map(d => d.value),
      backgroundColor: BRAND_COLORS,
      borderColor: '#fff',
      borderWidth: 2,
    }],
  });

  const lineChartData = (data: { name: string; créées: number }[]) => ({
    labels: data.map(d => d.name),
    datasets: [{
      label: 'Attestations Créées',
      data: data.map(d => d.créées),
      borderColor: '#1478FF',
      backgroundColor: 'rgba(20, 120, 255, 0.2)',
      fill: true,
      tension: 0.4,
    }],
  });
  
  // Options pour le graphique en courbes
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0, // Assure que l'axe Y n'affiche que des entiers
        }
      }
    },
    plugins: {
      legend: { position: 'top' as const },
    },
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#1F308C] mb-6">Rapports & Statistiques</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total des Attestations" value={stats?.totalAttestations ?? 0} isLoading={loading} />
        <StatCard title="Attestations Actives" value={stats?.activeAttestations ?? 0} isLoading={loading} />
        <StatCard title="Créées ce Mois-ci" value={stats?.createdThisMonth ?? 0} isLoading={loading} />
        <StatCard title="Créées cette Année" value={stats?.createdThisYear ?? 0} isLoading={loading} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-[#3F5568] mb-4">Top 5 des Marques</h2>
            <div className="w-full h-[300px] flex items-center justify-center">
              {loading ? <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div> : (
                <Pie key={chartKey} data={pieChartData(stats?.brandDistribution || [])} />
              )}
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-[#3F5568] mb-4">Top 5 des Usages</h2>
            <div className="w-full h-[300px] flex items-center justify-center">
              {loading ? <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div> : (
                <Pie key={chartKey} data={pieChartData(stats?.usageDistribution || [])} />
              )}
            </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-[#3F5568] mb-4">Activité des 12 Derniers Mois</h2>
        <div className="w-full h-[300px]">
          {loading ? <div className="w-full h-full bg-gray-200 rounded animate-pulse"></div> : (
            <Line key={chartKey} data={lineChartData(stats?.monthlyActivity || [])} options={lineChartOptions} />
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-[#3F5568] mb-4">Attestations à Renouveler (30 prochains jours)</h2>
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
                      {!loading && stats?.expiringSoon && stats.expiringSoon.length > 0 ? (
                          stats.expiringSoon.map((att) => (
                              <tr key={att.id} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-2 text-black">{att.numFeuillet}</td>
                                  <td className="px-4 py-2 text-black">{att.souscripteur}</td>
                                  <td className="px-4 py-2 text-black">{att.immatriculation}</td>
                                  <td className="px-4 py-2 text-red-600 font-bold">{format(new Date(att.dateEcheance), 'dd/MM/yyyy')}</td>
                              </tr>
                          ))
                      ) : (
                          <tr><td colSpan={4} className="text-center py-4 text-gray-500">{loading ? 'Chargement...' : 'Aucune attestation à renouveler.'}</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
