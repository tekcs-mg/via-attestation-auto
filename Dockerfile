# Étape 1: Installation des dépendances (deps)
# Cette étape est mise en cache et ne se relance que si package.json ou le lockfile changent.
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les fichiers de dépendances et les installer
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ---

# Étape 2: Construction de l'application (builder)
# Cette étape ne se relance que si les fichiers de code source ont changé.
FROM node:18-alpine AS builder
WORKDIR /app
# Copier les dépendances installées à l'étape précédente
COPY --from=deps /app/node_modules ./node_modules
# Copier le reste du code source
COPY . .

# Désactiver la télémétrie de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Générer le client Prisma pour s'assurer qu'il est disponible dans la build
RUN npx prisma generate
RUN npx prisma seed bd

# Lancer la commande de build de production de Next.js
RUN npm run build

# ---

# Étape 3: Image finale de production (runner)
# C'est l'image qui sera réellement exécutée sur le serveur. Elle est très légère.
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Créer un utilisateur et un groupe dédiés pour des raisons de sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/public ./public

# Copier la build autonome de Next.js (output standalone)
# et les assets statiques
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Lancer l'application en tant qu'utilisateur non-root
USER nextjs

EXPOSE 3000

ENV PORT 3000

# Commande pour démarrer le serveur Next.js
CMD ["node", "server.js"]
