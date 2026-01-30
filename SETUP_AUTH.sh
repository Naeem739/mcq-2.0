#!/bin/bash

# Quick Start Guide for Authentication Setup
# Run this after pulling the new auth changes

echo "🔐 MCQ Quiz - Authentication Setup"
echo "=================================="
echo ""

echo "Step 1: Install dependencies (if needed)"
npm install

echo ""
echo "Step 2: Update Prisma migrations"
npm run prisma:migrate

echo ""
echo "Step 3: Make sure .env is configured"
echo "Copy .env.example to .env if you haven't already:"
echo "  cp env.example .env"
echo ""
echo "Key settings in .env:"
echo "  - DATABASE_URL (must be configured)"
echo "  - ADMIN_PASSWORD (optional, defaults to 'admin123')"
echo "  - EMAIL_SERVICE_URL and EMAIL_API_KEY (optional, for production)"
echo ""

echo "Step 4: Start development server"
npm run dev

echo ""
echo "✅ Setup complete!"
echo ""
echo "Access the app at: http://localhost:3000"
echo ""
echo "📝 Test the auth system:"
echo "  - Signup:  http://localhost:3000/auth/signup"
echo "  - Login:   http://localhost:3000/auth/login"
echo "  - Practice: http://localhost:3000/practice (requires login)"
echo ""
echo "📚 For detailed setup guide, see AUTH_SETUP.md"
