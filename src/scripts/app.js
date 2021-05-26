const success = (position) => {
  const { baseUrl, apiKey, unitsParam } = urlData();
  const { latitude, longitude } = position.coords;
  const currentWeatherUrl = `${baseUrl}weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&${unitsParam}`;
  const forecastUrl = `${baseUrl}forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&${unitsParam}`;
  getCurrentWeatherData(currentWeatherUrl); 
  get5DayForecastData(forecastUrl);
}

const error = () => {
  console.error('Unable to retrieve location');
}

function urlData() {
  const apiKey = 'cc42663f6c57ef798f9e29193e9b86f4';
  const baseUrl = 'https://api.openweathermap.org/data/2.5/';
  const unitsParam = 'units=metric';
  return { baseUrl, apiKey, unitsParam };
}

const getData = async(url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const getCurrentWeatherData = async(currentWeatherUrl) => {
  const currentWeatherData = await getData(currentWeatherUrl);
  getCurrentWeather(currentWeatherData);
}

const getDayConditions = (days, day) => {
  const midPoint = Math.floor(days[day].length / 2);
    const dayConditions = {
      name: day,
      iconId: days[day][midPoint].weather[0].icon,
      description: days[day][midPoint].weather[0].description,
      highTemp: -999,
      lowTemp: 999,
    };
  return dayConditions;
}

const handleTemp = (days, day, dayConditions) => {
  days[day].forEach(reading => {
    handleLowTemp(reading, dayConditions);
    handleHighTemp(reading, dayConditions);
  }) 
}

const getCurrentWeather = (currentWeatherData) => {
  const conditions = {
    temperature: Math.round(currentWeatherData.main.temp),
    description: currentWeatherData.weather[0].description,
    iconId: currentWeatherData.weather[0].icon,
  };
  renderCurrentWeather(conditions);
}

const renderCurrentWeather = (conditions) => {
  const currentConditionsElement = document.querySelector('.current-conditions');
  currentConditionsElement.innerHTML = '';
  const htmlString = currentWeatherHtml(conditions);
  currentConditionsElement.insertAdjacentHTML('beforeend', htmlString);
}

function handleHighTemp(reading, dayConditions) {
  if (reading.main.temp_max > dayConditions.highTemp) {
    dayConditions.highTemp = Math.round(reading.main.temp_max);
  }
}

function handleLowTemp(reading, dayConditions) {
  if (reading.main.temp_min < dayConditions.lowTemp) {
    dayConditions.lowTemp = Math.round(reading.main.temp_min);
  }
}

function currentWeatherHtml(conditions) {
  return `
  <h2>Current Conditions</h2>
  <img src="http://openweathermap.org/img/wn/${conditions.iconId}@2x.png" />
  <div class="current">
    <div class="temp">${conditions.temperature}℃</div>
    <div class="condition">${conditions.description}</div>
  </div>
  `;
}

const dayForecastHTML = (element) => {
  return `
  <div class="day">
    <h3>${element.name}</h3>
    <img src="http://openweathermap.org/img/wn/${element.iconId}@2x.png" />
    <div class="description">${element.description}</div>
    <div class="temp">
      <span class="high">${element.highTemp}℃</span>/<span class="low">${element.lowTemp}℃</span>
    </div>
  </div>
  `;
}

const render = (dayConditionsArray) => {
  const forecastElement = document.querySelector('.forecast');
  forecastElement.innerHTML = '';
  dayConditionsArray.forEach(element => {
    forecastElement.innerHTML += dayForecastHTML(element);
  }) 
}

const generateDayConditions = (days) => {
  const dayConditionsArray = [];
  const today = new Date().toLocaleString('en-CA', { weekday: 'long' });
  for (let day in days) {
    const dayConditions = getDayConditions(days, day);
    handleTemp(days, day, dayConditions);
    if (dayConditions.name !== today) {
      dayConditionsArray.push(dayConditions);
    };
  }
  render(dayConditionsArray);
}

const generateDaysObj = async(forecastData) => {
  const days = {};
  const completeForecastArray = [...forecastData.list];
  completeForecastArray.forEach(forecastList => {
    const weekday = new Date(forecastList.dt_txt +' UTC').toLocaleString('en-CA', {weekday: 'long'});
    if (days[weekday]) days[weekday].push(forecastList);
    if (!days[weekday]) {
      days[weekday] = [];
      days[weekday].push(forecastList);
    }
  })
  generateDayConditions(days);
}

const get5DayForecastData = async(forecastUrl) => {
  const forecastData = await getData(forecastUrl);
  generateDaysObj(forecastData);
}

(function getUserLocation() {
  navigator.geolocation.getCurrentPosition(success, error);
}());
