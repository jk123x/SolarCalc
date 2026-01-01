# Solar EV Calculator

A probability-weighted expected value calculator for solar panel investment decisions in Australia.

## Features

- ✅ Real Australian solar irradiance data for 8 major cities
- ✅ Time-of-Use (TOU) pricing support
- ✅ Automatic state battery rebates (VIC, NSW, SA)
- ✅ Federal solar rebates (STCs)
- ✅ Battery degradation modeling
- ✅ 25-year NPV projections
- ✅ Multiple scenario analysis (10th/50th/90th percentile)
- ✅ Interactive charts (Recharts)
- ✅ Mobile responsive

## Tech Stack

- **Astro** - Static site generator
- **React** - UI components
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling (via inline styles)

## Quick Start

```bash
# 1. Run setup script
chmod +x setup.sh
./setup.sh

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Visit http://localhost:4321
```

## Project Structure

```
├── src/
│   ├── components/
│   │   └── SolarEVCalculator.jsx    # Main calculator
│   ├── layouts/
│   │   └── Layout.astro              # Base layout
│   └── pages/
│       └── index.astro                # Homepage
├── public/
│   └── battery-config.json           # Battery pricing (update quarterly)
├── package.json
├── astro.config.mjs
└── DEPLOYMENT_GUIDE.md               # Full deployment instructions
```

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

**Quick deploy to Vercel:**
1. Push to GitHub
2. Import in Vercel
3. Deploy!

## Maintenance

### Quarterly Updates
- Update `public/battery-config.json` with latest prices
- Check for new state rebates

### API Integration (Optional)
- Solcast API for live solar data (50 calls/day free)
- See `SOLCAST_API_GUIDE.md`

## Battery Modeling

The calculator models realistic battery economics including:
- Degradation rates (1.5%-3% annually depending on battery)
- Replacement timing (based on capacity thresholds)
- State rebates (auto-applied by postcode)
- TOU pricing benefits

**Battery Comparison:**
- **BYD** ($8k): 3%/yr degradation, replace ~year 13
- **LG** ($9.5k): 2.5%/yr degradation, replace ~year 15
- **Tesla** ($14.5k): 2%/yr degradation, replace ~year 17
- **Sonnen** ($16k): 1.5%/yr degradation, replace ~year 20+

## Contributing

To improve calculations or add features:
1. Fork the repo
2. Create feature branch
3. Test thoroughly with different inputs
4. Submit PR

## License

MIT

## Support

Built for Australian solar investors. For questions about the calculations, see the scenario analysis section in the app.
