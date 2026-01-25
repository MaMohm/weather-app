import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://weather-api.marwandev.com';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const searchCity = async (query) => {
    const response = await api.get(`/api/geocode?q=${query}`);
    return response.data;
};

export const getWeather = async (lat, lon, tz) => {
    const response = await api.get('/api/weather', {
        params: { lat, lon, tz }
    });
    return response.data;
};

export default api;
