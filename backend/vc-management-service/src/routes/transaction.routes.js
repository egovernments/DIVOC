const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const router = express.Router();

router.get(`/:transactionId`,authMiddleware,transactionController.getTransaction);

module.exports = router;