const path = require("path");
const express = require("express");
const app = express();
const log = console.log;

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

app.listen(port, () => {
  log(`chat app running on localhost:${port}`);
});
