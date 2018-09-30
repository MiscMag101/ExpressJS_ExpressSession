var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  
  let SessionData = req.session;
  SessionData.foo = "Hello from session !";
  
  res.render('index', { title: 'Express-Session Prototype' });
});


router.get('/session', function(req, res, next) {
  
  let foo = req.session.foo;
  
  if (typeof req.session.foo !== 'undefined'){
    res.send(`This will print data from session set earlier: ${req.session.foo}`);
  }else{
      res.send("Session doesn't exist.");
  }
  
});

module.exports = router;
