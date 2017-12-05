const path = require('path');
const {Router} = require('express');
const OrganizationsController = require('./controllers/organizations');
const UsersController = require('./controllers/users');
const FavouritesController = require('./controllers/favourites');
const StripeController = require('./controllers/stripe');
const UpdatesController = require('./controllers/updates');
const CampaignsController = require('./controllers/campaigns');
const MessagesController = require('./controllers/messages');
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
const favourites = Router({mergeParams: true})
const stripe = Router()
const updates = Router()
const campaigns = Router()
const messages = Router()

root.use(passport.initialize());


///////// Authenticating Logged In users with JWT token from request 
//////// *** use this before routes that require an authenticated user
async function authenticate(req, res, next) {
	const token = req.headers.authorization
	try {
		// decode it
		const decoded = jwt.verify(token, process.env.SECRET_KEY)
		// const user = users[_.findIndex(users, {id: decoded.id})];
    const user = await kx
                        .first()
                        .from('users')
                        .where({id: decoded.id})

		if (user) {
			req.currentUser = user
      
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

///////////////// Authorize Favourites /////////////////////////////////////
///donors can only favourite an organization once

async function authorizeFavourites(req, res, next) {
    const {organizationId} = req.params
    const {currentDonor} = req;

    const favourite = await kx
                              .first()
                              .from('favourites')
                              .where({organizationId: organizationId, donorId: currentDonor.id})

    if(favourite === undefined) {
      next()
    } else {
      res.status(400).json({error: 'You already favourited this organization!'})
    }
}

/////////////////////////////////////////////////////////////////////////////

///////////// LOGGING IN THROUGH API /////////////////////////////////////////
//From JWT and Express tutorial 
//(https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/)
root.post("/login", async function(req, res) {
  let email;
  let password;

  if(req.body.email && req.body.password){
    email = req.body.email;
    password = req.body.password;
  }

      const user = await kx
                        .first()
                        .from('users')
                        .where({email: email})
  console.log(user);

  if( ! user ){
    res.status(401).json({message:"no such user found"});
  }

  if(await bcrypt.compare(password, user.passwordDigest)) {
    
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


///////////////////   Organization Routes       ////////////////////////////
root.use('/organizations', organizations)

// index action
organizations.get('/', authenticate, OrganizationsController.index)

//show action
organizations.get('/:id', authenticate, OrganizationsController.show)

//send donation
organizations.post('/:id/donate', authenticate, StripeController.orgDonation)

/////////////////////////////////////////////////////////////////////////////

/////////////////////////// Favourites Routes /////////////////////////////////
organizations.use('/:organizationId/favourites', favourites)

//create a favourite:
favourites.post('/', authenticate, authorizeFavourites, FavouritesController.create)

//destroy action:
favourites.delete('/:id', authenticate, FavouritesController.destroy)

////////////////////////////////////////////////////////////////////////////////

///////////////////////       USERS ROUTES         /////////////////////////////
root.use('/users', users)

// show action for donors
users.get('/donor/:id', UsersController.showDonor)

//show action for organizations
users.get('/organization/:id', UsersController.showOrg)

///////////////////////////////////////////////////////////////////////////////

/////////////////////////// STRIPE ROUTES  ////////////////////////////////////
root.use('/stripe', stripe)

stripe.post('/', authenticate, StripeController.create)


///////////////////////////////////////////////////////////////////////////////

///////////////////////////// UPDATES ROUTES //////////////////////////////////
root.use('/updates', updates)

//index action
updates.get('/', authenticate, UpdatesController.index)

//show action
updates.get('/:id', authenticate, UpdatesController.show)

//create an update
updates.post('/', authenticate, UpdatesController.create)


///////////////////////////////////////////////////////////////////////////////

////////////////////////// CAMPAIGNS ROUTES  //////////////////////////////////
root.use('/campaigns', campaigns)

//show action
campaigns.get('/:id', authenticate, CampaignsController.show)

//create action
campaigns.post('/', authenticate, CampaignsController.create)

//send donation
campaigns.post('/:id/donate/:orgId', authenticate, StripeController.campaignDonation)
///////////////////////////////////////////////////////////////////////////////

////////////////////////////// MESSAGES ROUTES ///////////////////////////////////
root.use('/messages', messages)

messages.post('/', authenticate, MessagesController.create)
//////////////////////////////////////////////////////////////////////////////////

module.exports = root;