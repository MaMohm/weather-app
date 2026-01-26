# 🌤️ Advanced Weather App

A premium, modern weather application offering real-time data, 3-card city dashboards, and dynamic visualization. Built with security and performance in mind, featuring a hardened Node.js backend and a polished React frontend.

![Weather App Dashboard](https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&q=80&w=1000)
*(Note: Replace with actual screenshot of your validated UI)*


# https://mamohm.github.io/weather-app/
## ✨ Key Features

### 🎨 **Premium UI/UX**
- **Dynamic Backgrounds:** The interface adapts to current weather conditions (e.g., Rain, Snow, Clear Sky) and time of day (Day/Night).
- **Glassmorphism Design:** Modern, sleek cards with frosted glass effects and smooth gradients.
- **3-Card Dashboard:** View multiple cities (e.g., London, Paris, NYC) simultaneously with equal-height cards.
- **Micro-Animations:** Interactive elements and smooth transitions for a polished feel.

### 🌐 **Smart Geolocation**
- **"Use My Location":** Privacy-first implementation. Only fetches location when explicitly requested by the user.
- **Live Search:** Instant city suggestions as you type, with support for thousands of global locations.

### 🛡️ **Enterprise-Grade Security**
- **No SQL Injection:** Totally immune to SQLi attacks as it uses no SQL database (Proxies to Open-Meteo API).
- **Rate Limiting:** Protects against DoS attacks (Limit: 300 requests/15min).
- **Helix/Security Headers:** Implements industry-standard security headers (HSTS, X-Frame-Options) via `helmet`.
- **Strict Validation:** Server-side validation of all inputs (`lat`, `lon`, `query`) to prevent malformed request attacks.
- **CORS Protection:** Restricted access to trusted domains only.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React.js (Vite)
- **Styling:** CSS Modules, Lucide React (Icons)
- **Routing:** React Router v6
- **State Management:** React Hooks

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js + TypeScript
- **Security:** Helmet, Express-Rate-Limit, CORS
- **API Integration:** Axios (Open-Meteo Proxy)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Backend Setup
The backend handles API proxying and security.

```bash
cd backend
npm install

# Build the TypeScript project
npm run build

# Start the server (Port 3000 by default)
npm start
```

### 2. Frontend Setup
The frontend is the visual interface.

```bash
cd frontend
npm install

# Start development server
npm run dev
```

The app will now be running at `http://localhost:5173`.

---

## 🔒 Security Highlights

This project was audited for common web vulnerabilities:

- **✅ SQL Injection:** **N/A** (No Database used).
- **✅ XSS (Cross-Site Scripting):** Protected via React's auto-escaping and safe coding practices.
- **✅ Sensitive Data:** No `.env` files or secrets are committed to the repository.
- **✅ Bruteforce/Spam:** Mitigated via IP-based Rate Limiting.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Developed with ❤️ by Marwan.*
