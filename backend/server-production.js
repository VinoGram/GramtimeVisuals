const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const sgMail = require('@sendgrid/mail');
const stripe = require('stripe');
const PDFDocument = require('pdfkit');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize services
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Multer configuration for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Database initialization
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS galleries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        access_token VARCHAR(255) UNIQUE NOT NULL,
        cover_image TEXT,
        event_date DATE,
        event_type VARCHAR(100),
        description TEXT,
        expiry_date DATE DEFAULT (CURRENT_DATE + INTERVAL '90 days'),
        allow_downloads BOOLEAN DEFAULT true,
        allow_favorites BOOLEAN DEFAULT true,
        allow_shopping BOOLEAN DEFAULT true,
        watermarked BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        campaign_type VARCHAR(50) NOT NULL,
        subject VARCHAR(255),
        content TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'sent',
        metadata JSONB DEFAULT '{}'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        cloudinary_public_id VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        width INTEGER,
        height INTEGER,
        file_size BIGINT,
        order_index INTEGER DEFAULT 0,
        is_selected BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'lead',
        source VARCHAR(100) DEFAULT 'website',
        event_type VARCHAR(100),
        event_date DATE,
        budget VARCHAR(100),
        consultation_date DATE,
        consultation_time TIME,
        last_contact DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        tags JSONB DEFAULT '[]',
        gallery_access_token VARCHAR(255),
        total_spent DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
        photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
        client_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(gallery_id, photo_id, client_ip)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS downloads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
        gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
        client_ip VARCHAR(45),
        download_type VARCHAR(50) DEFAULT 'single',
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50),
        consultation_type VARCHAR(100) NOT NULL,
        consultation_date DATE NOT NULL,
        consultation_time TIME NOT NULL,
        event_type VARCHAR(100),
        event_date DATE,
        budget VARCHAR(100),
        message TEXT,
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        session_type VARCHAR(100),
        budget VARCHAR(100),
        timeline VARCHAR(100),
        message TEXT,
        source VARCHAR(50) DEFAULT 'website',
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
        photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
        product_type VARCHAR(100) NOT NULL,
        size VARCHAR(50),
        quantity INTEGER DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        client_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
        client_email VARCHAR(255) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        stripe_payment_intent_id VARCHAR(255),
        items JSONB NOT NULL,
        shipping_address JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
        client_ip VARCHAR(45),
        user_agent TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Real-time session management
const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('gallery-auth', (data) => {
    const { galleryId, token } = data;
    activeSessions.set(socket.id, { galleryId, token, lastActivity: Date.now() });
    socket.join(`gallery-${galleryId}`);
  });

  socket.on('gallery-activity', (data) => {
    const session = activeSessions.get(socket.id);
    if (session) {
      session.lastActivity = Date.now();
      // Broadcast activity to other users in the same gallery
      socket.to(`gallery-${session.galleryId}`).emit('user-activity', {
        type: data.type,
        timestamp: Date.now()
      });
    }
  });

  socket.on('disconnect', () => {
    activeSessions.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

// Clean up inactive sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes
  
  for (const [socketId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > timeout) {
      activeSessions.delete(socketId);
    }
  }
}, 5 * 60 * 1000);

