const path = require('path');
const {Router} = require('express');
const multer = require('multer');
const upload = multer({dest: path.join(__dirname, 'public', 'uploads')})

//Define Router Instances 
const root = Router()



//Root Routes
root.get('/', (req, res, next) => {
	res.json({message: 'Testing API'})
})




module.exports = root;