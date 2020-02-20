// Set UP and Required
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const getUserByEmail = require('./helpers')
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

// Utility Functions
const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let encodedString = '';
  for (let i = 0; encodedString.length <= 5; i++){
    randomNum = Math.floor(Math.random() * (36 - 0) + 0);
    encodedString += chars[randomNum];
  }
  return encodedString;
}

const urlsForUser = id => {
  let usersURLs = [];
  Object.keys(urlDatabase).forEach(url => {
    if (urlDatabase[url].userID === id){
      usersURLs.push(urlDatabase[url]);
    }
  });
  return usersURLs
}

const shortURLForUsers = data => {
  let shortURLs = [];
  Object.keys(data).forEach(key => {
    shortURLs.push(key);
  })
  return shortURLs;
}

// Data
const urlDatabase = {};

const userData = {};

class User {
  constructor(id, email, password){
    this.id = id; 
    this.email = email;
    this.password = password;
  }
}

// Express Stuff

app.get('/', (req, res) => {
  if (req.session.user_id){
    res.redirect('/urls');
  } else {
    res.redirect('/login')
  }
})

app.get('/urls', (req, res) => {
  let userURLs = urlsForUser(req.session.user_id)
  let userShortUrls = shortURLForUsers(urlDatabase)
  let templateVars = { 
    userID: userData[req.session.user_id],
    urls: userURLs, 
    shortURL: userShortUrls};
  if (req.session.user_id){
    res.render('urls_index',templateVars);
  } else {
    res.render('urls_index', {userID: undefined});
  }
});

app.get('/urls/new', (req, res) => {
  let templateVars = { userID: userData[req.session.user_id] }
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  let templateVars = { userID: userData[req.session.user_id] };
  res.render('registration', templateVars);
})

app.get('/login', (req, res) => {
  let templateVars = { userID: userData[req.session.user_id] };
  res.render('login', templateVars)
})

app.post('/login', (req, res) => {
  let userEmail = req.body.email;
  let user = getUserByEmail(userData, userEmail)
  let userPassword = user.password;
  let passwordMatch = false;

  if (bcrypt.compareSync(req.body.password, userPassword)) {
    passwordMatch = true;
  }

  if (!getUserByEmail(userData, userEmail)){
    res.status(403).send();
  } else if (getUserByEmail(userData, userEmail) && !passwordMatch){
    res.status(403).send();
  } else {
    Object.keys(userData).forEach(user => {
      if (userData[user].email === userEmail) {
        req.session.user_id =  userData[user].id;
        res.redirect('/urls');
      }
    })
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls')
})

app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    let newID = generateRandomString();
    urlDatabase[newID] = {longURL: req.body.longURL, userID: req.session.user_id};
    res.redirect(`/urls/${newID}`);
  } else {
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  let newURL = req.body.longURL;
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id){
    urlDatabase[req.params.shortURL].longURL = newURL;
  }
  res.redirect('/urls');
});

app.post('/urls/:url/delete', (req, res) => {
  let key = req.params;
  if (urlDatabase[key.url].userID === req.session.user_id){
    delete urlDatabase[key.url];
  }
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (!req.body.password || !req.body.email) {
    res.status(400).send();
  } else if (getUserByEmail(userData, req.body.email)) {
    res.status(400).send();
  } else {
    const randomUserID = generateRandomString();
    const userPassword = req.body.password;
    const hashedPassword = bcrypt.hashSync(userPassword, 10)
    const userObject = new User (randomUserID, req.body.email, hashedPassword);
    userData[randomUserID] = userObject;
    req.session.user_id = randomUserID;
    res.redirect('/urls');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { 
    userID: userData[req.session.user_id],
    shortURL: shortURL,
    hasAccess: false,
    longURL: urlDatabase[shortURL].longURL
  };
    if (req.session.user_id && req.session.user_id === urlDatabase[shortURL].userID){
      templateVars.hasAccess = true;
    }
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Server Listen

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});