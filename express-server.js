//initializing
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: 'urlshy5hdyjtid'
}))
app.set('view engine', 'ejs');

//database for users
const userDatabase = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('userpassword', 10)
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('user2password', 10)
  }
};

app.use(express.static('public'));
//object which holds the shortUrl and respective long Url as key value pairs
const urlDatabase = {
  'b2xVn2': {'longUrl': 'http://www.lighthouselabs.ca', 'userID': 'userRandomID'},
  '9sm5xK': {'longUrl': 'http://www.google.com', 'userID': 'user2RandomID'}
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
  let templateVars = { urls: urlDatabase, user: userDatabase[req.session.user_id]};
  res.render('urls_new', templateVars);
});

app.post('/urls/new', (req, res) => {
  res.redirect('/login');
  //console.log(urlDatabase);
});

app.post('/urls', (req, res) => {
  //console.log(req.body);
  let short = generateRandomString();
  let long = req.body['longURL'];
  let id = req.session.user_id
  urlDatabase[short] = {longUrl: long, userID: id};
  res.redirect('/urls');
  //console.log(urlDatabase);
});

app.get('/urls', (req, res) => {
  let id = req.session.user_id;
  let templateVars = { urls: urlsForUsers(id), user: userDatabase[req.session.user_id], user_id: req.session.user_id};
  res.render('urls_index', templateVars);
  //console.log('id: ',id);
  //console.log('database being passed: ', templateVars.urls);
});

app.post('/urls/:id/delete', (req, res) => {
  let id = req.session.user_id
  let short = req.params.id;
  let comparedId = urlDatabase[short].userID;
  if (id === comparedId){
  delete urlDatabase[short];
  res.redirect('/urls/');
  } else {
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, user: userDatabase[req.session.user_id], user_id: req.session.user_id};
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
  req.session.user_id = match;
  res.redirect('/urls');

  }
});

app.get('/logout', (req, res) => {
 req.session.user_id = null;
 res.redirect('/urls');
});
//registration page
app.get('/register', (req, res) => {
  let templateVars = { urls: urlDatabase, user: userDatabase[req.session.user_id], user_id: req.session.user_id};
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {

  let userEmail = req.body['email'];
  let userPassword = bcrypt.hashSync(req.body['password'], 10);
  let randomID = generateRandomString();
  let obj = {id: randomID, email: userEmail, password: userPassword};
      if (!(userEmail && userPassword) || (checkForExistingEmail(userEmail))){
        res.status(404)
          .send('UNACCEPTABLLEEEE');
      } else {
          userDatabase[randomID] = obj;
  req.session.user_id = randomID;
  console.log(userDatabase);
  res.redirect('/urls');
      }
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: userDatabase[req.session.user_id], user_id: req.session.user_id};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  let short = req.params.id;
  let long = req.body.longURL;
  let id = req.session.user_id
  let comparedId = urlDatabase[short].userID;
  if (id === comparedId){
  urlDatabase[short] = {longUrl: long, userID: id};
  //console.log(urlDatabase);
  res.redirect('/urls');
  } else {
    res.redirect('/urls');
  }
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
//(obj.password === (userDatabase[key].password)
// returns key if password and email match, returns false if they don't
function checkMatchingObj(obj){
  for (key in userDatabase){
    if (bcrypt.compareSync(obj.password, userDatabase[key].password) && obj.email === userDatabase[key].email){
      return key;
    }
  }
  return false;
}
// returns object containing shortUrl and longUrl from urlDatabase which is relavent to logged in user
function urlsForUsers(id){
    let result = {};
  for (key in urlDatabase){
    if (id === urlDatabase[key].userID){
      let long = urlDatabase[key];
      result[key] = long;
    }
  } return result;
}

//console.log('output of urlsForUsers: ', urlsForUsers('userRandomID'));