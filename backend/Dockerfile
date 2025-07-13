# Dockerfile pour le dossier Backend
# Ce fichier permet de construire l'image Docker de la partie serveur de l'application
# Les commentaires détaillent chaque instruction pour faciliter la compréhension

# Nous partons d'une image officielle de Node, adaptée aux applications serveur en JavaScript/TypeScript
FROM node:20

# Définition du répertoire de travail à l'intérieur du conteneur
WORKDIR /app

# Copie des fichiers de gestion des dépendances
COPY package*.json ./

# Installation des dépendances du backend
RUN npm ci || npm install

# Copie du reste du code source
COPY . .

# La commande par défaut peut être personnalisée lors du lancement du conteneur
CMD ["npm", "run", "start:prod"]

# Fin du Dockerfile backend
