import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCity, getWeather } from '../services/api'; // Added getWeather
import { MapPin, Navigation, Cloud } from 'lucide-react';
import { getWeatherConfig, getWeatherImage } from '../utils/weatherUtils';

// Popular cities for quick suggestions
const POPULAR_CITIES = [
    { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
    { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
    { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
    { name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
    { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
];

function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [localWeather, setLocalWeather] = useState(null); // New State
    const [locationError, setLocationError] = useState(null); // New State
    const [showDropdown, setShowDropdown] = useState(false);

    const navigate = useNavigate();
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const [extraCities, setExtraCities] = useState([]); // For Left/Right cards

    // Load Default City and Extra Cities on Mount
    useEffect(() => {
        const loadDefaults = async () => {
            try {
                // 1. Center: London
                const london = getWeather(51.5074, -0.1278, 'Europe/London');
                // 2. Left: Paris
                const paris = getWeather(48.8566, 2.3522, 'Europe/Paris');
                // 3. Right: New York
                const ny = getWeather(40.7128, -74.006, 'America/New_York');

                const [londonData, parisData, nyData] = await Promise.all([london, paris, ny]);

                setLocalWeather({ ...londonData, latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', name: 'London' });
                setExtraCities([
                    { ...parisData, name: 'Paris', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
                    { ...nyData, name: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' }
                ]);

            } catch (e) { console.error("Default load failed"); }
        };
        loadDefaults();
    }, []);

    const handleLocationClick = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const data = await getWeather(latitude, longitude, timezone);
                    // Reverse geocode name if possible, or just say "Your Location"
                    setLocalWeather({ ...data, latitude, longitude, timezone, name: 'Your Location' });
                } catch (err) {
                    setLocationError("Failed to fetch weather data");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                setLoading(false);
                setLocationError("Location permission denied or unavailable");
            }
        );
    };

    // Debounced live search
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const data = await searchCity(query);
                setSuggestions(data.slice(0, 5)); // Limit to 5 suggestions
            } catch (error) {
                console.error('Autocomplete failed:', error);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setShowDropdown(false);
        try {
            const data = await searchCity(query);
            setResults(data);
        } catch (error) {
            console.error('Search failed:', error);
            alert('Failed to fetch cities. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCity = (city) => {
        setShowDropdown(false);
        navigate(`/details/${city.latitude}/${city.longitude}?name=${encodeURIComponent(city.name)}&tz=${city.timezone}`);
    };

    const handleInputFocus = () => {
        setShowDropdown(true);
    };

    // ... (in render)

    const renderMiniCard = (cityData) => {
        if (!cityData) return null;
        const Config = getWeatherConfig(cityData.current?.weather_code, cityData.current?.is_day);
        const Icon = Config.icon;
        const bgImage = getWeatherImage(cityData.current?.weather_code, cityData.current?.is_day);

        return (
            <div
                onClick={() => handleSelectCity(cityData)}
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '1.5rem',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '280px',
                    textAlign: 'center',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    flex: 1,
                    margin: 0,
                    color: 'white', // White text for visibility
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{cityData.name}</div>
                <div style={{ margin: '1rem 0' }}>
                    <Icon size={50} color="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {Math.round(cityData.current?.temperature_2m)}°
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {Config.label}
                </div>
            </div>
        );
    };

    return (
        <div className="home-page">
            <section className="hero" style={{ padding: '2rem 1rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Check the Weather</h1>
                <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Search for any city in the world</p>

                <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '500px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    {/* ... Search Form kept same ... */}
                    <form onSubmit={handleSearch} className="input-group" style={{ flex: 1, display: 'flex', background: 'white', borderRadius: '30px', padding: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Enter city name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={handleInputFocus}
                            autoComplete="off"
                            style={{ flex: 1, border: 'none', padding: '12px 20px', borderRadius: '30px', outline: 'none', fontSize: '1rem' }}
                        />
                        <button type="button" onClick={handleLocationClick} title="Use My Location" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', color: '#3b82f6' }}>
                            <Navigation size={20} />
                        </button>
                        <button type="submit" className="btn" style={{ borderRadius: '25px', padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Search</button>
                    </form>
                    {/* ... Dropdown ... */}
                    {showDropdown && (
                        <div className="suggestions-dropdown" ref={dropdownRef} style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'white', borderRadius: '12px', padding: '8px', zIndex: 50, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                            {suggestions.length > 0 ? (
                                <>
                                    <div className="dropdown-header">Search Results</div>
                                    {suggestions.map((city, index) => (
                                        <div key={`search-${index}`} className="suggestion-item" onClick={() => handleSelectCity(city)}>
                                            <span className="city-name">{city.name}</span>
                                            <span className="city-detail">{city.admin1 || ''}, {city.country}</span>
                                        </div>
                                    ))}
                                </>
                            ) : query.length < 2 ? (
                                <>
                                    <div className="dropdown-header">🔥 Popular Cities</div>
                                    {POPULAR_CITIES.map((city, index) => (
                                        <div key={`popular-${index}`} className="suggestion-item" onClick={() => handleSelectCity(city)}>
                                            <span className="city-name">{city.name}</span>
                                            <span className="city-detail">{city.country}</span>
                                        </div>
                                    ))}
                                </>
                            ) : (<div className="dropdown-empty">No results found</div>)}
                        </div>
                    )}
                </div>

                {locationError && <div style={{ color: '#ef4444', marginTop: '1rem' }}>{locationError}</div>}

                {/* 3-Card Layout */}
                <div style={{
                    marginTop: '3rem',
                    display: 'flex',
                    alignItems: 'stretch', // Equal Height
                    justifyContent: 'center',
                    gap: '1.5rem',
                    width: '100%',
                    maxWidth: '1200px',
                    padding: '0 1rem'
                }}>

                    {/* Left Card (Paris) */}
                    {extraCities[0] && renderMiniCard(extraCities[0])}

                    {/* Center Card (London/Main) */}
                    {localWeather && (
                        <div className="local-weather-card" style={{
                            padding: '2rem',
                            borderRadius: '30px',
                            flex: 1.2,
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${getWeatherImage(localWeather.current?.weather_code, localWeather.current?.is_day)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            {/* ... Main Card Content ... */}
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', opacity: 0.15 }}>
                                <Cloud size={180} fill="white" stroke="none" />
                            </div>

                            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{localWeather.name}</div>
                                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '1rem 0' }}>
                                    {(() => {
                                        const Config = getWeatherConfig(localWeather.current?.weather_code, localWeather.current?.is_day);
                                        const Icon = Config.icon;
                                        return <Icon size={100} color="white" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />;
                                    })()}
                                    <div style={{ fontSize: '6rem', fontWeight: 'bold', lineHeight: 1, marginTop: '1rem', textShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                        {Math.round(localWeather.current?.temperature_2m)}°
                                    </div>
                                    <div style={{ fontSize: '1.5rem', marginTop: '0.5rem', fontWeight: '500' }}>
                                        {getWeatherConfig(localWeather.current?.weather_code).label}
                                    </div>
                                </div>

                                {localWeather.daily && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                                        {[1, 2, 3].map((off, i) => {
                                            const date = new Date(localWeather.daily.time[off]);
                                            const code = localWeather.daily.weather_code[off];
                                            const min = Math.round(localWeather.daily.temperature_2m_min[off]);
                                            const max = Math.round(localWeather.daily.temperature_2m_max[off]);
                                            const DIcon = getWeatherConfig(code).icon;
                                            return (
                                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                                                    <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                    <DIcon size={28} />
                                                    <span style={{ fontSize: '1rem', fontWeight: '600' }}>{max}° <span style={{ opacity: 0.7, fontWeight: 'normal', fontSize: '0.9rem' }}>{min}°</span></span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Right Card (New York) */}
                    {extraCities[1] && renderMiniCard(extraCities[1])}
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem',
                borderTop: '1px solid #f3f4f6', marginTop: 'auto', background: 'white'
            }}>
                <p>&copy; {new Date().getFullYear()} Weather App. Developed by <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>Marwan.M</span></p>
            </footer>

            {loading && <div className="loader"></div>}

            <div className="results-grid">
                {results.map((city) => (
                    <div key={city.id} className="card" onClick={() => handleSelectCity(city)}>
                        <h3>{city.name}</h3>
                        <p>{city.admin1}, {city.country}</p>
                        <small>Lat: {city.latitude}, Lon: {city.longitude}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
