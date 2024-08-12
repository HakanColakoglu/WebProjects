import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT_GAME_HEROES || 3002;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

let heroImageLinks;
fs.readFile("./config/heroImageLinks.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    return;
  }
  heroImageLinks = JSON.parse(data);
});

app.get("/", (req, res) => {
  res.render("index.ejs", {
    imageLink: "",
    heroName: "",
  });
});

app.post("/submit", (req, res) => {
  if (!heroImageLinks) {
    return res.status(500).send("Hero image links not loaded");
  }
  const randomNumber = Math.floor(Math.random() * heroImageLinks.length);
  res.render("index.ejs", heroImageLinks[randomNumber]);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
