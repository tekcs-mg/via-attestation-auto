// Fichier: src/app/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("L'email ou le mot de passe est incorrect.");
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-100">
      {/* Section gauche avec le design de la marque */}
      {/* Utilise flex-grow pour prendre tout l'espace restant */}
      <div className="hidden lg:flex flex-grow bg-[#1F308C] relative items-center justify-start p-12 lg:p-24">
        <div className="z-10 text-white text-left max-w-md">
          <h1 className="text-5xl font-bold leading-tight">Avancez avec assurance.</h1>
          <p className="mt-4 text-lg text-blue-200">
            Connectez-vous pour accéder à votre espace de gestion des attestations.
          </p>
        </div>
        {/* Élément de design diagonal */}
        <div 
          className="absolute top-0 right-0 h-full w-1/4 bg-gray-100" 
          style={{ clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)' }}
        ></div>
      </div>

      {/* Section droite avec le formulaire de connexion */}
      {/* A une largeur fixe et ne rétrécit pas */}
      <div className="w-full lg:w-[550px] lg:flex-shrink-0 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <Image 
              src="/logo/Logo_VIA.png" 
              alt="Logo VIA" 
              width={120} 
              height={50} 
              className="mx-auto lg:mx-0"
            />
          </div>
          
          <h2 className="text-3xl font-bold text-black mb-2">Connexion</h2>
          <p className="text-gray-600 mb-8">Veuillez entrer vos identifiants pour continuer.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#1478FF] focus:border-[#1478FF] text-black"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#1478FF] focus:border-[#1478FF] text-black"
                placeholder="********"
              />
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p>{error}</p>
              </div>
            )}

            <div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1F308C] hover:bg-[#14236a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1478FF] disabled:opacity-50 hover:cursor-pointer"
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
