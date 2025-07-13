# Dockerfile pour le dossier Frontend
# Ce fichier sert à construire l'image Docker utilisée pour développer et exécuter la partie Front de l'application
# Les commentaires sont très verbeux afin d'expliquer chaque étape pour les débutants

# Utilisation d'une image Node officielle comme base
# Node est couramment utilisé pour les applications web frontend
FROM node:20

# Définition du dossier de travail à l'intérieur du conteneur
WORKDIR /app

# Copie des fichiers package.json et package-lock.json (s'ils existent) pour installer les dépendances en premier
# Cela permet de profiter du cache Docker si les dépendances n'ont pas changé entre deux constructions
COPY package*.json ./

# Installation des dépendances du projet
# On utilise npm ci pour une installation reproductible si package-lock.json est présent
RUN npm ci || npm install

# Copie du reste des fichiers du projet dans le conteneur
COPY . .

# Par défaut, cette image ne lance pas l'application
# L'utilisateur pourra spécifier la commande à exécuter lors du lancement du conteneur
CMD ["npm", "start"]

# Fin du Dockerfile frontend
