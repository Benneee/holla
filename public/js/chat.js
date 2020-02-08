const log = console.log;
const socket = io();

const tag = document.querySelector("#welcomeTag");

const form = document.querySelector("#chatForm");

const output = document.querySelector("#chatMessageOutput");

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
