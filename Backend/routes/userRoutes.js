const express = require('express');
const router = express.Router();
const { getUsers, createUser } = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users
router.get('/', getUsers);

// @route   POST /api/users
// @desc    Create a new user
router.post('/', createUser);

module.exports = router;
