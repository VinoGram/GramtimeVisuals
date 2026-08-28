require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS galleries (
      id          TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_email TEXT DEFAULT '',
      event_type  TEXT DEFAULT '',
      password    TEXT NOT NULL,
      description TEXT DEFAULT '',
      allow_downloads BOOLEAN DEFAULT true,
      allow_favorites BOOLEAN DEFAULT true,
      images      TEXT DEFAULT '[]',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('[DB] Tables ready');
}

// ── Gallery helpers ──────────────────────────────────────────────────────────

async function createGallery({ id, clientName, clientEmail, eventType, password, description, allowDownloads, allowFavorites }) {
  const { rows } = await pool.query(
    `INSERT INTO galleries (id, client_name, client_email, event_type, password, description, allow_downloads, allow_favorites, images)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'[]') RETURNING *`,
    [id, clientName, clientEmail || '', eventType || '', password, description || '', allowDownloads !== false, allowFavorites !== false]
  );
  return rowToGallery(rows[0]);
}

async function getGalleryById(id) {
  const { rows } = await pool.query('SELECT * FROM galleries WHERE id=$1', [id]);
  return rows[0] ? rowToGallery(rows[0]) : null;
}

async function getAllGalleries() {
  const { rows } = await pool.query('SELECT * FROM galleries ORDER BY created_at DESC');
  return rows.map(rowToGallery);
}

async function deleteGallery(id) {
  await pool.query('DELETE FROM galleries WHERE id=$1', [id]);
}

async function addImageToGallery(galleryId, image) {
  const gallery = await getGalleryById(galleryId);
  if (!gallery) return null;
  const images = gallery.images;
  images.push(image);
  await pool.query('UPDATE galleries SET images=$1 WHERE id=$2', [JSON.stringify(images), galleryId]);
  return image;
}

async function removeImageFromGallery(galleryId, imageId) {
  const gallery = await getGalleryById(galleryId);
  if (!gallery) return;
  const images = gallery.images.filter(img => img.id !== imageId);
  await pool.query('UPDATE galleries SET images=$1 WHERE id=$2', [JSON.stringify(images), galleryId]);
  return gallery.images.find(img => img.id === imageId);
}

function rowToGallery(row) {
  return {
    id: row.id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    eventType: row.event_type,
    password: row.password,
    description: row.description,
    allowDownloads: row.allow_downloads,
    allowFavorites: row.allow_favorites,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
    createdAt: row.created_at,
  };
}

module.exports = { pool, initDB, createGallery, getGalleryById, getAllGalleries, deleteGallery, addImageToGallery, removeImageFromGallery };
