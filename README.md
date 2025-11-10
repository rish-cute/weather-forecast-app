# Weather Forecast App

A single-page weather forecast web app using OpenWeatherMap.  
Features: city search, geolocation, current weather, 5-day forecast, °C/°F toggle, recent searches, responsive UI, and friendly error handling.

---

## Features
- Retrieve weather data from OpenWeatherMap API (current + 5-day forecast).
- Search by city name or use browser geolocation for local weather.
- Display current conditions (temperature, humidity, wind, description, icon).
- Extended 5-day forecast with daily cards (midday values).
- Toggle units between Celsius and Fahrenheit.
- Recent searches saved in `localStorage`.
- Dynamic backgrounds for visual clarity.

---

## Files
- `index.html` — UI
- `script.js` — main logic & API calls
- `styles.css` — minimal styles
- `config.example.js` — copy to `config.js` and add your API key
- `.gitignore` — ignores `config.js` and node modules
- `assets/` — optional icons/backgrounds

---

## Setup & Run (quick)
1. Sign up at https://openweathermap.org/ → Get your API key.
2. Copy `config.example.js` → `config.js` and replace `YOUR_API_KEY_HERE` with your key.
3. Open `index.html` in your browser (double click or use VSCode Live Server).
4. Use the search box or click "Use my location".

---

## Notes on API key & security
- For a student/assignment project, using the API key on client-side is acceptable.
- For production, create a tiny backend (Express or serverless) and keep the key secret.

---

## Testing checklist
- Search "Mumbai" / "London" works.
- Geolocation returns local weather.
- 5-day forecast displays 5 cards.
- Unit toggle updates temperatures.
- Recent searches appear in dropdown.
- Friendly errors for misspelt city / denied location.

---

## Troubleshooting
- If `config.js` not found, browser console will show module load error. Make sure you created `config.js` from `config.example.js`.
- If API returns 401, API key is invalid — verify key on OpenWeatherMap.

---

**Note:** This project was built step-by-step using version control commits for each feature, design, and improvement.

You can view the complete source code and version history here:  
👉 [Weather Forecast App on GitHub](https://github.com/yourusername/weather-forecast-app)