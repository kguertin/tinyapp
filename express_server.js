// Set UP and Required
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// EJS Templates
app.set('view engine', 'ejs');


// Dependencies and Utility
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let encodedString = '';
  for (let i = 0; encodedString.length <= 5; i++){
    randomNum = Math.floor(Math.random() * (36 - 0) + 0);
    encodedString += chars[randomNum];
  }
  return encodedString;
}

// Data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userData = {
}

class User {
  constructor(id, email, password){
    this.id = id; 
    this.email = email;
    this.password = password;
  }
}

// Express Stuff

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render('urls_index',templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render('registration', templateVars);
})

app.post('/login', (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

app.post('/urls', (req, res) => {
  let newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
});

app.post('/urls/:shortURL/update', (req, res) => {
  let newURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect('/urls');
});

app.post('/urls/:url/delete', (req, res) => {
  let key = req.params;
  delete urlDatabase[key.url];
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const randomUserID = generateRandomString();
  const userObject = new User (randomUserID, req.body.email, req.body.password);
  userData[randomUserID] = userObject;
  res.cookie('user_id', randomUserID);
  console.log(userData);
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { 
    username: req.cookies["username"],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]};
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/hello', (req, res) => {
  let templateVars = { greeting: 'Hello World!'};
  res.render('hello_world', templateVars);
});

// Server Listen

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});