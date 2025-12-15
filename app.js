const OPEN_WEATHER_API_KEY = "";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

const selectors = {
  searchForm: document.getElementById("search-form"),
  cityInput: document.getElementById("city-input"),
  currentWeather: document.getElementById("current-weather"),
  forecast: document.getElementById("forecast"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  favoritesList: document.getElementById("favorites-list"),
  unitButtons: document.querySelectorAll(".toggle-button"),
};

const storageKeys = {
  lastCity: "weather:lastCity",
  favorites: "weather:favorites",
  unit: "weather:unit",
};

function getStoredJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    
  }
}

function setStatus({ loading = false, error = "" } = {}) {
  selectors.loading.hidden = !loading;
  selectors.error.hidden = !error;
  selectors.error.textContent = error;
}

async function fetchJSON(url, params = {}) {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const response = await fetch(urlObj.toString());
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

async function fetchWeatherByCity(city, unit) {
  const commonParams = {
    q: city,
    appid: OPEN_WEATHER_API_KEY,
    units: unit,
  };

  const [current, forecast] = await Promise.all([
    fetchJSON(`${BASE_URL}/weather`, commonParams),
    fetchJSON(`${BASE_URL}/forecast`, commonParams),
  ]);

  return { current, forecast };
}

function formatTemp(value, unit) {
  const rounded = Math.round(value);
  return `${rounded}°${unit === "metric" ? "C" : "F"}`;
}

function renderCurrentWeather(data, unit) {
  if (!data) {
    selectors.currentWeather.innerHTML = "";
    return;
  }

  const {
    name,
    sys: { country },
    main: { temp, feels_like, humidity },
    weather,
    wind: { speed },
  } = data;

  const description = weather?.[0]?.description ?? "";
  const icon = weather?.[0]?.icon ?? "01d";
  const windSpeed = unit === "metric" ? `${speed} m/s` : `${speed} mph`;

  selectors.currentWeather.innerHTML = `
    <div class="panel-header">
      <div>
        <div class="city-name">${name}, ${country}</div>
        <div class="current-description">${description}</div>
      </div>
      <button type="button" id="favorite-toggle" class="favorite-pill" aria-label="Toggle favorite city">
        <span>★</span>
        <span>Favorite</span>
      </button>
    </div>
    <div class="current-main">
      <div>
        <div class="current-temp">
          ${formatTemp(temp, unit)} <span>feels like ${formatTemp(
    feels_like,
    unit
  )}</span>
        </div>
        <div class="current-meta">
          <span><strong>Humidity:</strong> ${humidity}%</span>
          <span><strong>Wind:</strong> ${windSpeed}</span>
        </div>
      </div>
      <img
        class="current-icon"
        src="https://openweathermap.org/img/wn/${icon}@2x.png"
        alt="${description}"
      />
    </div>
  `;

  wireFavoriteToggle(name);
}

function groupForecastByDay(list) {
  const byDay = {};
  list.forEach((entry) => {
    const date = new Date(entry.dt * 1000);
    const key = date.toISOString().slice(0, 10);
    if (!byDay[key]) {
      byDay[key] = [];
    }
    byDay[key].push(entry);
  });
  return byDay;
}

function renderForecast(data, unit) {
  if (!data || !Array.isArray(data.list)) {
    selectors.forecast.innerHTML = "";
    return;
  }

  const byDay = groupForecastByDay(data.list);
  const days = Object.entries(byDay)
    .slice(0, 5)
    .map(([dateStr, entries]) => {
      let target =
        entries.find((e) => e.dt_txt.includes("12:00:00")) ?? entries[0];
      const temps = entries.map((e) => e.main.temp);
      const min = Math.min(...temps);
      const max = Math.max(...temps);

      return { dateStr, entry: target, min, max };
    });

  const cards = days
    .map(({ dateStr, entry, min, max }) => {
      const date = new Date(dateStr);
      const weekday = date.toLocaleDateString(undefined, {
        weekday: "short",
      });
      const dayMonth = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const description = entry.weather?.[0]?.description ?? "";
      const icon = entry.weather?.[0]?.icon ?? "01d";
      const humidity = entry.main.humidity;

      return `
        <article class="forecast-card">
          <div class="day">${weekday}</div>
          <div class="date">${dayMonth}</div>
          <div class="temps">
            <span class="temp-max">${formatTemp(max, unit)}</span>
            <span class="temp-min">${formatTemp(min, unit)}</span>
            <img
              src="https://openweathermap.org/img/wn/${icon}.png"
              alt="${description}"
            />
          </div>
          <div class="meta">
            <span>${description}</span>
            <span>${humidity}%</span>
          </div>
        </article>
      `;
    })
    .join("");

  selectors.forecast.innerHTML = `
    <div class="panel-header">
      <h2>5-Day Forecast</h2>
    </div>
    <div class="forecast-grid">
      ${cards}
    </div>
  `;
}

function loadPreferences() {
  const unit = localStorage.getItem(storageKeys.unit) || "metric";
  const favorites = getStoredJSON(storageKeys.favorites, []);
  const lastCity = localStorage.getItem(storageKeys.lastCity) || "";
  return { unit, favorites, lastCity };
}

function savePreferences({ unit, favorites, lastCity }) {
  if (unit) {
    localStorage.setItem(storageKeys.unit, unit);
  }
  if (favorites) {
    setStoredJSON(storageKeys.favorites, favorites);
  }
  if (lastCity) {
    localStorage.setItem(storageKeys.lastCity, lastCity);
  }
}

function renderFavorites(favorites) {
  selectors.favoritesList.innerHTML = "";
  if (!favorites || favorites.length === 0) return;

  favorites.forEach((city) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = city;
    button.className = "favorite-pill";
    button.setAttribute("data-city", city);
    li.appendChild(button);
    selectors.favoritesList.appendChild(li);
  });
}

