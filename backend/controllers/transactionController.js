const Transaction = require('../models/Transaction')
const axios = require("axios");
const Customer = require('../models/customer');
const { publish } = require("../config/MQ/publisher.js");
const mongoose = require('mongoose');
// create a transaction
// attach a kyctoken 
// attach a customerid
// call cybrid api
// set status to pending

exports.createTransaction = async(req,res) =>{
    try{
        const{
            amount,
            currency,
            senderPartnerId,
            receiverPartnerId,
            customerId,
            kycReference,
            initiatedBy,
            purpose,
            fees,
            metadata
            
        } = req.body;

        console.log('req.body', req.body);
        console.log('req.user', req.user);

        let customer;
        let customerkyc;


        if (customerId){

            customer = await Customer.findOne({ _id:customerId });
            console.log('customer', customer);
        }else{
            console.log('no customer id');
        }

        if (kycReference){
            customerkyc = await Customer.findOne({ kycReference});
        }

        if (!customer && !customerkyc){
                return res.status(404).json({ message: 'Customer not found' }); 
            }


        const xratereq = await axios.get('http://localhost:5000/mock-cybrid/rates',{params:{from:'USD', to:'USDC'}});
        console.log('xratereq', xratereq);

        const rate = xratereq.data.rate;

        const transaction = new Transaction({
            amount,
            currency: 'USD',
            exchangeRate: rate,
            senderPartnerId:req.user.user_id,
            receiverPartnerId,
            customerId,
            kycReference,
            status: 'pending',
            purpose,
            region: req.user.region
            
            

        })

        await transaction.save();
        console.log('transaction', transaction);
        await publish('audit', 'CREATE_TRANSACTION', req.user._id, {type: 'transaction', id: transaction._id}, 'pending');
        res.status(201).json({ message: 'Transaction created successfully', transaction });




    }catch(error){
        console.error('Error creating transaction:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to create transaction',
            error: error.message 
        });

    }
}

exports.getTransactionByCustomerId = async(req,res) =>{
    try{
        console.log(req.query)
        const {customerId} = req.query;
        const transactions = await Transaction.find({customerId});
        console.log('transactions', transactions);
        if (transactions.length === 0){
            return res.status(404).json({ message: 'No transactions found' });
        }
        if (req.user.region!=='all' && req.user.region!==transactions[0].region){
            return res.status(400).json({ message: 'Transaction not found in this region' });
        }
        res.status(200).json({ transactions });
    }catch(error){
        console.error('Error getting transaction by customer id:', error);
    }
}


// view all transactions

exports.viewAllTransactions = async(req,res) =>{
    try{
        
        let transactions;
        if (req.user.region==='all'){
            transactions = await Transaction.find();
        }
        else{
            transactions = await Transaction.find({region});
        }
        
        
        res.status(200).json({ transactions });
        await publish('audit', 'VIEW_ALL_TRANSACTIONS', req.user._id, {type: 'transaction', id: transactions[0]._id}, 'success');
    }catch(error){
        console.error('Error viewing transactions:', error);
    }
}



// view region transaction

exports.viewRegioalTransaction = async(req,res) =>{
    try{
        const {region} = req.body;
        const transactions = await Transaction.find({region});
        res.status(200).json({ transactions });
        await publish('audit', 'VIEW_REGIONAL_TRANSACTIONS', req.user._id, {type: 'transaction', id: transactions[0]._id}, 'success');
    }catch(error){
        console.error('Error viewing regional transactions:', error);
    }
}

// get transaction by customerid or name

// exports.getTransactionByCustomerId = async(req,res) =>{
//     try{
//         const {customerId, name, kycReference, region} = req.body;

//         const query = {};
//         if (customerId) query.customerId = customerId;
//         if (name) query.name = new RegExp(name, 'i');
//         if (kycReference) query.kycReference = kycReference;

//         const transactions = await Transaction.find(query).limit(1);

//         if (transactions.length === 0){
//             return res.status(404).json({ message: 'No transactions found' });
//         }

//         if (region!=='all' && region!==transactions[0].region){
//             return res.status(400).json({ message: 'Transaction not found in this region' });
//         }

