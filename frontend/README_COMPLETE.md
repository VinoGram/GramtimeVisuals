# Gramtime Visuals - Luxury Photography Website

A complete luxury photography brand website with booking system, private client galleries, and multimedia experience showcase.

## 🌟 Features Overview

### 1. Experience Page (Homepage)
- Full-screen hero with brand story
- 8-step client journey with elegant icons
- Behind-the-scenes video showcase
- Brand philosophy section
- Responsive multimedia design

### 2. Booking System
- Multi-step booking form (3 steps)
- Comprehensive terms and conditions
- Agreement document generation
- Email confirmation (simulated)
- Package selection by niche

### 3. Private Client Gallery
- Password-protected access
- View and download photos
- Lightbox image viewer
- Bulk download functionality
- Gallery expiration notices

### 4. Price List Viewer
- Comprehensive pricing display
- PDF viewer integration ready
- Download price list
- Multiple photography categories
- Add-ons section

### 5. Portfolio & Services
- Elegant portfolio display
- Service packages with booking
- Testimonials and press features
- Contact form

## 📁 Project Structure

```
luxury_photography_brand_website/
├── src/
│   ├── components/
│   │   ├── Experience.tsx          # Homepage with journey
│   │   ├── PrivateGallery.tsx      # Password-protected gallery
│   │   ├── BookingForm.tsx         # Multi-step booking
│   │   ├── PriceList.tsx           # Pricing with PDF viewer
│   │   ├── Services.tsx            # Packages with booking
│   │   ├── Portfolio.tsx           # Portfolio showcase
│   │   ├── About.tsx               # About page
│   │   ├── Contact.tsx             # Contact form
│   │   ├── Navigation.tsx          # Main navigation
│   │   ├── Hero.tsx                # Hero section
│   │   ├── Testimonials.tsx        # Client testimonials
│   │   ├── Press.tsx               # Press features
│   │   ├── Blog.tsx                # Blog/Journal
│   │   ├── Shop.tsx                # Shop section
│   │   ├── ClientPortal.tsx        # Client portal
│   │   └── Footer.tsx              # Footer
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── public/                         # Static assets
├── BOOKING_SYSTEM.md              # Booking system docs
├── GALLERY_EXPERIENCE.md          # Gallery & experience docs
├── CHANGES_SUMMARY.md             # Summary of changes
└── package.json                   # Dependencies

```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### First Run

1. The app will open at `http://localhost:5173`
2. Navigate through the "Experience" homepage
3. Test the booking system via "Investment" page
4. Access private gallery with demo credentials
5. View pricing in "Pricing" page

## 🔐 Demo Credentials

### Private Gallery Access:

**Gallery 1:**
- Gallery ID: `gallery-001`
- Password: `wedding2024`
- Client: Sarah & Michael (Wedding)

**Gallery 2:**
- Gallery ID: `gallery-002`
- Password: `family2024`
- Client: Johnson Family (Portrait)

## 📋 Page Navigation

| Page | Route | Description |
|------|-------|-------------|
| Experience | `/` (home) | Multimedia homepage with journey |
| Portfolio | `/portfolio` | Photography portfolio |
| Investment | `/services` | Service packages with booking |
| Pricing | `/pricing` | Price list with PDF viewer |
| About | `/about` | About the brand |
| Journal | `/blog` | Blog/journal entries |
| Shop | `/shop` | Product shop |
| Client Gallery | `/private-gallery` | Password-protected galleries |
| Inquire | `/contact` | Contact form |

## 🎨 Key Components

### Experience Page
- **Hero Section**: Full-screen with brand message
- **Brand Story**: Who we are section
- **Process Steps**: 8-step journey with icons:
  1. Initial Inquiry 💌
  2. Consultation ☕
  3. Creative Direction 🎨
  4. Planning 📋
  5. The Photographic Experience 📸
  6. In-Person Reveal ✨
  7. Ordering 🖼️
  8. Heirloom Delivery 🎁
- **Behind The Scenes**: Video showcase
- **Philosophy**: Brand mission

### Booking System
- **Step 1**: Client details (name, email, phone, date, location)
- **Step 2**: Terms and conditions (must agree)
- **Step 3**: Review and confirm
- **Output**: Downloadable agreement + email confirmation

### Private Gallery
- **Login**: Gallery ID + Password
- **View**: Grid layout with hover effects
- **Lightbox**: Full-screen image viewer
- **Download**: Individual or bulk download
- **Actions**: Favorites, print ordering (UI ready)

### Price List
- **Categories**: Wedding, Portrait, Corporate, Event
- **Packages**: Multiple tiers per category
- **Add-ons**: Additional services
- **PDF Viewer**: Ready for PDF integration
- **Download**: Text format price list

