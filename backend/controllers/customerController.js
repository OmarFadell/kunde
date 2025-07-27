const Customer = require('../models/customer');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ROLES } = require("../utils/roles.js");
const uuidv4 = require('uuid').v4;
const { publish } = require("../config/MQ/publisher.js");

exports.createCustomer = async (req, res) => {
    try{
        const {
            name,
            proofOfId,
            proofOfAddress,
            sourceOfFunds,
            livenessCheckPassed,
            region
        } = req.body;

        const nextId = uuidv4();
        
        

        const customer = new Customer({
            name,
            customerId: nextId,
            proofOfId,
            proofOfAddress,
            sourceOfFunds,
            livenessCheckPassed: livenessCheckPassed || false,
            kycReference: '',
            region
        });

        await customer.save();
        await publish('audit', 'CREATE_CUSTOMER', req.user._id, {type: 'customer', id: customer._id}, 'success');

        res.status(201).json({
            message: "Customer created successfully",
            customer: {
                id: customer._id,
                name: customer.name,
                customerId: customer.customerId,
                proofOfId: customer.proofOfId,
                proofOfAddress: customer.proofOfAddress,
                sourceOfFunds: customer.sourceOfFunds,
                livenessCheckPassed: customer.livenessCheckPassed,
            },
        });
    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }


};


// search for customer

exports.findCustomer = async (req, res) => {
    
    try{
        console.log('here');
        const {name, customerId, region, kycReference} = req.query;

        const query = {};
        if (name) query.name = new RegExp(name, 'i'); // case-insensitive search
        if (customerId) query._id = customerId; // ensure number
        if (kycReference) query.kycReference = kycReference;
        
        const searchregion = region ? region : req.user.region;

        const customers = await Customer.find(query);

        if (searchregion!=='all' && searchregion!==customers[0].region){
            return res.status(400).json({ message: 'Customer not found in this region' });
        }

        if (customers.length === 0) {
            return res.status(404).json({ message: "No customers found" });
        }

        res.status(200).json({
            message: "Customers found",
            customers: customers.map(customer => ({
                id: customer._id,
                name: customer.name,
                customerId: customer.customerId,
                proofOfId: customer.proofOfId,
                proofOfAddress: customer.proofOfAddress,
                sourceOfFunds: customer.sourceOfFunds,
                livenessCheckPassed: customer.livenessCheckPassed,
                kycReference: customer.kycReference,
                region: customer.region,
            })),
        });

        await publish('audit', 'FIND_CUSTOMER', req.user._id, {type: 'customer', id: customers[0]._id}, 'success');


    } catch (error) {
        console.error("Error finding customer:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }

}

exports.getAllCustomers = async (req, res) => {
    try{
        const customers = await Customer.find();

        if (req.user.region!=='all'){
            customers = customers.filter(customer => customer.region === req.user.region);
        }
        
        res.status(200).json({
            message: "Customers found",
            customers: customers.map(customer => ({
                id: customer._id,
                name: customer.name,
                customerId: customer.customerId,
                proofOfId: customer.proofOfId,
                proofOfAddress: customer.proofOfAddress,
                sourceOfFunds: customer.sourceOfFunds,
                livenessCheckPassed: customer.livenessCheckPassed,
                kycReference: customer.kycReference,
                region: customer.region,
            })),
        });

        await publish('audit', 'GET_ALL_CUSTOMERS', req.user._id, {type: 'customer', id: customers[0]._id}, 'success');

    } catch (error) {
        console.error("Error getting all customers:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


exports.approveCustomer = async (req, res) => {
    try{
        const {customerId, region} = req.body;

        if (region!=='all' && region!==customers[0].region){
            return res.status(400).json({ message: 'Customer not found in this region' });
        }

        if (!customerId) {
            return res.status(400).json({ message: "Customer ID is required" });
        }
        const customer = await Customer.findOne({ customerId: parseInt(customerId) });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const kyctoken = uuidv4();
        customer.kycReference = kyctoken;
        customer.livenessCheckPassed = true;
        
        await customer.save();

        res.status(200).json({
            message: "Customer approved successfully",
            customer: {
                id: customer._id,
                name: customer.name,
                customerId: customer.customerId,
                proofOfId: customer.proofOfId,
                proofOfAddress: customer.proofOfAddress,
                sourceOfFunds: customer.sourceOfFunds,
                livenessCheckPassed: customer.livenessCheckPassed,
                kycReference: customer.kycReference,
            },
        });

        await publish('audit', 'APPROVE_CUSTOMER', req.user._id, {type: 'customer', id: customer._id}, 'success');

    } catch (error) {
        console.error("Error approving customer:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}



// approve and give kyc reference