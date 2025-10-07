let button = document.querySelector("#lifeAdviceButton");

button.addEventListener("click", (e) => getAndDisplayAdvice());
button.addEventListener("click", (e) => getAndDisplayJoke());
button.addEventListener("click", (e) => getAndDisplayFact());

// Display advice from API
async function getAndDisplayAdvice() {
  let adviceResponse = await fetch("https://api.adviceslip.com/advice");
  let adviceData = await adviceResponse.json();

  let adviceHTML = document.createElement("p");
  adviceHTML.textContent = adviceData.slip.advice;

  let adviceDiv = document.querySelector("#adviceDiv");
  adviceDiv.innerHTML = "";
  adviceDiv.appendChild(adviceHTML);
}

// Display joke from API
async function getAndDisplayJoke() {
  let jokeResponse = await fetch(
    "https://official-joke-api.appspot.com/random_joke"
  );
  let jokeData = await jokeResponse.json();

  let jokeHTML = document.createElement("p");
  jokeHTML.textContent = `${jokeData.setup} — ${jokeData.punchline}`;

  let jokeDiv = document.querySelector("#jokeDiv");
  jokeDiv.innerHTML = "";
  jokeDiv.appendChild(jokeHTML);
}

// Display random useless fact fact from API
async function getAndDisplayFact() {
  let factResponse = await fetch(
    "https://uselessfacts.jsph.pl/api/v2/facts/random"
  );
  let factData = await factResponse.json();

  let factHTML = document.createElement("p");
  factHTML.textContent = factData.text;

  let factDiv = document.querySelector("#factDiv");
  factDiv.innerHTML = "";
  factDiv.appendChild(factHTML);
}
