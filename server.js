const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const cors = require('cors');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { DATABASE_URL, PORT } = require('./config');
const { Users } = require('./models/users');
const { Ideas } = require('./models/ideas');

// Initialize app
const app = express();
mongoose.Promise = global.Promise;

// CORS
const { CLIENT_ORIGIN } = require('./config');

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Config
const { SECRET } = require('./config');

// Morgan
app.use(morgan('common'));

// Bodyparser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Express Validator
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

app.use(expressValidator());

// Routers and modules
app.post('/api/users', (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return Users
    .create({
      firstName,
      lastName,
      email,
      password: hash,
    })
    .then(() => res.status(201).send())
    .catch((err) => {
      res.status(500).json({ error: 'Something went wrong' });
    });
});

app.get('/api/ideas', (req, res) => {

});
app.post('/api/ideas', (req, res) => {

});

// Initializing Server
let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, (err) => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', (err) => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
