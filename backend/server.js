const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// In-memory database (replace with real database in production)
let galleries = [
  {
    id: "gallery-001",
    clientName: "Sarah & Michael",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: wedding2024
    eventDate: "June 15, 2024",
    eventType: "Wedding",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    description: "Your beautiful wedding day at The Grand Estate",
    expiryDate: "September 15, 2024",
    allowDownloads: true,
    allowFavorites: true,
    allowShopping: true,
    watermarked: false,
    images: [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920",
        thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
        filename: "wedding_ceremony_001.jpg",
        width: 1920,
        height: 1280,
      },
      {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1920",
        thumbnail: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400",
        filename: "wedding_reception_002.jpg",
        width: 1920,
        height: 1280,
      },
      {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920",
        thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400",
        filename: "wedding_couple_003.jpg",
        width: 1920,
        height: 1280,
      },
    ],
  },
];

let clients = [
  {
    id: "1",
    name: "Sarah & Michael Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    status: "consultation-scheduled",
    eventType: "Wedding",
    eventDate: "2024-09-15",
    budget: "$20,000 - $35,000",
    consultationDate: "2024-03-20",
    consultationTime: "2:00 PM",
    lastContact: "2024-03-10",
    notes: [
      "Interested in full-day wedding coverage",
      "Venue: The Grand Estate",
      "Looking for elegant, timeless style",
    ],
    tags: ["High Priority", "Wedding", "Referred by Emily"],
  },
];

let consultations = [];
let inquiries = [];
let favorites = {};
let cart = {};

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Gallery Authentication
app.post('/api/gallery/auth', async (req, res) => {
  try {
    const { galleryId, password } = req.body;
    
    const gallery = galleries.find(g => g.id === galleryId);
    if (!gallery) {
      return res.status(401).json({ error: 'Invalid gallery ID or password' });
    }

    const isValidPassword = await bcrypt.compare(password, gallery.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid gallery ID or password' });
    }

    const token = jwt.sign(
      { galleryId: gallery.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      gallery: {
        ...gallery,
        password: undefined, // Don't send password back
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Gallery Details
app.get('/api/gallery/:id', authenticateToken, (req, res) => {
  try {
    const gallery = galleries.find(g => g.id === req.params.id);
    if (!gallery) {
      return res.status(404).json({ error: 'Gallery not found' });
    }

    // Add favorites and selection state to images
    const galleryFavorites = favorites[req.params.id] || [];
    const imagesWithState = gallery.images.map(img => ({
      ...img,
      favorite: galleryFavorites.includes(img.id),
      selected: false,
    }));

    res.json({
      ...gallery,
      password: undefined,
      images: imagesWithState,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle Favorite
app.post('/api/gallery/:id/favorite', authenticateToken, (req, res) => {
  try {
    const { imageId } = req.body;
    const galleryId = req.params.id;

    if (!favorites[galleryId]) {
      favorites[galleryId] = [];
    }

    const index = favorites[galleryId].indexOf(imageId);
    if (index > -1) {
      favorites[galleryId].splice(index, 1);
    } else {
      favorites[galleryId].push(imageId);
    }

    res.json({ success: true, favorites: favorites[galleryId] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Shopping Cart
app.post('/api/cart/add', authenticateToken, (req, res) => {
  try {
    const { galleryId, imageId, productType, price, quantity = 1 } = req.body;
    
    if (!cart[galleryId]) {
      cart[galleryId] = [];
    }

    cart[galleryId].push({
      id: Date.now().toString(),
      imageId,
      productType,
      price,
      quantity,
      addedAt: new Date(),
    });

    res.json({ success: true, cart: cart[galleryId] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Consultations
app.post('/api/consultations', (req, res) => {
  try {
    const consultation = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
    };

    consultations.push(consultation);
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all consultations (for admin)
app.get('/api/consultations', (req, res) => {
  try {
    res.json({ consultations });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update consultation status
app.put('/api/consultations/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const consultation = consultations.find(c => c.id === id);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    consultation.status = status;
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete consultation
app.delete('/api/consultations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = consultations.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    consultations.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Inquiries
app.post('/api/inquiries', (req, res) => {
  try {
    const inquiry = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
    };

    inquiries.push(inquiry);
    res.json({ success: true, inquiry });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CRM - Clients
app.get('/api/clients', (req, res) => {
  try {
    res.json({ clients });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Email Simulation
app.post('/api/send-email', (req, res) => {
  try {
    const { to, subject, body } = req.body;
    console.log('Email sent:', { to, subject, body });
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;