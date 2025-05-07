# Trippa Web Delivery Platform

Trippa is a modern web platform for booking, tracking, and managing delivery services. Built with React, Chakra UI, and Supabase, it offers a seamless experience for customers and delivery partners.

## Features
- User authentication (sign up, login, email verification)
- Book various delivery types (bike, truck, van, fuel)
- Real-time bidding for delivery requests
- Order summary and secure payment integration (Paystack)
- Track orders and view delivery status
- Responsive, modern UI with Chakra UI

## Tech Stack
- **Frontend:** React, TypeScript, Chakra UI
- **Backend:** Supabase (Database & Auth)
- **Payments:** Paystack

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Trippaafrica/Tripparepo.git
   cd Tripparepo
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase credentials and Paystack public key.

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at `http://localhost:5173` (or the port shown in your terminal).

## Project Structure
```
src/
  components/      # Reusable UI components
  contexts/        # React context providers (e.g., Auth)
  pages/           # Page components (route views)
  services/        # API and external service logic
  theme/           # Chakra UI theme customization
  App.tsx          # Main app component
  routes.tsx       # App routes
public/
  images/          # Static images and banners
  logo.svg         # Favicon/logo
```

## Deployment
- Build for production:
  ```bash
  npm run build
  # or
  yarn build
  ```
- Deploy the `dist/` folder to your preferred static hosting (Vercel, Netlify, etc.)

## License
MIT

---
For questions or support, please open an issue or contact the Trippa team.
