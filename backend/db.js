// db.js
import pkg from "pg"
const { Pool } = pkg

export const DB_SCHEMA = process.env.DB_SCHEMA || "demo_first"

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,  // "db" si tu es en docker-compose
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
})

export default pool
