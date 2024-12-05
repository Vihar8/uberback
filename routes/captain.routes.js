const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const captainController = require('../controllers/captain.controller')
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', [
    body('fullname.firstname')
        .isLength({ min: 3 })
        .withMessage('First name must be at least 3 characters long'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
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
        .isInt({ min: 1 })
        .withMessage('Vehicle capacity must be a number greater than or equal to 1'),
    body('vehicle.vehicleType')
        .isIn(['car', 'motorcycle', 'auto'])
        .withMessage('Vehicle type must be car, motorcycle, or auto')
], 

    captainController.registerCaptain
);


router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], 
    captainController.loginCaptain
)


router.get('/profile', authMiddleware.authCaptain, captainController.getCaptainProfile)

router.get('/logout', authMiddleware.authUser, captainController.logoutCaptain)


module.exports = router;