const success = (position) => {
  const apiKey = 'cc42663f6c57ef798f9e29193e9b86f4';
  const baseUrl = 'https://api.openweathermap.org/data/2.5/';
  const unitsParam = 'units=metric';
  const { latitude, longitude } = position.coords;
  console.log(latitude, longitude)
  const currentWeatherUrl = `${baseUrl}weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&${unitsParam}`;
  const forecastUrl = `${baseUrl}forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&${unitsParam}`;
  getCurrentWeatherData(currentWeatherUrl); 
  get5DayForecastData(forecastUrl);
}

const error = () => {
  console.error('Unable to retrieve location');
}

const getData = async(url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

const getCurrentWeatherData = async(currentWeatherUrl) => {
  const currentWeatherData = await getData(currentWeatherUrl);
  console.log(currentWeatherData);
}

const get5DayForecastData = async(forecastUrl) => {
  const forecastData = await getData(forecastUrl);
  console.log(forecastData);
}

(function getUserLocation() {
  navigator.geolocation.getCurrentPosition(success, error);
}());