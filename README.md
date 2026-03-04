# 🍹 Epcot Shirt Exchange

A mobile-friendly web app for coordinating a "Drink Around The World" shirt exchange among friends.

## Features

- **Join & Confirm**: Friends enter their name and shirt size to join
- **Random Assignment**: Admin generates random circular assignments (everyone buys for one person)
- **Locked Assignments**: Once generated, assignments never change (even on refresh)
- **Shirt Suggestions**: Anyone can suggest shirt ideas for participants
- **Phone Memory**: Each device remembers who you are via localStorage
- **Admin Panel**: Password-protected admin controls

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Redis** (for shared state)
- **Vercel** (deployment)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Redis

You need a Redis instance. Options:
- **Vercel KV** (recommended for Vercel deployment)
- **Upstash Redis** (free tier available)
- **Local Redis** (for development)

### 3. Environment Variables

Create a `.env.local` file:

```bash
# Redis connection URL
REDIS_URL=redis://localhost:6379
# or for Upstash/Vercel KV:
# REDIS_URL=rediss://default:your-password@your-host.upstash.io:6379

# Admin password hash (generate with bcrypt)
ADMIN_PASSWORD_HASH=$2a$10$YourHashHere
```

### 4. Generate Admin Password Hash

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

Replace `ADMIN_PASSWORD_HASH` in `.env.local` with the output.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Connect Redis

In your Vercel project:
- Go to **Storage** → **Create Database** → **KV**
- Or connect your Upstash Redis instance
- Vercel will automatically set `REDIS_URL`

### 2. Set Environment Variables

In Vercel project settings → **Environment Variables**:
- `ADMIN_PASSWORD_HASH`: Your bcrypt hash

### 3. Deploy

```bash
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Usage

### For Participants

1. Open the app link
2. Enter your name and shirt size
3. Tap "Yes, I'm In!"
4. Wait for admin to generate assignments
5. Once assigned, see who you're buying for
6. View and add shirt suggestions

### For Admin

1. Click "Admin" link at bottom of home page
2. Enter admin password
3. View all participants
4. Click "Generate Assignments Now" when ready (minimum 3 people)
5. Optionally view full mapping
6. Remove participants or reset everything if needed

## How It Works

- **Phone Memory**: localStorage stores your unique ID
- **Shared State**: Redis stores all participants, assignments, and suggestions
- **Assignment Lock**: Once generated, assignments are marked as locked in Redis
- **Circular Exchange**: Algorithm creates a circular chain (A→B→C→A) ensuring no one gets themselves

## API Routes

- `POST /api/join` - Join the exchange
- `GET /api/status` - Get current status
- `POST /api/suggest` - Add a shirt suggestion
- `POST /api/admin/generate` - Generate assignments (admin)
- `GET /api/admin/participants` - List participants (admin)
- `DELETE /api/admin/participants` - Remove participant (admin)
- `GET /api/admin/mapping` - View full mapping (admin)
- `POST /api/admin/reset` - Reset everything (admin)

## License

MIT
