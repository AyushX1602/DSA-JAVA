const express = require('express');
//
const { body } = require('express-validator');
const { register, login, refresh, logout } = require('../controller/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must be at least 6 chars').isLength({ min: 6 })
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password is required').notEmpty()
  ],
  login
);

router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
