# Dockerfile - located at ./frontend/angular/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy both dependency files
COPY package*.json ./

# Install dependencies including express
RUN npm install

# Copy the rest of the app
COPY . .

# Start the server
CMD ["npm", "start"]
