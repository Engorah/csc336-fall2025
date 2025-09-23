let reservations = [];

function populateReservationInfoDiv() {
  let reservationInfoDiv = document.querySelector("#all-reservation-info");

  reservationInfoDiv.innerHTML = "";

  for (let reservation of reservations) {
    let reservationHTML = createReservationDiv(reservation);
    reservationInfoDiv.innerHTML += reservationHTML;
  }
}

function createReservationDiv(reservation) {
  let formattedTime = new Date(reservation.time).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
    <div>
      <h3>${reservation.name}</h3>
      <div class='stats'>
        <div>Party Size: ${reservation.number}</div>
        <div>Time of Reservation: ${formattedTime}</div>
      </div>
    </div>
  `;
}

let addReservationForm = document.querySelector("#add-reservation-form");
addReservationForm.addEventListener("submit", addNewReservation);

populateReservationInfoDiv();

function addNewReservation(e) {
  e.preventDefault();

  // Validation div
  let validationDiv = document.querySelector("#validation-error");
  validationDiv.innerHTML = "";

  let reservationNameInput = document.querySelector("#name-field").value;
  let reservationNumberInput = document.querySelector("#number-field").value;
  let reservationTimeInput = document.querySelector("#time-field").value;

  if (
    !reservationNameInput ||
    !isNaN(reservationNameInput) ||
    /\d/.test(reservationNameInput)
  ) {
    validationDiv.innerHTML = "Please enter a valid name";
    return;
  }

  if (!reservationNumberInput) {
    validationDiv.innerHTML = "Please enter a valid number";
    return;
  }

  if (reservationNumberInput > 20) {
    validationDiv.innerHTML = "ERROR: Contact Catering Department";
    return;
  }

  if (!reservationTimeInput) {
    validationDiv.innerHTML = "Please enter a valid time";
    return;
  }

  let newReservation = {
    name: reservationNameInput,
    number: reservationNumberInput,
    time: reservationTimeInput,
  };

  reservations.push(newReservation);

  populateReservationInfoDiv();

  e.target.reset();
  validationDiv.innerHTML = "";
}
