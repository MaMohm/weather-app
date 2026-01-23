import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCity } from '../services/api';

function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
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
        navigate(`/details/${city.latitude}/${city.longitude}?name=${encodeURIComponent(city.name)}&tz=${city.timezone}`);
    };

    return (
        <div className="home-page">
            <section className="hero">
                <h1>Check the Weather</h1>
                <p>Search for any city in the world</p>

                <form onSubmit={handleSearch} className="input-group" style={{ maxWidth: '500px', margin: '2rem auto' }}>
                    <input
                        type="text"
                        placeholder="Enter city name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn">Search</button>
                </form>
            </section>

            {loading && <div className="loader"></div>}

            <div className="results-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
            }}>
                {results.map((city) => (
                    <div key={city.id} className="card" onClick={() => handleSelectCity(city)} style={{ cursor: 'pointer' }}>
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
