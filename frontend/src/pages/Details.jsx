import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getWeather } from '../services/api';

// Weather code to background image mapping (Open-Meteo WMO codes)
const getWeatherBackground = (weatherCode) => {
    if (weatherCode === undefined || weatherCode === null) return 'sunny';

    // Clear sky (0)
    if (weatherCode === 0) return 'sunny';

    // Mainly clear, partly cloudy (1-3)
    if (weatherCode >= 1 && weatherCode <= 3) return 'cloudy';

    // Fog (45, 48)
    if (weatherCode === 45 || weatherCode === 48) return 'cloudy';

    // Drizzle (51, 53, 55), Rain (61, 63, 65), Freezing rain (66, 67)
    if ((weatherCode >= 51 && weatherCode <= 55) ||
        (weatherCode >= 61 && weatherCode <= 67) ||
        (weatherCode >= 80 && weatherCode <= 82)) return 'rainy';

    // Snow (71, 73, 75, 77), Snow showers (85, 86)
    if ((weatherCode >= 71 && weatherCode <= 77) ||
        weatherCode === 85 || weatherCode === 86) return 'snow';

    // Thunderstorm (95, 96, 99)
    if (weatherCode >= 95 && weatherCode <= 99) return 'storm';

    return 'sunny';
};

function Details() {
    const { lat, lon } = useParams();
    const [searchParams] = useSearchParams();
    const cityName = searchParams.get('name') || 'Unknown Location';
    const timezone = searchParams.get('tz') || 'UTC';

    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [bgImage, setBgImage] = useState('sunny');

    useEffect(() => {
        // Check if favorite
        const favorites = JSON.parse(localStorage.getItem('weather_favorites') || '[]');
        const exists = favorites.some(f => f.lat === lat && f.lon === lon);
        setIsFavorite(exists);

        fetchWeather();
    }, [lat, lon]);

    const fetchWeather = async () => {
        try {
            const data = await getWeather(lat, lon, timezone);
            setWeather(data);
            // Set background based on weather code
            if (data?.current?.weather_code !== undefined) {
                setBgImage(getWeatherBackground(data.current.weather_code));
            }
        } catch (err) {
            setError('Failed to load weather data.');
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('weather_favorites') || '[]');
        let newFavorites;

        if (isFavorite) {
            newFavorites = favorites.filter(f => f.lat !== lat || f.lon !== lon);
        } else {
            newFavorites = [...favorites, { lat, lon, name: cityName, tz: timezone }];
        }

        localStorage.setItem('weather_favorites', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);
    };

    if (loading) return <div className="loader"></div>;
    if (error) return <div className="error">{error}</div>;
    if (!weather) return null;

    const current = weather.current;
    const hourly = weather.hourly;
    const daily = weather.daily;

    return (
        <div
            className="details-page"
            style={{
                backgroundImage: `url(/weather-app/weather-bg/${bgImage}.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                position: 'relative',
                minHeight: '100vh'
            }}
        >
            {/* Dark overlay for readability */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, padding: '2rem' }}>
                <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1>{cityName}</h1>
                    <button
                        className="btn"
                        onClick={toggleFavorite}
                        style={{ background: isFavorite ? '#d63031' : '#6c5ce7' }}
                    >
                        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                </div>

                {/* Current Weather */}
                <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(to right, #74b9ff, #0984e3)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        <div>
                            <h2>{current.temperature_2m}°C</h2>
                            <p>Feels like {current.apparent_temperature}°C</p>
                        </div>
                        <div>
                            <p>Wind: {current.wind_speed_10m} km/h</p>
                            <p>Humidity: {current.relative_humidity_2m}%</p>
                        </div>
                    </div>
                </div>

                {/* Hourly Forecast (Next 24 Hours) */}
                <h2>24-Hour Forecast</h2>
                <div className="hourly-scroll" style={{ display: 'flex', overflowX: 'auto', gap: '1rem', padding: '1rem 0', marginBottom: '2rem' }}>
                    {hourly.time.slice(0, 24).map((time, index) => (
                        <div key={time} className="weather-item" style={{ minWidth: '100px' }}>
                            <p>{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <h3>{hourly.temperature_2m[index]}°C</h3>
                            <p>{hourly.precipitation_probability[index]}% Rain</p>
                        </div>
                    ))}
                </div>

                {/* Daily Forecast (7 Days) */}
                <h2>7-Day Forecast</h2>
                <div className="weather-grid">
                    {daily.time.map((time, index) => (
                        <div key={time} className="card weather-item">
                            <p>{new Date(time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            <div style={{ margin: '0.5rem 0' }}>
                                <strong style={{ color: '#d63031' }}>H: {daily.temperature_2m_max[index]}°</strong>
                                {' '}
                                <strong style={{ color: '#0984e3' }}>L: {daily.temperature_2m_min[index]}°</strong>
                            </div>
                            <p>Rain: {daily.precipitation_sum[index]}mm</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Details;

