# Booking System Features

## Overview
This luxury photography website now includes a comprehensive booking system with the following features:

### 1. Booking Form (BookingForm.tsx)
A multi-step booking form that allows clients to book photography services for different niches.

**Features:**
- **Step 1: Client Details**
  - Full name, email, phone
  - Event date and location
  - Additional notes/special requests

- **Step 2: Terms and Conditions**
  - Comprehensive terms covering:
    - Booking and payment policies
    - Cancellation policy
    - Image delivery timeline
    - Copyright and usage rights
    - Model release
    - Liability
    - Weather and force majeure
    - Client responsibilities
    - Backup and storage
  - Checkbox to agree to all terms (required)

- **Step 3: Review and Confirm**
  - Review all booking details
  - Confirm and submit

**Functionality:**
- Generates a downloadable agreement document (TXT format)
- Simulates sending agreement to client's email
- Agreement includes all booking details and terms
- Success notification upon completion

### 2. Price List Viewer (PriceList.tsx)
A comprehensive pricing page with PDF viewer functionality.

**Features:**
- **Pricing Categories:**
  - Wedding Photography (Essential, Prestige, Luxury)
  - Portrait Photography (Individual, Family)
  - Corporate Photography (Headshots, Brand)
  - Event Photography (Half Day, Full Day)

- **Add-ons Section:**
  - Additional hours
  - Second photographer
  - Engagement sessions
  - Albums
  - Drone coverage
  - Videos
  - Raw files
  - Rush delivery
  - Travel fees

- **PDF Viewer Modal:**
  - View price list in PDF format
  - Download price list
  - Placeholder for custom PDF integration

- **Download Functionality:**
  - Download complete price list as text file
  - Includes all packages, add-ons, and important notes

### 3. Integration with Services Page
The Services component now includes:
- "BOOK NOW" buttons on each package
- Opens booking form with pre-selected package and niche
- Seamless booking experience

## How to Use

### For Clients:
1. Navigate to the "Investment" or "Pricing" page
2. Review available packages
3. Click "BOOK NOW" on desired package
4. Fill in your details (Step 1)
5. Read and agree to terms and conditions (Step 2)
6. Review your booking details (Step 3)
7. Confirm booking - agreement will be downloaded and emailed

### For Developers:

#### Adding a PDF Price List:
1. Create your price list PDF
2. Place it in the `public` folder as `price-list.pdf`
3. Uncomment the iframe in PriceList.tsx (line ~180):
```tsx
<iframe
  src="/price-list.pdf"
  className="w-full h-[600px] border-0"
  title="Price List PDF"
/>
```

#### Customizing Packages:
Edit the `packages` array in `Services.tsx` to add/modify packages:
```tsx
{
  _id: "unique-id",
  name: "Package Name",
  tier: "essential|prestige|luxury",
  basePrice: 5000,
  description: "Package description",
  features: ["Feature 1", "Feature 2"],
  addOns: [{ name: "Add-on", price: 500 }],
}
```

#### Email Integration:
To enable real email sending, update the `sendAgreementEmail` function in `BookingForm.tsx`:
```tsx
const sendAgreementEmail = async () => {
  // Replace with your email API endpoint
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agreementData),
  });
  return response.ok;
};
```

#### Customizing Terms and Conditions:
Edit the terms in `BookingForm.tsx` Step 2 section to match your business policies.

## File Structure
```
src/
├── components/
│   ├── BookingForm.tsx      # Multi-step booking form
│   ├── PriceList.tsx        # Price list viewer with PDF support
│   ├── Services.tsx         # Updated with booking integration
│   ├── Contact.tsx          # Updated without Convex
│   └── Navigation.tsx       # Updated with Pricing link
├── App.tsx                  # Updated routing
└── main.tsx                 # Removed Convex provider
```

## Notes
- All Convex dependencies have been removed
- Forms currently simulate backend calls (console.log)
- Agreement documents are generated as TXT files (can be upgraded to PDF)
- Email sending is simulated (needs backend integration)
- PDF viewer uses placeholder (add your PDF to enable)

## Future Enhancements
- Integrate with email service (SendGrid, AWS SES, etc.)
- Generate PDF agreements instead of TXT
- Add payment processing integration
- Store bookings in database
- Add booking calendar with availability
- Send automated confirmation emails
- Add booking management dashboard
