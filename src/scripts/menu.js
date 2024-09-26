document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("expanded");

  let seperators = document.querySelectorAll(".nav-seperator");
  for (let seperator of seperators) {
    seperator.classList.toggle("nav-seperator-expanded");
  }
});
