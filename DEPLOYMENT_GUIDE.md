# Solar EV Calculator - Deployment Guide

## Project Structure

```
solar-ev-calculator/
├── src/
│   ├── components/
│   │   └── SolarEVCalculator.jsx    # Main calculator component
│   ├── layouts/
│   │   └── Layout.astro             # Base layout
│   └── pages/
│       ├── index.astro               # Homepage (calculator)
│       └── what-is-tou-pricing.astro # TOU pricing explanation page (create this)
├── public/
│   └── battery-config.json          # Battery pricing (update quarterly)
├── package.json
├── astro.config.mjs
└── tsconfig.json
```

## Setup Instructions

### 1. Initialize the Project

```bash
# Create project directory
mkdir solar-ev-calculator
cd solar-ev-calculator

# Copy files
# - Copy package.json, astro.config.mjs to root
# - Copy solar-ev-calculator.jsx to src/components/SolarEVCalculator.jsx
# - Copy Layout.astro to src/layouts/
# - Copy index.astro to src/pages/
# - Copy battery-config.json to public/

# Install dependencies
npm install
```

### 2. Update Component Import

In `src/components/SolarEVCalculator.jsx`, if loading battery config from file:

```javascript
// Change this:
useEffect(() => {
  const config = { ... };
  setBatteryConfig(config);
}, []);

// To this:
useEffect(() => {
  fetch('/battery-config.json')
    .then(r => r.json())
    .then(setBatteryConfig);
}, []);
```

### 3. Create TOU Pricing Page

Create `src/pages/what-is-tou-pricing.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="What is Time-of-Use Pricing?">
  <div class="max-w-4xl mx-auto px-6 py-16">
    <h1 class="text-4xl font-bold mb-6">What is Time-of-Use (TOU) Pricing?</h1>
    
    <p class="mb-4">
      Time-of-Use pricing means your electricity costs different amounts depending on when you use it...
    </p>
    
    <!-- Add email signup form here -->
    <div class="mt-12 p-8 bg-blue-50 rounded-lg">
      <h2 class="text-2xl font-bold mb-4">Get the Complete Solar Guide</h2>
      <form action="YOUR_EMAIL_SERVICE" method="POST">
        <input type="email" name="email" placeholder="your@email.com" />
        <button type="submit">Subscribe</button>
      </form>
    </div>
  </div>
</Layout>
```

### 4. Test Locally

```bash
npm run dev
```

Visit `http://localhost:4321`

## Git Setup

### Initialize Repository

```bash
# Initialize git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build output
dist/
.astro/

# Environment
.env
.env.local

# IDEs
.vscode/
.idea/

# OS
.DS_Store
EOF

# Initial commit
git add .
git commit -m "Initial commit: Solar EV Calculator"
```

### Push to GitHub

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/solar-ev-calculator.git
git branch -M main
git push -u origin main
```

## Deployment Options

### Option 1: Vercel (Recommended - Free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Framework preset: Astro
5. Deploy!

**Custom domain:**
- Add domain in Vercel settings
- Point your domain's DNS to Vercel

### Option 2: Netlify (Also Free)

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

### Option 3: Cloudflare Pages (Free)

1. Push code to GitHub
2. Go to Cloudflare Pages
3. Connect repository
4. Framework preset: Astro
5. Deploy!

## Updating Battery Prices

Every quarter, update `public/battery-config.json`:

```json
{
  "lastUpdated": "2025-04-15",
  "batteries": {
    "byd_hvs": {
      "cost": 8200,  // Update this
      // ... rest stays the same
    }
  }
}
```

Then:
```bash
git add public/battery-config.json
git commit -m "Update battery prices Q2 2025"
git push
```

Your deployment platform will auto-deploy the update.

## Integrating Solcast API

When ready to use live solar data (free tier: 50 calls/day):

1. Sign up at [solcast.com](https://solcast.com/free-rooftop-solar-api)
2. Get API key
3. Add to environment variables:
   - Vercel: Settings > Environment Variables
   - Add: `SOLCAST_API_KEY=your_key_here`
4. Update the `getSolarIrradiance` function (see SOLCAST_API_GUIDE.md)

## Email Integration

For the email signup form, integrate with:
- **ConvertKit** (recommended for creators)
- **Mailchimp** (free up to 500 subscribers)
- **Buttondown** (simple, developer-friendly)

All have simple form endpoints you can POST to.

## Analytics (Optional)

Add to `src/layouts/Layout.astro` before `</head>`:

```astro
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Or Plausible (privacy-friendly) -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Troubleshooting

**Build errors about Recharts:**
- Make sure `client:load` is on the component in index.astro
- Recharts is client-side only, won't work with SSR

**Styles not loading:**
- The component has inline styles, should work out of the box
- If issues, consider extracting to a CSS file

**Battery config not loading:**
- Check that battery-config.json is in `public/` folder
- Check browser console for fetch errors

## Maintenance

**Quarterly tasks:**
1. Update battery prices in `battery-config.json`
2. Check for new state rebates
3. Review electricity rate assumptions

**Annual tasks:**
1. Update solar irradiance data if available
2. Review degradation rates against new research
3. Update component dependencies: `npm update`

## Support

For questions or issues:
1. Check browser console for errors
2. Test calculations manually to verify logic
3. Review scenario descriptions for accuracy

Good luck! 🚀
