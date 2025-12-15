# Weather Dashboard

A responsive, accessible **Weather Dashboard** built with vanilla HTML, CSS, and JavaScript.  
It fetches real‑time weather data from the **OpenWeatherMap API**, shows the **current weather** and a **5‑day forecast**, lets you **search by city**, and saves your **preferences** (last city, units, favorites) in `localStorage`.

## Features

- **Current weather**
  - City & country
  - Temperature + “feels like”
  - Weather description & icon
  - Humidity and wind speed
- **5‑day forecast**
  - Daily min/max temperature
  - Condition icon & description
  - Humidity per day
- **City search**
  - Search any city (e.g. `London`, `Tokyo`, `Deoghar`)
  - Press Enter or click **Search**
- **User preferences (localStorage)**
  - Last searched city
  - Temperature unit (°C / °F)
  - Favorite cities list (click pill to load)
- **Geolocation (optional)**
  - On first load, tries to use your current location
  - If blocked, you can still search by city
- **UX & accessibility**
  - Fully responsive layout
  - Keyboard accessible buttons & inputs
  - `aria-live` status messages for loading/errors

## Project structure

```text
week5/
├─ index.html       # Main HTML page
├─ styles.css       # All styling (layout, colors, responsive)
├─ app.js           # Main JS: UI logic, API calls, localStorage
└─ README.md        # This file
```

## Getting started

### 1. Get an OpenWeatherMap API key

1. Go to the OpenWeatherMap website and create a free account.
2. Open the **API keys** section and copy your key.
3. New keys can take **10–20 minutes** to start working.

### 2. Configure the API key

Open `app.js` and set your key at the top:

```js
const OPEN_WEATHER_API_KEY = "YOUR_REAL_API_KEY_HERE"; // your OpenWeatherMap API key
const BASE_URL = "https://api.openweathermap.org/data/2.5";
```

Replace `"YOUR_REAL_API_KEY_HERE"` with the key from OpenWeatherMap (keep the quotes).

### 3. Run locally

1. Open the `week5` folder.
2. Double‑click `index.html` to open it in your browser.
3. Or, for a better dev experience, serve the folder with a simple static server (e.g. VS Code Live Server or `npx serve .`).

### 4. Use the app

1. Type a city name (e.g. **London**) and click **Search**.
2. Toggle °C / °F using the unit buttons.
3. Click **Favorite** in the current weather panel to save/remove the city.
4. Click any favorite pill to quickly load that city again.

If you see an error like **“Could not fetch weather data”**, verify:

- Your API key is correct in `app.js`.
- The key is active (try this URL in the browser, replacing `YOUR_KEY`):
  `https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY&units=metric`

### Learning Outcomes

1. Working with third-party APIs

2. Handling async JavaScript (fetch, promises)

3. Managing application state with LocalStorage

4. Deploying projects using Vercel

5. GitHub & Vercel CI/CD workflow

## Deployment 

1. The project is deployed using Vercel with GitHub integration.

2. Every push to the main branch automatically triggers a new deployment.

3. The application is hosted as a static site and served globally via Vercel CDN.
   
Once deployed, remember to keep your API key safe (for learning it’s fine, but for production you would normally use a backend proxy). 

### Live Demo

👉 Live Website: https://weather-dashboard-ofoze5lku-anshu-kumaris-projects-66275c81.vercel.app

👉 GitHub Repository: https://github.com/Anshu2530/Weather-Dashboard

### Author

Anshu Kumari
GitHub: https://github.com/Anshu2530

⭐ Support

If you like this project, please ⭐ the repository. It helps and motivates me to build more projects 😊
