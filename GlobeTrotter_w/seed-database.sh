#!/bin/bash

echo "🌱 Starting GlobeTrotter Database Seeding..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the GlobeTrotter root directory"
    exit 1
fi

# Check if server directory exists
if [ ! -d "server" ]; then
    echo "❌ Error: Server directory not found"
    exit 1
fi

echo "📁 Found server directory"
echo "🔧 Running database seed script..."

# Change to server directory and run the seed
cd server

# Check if pnpm is available
if command -v pnpm &> /dev/null; then
    echo "📦 Using pnpm..."
    pnpm db:seed
elif command -v npm &> /dev/null; then
    echo "📦 Using npm..."
    npm run db:seed
else
    echo "❌ Error: Neither pnpm nor npm found. Please install one of them."
    exit 1
fi

echo ""
echo "✅ Seeding completed!"
echo "📱 Demo user: demo@globetrotter.com / demo123"
echo "🗺️  Sample trips are now available in the database"
echo ""
echo "🚀 You can now start your frontend and explore the sample data!"

