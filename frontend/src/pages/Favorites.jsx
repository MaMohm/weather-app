import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Favorites() {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('weather_favorites') || '[]');
        setFavorites(stored);
    }, []);

    const removeFavorite = (e, lat, lon) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();
        const newFavorites = favorites.filter(f => f.lat !== lat || f.lon !== lon);
        setFavorites(newFavorites);
        localStorage.setItem('weather_favorites', JSON.stringify(newFavorites));
    };

    return (
        <div className="favorites-page">
            <h1>My Favorite Locations</h1>

            {favorites.length === 0 ? (
                <p style={{ textAlign: 'center', marginTop: '2rem', color: '#636e72' }}>You haven't added any favorites yet.</p>
            ) : (
                <div className="weather-grid">
                    {favorites.map((city, index) => (
                        <Link
                            key={index}
                            to={`/details/${city.lat}/${city.lon}?name=${encodeURIComponent(city.name)}&tz=${city.tz}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="card">
                                <h3>{city.name}</h3>
                                <small>Lat: {city.lat}, Lon: {city.lon}</small>
                                <div style={{ marginTop: '1rem' }}>
                                    <button
                                        className="btn"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#e17055' }}
                                        onClick={(e) => removeFavorite(e, city.lat, city.lon)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Favorites;
