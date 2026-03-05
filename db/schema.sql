
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('GUEST', 'COMPANY', 'TPP_ADMIN', 'GOV_USER')) DEFAULT 'GUEST',
  is_verified BOOLEAN DEFAULT 0,
  notification_preferences TEXT DEFAULT '{"email_news":true,"email_b2b":true,"push_status":true}', -- JSON
  telegram_chat_id INTEGER,
  telegram_username TEXT,
  telegram_link_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_user_id INTEGER NOT NULL,
  inn TEXT UNIQUE NOT NULL,
  ogrn TEXT,
  full_name TEXT NOT NULL,
  short_name TEXT,
  status TEXT CHECK(status IN ('ON_MODERATION', 'VERIFIED', 'BLOCKED')) DEFAULT 'ON_MODERATION',
  region_id INTEGER DEFAULT 65, -- 65 is Sakhalin region code
  is_tpp_member BOOLEAN DEFAULT 0,
  has_quality_mark BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

-- Company Profiles (Public info)
CREATE TABLE IF NOT EXISTS company_profiles (
  company_id INTEGER PRIMARY KEY,
  description TEXT,
  industry_code TEXT,
  city TEXT,
  website TEXT,
  logo_url TEXT,
  is_exporter BOOLEAN DEFAULT 0,
  tags TEXT, -- JSON array of strings
  phone TEXT,
  email TEXT,
  address TEXT,
  ceo_name TEXT,
  employees_count INTEGER,
  founding_year INTEGER,
  annual_turnover TEXT,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  plan_type TEXT CHECK(plan_type IN ('PARTICIPANT', 'PARTNER', 'STRATEGIC')) DEFAULT 'PARTICIPANT',
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- B2B Requests
CREATE TABLE IF NOT EXISTS b2b_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  request_type TEXT CHECK(request_type IN ('BUY', 'SELL', 'PARTNERSHIP', 'INVEST')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK(status IN ('OPEN', 'CLOSED', 'ARCHIVED')) DEFAULT 'OPEN',
  deadline DATETIME,
  budget REAL,
  tags TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- VED Requests (International Trade)
CREATE TABLE IF NOT EXISTS ved_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  service_type TEXT CHECK(service_type IN ('CONSULTATION', 'EXPORT_SUPPORT', 'TRANSLATION', 'LOGISTICS', 'CERTIFICATION')) NOT NULL,
  direction TEXT CHECK(direction IN ('EXPORT', 'IMPORT')) NOT NULL,
  target_countries TEXT, -- JSON array
  product_desc TEXT,
  status TEXT CHECK(status IN ('NEW', 'PROCESSING', 'DONE', 'REJECTED')) DEFAULT 'NEW',
  admin_comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- e.g., 'view_profile', 'click_contact'
  target_company_id INTEGER,
  actor_ip TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- News
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  media TEXT, -- JSON array of { type: 'image' | 'video', url: string }
  is_published BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Support Measures
CREATE TABLE IF NOT EXISTS support_measures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'SUBSIDY', 'GRANT', 'LOAN', 'EDUCATION'
  amount TEXT,
  provider TEXT NOT NULL,
  deadline DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
