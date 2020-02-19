const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const log = console.log;

// Socket.io needs to use the core http module to function
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

/**
 * Events configuration on socket.io
 *
 * For this to work, we also need to load in the client side of
 * the socket.io library, that's done in the HTML page
 */
io.on("connection", socket => {
  log("new user connected");

  // socket.emit("newUser", "Welcome to 'Holla!'"); // send to single user

  socket.emit("newUser", generateMessage("Welcome to 'Holla!"));

  socket.broadcast.emit("newUser", generateMessage("A new user has joined!")); // send to everyone except the author

  socket.on("sendMessage", (chatMessage, callback) => {
    const filter = new Filter();
    if (filter.isProfane(chatMessage)) {
      return callback("Profanity is not allowed!");
    }

    io.emit("sendMessage", generateMessage(chatMessage)); // send to the network
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("newUser", generateMessage("A user has left"));
  });

  socket.on("location", (location, callback) => {
    io.emit(
      "location",
      generateLocationMessage(
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });
});

server.listen(port, () => {
  log(`chat app running on localhost:${port}`);
});
