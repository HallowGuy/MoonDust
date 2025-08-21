# ---- Dépendances ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Installer toutes les dépendances (dev incluses pour nodemon en mode dev)
RUN npm install

# ---- Runner ----
FROM node:20-alpine AS runner
WORKDIR /app

# Node env injecté par docker-compose (development ou production)
ENV NODE_ENV=$NODE_ENV

# Copier node_modules depuis deps
COPY --from=deps /app/node_modules ./node_modules

# Copier le reste du code
COPY . .

# Sécurité : utiliser l’utilisateur node
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Commande par défaut (écrasée si besoin par docker-compose)
CMD ["npm", "start"]
