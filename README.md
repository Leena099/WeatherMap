# WeatherMap

## Description
WeatherMap is a single-page web application that shows the current weather for any place. The user types a city, address, or point of interest, the app finds its coordinates, moves the map there, and shows the weather in a popup card with the temperature, clouds, humidity, wind speed, and an icon. Users can also share the weather message and save favorite places. 

Live demo: https://leena099.github.io/WeatherMap/

## Technologies
- HTML5, CSS3
- Vanilla JavaScript (ES6+, fetch, async/await)
- Leaflet 1.9.4 with OpenStreetMap tiles (map)
- Nominatim API (place name to coordinates)
- OpenWeather Current Weather API (weather data)
- localStorage (favorite places)

## How to Run
- Clone or download this repository.
- Create a free account at https://home.openweathermap.org/ and copy your API key from the "API keys" page.
- Open `APIKey.js` and put your key in: `const APIKey = 'THE_KEY ';`
- Open the folder with VS Code Live Server.
- Type a place name and click "Get Weather".

## Student Name
Leina Hisham
