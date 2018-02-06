const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const cors = require('cors');
const { Client, Pool } = require('pg');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcryptjs');

const { DATABASE_URL, PORT } = require('./config');


// Initialize app
const app = express();

// CORS
const { CLIENT_ORIGIN } = require('./config');


// Store hash in your password DB. 
/* app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
); */

// Postgres
const pool = new Pool({
  port: 5432,
  database: 'lightbulb',
  max: 10,
  host: 'localhost',
  user: 'postgres',
});

/* const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect(); */

/* client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});
 */
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
  pool.connect((err, client, done) => {
    if (err) {
      return console.log(err);
    }
    const { email, password } = req.body;
    // BCRYPT
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    client.query('INSERT INTO users VALUES ($1, $2, $3)', [uuidv4(), email, hash], (err, table) => {
      done();
      if (err) {
        return console.log(err)
      }
      console.log('DATA INSERTED');
      res.status(201).send();
    });
  });
});
app.get('/api/ideas', (req, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      return console.log(err);
    }
    client.query('SELECT * from ideas', (err, table) => {
      done();
      if (err) {
        return console.log(err);
      }
      res.send(table.rows);
    });
  });
});
app.post('/api/ideas', (req, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      return console.log(err);
    }
    const { title, content } = req.body;
    client.query('INSERT INTO ideas VALUES ($1, $2, $3)', [uuidv4(), title, content], (err, table) => {
      done();
      if (err) {
        return console.log(err);
      }
      res.status(201).send();
    });
  });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
