// Set UP and Required
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const getUserByEmail = require('./helpers');

// EJS Templates
app.set('view engine', 'ejs');


// Dependencies
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  secret: 'secret'
}));

// Middlewear 

// Utility Functions
const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let encodedString = '';
  for (let i = 0; encodedString.length <= 5; i++) {
    const randomNum = Math.floor(Math.random() * (36 - 0) + 0);
    encodedString += chars[randomNum];
  }
  return encodedString;
};

const urlsForUser = id => {
  let usersURLs = [];
  Object.keys(urlDatabase).forEach(url => {
    if (urlDatabase[url].userID === id) {
      usersURLs.push(urlDatabase[url]);
    }
  });
  return usersURLs;
};

const shortURLForUsers = data => {
  let shortURLs = [];
  Object.keys(data).forEach(key => {
    shortURLs.push(key);
  });
  return shortURLs;
};

// Data
const urlDatabase = {};

const userData = {};

class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}

// Express and Routes

// Root Page
app.get('/', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Register and Login/Logout

app.get('/register', (req, res) => {

  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  let templateVars = { userID: userData[req.session.userID] };
  res.render('registration', templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.password || !req.body.email) {
    res.status(400).send();
  } else if (getUserByEmail(userData, req.body.email)) {
    res.status(400).send();
  } else {
    const randomUserID = generateRandomString();
    const userPassword = req.body.password;
    const hashedPassword = bcrypt.hashSync(userPassword, 10);
    const userObject = new User(randomUserID, req.body.email, hashedPassword);
    userData[randomUserID] = userObject;
    req.session.userID = randomUserID;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {

  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  let templateVars = { userID: userData[req.session.userID] };
  res.render('login', templateVars);
});


app.post('/login', (req, res) => {

  if (!req.body.password || !req.body.email) {
    return res.status(403).send();
  }

  let userEmail = req.body.email;
  let user = getUserByEmail(userData, userEmail);
  let userPassword = user.password;
  let passwordMatch = false;

  if (bcrypt.compareSync(req.body.password, userPassword)) {
    passwordMatch = true;
  }

  if (!getUserByEmail(userData, userEmail)) {
    res.status(403).send();
  } else if (getUserByEmail(userData, userEmail) && !passwordMatch) {
    res.status(403).send();
  } else {
    Object.keys(userData).forEach(user => {
      if (userData[user].email === userEmail) {
        req.session.userID =  userData[user].id;
        res.redirect('/urls');
      }
    });
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// URL Index

app.get('/urls', (req, res) => {
  let userURLs = urlsForUser(req.session.userID);
  let userShortUrls = shortURLForUsers(urlDatabase);
  let templateVars = {
    userID: userData[req.session.userID],
    urls: userURLs,
    shortURL: userShortUrls};
  if (req.session.userID) {
    res.render('urls_index',templateVars);
  } else {
    res.render('urls_index', {userID: undefined});
  }
});

app.post('/urls', (req, res) => {
  
  if (!req.session.userID){
    return res.status(404).send();
  }

  let newID = generateRandomString();
  urlDatabase[newID] = {longURL: req.body.longURL, userID: req.session.userID};
  res.redirect(`/urls/${newID}`);

});

// New URL
app.get('/urls/new', (req, res) => {

  let templateVars = { userID: userData[req.session.userID] };
  if (!req.session.userID) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});


// Show URL Page

app.post('/urls/:shortURL/update', (req, res) => {
  let newURL = req.body.longURL;
  if (urlDatabase[req.params.shortURL].userID === req.session.userID) {
    urlDatabase[req.params.shortURL].longURL = newURL;
  }
  res.redirect('/urls');
});

app.post('/urls/:url/delete', (req, res) => {

  let key = req.params;
  if (urlDatabase[key.url].userID === req.session.userID) {
    delete urlDatabase[key.url];
    res.redirect('/urls');
  } else {
    res.status(404).send();
  }
});

app.get('/urls/:shortURL', (req, res) => {

  if (!Object.keys(urlDatabase).find(k => k === req.params.shortURL)){
    res.status(404).send();
    return;
  }

  let shortURL = req.params.shortURL;
  let templateVars = {
    userID: userData[req.session.userID],
    shortURL: shortURL,
    hasAccess: false,
    longURL: urlDatabase[shortURL].longURL
  };

  if (req.session.userID && req.session.userID === urlDatabase[shortURL].userID) {
    templateVars.hasAccess = true;
  }
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  if (!req.session.userID) {
    return res.status(404).send();
  } else if (urlDatabase[key.url].userID !== req.session.userID){
    return res.status(404).send();
  }
  res.redirect('/urls/:shortURL');
})

// Shareable Link
app.get("/u/:shortURL", (req, res) => {

  if (!Object.keys(urlDatabase).find(k => k === req.params.shortURL)){
    res.status(404).send();
    return;
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Server Listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});