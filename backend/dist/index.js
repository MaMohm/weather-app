"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
// Also try loading from a shared path if in production
dotenv_1.default.config({ path: '/var/www/weather-backend/shared/backend.env' });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Trust Proxy (required for Nginx/Cloudflare)
app.set('trust proxy', 1);
// CORS Configuration
const allowedOrigins = [
    'https://mamohm.github.io',
    'http://localhost:5173',
    'http://localhost:3000' // For local testing
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express_1.default.json());
// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
});
// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Geocoding API Endpoint
app.get('/api/geocode', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Missing query parameter "q"' });
        }
        // Using Open-Meteo Geocoding API
        const response = await axios_1.default.get('https://geocoding-api.open-meteo.com/v1/search', {
            params: {
                name: query,
                count: 5,
                language: 'en',
                format: 'json'
            }
        });
        if (!response.data.results) {
            return res.json([]);
        }
        const results = response.data.results.map((item) => ({
            id: item.id,
            name: item.name,
            latitude: item.latitude,
            longitude: item.longitude,
            country: item.country,
            timezone: item.timezone,
            admin1: item.admin1
        }));
        res.json(results);
    }
    catch (error) {
        console.error('Geocode Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch geocoding data' });
    }
});
// Weather API Endpoint (Proxy to Open-Meteo)
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon, tz } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Missing lat or lon parameters' });
        }
        const timezone = tz || 'UTC';
        // Fetching current, hourly, and daily weather data
        const response = await axios_1.default.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: lat,
                longitude: lon,
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
                hourly: 'temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapor_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration',
                timezone: timezone
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Weather API Error:', error.message);
        if (error.response) {
            console.error('Weather API Response:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
