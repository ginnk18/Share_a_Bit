const path = require('path');
const {Router} = require('express');
const OrganizationsController = require('./controllers/organizations');
const UsersController = require('./controllers/users');
const bodyParser = require("body-parser");
const multer = require('multer');
const upload = multer({dest: path.join(__dirname, 'public', 'uploads')})
const _ = require("lodash");
const kx = require('./db/connection');
const bcrypt = require('bcrypt')

//Passport and JWT Token shit
const jwt = require('jsonwebtoken');

const passport = require("passport");
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

//Define Router Instances 
const root = Router()
const organizations = Router()
const users = Router()

root.use(passport.initialize());


///////// Authenticating Logged In users with JWT token from request 
//////// *** use this before routes that require an authenticated user
async function authenticate(req, res, next) {
	const token = req.headers.authorization
	try {
		// decode it
		const decoded = jwt.verify(token, process.env.SECRET_KEY)
		// try to find a user with that id (this would usually be a db call but for now stub it)
		// const user = users[_.findIndex(users, {id: decoded.id})];
    const user = await kx
                        .first()
                        .from('users')
                        .where({id: decoded.id})

		if (user) {
			req.currentUser = user
			// res.locals.currentUser = user
      if(user.type === 'donor') {
        const donor = await kx
                              .first()
                              .from('donors')
                              .where({userId: decoded.id})
        req.currentDonor = donor
      } else if(user.type === 'organization') {
        const organization = await kx
                                    .first()
                                    .from('organizations')
                                    .where({userId: decoded.id})

        req.currentOrg = organization
      }
			next()	
		} else {
			res.status(400).json({message: "your user doesn't exist?"})
		}
	} catch(err) {
		res.status(400).json({message:"Sorry not a token"});
	}
}
////////////////////////////////////////////////////////////////////////

///////////// LOGGING IN THROUGH API /////////////////////////////////////////
//From JWT and Express tutorial 
//(https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/)
root.post("/login", async function(req, res) {
  // return res.json({request: req.body})
  let email;
  let password;

  if(req.body.email && req.body.password){
    // return res.json({message: 'inside if statement'})
    email = req.body.email;
    password = req.body.password;
  }
  // usually this would be a database call:
  // const user = users[_.findIndex(users, {name: name})];
      const user = await kx
                        .first()
                        .from('users')
                        .where({email: email})
  console.log(user);

  if( ! user ){
    res.status(401).json({message:"no such user found"});
  }

  if(await bcrypt.compare(password, user.passwordDigest)) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    
    let payload;

    if(user.type === 'donor') {
      const donor = await kx
                            .first()
                            .from('donors')
                            .where({userId: user.id})

      payload = {id: user.id, email: user.email, type: user.type, firstName: donor.firstName, lastName: donor.lastName};
                            
    } else if(user.type === 'organization') {
      const organization = await kx
                                  .first()
                                  .from('organizations')
                                  .where({userId: user.id})

      payload = {id: user.id, email: user.email, type: user.type, name: organization.name}
    }

    const token = jwt.sign(payload, process.env.SECRET_KEY);
    res.json({jwt: token});
  } else {
    res.status(401).json({message:"passwords did not match"});
  }
});
////////////////////////////////////////////////////////////////////////////////////


////// Testing Successsful Request with JWT Token
root.get("/secret", authenticate, function(req, res){
  // console.log(req.headers)
  const {currentUser, currentDonor} = req
  res.json(`Success! You can not see this without a token ${currentDonor.firstName}`);
});
////////////////////


//Testing Root Routes
root.get('/', (req, res, next) => {
	res.json({message: 'Testing API'})
})


///////////////////   Organization Routes       ////////////////////////////
root.use('/organizations', organizations)

// index action
organizations.get('/', OrganizationsController.index)

//show action
organizations.get('/:id', OrganizationsController.show)

/////////////////////////////////////////////////////////////////////////////

///////////////////////       USERS ROUTES         /////////////////////////////
root.use('/users', users)

// show action
users.get('/:id', UsersController.show)

///////////////////////////////////////////////////////////////////////////////

module.exports = root;