//initializing
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');
//object which holds the shortUrl and respective long Url as key value pairs
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}
//generates a random 6 character long string
function generateRandomString() {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

app.get('/urls/new', (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  let short = generateRandomString();
  let long = req.body['longURL'];
  urlDatabase[short] = long;
  res.redirect('/urls');
  console.log(urlDatabase);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});
// generates a cookie based off of user inputed username
app.post('/login', (req, res) => {
  let username = req.body['username'];
  res.cookie('username', username);
  //console.log(username);
  res.redirect('/');
});

app.get('/logout', (req, res) => {
 res.clearCookie('username');
 res.redirect('/');
});

app.post('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  let longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;

  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  //console.log(req.cookies['username']);
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  //console.log(templateVars.username);
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id],
                       username: req.cookies["username"]};
  res.render('urls_show', templateVars);
});

app.get('/', (req, res) => {
  res.end('welcome to TinyUrl');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`hey guys, checking in on port: ${PORT}`);
});
