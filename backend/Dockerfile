FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --production; fi

COPY . .

# Préparer les répertoires d'uploads et permissions pour utilisateur non-root
RUN mkdir -p /usr/src/app/uploads/logo \
  && chown -R node:node /usr/src/app

EXPOSE 5001

# Exécuter en non-root
USER node

CMD ["npm", "start"]
