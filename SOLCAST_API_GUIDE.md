# Solcast API Integration Guide

## Overview
The calculator currently uses fallback solar irradiance data based on major Australian cities. For production, you can integrate Solcast's API for precise solar data based on exact coordinates.

## Solcast Free Tier
- **Cost**: FREE up to 50 API calls per day
- **After that**: ~$50-100 AUD/month for more calls
- **Australian-focused**: Built specifically for Australian solar conditions
- **Accuracy**: Very high - used by solar installers across Australia

## Setup Instructions

### 1. Get API Key
1. Sign up at https://solcast.com/free-rooftop-solar-api
2. Select the "Hobbyist" tier (free, 50 calls/day)
3. Copy your API key

### 2. Update the Code
Replace the `getSolarIrradiance` function with this:

```javascript
const getSolarIrradiance = async (postcode) => {
  // Check cache first
  if (solarDataCache[postcode]) {
    return solarDataCache[postcode];
  }

  const coords = getCoordinatesFromPostcode(postcode);
  
  try {
    const response = await fetch(
      `https://api.solcast.com.au/data/live/radiation_and_weather?latitude=${coords.lat}&longitude=${coords.lon}&format=json`,
      {
        headers: {
          'Authorization': 'Bearer YOUR_SOLCAST_API_KEY_HERE'
        }
      }
    );
    
    const data = await response.json();
    
    // Calculate average daily irradiance from Solcast data
    const avgIrradiance = data.estimated_actuals
      .slice(0, 24)  // Last 24 hours
      .reduce((sum, hour) => sum + hour.ghi, 0) / 24 / 1000; // Convert W/m² to kWh/m²
    
    const result = {
      mean: avgIrradiance,
      std: avgIrradiance * 0.15, // Estimate std as 15% of mean
      city: coords.city,
      lat: coords.lat,
      lon: coords.lon
    };
    
    // Cache the result
    setSolarDataCache(prev => ({ ...prev, [postcode]: result }));
    
    return result;
    
  } catch (error) {
    console.error('Solcast API error:', error);
    // Fallback to hardcoded estimates
    return {
      mean: 4.5,
      std: 0.6,
      city: coords.city,
      lat: coords.lat,
      lon: coords.lon
    };
  }
};
```

### 3. Rate Limiting
With 50 calls/day on the free tier:
- Implement aggressive caching (already done via `solarDataCache`)
- Cache results in localStorage or database
- Consider showing a warning if approaching limit
- Most users will only calculate 1-3 times per visit

### 4. Alternative: Geocoding for Better Postcode→Coordinates
Current postcode mapping is simplified (only major cities). For better accuracy:

**Option A - Geocoding API (also free)**:
```javascript
const getCoordinatesFromPostcode = async (postcode) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?postalcode=${postcode}&country=Australia&format=json`
  );
  const data = await response.json();
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      city: data[0].display_name
    };
  }
  return { lat: -33.8688, lon: 151.2093, city: 'Sydney' }; // fallback
};
```

**Option B - Hardcoded database**:
Include a JSON file with all Australian postcodes and coordinates (one-time setup).

## Battery Price Updates

Current prices (AUD, Jan 2025) are hardcoded. To keep them current:

### Option 1: Manual Updates (Recommended for now)
- Update `batteryOptions` object quarterly
- Check prices at:
  - solarquotes.com.au
  - energymatters.com.au
  - Direct from installers

### Option 2: JSON Config File
```javascript
// battery-prices.json
{
  "lastUpdated": "2025-01-15",
  "batteries": {
    "tesla_powerwall2": {
      "price": 14500,
      // ... other specs
    }
  }
}

// Load in component
const [batteryPrices, setBatteryPrices] = useState(null);

useEffect(() => {
  fetch('/battery-prices.json')
    .then(r => r.json())
    .then(setBatteryPrices);
}, []);
```

### Option 3: Admin Panel (Future)
Build a simple admin interface where you can update prices without touching code.

## Costs Summary

**Solcast API**:
- Free: 50 calls/day (plenty for small site)
- Paid: ~$50-100 AUD/month for 500-1000 calls/day

**Geocoding (optional)**:
- OpenStreetMap Nominatim: FREE
- Google Geocoding: $5 USD per 1000 calls

**Recommendation**: Start with free tier, monitor usage, upgrade only if needed.
