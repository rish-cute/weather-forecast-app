// script.js
// This file contains all the main logic for the Weather Forecast app.
// It fetches weather data from OpenWeatherMap API, updates the UI dynamically,
// and stores recent searches in localStorage.

// Import API key from config.js (your private key)
import { API_KEY } from './config.js';

// ========== DOM ELEMENTS ==========
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const msgEl = document.getElementById('msg');

const currentCard = document.getElementById('currentCard');
const cityNameEl = document.getElementById('cityName');
const tempTodayEl = document.getElementById('tempToday');
const descEl = document.getElementById('desc');
const extraEl = document.getElementById('extra');
const iconToday = document.getElementById('iconToday');

const forecastSection = document.getElementById('forecast');
const forecastCards = document.getElementById('forecastCards');

const locBtn = document.getElementById('locBtn');
const toggleUnitBtn = document.getElementById('toggleUnit');
const recentDropdown = document.getElementById('recentDropdown');

let unit = 'metric'; //  Default unit → Celsius
let lastSearchedCity = null;

// ========== HELPER FUNCTIONS ==========

// Function to show success/error messages on screen
function showMessage(text, type='error') {
  msgEl.textContent = text;
  msgEl.className = type === 'error' ? 'text-sm text-red-600' : 'text-sm text-green-600';
  if (text) setTimeout(()=> { msgEl.textContent = '' }, 6000);
}

// Function to build full URL for OpenWeatherMap icons
function iconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Save searched city to localStorage (avoid duplicates, keep last 6)
function saveRecent(city) {
  try {
    let arr = JSON.parse(localStorage.getItem('recentCities') || '[]');
    arr = arr.filter(c => c.toLowerCase() !== city.toLowerCase());
    arr.unshift(city);
    arr = arr.slice(0, 6);
    localStorage.setItem('recentCities', JSON.stringify(arr));
    populateRecentDropdown();
  } catch (e) { /* ignore storage errors */ }
}

// Populate dropdown with recent searches
function populateRecentDropdown() {
  const arr = JSON.parse(localStorage.getItem('recentCities') || '[]');
  recentDropdown.innerHTML = `<option value="">Recent searches</option>`;
  arr.forEach(city => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    recentDropdown.appendChild(opt);
  });
}

// ========== API FETCH FUNCTIONS ==========

// Fetch current weather by city name
async function fetchCurrentByCity(city) {
  const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`);
  if (!resp.ok) throw resp; // throws if API returns error
  return resp.json();
}

// Fetch current weather by GPS coordinates
async function fetchCurrentByCoords(lat, lon) {
  const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`);
  if (!resp.ok) throw resp;
  return resp.json();
}

