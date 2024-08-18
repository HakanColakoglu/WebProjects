import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Set storage for multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("videoFile");

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /mp4|mov|avi|mkv/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Videos Only!");
  }
}

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle file upload
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.send(`Error: ${err}`);
    } else {
      if (req.file == undefined) {
        res.send("Error: No File Selected!");
      } else {
        res.redirect("/");
      }
    }
  });
});

// Route to list uploaded videos
app.get("/videos", (req, res) => {
  fs.readdir("./uploads", (err, files) => {
    if (err) {
      res.send("Error: Unable to scan directory.");
    } else {
      res.json(files);
    }
  });
});

// Serve videos from uploads folder
app.get("/video/:filename", (req, res) => {
  const videoPath = path.join(process.cwd(), "uploads", req.params.filename);
  res.sendFile(videoPath);
});

app.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
