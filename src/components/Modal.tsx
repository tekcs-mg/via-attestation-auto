// src/components/Modal.tsx
'use client';

import React from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose} // Ferme la modale en cliquant sur l'arrière-plan
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant sur le contenu de la modale
      >
        <div className="p-6 border-b sticky top-0 bg-white">
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
