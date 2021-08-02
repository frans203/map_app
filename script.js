"use strict";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const form = document.querySelector(".form");
const left = document.querySelector(".left");
const content = document.querySelector(".content");
const inputDistance = document.querySelector(".form_distance");
const inputDuration = document.querySelector(".form_duration");
const inputCadence = document.querySelector(".form_cadence");
const inputElev = document.querySelector(".form_elev");
const inputType = document.querySelector(".form_input_type");
const deleteAll = document.querySelector(".deleteAll");
const btnSort = document.querySelector(".btn-sort");

let map, mapEvent;
class WorkOut {
  id = (Date.now() + "").slice(-8);
  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
}

class Running extends WorkOut {
  type = "running";
  description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
    months[new Date().getMonth()]
  } ${new Date().getDate()}`;

  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.pace();
  }

  pace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends WorkOut {
  type = "cycling";
  description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
    months[new Date().getMonth()]
  } ${new Date().getDate()}`;
  constructor(distance, duration, coords, elevation) {
    super(distance, duration, coords);
    this.elevation = elevation;
    this.speed();
    // console.log(this.description);
  }

  speed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

////////////////////////////////////////////////////

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLvl = 18;
  constructor() {
    this._getPosition();

    this._getLocalStorage();

    inputType.addEventListener("change", this._toogleElevationField.bind(this));
    form.addEventListener("submit", this._newWorkout.bind(this));
    left.addEventListener("click", this._moveToWo.bind(this));
    // close.addEventListener("click", this._closeWorkout.bind(this));
    deleteAll.addEventListener("click", this._deleteAll.bind(this));
    this._createWorBtn();
  }
  _accessWorkout(value) {}
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Isn't able to access geolocation ");
        }
      );
    }
  }

  _loadMap(position) {
    // console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const arr = [latitude, longitude];
    // console.log(arr);
    this.#map = L.map("map").setView(arr, this.#mapZoomLvl);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));

    this.#workouts.forEach((wr) => {
      this._setMarker(wr);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // console.log(this.#mapEvent);
    let { lat, lng } = this.#mapEvent.latlng;
    form.classList.remove("hidden");
    // console.log(lat, lng);
    inputDistance.focus();
    // L.marker(arr).addTo(map)
    //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //     .openPopup();

    // L.marker([lat, lng])
    //   .addTo(this.#map)
    //   .bindPopup(
    //     L.popup({
    //       maxWidth: 250,
    //       minWidth: 100,
    //       autoClose: false,
    //       closeOnClick: false,
    //     })
    //   );
  }
  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElev.value =
        "";
    // form.style.display = "none";
    form.classList.add("hidden");
    // setTimeout(() => {
    //   return (form.style.display = "grid");
    // }, 1000);
  }
  _newWorkout(e) {
    const validInputs = (...inputs) => {
      return inputs.every((inp) => Number.isFinite(inp));
    };
    const allPositive = (...inputs) => {
      return inputs.every((inp) => inp > 0);
    };
    e.preventDefault();

    const duration = +inputDuration.value;
    const distance = +inputDistance.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElev.value;
    let { lat, lng } = this.#mapEvent.latlng;
    let workout;

    const type = inputType.value;
    // console.log(type);
    //create new object(running)
    if (type === "running") {
      if (
        !validInputs(duration, distance, cadence) ||
        !allPositive(duration, distance, cadence)
      ) {
        // console.log(duration, distance, cadence);
        return alert("Positive and valid inputs, please! :) ");
      }

      workout = new Running(distance, duration, [lat, lng], cadence);
      // console.log("a");
      //create new object(cycling)
    } else if (type === "cycling") {
      if (
        !validInputs(duration, distance, elevation) ||
        !allPositive(duration, distance)
      ) {
        // console.log(duration, distance, cadence);
        return alert("Positive and valid inputs, please! :) ");
      }
      workout = new Cycling(distance, duration, [lat, lng], cadence);
    }
    this.#workouts.push(workout);
    console.log(this.#workouts);
    //add to list
    this._workoutList(workout);

    // console.log(lat, lng);
    //set marker
    this._setMarker(workout);
    //set inputs to empty
    this._hideForm();
    //set local storage
    this._setLocalStorage();
    //function to close
    this._createWorBtn();
  }

  _toogleElevationField() {
    inputCadence.closest(".form_row").classList.toggle("form_row--hidden");

    inputElev.closest(".form_row").classList.toggle("form_row--hidden");
  }
  _setMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"}‍ ${workout.description}`
      )
      .openPopup();
  }
  _workoutList(workout) {
    // console.log(workout.type);
    let html = `
       <ul class="list list-item-${workout.type}">
        <li class="list-item " data-id="${workout.id}">
        <h2>${workout.description}</h2> 
        <div class="wor-btn">
        <button class='btn-x'>X</button>
        </div>
        <div class="all-details">
          <div class="wor_details">
            <span class="wor_details_icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }‍</span>
            <span class="wor_details_value">${workout.distance}</span>
            <span class="wor_details_unit">km</span>
          </div>

          <div class="wor_details">
            <span class="wor_details_icon">⏱</span>
            <span class="wor_details_value">${workout.duration}</span>
            <span class="wor_details_unit">min</span>
          </div>`;

    if (workout.type === "running") {
      html += `               
         <div class="wor_details">
        <span class="wor_details_icon">⚡️</span>
        <span class="wor_details_value">${
          workout.pace % 1 === 0 ? workout.pace : workout.pace.toFixed(2)
        }</span>
        <span class="wor_details_unit">min/km</span>
      </div>

      <div class="wor_details">
        <span class="wor_details_icon">🦶🏼</span>
        <span class="wor_details_value">${workout.cadence}</span>
        <span class="wor_details_unit">spm</span>
      </div>
    </div>
  </li>
  </ul>`;
    }
    if (workout.type === "cycling") {
      html += `               
      <div class="wor_details">
      <span class="wor_details_icon">⚡️</span>
      <span class="wor_details_value">${
        workout.speed % 1 === 0 ? workout.speed : workout.speed.toFixed(2)
      }</span>
      <span class="wor_details_unit">km/h</span>
    </div>

    <div class="wor_details">
      <span class="wor_details_icon">⛰</span>
      <span class="wor_details_value">${workout.elevation}</span>
      <span class="wor_details_unit">m</span>
    </div>
  </div>
</li>
</ul>`;
    }

    form.insertAdjacentHTML("afterend", html);
  }
  //move to click
  _moveToWo(e) {
    const targ = e.target.closest(".list-item");
    // console.log(targ);
    if (!targ) return;

    const arrMove = this.#workouts.find((w) => {
      return w.id === targ.dataset.id;
    });
    // console.log(arrMove);

    this.#map.setView(arrMove.coords, this.#mapZoomLvl, {
      animation: true,
      pan: {
        duration: 1,
      },
    });
  }

  //local storage
  _setLocalStorage() {
    localStorage.setItem("wk", JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("wk"));
    // console.log(data);

    if (!data) return;
    this.#workouts = data;
    data.forEach((dt) => {
      this._workoutList(dt);
      // console.log(dt);
    });
  }
  reset() {
    localStorage.removeItem("wk");
    location.reload();
  }

  //deleting wor

  _createWorBtn() {
    const _this = this;
    let workouts = this.#workouts;
    let arrW;
    let close = document.querySelectorAll(".wor-btn");

    console.log(close);
    left.addEventListener("click", function (e) {
      if (e.target.className !== "btn-x") return;

      let workout = e.target.closest(".list-item");
      if (!workout) return;
      console.log(workout);
      arrW = workouts.find((w) => {
        if (!workout.dataset) return;
        return w.id === workout.dataset.id;
      });
      console.log(arrW);
      // _this._deleteMarker(arrW);
      // console.log(L.Popup);

      let listRe = workout.closest(".list");
      listRe.style.display = "none";
      console.log(listRe);

      // const index = workouts.indexOf(arrW);
      // console.log(index);
      // _this.#workouts.splice(index, 1);
      let toStore = _this.#workouts.filter(function (value) {
        return value.id !== arrW.id;
      });
      console.log(toStore);
      console.log(_this.#workouts);
      //delete markers and popups

      toStore.forEach((wr) => {
        console.log(wr);
        _this._setMarker(wr);
      });
      //new markers
      localStorage.setItem("wk", JSON.stringify(toStore));
      window.location.reload();
    });
  }

  _deleteAll() {
    localStorage.setItem("wk", JSON.stringify(""));
    window.location.reload();
  }
}

const app = new App();
