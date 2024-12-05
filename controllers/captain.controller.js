const blacklistTokenModel = require("../models/blacklistToken.model");
const captainModel = require("../models/captain.model");
const captainService = require('../services/captain.services');
const { validationResult } = require('express-validator');

module.exports.registerCaptain = async (req, res, next) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;
    const isCaptainAlreadyExist = await captainModel.findOne({ email });

    if (isCaptainAlreadyExist) {
        return res.status(400).json({ message: "Captain already exists with this email" });
    }

    // Hash the password
    const hashedPassword = await captainModel.hashPassword(password);

    // Call the service function to create the captain with the necessary details
    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });
    // console.log(vehicleType);

    // Generate an auth token for the new captain
    const token = captain.generateAuthToken();

    // Send a response with the token and captain details
    res.status(201).json({
        message: 'Captain registered successfully',
        token,
        captain
    });
};


module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const captain = await captainModel.findOne({email}).select('+password');

    if(!captain) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await captain.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({message: 'Invalid email or password'});
    }

    const token = captain.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, captain });
}

module.exports.getCaptainProfile = async (req, res, next) => {
    console.log("FDSJKHFDSI",req.captain)
    res.status(200).json({ captain: req.captain});
}


module.exports.logoutCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization.split('')[ 1 ];
    await blacklistTokenModel.create({token});
    res.clearCookie('token');

    res.status(200).json({ message: 'Logged out' });
}