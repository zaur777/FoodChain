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
        tax_id TEXT,
        phone TEXT,
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

      CREATE TABLE IF NOT EXISTS e_documents (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        type TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

  app.post("/api/auth/register", async (req, res) => {
    const { id, name, email, taxId, phone, plan } = req.body;
    if (!email || !name) return res.status(400).json({ error: "Email and name are required" });

    try {
      const result = await pool.query(
        `INSERT INTO companies (id, name, email, tax_id, phone, plan) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (email) DO UPDATE SET name = $2, tax_id = $4, phone = $5, plan = $6
         RETURNING *`,
        [id || `comp-${Date.now()}`, name, email, taxId, phone, plan || 'Small']
      );
      const row = result.rows[0];
      res.json({
        id: row.id,
        name: row.name,
        email: row.email,
        taxId: row.tax_id,
        phone: row.phone,
        plan: row.plan
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const result = await pool.query("SELECT * FROM companies WHERE email = $1", [email]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Company not found" });
      const row = result.rows[0];
      res.json({
        id: row.id,
        name: row.name,
        email: row.email,
        taxId: row.tax_id,
        phone: row.phone,
        plan: row.plan
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  });
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

  // E-Documentation Routes
  app.get("/api/documents", async (req, res) => {
    const { companyId, type } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    try {
      let query = "SELECT data FROM e_documents WHERE company_id = $1";
      const params = [companyId];
      if (type) {
        query += " AND type = $2";
        params.push(type as string);
      }
      query += " ORDER BY created_at DESC";
      const result = await pool.query(query, params);
      res.json(result.rows.map(row => row.data));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    const { companyId, document } = req.body;
    if (!companyId || !document) return res.status(400).json({ error: "companyId and document are required" });

    try {
      await pool.query(
        `INSERT INTO e_documents (id, company_id, type, data) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET data = $4`,
        [document.id, companyId, document.type, document]
      );
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save document" });
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
