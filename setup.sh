#!/bin/bash

# Solar EV Calculator - Quick Setup Script
# This script sets up your project structure

echo "🌞 Setting up Solar EV Calculator..."

# Create directory structure
mkdir -p src/components
mkdir -p src/layouts
mkdir -p src/pages
mkdir -p public

echo "📁 Created directory structure"

# Move files to correct locations
echo "📦 Moving files..."

# Component
if [ -f "solar-ev-calculator.jsx" ]; then
    mv solar-ev-calculator.jsx src/components/SolarEVCalculator.jsx
    echo "✓ Moved calculator component"
fi

# Layout
if [ -f "Layout.astro" ]; then
    mv Layout.astro src/layouts/
    echo "✓ Moved layout"
fi

# Index page
if [ -f "index.astro" ]; then
    mv index.astro src/pages/
    echo "✓ Moved index page"
fi

# Battery config
if [ -f "battery-config.json" ]; then
    mv battery-config.json public/
    echo "✓ Moved battery config to public/"
fi

# Config files should already be in root
# - package.json
# - astro.config.mjs
# - tsconfig.json
# - .gitignore

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:4321"
echo ""
echo "To deploy:"
echo "1. Create GitHub repo"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'Initial commit'"
echo "5. git remote add origin YOUR_REPO_URL"
echo "6. git push -u origin main"
echo "7. Deploy to Vercel/Netlify (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for full instructions"
