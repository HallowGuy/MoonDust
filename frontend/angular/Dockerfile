# Dockerfile - located at ./frontend/angular/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies, including express
RUN npm install

# Copy the rest of the app (including server.js and frontend code)
COPY . .

# Expose the port your server.js uses (commonly 3000 or 4200 — verify!)
EXPOSE 4200

# Start the server
CMD ["npm", "start"]
