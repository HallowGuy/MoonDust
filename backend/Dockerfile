# Backend Dockerfile (simplifié)
FROM node:20

# Dossier de travail
WORKDIR /app

# Copie des dépendances et installation
COPY package*.json ./
RUN npm ci

# Copie du code source
COPY . .

# Lancement de l’application en production
CMD ["npm", "run", "start:prod"]