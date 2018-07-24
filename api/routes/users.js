const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling get requests to /users'
    });
});

router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Handling creation with post requests to /users'
    });
});

router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    res.status(200).json({
        message: 'Handling get requests to /users with id: ' + id
    });
});

router.patch('/:id', (req, res, next) => {
    const id = req.params.id;
    res.status(200).json({
        message: 'Updated user with id: ' + id
    });
});

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    res.status(200).json({
        message: 'Deleted user with id: ' + id
    });
});

module.exports = router;