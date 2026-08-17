# Gramtime Visuals — Admin Dashboard

A standalone admin panel for managing consultation bookings. This is a **separate app** from the main frontend and can be hosted independently.

## Structure

```
admin/
├── index.html      # Entry point
├── config.js       # API configuration (change backend URL here)
├── styles.css      # AR/HUD design system styles
├── app.js          # Main application logic
└── README.md       # This file
```

## Running Locally

### Option 1: Open directly
Just open `admin/index.html` in your browser.

### Option 2: Serve with a simple server
```bash
# Using Python
cd admin && python -m http.server 3001

# Using Node (npx)
cd admin && npx serve -p 3001
```

Then visit `http://localhost:3001`

## How It Works

1. The admin panel fetches consultations from the backend API (`GET /api/consultations`)
2. New bookings made on the main website appear here automatically (auto-refreshes every 30 seconds)
3. You can:
   - View all consultation bookings
   - Filter by status (Pending, Confirmed, Completed, Cancelled)
   - View full details of each booking
   - Update booking status (Confirm, Complete, Cancel)
   - Delete bookings

## Configuration

Edit `config.js` to point to your backend:

```javascript
const ADMIN_CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api',  // Local development
  // API_BASE_URL: 'https://your-backend-url.com/api',  // Production
};
```

## Deployment

This admin panel is a static site (HTML/CSS/JS) with no build step. Deploy it to any static hosting:

- **Netlify**: Drag the `admin/` folder to Netlify
- **Vercel**: `vercel --prod` inside the `admin/` folder
- **GitHub Pages**: Push the `admin/` folder to a GitHub Pages repo
- **Any web server**: Upload the `admin/` folder to your server

### Important: Update `config.js` before deploying
Change the `API_BASE_URL` to your production backend URL.

## Backend API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/consultations` | Get all consultations |
| PUT | `/api/consultations/:id/status` | Update consultation status |
| DELETE | `/api/consultations/:id` | Delete a consultation |

## Security Note

For production, add authentication to the admin panel and protect the API endpoints with JWT middleware or API keys.