const log = console.log;
const socket = io();

const tag = document.querySelector("#welcomeTag");

const form = document.querySelector("#chatForm");

const output = document.querySelector("#chatMessageOutput");

const locationBtn = document.querySelector("#send-location");

const locationText = document.querySelector("#locationText");

const locationTag = document.querySelector(".locationTag");

socket.on("newUser", welcomeText => {
  log(welcomeText);
  if (welcomeText) {
    tag.textContent = welcomeText;
  }
});

form.addEventListener("submit", e => {
  const chatMessage = e.target.elements.message.value;
  const chatInput = document.querySelector("#chatFormInput");
  socket.emit("sendMessage", chatMessage);

  chatInput.value = "";

  e.preventDefault();
});

socket.on("sendMessage", chatMessage => {
  const listItem = document.createElement("li");
  const listTextContent = document.createTextNode(chatMessage);
  listItem.appendChild(listTextContent);

  output.appendChild(listItem);
});

locationBtn.addEventListener("click", e => {
  //   log("clicked");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  // Doesn't support the promise API at the moment, so we use  callbacks
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    const location = { latitude, longitude };

    socket.emit("location", location);
  });

  e.preventDefault();
});

socket.on("location", location => {
  locationTag.setAttribute("href", location);
  log(location);
});
