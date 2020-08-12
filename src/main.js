(function () {
  const apiKey = '93cf5e542275086ede53540b5690de67';
  const url = 'https://api.openweathermap.org/data/2.5';
  let forecastObj = { list: [] };
  let locationObj;

  const container = document.querySelector('.container');
  const weatherContainer = container.querySelector('.weather-container');
  const forecastContainer = weatherContainer.querySelector(
    '.forecast-container'
  );
  const search = weatherContainer.querySelector('.search');
  const button = container.querySelectorAll('button');
  const success = container.querySelector('#success');
  const failed = container.querySelector('#failed');

  let getCoordinates = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

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
          locationObj = res.city;
          let forecastArr = res.list.filter((v, i) => i % 8 === 0);
          forecastArr[0].location = locationObj;
          forecastObj.list = forecastArr;
          render(forecastObj);
        });
    })
    .catch((err) => console.log(err.message));

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
        locationObj = res.city;
        let forecastArr = res.list.filter((v, i) => i % 8 === 0);
        forecastArr[0].location = locationObj;
        forecastObj.list = forecastArr;
        render(forecastObj);
        console.log(forecastObj);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  let render = (arr) => {
    let rawTemplate = document.getElementById('weather-template').innerHTML;
    let compileTemplate = Handlebars.compile(rawTemplate);
    let generatedHTML = compileTemplate(arr);
    forecastContainer.innerHTML = generatedHTML;
  };

  let notificationAlert = (element) => {
    element.style.visibility = 'visible';
    setTimeout(() => {
      element.style.visibility = 'hidden';
    }, 5000);
  };

  Handlebars.registerHelper('getDate', (date) => getDayOfWeek(date));

  Handlebars.registerHelper('getWindDirection', (deg) => degToCompass(deg));

  Handlebars.registerHelper('capitalize', (str) => capitalize(str));

  let getDayOfWeek = (date) => {
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
  };

  let capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

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
})();
