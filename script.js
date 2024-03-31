const cityInput = document.querySelector(".city-input");

const searchButton = document.querySelector(".search-btn");

const locationButton = document.querySelector(".location-btn");

/* ========================================================== */
// https://www.influxdata.com/blog/how-get-convert-format-javascript-date-timestamp/

// https://timestamp.online/article/how-to-convert-timestamp-to-datetime-in-javascript

let city = document.querySelector(".weather-city");

let datetime = document.querySelector(".weather-datetime");

let weatherTemperature = document.querySelector(".weather-temperature");

let weatherForecast = document.querySelector(".weather-forecast");

let weatherRealFeel = document.querySelector(".weather-realfeel");

let weatherHumidity = document.querySelector(".weather-humidity");

let weatherWind = document.querySelector(".weather-wind");

const currentIcon = document.querySelector("[data-current-icon]");

/* ========================================================== */
let searchInput = document.getElementById("search_input");

let autocomplete;

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(searchInput, {
        types: ["geocode"],
    });
}

/* ========================================================== */
function getIconUrl(iconCode) {
    return `icons/${ICON_MAP.get(iconCode)}.svg`;
}

/* ========================================================== */
function convertTimeStamp(timestamp, timezone) {
    const convertTimezone = timezone / 3600; // convert seconds to hours

    const date = new Date(timestamp * 1000);

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: `Etc/GMT${convertTimezone >= 0 ? "-" : "+"}${Math.abs(
            convertTimezone
        )}`,
        hour12: true,
    };

    return date.toLocaleString("en-US", options);
}
/* ========================================================== */
/* 
    https://www.w3schools.com/js/js_object_maps.asp

    A Map holds key-value pairs where the keys can be any datatype.
    A Map remembers the original insertion order of the keys.
    A Map has a property that represents the size of the map.
*/
function weatherCodeMap(values, description) {
    values.forEach((value) => {
        WEATHER_CODE_MAP.set(value, description);
    });
}

// For display weather icon
const WEATHER_CODE_MAP = new Map();

weatherCodeMap([0], "Clear sky");

weatherCodeMap([1], "Clear");

weatherCodeMap([2], "Partly Cloudy");

weatherCodeMap([3], "Overcast");

weatherCodeMap([51], "Drizzle Light");
weatherCodeMap([53], "Drizzle Moderate");
weatherCodeMap([55], "Drizzle Dense");

weatherCodeMap([56], "Freezing Drizzle Light ");
weatherCodeMap([57], "Freezing Drizzle Dense ");

weatherCodeMap([61], "Rain Slight");
weatherCodeMap([63], "Rain Moderate");
weatherCodeMap([65], "Rain Heavy ");

weatherCodeMap([66, 67], "Freezing Rain");

weatherCodeMap([71], "Snow Slight");
weatherCodeMap([73], "Snow Moderate");
weatherCodeMap([75], "Snow heavy intensity");

weatherCodeMap([77], "Snow grains");

weatherCodeMap([80, 81, 82], "Rain showers");

weatherCodeMap([85, 86], "Snow showers");

weatherCodeMap([95, 96, 99], "Thunderstorm");

// console.log(ICON_MAP.get(3));

/* ========================================================== */
function iconMap(values, icon) {
    values.forEach((value) => {
        ICON_MAP.set(value, icon);
    });
}

const ICON_MAP = new Map();

iconMap([0, 1], "sun");

iconMap([2], "cloud-sun");

iconMap([3], "cloud");

iconMap([45, 48], "smog");

iconMap(
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
    "cloud-showers-heavy"
);

iconMap([71, 73, 75, 77, 85, 86], "snowflake");

iconMap([95, 96, 99], "cloud-bolt");

/* ========================================================== */
// Use Object destructuring
function parseCurrentWeather({ current, utc_offset_seconds }) {
    const {
        temperature_2m: currentTemp,
        weather_code: weatherCode,
        apparent_temperature: feelLike,
        relative_humidity_2m: humidity,
        wind_speed_10m: windSpeed,
        time: timestamp,
    } = current;

    const offsetTimeZone = utc_offset_seconds;

    return {
        currentTemp: Math.round(currentTemp),
        windSpeed: Math.round(windSpeed),
        weatherCode,
        feelLike,
        humidity,
        timestamp,
        offsetTimeZone,
    };
}

function renderCurrentWeather(current, offsetTimeZone) {
    // Use IF because API for location name return faster than API for weather
    if (searchInput.value === "") {
        city.innerHTML = `${cityName}`;
        cityName = "";
    } else {
        city.innerHTML = `${searchInput.value}`;
        searchInput.value = "";
    }

    datetime.innerHTML = convertTimeStamp(
        current.timestamp,
        current.offsetTimeZone
    );

    weatherTemperature.innerHTML = `${current.currentTemp}&degF`;

    weatherRealFeel.innerHTML = `<span>${current.feelLike}</span>&degF;`;

    weatherHumidity.innerHTML = `<span>${current.humidity}</span>%;`;

    weatherWind.innerHTML = `<span>${current.windSpeed}</span>mph;`;

    weatherForecast.innerHTML = `${WEATHER_CODE_MAP.get(current.weatherCode)}`;

    currentIcon.src = getIconUrl(current.weatherCode);
}

function getWeather(lat, lon) {
    const API_URL = `https://api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto&latitude=${lat}&longitude=${lon}`;

    fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            const current = parseCurrentWeather(data);
            // console.log(current);

            renderCurrentWeather(current, data.utc_offset_seconds);
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
}

const getCityCoordinates = () => {
    if (autocomplete.getPlace() === undefined) {
        alert("Please enter city name!");
    } else if (autocomplete.getPlace() && cityInput.value === "") {
        alert("Please enter city name!");
    } else {
        const latitude = autocomplete.getPlace().geometry.location.lat();
        const longitude = autocomplete.getPlace().geometry.location.lng();

        getWeather(latitude, longitude);
    }
};

/* ========================================================== */
// https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding
let cityName = "";

function getCityName(lat, lng) {
    const API_URL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality&key=AIzaSyDnnIcRYDBUojBGXZhmiMCbsBRG2iStUvM`;

    fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
            cityName = data.results[0].formatted_address;
        });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location

            getWeather(latitude, longitude);

            getCityName(latitude, longitude);
        },
        (error) => {
            // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert(
                    "Geolocation request denied. Please reset location permission to grant access again."
                );
            } else {
                alert(
                    "Geolocation request error. Please reset location permission."
                );
            }
        }
    );
};

/* ========================================================== */
searchButton.addEventListener("click", getCityCoordinates);

locationButton.addEventListener("click", getUserCoordinates);

// Clear data in <input> when browser is reloaded / refreshed
window.addEventListener("load", function (e) {
    cityInput.value = "";
});
