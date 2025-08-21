# Backend Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install all dependencies (including dev for development use)
RUN npm install

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

