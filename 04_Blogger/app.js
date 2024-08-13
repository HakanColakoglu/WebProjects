import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import blogRoutes from "./routes/blog_routes.js"; // Import blog routes

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT_BLOGGER || 3004;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Pass environment variables to routes
app.use(
  blogRoutes({
    dbUser: process.env.DB_USER,
    dbHost: process.env.DB_HOST,
    dbDatabase: process.env.DB_DATABASE,
    dbPassword: process.env.DB_PASSWORD,
    dbPort: process.env.DB_PORT,
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/*
Env variables are undefined in route files, hence the passing those variables in this file.
Some discussions shows a solution but for now I won't bother.
https://github.com/vercel/next.js/discussions/58962
https://nextjs.org/docs/app/building-your-application/routing/route-handlers#opting-out-of-caching

"
Is the .env file present at build time?
This function might be getting optimized into an static JSON file.
Try adding export const dynamic = 'force-dynamic' to the file.
"

*/
