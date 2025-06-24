// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password_1234', 10);
  await prisma.user.create({
    data: {
      email: 'test@via.mg',
      name: 'Testeur Via',
      password: hashedPassword,
      role: 'ADMIN', // ou 'USER'
    },
  });
  console.log('Utilisateur de test créé avec succès: test@via.mg / Password_1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
