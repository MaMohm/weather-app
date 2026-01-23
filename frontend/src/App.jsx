import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Details from './pages/Details';
import Favorites from './pages/Favorites';

function App() {
    return (
        <BrowserRouter basename="/weather-app">
            <div className="app-container">
                <nav className="navbar">
                    <div className="nav-brand">☁️ Weather App</div>
                    <div className="nav-links">
                        <Link to="/">Home</Link>
                        <Link to="/favorites">Favorites</Link>
                    </div>
                </nav>
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/details/:lat/:lon" element={<Details />} />
                        <Route path="/favorites" element={<Favorites />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
