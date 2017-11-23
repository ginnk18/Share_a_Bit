const path = require('path');
const {Router} = require('express');
const bodyParser = require("body-parser");
const multer = require('multer');
const upload = multer({dest: path.join(__dirname, 'public', 'uploads')})
const _ = require("lodash");

//Passport and JWT Token shit
const jwt = require('jsonwebtoken');

const passport = require("passport");
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

//Define Router Instances 
const root = Router()

root.use(passport.initialize());

//Fake Users for testing:
const users = [
  {
    id: 1,
    name: 'ginny',
    password: 'missioncontrol'
  },
  {
    id: 2,
    name: 'bestesttest',
    password: 'test'
  }
];

///////////// Testing Passport JWT in tutorial (see URL below)
let jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET_KEY;

const authenticate = (req, res, next) => {
	const token = req.headers.authorization
	try {
		// decode it
		const decoded = jwt.verify(token, process.env.SECRET_KEY)
		// try to find a user with that id (this would usually be a db call but for now stub it)
		const user = users[_.findIndex(users, {id: decoded.id})];
		if (user) {
			req.currentUser = user
			// res.locals.currentUser = user
			next()	
		} else {
			res.status(400).json({message: "your user doesn't exist?"})
		}
	} catch(err) {
		res.status(400).json({message:"Sorry not a token"});
	}
}

let user;

let strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  user = users[_.findIndex(users, {id: jwt_payload.id})];
  if (user) {
    return next(null, user);
  } else {
    return next(null, false);
  }
});

passport.use(strategy);
///////////////////////////////////////////////////////////////// from github
// var JwtStrategy = require('passport-jwt').Strategy,
//     ExtractJwt = require('passport-jwt').ExtractJwt;
// var opts = {}
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = 'secret';
// opts.issuer = 'accounts.examplesoft.com';
// opts.audience = 'yoursite.net';
// passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
// 	let user = users[_.findIndex(users, {id: jwt_payload.id})];
//     // User.findOne({id: jwt_payload.sub}, function(err, user) {
//         if (err) {
//             return done(err, false);
//         }
//         if (user) {
//             return done(null, user);
//         } else {
//             return done(null, false);
//             // or you could create a new account
//         }
//     // });
// }));
////////////////


//Root Routes
root.get('/', (req, res, next) => {
	res.json({message: 'Testing API'})
})


//From JWT and Express tutorial 
//(https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/)
root.post("/login", function(req, res) {
	// return res.json({request: req.body})
	let name;
	let password;

  if(req.body.name && req.body.password){
  	// return res.json({message: 'inside if statement'})
    name = req.body.name;
    password = req.body.password;
  }
  // usually this would be a database call:
  const user = users[_.findIndex(users, {name: name})];
  if( ! user ){
    res.status(401).json({message:"no such user found"});
  }

  if(user.password === req.body.password) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    const payload = {id: user.id};
    const token = jwt.sign(payload, process.env.SECRET_KEY);
    res.json({message: "ok", token: token});
  } else {
    res.status(401).json({message:"passwords did not match"});
  }
});
//////////////////////////

root.get("/secret", authenticate, function(req, res){
	// console.log(req.headers)
  const {currentUser} = req
  res.json(`Success! You can not see this without a token ${currentUser.name}`);
});

// root.get("/secret", passport.authenticate('jwt', { session: false }), function(req, res){
// 	// console.log(req.headers)
//   res.json("Success! You can not see this without a token");
// });


module.exports = root;