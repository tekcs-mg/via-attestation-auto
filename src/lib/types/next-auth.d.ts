// /src/types/next-auth.d.ts

import { Role } from "@prisma/client"; // Importez votre Enum Role depuis le client Prisma généré
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Le type Session retourné par `useSession`, `getSession` et reçu comme prop pour le `SessionProvider`
   */
  interface Session {
    user: {
      /** Le rôle de l'utilisateur */
      role: Role;
      id: string
    } & DefaultSession["user"]; // Pour conserver les propriétés par défaut (name, email, image)
  }

  /** Le modèle User tel qu'il est dans la base de données */
  interface User extends DefaultUser {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  /** Retourné par le callback `jwt` et `getToken` */
  interface JWT extends DefaultJWT {
    role: Role;
    id: string;
  }
}