# Dockerfile pour servir le frontend via Nginx
FROM nginx:alpine

# Copie de la configuration personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers statiques
COPY . /usr/share/nginx/html

# Aucun CMD supplémentaire : l'image nginx lance automatiquement le serveur
