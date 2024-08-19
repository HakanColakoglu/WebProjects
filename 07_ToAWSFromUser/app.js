import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cors from "cors";
dotenv.config();
const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bucketName = process.env.BUCKET_NAME;
const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const metadataFile = path.join(__dirname, "metadata.json");

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all route

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Generate a presigned URL for uploading a video to S3
app.post("/generate-upload-url", async (req, res) => {
  const { tagName } = req.body;
  const uniqueFileName = `${Date.now()}-${tagName}.mp4`; // Adjust extension based on file type if needed
  const params = {
    Bucket: bucketName,
    Key: uniqueFileName,
    ContentType: "video/mp4", // Adjust content type based on file type
  };

  try {
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand(params),
      { expiresIn: 3600 }
    ); // 1 hour expiry

    // Save metadata
    const newMetadata = { tagName, fileName: uniqueFileName };
    let metadataList = [];
    if (fs.existsSync(metadataFile)) {
      const data = fs.readFileSync(metadataFile);
      metadataList = JSON.parse(data);
    }
    metadataList.push(newMetadata);
    fs.writeFileSync(metadataFile, JSON.stringify(metadataList, null, 2));

    res.json({ uploadUrl, uniqueFileName });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).send("Error generating upload URL.");
  }
});

// Generate a presigned URL for streaming a video from S3
app.get("/get-video-url/:tagName", async (req, res) => {
  const { tagName } = req.params;

  try {
    const metadataList = JSON.parse(fs.readFileSync(metadataFile));
    const metadata = metadataList.find((meta) => meta.tagName === tagName);

    if (!metadata) {
      return res.status(404).send("Error: Video not found.");
    }

    const params = {
      Bucket: bucketName,
      Key: metadata.fileName,
    };

    const videoUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(params),
      { expiresIn: 3600 }
    ); // 1 hour expiry

    res.json({ videoUrl });
  } catch (error) {
    console.error("Error generating video URL:", error);
    res.status(500).send("Error generating video URL.");
  }
});

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

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "directs3.html"));
});

app.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
