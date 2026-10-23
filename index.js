// Create the map inside #map centered on Khartoum as a default at zoom level 6 (bigger number means closer)
const map = L.map('map').setView([15.5007, 32.5599], 6);
const search = document.getElementById('search-form');
const locationInput = document.getElementById('locationInput');

const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');

// Show or hide the spinner
function showLoading(isLoading) {
    loading.hidden = !isLoading;
}

// Show a friendly error card
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
}

// Hide the error card
function clearError() {
    errorMessage.hidden = true;
}

// Add the map from OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Convert the place name into coordinates using Nominatim (OpenStreetMap)
async function getCoordinates(locationName) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('The location service is not responding. Please try again later.');
    }

    const results = await response.json();

    if (results.length === 0) {
        throw new Error('Could not find that place. Check the spelling and try again');
    }

    return {
        lat: Number(results[0].lat),
        lng: Number(results[0].lon),
        name: results[0].display_name
    };
}

// Get the current weather for the location by coordinates
async function getWeather(lat, lng) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${APIKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
        if(response.status === 404) {
            throw new Error(`No weather data was found for that location`);
        }
        if(response.status === 429) {
            throw new Error(`Too many requests. Please wait a minute and try again.`);
        }
        throw new Error(`Weather request failed (${response.status})`);
    }

    return await response.json();
}

// When the submit the form the page will be stopped from reloadling

async function searchPlace(locationName) {
    clearError();
    showLoading(true);

    try {
        const coord = await getCoordinates(locationName);
        const weather = await getWeather(coord.lat, coord.lng);
        showOnMap(coord, weather, locationName);
    } catch (error) {
        console.error(error);

        const message = error instanceof TypeError ?
        `Network problem! Check your internet connection and try again`:error.message;

        showError(message);
    } finally {
        showLoading(false);
    }
}
    search.addEventListener('submit', async (event) => {
    event.preventDefault();
    const locationName = locationInput.value.trim();

    if(!locationName) {
        showError(`Please enter a location name`);
        return;
    }
    searchPlace(locationName);
});


let currentMarker = null; 

// Fly the map to the location and put a marker there
function showOnMap(coord, weather, locationName) {
    map.flyTo([coord.lat, coord.lng], 10); // flyTo moves the map with a smooth zoom animation instead of jumping. Zoom 10 is about city level

    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    currentMarker = L.marker([coord.lat, coord.lng]).addTo(map);
    currentMarker.bindPopup(displayCard(weather, locationName));

    // Wait until the map stops moving, then open the popup
    map.once('moveend', () => currentMarker.openPopup());
}

function shareText(weather, cityName) {
    return `Weather in ${cityName}: ${Math.round(weather.main.temp)}°C, ${weather.weather[0].description}. Humidity ${weather.main.humidity}%, Wind ${weather.wind.speed} m/s.`;
}
// Build a card to show weather 
function displayCard(weather, locationName) {
    
    const cityName = weather.name || locationName;
    const card = document.createElement('div');
    card.className = 'weatherCard';
    card.innerHTML = `
        <h3> </h3>
        <img src="https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png" alt="${weather.weather[0].description}">
        <p class="temp">${Math.round(weather.main.temp)}°C</p>
        <p>${weather.weather[0].description}</p>
        <p>Clouds: ${weather.clouds.all}%</p>
        <p>Humidity: ${weather.main.humidity}%</p>
        <p>Wind: ${weather.wind.speed} m/s</p>
        <div class="cardAction">
            <button type="button" class="shareBtn">Share</button>
            <button type="button" class="favoriteBtn">Save</button>
        </div>`;
        
    card.querySelector('h3').textContent = cityName; // Title

    // Share button
    card.querySelector('.shareBtn').addEventListener('click', async (event) => {
        const button = event.currentTarget;
        const text = shareText(weather, cityName);

        try {
            if (navigator.share) {
                await navigator.share({title: 'Weather Map', text: text});
            }else {
                await navigator.clipboard.writeText(text);
                button.textContent = 'Copied';
                setTimeout(() => {button.textContent = 'Share';}, 2000);
            }
        
        } catch (error) {
            console.error(error);
        }
    });

    // Save button
    card.querySelector('.favoriteBtn').addEventListener('click', (event) => {
        addFavorite(cityName);
        event.currentTarget.textContent = 'Saved';
    });

    return card;
}

// favorite button (save)
const favoriteplaces = document.getElementById('favorites');

function getFavorite() {
    try{
        return JSON.parse(localStorage.getItem('favorites')) || [];
    } catch (error) {
        return [];
    }
}

// Write the list to the browser
function saveFavorite(list) {
    localStorage.setItem('favorites', JSON.stringify(list));
}

// Add a place and refresh the buttons
function addFavorite(name) {
    const favorite = getFavorite();

    if (!favorite.includes(name)) {
        favorite.push(name);
        saveFavorite(favorite);
        renderFavorites();
    }
}

function removeFavorite(name) {
    saveFavorite(getFavorite().filter((item) => item !== name));
    renderFavorites();
}

function renderFavorites() {
    favoriteplaces.innerHTML = '';

    getFavorite().forEach((name) => {
        const chip = document.createElement('span');
        chip.className = 'favorite';

        const goButton = document.createElement('button');
        goButton.type = 'button';
        goButton.textContent = name; // textContent keeps typed text safe
        goButton.addEventListener('click', () => {
            locationInput.value = name;
            searchPlace(name);
        });

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'favorite-remove';
        removeButton.textContent = '×';
        removeButton.setAttribute('aria-label', `Remove ${name}`);
        removeButton.addEventListener('click', () => removeFavorite(name));

        chip.append(goButton, removeButton);
        favoriteplaces.appendChild(chip);
    });
}

// Show saved places when the page opens
renderFavorites();