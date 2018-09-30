
# How to test it

## Setting up a session store

**Warning**: The default server-side session storage, MemoryStore, is purposely not designed for a production environment. It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.

This prototype use Redis as session store but there are many other [session stores](https://github.com/expressjs/session#compatible-session-stores).

* Set password

File: "/etc/redis.conf"

```
requirepass RedisSecret
```

**Warning:** since Redis is pretty fast an outside user can try up to 150k passwords per second against a good box. This means that you should use a very strong password otherwise it will be very easy to break.

* Start Redis

```console
# systemctl start redis
```

* Test your redis server

```console
$ redis-cli

> AUTH azerty
OK

> KEYS *
```

## Download prototype

```console
$ git clone https://github.com/MiscMag101/ExpressJS_ExpressSession.git
```

* Install NPM Packages

```console
$ npm install
```

## Create a self-signed certificat

```console
$ mkdir tls
$ openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout tls/key.pem -out tls/cert.pem
```

For this certificat, a hostname will be required (such as app.example.com).
/!\ This self-signed certificat should be used only for testing purpose.

## Start Application

```console
REDISHOST=localhost \
REDISPORT=6379 \
REDISPASSWORD=RedisSecret \
COOKIESECRET=Secret \
npm start
```

## Test

Open [https://app.example.com:3000](https://app.example.com:3000) and bypass security warning (only for testing purpose).
Then, visit this page: [https://app.example.com:3000/session](https://app.example.com:3000/session)


# How I did it

## Create ExpressJS App

Following instructions from [https://github.com/MiscMag101/ExpressJS_Https](https://github.com/MiscMag101/ExpressJS_Https) (or just fork it).
In this prototype, HTTPS is mandatory to issue Secure Cookie.

## Express-Session

* Install middleware

```console
$ npm install --save  express-session connect-redis
```

* Configure middleware

file: app.js

```javascript
// Loading middleware

const Session = require('express-session');
const RedisStore = require('connect-redis')(Session);

// Session store setup

const SessionStore = new RedisStore({
    host: process.env.REDISHOST,
    port: process.env.REDISPORT,
    pass: process.env.REDISPASSWORD
  });

// Express Session middleware setup

app.use(Session({
    store: SessionStore,
    secret: process.env.COOKIESECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{path: '/', httpOnly: true, secure: true, maxAge: 600000, sameSite: 'strict'}
}));
```

* Edit route to save data in user session

file: "routes/index.js"

```javascript

// Save data in session
router.get('/', function(req, res, next) {
  
  let SessionData = req.session;
  SessionData.foo = "Hello from session !";
  
  res.render('index', { title: 'Express-Session Prototype' });
});


// Read data from session
router.get('/session', function(req, res, next) {
  
  let foo = req.session.foo;
  
  if (typeof req.session.foo !== 'undefined'){
    res.send(`This will print data from session set earlier: ${req.session.foo}`);
  }else{
      res.send("Session doesn't exist.");
  }
  
});
```
