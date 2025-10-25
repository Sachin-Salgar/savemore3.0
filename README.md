# SaveMore

Progressive Web App (PWA) for Self Help Group (SHG) management across multiple communities.

## Project Setup

### Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account and project credentials

### Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings:
1. Go to Settings > API
2. Copy the Project URL and Anon public key

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Troubleshooting

### "Failed to fetch" or "TypeError: Failed to fetch" Error

This error typically indicates that Supabase credentials are not properly configured.

**Solutions:**

1. **Check Environment Variables**
   - Ensure `.env.local` file exists in the root directory
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
   - Both values must be non-empty strings

2. **Restart Dev Server**
   ```bash
   npm run dev
   ```
   The dev server needs to be restarted after changing environment variables.

3. **Verify Credentials**
   - Log in to your Supabase account
   - Go to Settings > API
   - Copy the exact values (including the full URL with https://)
   - Ensure there are no extra spaces in the values

4. **Check Network Connection**
   - Ensure your machine can reach `https://your-project.supabase.co`
   - Check if any VPN or firewall is blocking the connection

5. **Clear Browser Cache**
   - Clear your browser's cache and cookies
   - Try in an incognito/private browsing window

### Configuration Error on Login Page

If you see "Missing environment variables" on the login page:

1. Create `.env.local` file with the required variables (see Environment Variables section)
2. Restart the dev server: `npm run dev`
3. Refresh the browser

### Demo Accounts

Once configured, you can test with demo accounts:
- **Admin:** admin@demo.com / admin123
- **President:** president@demo.com / president123
- **Member:** member@demo.com / member123

## Features

- Member savings tracking and transaction history
- Loan management with EMI scheduling
- President dashboard for group management
- Admin panel for multi-group oversight
- Real-time data synchronization
- Offline-capable PWA

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Build:** Vite
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
