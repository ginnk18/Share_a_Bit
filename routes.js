const path = require('path');
const {Router} = require('express');
const multer = require('multer');
const upload = multer({dest: path.join(__dirname, 'public', 'uploads')})

//Define Router Instances 
const root = Router()
const products = Router()

//Root Routes





module.exports = root;