function wireFavoriteToggle(city) {
  const { favorites } = loadPreferences();
  const isFavorite = favorites.includes(city);
  const toggle = document.getElementById("favorite-toggle");
  if (!toggle) return;

  if (isFavorite) {
    toggle.classList.add("active");
    toggle.setAttribute("aria-pressed", "true");
  } else {
    toggle.classList.remove("active");
    toggle.setAttribute("aria-pressed", "false");
  }

  toggle.addEventListener("click", () => {
    const currentPrefs = loadPreferences();
    const list = new Set(currentPrefs.favorites);
    if (list.has(city)) {
      list.delete(city);
    } else {
      list.add(city);
    }
    const updated = Array.from(list);
    savePreferences({ favorites: updated });
    renderFavorites(updated);
    wireFavoriteToggle(city);
  });
}

async function loadAndRender(city, unit) {
  if (!city || !OPEN_WEATHER_API_KEY || OPEN_WEATHER_API_KEY === "YOUR_API_KEY_HERE") {
    setStatus({
      loading: false,
      error:
        "Please set your OpenWeatherMap API key in app.js before using the dashboard.",
    });
    return;
  }

  setStatus({ loading: true, error: "" });
  try {
    const { current, forecast } = await fetchWeatherByCity(city, unit);
    renderCurrentWeather(current, unit);
    renderForecast(forecast, unit);
    savePreferences({ lastCity: city });
  } catch (err) {
    console.error(err);
    renderCurrentWeather(null, unit);
    renderForecast(null, unit);
    setStatus({
      loading: false,
      error:
        "Could not fetch weather data. Check the city name or try again later.",
    });
    return;
  }
  setStatus({ loading: false, error: "" });
}

function setupUnitToggle(initialUnit) {
  selectors.unitButtons.forEach((btn) => {
    const unit = btn.dataset.unit;
    if (unit === initialUnit) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    }

    btn.addEventListener("click", async () => {
      const selectedUnit = btn.dataset.unit;
      if (!selectedUnit) return;
      selectors.unitButtons.forEach((other) => {
        other.classList.toggle("active", other === btn);
        other.setAttribute(
          "aria-pressed",
          other === btn ? "true" : "false"
        );
      });
      savePreferences({ unit: selectedUnit });
      const { lastCity } = loadPreferences();
      if (lastCity) {
        loadAndRender(lastCity, selectedUnit);
      }
    });
  });
}

function setupSearch(initialUnit) {
  selectors.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = selectors.cityInput.value.trim();
    if (!city) return;
    loadAndRender(city, initialUnit);
  });
}

function setupFavoritesClick(unit) {
  selectors.favoritesList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const city = target.getAttribute("data-city");
    if (city) {
      selectors.cityInput.value = city;
      loadAndRender(city, unit);
    }
  });
}

async function init() {
  const { unit, favorites, lastCity } = loadPreferences();
  setupUnitToggle(unit);
  renderFavorites(favorites);
  setupSearch(unit);
  setupFavoritesClick(unit);

  if (lastCity) {
    selectors.cityInput.value = lastCity;
    loadAndRender(lastCity, unit);
  } else if ("geolocation" in navigator) {
    try {
      setStatus({ loading: true, error: "" });
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const commonParams = {
              lat: latitude,
              lon: longitude,
              appid: OPEN_WEATHER_API_KEY,
              units: unit,
            };
            const [current, forecast] = await Promise.all([
              fetchJSON(`${BASE_URL}/weather`, commonParams),
              fetchJSON(`${BASE_URL}/forecast`, commonParams),
            ]);
            renderCurrentWeather(current, unit);
            renderForecast(forecast, unit);
            savePreferences({ lastCity: current.name });
            selectors.cityInput.value = current.name;
            setStatus({ loading: false, error: "" });
          } catch (err) {
            console.error(err);
            setStatus({
              loading: false,
              error:
                "Unable to fetch weather for your location. Try searching by city.",
            });
          }
        },
        () => {
          setStatus({
            loading: false,
            error: "Location access denied. Please search by city.",
          });
        }
      );
    } catch {
      setStatus({
        loading: false,
        error: "Geolocation is not available. Please search by city.",
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", init);


