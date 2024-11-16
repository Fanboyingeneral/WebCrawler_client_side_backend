// client_backend/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/register', sessionController.registerSession);

module.exports = router;
