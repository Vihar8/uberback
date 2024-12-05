const  rideService = require('../services/ride.service')
const { validationResult } = require('express-validator')
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');



module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });
    
        console.log('Pickup Address:', pickup);
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

        console.log('Pickup Coordinates:', pickupCoordinates);

        if (!pickupCoordinates || pickupCoordinates.lat == null || pickupCoordinates.lon == null) {
            throw new Error('Invalid pickup coordinates received');
        }

        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.lat, pickupCoordinates.lon, 2);


        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.map(captain => {
            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            });
        });

        // Create a new response object with the desired structure
        const response = {
            user: rideWithUser.user._id,  // Use user's ID only
            pickup: rideWithUser.pickup,
            destination: rideWithUser.destination,
            fare: rideWithUser.fare,
            status: rideWithUser.status,
            otp: ride.otp, // Include the otp here
            _id: rideWithUser._id,
            __v: rideWithUser.__v
        };

        return res.status(201).json(response);  // Return the new response object
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.getFare = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(402).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;
    console.log(pickup)
    console.log(destination)

    try{
        const fare = await rideService.getFare(pickup, destination);
        return res.status(201).json(fare);
    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(402).json({ errors: errors.array() });
    }

    const { rideId } = req.query;
   

    try{
        const ride = await rideService.confirmRide({rideId, captain: req.captain});

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })

        return res.status(201).json(ride);
    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}


module.exports.startRide = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(402).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try{
        const ride = await rideService.getFare(pickup, destination);
        return res.status(201).json(fare);
    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}


module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })



        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    } s
}