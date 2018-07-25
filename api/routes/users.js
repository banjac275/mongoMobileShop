const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user');
const Order = require('../models/order');

router.get('/', (req, res, next) => {
    User.find()
    .select('orders firstName lastName email accType password _id')
    .populate('orders')
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
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        accType: req.body.accType,
        password: req.body.password,
        //picture: req.body.picture
    });
    user.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created new entry for /users',
            createdProduct: {
                _id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                accType: result.accType,
                password: result.password
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

router.put('/:id/newOrder', (req, res, next) => {
    const id = req.params.id;
    User.update({_id: id}, { $push: { "orders": mongoose.Types.ObjectId(req.body.orderId) } })
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

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    User.findById(id)
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
    User.update({_id: id}, {$set: updateOps })
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
    User.remove({_id: id}).exec()
    .then(result => {
        res.status(200).json({
            message: 'User deleted',
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

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    User.remove({_id: id}).exec()
    .then(result => {
        res.status(200).json({
            message: 'User deleted',
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

router.delete('/:id/removeOrder', (req, res, next) => {
    const id = req.params.id;
    User.update({_id: id}, { $pull: { "orders": mongoose.Types.ObjectId(req.body.orderId) } })
    .exec()
    .then(result => {
        return Order.remove({_id: req.body.orderId}).exec()
    })
    .then(result => {
        console.log(result);
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