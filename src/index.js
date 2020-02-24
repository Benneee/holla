const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");

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

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    // This method can only be used on the server
    socket.join(user.room);
    socket.emit("welcomeMsg", generateMessage("Welcome to 'Holla!"));
    socket.broadcast
      .to(user.room)
      .emit("welcomeMsg", generateMessage(`${user.username} has joined!`)); // send to everyone except the author

    callback();
  });

  socket.on("sendMessage", (chatMessage, callback) => {
    const filter = new Filter();
    if (filter.isProfane(chatMessage)) {
      return callback("Profanity is not allowed!");
    }

    io.to("lagos").emit("sendMessage", generateMessage(chatMessage)); // send to the network
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "welcomeMsg",
        generateMessage(`${user.username} has left!`)
      );
    }
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
