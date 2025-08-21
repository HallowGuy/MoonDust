# MoonDust

Bootstrap project structure with database, backend, and frontend services.

## Architecture
- **database**: PostgreSQL 16 with initialization scripts.
- **backend**: Node.js/Express API available on port 3000.
- **frontend**: Nginx serving static files and proxying `/api` requests to the backend.

## Requirements
- Docker with Docker Compose plugin.
- Node.js (optional, for running backend tests locally).

## Running the stack
```bash
docker compose up --build
```
The frontend will be available on [http://localhost:8080](http://localhost:8080) and proxy API calls to the backend.

## Development
To run backend tests:
```bash
cd backend
npm test
```
Regenerate `package-lock.json` by running `npm install` once network access is available.

## Structure
```
backend/     # Node backend
  index.js   # Express application
  Dockerfile
  package.json
  package-lock.json

frontend/    # Nginx static front
  index.html
  nginx.conf
  Dockerfile

database/    # PostgreSQL database
  initdb/    # SQL initialization scripts
  Dockerfile

docker-compose.yml
```
