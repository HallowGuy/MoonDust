FROM node:22-alpine as build

# Optionally bake API URL and Keycloak vars at build time
ARG VITE_API_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_REALM
ARG VITE_FRONT_ID
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}
ENV VITE_REALM=${VITE_REALM}
ENV VITE_FRONT_ID=${VITE_FRONT_ID}

WORKDIR /usr/src/app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

FROM nginx:alpine
# Ici on copie le dossier "build" (car outDir = 'build' dans vite.config.mjs)
COPY --from=build /usr/src/app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
