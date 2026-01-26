import {
    Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow,
    Sun, Wind, Droplets, Snowflake
} from 'lucide-react';

/**
 * Maps WMO Weather Code to configuration (Icon, Text, Color)
 * @param {number} code - WMO Weather Code (0-99)
 * @param {boolean} isDay - 1 for Day, 0 for Night
 */
export const getWeatherConfig = (code, isDay = 1) => {
    // Default config
    let config = {
        label: 'Unknown',
        icon: Sun,
        color: '#9ca3af', // Gray
        bgGradient: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)',
        severity: 'low'
    };

    // Code Mapping (Open-Meteo WMO Codes)
    switch (true) {
        case (code === 0): // Clear sky
            config = {
                label: 'Clear Sky',
                icon: Sun,
                color: '#f59e0b', // Amber/Orange
                bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
                severity: 'low'
            };
            break;
        case (code >= 1 && code <= 3): // Partly cloudy
            config = {
                label: 'Partly Cloudy',
                icon: Cloud,
                color: '#60a5fa', // Blue
                bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                severity: 'low'
            };
            break;
        case (code === 45 || code === 48): // Fog
            config = {
                label: 'Foggy',
                icon: CloudFog,
                color: '#6b7280', // Gray
                bgGradient: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)',
                severity: 'medium'
            };
            break;
        case (code >= 51 && code <= 55): // Drizzle
            config = {
                label: 'Drizzle',
                icon: CloudDrizzle,
                color: '#3b82f6', // Blue
                bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
                severity: 'medium'
            };
            break;
        case (code >= 61 && code <= 67): // Rain
            config = {
                label: 'Rain',
                icon: CloudRain,
                color: '#2563eb', // Darker Blue
                bgGradient: 'linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)',
                severity: 'high'
            };
            break;
        case (code >= 71 && code <= 77): // Snow
            config = {
                label: 'Snow',
                icon: Snowflake,
                color: '#0ea5e9', // Sky Blue
                bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 100%)',
                severity: 'high'
            };
            break;
        case (code >= 80 && code <= 82): // Rain Showers
            config = {
                label: 'Rain Showers',
                icon: CloudRain,
                color: '#1d4ed8',
                bgGradient: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)',
                severity: 'high'
            };
            break;
        case (code >= 95 && code <= 99): // Thunderstorm
            config = {
                label: 'Thunderstorm',
                icon: CloudLightning,
                color: '#7c3aed', // Purple
                bgGradient: 'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 100%)',
                severity: 'extreme'
            };
            break;
    }

    // Night override for Clear/Cloudy
    if (!isDay && (code <= 3)) {
        config.color = '#4b5563'; // Darker for night
        config.bgGradient = 'linear-gradient(135deg, #1f2937 0%, #374151 100%)';
    }

    return config;
};

const WEATHER_IMAGES = {
    clear_day: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=800&q=80', // Sunny Blue Sky
    clear_night: 'https://images.unsplash.com/photo-1532074550544-2a1d227498c8?auto=format&fit=crop&w=800&q=80', // Starry Night
    cloudy_day: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80', // Fluffy Clouds
    cloudy_night: 'https://images.unsplash.com/photo-1534274988774-4b5b7b9136c3?auto=format&fit=crop&w=800&q=80', // Dark Clouds
    rain: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80', // Rain window
    snow: 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=800&q=80', // Snow tree
    storm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=800&q=80', // Lightning
    fog: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=800&q=80' // Foggy forest
};

export const getWeatherImage = (code, isDay = 1) => {
    // 0: Clear
    if (code === 0) return isDay ? WEATHER_IMAGES.clear_day : WEATHER_IMAGES.clear_night;

    // 1-3: Cloudy
    if (code <= 3) return isDay ? WEATHER_IMAGES.cloudy_day : WEATHER_IMAGES.cloudy_night;

    // 45, 48: Fog
    if (code === 45 || code === 48) return WEATHER_IMAGES.fog;

    // 51-67, 80-82: Rain
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return WEATHER_IMAGES.rain;

    // 71-77, 85-86: Snow
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return WEATHER_IMAGES.snow;

    // 95-99: Thunderstorm
    if (code >= 95) return WEATHER_IMAGES.storm;

    return isDay ? WEATHER_IMAGES.clear_day : WEATHER_IMAGES.clear_night;
};

export const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    });
};
