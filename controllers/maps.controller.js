const mapService = require('../services/maps.service');
const { validationResult } = require('express-validator')

module.exports.getCoordinates = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {address} = req.query;

    console.log(address)

    try{
        const coordinates = await mapService.getAddressCoordinate(address);
        console.log("coordinates",coordinates)
        res.status(200).json(coordinates);
    }catch(error){
        res.status(404).json({
            message: 'coordinates not found',
        })
    }
}


module.exports.getDistanceTime = async (req, res, next) => {
    try{

        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {origin, destination} = req.query;
    console.log(origin);
    console.log(destination);

    const distanceTime = await mapService.getDistanceTime(origin, destination);
    
    res.status(200).json(distanceTime);

    }catch(error){
        res.status(404).json({
            message: 'distance not found'
        })
    }

}


module.exports.getAutoCompleteSuggestions = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {input} = req.query;


        const suggestions = await mapService.getAutoCompleteSuggestions(input);

        res.status(200).json(suggestions);

    }catch(err){
        res.status(404).json({
            message: 'distance not found'
        })
    }
}