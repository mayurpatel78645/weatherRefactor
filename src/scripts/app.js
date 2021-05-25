const apiKey = 'cc42663f6c57ef798f9e29193e9b86f4';
const baseUrl = 'https://api.openweathermap.org/data/2.5/';
const unitsParam = 'units=metric';

const getCurrentWeather = async (lat, lon) => {
  const response = await fetch(
    `${baseUrl}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&${unitsParam}`
  );
  const data = await response.json();
  return data;
};

const get5DayForecast = async (lat, lon) => {
  const response = await fetch(
    `${baseUrl}forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&${unitsParam}`
  );
  const data = await response.json();
  return data;
};

const renderCurrentConditions = (conditions) => {
  const currentConditionsElement = document.querySelector(
    '.current-conditions'
  );
  currentConditionsElement.innerHTML = '';
  const htmlString = `
  <h2>Current Conditions</h2>
  <img src="http://openweathermap.org/img/wn/${conditions.iconId}@2x.png" />
  <div class="current">
    <div class="temp">${conditions.temperature}℃</div>
    <div class="condition">${conditions.description}</div>
  </div>
  `;

  currentConditionsElement.insertAdjacentHTML('beforeend', htmlString);
};

const dayForecastHTML = (dayConditions) => {
  return `
  <div class="day">
    <h3>${dayConditions.name}</h3>
    <img src="http://openweathermap.org/img/wn/${dayConditions.iconId}@2x.png" />
    <div class="description">${dayConditions.description}</div>
    <div class="temp">
      <span class="high">${dayConditions.highTemp}℃</span>/<span class="low">${dayConditions.lowTemp}℃</span>
    </div>
  </div>
  `;
};

const renderDayForecast = (dayObjectsArray) => {
  const forecastElement = document.querySelector('.forecast');
  forecastElement.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    forecastElement.innerHTML += dayForecastHTML(dayObjectsArray[i]);
  }
};

const currentWeatherData = async() => {
  const data = await getCurrentWeather(latitude, longitude);
  const conditions = {
    temperature: Math.round(data.main.temp),
    description: data.weather[0].description,
    iconId: data.weather[0].icon,
  };
  return conditions;
}

const getLocation = async() => {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const conditions =  await currentWeatherData();
    renderCurrentConditions(conditions);
  
    get5DayForecast(latitude, longitude).then((data) => {
      const allData = [...data.list];
      const days = {};
  
      const today = new Date().toLocaleString('en-CA', { weekday: 'long' });
  
      allData.forEach((reading) => {
        const readingDate = new Date(reading.dt_txt + ' UTC').toLocaleString(
          'en-CA',
          { weekday: 'long' }
        );
        if (days[readingDate]) {
          days[readingDate].push(reading);
        } else {
          days[readingDate] = [];
          days[readingDate].push(reading);
        }
      });
  
      const dayConditionsObjects = [];
      for (let day in days) {
        const midPoint = Math.floor(days[day].length / 2);
        const dayConditions = {
          name: day,
          iconId: days[day][midPoint].weather[0].icon,
          description: days[day][midPoint].weather[0].description,
          highTemp: -999,
          lowTemp: 999,
        };
  
        for (let reading of days[day]) {
          if (reading.main.temp_min < dayConditions.lowTemp) {
            dayConditions.lowTemp = Math.round(reading.main.temp_min);
          }
  
          if (reading.main.temp_max > dayConditions.highTemp) {
            dayConditions.highTemp = Math.round(reading.main.temp_max);
          }
        }
  
        if (dayConditions.name !== today) {
          dayConditionsObjects.push(dayConditions);
        }
      }
      renderDayForecast(dayConditionsObjects);
    });
  });
}