//         res.status(200).json({ transactions });
//         await publish('audit', 'VIEW_TRANSACTION_BY_CUSTOMER_ID', req.user._id, {type: 'transaction', id: transactions[0]._id}, 'success');
//     }catch(error){
//         console.error('Error getting transaction by customer id:', error);
//         return res.status(500).json({ 
//             success: false,
//             message: 'Failed to get transaction by customer id',
//             error: error.message 
//         });
//     }
// }


exports.getTransactionByTransactionId = async(req,res) =>{
    try{
        
        const {transactionId} = req.query;
        console.log('transactionId', transactionId);

        
        if (!mongoose.Types.ObjectId.isValid(transactionId)) {
            console.log("Invalid ID format");
        }

        const transaction = await Transaction.findOne({_id: transactionId});

        console.log(transaction);
        res.status(200).json({ transaction });
    }catch(error){
        console.error('Error getting transaction by transaction id:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to get transaction by transaction id',
            error: error.message 
        });
    }
}



// accept a transaction
// cant accept a transaction without a kyc token

exports.acceptTransaction = async(req,res) =>{
    try{
        const {transactionId} = req.body;
        console.log('transactionId', transactionId);
        const transaction = await Transaction.findById(transactionId);
        console.log('transaction', transaction);
        if (!transaction){
            return res.status(404).json({ message: 'Transaction not found' });
        }
        transaction.status = 'approved';
        await transaction.save();
        await publish('audit', 'ACCEPT_TRANSACTION', req.user._id, {type: 'transaction', id: transaction._id}, 'approved');
        res.status(200).json({ message: 'Transaction accepted' });
    }catch(error){
        console.error('Error accepting transaction:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to accept transaction',
            error: error.message 
        });
    }
}


// reject a transaction

exports.rejectTransaction = async(req,res) =>{

    try{
        const {transactionId} = req.body;
        const transaction = await Transaction.findById(transactionId);
        if (!transaction){
            return res.status(404).json({ message: 'Transaction not found' });
        }
        transaction.status = 'rejected';
        await transaction.save();
        await publish('audit', 'REJECT_TRANSACTION', req.user._id, {type: 'transaction', id: transaction._id}, 'rejected');
        res.status(200).json({ message: 'Transaction rejected' });
    }
    catch(error){
        console.error('Error rejecting transaction:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to reject transaction',
            error: error.message 
        });
    }
}


// set transaction status

exports.setTransactionStatus = async(req,res) =>{
    try{
        const {transactionId, status} = req.body;

        const validStatuses = Transaction.schema.path('status').enumValues;

        if (!validStatuses.includes(status)){
            return res.status(400).json({ message: 'Invalid status' });
        }

        const transaction = await Transaction.findById(transactionId);
        
        if (!transaction){
            return res.status(404).json({ message: 'Transaction not found' });
        }

        transaction.status = 'flagged';
        await transaction.save();
        await publish('audit', 'SET_TRANSACTION_STATUS', req.user._id, {type: 'transaction', id: transaction._id}, status);
        res.status(200).json({ message: 'Transaction status set' });
        
    }catch(error){
        console.error('Error setting transaction status:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to set transaction status',
            error: error.message 
        });
    }
}


// get requests i sent as a sending partner
exports.getRequestsISent = async(req,res) =>{
    try{
        const {partnerId, region} = req.body;
        const transactions = await Transaction.find({senderPartnerId: partnerId, region});
        res.status(200).json({ transactions });
        await publish('audit', 'GET_REQUESTS_I_SENT', req.user._id, {type: 'transaction', id: transactions[0]._id}, 'success');
    }catch(error){
        console.error('Error getting requests i sent:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to get requests i sent',
            error: error.message 
        });
    }
}



// get requests i received as a receiving partner

exports.getRequestsIReceived = async(req,res) =>{
    try{
        const {partnerId, region} = req.body;
        const transactions = await Transaction.find({receiverPartnerId: partnerId, region});
        res.status(200).json({ transactions });
    }catch(error){
        console.error('Error getting requests i received:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to get requests i received',
            error: error.message 
        });
    }
}


// get requests i have approved as a receiving partner








