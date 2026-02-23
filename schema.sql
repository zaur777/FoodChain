-- Database Schema for FoodSafe HACCP Manager

-- Companies Table
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

-- HACCP Plans Table
CREATE TABLE IF NOT EXISTS haccp_plans (
  id TEXT,
  company_id TEXT,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, company_id)
);

-- Monitoring Logs Table
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

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- E-Documentation Table
CREATE TABLE IF NOT EXISTS e_documents (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
