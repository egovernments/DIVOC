const express = require('express');
const { tokenValidationMiddleware } = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const router = express.Router();

router.get(`/:transactionId`,[tokenValidationMiddleware],transactionController.getTransaction);

module.exports = router;