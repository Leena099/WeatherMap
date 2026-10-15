// Create the map inside #map centered on Khartoum at zoom level 6 (bigger number means closer)
const map = L.map('map').setView([15.5007, 32.5599], 6);

// Add the map from OpenStreetMap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


