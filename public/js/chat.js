const log = console.log;
const socket = io();

// ELEMENTS
const tag = document.querySelector("#welcomeTag");
const form = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatFormInput");
const chatBtn = document.querySelector("#chatFormBtn");
const locationBtn = document.querySelector("#send-location");
const locationTag = document.querySelector(".locationTag");

const messages = document.querySelector("#messages");

// TEMPLATES
const messageTemplate = document.querySelector("#message-template").innerHTML;

socket.on("newUser", welcomeText => {
  log(welcomeText);
  if (welcomeText) {
    tag.textContent = welcomeText;
  }
});

form.addEventListener("submit", e => {
  // Disable form and submit btn
  chatBtn.setAttribute("disabled", "disabled");
  const chatMessage = e.target.elements.message.value;
  socket.emit("sendMessage", chatMessage, error => {
    chatBtn.removeAttribute("disabled");
    chatInput.value = "";
    chatInput.focus();
    if (error) {
      // return alert(error);
      return log(error);
    }
    log("Message delivered");
  });
  e.preventDefault();
});

socket.on("sendMessage", message => {
  log(message);
  const html = Mustache.render(messageTemplate, {
    message
  });
  messages.insertAdjacentHTML("beforeend", html);
});

locationBtn.addEventListener("click", e => {
  // log("clicked");
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  // Doesn't support the promise API at the moment, so we use  callbacks
  locationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    const location = { latitude, longitude };

    socket.emit("location", location, callback => {
      log("location shared");
    });
  });

  e.preventDefault();
});

socket.on("location", location => {
  locationBtn.removeAttribute("disabled");
  // locationText.style.display = "block";
  // locationTag.setAttribute("href", location);
  log(location);
});
