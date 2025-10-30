FROM node:20-alpine AS base

# Métadonnées
LABEL maintainer="dev-team@agence-immobiliere.com"
LABEL description="Frontend Next.js - Production Environment"

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    dumb-init \
    curl

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Stage 1: Dependencies
FROM base AS dependencies

# Installer les outils de build
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances
RUN npm ci --only=production=false && \
    npm cache clean --force

# Stage 2: Build
FROM dependencies AS build

# Copier le code source
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Construire l'application Next.js
RUN npm run build

# Stage 3: Production
FROM base AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copier seulement les dépendances de production
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copier les fichiers nécessaires depuis le stage build
COPY --from=build --chown=nodejs:nodejs /app/public ./public
COPY --from=build --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nodejs:nodejs /app/.next/static ./.next/static

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port Next.js
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Utiliser dumb-init pour gérer les signaux correctement
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage en mode production
CMD ["node", "server.js"]
