const apiKey = "ca2c7854bd70599e066d1b8a7e4ca122";

/* DOM ELEMENTS */

const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const forecastSection = document.getElementById("forecastSection");
const forecastContainer = document.getElementById("forecastContainer");

/* LOADING FUNCTIONS */

function showLoading() {

    document.body.style.cursor = "wait";

}

function hideLoading() {

    document.body.style.cursor = "default";

}

/* WEATHER THEMES */

function setWeatherTheme(weather, icon) {

    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "storm",
        "snow",
        "night"
    );

    const condition = weather.toLowerCase();

    /* Night icon check */

    if (icon.includes("n")) {

        document.body.classList.add("night");

        return;
    }

    if (condition.includes("clear")) {

        document.body.classList.add("sunny");

    }

    else if (condition.includes("cloud")) {

        document.body.classList.add("cloudy");

    }

    else if (
        condition.includes("rain") ||
        condition.includes("drizzle")
    ) {

        document.body.classList.add("rainy");

    }

    else if (
        condition.includes("thunder")
    ) {

        document.body.classList.add("storm");

    }

    else if (
        condition.includes("snow")
    ) {

        document.body.classList.add("snow");

    }

    else {

        document.body.classList.add("night");

    }

}

/* SEARCH WEATHER BY CITY */

function getWeatherByCity() {

    const city = cityInput.value.trim();

    if (!city) {

        alert("Please enter a city name.");

        return;
    }

    localStorage.setItem(
        "lastCity",
        city
    );

    fetchWeather(city);

}

/* GET WEATHER FROM LOCATION */

function getLocationWeather() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported by your browser."
        );

        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                const lat =
                    position.coords.latitude;

                const lon =
                    position.coords.longitude;

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
                );

                const data =
                    await response.json();

                if (
                    response.ok
                ) {

                    displayWeather(data);

                    await fetchAQI(
                        lat,
                        lon
                    );

                    await fetchForecast(
                        data.name
                    );

                }

            } catch (error) {

                console.error(
                    "Location Weather Error:",
                    error
                );

                alert(
                    "Unable to fetch weather."
                );

            } finally {

                hideLoading();

            }

        },

        () => {

            hideLoading();

            alert(
                "Location permission denied."
            );

        }

    );

}

/* FETCH WEATHER BY CITY */

async function fetchWeather(city) {

    try {

        showLoading();

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );

        const data =
            await response.json();

        if (
            data.cod !== 200
        ) {

            alert(
                "City not found."
            );

            return;
        }

        displayWeather(data);

        await fetchAQI(
            data.coord.lat,
            data.coord.lon
        );

        await fetchForecast(
            city
        );

    }

    catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        alert(
            "Something went wrong."
        );

    }

    finally {

        hideLoading();

    }

}

/* DISPLAY WEATHER DATA */

function displayWeather(data) {

    weatherCard.classList.remove(
        "hidden"
    );

    document.getElementById(
        "city"
    ).innerText =
        data.name;

    document.getElementById(
        "country"
    ).innerText =
        data.sys.country;

    document.getElementById(
        "temperature"
    ).innerText =
        `${Math.round(
            data.main.temp
        )}°C`;

    document.getElementById(
        "feelsLike"
    ).innerText =
        `Feels Like ${Math.round(
            data.main.feels_like
        )}°C`;

    document.getElementById(
        "description"
    ).innerText =
        data.weather[0].description;

    document.getElementById(
        "humidity"
    ).innerText =
        `${data.main.humidity}%`;

    document.getElementById(
        "wind"
    ).innerText =
        `${data.wind.speed} m/s`;

    document.getElementById(
        "pressure"
    ).innerText =
        `${data.main.pressure} hPa`;

    document.getElementById(
        "visibility"
    ).innerText =
        `${(
            data.visibility / 1000
        ).toFixed(1)} km`;

    document.getElementById(
        "sunrise"
    ).innerText =
        new Date(
            data.sys.sunrise * 1000
        ).toLocaleTimeString();

    document.getElementById(
        "sunset"
    ).innerText =
        new Date(
            data.sys.sunset * 1000
        ).toLocaleTimeString();

    const icon =
        data.weather[0].icon;

    const weatherIcon =
        document.getElementById(
            "weatherIcon"
        );

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${icon}@4x.png`;

    weatherIcon.alt =
        data.weather[0].description;

    setWeatherTheme(
        data.weather[0].main,
        icon
    );

}

/* AIR QUALITY INDEX */

async function fetchAQI(
    lat,
    lon
) {

    try {

        const response =
            await fetch(
                `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
            );

        const data =
            await response.json();

        const aqi =
            data.list[0].main.aqi;

        const labels = [
            "",
            "Good",
            "Fair",
            "Moderate",
            "Poor",
            "Very Poor"
        ];

        document.getElementById(
            "aqi"
        ).innerText =
            labels[aqi];

    }

    catch (error) {

        console.error(
            "AQI Error:",
            error
        );

        document.getElementById(
            "aqi"
        ).innerText =
            "Unavailable";

    }

}

/* 5-DAY FORECAST */

async function fetchForecast(city) {

    try {

        const response =
            await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
            );

        const data =
            await response.json();

        if (
            !response.ok
        ) {

            throw new Error(
                "Forecast unavailable"
            );

        }

        forecastSection.classList.remove(
            "hidden"
        );

        forecastContainer.innerHTML =
            "";

        const dailyForecasts =
            data.list.filter(
                item =>
                item.dt_txt.includes(
                    "12:00:00"
                )
            );

        dailyForecasts
            .slice(
                0,
                5
            )
            .forEach(
                day => {

                    const date =
                        new Date(
                            day.dt_txt
                        );

                    const dayName =
                        date.toLocaleDateString(
                            "en-US",
                            {
                                weekday:
                                    "short"
                            }
                        );

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "card";

                    card.innerHTML =
                        `
                        <h4>${dayName}</h4>

                        <img
                            src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
                            alt="${day.weather[0].description}"
                        >

                        <p>
                            ${Math.round(
                                day.main.temp
                            )}°C
                        </p>

                        <small>
                            ${day.weather[0].main}
                        </small>
                    `;

                    forecastContainer.appendChild(
                        card
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "Forecast Error:",
            error
        );

    }

}

/* ENTER KEY SEARCH */

cityInput.addEventListener(
    "keydown",

    function (e) {

        if (
            e.key ===
            "Enter"
        ) {

            getWeatherByCity();

        }

    }
);

/* AUTO LOAD*/

window.addEventListener(
    "load",

    () => {

        if (navigator.geolocation) {

            getLocationWeather();

        } else {

            const lastCity =
                localStorage.getItem("lastCity");

            if (lastCity) {

                fetchWeather(lastCity);

            }

        }

    }
);