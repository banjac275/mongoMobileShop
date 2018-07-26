const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination(req, file, cb){
        cb(null, './uploads/');
    },
    filename(req, file, cb){
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') cb(null, true);
    else cb(null, false);
};

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Product = require('../models/product');

router.get('/', checkAuth, (req, res, next) => {
    Product.find()
    .select('picture name type description _id manufacturer released numInStock')
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

router.post('/', checkAuth, upload.single('picture'), (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        manufacturer: req.body.manufacturer,
        released: req.body.released,
        picture: req.file.path,
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
                picture: result.picture,
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

router.get('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id;
    Product.findById(id)
    .select('picture name type description _id manufacturer released numInStock')
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

router.patch('/:id', checkAuth, (req, res, next) => {
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

router.delete('/:id', checkAuth, (req, res, next) => {
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