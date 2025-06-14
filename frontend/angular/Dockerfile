FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install -g @angular/cli && npm install
COPY . .
CMD ["npm", "start"]