## 🛠️ Customization

### Update Brand Information

**Navigation (Navigation.tsx):**
```tsx
GRAMTIME VISUALS // Change brand name here
```

**Experience Page (Experience.tsx):**
```tsx
// Update hero title, brand story, philosophy
```

### Add Real Client Galleries

**PrivateGallery.tsx:**
```tsx
const sampleGalleries: Gallery[] = [
  {
    id: "your-gallery-id",
    clientName: "Client Name",
    password: "secure-password",
    eventDate: "Date",
    eventType: "Type",
    coverImage: "url",
    images: [/* your images */],
  },
];
```

### Add Behind-The-Scenes Videos

**Experience.tsx:**
```tsx
const behindTheScenes = [
  {
    id: 1,
    title: "Video Title",
    thumbnail: "thumbnail-url",
    videoUrl: "youtube-or-vimeo-url",
    description: "Description",
  },
];
```

### Add PDF Price List

1. Create your price list PDF
2. Place in `public/price-list.pdf`
3. Uncomment iframe in `PriceList.tsx`:

```tsx
<iframe
  src="/price-list.pdf"
  className="w-full h-[600px] border-0"
  title="Price List PDF"
/>
```

### Customize Packages

**Services.tsx:**
```tsx
const packages = [
  {
    _id: "1",
    name: "Package Name",
    tier: "essential|prestige|luxury",
    basePrice: 5000,
    description: "Description",
    features: ["Feature 1", "Feature 2"],
    addOns: [{ name: "Add-on", price: 500 }],
  },
];
```

## 🔌 Backend Integration

### Required for Production:

1. **Authentication System**
   - User authentication for galleries
   - Secure password hashing
   - Session management

2. **Database**
   - Store client galleries
   - Store bookings
   - Store inquiries

3. **Email Service**
   - SendGrid, AWS SES, or Mailgun
   - Booking confirmations
   - Gallery access notifications

4. **File Storage**
   - AWS S3, Cloudinary, or similar
   - Image hosting and delivery
   - PDF storage

5. **Payment Processing**
   - Stripe or PayPal integration
   - Deposit and balance payments
   - Invoice generation

### API Endpoints Needed:

```
POST /api/bookings          # Create booking
POST /api/inquiries         # Submit inquiry
POST /api/gallery/auth      # Authenticate gallery access
GET  /api/gallery/:id       # Get gallery images
POST /api/download          # Track downloads
POST /api/send-email        # Send emails
```

## 📱 Responsive Design

All components are fully responsive:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## 🎯 Features Status

### ✅ Completed
- Experience homepage with multimedia journey
- 8-step process with elegant icons
- Behind-the-scenes video showcase
- Password-protected private galleries
- Image viewing and download
- Multi-step booking form
- Terms and conditions
- Agreement generation
- Price list viewer
- PDF viewer placeholder
- All navigation and routing
- Responsive design
- Form validation
- Success notifications

### ⏳ Needs Backend
- Real authentication
- Database storage
- Email sending
- Payment processing
- PDF generation
- Video hosting
- Image optimization
- Analytics tracking

## 📚 Documentation

- **BOOKING_SYSTEM.md** - Detailed booking system documentation
- **GALLERY_EXPERIENCE.md** - Gallery and experience page documentation
- **CHANGES_SUMMARY.md** - Summary of all changes made

## 🎨 Design Features

- Elegant, minimalist design
- Luxury brand aesthetic
- Smooth animations and transitions
- Professional typography
- High-quality imagery
- Consistent color scheme (gray-900, white)
- Hover effects and interactions
- Modal overlays
- Progress indicators

## 🔧 Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Sonner** - Toast notifications
- **Clsx** - Class name utilities

## 📝 Notes

- All Convex backend files removed
- Forms currently use console.log (replace with API calls)
- Sample data included for testing
- Images use Unsplash placeholders
- Videos need real URLs
- Email sending is simulated
- Downloads are simulated (need real implementation)

## 🚀 Deployment

### Build for Production:

```bash
npm run build
```

### Deploy to:
- Vercel
- Netlify
- AWS Amplify
- Any static hosting service

### Environment Variables Needed:

```env
VITE_API_URL=your-api-url
VITE_EMAIL_SERVICE_KEY=your-email-key
VITE_STORAGE_URL=your-storage-url
```

## 📞 Support

For questions or issues:
- Review documentation files
- Check component comments
- Test with demo credentials

## 🎉 Ready to Launch!

All core features are implemented and ready for backend integration. The site is fully functional with simulated backend calls and demo data.

**Next Steps:**
1. Add your real content (images, videos, text)
2. Set up backend services
3. Integrate APIs
4. Test thoroughly
5. Deploy to production

---

**Built with ❤️ for Gramtime Visuals**
