const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.post('/profile', authenticateUser, studentController.createOrUpdateProfile);
router.get('/profile', authenticateUser, studentController.getProfile);

module.exports = router;
