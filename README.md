# Trippa Delivery App

A modern delivery application that allows users to book different types of deliveries (bike, truck, van, and fuel) with a bidding system.

## Features

- Multiple delivery types (Bike, Truck, Van, Fuel)
- Bidding system for delivery requests
- Real-time updates using Supabase
- Modern UI with Chakra UI
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up your Supabase database with the following tables:

   ### delivery_requests
   - id (uuid, primary key)
   - user_id (uuid, foreign key to auth.users)
   - delivery_type (text)
   - pickup_location (text)
   - dropoff_location (text)
   - item_description (text)
   - weight (numeric, optional)
   - dimensions (text, optional)
   - status (text)
   - created_at (timestamp with time zone)

   ### bids
   - id (uuid, primary key)
   - delivery_request_id (uuid, foreign key to delivery_requests)
   - rider_id (uuid, foreign key to auth.users)
   - amount (numeric)
   - estimated_time (text)
   - status (text)
   - created_at (timestamp with time zone)

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- React
- TypeScript
- Vite
- Chakra UI
- Supabase
- React Router
