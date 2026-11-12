const express = require('express');
const path = require('path')
const app = express();
app.use(express.static(__dirname + '/public'));
require('dotenv').config()

const hostname  = process.env.HOSTNAME || 'localhost';
const port      = process.env.PORT || '3000';

app.set('views', './public');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index')
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});