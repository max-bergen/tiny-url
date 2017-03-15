const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
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
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  let short = generateRandomString();

  let long = req.body['longURL'];
  urlDatabase[short] = long;
  res.redirect('/urls/');
  console.log(urlDatabase);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});

app.post('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  let longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;

  res.redirect('/urls/');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id]  };
  res.render('urls_show', templateVars);
});

app.get('/', (req, res) => {
  res.end('welcome to TinyUrl');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello<b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`hey guys, checking in on port: ${PORT}`);
});
