<!-- README.md file for the project written in the markdown language. Details how to start the application. -->

# Final Year Undergraduate Project

<center>Interactive visualisation dashboard system, used for analysis on youth service budget funding and knife crime in London.</center>

---

- Submitted for the partial fulfilment of BSc Business w/ Information Technology at the University of Greenwich.

- Hosted On: **Heroku.**
- Engine: Powered by the **NodeJS Runtime.**
- Login System: **PassportJS | MySQL**
- Framework: **ExpressJS**
- UI Framework: **Bootstrap@4**
- Dashboard: **Tableau**


## How to Use

- Install [npm](https://www.npmjs.com/get-npm) | This is the default NodeJS package manager. It is required to install project dependencies.
- Install [NodeJS](https://nodejs.org/en/download/) | JavaScript runtime environment for Web Development
- Clone repository to local machine using `git clone https://github.com/WallaceDevelopment/FinalYearProject`
- Run `npm install` | This installs the system dependencies, found in package.json.
- `cd` to the directory and run with `npm start` or `nodemon start`

---

## Dependencies

- The Package.JSON file shows all module dependencies for the system.

```

{
  "name": "wallacefyp",
  "version": "0.0.0",
  "private": true,
  "description": "Dashboard Application for Final Year Project, Student No. 000938568",
  "main": "./bin/www",
  "scripts": {
    "start": "node ./bin/www"
  },
  "dependencies": {
    "body-parser": "~1.16.0",
    "connect-flash": "^0.1.1",
    "cookie-parser": "^1.4.5",
    "crypto": "^1.0.1",
    "debug": "^2.6.9",
    "express": "~4.14.1",
    "express-session": "^1.17.0",
    "express-validator": "^6.4.0",
    "morgan": "~1.7.0",
    "mysql": "^2.18.1",
    "nodemailer": "^6.4.6",
    "passport": "^0.4.1",
    "passport-local": "^1.0.0",
    "path": "^0.12.7",
    "pm2": "^4.2.3",
    "pug": "^2.0.4",
    "serve-favicon": "~2.3.2"
  }
}
```
## Acknowledgements

- Skeleton login code provided by [Programmerblog.net](http://programmerblog.net/nodejs-passport-login-mysql/)





