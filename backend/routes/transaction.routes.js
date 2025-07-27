const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const authenticate = require('../middleware/authenticate');
const PERMISSIONS = require('../utils/permissions');
const {getTransactionByCustomerId,getTransactionByTransactionId, createTransaction, viewAllTransactions, viewRegioalTransaction, acceptTransaction, rejectTransaction, setTransactionStatus, getRequestsISent, getRequestsIReceived} = require('../controllers/transactionController');

router.post('/createTransaction', authenticate, authorize([PERMISSIONS.SUBMIT_TRANSACTIONS]), createTransaction);
router.get('/viewAllTransactions', authenticate, authorize([PERMISSIONS.VIEW_ALL_TRANSACTIONS]), viewAllTransactions);
router.get('/viewRegioalTransaction', authenticate, authorize([PERMISSIONS.VIEW_REGIONAL_TRANSACTIONS]), viewRegioalTransaction);
router.get('/getTransactionByCustomerId', authenticate, authorize([PERMISSIONS.VIEW_REGIONAL_TRANSACTIONS]), getTransactionByCustomerId);
router.patch('/acceptTransaction', authenticate, authorize([PERMISSIONS.APPROVE_TRANSACTIONS]), acceptTransaction);
router.patch('/rejectTransaction', authenticate, authorize([PERMISSIONS.REJECT_TRANSACTIONS]), rejectTransaction);
router.patch('/setTransactionStatus', authenticate, authorize([PERMISSIONS.FLAG_TRANSACTIONS]), setTransactionStatus);
router.get('/getRequestsISent', authenticate, authorize([PERMISSIONS.VIEW_REQUESTS_ISENT]), getRequestsISent);
router.get('/getRequestsIReceived', authenticate, authorize([PERMISSIONS.VIEW_REQUESTS_IRECEIVED]), getRequestsIReceived);
router.get('/getTransactionByTransactionId', authenticate, authorize([PERMISSIONS.VIEW_TRANSACTION_BY_TRANSACTION_ID]), getTransactionByTransactionId);

module.exports = router;