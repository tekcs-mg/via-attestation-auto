// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

import prisma from '@/lib/prisma';

async function main() {
  const password = 'Password_1234';
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email: 'test@via.mg',
      name: 'Testeur Via',
      password: hashedPassword,
      role: 'ADMIN', // ou 'USER'
    },
  });
  await prisma.agence.create({
    data: {
      nom: 'Via Assurance Madagascar',
      adresse: '',
      email: '',
      tel: '+261 38 00 842 00',
      stockFeuilletsJaunes: 100,
      stockFeuilletsRouges: 100,
      stockFeuilletsVerts: 100,
    },
  });
  console.log('Utilisateur de test créé avec succès: test@via.mg / Password_1234');
  console.log('Agence de test créée avec succès: Via Assurance Madagascar');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
