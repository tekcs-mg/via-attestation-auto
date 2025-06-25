// Fichier: src/components/QRCodeGenerator.tsx
'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

type QRCodeGeneratorProps = {
  url: string;
  size?: number;
};

export default function QRCodeGenerator({ url, size = 80 }: QRCodeGeneratorProps) {
  return (
    <QRCodeSVG
      value={url}
      size={size}
      bgColor={"#ffffff"}
      fgColor={"#000000"}
      level={"L"} // Niveau de correction d'erreur (L, M, Q, H)
      includeMargin={false}
    />
  );
}
