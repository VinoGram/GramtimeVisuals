# Private Gallery & Experience Page Documentation

## New Features Added

### 1. Private Viewing Room (PrivateGallery.tsx)
A password-protected gallery system where clients can view and download their photos.

#### Features:
- **Password Protection**
  - Gallery ID + Password authentication
  - Secure access to client galleries
  - Demo credentials provided for testing

- **Gallery Management**
  - View all images in grid layout
  - Click to view full-size images (lightbox)
  - Download individual images
  - Download all images at once
  - Select favorites (UI ready)
  - Order prints (UI ready)

- **Client Information**
  - Client name display
  - Event type and date
  - Image count
  - Gallery expiration notice

- **User Experience**
  - Elegant login screen
  - Responsive grid layout
  - Hover effects on images
  - Full-screen lightbox viewer
  - Logout functionality

#### Demo Credentials:
```
Gallery 1:
- Gallery ID: gallery-001
- Password: wedding2024
- Client: Sarah & Michael

Gallery 2:
- Gallery ID: gallery-002
- Password: family2024
- Client: Johnson Family
```

### 2. Experience Page (Experience.tsx)
A multimedia homepage showcasing the Gramtime Visuals journey and process.

#### Sections:

**Hero Section**
- Full-screen hero with background image
- Brand tagline
- Scroll indicator animation
- Call-to-action button

**Brand Story**
- "Who We Are" section
- Two-column layout with text and image
- Brand philosophy and values

**The Process (8 Steps)**
1. **Initial Inquiry** 💌
   - Inquiry form submission
   - Vision sharing
   - 24-hour response

2. **Consultation** ☕
   - Complimentary meeting
   - Portfolio review
   - Package discussion

3. **Creative Direction** 🎨
   - Mood board creation
   - Location scouting
   - Styling guidance

4. **Planning** 📋
   - Timeline creation
   - Vendor coordination
   - Preparation guide

5. **The Photographic Experience** 📸
   - Professional atmosphere
   - Expert lighting
   - Natural direction

6. **In-Person Reveal** ✨
   - Private viewing
   - Slideshow presentation
   - Champagne celebration

7. **Ordering** 🖼️
   - Album design
   - Print selection
   - Wall art consultation

8. **Heirloom Delivery** 🎁
   - Luxury packaging
   - White-glove delivery
   - Installation assistance

**Behind The Scenes**
- 4 video showcases:
  1. The Art of Lighting
  2. Location Scouting
  3. The Editing Process
  4. Album Craftsmanship
- Video modal player (ready for video URLs)
- Hover effects and play buttons

**Philosophy Section**
- Brand quote and mission
- Dark background for emphasis

**Call to Action**
- Final conversion section
- Multiple action buttons

## Integration

### Navigation Updates:
- Brand name changed to "GRAMTIME VISUALS"
- "Experience" replaces "Home"
- "Client Gallery" added to navigation
- Experience page is now the default homepage

### App Routing:
- `home` → Experience page
- `private-gallery` → Private Gallery
- All other routes maintained

## Customization Guide

### Adding Real Client Galleries:

Edit `PrivateGallery.tsx` and update the `sampleGalleries` array:

```tsx
const sampleGalleries: Gallery[] = [
  {
    id: "unique-gallery-id",
    clientName: "Client Name",
    password: "secure-password",
    eventDate: "Event Date",
    eventType: "Event Type",
    coverImage: "cover-image-url",
    images: [
      {
        id: "img-1",
        url: "full-size-image-url",
        thumbnail: "thumbnail-url",
        filename: "image-name.jpg",
      },
      // Add more images...
    ],
  },
];
```

### Adding Behind-The-Scenes Videos:

Edit `Experience.tsx` and update the `behindTheScenes` array:

```tsx
const behindTheScenes = [
  {
    id: 1,
    title: "Video Title",
    thumbnail: "thumbnail-url",
    videoUrl: "your-video-url", // YouTube, Vimeo, or direct link
    description: "Video description",
  },
];
```

Then uncomment the iframe in the video modal:

```tsx
<iframe
  src={videoUrl}
  className="w-full h-full"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

### Customizing Process Steps:

Edit the `processSteps` array in `Experience.tsx`:

```tsx
{
  id: 1,
  title: "Step Title",
  icon: "🎯", // Any emoji
  description: "Step description",
  details: [
    "Detail 1",
    "Detail 2",
    // Add more details...
  ],
}
```

## Backend Integration Needed

### Private Gallery:
1. **Authentication System**
   - Replace sample data with database queries
   - Implement secure password hashing
   - Add session management
   - Token-based authentication

2. **Image Storage**
   - Use cloud storage (AWS S3, Cloudinary, etc.)
   - Generate signed URLs for secure access
   - Implement image optimization
   - CDN integration

3. **Download Functionality**
   - Create zip files for bulk downloads
   - Track download analytics
   - Implement download limits if needed

4. **Gallery Management**
   - Admin panel to create galleries
   - Upload images interface
   - Set expiration dates
   - Send gallery access emails

### Experience Page:
1. **Video Hosting**
   - Upload videos to YouTube/Vimeo
   - Or use video hosting service
   - Update video URLs in component

2. **Content Management**
   - CMS integration for easy updates
   - Dynamic content loading
   - Image optimization

## File Structure
```
src/
├── components/
│   ├── PrivateGallery.tsx    # Password-protected client gallery
│   ├── Experience.tsx         # New homepage with journey
│   ├── Navigation.tsx         # Updated with new links
│   └── App.tsx               # Updated routing
```

## Features Summary

### Private Gallery ✅
- Password protection
- Image viewing (grid + lightbox)
- Individual image download
- Bulk download all images
- Responsive design
- Demo galleries included
- Logout functionality
- Gallery information display

### Experience Page ✅
- Full-screen hero section
- Brand story section
- 8-step process with icons
- Behind-the-scenes videos
- Video modal player
- Philosophy section
- Call-to-action sections
- Smooth scrolling
- Responsive design

## Testing

### Test Private Gallery:
1. Navigate to "Client Gallery" in menu
2. Use demo credentials:
   - Gallery ID: `gallery-001`
   - Password: `wedding2024`
3. Test image viewing and downloads
4. Test logout functionality

### Test Experience Page:
1. Navigate to "Experience" (homepage)
2. Scroll through all sections
3. Click video thumbnails
4. Test all buttons and interactions

## Production Checklist

- [ ] Replace sample gallery data with real database
- [ ] Implement secure authentication
- [ ] Set up cloud image storage
- [ ] Add real video URLs
- [ ] Implement actual download functionality
- [ ] Add analytics tracking
- [ ] Set up email notifications for gallery access
- [ ] Create admin panel for gallery management
- [ ] Optimize images for web
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add SEO metadata
- [ ] Test on all devices
- [ ] Security audit

## Support

For questions or issues:
- Email: support@gramtimevisuals.com
- Documentation: See BOOKING_SYSTEM.md for booking features
