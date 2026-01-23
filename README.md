# Weather App

A modern, responsive weather application built with a React frontend and an Express/Node.js backend. The app provides real-time weather data, forecasts, and geolocation services using the Open-Meteo API.

## 🚀 Live Demo

- **Frontend (GitHub Pages):** [https://mamohm.github.io/weather-app/](https://mamohm.github.io/weather-app/)
- **Backend API:** [https://api.marwandev.com/api/health](https://api.marwandev.com/api/health)

## 🛠 Tech Stack

### Frontend
- **React.js**: UI Library
- **Vite**: Build Tool
- **Tailwind CSS**: Styling
- **Axios**: API Requests

### Backend
- **Node.js & Express**: Server API
- **TypeScript**: Type Safety
- **Nginx**: Reverse Proxy & SSL
- **Oracle Cloud**: Hosting Infrastructure

## 📦 Features

- **Real-time Weather**: Current temperature, humidity, wind speed, and more.
- **Geolocation Support**: Automatically detects user location or searches by city name.
- **Hourly & Daily Forecasts**: Detailed predictions for upcoming weather.
- **Responsive Design**: optimized for mobile and desktop.
- **Secure Backend**: SSL-encrypted API with rate limiting and CORS protection.

## 🔧 Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/MaMohm/weather-app.git
    cd weather-app
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create .env file with PORT=3002
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
