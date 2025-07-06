const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const captainController = require('../controllers/captain.controller');
const {
  checkExpressValidationErrors,
} = require('../utils/checkExpressValidationErrors');
const authMiddleware = require('../middlewares/auth.middleware');
router.post(
  '/register',
  [
    body('fullname.firstname')
      .isLength({ min: 3 })
      .withMessage('First name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('vehicle.color')
      .isLength({ min: 3 })
      .withMessage('Vehicle color must be at least 3 characters long'),
    body('vehicle.plate')
      .isLength({ min: 3 })
      .withMessage('Vehicle plate must be at least 3 characters long'),
    body('vehicle.capacity')
      .isInt({ gt: 0 })
      .withMessage('Vehicle capacity must be greater than 0'),
    body('vehicle.type').notEmpty().withMessage('Vehicle type is required'),
  ],
  checkExpressValidationErrors,
  captainController.registerCaptain
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  checkExpressValidationErrors,
  captainController.loginCaptain
);

router.get(
  '/profile',
  authMiddleware.authCaptain,
  captainController.getCaptainProfile
);

router.get(
  '/logout',
  authMiddleware.authCaptain,
  captainController.logoutCaptain
);
module.exports = router;
