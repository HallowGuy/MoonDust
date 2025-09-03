// middlewares/multer.js
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ---------- MULTER CONFIG ----------

// 🔹 Logo storage
const storageLogo = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/logo")),
  filename: (req, file, cb) => cb(null, "theme-logo.svg"), // ✅ écrase toujours
})
export const uploadLogo = multer({ storage: storageLogo })

// 🔹 Generic uploads storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
  },
})
export const upload = multer({ storage })
