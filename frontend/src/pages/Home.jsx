import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCity } from '../services/api';

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
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

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

    return (
        <div className="home-page">
            <section className="hero">
                <h1>Check the Weather</h1>
                <p>Search for any city in the world</p>

                <div className="search-container">
                    <form onSubmit={handleSearch} className="input-group">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Enter city name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={handleInputFocus}
                            autoComplete="off"
                        />
                        <button type="submit" className="btn">Search</button>
                    </form>

                    {showDropdown && (
                        <div className="suggestions-dropdown" ref={dropdownRef}>
                            {suggestions.length > 0 ? (
                                <>
                                    <div className="dropdown-header">Search Results</div>
                                    {suggestions.map((city, index) => (
                                        <div
                                            key={`search-${index}`}
                                            className="suggestion-item"
                                            onClick={() => handleSelectCity(city)}
                                        >
                                            <span className="city-name">{city.name}</span>
                                            <span className="city-detail">{city.admin1 || ''}, {city.country}</span>
                                        </div>
                                    ))}
                                </>
                            ) : query.length < 2 ? (
                                <>
                                    <div className="dropdown-header">🔥 Popular Cities</div>
                                    {POPULAR_CITIES.map((city, index) => (
                                        <div
                                            key={`popular-${index}`}
                                            className="suggestion-item"
                                            onClick={() => handleSelectCity(city)}
                                        >
                                            <span className="city-name">{city.name}</span>
                                            <span className="city-detail">{city.country}</span>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="dropdown-empty">No results found</div>
                            )}
                        </div>
                    )}
                </div>
            </section>

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
