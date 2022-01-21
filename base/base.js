const dotenv = require('dotenv');
dotenv.config()

const express = require('express');
const app = express();
const log = require('./../log');
const auth = require("./auth");

let name = require('./../package.json').name;
let version = require('./../package.json').version;

let bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', (req, res) => {
  res.status(200).send(`Hello, ${name}@${version} is here!`).end();
});

// -----------------------> Logging
app.use((req, res, next) => {
  log(`${req.method}:${req.url} ${res.statusCode}`);
  next();
});

// -----------------------> Start the server

console.log(`Found Port: ${process.env.NODE_PORT}`)

const PORT = process.env.NODE_PORT || 8080;
let listenCallback = false;

var server = app.listen(PORT, async() => {
  log(`Fireing Up Service: ${name}@${version}`);

  log(`App listening on port ${PORT}`);
  log('Press Ctrl+C to quit.');

  if (listenCallback) listenCallback();
});

const stopListener = () => {
  if (!server) return;
  log(`Shutting Down Service: ${name}@${version}`);

  server.close(() => {
    log(`Shut Down: ${name}@${version}`);
    process.exit(0);
  });

  server = false;

  setTimeout( function () {
    log("Could not close connections in time, forcing shut down");
    process.exit(1);
  }, 2000);
}

process.on('SIGTERM', () => {
  log('SIGTERM signal received: closing HTTP server');
  stopListener();
})

process.on('SIGINT', () => {
  log('SIGINT signal received: closing HTTP server')
  stopListener();
})

module.exports = {
  app: app,
  setListenCallback: (callback_) => {
    listenCallback = callback_;
  },
  auth: auth
};
