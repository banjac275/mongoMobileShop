const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');

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

const User = require('../models/user');
const Order = require('../models/order');

router.get('/', checkAuth, (req, res, next) => {
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

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email}).exec()
    .then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: 'Mail exists'
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        accType: req.body.accType,
                        password: hash
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
                }
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/signin', (req, res, next) => {
    User.findOne({ email: req.body.email}).exec()
    .then(user => {
        if(user.length < 1) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        bcrypt.compare(req.body.password, user.password, (err, resp) => {
            if (err) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            if(resp) {
                const token = jwt.sign({
                    email: user.email,
                    id: user._id
                }, process.env.JWT_KEY, {
                    expiresIn: "1h"
                });
                return res.status(200).json({
                    message: 'Auth successful',
                    token: token,
                    userName: user.firstName,
                    userType: user.accType,
                    id: user._id
                });
            }
            return res.status(401).json({
                message: 'Auth failed'
            });
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.put('/:id/newOrder', checkAuth, (req, res, next) => {
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

router.get('/:id', checkAuth, (req, res, next) => {
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

router.patch('/:id', checkAuth, (req, res, next) => {
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

router.patch('/:id/addPicture', checkAuth, upload.single('picture'), (req, res, next) => {
    const id = req.params.id;
    User.update({_id: id}, {$set: {"picture": req.file.path } })
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

router.delete('/:id/removeOrder', checkAuth, (req, res, next) => {
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