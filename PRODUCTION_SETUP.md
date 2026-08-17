# Production System Setup Guide
## Real-time Authentication, Neon Database, Email Services & More

## 🚀 Complete Production Features

### ✅ Real-time Authentication System
- JWT token-based authentication
- Real-time session management with Socket.IO
- Secure password hashing with bcrypt
- Session timeout and cleanup
- Multi-device session tracking

### ✅ Neon Database Integration
- PostgreSQL with Neon cloud hosting
- Complete schema with 9 tables
- UUID primary keys
- Foreign key relationships
- Automatic timestamps

### ✅ Cloudinary Image Hosting
- Direct upload to Cloudinary
- Automatic thumbnail generation
- Image optimization
- CDN delivery
- Organized folder structure

### ✅ Email Services (SendGrid)
- Booking confirmations
- Gallery access notifications
- Order confirmations
- Admin notifications
- HTML email templates

### ✅ Payment Processing (Stripe)
- Secure payment intents
- Order management
- Webhook handling
- Refund support

### ✅ PDF Generation
- Agreement documents
- Order receipts
- Custom branding

### ✅ Analytics Tracking
- Gallery views
- Photo interactions
- Download tracking
- User behavior

## 📊 Database Schema

```sql
-- Galleries table
galleries (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  password_hash VARCHAR(255),
  access_token VARCHAR(255) UNIQUE,
  cover_image TEXT,
  event_date DATE,
  event_type VARCHAR(100),
  description TEXT,
  expiry_date DATE,
  allow_downloads BOOLEAN,
  allow_favorites BOOLEAN,
  allow_shopping BOOLEAN,
  watermarked BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Photos table
photos (
  id UUID PRIMARY KEY,
  gallery_id UUID REFERENCES galleries(id),
  url TEXT,
  thumbnail_url TEXT,
  cloudinary_public_id VARCHAR(255),
  filename VARCHAR(255),
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  order_index INTEGER,
  is_selected BOOLEAN,
  created_at TIMESTAMP
);

-- Clients table
clients (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  status VARCHAR(50),
  event_type VARCHAR(100),
  event_date DATE,
  budget VARCHAR(100),
  consultation_date DATE,
  consultation_time TIME,
  last_contact DATE,
  notes JSONB,
  tags JSONB,
  gallery_access_token VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Additional tables: favorites, downloads, consultations, 
-- inquiries, cart_items, orders, analytics
```

## 🔧 Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
cp package-production.json package.json
npm install
```

#### Environment Configuration
```bash
cp .env.production .env
```

Update `.env` with your credentials:
```env
# Neon Database
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SendGrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=noreply@gramtimevisuals.com
ADMIN_EMAIL=admin@gramtimevisuals.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# JWT Secret (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```

#### Start Production Server
```bash
node server-production.js
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install socket.io-client
```

#### Environment Configuration
```bash
# Update frontend/.env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### Update API Service
Replace the existing API service with the production version:
```bash
cp src/services/api-production.js src/services/api.js
```

## 🔐 Service Setup Guides

### Neon Database Setup

1. **Create Neon Account**
   - Go to https://neon.tech
   - Create new project
   - Copy connection string

2. **Database Configuration**
   ```env
   DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

3. **Auto-initialization**
   - Tables created automatically on first run
   - No manual migration needed

### Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com
   - Get cloud name, API key, and secret

2. **Configuration**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Features**
   - Automatic image optimization
   - Thumbnail generation
   - CDN delivery
   - Organized folders by gallery

### SendGrid Email Setup

1. **Create SendGrid Account**
   - Go to https://sendgrid.com
   - Verify sender identity
   - Get API key

2. **Configuration**
   ```env
   SENDGRID_API_KEY=SG.your-sendgrid-api-key
   FROM_EMAIL=noreply@gramtimevisuals.com
   ADMIN_EMAIL=admin@gramtimevisuals.com
   ```

3. **Email Templates**
   - Booking confirmations
   - Gallery notifications
   - Order confirmations
   - Admin alerts

### Stripe Payment Setup

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Get test/live keys
   - Set up webhooks

2. **Configuration**
   ```env
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
   ```

3. **Features**
   - Secure payment processing
   - Order management
   - Refund handling
   - Webhook events

## 🔄 Real-time Features

### Socket.IO Integration

**Server-side Events:**
- `gallery-auth` - Client authentication
- `gallery-activity` - User activity tracking
- `favorites-updated` - Real-time favorite updates
- `photos-uploaded` - New photo notifications
- `user-activity` - Live user presence

