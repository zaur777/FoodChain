import express from "express";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const getGoogleClient = (origin: string) => {
  const redirectUri = `${origin}/auth/google/callback`;
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
};

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        plan TEXT DEFAULT 'Small',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS haccp_plans (
        id TEXT,
        company_id TEXT,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, company_id)
      );
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("Database initialization failed", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  await initDb();

  // Auth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const origin = req.headers.origin || (process.env.APP_URL || "http://localhost:3000");
    const client = getGoogleClient(origin);
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });
    res.json({ url });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const origin = `${req.protocol}://${req.get('host')}`;
    const client = getGoogleClient(origin);

    try {
      const { tokens } = await client.getToken(code as string);
      client.setCredentials(tokens);

      const userInfoResponse = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });

      const { sub, name, email } = userInfoResponse.data as any;

      // Upsert company
      const result = await pool.query(
        `INSERT INTO companies (id, name, email) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (email) DO UPDATE SET name = $2
         RETURNING *`,
        [sub, name, email]
      );

      const company = result.rows[0];

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  company: ${JSON.stringify(company)} 
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (err) {
      console.error("Google OAuth error:", err);
      res.status(500).send("Authentication failed");
    }
  });

  // API Routes
  app.get("/api/plans", async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });
    
    try {
      const result = await pool.query(
        "SELECT data FROM haccp_plans WHERE company_id = $1 ORDER BY updated_at DESC",
        [companyId]
      );
      res.json(result.rows.map(row => row.data));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  app.post("/api/plans", async (req, res) => {
    const { companyId, plan } = req.body;
    if (!companyId || !plan) return res.status(400).json({ error: "companyId and plan are required" });

    try {
      await pool.query(
        `INSERT INTO haccp_plans (id, company_id, data, updated_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (id, company_id) DO UPDATE SET data = $3, updated_at = CURRENT_TIMESTAMP`,
        [plan.id, companyId, plan]
      );
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save plan" });
    }
  });

  app.delete("/api/plans/:id", async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    try {
      await pool.query("DELETE FROM haccp_plans WHERE id = $1 AND company_id = $2", [id, companyId]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete plan" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
