//initializing
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

//database for users
const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//object which holds the shortUrl and respective long Url as key value pairs
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

for (key in userDatabase){}
//generates a random 6 character long string
function generateRandomString() {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

app.get('/urls/new', (req, res) => {
  let templateVars = { urls: urlDatabase, user: userDatabase[req.cookies["user_id"]]};
  res.render('urls_new', templateVars);
});

app.post('/urls/new', (req, res) => {
  res.redirect('/login');
});

app.post('/urls', (req, res) => {
  //console.log(req.body);
  let short = generateRandomString();
  let long = req.body['longURL'];
  urlDatabase[short] = long;
  res.redirect('/urls');
  //console.log(urlDatabase);
});

app.get('/urls', (req, res) => {

  let templateVars = { urls: urlDatabase, user: userDatabase[req.cookies["user_id"]], user_id: req.cookies["user_id"]};
  res.render('urls_index', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});

app.get('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, user: userDatabase[req.cookies["user_id"]], user_id: req.cookies["user_id"]};
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let obj = {'email': userEmail, 'password': userPassword};
  if (!(checkForExistingEmail(userEmail))) {
    res.status(403)
          .send('email not found');
          console.log(obj);
  } else if (!(match = checkMatchingObj(obj))){
    res.status(403)

        .send('passwords don\'t match');
  } else {
  res.cookie('user_id', match)
  res.redirect('/');

  }
});

app.get('/logout', (req, res) => {
 res.clearCookie('user_id');
 res.redirect('/');
});
//registration page
app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase, user: userDatabase[req.cookies['user_id']], user_id: req.cookies['user_id']};
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {

  let userEmail = req.body['email'];
  let userPassword = req.body['password'];
  let randomID = generateRandomString();
  let obj = {id: randomID, email: userEmail, password: userPassword};
      if (!(userEmail && userPassword) || (checkForExistingEmail(userEmail))){
        res.status(404)
          .send('UNACCEPTABLLEEEE');
      } else {
          userDatabase[randomID] = obj;
  res.cookie('user_id', randomID);
  console.log(userDatabase);
  res.redirect('/');
      }
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: userDatabase[req.cookies['user_id']], user_id: req.cookies['user_id']};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  let shortUrl = req.params.id;
  let longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;

  res.redirect('/urls');
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

// returns true if user email matches existing email
function checkForExistingEmail(email){
  for (key in userDatabase){
    if (userDatabase[key].email === email) {
      return true;
    }
  }
  return false;
}
// returns key if password and email match, returns false if they don't
function checkMatchingObj(obj){
  for (key in userDatabase){
    if (obj.password === userDatabase[key].password && obj.email === userDatabase[key].email){
      return key;
    }
  }
  return false;
}
