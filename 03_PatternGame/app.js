import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import gameRoute from "./routes/game.js";

dotenv.config();
const PORT = process.env.PORT_PATTERN_GAME || 3003;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/", gameRoute);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
