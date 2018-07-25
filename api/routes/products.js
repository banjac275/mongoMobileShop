const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
    .select('name type description _id manufacturer released numInStock')
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
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        manufacturer: req.body.manufacturer,
        released: req.body.released,
        //picture: req.body.picture,
        numInStock: req.body.numInStock
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created new entry for /products',
            createdProduct: {
                _id: result._id,
                name: result.name,
                type: result.type,
                description: result.description,
                manufacturer: result.manufacturer,
                released: result.released,
                //picture: req.body.picture,
                numInStock: result.numInStock 
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
    Product.findById(id)
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
    Product.update({_id: id}, {$set: updateOps })
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
    Product.remove({_id: id}).exec()
    .then(result => {
        res.status(200).json({
            message: 'Product deleted',
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