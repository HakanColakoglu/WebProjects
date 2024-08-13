import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT_MAIN_APP || 3000;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Route to generate the project list
app.get('/', async (req, res) => {
  try {
    // Read the JSON file using fs/promises
    const data = await fs.readFile(path.join(__dirname, 'config', 'projects.json'), 'utf8');

    // Parse the JSON data
    const projects = JSON.parse(data);

    // Generate the HTML
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>My Node.js Projects</title>
          <link rel="stylesheet" href="/style.css">
      </head>
      <body>
          <h1>My Node.js Projects</h1>
          <div class="project-list">
    `;

    // Add each project to the HTML
    projects.forEach(project => {
      html += `
        <div class="project">
            <div class="header"><a class="link" href="${project.link}" target="_blank">${project.header}</a></div>
            <div class="description">${project.description}</div>
        </div>
      `;
    });

    html += `
          </div>
      </body>
      </html>
    `;

    // Send the generated HTML to the client
    res.send(html);

  } catch (err) {
    console.error('Error reading projects.json:', err);
    res.status(500).send('Error reading project data');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
