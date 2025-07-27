const express = require('express');
const router = express.Router();
const {createCustomer, findCustomer, updateCustomer, approveCustomer,getAllCustomers } = require('../controllers/customerController');
const authorize = require('../middleware/authorize');
const authenticate = require('../middleware/authenticate');
const PERMISSIONS = require('../utils/permissions');


router.post('/createcustomer',authenticate, authorize([PERMISSIONS.CREATE_CUSTOMERS]), createCustomer);
router.get('/getcustomer', authenticate, findCustomer);
router.patch('/approvecustomer', authenticate, authorize([PERMISSIONS.APPROVE_CUSTOMERS]), approveCustomer);
router.get('/getallcustomers', authenticate, authorize([PERMISSIONS.GET_REGIONAL_CUSTOMERS]), getAllCustomers);

module.exports = router;