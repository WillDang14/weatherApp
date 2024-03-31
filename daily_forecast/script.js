const cityInput = document.querySelector(".city-input");

const searchButton = document.querySelector(".search-btn");

const locationButton = document.querySelector(".location-btn");

/* ========================================================== */
let city = document.querySelector(".weather-city");

const weatherCardsDiv = document.querySelector(".weather-info");
/* ========================================================== */
let searchInput = document.getElementById("search_input");

let autocomplete;

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(searchInput, {
        types: ["geocode"],
    });
}

/* ======================================== */
function convertTimeStamp(timestamp, timezone) {
    const convertTimezone = timezone / 3600; // convert seconds to hours

    const date = new Date(timestamp);

    const options = {
        weekday: "long",
        day: "numeric",
        // month: "long",
        month: "numeric",
        year: "numeric",
        timeZone: `Etc/GMT${convertTimezone >= 0 ? "-" : "+"}${Math.abs(
            convertTimezone
        )}`,
    };

    return date.toLocaleString("en-US", options);
}
/* ========================================================== */
function renderDailyWeather(daily, timezone) {
    // Use IF because API for location name return faster than API for weather
    if (searchInput.value === "") {
        city.innerHTML = `${cityName}`;
        cityName = "";
    } else {
        city.innerHTML = `${searchInput.value}`;
        searchInput.value = "";
    }

    weatherCardsDiv.innerHTML = "";

    daily.forEach((day, index) => {
        // ==>> [ "Saturday", " 3/30/2024" ]
        const dateData = convertTimeStamp(day.timestamp, timezone).split(",");

        html = `<div class="card">
                    <div>
                        <p>${dateData[0]}</p>
                        <p>${dateData[1]}</p>
                    </div>

                    <div>
                        <p>Temp(°F)</p>
                        <div><span>${day.maxTemp}</span>°/${day.minTemp}°</div>
                    </div>

                    <div>
                        <p>Feel Like(°F)</p>
                        <div><span>${day.feelLikeMax}</span>°/${day.feelLikeMin}°</div>
                    </div>

                    <div>
                        <p>Wind</p>
                        <p>${day.windSpeed} mph</p>
                    </div>
                </div>`;

        weatherCardsDiv.insertAdjacentHTML("beforeend", html);
    });
}

function parseDailyWeather({ daily }) {
    return daily.time.map((time, index) => {
        return {
            timestamp: time * 1000,
            weatherCode: daily.weather_code[index],
            maxTemp: Math.round(daily.temperature_2m_max[index]),
            minTemp: Math.round(daily.temperature_2m_min[index]),
            feelLikeMax: Math.round(daily.apparent_temperature_max[index]),
            feelLikeMin: Math.round(daily.apparent_temperature_min[index]),
            windSpeed: Math.round(daily.wind_speed_10m_max[index]),
        };
    });
}

function getWeather(lat, lon) {
    const API_URL = `https://api.open-meteo.com/v1/forecast?daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto&latitude=${lat}&longitude=${lon}`;

    fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            const daily = parseDailyWeather(data);

            renderDailyWeather(daily, data.utc_offset_seconds);
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
            // console.log(data);

            cityName = data.results[0].formatted_address;

            // console.log(cityName);
        });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location

            // console.log(latitude, longitude);

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

/* ========================================================== */
// Clear data in <input> when browser is reloaded / refreshed
window.addEventListener("load", function (e) {
    cityInput.value = "";
});
