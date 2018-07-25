const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
    .select('productId userId quantity _id')
    .populate('productId userId')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            productId: product._id,
            userId: req.body.userId,
            quantity: req.body.quantity
        });
        return order.save();
    })    
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created new entry for /orders',
            createdProduct: {
                _id: result._id,
                productId: result.productId,
                userId: result.userId,
                quantity: result.quantity
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    Order.findById(id)
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if (doc) res.status(200).json(doc);
        else res.status(400).json({
            message: 'No entry found for entered ID'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.patch('/:id', (req, res, next) => {
    const id = req.params.id;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Order.update({_id: id}, {$set: updateOps })
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Order.remove({_id: id}).exec()
    .then(result => {
        res.status(200).json({
            message: 'Order deleted',
            result: result
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;