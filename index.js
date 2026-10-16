// Create the map inside #map centered on Khartoum at zoom level 6 (bigger number means closer)
const map = L.map('map').setView([15.5007, 32.5599], 6);
const search = document.getElementById('search-form');
const locationInput = document.getElementById('locationInput');

// Add the map from OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Convert the place name into coordinates using Nominatim (OpenStreetMap)
async function getCoordinates(placeName) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Geocoding request failed');
    }

    const results = await response.json();

    if (results.length === 0) {
        throw new Error('Place not found');
    }

    return {
        lat: Number(results[0].lat),
        lng: Number(results[0].lon),
        name: results[0].display_name
    };
}

// When the submit the form the page will be stopped from reloadling
search.addEventListener('submit', async (event) => {
    event.preventDefault();
    const placeName = locationInput.value.trim();

    try {
        const coord = await getCoordinates(placeName);
        console.log(coord);
    } catch (error) {
        console.error(error.message);
    }
});
