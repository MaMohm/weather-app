import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getWeather } from '../services/api';

function Details() {
    const { lat, lon } = useParams();
    const [searchParams] = useSearchParams();
    const cityName = searchParams.get('name') || 'Unknown Location';
    const timezone = searchParams.get('tz') || 'UTC';

    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

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
        <div className="details-page">
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
    );
}

export default Details;
