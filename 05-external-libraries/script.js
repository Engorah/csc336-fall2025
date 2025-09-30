document.getElementById("special-offer-btn").addEventListener("click", () => {
  Toastify({
    className: "daily-deal",
    newWindow: true,
    text: "Daily Deal: Free cookie with every latte!",
    duration: 4000,
    gravity: "top",
    position: "center",
    close: true,
  }).showToast();
});

document.addEventListener("DOMContentLoaded", () => {
  Toastify({
    className: "welcome",
    text: "Welcome to Robert’s Music Cafe!",
    duration: 4000,
    gravity: "top",
    position: "center",
    close: true,
  }).showToast();
});

const hour = new Date().getHours();
if (hour < 7 || hour > 18) {
  Toastify({
    className: "hours",
    text: "We’re closed now. Open 7AM–6PM daily.",
    duration: 4000,
    gravity: "top",
    position: "center",
    close: true,
  }).showToast();
}

// Footer
document.getElementById("year").textContent = new Date().getFullYear();
const btn = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
if (btn && links) {
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
}
