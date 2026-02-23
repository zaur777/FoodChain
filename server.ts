import express from "express";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const app = express();

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
        password_hash TEXT,
        tax_id TEXT,
        phone TEXT,
        plan TEXT DEFAULT 'Small',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS haccp_plans (
        id TEXT,
        company_id TEXT,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, company_id)
      );

      CREATE TABLE IF NOT EXISTS monitoring_logs (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        ccp_id TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        value NUMERIC NOT NULL,
        unit TEXT,
        operator TEXT,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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
        `INSERT INTO companies (id, name, email, is_verified) 
         VALUES ($1, $2, $3, TRUE) 
         ON CONFLICT (email) DO UPDATE SET name = $2, is_verified = TRUE
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
    const { id, name, email, password, taxId, phone, plan } = req.body;
    if (!email || !name) return res.status(400).json({ error: "Email and name are required" });

    try {
      const passwordHash = password ? await bcrypt.hash(password, 10) : null;
      const verificationToken = Math.random().toString(36).substring(2, 15);

      const result = await pool.query(
        `INSERT INTO companies (id, name, email, password_hash, tax_id, phone, plan, verification_token) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT (email) DO UPDATE SET name = $2, tax_id = $5, phone = $6, plan = $7
         RETURNING *`,
        [id || `comp-${Date.now()}`, name, email, passwordHash, taxId, phone, plan || 'Small', verificationToken]
      );
      const row = result.rows[0];

      // Mock email verification - in a real app, you'd send an email here
      console.log(`Verification link for ${email}: ${process.env.APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${verificationToken}`);

      res.json({
        id: row.id,
        name: row.name,
        email: row.email,
        taxId: row.tax_id,
        phone: row.phone,
        plan: row.plan,
        isVerified: row.is_verified,
        message: "Registration successful. Please verify your email (check server logs for mock link)."
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.get("/api/auth/verify", async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Token is required");

    try {
      const result = await pool.query(
        "UPDATE companies SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING *",
        [token]
      );

      if (result.rows.length === 0) return res.status(400).send("Invalid or expired token");

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8fafc;">
            <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center;">
              <h1 style="color: #4f46e5;">Email Verified!</h1>
              <p style="color: #64748b;">Your account has been successfully verified. You can now log in to the application.</p>
              <a href="/" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #4f46e5; color: white; text-decoration: none; border-radius: 0.5rem;">Go to App</a>
            </div>
          </body>
        </html>
      `);
    } catch (err) {
      console.error(err);
      res.status(500).send("Verification failed");
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const result = await pool.query("SELECT * FROM companies WHERE email = $1", [email]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Company not found" });
      
      const row = result.rows[0];

      if (row.password_hash && password) {
        const isValid = await bcrypt.compare(password, row.password_hash);
        if (!isValid) return res.status(401).json({ error: "Invalid password" });
      } else if (row.password_hash && !password) {
        return res.status(401).json({ error: "Password required for this account" });
      }

      if (!row.is_verified) {
        return res.status(403).json({ error: "Please verify your email before logging in." });
      }

      res.json({
        id: row.id,
        name: row.name,
        email: row.email,
        taxId: row.tax_id,
        phone: row.phone,
        plan: row.plan,
        isVerified: row.is_verified
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

  // Monitoring Logs Routes
  app.get("/api/monitoring", async (req, res) => {
    const { companyId, ccpId } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    try {
      let query = "SELECT * FROM monitoring_logs WHERE company_id = $1";
      const params = [companyId];
      if (ccpId) {
        query += " AND ccp_id = $2";
        params.push(ccpId as string);
      }
      query += " ORDER BY timestamp DESC LIMIT 100";
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch monitoring logs" });
    }
  });

  app.post("/api/monitoring", async (req, res) => {
    const { companyId, log } = req.body;
    if (!companyId || !log) return res.status(400).json({ error: "companyId and log are required" });

    try {
      await pool.query(
        `INSERT INTO monitoring_logs (id, company_id, ccp_id, value, unit, operator, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [log.id || `log-${Date.now()}`, companyId, log.ccpId, log.value, log.unit, log.operator, log.status]
      );
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save monitoring log" });
    }
  });

  // Alerts Routes
  app.get("/api/alerts", async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    try {
      const result = await pool.query(
        "SELECT * FROM alerts WHERE company_id = $1 ORDER BY created_at DESC",
        [companyId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts/read", async (req, res) => {
    const { companyId, alertId } = req.body;
    if (!companyId || !alertId) return res.status(400).json({ error: "companyId and alertId are required" });

    try {
      await pool.query(
        "UPDATE alerts SET is_read = TRUE WHERE id = $1 AND company_id = $2",
        [alertId, companyId]
      );
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

async function startServer() {
  const PORT = 3000;
  await initDb();

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

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}
export default app; // BU ÇOX VACİBDİR

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
startServer();
