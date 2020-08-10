const apiKey = '93cf5e542275086ede53540b5690de67';
const url = 'https://api.openweathermap.org/data/2.5';
const forecastContainer = document.querySelector('.forecast-container');
let forecast;
let address;
const search = document.querySelector('.search');
let success = document.querySelector('#success');
let failed = document.querySelector('#failed');
let button = document.getElementsByTagName('button');

let getCoordinates = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

search.onkeydown = (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    getCity(e.target.value);
    e.target.value = '';
  }
};

[...button].forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.target.parentNode.style.visibility = 'hidden';
  });
});

getCoordinates()
  .then((pos) => {
    fetch(
      `${url}/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${apiKey}`
    )
      .then((res) => {
        if (res.status === 200) {
          notificationAlert(success);
          return res.json();
        } else {
          notificationAlert(failed);
          throw new Error("Can't find your location");
        }
      })
      .then((res) => {
        address = res.city;
        forecast = res.list.filter((v, i) => i % 8 === 0);
        render(forecast, address);
      });
  })
  .catch((err) => console.log(err.message));

let getCity = (term) => {
  fetch(`${url}/forecast?q=${term}&units=metric&appid=${apiKey}`)
    .then((res) => {
      if (res.status === 200) {
        notificationAlert(success);
        return res.json();
      } else {
        notificationAlert(failed);
        throw new Error("Can't find your location");
      }
    })
    .then((res) => {
      address = res.city;
      forecast = res.list.filter((v, i) => i % 8 === 0);
      render(forecast, address);
    })
    .catch((err) => {
      console.log(err);
    });
};

let notificationAlert = (element) => {
  element.style.visibility = 'visible';
  setTimeout(() => {
    element.style.visibility = 'hidden';
  }, 5000);
};

let render = (arr, location) => {
  forecastContainer.innerHTML = '';

  let loc = location;
  for (let i = 0; i < arr.length; i++) {
    let dayOfWeek = getDayOfWeek(arr[i].dt_txt);

    let forecastHeader = document.createElement('div');
    forecastHeader.setAttribute('class', 'forecast-header');

    let forecastContent = document.createElement('div');
    forecastContent.setAttribute('class', 'forecast-content');

    let forecast = document.createElement('div');

    if (i === 0) {
      forecast.setAttribute('class', 'today forecast');

      renderHeader(
        forecastHeader,
        `${dayOfWeek}, ${formatDate(arr[i].dt_txt)}`
      );

      let location = document.createElement('div');
      location.setAttribute('class', 'location');
      location.textContent = `${loc.name}, ${loc.country}`;

      forecastContent.append(location);
      renderContent(forecastContent, arr[i]);

      forecast.append(forecastHeader, forecastContent);
      forecastContainer.appendChild(forecast);
    } else {
      forecast.setAttribute('class', 'forecast');

      renderHeader(forecastHeader, `${dayOfWeek.slice(0, 3)}`);

      renderContent(forecastContent, arr[i]);

      forecast.append(forecastHeader, forecastContent);
      forecastContainer.appendChild(forecast);
    }
  }
};

let renderHeader = (parent, content) => {
  let day = document.createElement('div');
  day.setAttribute('class', 'day');
  day.textContent = content;
  parent.appendChild(day);
};

let renderContent = (parent, content) => {
  let temp = document.createElement('div');
  temp.setAttribute('class', 'temp');
  temp.textContent = `${content.main.temp}°C`;

  let horizontal = document.createElement('div');
  horizontal.setAttribute('class', 'horizontal');
  let p1 = document.createElement('p');
  p1.textContent = `${content.main.feels_like}°C`;
  let p2 = document.createElement('p');
  p2.textContent = `${capitalize(content.weather[0].description)}`;
  horizontal.append(p1, p2);

  let weatherItems = document.createElement('ul');
  weatherItems.setAttribute('class', 'weather-items');

  let windLine = document.createElement('li');
  windLine.setAttribute('class', 'wind-line');
  windLine.innerHTML = `<p>${content.wind.speed}m/s ${degToCompass(
    content.wind.deg
  )}</p>`;

  let atmosphericPressure = document.createElement('li');
  atmosphericPressure.setAttribute('class', 'atmosperic-pressure');
  atmosphericPressure.innerHTML = `<p>${content.main.pressure}hPa</p>`;

  let humidity = document.createElement('li');
  humidity.setAttribute('class', 'humidity');
  humidity.innerHTML = `<p>Humidity: ${content.main.humidity}%</p>`;

  weatherItems.append(windLine, atmosphericPressure, humidity);
  parent.append(temp, horizontal, weatherItems);
};

function getDayOfWeek(date) {
  const dayOfWeek = new Date(date).getDay();
  return isNaN(dayOfWeek)
    ? null
    : [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ][dayOfWeek];
}

let degToCompass = (num) => {
  let val = Math.floor(num / 22.5 + 0.5);
  let arr = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  return arr[val % 16];
};

let capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

let formatDate = (date) => {
  let d = new Date(date);
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('en', { month: 'long' }).format(d);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

  return `${mo} ${da}, ${ye}`;
};
