const log = console.log;
const socket = io();

// ELEMENTS
const tag = document.querySelector("#welcomeTag");
const form = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatFormInput");
const chatBtn = document.querySelector("#chatFormBtn");

const messages = document.querySelector("#messages");
// const locationText = document.querySelector("#location-text");
const locationBtn = document.querySelector("#send-location");

// TEMPLATES
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const welcomeTemplate = document.querySelector("#welcome-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// OPTIONS
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  // New message element
  const newMessage = messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // Height of messages container
  const containerHeight = messages.scrollHeight;

  // Distance scrolled
  const scrollOffset = messages.scrollTop + visibleHeight;
  // scrollTop: The distance I have scrolled from the top

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }

  // ToDo: add new message notification when there's a new message and user is still on previous messages causing new message to be out of view
};

socket.on("welcomeMsg", welcomeText => {
  log(welcomeText);
  if (welcomeText) {
    const text = Mustache.render(messageTemplate, {
      username: welcomeText.username,
      message: welcomeText.text,
      createdAt: moment(welcomeText.createdAt).format("h:mm a")
    });
    // tag.textContent = text;
    messages.insertAdjacentHTML("beforeend", text);
    autoscroll();
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
  const { username, text, createdAt } = message;
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format("h:mm a")
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
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
  const { username, url, createdAt } = location;
  const html = Mustache.render(locationTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format("h:mm a")
  });
  messages.insertAdjacentHTML("beforeend", html);
  // log(location);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  // log("room: ", room);
  // log("users: ", users);
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML = html;
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
