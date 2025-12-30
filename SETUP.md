# Setup Guide - Ski Conditions Aggregator

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BTizzy/ski-conditions-aggregator.git
   cd ski-conditions-aggregator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment (if needed):**
   ```bash
   cp .env.example .env.local  # if example exists
   # No API keys required for basic functionality
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:3000
   ```

## What You'll See

### Map View
- Interactive Leaflet map of Northeast US ski resorts
- Blue markers showing ski resort locations
- Precipitation radar overlay with animation controls

### Radar Controls (Top-Left)
- **Play/Pause:** Start/stop animation
- **Time Window:** Select 24h, 48h, or 72h historical data
- **Speed:** Adjust frame duration (100-2000ms)
- **Opacity:** Control overlay transparency (0-100%)
- **Status:** Shows frame count and current timestamp

## Features

✅ **Real-time Precipitation Radar**
- NOAA MRMS data (every 2 minutes)
- RainViewer fallback (every 10 minutes)
- 72-hour historical lookback

✅ **Smooth Animation**
- 60fps canvas rendering
- Crossfade transitions between frames
- Map zoom/pan independent

✅ **Interactive Map**
- Zoom and pan without affecting radar
- Click markers for resort details
- Ski condition data display

## Development

### Project Structure
```
ski-conditions-aggregator/
├── app/
│   ├── api/
│   │   ├── radar/
│   │   │   ├── frames/route.ts    # Frame timestamps API
│   │   │   ├── tile/route.ts      # Tile proxy endpoint
│   │   │   └── ...
│   │   └── scrape/route.ts        # Ski condition scraping
│   ├── components/
│   │   ├── ResortMap.tsx          # Main map + radar component
│   │   ├── ResortCard.tsx         # Resort details card
│   │   └── ...
│   ├── page.tsx                   # Home page
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── lib/
│   ├── resorts.ts                 # Resort data
│   ├── nws.ts                     # NWS API integration
│   ├── snowModel.ts               # Snow forecast model
│   └── ...
├── public/                        # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

### Build

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build

# Production start
npm start

# Type checking
npm run tsc

# Linting
npm run lint
```

## Data Sources

### Weather Radar
- **MRMS:** NOAA Multi-Radar Multi-Sensor System
  - Official US government weather radar
  - Updated every 2 minutes
  - Free, public access
  
- **RainViewer:** Global precipitation data
  - 1km resolution
  - 72-hour lookback
  - Free tier available

### Ski Conditions
- Individual resort websites (via web scraping)
- NWS point forecasts (API)
- HRRR model data (future)

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Vercel will:
- Auto-detect Next.js
- Deploy API routes as serverless functions
- Set up CI/CD with GitHub
- Provide free SSL, CDN, serverless

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t ski-conditions .
docker run -p 3000:3000 ski-conditions
```

### Traditional Server (Node.js)

```bash
# On server
npm install
npm run build
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start "npm start" --name "ski-conditions"
pm2 startup
pm2 save
```

## Environment Variables

Optional (for future integrations):

```bash
# .env.local

# RainViewer (if using paid tier)
RAINVIEWER_API_KEY=your_key_here

# HRRR Model (if integrating forecast)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Ski resort scraping
SCRAPE_RATE_LIMIT_MS=2000
SCRAPE_TIMEOUT_MS=30000
```

## Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Modules not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build fails
```bash
npm run tsc  # Check TypeScript errors
npm run lint  # Check ESLint errors
```

### Radar not loading
1. Check Network tab in DevTools
2. Verify `/api/radar/frames` returns data
3. Check browser console for CORS errors
4. Try refreshing the page

## Next Steps

1. **Customize Resorts:**
   - Edit `lib/resorts.ts` to add/remove resorts
   - Add weather station coordinates

2. **Add More Data:**
   - Integrate additional ski resort APIs
   - Add weather station data
   - Add avalanche forecast data

3. **Styling:**
   - Customize colors in `app/globals.css`
   - Modify Tailwind config in `tailwind.config.ts`
   - Update map tile provider if desired

4. **Deploy:**
   - Push to GitHub
   - Connect to Vercel
   - Enable auto-deploy on push

## Support

- **GitHub Issues:** Report bugs
- **Discussions:** Ask questions
- **Wiki:** Contribution guidelines

## License

MIT - See LICENSE file

## Credits

- NOAA for weather data
- Leaflet for mapping library
- RainViewer for radar tiles
- OpenStreetMap for base map
