FROM node:22-alpine

# Variables Vite (facultatif si tu les passes au run/compose)
ARG VITE_API_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_REALM
ARG VITE_FRONT_ID
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}
ENV VITE_REALM=${VITE_REALM}
ENV VITE_FRONT_ID=${VITE_FRONT_ID}

# Pour que le HMR détecte les changements via volume bind
ENV CHOKIDAR_USEPOLLING=true

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

EXPOSE 3002
# Vite dev: bind sur 0.0.0.0 pour être accessible depuis l’hôte
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3002"]