// Fetch 5-day (3-hour interval) forecast by coordinates
async function fetch5DayForecastByCoords(lat, lon) {
  const resp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`);
  if (!resp.ok) throw resp;
  return resp.json();
}

// ========== UI RENDERING FUNCTIONS ==========

// Display current weather details on the page
function renderCurrent(data) {
  currentCard.classList.remove('hidden');

  // Format & show temperature, city, description
  const temp = Math.round(data.main.temp);
  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  tempTodayEl.textContent = `${temp}°${unit === 'metric' ? 'C' : 'F'}`;
  descEl.textContent = `${data.weather[0].description}`;
  extraEl.textContent = `Humidity: ${data.main.humidity}% · Wind: ${data.wind.speed} ${ unit==='metric' ? 'm/s' : 'mph' }`;
  iconToday.src = iconUrl(data.weather[0].icon);
  iconToday.alt = data.weather[0].description;

  // Change background color depending on weather type
  const main = data.weather[0].main.toLowerCase();
  if (main.includes('rain')) {
    document.body.style.background = 'linear-gradient(to right, #64748b, #0f172a)';
  } else if (main.includes('cloud')) {
    document.body.style.background = 'linear-gradient(to right, #cbd5e1, #94a3b8)';
  } else if (main.includes('clear')) {
    document.body.style.background = 'linear-gradient(to right, #bae6fd, #e0f2fe)';
  } else {
    document.body.style.background = '';
  }
}

// Display 5-day forecast cards
function renderForecast(forecastData) {
  // Group entries by date
  const mapByDate = {};
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().slice(0,10);
    if (!mapByDate[day]) mapByDate[day] = [];
    mapByDate[day].push(item);
  });

  // Get first 5 days (today + next 4)
  const days = Object.keys(mapByDate).slice(0, 6);
  forecastCards.innerHTML = '';

  // Loop through each day to create a card
  days.forEach(day => {
    const list = mapByDate[day];
    // Choose reading closest to 12:00 (midday)
    let chosen = list.reduce((best, cur) => {
      const target = 12;
      const curHour = new Date(cur.dt * 1000).getUTCHours();
      const bestHour = new Date(best.dt * 1000).getUTCHours();
      return Math.abs(curHour - target) < Math.abs(bestHour - target) ? cur : best;
    }, list[0]);

    // Format data for card
    const dateStr = new Date(chosen.dt * 1000).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
    const temp = Math.round(chosen.main.temp);
    const humidity = chosen.main.humidity;
    const wind = chosen.wind.speed;
    const icon = chosen.weather[0].icon;
    const desc = chosen.weather[0].main;

    // Create HTML card
    const card = document.createElement('div');
    card.className = 'p-3 rounded-lg bg-white/80 shadow';
    card.innerHTML = `
      <div class="text-sm">${dateStr}</div>
      <div class="flex items-center gap-3 mt-2">
        <img src="${iconUrl(icon)}" class="w-12 h-12" />
        <div>
          <div class="font-semibold">${temp}°${unit==='metric'?'C':'F'}</div>
          <div class="text-xs">${desc}</div>
          <div class="text-xs">Wind: ${wind} ${unit==='metric'?'m/s':'mph'} · Hum: ${humidity}%</div>
        </div>
      </div>
    `;
    forecastCards.appendChild(card);
  });

  forecastSection.classList.remove('hidden');
}

// ========== MAIN SEARCH HANDLER ==========
async function handleSearch(city) {
  if (!city) { showMessage('Please enter a city name.'); return; }
  try {
    msgEl.textContent = 'Loading...';

    // Fetch current + forecast data
    const cur = await fetchCurrentByCity(city);
    renderCurrent(cur);
    const fc = await fetch5DayForecastByCoords(cur.coord.lat, cur.coord.lon);
    renderForecast(fc);

    // Save to localStorage
    saveRecent(cur.name);
    lastSearchedCity = cur.name;
    msgEl.textContent = '';
  } catch (err) {
    if (err.status === 404) showMessage('City not found. Check spelling.');
    else { showMessage('Error fetching weather. See console.'); console.error(err); }
  }
}

// ========== EVENT LISTENERS ==========

//  Get weather for current location using geolocation API
locBtn.addEventListener('click', () => {
  if (!navigator.geolocation) { showMessage('Geolocation not supported.'); return; }
  msgEl.textContent = 'Getting location...';
  navigator.geolocation.getCurrentPosition(async pos => {
    try {
      msgEl.textContent = 'Loading weather...';
      const cur = await fetchCurrentByCoords(pos.coords.latitude, pos.coords.longitude);
      renderCurrent(cur);
      const fc = await fetch5DayForecastByCoords(pos.coords.latitude, pos.coords.longitude);
      renderForecast(fc);
      saveRecent(cur.name);
      lastSearchedCity = cur.name;
      msgEl.textContent = '';
    } catch (err) {
      showMessage('Error fetching weather for current location.');
      console.error(err);
    }
  }, () => {
    showMessage('Location permission denied or unavailable.');
  });
});

//  Handle city search button
searchBtn.addEventListener('click', () => handleSearch(cityInput.value.trim()));

//  Load from recent dropdown
recentDropdown.addEventListener('change', () => {
  const c = recentDropdown.value;
  if (c) handleSearch(c);
});

//  Handle Enter key press inside input
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch(cityInput.value.trim());
});

//  Toggle unit between Celsius/Fahrenheit
toggleUnitBtn.addEventListener('click', () => {
  unit = unit === 'metric' ? 'imperial' : 'metric';
  toggleUnitBtn.textContent = unit === 'metric' ? '°C' : '°F';
  if (lastSearchedCity) handleSearch(lastSearchedCity);
  else showMessage('Toggle unit: search a city to update units.');
});

// Load recent searches when app starts
populateRecentDropdown();
