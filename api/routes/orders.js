const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling get requests to /orders'
    });
});

router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Handling creation with post requests to /orders'
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    res.status(200).json({
        message: 'Handling get requests to /orders with id: ' + id
    });
});

router.patch('/:id', (req, res, next) => {
    const id = req.params.id;
    res.status(200).json({
        message: 'Updated order with id: ' + id
    });
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    res.status(200).json({
        message: 'Deleted order with id: ' + id
    });
});

module.exports = router;