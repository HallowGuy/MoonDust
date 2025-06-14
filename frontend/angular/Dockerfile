# Build image for the Angular frontend using Node 18
FROM node:18-alpine

# Create application directory
WORKDIR /app

# Install Angular CLI globally and project dependencies
COPY package.json ./
RUN npm install -g @angular/cli && npm install

# Copy application source code
COPY . .

# Start the Angular development server
CMD ["npm", "start"]
