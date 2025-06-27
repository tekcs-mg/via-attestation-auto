// Fichier: src/components/Modal.tsx
'use client';

import React from 'react';

// Le type des props a été mis à jour
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fitContent?: boolean; // Nouvelle prop optionnelle
};

export default function Modal({ isOpen, onClose, title, children, fitContent = false }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  // On détermine les classes CSS en fonction de la nouvelle prop
  const modalContentClasses = `bg-white rounded-lg shadow-xl ${
    fitContent
    ? 'w-max max-h-[95vh] overflow-y-auto' // N'a plus de contrainte de largeur, s'adaptera au contenu.
    : 'w-full max-w-2xl max-h-[90vh] overflow-y-auto'  // Style par défaut pour les formulaires
  }`;

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4"
      onClick={onClose} 
    >
      <div 
        className={modalContentClasses}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-black">{title}</h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