**Client-side Usage:**
```javascript
import { apiService } from './services/api';

// Initialize real-time connection
apiService.initializeSocket(galleryId);

// Listen for real-time updates
apiService.on('favorites-updated', (data) => {
  // Update UI in real-time
  updateFavorites(data);
});

// Track user activity
apiService.trackActivity('photo_view', { photoId });
```

## 📊 Analytics & Tracking

### Event Tracking
```javascript
// Automatic tracking for:
- Gallery views
- Photo views
- Favorites added/removed
- Downloads requested
- Cart additions
- Consultation bookings
- Inquiry submissions
```

### Analytics Dashboard
```javascript
// Get analytics data
const analytics = await apiService.getAnalytics(galleryId);
// Returns: views, downloads, favorites, topPhotos
```

## 🔒 Security Features

### Implemented Security
- **Helmet.js** - Security headers
- **Rate limiting** - Prevent abuse
- **CORS** - Cross-origin protection
- **JWT tokens** - Secure authentication
- **Password hashing** - bcrypt encryption
- **Input validation** - Prevent injection
- **File type validation** - Image uploads only
- **Session management** - Automatic cleanup

### Production Security Checklist
- [ ] Change JWT_SECRET to 32+ character random string
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring (Sentry)
- [ ] Enable database SSL
- [ ] Secure file uploads
- [ ] Set up backup strategy

## 📱 Frontend Integration

### Real-time Gallery Component
```javascript
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

export function RealtimeGallery({ galleryId }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Initialize real-time connection
    apiService.initializeSocket(galleryId);

    // Listen for real-time updates
    apiService.on('favorites-updated', (data) => {
      setImages(prev => prev.map(img => 
        img.id === data.photoId 
          ? { ...img, favorite: data.action === 'added' }
          : img
      ));
    });

    apiService.on('photos-uploaded', (data) => {
      setImages(prev => [...prev, ...data.photos]);
    });

    return () => {
      apiService.logout();
    };
  }, [galleryId]);

  return (
    // Gallery component with real-time updates
  );
}
```

## 🚀 Deployment

### Backend Deployment Options

**Railway (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Heroku**
```bash
# Install Heroku CLI
heroku create gramtime-visuals-api
git push heroku main
```

**DigitalOcean App Platform**
- Connect GitHub repository
- Set environment variables
- Deploy automatically

### Frontend Deployment

**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Netlify**
```bash
# Build and deploy
npm run build
# Upload dist folder to Netlify
```

## 📈 Performance Optimization

### Backend Optimizations
- **Compression** - Gzip responses
- **Caching** - Redis for sessions
- **Connection pooling** - PostgreSQL
- **Image optimization** - Cloudinary
- **CDN** - Static asset delivery

### Frontend Optimizations
- **Code splitting** - Lazy loading
- **Image optimization** - WebP format
- **Caching** - Service workers
- **Bundle optimization** - Tree shaking

## 🔍 Monitoring & Logging

### Error Tracking
```bash
# Add Sentry for error tracking
npm install @sentry/node @sentry/integrations
```

### Logging
```bash
# Add Winston for structured logging
npm install winston
```

### Health Monitoring
```bash
# Health check endpoint
GET /api/health
# Returns: status, database, active sessions
```

## ✅ Testing

### Backend Testing
```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

### Frontend Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react vitest

# Run tests
npm run test
```

## 🎯 Production Checklist

### Pre-Launch
- [ ] Set up Neon database
- [ ] Configure Cloudinary
- [ ] Set up SendGrid
- [ ] Configure Stripe
- [ ] Test all email templates
- [ ] Test payment flow
- [ ] Test real-time features
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Security audit
- [ ] Performance testing
- [ ] Mobile testing

### Post-Launch
- [ ] Monitor error rates
- [ ] Check email delivery
- [ ] Monitor payment success
- [ ] Track user analytics
- [ ] Monitor server performance
- [ ] Check database performance
- [ ] Verify backup systems

## 🎉 Ready for Production!

Your system now includes:

✅ **Real-time Authentication** with JWT and Socket.IO
✅ **Neon PostgreSQL Database** with complete schema
✅ **Cloudinary Image Hosting** with optimization
✅ **SendGrid Email Service** with templates
✅ **Stripe Payment Processing** with webhooks
✅ **PDF Generation** for agreements
✅ **Analytics Tracking** for insights
✅ **Security Features** for protection
✅ **Real-time Updates** for live experience

**Start both servers and test all features with real services!**