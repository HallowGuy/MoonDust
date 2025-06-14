# Build image for the Next.js frontend using Node 18
FROM node:18-alpine

# Create application directory
WORKDIR /app

# Install dependencies defined in package.json
COPY package.json ./
RUN npm install

# Copy application source code
COPY . .

# Start the development server
CMD ["npm", "run", "dev"]
