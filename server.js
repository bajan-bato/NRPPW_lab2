require('dotenv').config()
const express = require('express');
const {Pool, types} = require('pg');
types.setTypeParser(1082, v => v);

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true })); 

const hostname  = process.env.HOSTNAME || 'localhost';
const port      = process.env.PORT || 3000;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized : false }
});
app.set('views', './public');
app.set('view engine', 'ejs');


let xss = false;
let exposure = false;

app.get('/', async (req, res) => {
  let comments = (await db.query("SELECT * FROM comment")).rows;
  res.render('xss', { comments: comments, xss: xss });
});

app.get('/data', async (req, res) => {
  let data = new Array();
  let users = (await db.query('SELECT * FROM "user"')).rows;
  if (exposure) data = (await db.query("SELECT * FROM thingUnsafe")).rows;
  else data = (await db.query("SELECT * FROM thingSafe")).rows;
  res.render('data', { users: users, things: data, exposure: exposure });
});

app.get('/data/:id', async (req, res) => {
  let data = new Array();
  const id = req.params.id;
  if (exposure) data = (await db.query(`SELECT * FROM thingUnsafe WHERE id = $1`, [id])).rows;
  else data = (await db.query(`SELECT * FROM thingSafe WHERE id = $1`, [id])).rows;
  if (data.length === 0) return res.status(404).send({});
  res.send(data[0]);
});

app.post('/xss', async (req, res) => {
  let count = (await db.query("SELECT * FROM comment")).rowCount;
  await db.query(`INSERT INTO comment(id, text) VALUES ($1, $2)`, [count, req.body.comment]);
  res.redirect('/');
});

app.post('/xss/applyXSS', (req, res) => {
  xss = req.body.xss;
  res.redirect('/');
});

app.post('/data/applyExposure', (req, res) => {
  exposure = req.body.exposure;
  res.redirect('/data')
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});