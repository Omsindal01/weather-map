const results = document.querySelector(".results");
const result = document.querySelector(".result");
const exit = document.querySelector(".exit");
let lat, lng, mymap;
let arr = [];
const getPos = function (mymap, lat, lng, msg = "you are currently here") {
  L.marker([lat, lng])
    .addTo(mymap)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `popup`,
      })
    )
    .setPopupContent(`${msg}`)
    .openPopup();
};
const weatherData = function (mymap, lat, lng) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=8b0edf9de1d6ed82db7fc3af1ae90ae6`
  )
    .then(function (res) {
      if (!res.ok) throw new Error("location not found!");
      return res.json();
    })
    .then(function (data2) {
      getPos(mymap, lat, lng, `${data2.name}`);
      arr.push(data2);
      storeData();
      insertData(data2, data2.id);
    })
    .catch((err) => console.error(`${err}`));
};

const insertData = function (obj, id) {
  const html = `<li class="result" data-id=${id}>
  <p class="place"><i class="ion-location icon"></i> <span>${
    obj.name
  }</span></p>
<p class="temp"><i class="ion-thermometer icon"></i> <span>${(
    obj.main.temp - 273.15
  ).toFixed(1)} °C</span></p>
<p class="weather-des"><i class="ion-clipboard icon"></i> <span>${
    obj.weather[0].description
  }</span></p>
<p class="humidity"><i class="ion-flash icon"></i> <span>${
    obj.main.humidity
  }%</span></p></li>`;
  results.insertAdjacentHTML("afterbegin", html);
};
const storeData = function () {
  localStorage.setItem("op", JSON.stringify(arr));
};
const getData = function () {
  const data = JSON.parse(localStorage.getItem("op"));
  // console.log(data);
  if (!data) return;
  arr = data;
  console.log(arr);
  arr.forEach((value) => {
    insertData(value, value.id);
  });
};
const reset = function () {
  localStorage.removeItem("op");
  location.reload();
};
navigator.geolocation.getCurrentPosition(
  function (pos) {
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;

    mymap = L.map("map").setView([lat, lng], 5);
    console.log(mymap);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);
    getPos(mymap, lat, lng);
    mymap.on("click", function (e) {
      weatherData(mymap, e.latlng.lat, e.latlng.lng);
    });
    arr.forEach((value) =>
      getPos(mymap, value.coord.lat, value.coord.lon, `${value.name}`)
    );
  },
  () => alert("Could not get your position")
);
results.addEventListener("click", function (e) {
  const el = e.target.closest(".result");

  if (!el) return;
  const tar = arr.find((value) => value.id === +el.dataset.id);
  mymap.setView(tar.coord, 5, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
});
console.log(exit);
exit.addEventListener("click", function (e) {
  reset();
});
getData();
