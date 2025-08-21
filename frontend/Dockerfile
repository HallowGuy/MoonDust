# --- Build stage ---
FROM node:20-alpine AS build

# Installer bash & utilitaires utiles
RUN apk add --no-cache bash

# Dossier de travail
WORKDIR /app

# Copier uniquement package.json et lockfile pour optimiser le cache
COPY package*.json ./

# Installer les dépendances (prod + dev car on a besoin de vite pour build)
RUN npm install

# Copier le reste du code source
COPY . .

# Construire le front (sortie = /app/dist)
RUN npm run build


# --- Runtime stage ---
FROM nginx:alpine

# Supprimer la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre config nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build du front vers nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port HTTP
EXPOSE 80

# Démarrer nginx en avant-plan
CMD ["nginx", "-g", "daemon off;"]
