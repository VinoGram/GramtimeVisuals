const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { initDB, createGallery, getGalleryById, getAllGalleries, deleteGallery, addImageToGallery, removeImageFromGallery } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// ── Cloudinary config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage — galleries
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gramtime-galleries',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});
const uploadToCloud = multer({ storage: cloudinaryStorage });

// Cloudinary storage — portfolio
const portfolioCloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gramtime-portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});
const uploadPortfolio = multer({ storage: portfolioCloudStorage });

// Cloudinary storage — blog
const blogCloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gramtime-blog',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});
const uploadBlog = multer({ storage: blogCloudStorage });

// Cloudinary storage — campaign flyers
const flyerCloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gramtime-flyers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});
const uploadFlyer = multer({ storage: flyerCloudStorage });

// ── In-memory data ──────────────────────────────────────────────────────────
// galleries now persisted in Neon DB via db.js

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
    notes: ["Interested in full-day wedding coverage", "Venue: The Grand Estate", "Looking for elegant, timeless style"],
    tags: ["High Priority", "Wedding", "Referred by Emily"],
  },
];

let consultations = [];
let inquiries = [];
let campaigns = [];
let favorites = {};
let cart = {};
let pressItems = [];
let blogPosts = [];
let galleryPins = {}; // galleryId -> { pin, clientEmail, approved }
let portfolioImages = [];
let portfolioFolders = [];

// ── Middleware ───────────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err || user.role !== 'admin') return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ── Admin Auth ───────────────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== (process.env.ADMIN_USERNAME || 'admin') || password !== (process.env.ADMIN_PASSWORD || 'gramtime2024')) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '8h' });
  res.json({ token });
});

