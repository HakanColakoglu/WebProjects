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
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

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

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Function to upload a file to S3
async function uploadToS3(fileName, filePath) {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileStream,
  };
  await s3Client.send(new PutObjectCommand(uploadParams));
}

// Function to download a file from S3
async function downloadFromS3(fileName, downloadPath) {
  const downloadParams = {
    Bucket: bucketName,
    Key: fileName,
  };
  const command = new GetObjectCommand(downloadParams);
  const { Body } = await s3Client.send(command);

  const pipelineAsync = promisify(pipeline);
  await pipelineAsync(Body, createWriteStream(downloadPath));
} // https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_UsingLargeFiles_section.html

// Function to delete a file from S3
async function deleteFromS3(fileName) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  };
  await s3Client.send(new DeleteObjectCommand(deleteParams));
}

// Upload all videos to S3 and remove from local storage
app.post("/upload-all", async (req, res) => {
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataFile));
    for (const { fileName } of metadata) {
      const filePath = path.join(__dirname, "uploads", fileName);
      await uploadToS3(fileName, filePath);
      fs.unlinkSync(filePath); // Remove file from server after uploading
    }
    res.send("All videos uploaded and removed from server.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading videos.");
  }
});

// Download all videos from S3 to local storage
app.post("/download-all", async (req, res) => {
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataFile));
    for (const { fileName } of metadata) {
      const downloadPath = path.join(__dirname, "uploads", fileName);
      await downloadFromS3(fileName, downloadPath);
    }
    res.send("All videos downloaded to server.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading videos.");
  }
});

// Clean all videos from S3 based on metadata
app.post("/clean-cloud", async (req, res) => {
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataFile));
    for (const { fileName } of metadata) {
      await deleteFromS3(fileName);
    }
    res.send("All videos removed from the cloud.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error cleaning cloud.");
  }
});

app.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
