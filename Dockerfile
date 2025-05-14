# Étape de construction
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package.json pnpm-lock.yaml* ./

# Installer pnpm
RUN npm install -g pnpm

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le reste des fichiers
COPY . .

# Générer le client Prisma avant la compilation
RUN pnpm prisma generate

# Construire l'application TypeScript
RUN pnpm run build

# Étape d'exécution
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Exposer le port de l'application
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/index.js"]
