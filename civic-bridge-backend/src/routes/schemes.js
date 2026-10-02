const express = require('express');
const schemeController = require('../controllers/schemeController');

const router = express.Router();

router.get('/', schemeController.getAllSchemes);
router.get('/:schemeId', schemeController.getSchemeDetails);

module.exports = router;
