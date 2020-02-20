# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). Uses EJS for server-side HTML rendering. Minimal use of bootstrap components and CSS styling. 

## Final Product

!["URL Index page showing added URL's and their unique ID's"](https://github.com/kguertin/tinyapp/blob/master/docs/URL_index.png?raw=true)

!["Page for creating shortened URL's](https://github.com/kguertin/tinyapp/blob/master/docs/Create_URL.png?raw=true)

!["Page displaying shortene URL with an option to edit where the URL the unique ID points to.](https://github.com/kguertin/tinyapp/blob/master/docs/Display_Short_URL.png?raw=true)

## Dependencies
The following dependencies made this project possible: 

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Register to create a unique user ID. 
- Create as many shortened URL's as you wish. they will be displayed on the URL index page.
- Edit your URL's if you want to assign the unique identifier to another web address. 
-Share your shortened URLS as long as memory persists (resets on server closure).

