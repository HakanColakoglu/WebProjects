import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import { S3Client,  PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("videoFile");

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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/upload", async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send(`Error: ${err}`);
    } else if (req.file == undefined) {
      return res.status(400).send("Error: No File Selected!");
    }

    try {
      const params = {
        Bucket: bucketName,
        Key: req.file.originalname, // Use the original name of the file
        Body: req.file.buffer, // Use the file buffer directly
        ContentType: req.file.mimetype,
      };
      const command = new PutObjectCommand(params);
      await s3.send(command);

      res.redirect("/");
    } catch (uploadError) {
      console.error("S3 Upload Error:", uploadError);
      res.status(500).send("Error: Failed to upload file.");
    }
  });
});

app.get("/videos", (req, res) => {
  fs.readdir("./uploads", (err, files) => {
    if (err) {
      res.status(500).send("Error: Unable to scan directory.");
    } else {
      res.json(files);
    }
  });
});

app.get("/video/:filename", (req, res) => {
  const videoPath = path.join(process.cwd(), "uploads", req.params.filename);
  res.sendFile(videoPath);
});

app.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
