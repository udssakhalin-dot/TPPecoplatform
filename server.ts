import express from "express";
import { createServer as createViteServer } from "vite";
import db, { initDb } from "./db/index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-prod";

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  try {
    initDb();
    // Migration for media column
    try {
      db.prepare('ALTER TABLE news ADD COLUMN media TEXT').run();
    } catch (e) {
      // Column likely exists
    }
    // Migration for support_measures
    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS support_measures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT NOT NULL,
          amount TEXT,
          provider TEXT NOT NULL,
          deadline DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (e) {
      console.error('Failed to create support_measures table', e);
    }
    // Migration for company flags
    try {
      db.prepare('ALTER TABLE companies ADD COLUMN is_tpp_member BOOLEAN DEFAULT 0').run();
    } catch (e) {
      // Column likely exists
    }
    try {
      db.prepare('ALTER TABLE companies ADD COLUMN has_quality_mark BOOLEAN DEFAULT 0').run();
    } catch (e) {
      // Column likely exists
    }
    // Migration for company_profiles new fields
    try { db.prepare('ALTER TABLE company_profiles ADD COLUMN phone TEXT').run(); } catch (e) {}
    try { db.prepare('ALTER TABLE company_profiles ADD COLUMN email TEXT').run(); } catch (e) {}
    try { db.prepare('ALTER TABLE company_profiles ADD COLUMN address TEXT').run(); } catch (e) {}
    try { db.prepare('ALTER TABLE company_profiles ADD COLUMN ceo_name TEXT').run(); } catch (e) {}
    try { db.prepare('ALTER TABLE company_profiles ADD COLUMN employees_count INTEGER').run(); } catch (e) {}
    try { db.prepare('ALTER TABLE company_profiles ADD COLUMN founding_year INTEGER').run(); } catch (e) {}
    try { db.prepare('ALTER TABLE company_profiles ADD COLUMN annual_turnover TEXT').run(); } catch (e) {}
    seedDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Territory Business Platform API" });
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, inn, companyName } = req.body;

    try {
      // Check if user exists
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Check if company exists (by INN)
      const existingCompany = db.prepare('SELECT * FROM companies WHERE inn = ?').get(inn);
      if (existingCompany) {
        return res.status(400).json({ error: "Company with this INN already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Transaction: Create User -> Create Company
      const insertUser = db.prepare('INSERT INTO users (email, password_hash, role, is_verified) VALUES (?, ?, ?, ?)');
      const insertCompany = db.prepare('INSERT INTO companies (owner_user_id, inn, full_name, status, region_id) VALUES (?, ?, ?, ?, ?)');

      const transaction = db.transaction(() => {
        const userResult = insertUser.run(email, hashedPassword, 'COMPANY', 0);
        const userId = userResult.lastInsertRowid;
        
        insertCompany.run(userId, inn, companyName, 'ON_MODERATION', 65);
        
        return userId;
      });

      const userId = transaction();

      // Generate Token
      const token = jwt.sign({ id: userId, email, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({ token, user: { id: userId, email, role: 'COMPANY' } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare('SELECT id, email, role, is_verified, created_at FROM users WHERE id = ?').get(req.user.id);
      if (!user) return res.sendStatus(404);

      // Fetch company info if user is a company owner
      let company = null;
      if (user.role === 'COMPANY') {
        company = db.prepare('SELECT * FROM companies WHERE owner_user_id = ?').get(user.id);
      }

      res.json({ user, company });
    } catch (error) {
      console.error("Auth check error:", error);
      res.sendStatus(500);
    }
  });

  // Account Settings Routes
  app.post("/api/auth/change-password", authenticateToken, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid current password" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashedPassword, req.user.id);

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to change password', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/auth/notifications", authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare('SELECT notification_preferences FROM users WHERE id = ?').get(req.user.id) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      res.json(JSON.parse(user.notification_preferences || '{}'));
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put("/api/auth/notifications", authenticateToken, (req: any, res) => {
    const preferences = req.body;

    try {
      db.prepare('UPDATE users SET notification_preferences = ? WHERE id = ?').run(JSON.stringify(preferences), req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update notifications', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Telegram Integration Routes
  app.post("/api/auth/telegram/generate-code", authenticateToken, (req: any, res) => {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      db.prepare('UPDATE users SET telegram_link_code = ? WHERE id = ?').run(code, req.user.id);
      res.json({ code });
    } catch (error) {
      console.error('Failed to generate telegram code', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/auth/telegram/status", authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare('SELECT telegram_chat_id, telegram_username FROM users WHERE id = ?').get(req.user.id) as any;
      res.json({
        connected: !!user.telegram_chat_id,
        username: user.telegram_username
      });
    } catch (error) {
      console.error('Failed to fetch telegram status', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post("/api/auth/telegram/unlink", authenticateToken, (req: any, res) => {
    try {
      db.prepare('UPDATE users SET telegram_chat_id = NULL, telegram_username = NULL WHERE id = ?').run(req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to unlink telegram', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post("/api/auth/telegram/test-notification", authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare('SELECT telegram_chat_id FROM users WHERE id = ?').get(req.user.id) as any;
      if (!user.telegram_chat_id) {
        return res.status(400).json({ error: "Telegram not connected" });
      }

      sendTelegramMessage(user.telegram_chat_id, "🔔 Это тестовое уведомление от платформы ТЕРРИТОРИЯ БИЗНЕСА.");
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to send test notification', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Public Webhook for Telegram (Simulated)
  app.post("/api/webhooks/telegram", (req, res) => {
    const { message } = req.body;
    
    if (!message || !message.text || !message.chat) {
      return res.sendStatus(400);
    }

    if (message.text.startsWith('/start ')) {
      const code = message.text.split(' ')[1];
      if (code) {
        try {
          const user = db.prepare('SELECT id FROM users WHERE telegram_link_code = ?').get(code) as any;
          
          if (user) {
            db.prepare(`
              UPDATE users 
              SET telegram_chat_id = ?, telegram_username = ?, telegram_link_code = NULL 
              WHERE id = ?
            `).run(message.chat.id, message.chat.username, user.id);

            sendTelegramMessage(message.chat.id, "✅ Ваш аккаунт успешно привязан! Теперь вы будете получать уведомления здесь.");
            console.log(`User ${user.id} linked to Telegram chat ${message.chat.id}`);
          } else {
            sendTelegramMessage(message.chat.id, "❌ Неверный код привязки. Попробуйте сгенерировать новый код на сайте.");
          }
        } catch (error) {
          console.error('Webhook error', error);
        }
      }
    }

    res.sendStatus(200);
  });

  // Debug endpoint to simulate user sending a message to the bot
  app.post("/api/debug/simulate-telegram", (req, res) => {
    const { code, chat_id, username } = req.body;
    
    // Call the webhook handler logic directly via HTTP
    // We can just fetch ourselves or extract logic. Fetching is easier to keep logic in one place.
    // But since we are in the same process, let's just mock the request to the webhook handler logic?
    // Actually, let's just duplicate the logic call or use fetch if available.
    // Node 18+ has fetch.
    
    fetch(`http://localhost:${PORT}/api/webhooks/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: chat_id || 12345, username: username || 'test_user' },
          text: `/start ${code}`
        }
      })
    }).then(r => {
      res.json({ success: true, status: r.status });
    }).catch(e => {
      res.status(500).json({ error: e.message });
    });
  });

  // Helper function (Mock)
  function sendTelegramMessage(chatId: number, text: string) {
    console.log(`[TELEGRAM MOCK] To ${chatId}: ${text}`);
    // In production, this would call:
    // fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, ...)
  }

  // Company Management Routes
  app.get("/api/company/my-profile", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'COMPANY') return res.sendStatus(403);

    try {
      const company = db.prepare('SELECT * FROM companies WHERE owner_user_id = ?').get(req.user.id) as any;
      if (!company) return res.status(404).json({ error: "Company not found" });

      const profile = db.prepare('SELECT * FROM company_profiles WHERE company_id = ?').get(company.id);
      
      res.json({ ...company, profile });
    } catch (error) {
      console.error('Failed to fetch my profile', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put("/api/company/my-profile", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'COMPANY') return res.sendStatus(403);

    const { 
      description, website, city, industry_code, tags,
      phone, email, address, ceo_name, employees_count, founding_year, annual_turnover
    } = req.body;

    try {
      const company = db.prepare('SELECT id FROM companies WHERE owner_user_id = ?').get(req.user.id) as any;
      if (!company) return res.status(404).json({ error: "Company not found" });

      // Check if profile exists
      const existingProfile = db.prepare('SELECT company_id FROM company_profiles WHERE company_id = ?').get(company.id);

      if (existingProfile) {
        const update = db.prepare(`
          UPDATE company_profiles 
          SET description = ?, website = ?, city = ?, industry_code = ?, tags = ?,
              phone = ?, email = ?, address = ?, ceo_name = ?, employees_count = ?, founding_year = ?, annual_turnover = ?
          WHERE company_id = ?
        `);
        update.run(
          description, website, city, industry_code, JSON.stringify(tags || []),
          phone, email, address, ceo_name, employees_count, founding_year, annual_turnover,
          company.id
        );
      } else {
        const insert = db.prepare(`
          INSERT INTO company_profiles (
            company_id, description, website, city, industry_code, tags,
            phone, email, address, ceo_name, employees_count, founding_year, annual_turnover
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insert.run(
          company.id, description, website, city, industry_code, JSON.stringify(tags || []),
          phone, email, address, ceo_name, employees_count, founding_year, annual_turnover
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update profile', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/company/subscription", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'COMPANY') return res.sendStatus(403);

    try {
      const company = db.prepare('SELECT id FROM companies WHERE owner_user_id = ?').get(req.user.id) as any;
      if (!company) return res.status(404).json({ error: "Company not found" });

      const subscription = db.prepare('SELECT * FROM subscriptions WHERE company_id = ? AND is_active = 1').get(company.id);
      
      res.json(subscription || { plan_type: 'NONE', is_active: false });
    } catch (error) {
      console.error('Failed to fetch subscription', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post("/api/company/subscription", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'COMPANY') return res.sendStatus(403);
    const { plan_type } = req.body;

    if (!['PARTICIPANT', 'PARTNER', 'STRATEGIC'].includes(plan_type)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    try {
      const company = db.prepare('SELECT id FROM companies WHERE owner_user_id = ?').get(req.user.id) as any;
      if (!company) return res.status(404).json({ error: "Company not found" });

      // Deactivate old subscription
      db.prepare('UPDATE subscriptions SET is_active = 0 WHERE company_id = ?').run(company.id);

      // Create new subscription
      const insert = db.prepare(`
        INSERT INTO subscriptions (company_id, plan_type, start_date, is_active)
        VALUES (?, ?, CURRENT_TIMESTAMP, 1)
      `);
      insert.run(company.id, plan_type);
      
      res.json({ success: true, plan_type });
    } catch (error) {
      console.error('Failed to update subscription', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // B2B Request Routes
  app.post("/api/b2b/requests", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'COMPANY') return res.sendStatus(403);

    const { title, description, request_type, deadline, budget, tags } = req.body;

    try {
      const company = db.prepare('SELECT id FROM companies WHERE owner_user_id = ?').get(req.user.id) as any;
      if (!company) return res.status(404).json({ error: "Company not found" });

      const insert = db.prepare(`
        INSERT INTO b2b_requests (company_id, title, description, request_type, status, deadline, budget, tags)
        VALUES (?, ?, ?, ?, 'OPEN', ?, ?, ?)
      `);
      
      const result = insert.run(company.id, title, description, request_type, deadline, budget, JSON.stringify(tags || []));
      
      res.json({ id: result.lastInsertRowid, success: true });
    } catch (error) {
      console.error('Failed to create B2B request', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/b2b/requests", (req, res) => {
    try {
      const requests = db.prepare(`
        SELECT r.*, c.full_name as company_name 
        FROM b2b_requests r
        JOIN companies c ON r.company_id = c.id
        WHERE r.status = 'OPEN'
        ORDER BY r.created_at DESC
      `).all();
      
      const parsedRequests = requests.map((r: any) => ({
        ...r,
        tags: JSON.parse(r.tags || '[]')
      }));

      res.json(parsedRequests);
    } catch (error) {
      console.error('Failed to fetch B2B requests', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/b2b/my-requests", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'COMPANY') return res.sendStatus(403);

    try {
      const company = db.prepare('SELECT id FROM companies WHERE owner_user_id = ?').get(req.user.id) as any;
      if (!company) return res.status(404).json({ error: "Company not found" });

      const requests = db.prepare(`
        SELECT * FROM b2b_requests 
        WHERE company_id = ?
        ORDER BY created_at DESC
      `).all(company.id);
      
      const parsedRequests = requests.map((r: any) => ({
        ...r,
        tags: JSON.parse(r.tags || '[]')
      }));

      res.json(parsedRequests);
    } catch (error) {
      console.error('Failed to fetch my B2B requests', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/b2b/requests/:id", (req, res) => {
    try {
      const request = db.prepare(`
        SELECT r.*, c.full_name as company_name, c.inn
        FROM b2b_requests r
        JOIN companies c ON r.company_id = c.id
        WHERE r.id = ?
      `).get(req.params.id) as any;

      if (!request) return res.status(404).json({ error: "Request not found" });

      res.json({
        ...request,
        tags: JSON.parse(request.tags || '[]')
      });
    } catch (error) {
      console.error('Failed to fetch B2B request', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // VED Request Routes
  app.post("/api/ved/requests", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'COMPANY') return res.sendStatus(403);

    const { service_type, direction, target_countries, product_desc } = req.body;

    try {
      const company = db.prepare('SELECT id FROM companies WHERE owner_user_id = ?').get(req.user.id) as any;
      if (!company) return res.status(404).json({ error: "Company not found" });

      const insert = db.prepare(`
        INSERT INTO ved_requests (company_id, service_type, direction, target_countries, product_desc, status)
        VALUES (?, ?, ?, ?, ?, 'NEW')
      `);
      
      const result = insert.run(company.id, service_type, direction, JSON.stringify(target_countries || []), product_desc);
      
      res.json({ id: result.lastInsertRowid, success: true });
    } catch (error) {
      console.error('Failed to create VED request', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/ved/my-requests", authenticateToken, (req: any, res) => {
    if (req.user.role !== 'COMPANY') return res.sendStatus(403);

    try {
      const company = db.prepare('SELECT id FROM companies WHERE owner_user_id = ?').get(req.user.id) as any;
      if (!company) return res.status(404).json({ error: "Company not found" });

      const requests = db.prepare(`
        SELECT * FROM ved_requests 
        WHERE company_id = ?
        ORDER BY created_at DESC
      `).all(company.id);
      
      const parsedRequests = requests.map((r: any) => ({
        ...r,
        target_countries: JSON.parse(r.target_countries || '[]')
      }));

      res.json(parsedRequests);
    } catch (error) {
      console.error('Failed to fetch my VED requests', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Public Routes
  app.get("/api/companies", (req, res) => {
    try {
      const companies = db.prepare(`
        SELECT c.*, p.city, p.industry_code, p.logo_url, p.description
        FROM companies c
        LEFT JOIN company_profiles p ON c.id = p.company_id
        WHERE c.status = 'VERIFIED'
        ORDER BY c.created_at DESC
      `).all();
      res.json(companies);
    } catch (error) {
      console.error('Failed to fetch companies', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/companies/:id", (req, res) => {
    try {
      const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
      if (!company) return res.status(404).json({ error: "Company not found" });
      
      // Get profile details
      const profile = db.prepare('SELECT * FROM company_profiles WHERE company_id = ?').get(req.params.id);
      
      res.json({ ...company, profile });
    } catch (error) {
      console.error('Failed to fetch company', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Protected Routes (Example)
  app.get("/api/dashboard/stats", authenticateToken, (req: any, res) => {
    // Mock stats for dashboard
    res.json({
      views: 120,
      requests: 5,
      ved_status: 'active'
    });
  });

  // Admin Middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'TPP_ADMIN') {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };

  // Admin Routes
  app.get("/api/admin/stats", authenticateToken, requireAdmin, (req: any, res) => {
    try {
      const usersCount = db.prepare('SELECT count(*) as count FROM users').get() as any;
      const companiesCount = db.prepare('SELECT count(*) as count FROM companies').get() as any;
      const b2bCount = db.prepare('SELECT count(*) as count FROM b2b_requests').get() as any;
      const vedCount = db.prepare('SELECT count(*) as count FROM ved_requests').get() as any;
      const pendingCompanies = db.prepare("SELECT count(*) as count FROM companies WHERE status = 'ON_MODERATION'").get() as any;

      const recentCompanies = db.prepare(`
        SELECT id, full_name, created_at, 'COMPANY' as type 
        FROM companies 
        ORDER BY created_at DESC LIMIT 5
      `).all();

      const recentB2B = db.prepare(`
        SELECT r.id, r.title, r.created_at, 'B2B' as type, c.full_name as company_name
        FROM b2b_requests r
        JOIN companies c ON r.company_id = c.id
        ORDER BY r.created_at DESC LIMIT 5
      `).all();

      const recentVED = db.prepare(`
        SELECT r.id, r.service_type as title, r.created_at, 'VED' as type, c.full_name as company_name
        FROM ved_requests r
        JOIN companies c ON r.company_id = c.id
        ORDER BY r.created_at DESC LIMIT 5
      `).all();

      // Combine and sort recent activity
      const recentActivity = [...recentCompanies, ...recentB2B, ...recentVED]
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      res.json({
        users: usersCount.count,
        companies: companiesCount.count,
        requests: b2bCount.count + vedCount.count,
        pending_companies: pendingCompanies.count,
        recent_activity: recentActivity
      });
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/admin/companies", authenticateToken, requireAdmin, (req: any, res) => {
    try {
      const companies = db.prepare(`
        SELECT c.*, u.email as owner_email 
        FROM companies c
        JOIN users u ON c.owner_user_id = u.id
        ORDER BY c.created_at DESC
      `).all();
      res.json(companies);
    } catch (error) {
      console.error('Failed to fetch admin companies', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/admin/companies/:id", authenticateToken, requireAdmin, (req: any, res) => {
    try {
      const company = db.prepare(`
        SELECT c.*, u.email as owner_email 
        FROM companies c
        JOIN users u ON c.owner_user_id = u.id
        WHERE c.id = ?
      `).get(req.params.id) as any;

      if (!company) return res.status(404).json({ error: "Company not found" });

      const profile = db.prepare('SELECT * FROM company_profiles WHERE company_id = ?').get(company.id);
      
      res.json({ ...company, profile });
    } catch (error) {
      console.error('Failed to fetch admin company details', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put("/api/admin/companies/:id/status", authenticateToken, requireAdmin, (req: any, res) => {
    const { status } = req.body;
    if (!['VERIFIED', 'BLOCKED', 'ON_MODERATION'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    try {
      db.prepare('UPDATE companies SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update company status', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put("/api/admin/companies/:id/flags", authenticateToken, requireAdmin, (req: any, res) => {
    const { is_tpp_member, has_quality_mark } = req.body;
    
    try {
      const updates = [];
      const params = [];
      
      if (is_tpp_member !== undefined) {
        updates.push('is_tpp_member = ?');
        params.push(is_tpp_member ? 1 : 0);
      }
      
      if (has_quality_mark !== undefined) {
        updates.push('has_quality_mark = ?');
        params.push(has_quality_mark ? 1 : 0);
      }
      
      if (updates.length > 0) {
        params.push(req.params.id);
        db.prepare(`UPDATE companies SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update company flags', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/admin/requests", authenticateToken, requireAdmin, (req: any, res) => {
    try {
      const b2b = db.prepare(`
        SELECT r.*, c.full_name as company_name, 'B2B' as type
        FROM b2b_requests r
        JOIN companies c ON r.company_id = c.id
        ORDER BY r.created_at DESC
      `).all();

      const ved = db.prepare(`
        SELECT r.*, c.full_name as company_name, 'VED' as type
        FROM ved_requests r
        JOIN companies c ON r.company_id = c.id
        ORDER BY r.created_at DESC
      `).all();

      res.json([...b2b, ...ved].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Failed to fetch admin requests', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/admin/requests/:type/:id", authenticateToken, requireAdmin, (req: any, res) => {
    const { type, id } = req.params;
    try {
      let request;
      if (type === 'B2B') {
        request = db.prepare(`
          SELECT r.*, c.full_name as company_name, c.inn, 'B2B' as type
          FROM b2b_requests r
          JOIN companies c ON r.company_id = c.id
          WHERE r.id = ?
        `).get(id) as any;
        if (request) {
          request.tags = JSON.parse(request.tags || '[]');
        }
      } else if (type === 'VED') {
        request = db.prepare(`
          SELECT r.*, c.full_name as company_name, c.inn, 'VED' as type
          FROM ved_requests r
          JOIN companies c ON r.company_id = c.id
          WHERE r.id = ?
        `).get(id) as any;
        if (request) {
          request.target_countries = JSON.parse(request.target_countries || '[]');
        }
      } else {
        return res.status(400).json({ error: "Invalid request type" });
      }

      if (!request) return res.status(404).json({ error: "Request not found" });
      res.json(request);
    } catch (error) {
      console.error('Failed to fetch admin request details', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put("/api/admin/requests/:type/:id/status", authenticateToken, requireAdmin, (req: any, res) => {
    const { type, id } = req.params;
    const { status } = req.body;
    
    try {
      if (type === 'B2B') {
        db.prepare('UPDATE b2b_requests SET status = ? WHERE id = ?').run(status, id);
      } else if (type === 'VED') {
        db.prepare('UPDATE ved_requests SET status = ? WHERE id = ?').run(status, id);
      } else {
        return res.status(400).json({ error: "Invalid request type" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update request status', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // File Upload
  app.post("/api/upload", authenticateToken, upload.single('file'), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Support Measures Endpoints
  app.get("/api/support-measures", (req, res) => {
    try {
      const measures = db.prepare('SELECT * FROM support_measures ORDER BY created_at DESC').all();
      res.json(measures);
    } catch (error) {
      console.error('Failed to fetch support measures', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post("/api/admin/support-measures", authenticateToken, requireAdmin, (req: any, res) => {
    const { title, description, type, amount, provider, deadline } = req.body;
    try {
      const result = db.prepare('INSERT INTO support_measures (title, description, type, amount, provider, deadline) VALUES (?, ?, ?, ?, ?, ?)').run(title, description, type, amount, provider, deadline);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error('Failed to create support measure', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put("/api/admin/support-measures/:id", authenticateToken, requireAdmin, (req: any, res) => {
    const { title, description, type, amount, provider, deadline } = req.body;
    try {
      db.prepare('UPDATE support_measures SET title = ?, description = ?, type = ?, amount = ?, provider = ?, deadline = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, description, type, amount, provider, deadline, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update support measure', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete("/api/admin/support-measures/:id", authenticateToken, requireAdmin, (req: any, res) => {
    try {
      db.prepare('DELETE FROM support_measures WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete support measure', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // News Endpoints
  app.get("/api/news", (req, res) => {
    try {
      const news = db.prepare('SELECT * FROM news WHERE is_published = 1 ORDER BY created_at DESC').all();
      const parsedNews = news.map((item: any) => ({
        ...item,
        media: JSON.parse(item.media || '[]')
      }));
      res.json(parsedNews);
    } catch (error) {
      console.error('Failed to fetch news', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/admin/news", authenticateToken, requireAdmin, (req: any, res) => {
    try {
      const news = db.prepare('SELECT * FROM news ORDER BY created_at DESC').all();
      const parsedNews = news.map((item: any) => ({
        ...item,
        media: JSON.parse(item.media || '[]')
      }));
      res.json(parsedNews);
    } catch (error) {
      console.error('Failed to fetch admin news', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post("/api/admin/news", authenticateToken, requireAdmin, (req: any, res) => {
    const { title, content, image_url, media, is_published } = req.body;
    try {
      const result = db.prepare('INSERT INTO news (title, content, image_url, media, is_published) VALUES (?, ?, ?, ?, ?)').run(title, content, image_url, JSON.stringify(media || []), is_published ? 1 : 0);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error('Failed to create news', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put("/api/admin/news/:id", authenticateToken, requireAdmin, (req: any, res) => {
    const { title, content, image_url, media, is_published } = req.body;
    try {
      db.prepare('UPDATE news SET title = ?, content = ?, image_url = ?, media = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, content, image_url, JSON.stringify(media || []), is_published ? 1 : 0, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update news', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete("/api/admin/news/:id", authenticateToken, requireAdmin, (req: any, res) => {
    try {
      db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete news', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function seedDatabase() {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    console.log('Seeding database...');
    
    // Create users
    const insertUser = db.prepare('INSERT INTO users (email, password_hash, role, is_verified) VALUES (?, ?, ?, ?)');
    // hash123 -> $2a$10$X7V... (pre-hashed for example or use bcrypt in seed script if async allowed, but better-sqlite is sync)
    // For simplicity in seed, we'll use a placeholder hash that won't work with real login unless we hash it properly.
    // Let's use a known hash for 'password': $2a$10$cwV.M.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X
    // Actually, let's just use a simple string and assume we'd re-register for testing or implement a proper seed script.
    // For now, let's skip complex seeding of passwords and rely on registration for auth testing.
    
    // But we need initial data for the registry page to work.
    // We will insert users with a valid hash for 'password123'
    const passwordHash = bcrypt.hashSync('password123', 10);

    const user1 = insertUser.run('admin@tpp.ru', passwordHash, 'TPP_ADMIN', 1);
    const user2 = insertUser.run('company1@example.com', passwordHash, 'COMPANY', 1);
    const user3 = insertUser.run('company2@example.com', passwordHash, 'COMPANY', 1);
    const user4 = insertUser.run('company3@example.com', passwordHash, 'COMPANY', 1);

    // Create companies
    const insertCompany = db.prepare('INSERT INTO companies (owner_user_id, inn, full_name, status, region_id) VALUES (?, ?, ?, ?, ?)');
    insertCompany.run(user2.lastInsertRowid, '6501000001', 'ООО "Сахалинская Энергия"', 'VERIFIED', 65);
    insertCompany.run(user3.lastInsertRowid, '6501000002', 'АО "Рыболовецкий колхоз им. Кирова"', 'VERIFIED', 65);
    insertCompany.run(user4.lastInsertRowid, '6501000003', 'ИП Иванов И.И. (Логистика)', 'ON_MODERATION', 65);

    // Seed News
    const insertNews = db.prepare('INSERT INTO news (title, content, is_published) VALUES (?, ?, ?)');
    insertNews.run('ТПП Сахалинской области запустила новую цифровую платформу', 'Мы рады представить новую платформу для бизнеса, которая объединит предпринимателей региона.', 1);
    insertNews.run('Встреча с делегацией из Китая', '15 марта состоится встреча с представителями бизнеса из провинции Хэйлунцзян. Приглашаем всех заинтересованных.', 1);
    insertNews.run('Новые меры поддержки экспортеров', 'Правительство утвердило новые субсидии для компаний, выходящих на рынки АТР.', 1);

    console.log('Database seeded!');
  }
}

startServer();
