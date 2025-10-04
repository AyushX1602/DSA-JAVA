# GlobeTrotter

A trip planning application built during a hackathon with AI-powered trip generation, interactive maps, and community features.

## Key Features

- **Trip Planning**: Create itineraries with dates, budgets, and descriptions
- **AI Trip Generation**: Generate trips using Google Gemini AI
- **AI Cost Estimation**: Intelligent budget planning and expense forecasting
- **AI Audio Guide**: Voice-guided trip narration and audio descriptions
- **Interactive Maps**: Google Maps integration for locations
- **Stop Management**: Add multiple stops with custom notes
- **Place & Activity Tracking**: Log places and activities with expense tracking
- **Community Chat**: Share trips and chat with travelers
- **Admin Dashboard**: User management and analytics
- **Responsive UI**: Modern design with Tailwind CSS and Radix UI

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn with NeoBrutalism, React Query
- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL, JWT, Google Gemini AI
- **Tools**: Docker, pnpm, ESLint, Prettier

##  Quick Start

1. **Clone & Setup:**
   ```bash
   git clone <repo-url>
   cd GlobeTrotter
   chmod +x start.sh
   ```

2. **Environment:**
   ```bash
   cd server && cp env.example .env
   cd client && cp env.example.env
   # Configure API keys in .env
   ```

3. **Run Everything:**
   ```bash
   ./start.sh
   ```

## Project Structure

```
GlobeTrotter/
├── client/          # React frontend
├── server/          # NestJS backend + Prisma
├── docker-compose.yml
└── start.sh
```

## ️ Database

**Setup:**
```bash
cd server
pnpm install
pnpm db:setup      # Generate client + migrations
pnpm db:seed       # Optional: sample data
```

**Schema**: Users, Trips, TripStops, Places, Activities, CommunityMessages

## Development

**Backend:**
```bash
cd server
pnpm start:dev     # Dev server
pnpm test          # Run tests
pnpm lint          # Lint code
```

**Frontend:**
```bash
cd client
pnpm dev           # Dev server
```

## Environment Variables

**Backend (.env in server/):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/globetrotter"
JWT_SECRET="your-jwt-secret"
GEMINI_API_KEY="your-gemini-api-key"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
EMAILJS_SERVICE_ID="your-service-id"
EMAILJS_TEMPLATE_ID="template-id"
EMAILJS_PUBLIC_KEY="public-key" 
EMAILJS_PRIVATE_KEY="private-key"
```

**Frontend (.env in client/):**
```env
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

**Note**: Create `.env` files in both `server/` and `client/` directories.