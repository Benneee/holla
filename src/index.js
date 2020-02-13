const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const log = console.log;

// Socket.io needs to use the core http module to function
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let welcomeText = "Welcome to 'Holla!'";

/**
 * Events configuration on socket.io
 *
 * For this to work, we also need to load in the client side of
 * the socket.io library, that's done in the HTML page
 */
io.on("connection", socket => {
  log("new user connected");

  socket.emit("newUser", welcomeText); // send to single user

  socket.broadcast.emit("newUser", "A new user has joined!"); // send to everyone except the author

  socket.on("sendMessage", (chatMessage, callback) => {
    const filter = new Filter();
    if (filter.isProfane(chatMessage)) {
      return callback("Profanity is not allowed!");
    }

    io.emit("sendMessage", chatMessage); // send to the network
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("newUser", "A user has left");
  });

  socket.on("location", (location, callback) => {
    io.emit(
      "location",
      `https://google.com/maps?q=${location.latitude},${location.longitude}`
    );
    callback();
  });
});

server.listen(port, () => {
  log(`chat app running on localhost:${port}`);
});