// ── Gallery Auth (client-facing) ─────────────────────────────────────────────
app.post('/api/gallery/auth', async (req, res) => {
  try {
    const { galleryId, password } = req.body;
    const gallery = await getGalleryById(galleryId);
    if (!gallery) return res.status(401).json({ error: 'Invalid gallery ID or password' });
    const valid = await bcrypt.compare(password, gallery.password);
    if (!valid) return res.status(401).json({ error: 'Invalid gallery ID or password' });
    const token = jwt.sign({ galleryId: gallery.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
    res.json({ token, gallery: { ...gallery, password: undefined } });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/gallery/:id', authenticateToken, async (req, res) => {
  const gallery = await getGalleryById(req.params.id);
  if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
  const galleryFavorites = favorites[req.params.id] || [];
  res.json({
    ...gallery,
    password: undefined,
    images: gallery.images.map(img => ({ ...img, favorite: galleryFavorites.includes(img.id), selected: false })),
  });
});

app.post('/api/gallery/:id/favorite', authenticateToken, (req, res) => {
  const { imageId } = req.body;
  const gid = req.params.id;
  if (!favorites[gid]) favorites[gid] = [];
  const idx = favorites[gid].indexOf(imageId);
  if (idx > -1) favorites[gid].splice(idx, 1);
  else favorites[gid].push(imageId);
  res.json({ success: true, favorites: favorites[gid] });
});

// ── Cart ─────────────────────────────────────────────────────────────────────
app.post('/api/cart/add', authenticateToken, (req, res) => {
  const { galleryId, imageId, productType, price, quantity = 1 } = req.body;
  if (!cart[galleryId]) cart[galleryId] = [];
  cart[galleryId].push({ id: Date.now().toString(), imageId, productType, price, quantity, addedAt: new Date() });
  res.json({ success: true, cart: cart[galleryId] });
});

// ── Consultations / Bookings ─────────────────────────────────────────────────
app.post('/api/consultations', (req, res) => {
  const consultation = { id: Date.now().toString(), status: 'pending', ...req.body, createdAt: new Date() };
  consultations.push(consultation);

  // Auto-create or update CRM client
  const email = req.body.email;
  if (email) {
    const existing = clients.find(c => c.email === email);
    if (existing) {
      existing.lastContact = new Date().toISOString().split('T')[0];
      if (req.body.phone && !existing.phone) existing.phone = req.body.phone;
      if (!Array.isArray(existing.notes)) existing.notes = [];
      existing.notes.push(`New booking: ${req.body.packageName || req.body.consultation?.title || 'Package'} on ${req.body.eventDate || new Date().toLocaleDateString()}`);
      if (existing.status === 'lead' || existing.status === 'new-lead') existing.status = 'booked';
    } else {
      clients.push({
        id: 'client-' + Date.now(),
        name: req.body.fullName || req.body.name || email,
        email,
        phone: req.body.phone || '',
        status: 'booked',
        eventType: req.body.niche || req.body.eventType || 'Photography',
        eventDate: req.body.eventDate || '',
        budget: '',
        lastContact: new Date().toISOString().split('T')[0],
        notes: [`Booked: ${req.body.packageName || 'Package'} — ${req.body.eventLocation || ''}`],
        tags: ['Booking Form', req.body.niche || 'Photography'],
      });
    }
  }

  res.json({ success: true, consultation });
});

app.get('/api/consultations', authenticateAdmin, (req, res) => {
  res.json({ consultations });
});

app.put('/api/consultations/:id/status', authenticateAdmin, (req, res) => {
  const c = consultations.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  c.status = req.body.status;
  res.json({ success: true, consultation: c });
});

app.delete('/api/consultations/:id', authenticateAdmin, (req, res) => {
  const idx = consultations.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  consultations.splice(idx, 1);
  res.json({ success: true });
});

// ── Inquiries ────────────────────────────────────────────────────────────────
app.post('/api/inquiries', (req, res) => {
  const inquiry = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
  inquiries.push(inquiry);
  // Save phone to CRM if provided
  const { email, name, phone } = req.body;
  if (email) {
    const existing = clients.find(c => c.email === email);
    if (existing) {
      if (phone && !existing.phone) existing.phone = phone;
      existing.lastContact = new Date().toISOString().split('T')[0];
    } else {
      clients.push({
        id: 'inq-' + Date.now(), name: name || email, email,
        phone: phone || '', status: 'new-lead', eventType: req.body.sessionType || 'Unknown',
        eventDate: '', budget: '',
        lastContact: new Date().toISOString().split('T')[0],
        notes: [`Contact form inquiry: ${req.body.message?.slice(0, 100) || ''}`],
        tags: ['Contact Form'],
      });
    }
  }
  res.json({ success: true, inquiry });
});

app.get('/api/admin/inquiries', authenticateAdmin, (req, res) => {
  res.json({ inquiries });
});

// ── Clients ──────────────────────────────────────────────────────────────────
app.get('/api/clients', authenticateAdmin, (req, res) => {
  res.json({ clients });
});

app.post('/api/clients', authenticateAdmin, (req, res) => {
  const client = { id: Date.now().toString(), lastContact: new Date().toISOString().split('T')[0], notes: [], tags: [], ...req.body };
  clients.push(client);
  res.json({ success: true, client });
});

app.put('/api/clients/:id/status', authenticateAdmin, (req, res) => {
  const c = clients.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  c.status = req.body.status;
  res.json({ success: true, client: c });
});

app.post('/api/clients/:id/notes', authenticateAdmin, (req, res) => {
  const c = clients.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  if (!Array.isArray(c.notes)) c.notes = [];
  c.notes.push(req.body.note);
  c.lastContact = new Date().toISOString().split('T')[0];
  res.json({ success: true, client: c });
});

app.delete('/api/clients/:id', authenticateAdmin, (req, res) => {
  const idx = clients.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  clients.splice(idx, 1);
  res.json({ success: true });
});

// ── Admin Galleries ──────────────────────────────────────────────────────────
app.get('/api/admin/galleries', authenticateAdmin, async (req, res) => {
  const galleries = await getAllGalleries();
  res.json({ galleries: galleries.map(g => ({ ...g, password: undefined })) });
});

app.post('/api/admin/galleries', authenticateAdmin, async (req, res) => {
  try {
    const { bookingId, clientName, clientEmail, eventType, password, description, allowDownloads, allowFavorites } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const id = 'gallery-' + Date.now();
    const gallery = await createGallery({
      id, clientName, clientEmail, eventType,
      password: hashed, description, allowDownloads, allowFavorites,
    });
    // Link booking to gallery for reference (booking stays visible always)
    if (bookingId) {
      const booking = consultations.find(c => c.id === bookingId);
      if (booking) booking.galleryId = id;
    }
    if (clientEmail) {
      try {
        await sendGalleryCredentials({ to: clientEmail, clientName, galleryId: id, password });
        console.log(`[EMAIL SENT] Gallery credentials -> ${clientEmail}`);
      } catch (err) {
        console.error(`[EMAIL ERROR] Failed to send credentials to ${clientEmail}:`, err.message);
      }
    }
    res.json({ success: true, gallery: { ...gallery, password: undefined } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/admin/galleries/:id', authenticateAdmin, async (req, res) => {
  await deleteGallery(req.params.id);
  res.json({ success: true });
});

app.post('/api/admin/galleries/:id/images', authenticateAdmin, uploadToCloud.array('images', 50), async (req, res) => {
  const gallery = await getGalleryById(req.params.id);
  if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
  const added = [];
  for (const file of req.files) {
    const img = {
      id: 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      cloudinaryId: file.filename,
      url: file.path,
      thumbnail: file.path.replace('/upload/', '/upload/w_400,c_fill,q_auto,f_auto/'),
      filename: file.originalname,
    };
    await addImageToGallery(req.params.id, img);
    added.push(img);
  }
  const updated = await getGalleryById(req.params.id);
  res.json({ success: true, images: added, total: updated.images.length });
});

app.delete('/api/admin/galleries/:id/images/:imageId', authenticateAdmin, async (req, res) => {
  const removed = await removeImageFromGallery(req.params.id, req.params.imageId);
  if (!removed) return res.status(404).json({ error: 'Image not found' });
  if (removed.cloudinaryId) {
    try { await cloudinary.uploader.destroy(removed.cloudinaryId); } catch {}
  }
  res.json({ success: true });
});

// ── Campaigns ────────────────────────────────────────────────────────────────
app.get('/api/campaigns', authenticateAdmin, (req, res) => {
  res.json({ campaigns });
});

// Public endpoint — no auth, only active campaigns
app.get('/api/campaigns/active', (req, res) => {
  res.json({ campaigns: campaigns.filter(c => c.active) });
});

app.post('/api/campaigns/weekly-offer', authenticateAdmin, (req, res) => {
  const campaign = { id: Date.now().toString(), campaign_type: 'weekly_offer', subject: req.body.offerTitle, status: 'sent', active: false, sent_at: new Date(), ...req.body };
  campaigns.push(campaign);
  res.json({ success: true, campaign });
});

app.post('/api/campaigns/festive', authenticateAdmin, (req, res) => {
  const campaign = { id: Date.now().toString(), campaign_type: 'festive', subject: req.body.packageTitle, status: 'sent', active: false, sent_at: new Date(), ...req.body };
  campaigns.push(campaign);
  res.json({ success: true, campaign });
});

app.post('/api/campaigns/flyer', authenticateAdmin, uploadFlyer.single('flyer'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Flyer image required' });
    const campaign = {
      id: Date.now().toString(),
      campaign_type: 'flyer',
      subject: req.body.title || 'Flyer Campaign',
      title: req.body.title || '',
      flyerUrl: req.file.path,
      cloudinaryId: req.file.filename,
      status: 'sent',
      active: true, // flyers default to active/visible
      sent_at: new Date(),
    };
    campaigns.push(campaign);
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.patch('/api/campaigns/:id/active', authenticateAdmin, (req, res) => {
  const c = campaigns.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  c.active = req.body.active;
  res.json({ success: true, campaign: c });
});

app.delete('/api/campaigns/:id', authenticateAdmin, async (req, res) => {
  const idx = campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = campaigns.splice(idx, 1);
  if (removed.cloudinaryId) {
    try { await cloudinary.uploader.destroy(removed.cloudinaryId); } catch {}
  }
  res.json({ success: true });
});

// ── Portfolio Folders ─────────────────────────────────────────────────────────
app.get('/api/portfolio/folders', (req, res) => {
  res.json({
    folders: portfolioFolders.map(f => ({
      ...f,
      imageCount: portfolioImages.filter(i => i.folderId === f.id).length,
      coverUrl: f.coverUrl || (portfolioImages.find(i => i.folderId === f.id) || {}).url || '',
    })),
  });
});

app.post('/api/portfolio/folders', authenticateAdmin, uploadPortfolio.single('cover'), (req, res) => {
  const { name, category, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Folder name required' });
  const folder = {
    id: 'folder-' + Date.now(),
    name, category: category || 'portrait',
    description: description || '',
    coverUrl: req.file ? req.file.path : (req.body.coverUrl || ''),
    coverCloudinaryId: req.file ? req.file.filename : null,
    order: portfolioFolders.length,
    createdAt: new Date(),
  };
  portfolioFolders.push(folder);
  res.json({ success: true, folder });
});

app.delete('/api/portfolio/folders/:id', authenticateAdmin, async (req, res) => {
  const idx = portfolioFolders.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = portfolioFolders.splice(idx, 1);
  if (removed.coverCloudinaryId) { try { await cloudinary.uploader.destroy(removed.coverCloudinaryId); } catch {} }
  const imgs = portfolioImages.filter(i => i.folderId === req.params.id);
  for (const img of imgs) { if (img.cloudinaryId) { try { await cloudinary.uploader.destroy(img.cloudinaryId); } catch {} } }
  portfolioImages = portfolioImages.filter(i => i.folderId !== req.params.id);
  res.json({ success: true });
});

// ── Portfolio Images ──────────────────────────────────────────────────────────
app.get('/api/portfolio', (req, res) => {
  const { folderId } = req.query;
  const imgs = folderId ? portfolioImages.filter(i => i.folderId === folderId) : portfolioImages;
  res.json({ images: imgs.sort((a, b) => a.order - b.order) });
});

app.post('/api/portfolio', authenticateAdmin, uploadPortfolio.array('images', 50), async (req, res) => {
  try {
    const { title, location, category, folderId } = req.body;
    const files = req.files || [];
    const added = [];
    for (const file of files) {
      const image = {
        id: 'p' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        title: title || '', location: location || '',
        category: category || 'portrait',
        folderId: folderId || null,
        url: file.path, cloudinaryId: file.filename,
        order: portfolioImages.length,
      };
      portfolioImages.push(image);
      added.push(image);
    }
    if (req.body.url) {
      const image = {
        id: 'p' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        title: title || '', location: location || '',
        category: category || 'portrait',
        folderId: folderId || null,
        url: req.body.url, cloudinaryId: null,
        order: portfolioImages.length,
      };
      portfolioImages.push(image);
      added.push(image);
    }
    if (added.length === 0) return res.status(400).json({ error: 'No images provided' });
    // Auto-set folder cover from first image if none set
    if (folderId) {
      const folder = portfolioFolders.find(f => f.id === folderId);
      if (folder && !folder.coverUrl) folder.coverUrl = added[0].url;
    }
    res.json({ success: true, images: added });
  } catch (err) {
    console.error('Portfolio upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.delete('/api/portfolio/:id', authenticateAdmin, async (req, res) => {
  const idx = portfolioImages.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = portfolioImages.splice(idx, 1);
  if (removed.cloudinaryId) { try { await cloudinary.uploader.destroy(removed.cloudinaryId); } catch {} }
  res.json({ success: true });
});

app.patch('/api/portfolio/:id', authenticateAdmin, (req, res) => {
  const img = portfolioImages.find(p => p.id === req.params.id);
  if (!img) return res.status(404).json({ error: 'Not found' });
  Object.assign(img, req.body);
  res.json({ success: true, image: img });
});

// ── Blog Posts ───────────────────────────────────────────────────────────────
app.get('/api/blog', (req, res) => {
  res.json({ posts: [...blogPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

app.post('/api/blog', authenticateAdmin, uploadBlog.single('image'), (req, res) => {
  try {
    const { title, excerpt, content, category, tags, featuredImageUrl: bodyUrl } = req.body;
    const featuredImageUrl = req.file ? req.file.path : (bodyUrl || '');
    const cloudinaryId = req.file ? req.file.filename : null;
    const post = {
      id: Date.now().toString(),
      title, excerpt: excerpt || '', content: content || '',
      featuredImageUrl, cloudinaryId,
      category: category || 'CRAFT',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      readTime: Math.max(1, Math.ceil(((content || '').split(' ').length) / 200)) + ' min read',
      publishDate: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };
    blogPosts.push(post);
    res.json({ success: true, post });
  } catch (err) {
    console.error('Blog upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.delete('/api/blog/:id', authenticateAdmin, async (req, res) => {
  const idx = blogPosts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = blogPosts.splice(idx, 1);
  if (removed.cloudinaryId) {
    try { await cloudinary.uploader.destroy(removed.cloudinaryId); } catch {}
  }
  res.json({ success: true });
});

// ── Bookings (dedicated list — booking-form submissions) ────────────────────
app.get('/api/bookings', authenticateAdmin, (req, res) => {
  const bookings = consultations.filter(c => c.packageName || c.niche || c.source === 'booking-form');
  res.json({ bookings });
});

app.put('/api/bookings/:id/status', authenticateAdmin, (req, res) => {
  const b = consultations.find(c => c.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  b.status = req.body.status;
  res.json({ success: true, booking: b });
});

app.delete('/api/bookings/:id', authenticateAdmin, (req, res) => {
  const idx = consultations.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  consultations.splice(idx, 1);
  res.json({ success: true });
});

// ── Nodemailer transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendGalleryCredentials({ to, clientName, galleryId, password }) {
  const siteUrl = process.env.SITE_URL || 'https://gramtimevisuals.com';
  await transporter.sendMail({
    from: `"Gramtime Visuals" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Private Gallery Access Details \uD83D\uDCF8',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px">
        <h2 style="color:#4ade80;margin-bottom:8px">Your gallery is ready, ${clientName}!</h2>
        <p style="color:#aaa;margin-bottom:32px">Use the details below to access your private photo gallery.</p>
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:24px;margin-bottom:32px">
          <p style="margin:0 0 8px;font-size:12px;color:#666;letter-spacing:0.1em;text-transform:uppercase">Gallery ID</p>
          <p style="margin:0 0 24px;font-size:16px;font-family:monospace;color:#4ade80">${galleryId}</p>
          <p style="margin:0 0 8px;font-size:12px;color:#666;letter-spacing:0.1em;text-transform:uppercase">Password</p>
          <p style="margin:0;font-size:20px;font-family:monospace;font-weight:700;color:#fff">${password}</p>
        </div>
        <a href="${siteUrl}/gallery" style="display:inline-block;background:#4ade80;color:#000;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:14px">View My Gallery &rarr;</a>
        <p style="margin-top:32px;font-size:12px;color:#555">Keep these details safe. If you have any issues, reply to this email.</p>
      </div>
    `,
  });
}

async function sendPinEmail({ to, clientName, galleryId, pin }) {
  const siteUrl = process.env.SITE_URL || 'https://gramtimevisuals.com';
  await transporter.sendMail({
    from: `"Gramtime Visuals" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Private Gallery is Ready 📸',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px">
        <h2 style="color:#4ade80;margin-bottom:8px">Your gallery is ready, ${clientName || 'there'}!</h2>
        <p style="color:#aaa;margin-bottom:32px">Use the details below to access your private photo gallery.</p>
        <div style="background:#111;border:1px solid #222;border-radius:8px;padding:24px;margin-bottom:32px">
          <p style="margin:0 0 8px;font-size:12px;color:#666;letter-spacing:0.1em;text-transform:uppercase">Gallery ID</p>
          <p style="margin:0 0 24px;font-size:16px;font-family:monospace;color:#fff">${galleryId}</p>
          <p style="margin:0 0 8px;font-size:12px;color:#666;letter-spacing:0.1em;text-transform:uppercase">Your PIN</p>
          <p style="margin:0;font-size:36px;font-family:monospace;font-weight:700;color:#4ade80;letter-spacing:0.3em">${pin}</p>
        </div>
        <a href="${siteUrl}/gallery" style="display:inline-block;background:#4ade80;color:#000;font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:14px">View My Gallery →</a>
        <p style="margin-top:32px;font-size:12px;color:#555">This PIN is private — do not share it. If you have any issues, reply to this email.</p>
      </div>
    `,
  });
}

// ── Booking Approval & Download PIN ──────────────────────────────────────────
app.post('/api/bookings/:id/approve', authenticateAdmin, async (req, res) => {
  const booking = consultations.find(c => c.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const galleryId = booking.galleryId || `gallery-${booking.id}`;
  galleryPins[galleryId] = { pin, clientEmail: booking.email, clientName: booking.fullName || booking.name, approved: true, approvedAt: new Date() };
  booking.status = 'confirmed';
  booking.galleryId = galleryId;
  booking.downloadPin = pin;
  try {
    await sendPinEmail({ to: booking.email, clientName: booking.fullName || booking.name, galleryId, pin });
    console.log(`[EMAIL SENT] PIN email → ${booking.email}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send PIN to ${booking.email}:`, err.message);
  }
  res.json({ success: true, pin, galleryId, email: booking.email });
});

app.post('/api/gallery/:id/verify-pin', authenticateToken, (req, res) => {
  const record = galleryPins[req.params.id];
  if (!record) return res.status(404).json({ error: 'No PIN set for this gallery' });
  if (record.pin !== req.body.pin) return res.status(401).json({ error: 'Invalid PIN' });
  res.json({ success: true });
});

// ── Email ────────────────────────────────────────────────────────────────────
app.post('/api/send-email', authenticateAdmin, (req, res) => {
  console.log('Email sent:', req.body);
  res.json({ success: true, message: 'Email sent successfully' });
});

// ── Press & Recognition ─────────────────────────────────────────────────────
// Public — frontend reads this
app.get('/api/press/public', (req, res) => {
  res.json({ pressItems });
});

app.get('/api/press', authenticateAdmin, (req, res) => {
  res.json({ pressItems });
});

app.post('/api/press', authenticateAdmin, (req, res) => {
  const item = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
  pressItems.push(item);
  res.json({ success: true, item });
});

app.put('/api/press/:id', authenticateAdmin, (req, res) => {
  const item = pressItems.find(p => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  Object.assign(item, req.body);
  res.json({ success: true, item });
});

app.delete('/api/press/:id', authenticateAdmin, (req, res) => {
  const idx = pressItems.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  pressItems.splice(idx, 1);
  res.json({ success: true });
});

// ── Visitor capture (rate-limited — once per IP per day) ────────────────────
const visitorLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Already captured' },
  skipFailedRequests: false,
});

let visitors = []; // { id, email, name, page, referrer, capturedAt, ip }
let newsletterSubscribers = []; // { id, email, subscribedAt }

app.post('/api/visitors', visitorLimiter, (req, res) => {
  const { email, name, page, referrer } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Save to visitors log
  const visitor = {
    id: Date.now().toString(),
    email, name: name || '',
    page: page || '/', referrer: referrer || '',
    capturedAt: new Date(),
    ip: req.ip,
  };
  visitors.push(visitor);

  // Also push into CRM clients list as a lead
  const existing = clients.find(c => c.email === email);
  if (!existing) {
    clients.push({
      id: 'lead-' + Date.now(),
      name: name || email,
      email,
      phone: '',
      status: 'new-lead',
      eventType: 'Unknown',
      eventDate: '',
      budget: '',
      lastContact: new Date().toISOString().split('T')[0],
      notes: [`Captured via website popup — page: ${page || '/'}`],
      tags: ['Website Visitor', 'Auto-Captured'],
    });
  }

  res.json({ success: true });
});

app.get('/api/admin/visitors', authenticateAdmin, (req, res) => {
  res.json({ visitors });
});

// ── Newsletter ──────────────────────────────────────────────────────────────
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  if (!newsletterSubscribers.find(s => s.email === email)) {
    newsletterSubscribers.push({ id: Date.now().toString(), email, subscribedAt: new Date() });
  }
  res.json({ success: true });
});

app.get('/api/newsletter/subscribers', authenticateAdmin, (req, res) => {
  res.json({ subscribers: newsletterSubscribers });
});

app.delete('/api/newsletter/subscribers/:id', authenticateAdmin, (req, res) => {
  const idx = newsletterSubscribers.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  newsletterSubscribers.splice(idx, 1);
  res.json({ success: true });
});

app.post('/api/newsletter/send', authenticateAdmin, (req, res) => {
  const { subject, body, frequency } = req.body;
  if (!subject || !body) return res.status(400).json({ error: 'Subject and body required' });
  const campaign = {
    id: Date.now().toString(),
    campaign_type: `newsletter_${frequency || 'manual'}`,
    subject,
    body,
    recipientCount: newsletterSubscribers.length,
    status: 'sent',
    active: false,
    sent_at: new Date(),
  };
  campaigns.push(campaign);
  console.log(`[NEWSLETTER] Sending "${subject}" to ${newsletterSubscribers.length} subscribers`);
  res.json({ success: true, campaign });
});

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

initDB().catch(err => console.error('[DB] Init failed:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