// Email service
async function sendEmail(to, subject, html, templateData = {}) {
  try {
    const msg = {
      to,
      from: {
        email: process.env.FROM_EMAIL,
        name: 'Gramtime Visuals'
      },
      subject,
      html
    };

    await sgMail.send(msg);
    console.log('Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Email Marketing Service
const sendMarketingEmail = async (clientId, campaignType, customData = {}) => {
  try {
    const client = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (!client.rows[0]) return;

    const clientData = client.rows[0];
    const templates = {
      weekly_offer: {
        subject: '🎯 This Week Only: Exclusive Photography Offer Inside!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Hello ${clientData.name}!</h2>
            <p>We have an exclusive offer just for you this week:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #e74c3c;">${customData.offerTitle || '20% Off Portrait Sessions'}</h3>
              <p>${customData.offerDescription || 'Book your portrait session this week and save 20%!'}</p>
              <p><strong>Valid until:</strong> ${customData.validUntil || 'End of this week'}</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/booking" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Book Now</a>
          </div>
        `
      },
      festive: {
        subject: `🎉 ${customData.festivalName || 'Special'} Photography Packages Available!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Dear ${clientData.name},</h2>
            <p>Celebrate ${customData.festivalName || 'this special season'} with our exclusive photography packages!</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center;">
              <h3>${customData.packageTitle || 'Festive Photography Package'}</h3>
              <p style="font-size: 18px;">${customData.packageDescription || 'Capture your special moments with our premium festive package'}</p>
              <p style="font-size: 24px; font-weight: bold;">${customData.discount || '30% OFF'}</p>
            </div>
            <p>Limited time offer - book before ${customData.deadline || 'month end'}!</p>
            <a href="${process.env.FRONTEND_URL}/booking" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Book Your Session</a>
          </div>
        `
      },
      follow_up: {
        subject: 'Thank you for choosing us! Special offer inside 💝',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Thank you ${clientData.name}!</h2>
            <p>We hope you loved your recent photography session with us.</p>
            <p>As a valued client, we'd like to offer you an exclusive discount for your next booking:</p>
            <div style="background: #2ecc71; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3>15% OFF Your Next Session</h3>
              <p>Use code: LOYAL15</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/booking" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Book Again</a>
          </div>
        `
      }
    };

    const template = templates[campaignType];
    if (template) {
      await sendEmail(clientData.email, template.subject, template.html);
      
      // Log campaign
      await pool.query(
        'INSERT INTO email_campaigns (client_id, campaign_type, subject, content, sent_at, status) VALUES ($1, $2, $3, $4, NOW(), $5)',
        [clientId, campaignType, template.subject, template.html, 'sent']
      );
    }
  } catch (error) {
    console.error('Marketing email failed:', error);
  }
};

// Bulk email campaign
const sendBulkCampaign = async (campaignType, customData = {}, clientFilter = {}) => {
  try {
    let query = 'SELECT id FROM clients WHERE 1=1';
    const params = [];
    
    if (clientFilter.status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(clientFilter.status);
    }
    
    if (clientFilter.lastBooking) {
      query += ' AND last_contact >= $' + (params.length + 1);
      params.push(clientFilter.lastBooking);
    }

    const clients = await pool.query(query, params);
    
    for (const client of clients.rows) {
      await sendMarketingEmail(client.id, campaignType, customData);
      await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
    }
    
    console.log(`Bulk campaign sent to ${clients.rows.length} clients`);
  } catch (error) {
    console.error('Bulk campaign failed:', error);
  }
};

// Auto-update CRM from booking
const updateCRMFromBooking = async (bookingData) => {
  try {
    // Check if client exists
    let client = await pool.query('SELECT id FROM clients WHERE email = $1', [bookingData.email]);
    
    if (client.rows.length === 0) {
      // Create new client
      const newClient = await pool.query(
        `INSERT INTO clients (name, email, phone, status, source, notes, created_at, last_contact) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
        [
          bookingData.name,
          bookingData.email,
          bookingData.phone || '',
          'lead',
          'website_booking',
          `Initial consultation booking: ${bookingData.consultation_type}. Message: ${bookingData.message || 'No message'}`
        ]
      );
      client = newClient;
    } else {
      // Update existing client
      await pool.query(
        `UPDATE clients SET 
         last_contact = NOW(), 
         status = CASE WHEN status = 'inactive' THEN 'active' ELSE status END,
         notes = COALESCE(notes, '') || $1
         WHERE email = $2`,
        [`\n[${new Date().toISOString()}] New booking: ${bookingData.consultation_type}`, bookingData.email]
      );
    }
    
    // Send follow-up email after 24 hours
    setTimeout(async () => {
      await sendMarketingEmail(client.rows[0].id, 'follow_up');
    }, 24 * 60 * 60 * 1000);
    
  } catch (error) {
    console.error('CRM update failed:', error);
  }
};

// Image upload to Cloudinary
async function uploadToCloudinary(buffer, filename, galleryId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `galleries/${galleryId}`,
        public_id: `${Date.now()}-${filename}`,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 2000, height: 2000, crop: 'limit' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

// Generate thumbnail
async function generateThumbnail(publicId) {
  return cloudinary.url(publicId, {
    transformation: [
      { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
    ]
  });
}

// Analytics tracking
async function trackEvent(galleryId, eventType, photoId = null, clientIp, userAgent, metadata = {}) {
  try {
    await pool.query(
      'INSERT INTO analytics (gallery_id, event_type, photo_id, client_ip, user_agent, metadata) VALUES ($1, $2, $3, $4, $5, $6)',
      [galleryId, eventType, photoId, clientIp, userAgent, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

// Routes

// Gallery Authentication
app.post('/api/gallery/auth', async (req, res) => {
  try {
    const { galleryId, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM galleries WHERE (id = $1 OR access_token = $1) AND is_active = true',
      [galleryId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Gallery not found' });
    }

    const gallery = result.rows[0];

    // Check if gallery has expired
    if (gallery.expiry_date && new Date() > new Date(gallery.expiry_date)) {
      return res.status(401).json({ error: 'Gallery has expired' });
    }

    const isValidPassword = await bcrypt.compare(password, gallery.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { galleryId: gallery.id, clientEmail: gallery.client_email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Track gallery access
    await trackEvent(gallery.id, 'gallery_access', null, req.ip, req.get('User-Agent'));

    res.json({
      token,
      gallery: {
        id: gallery.id,
        title: gallery.title,
        clientName: gallery.client_name,
        eventDate: gallery.event_date,
        eventType: gallery.event_type,
        description: gallery.description,
        coverImage: gallery.cover_image,
        allowDownloads: gallery.allow_downloads,
        allowFavorites: gallery.allow_favorites,
        allowShopping: gallery.allow_shopping,
        expiryDate: gallery.expiry_date
      }
    });
  } catch (error) {
    console.error('Gallery auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Gallery with Photos
app.get('/api/gallery/:id', authenticateToken, async (req, res) => {
  try {
    const galleryId = req.params.id;

    // Get gallery details
    const galleryResult = await pool.query(
      'SELECT * FROM galleries WHERE id = $1 AND is_active = true',
      [galleryId]
    );

    if (galleryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    const gallery = galleryResult.rows[0];

    // Get photos
    const photosResult = await pool.query(
      'SELECT * FROM photos WHERE gallery_id = $1 ORDER BY order_index, created_at',
      [galleryId]
    );

    // Get favorites for this client
    const favoritesResult = await pool.query(
      'SELECT photo_id FROM favorites WHERE gallery_id = $1 AND client_ip = $2',
      [galleryId, req.ip]
    );

    const favoriteIds = favoritesResult.rows.map(row => row.photo_id);

    const photos = photosResult.rows.map(photo => ({
      id: photo.id,
      url: photo.url,
      thumbnail: photo.thumbnail_url,
      filename: photo.filename,
      width: photo.width,
      height: photo.height,
      favorite: favoriteIds.includes(photo.id),
      selected: false
    }));

    // Track gallery view
    await trackEvent(galleryId, 'gallery_view', null, req.ip, req.get('User-Agent'));

    res.json({
      ...gallery,
      password_hash: undefined,
      images: photos
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle Favorite
app.post('/api/gallery/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { imageId } = req.body;
    const galleryId = req.params.id;
    const clientIp = req.ip;

    // Check if already favorited
    const existingResult = await pool.query(
      'SELECT id FROM favorites WHERE gallery_id = $1 AND photo_id = $2 AND client_ip = $3',
      [galleryId, imageId, clientIp]
    );

    if (existingResult.rows.length > 0) {
      // Remove favorite
      await pool.query(
        'DELETE FROM favorites WHERE gallery_id = $1 AND photo_id = $2 AND client_ip = $3',
        [galleryId, imageId, clientIp]
      );
      await trackEvent(galleryId, 'favorite_removed', imageId, clientIp, req.get('User-Agent'));
    } else {
      // Add favorite
      await pool.query(
        'INSERT INTO favorites (gallery_id, photo_id, client_ip) VALUES ($1, $2, $3)',
        [galleryId, imageId, clientIp]
      );
      await trackEvent(galleryId, 'favorite_added', imageId, clientIp, req.get('User-Agent'));
    }

    // Get updated favorites
    const favoritesResult = await pool.query(
      'SELECT photo_id FROM favorites WHERE gallery_id = $1 AND client_ip = $2',
      [galleryId, clientIp]
    );

    // Emit real-time update
    io.to(`gallery-${galleryId}`).emit('favorites-updated', {
      photoId: imageId,
      action: existingResult.rows.length > 0 ? 'removed' : 'added'
    });

    res.json({ 
      success: true, 
      favorites: favoritesResult.rows.map(row => row.photo_id) 
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload Photos to Gallery
app.post('/api/gallery/:id/upload', authenticateToken, upload.array('photos', 50), async (req, res) => {
  try {
    const galleryId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, file.originalname, galleryId);
        
        // Generate thumbnail
        const thumbnailUrl = await generateThumbnail(result.public_id);

        // Save to database
        const photoResult = await pool.query(
          `INSERT INTO photos (gallery_id, url, thumbnail_url, cloudinary_public_id, filename, width, height, file_size)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            galleryId,
            result.secure_url,
            thumbnailUrl,
            result.public_id,
            file.originalname,
            result.width,
            result.height,
            result.bytes
          ]
        );

        uploadedPhotos.push(photoResult.rows[0]);
      } catch (uploadError) {
        console.error('Individual file upload error:', uploadError);
      }
    }

    // Emit real-time update
    io.to(`gallery-${galleryId}`).emit('photos-uploaded', {
      count: uploadedPhotos.length,
      photos: uploadedPhotos
    });

    res.json({
      success: true,
      uploaded: uploadedPhotos.length,
      failed: files.length - uploadedPhotos.length,
      photos: uploadedPhotos
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Continue with more routes...
// Shopping Cart
app.post('/api/cart/add', authenticateToken, async (req, res) => {
  try {
    const { galleryId, imageId, productType, price, quantity = 1, size } = req.body;
    const clientIp = req.ip;

    const result = await pool.query(
      `INSERT INTO cart_items (gallery_id, photo_id, product_type, size, quantity, price, client_ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [galleryId, imageId, productType, size, quantity, price, clientIp]
    );

    await trackEvent(galleryId, 'cart_add', imageId, clientIp, req.get('User-Agent'), { productType, price });

    res.json({ success: true, item: result.rows[0] });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/cart/:galleryId', authenticateToken, async (req, res) => {
  try {
    const galleryId = req.params.galleryId;
    const clientIp = req.ip;

    const result = await pool.query(
      `SELECT c.*, p.url, p.thumbnail_url, p.filename 
       FROM cart_items c
       JOIN photos p ON c.photo_id = p.id
       WHERE c.gallery_id = $1 AND c.client_ip = $2
       ORDER BY c.created_at DESC`,
      [galleryId, clientIp]
    );

    res.json({ cart: result.rows });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Consultations
app.post('/api/consultations', async (req, res) => {
  try {
    const {
      consultation,
      date,
      time,
      client: { firstName, lastName, email, phone, eventType, eventDate, budget, message }
    } = req.body;

    const result = await pool.query(
      `INSERT INTO consultations (client_name, client_email, client_phone, consultation_type, 
       consultation_date, consultation_time, event_type, event_date, budget, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        `${firstName} ${lastName}`,
        email,
        phone,
        consultation.title,
        date,
        time,
        eventType,
        eventDate,
        budget,
        message
      ]
    );

    // Update CRM with new booking
    await updateCRMFromBooking({ 
      name: `${firstName} ${lastName}`, 
      email, 
      phone, 
      consultation_type: consultation.title, 
      message 
    });

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Consultation Confirmed</h2>
        <p>Dear ${firstName},</p>
        <p>Your <strong>${consultation.title}</strong> has been confirmed for:</p>
        <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-left: 4px solid #111827;">
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Duration:</strong> ${consultation.duration}</p>
        </div>
        <p>We'll send you a reminder 24 hours before your consultation.</p>
        <p>Looking forward to meeting you!</p>
        <p>Best regards,<br>Gramtime Visuals Team</p>
      </div>
    `;

    await sendEmail(email, 'Consultation Confirmed - Gramtime Visuals', emailHtml);
    
    // Emit real-time update to CRM dashboard
    io.emit('crm_update', {
      type: 'new_booking',
      data: { name: `${firstName} ${lastName}`, email, consultation_type: consultation.title, status: 'lead' }
    });

    res.json({ success: true, consultation: result.rows[0] });
  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Inquiries
app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, phone, sessionType, budget, timeline, message, source = 'website' } = req.body;

    const result = await pool.query(
      `INSERT INTO inquiries (name, email, phone, session_type, budget, timeline, message, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, email, phone, sessionType, budget, timeline, message, source]
    );

    // Send confirmation email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Thank You for Your Inquiry</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your interest in Gramtime Visuals. We've received your inquiry and will respond within 24 hours.</p>
        <div style="background: #f9fafb; padding: 20px; margin: 20px 0;">
          <h3>Your Inquiry Details:</h3>
          <p><strong>Session Type:</strong> ${sessionType}</p>
          ${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ''}
          ${timeline ? `<p><strong>Timeline:</strong> ${timeline}</p>` : ''}
        </div>
        <p>We're excited to learn more about your vision and discuss how we can bring it to life.</p>
        <p>Best regards,<br>Gramtime Visuals Team</p>
      </div>
    `;

    await sendEmail(email, 'Thank You for Your Inquiry - Gramtime Visuals', clientEmailHtml);

    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">New Inquiry Received</h2>
        <div style="background: #f9fafb; padding: 20px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Session Type:</strong> ${sessionType}</p>
          <p><strong>Budget:</strong> ${budget || 'Not specified'}</p>
          <p><strong>Timeline:</strong> ${timeline || 'Not specified'}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p>Please respond within 24 hours.</p>
      </div>
    `;

    await sendEmail(process.env.ADMIN_EMAIL, 'New Inquiry - Gramtime Visuals', adminEmailHtml);

    res.json({ success: true, inquiry: result.rows[0] });
  } catch (error) {
    console.error('Submit inquiry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// CRM - Clients
app.get('/api/clients', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    let query = `
      SELECT c.*, 
             COUNT(co.id) as total_bookings,
             MAX(co.created_at) as last_booking_date,
             COALESCE(SUM(o.total), 0) as total_spent
      FROM clients c
      LEFT JOIN consultations co ON c.email = co.client_email
      LEFT JOIN orders o ON c.email = o.client_email
      WHERE 1=1
    `;
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND c.status = $' + (params.length + 1);
      params.push(status);
    }
    
    if (search) {
      query += ' AND (c.name ILIKE $' + (params.length + 1) + ' OR c.email ILIKE $' + (params.length + 2) + ')';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` 
      GROUP BY c.id 
      ORDER BY c.created_at DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, (page - 1) * limit);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM clients WHERE 1=1';
    const countParams = [];
    
    if (status && status !== 'all') {
      countQuery += ' AND status = $' + (countParams.length + 1);
      countParams.push(status);
    }
    
    if (search) {
      countQuery += ' AND (name ILIKE $' + (countParams.length + 1) + ' OR email ILIKE $' + (countParams.length + 2) + ')';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      clients: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update client status
app.put('/api/clients/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE clients SET status = $1, last_contact = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Emit real-time update
    io.emit('crm_update', {
      type: 'status_change',
      data: { id, status, name: result.rows[0].name }
    });
    
    res.json({ success: true, client: result.rows[0] });
  } catch (error) {
    console.error('Update client status error:', error);
    res.status(500).json({ error: 'Failed to update client status' });
  }
});

// Email Marketing Endpoints

// Send weekly offer campaign
app.post('/api/campaigns/weekly-offer', async (req, res) => {
  try {
    const { offerTitle, offerDescription, validUntil, clientFilter } = req.body;
    
    await sendBulkCampaign('weekly_offer', {
      offerTitle,
      offerDescription,
      validUntil
    }, clientFilter);
    
    res.json({ success: true, message: 'Weekly offer campaign sent' });
  } catch (error) {
    console.error('Weekly offer campaign error:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

// Send festive campaign
app.post('/api/campaigns/festive', async (req, res) => {
  try {
    const { festivalName, packageTitle, packageDescription, discount, deadline, clientFilter } = req.body;
    
    await sendBulkCampaign('festive', {
      festivalName,
      packageTitle,
      packageDescription,
      discount,
      deadline
    }, clientFilter);
    
    res.json({ success: true, message: 'Festive campaign sent' });
  } catch (error) {
    console.error('Festive campaign error:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

// Get campaign history
app.get('/api/campaigns', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ec.*, c.name, c.email 
      FROM email_campaigns ec
      JOIN clients c ON ec.client_id = c.id
      ORDER BY ec.sent_at DESC
      LIMIT 100
    `);
    
    res.json({ campaigns: result.rows });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// CRM Analytics
app.get('/api/crm/analytics', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN status = 'lead' THEN 1 END) as leads,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_clients,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_clients,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
      FROM clients
    `);
    
    const bookings = await pool.query(`
      SELECT COUNT(*) as total_bookings,
             COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as this_week
      FROM consultations
    `);
    
    const campaigns = await pool.query(`
      SELECT campaign_type, COUNT(*) as count
      FROM email_campaigns
      WHERE sent_at >= NOW() - INTERVAL '30 days'
      GROUP BY campaign_type
    `);
    
    res.json({
      clients: stats.rows[0],
      bookings: bookings.rows[0],
      campaigns: campaigns.rows
    });
  } catch (error) {
    console.error('CRM analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.post('/api/clients/:id/notes', async (req, res) => {
  try {
    const clientId = req.params.id;
    const { note } = req.body;

    // Get current notes
    const clientResult = await pool.query('SELECT notes FROM clients WHERE id = $1', [clientId]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const currentNotes = clientResult.rows[0].notes || '';
    const timestamp = new Date().toISOString();
    const newNote = `\n[${timestamp}] ${note}`;
    const updatedNotes = currentNotes + newNote;

    await pool.query(
      'UPDATE clients SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [updatedNotes, clientId]
    );

    res.json({ success: true, notes: updatedNotes });
  } catch (error) {
    console.error('Add client note error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Payment Processing with Stripe
app.post('/api/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'usd', galleryId, items } = req.body;

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        galleryId,
        items: JSON.stringify(items)
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, galleryId, clientEmail, items, shippingAddress } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Create order record
    const orderResult = await pool.query(
      `INSERT INTO orders (gallery_id, client_email, total, status, stripe_payment_intent_id, items, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        galleryId,
        clientEmail,
        paymentIntent.amount / 100,
        'completed',
        paymentIntentId,
        JSON.stringify(items),
        JSON.stringify(shippingAddress)
      ]
    );

    // Clear cart
    await pool.query(
      'DELETE FROM cart_items WHERE gallery_id = $1 AND client_ip = $2',
      [galleryId, req.ip]
    );

    // Send order confirmation email
    const orderEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Order Confirmation</h2>
        <p>Thank you for your order!</p>
        <div style="background: #f9fafb; padding: 20px; margin: 20px 0;">
          <h3>Order #${orderResult.rows[0].id}</h3>
          <p><strong>Total:</strong> $${(paymentIntent.amount / 100).toFixed(2)}</p>
          <p><strong>Status:</strong> Processing</p>
        </div>
        <p>We'll send you updates as your order is processed.</p>
        <p>Best regards,<br>Gramtime Visuals Team</p>
      </div>
    `;

    await sendEmail(clientEmail, 'Order Confirmation - Gramtime Visuals', orderEmailHtml);

    res.json({ success: true, order: orderResult.rows[0] });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PDF Generation
app.post('/api/generate-agreement', async (req, res) => {
  try {
    const { clientName, packageName, eventDate, eventLocation, terms } = req.body;

    const doc = new PDFDocument();
    let buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="agreement-${clientName.replace(/\s+/g, '-')}.pdf"`);
      res.send(pdfData);
    });

    // PDF Content
    doc.fontSize(20).text('PHOTOGRAPHY SERVICE AGREEMENT', 50, 50);
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Client Name: ${clientName}`);
    doc.text(`Package: ${packageName}`);
    doc.text(`Event Date: ${eventDate}`);
    doc.text(`Event Location: ${eventLocation}`);
    doc.moveDown();
    
    doc.text('TERMS OF SERVICE:', { underline: true });
    doc.moveDown();
    
    terms.forEach((term, index) => {
      doc.text(`${index + 1}. ${term}`);
      doc.moveDown(0.5);
    });
    
    doc.moveDown();
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Client Signature: _________________________`);
    
    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download tracking
app.post('/api/gallery/:id/download', authenticateToken, async (req, res) => {
  try {
    const galleryId = req.params.id;
    const { imageIds, type } = req.body;
    const clientIp = req.ip;

    // Track downloads
    for (const imageId of imageIds) {
      await pool.query(
        'INSERT INTO downloads (photo_id, gallery_id, client_ip, download_type) VALUES ($1, $2, $3, $4)',
        [imageId, galleryId, clientIp, type]
      );
      
      await trackEvent(galleryId, 'photo_download', imageId, clientIp, req.get('User-Agent'), { type });
    }

    // In production, create zip file and return download URL
    const downloadToken = jwt.sign(
      { galleryId, imageIds, type },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      downloadUrl: `/api/download/${downloadToken}`,
      message: 'Download prepared successfully'
    });
  } catch (error) {
    console.error('Download request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Analytics
app.get('/api/analytics/:galleryId', async (req, res) => {
  try {
    const galleryId = req.params.galleryId;

    const [views, downloads, favorites, topPhotos] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM analytics WHERE gallery_id = $1 AND event_type = $2', [galleryId, 'gallery_view']),
      pool.query('SELECT COUNT(*) as count FROM downloads WHERE gallery_id = $1', [galleryId]),
      pool.query('SELECT COUNT(*) as count FROM favorites WHERE gallery_id = $1', [galleryId]),
      pool.query(`
        SELECT p.id, p.filename, COUNT(a.id) as views
        FROM photos p
        LEFT JOIN analytics a ON p.id = a.photo_id AND a.event_type = 'photo_view'
        WHERE p.gallery_id = $1
        GROUP BY p.id, p.filename
        ORDER BY views DESC
        LIMIT 10
      `, [galleryId])
    ]);

    res.json({
      views: parseInt(views.rows[0].count),
      downloads: parseInt(downloads.rows[0].count),
      favorites: parseInt(favorites.rows[0].count),
      topPhotos: topPhotos.rows
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      timestamp: new Date(),
      database: 'connected',
      activeSessions: activeSessions.size
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Real-time features enabled`);
      console.log(`📧 Email service configured`);
      console.log(`☁️  Cloudinary integration active`);
      console.log(`💳 Stripe payments enabled`);
      console.log(`📄 PDF generation ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;