const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

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

  socket.on("sendMessage", chatMessage => {
    io.emit("sendMessage", chatMessage); // send to the network
  });

  socket.on("disconnect", () => {
    io.emit("newUser", "A user has left");
  });
});

server.listen(port, () => {
  log(`chat app running on localhost:${port}`);
});
