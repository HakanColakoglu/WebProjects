import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Storage for multer to save uploaded files locally
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("videoFile");

// Check file type
function checkFileType(file, cb) {
  const filetypes = /mp4|mov|avi|mkv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Videos Only!");
  }
}

// Store metadata in a JSON file
const metadataFile = path.join(__dirname, "metadata.json");

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle file upload and metadata saving
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).send(`Error: ${err}`);
    } else if (req.file == undefined) {
      return res.status(400).send("Error: No File Selected!");
    }

    const tagName = req.body.tagName;
    const uniqueName = req.file.filename;

    // Save metadata
    const newMetadata = { tagName, fileName: uniqueName };
    fs.readFile(metadataFile, (err, data) => {
      let metadataList = [];

      if (!err) {
        metadataList = JSON.parse(data);
      }

      // Check if the tag already exists
      const existingMetadataIndex = metadataList.findIndex(
        (meta) => meta.tagName === tagName
      );

      if (existingMetadataIndex !== -1) {
        // If tag exists, delete the associated file from the server
        const existingFileName = metadataList[existingMetadataIndex].fileName;
        const filePath = path.join(__dirname, "uploads", existingFileName);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting existing file: ${err}`);
            return res.status(500).send("Error deleting the existing file.");
          }

          console.log(
            `Existing file ${existingFileName} deleted successfully.`
          );
        });

        // Remove the old metadata entry
        metadataList.splice(existingMetadataIndex, 1);
      }

      // Add new metadata
      metadataList.push(newMetadata);

      // Save updated metadata to the file
      fs.writeFile(
        metadataFile,
        JSON.stringify(metadataList, null, 2),
        (err) => {
          if (err) {
            console.error("Error saving metadata:", err);
            return res.status(500).send("Error saving metadata.");
          }

          res.redirect("/");
        }
      );
    });
  });
});

// Route to list uploaded videos (by tag)
app.get("/videos", (req, res) => {
  fs.readFile(metadataFile, (err, data) => {
    if (err) {
      return res.status(500).send("Error: Unable to read metadata.");
    }
    const metadataList = JSON.parse(data);
    const tagList = metadataList.map((metadata) => metadata.tagName);
    res.json(tagList);
  });
});

// Serve video by tag
app.get("/video/:tagName", (req, res) => {
  const tagName = req.params.tagName;
  fs.readFile(metadataFile, (err, data) => {
    if (err) {
      return res.status(500).send("Error: Unable to read metadata.");
    }
    const metadataList = JSON.parse(data);
    const metadata = metadataList.find((meta) => meta.tagName === tagName);

    if (!metadata) {
      return res.status(404).send("Error: Video not found.");
    }

    const videoPath = path.join(__dirname, "uploads", metadata.fileName);
    res.sendFile(videoPath);
  });
});

// Handle video deletion by tag
app.delete("/video/:tagName", (req, res) => {
  const tagName = req.params.tagName;

  // Read metadata to find the corresponding file name
  fs.readFile(metadataFile, (err, data) => {
    if (err) {
      return res.status(500).send("Error: Unable to read metadata.");
    }
    let metadataList = JSON.parse(data);
    const metadata = metadataList.find((meta) => meta.tagName === tagName);

    if (!metadata) {
      return res.status(404).send("Error: Video not found.");
    }

    const videoPath = path.join(__dirname, "uploads", metadata.fileName);

    // Delete the file from the file system
    fs.unlink(videoPath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
        return res.status(500).send("Error: Could not delete the file.");
      }

      // Remove metadata entry
      metadataList = metadataList.filter((meta) => meta.tagName !== tagName);

      fs.writeFile(
        metadataFile,
        JSON.stringify(metadataList, null, 2),
        (err) => {
          if (err) {
            console.error("Error updating metadata:", err);
            return res.status(500).send("Error: Could not update metadata.");
          }
          res.sendStatus(200);
        }
      );
    });
  });
});

app.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
