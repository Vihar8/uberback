const axios = require('axios');
const { getCoordinates } = require('../controllers/maps.controller');
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinate = async (address) => {
  try {
    // Validate the input
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid address provided');
    }

    // Encode the address for URL safety
    const encodedAddress = encodeURIComponent(address);

    // OpenStreetMap's Nominatim API URL
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    // Make the API request
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'YourAppName', // Replace 'YourAppName' with your application name
      },
    });

    // Check if the response has data
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      };
    } else {
      throw new Error('Address not found in OpenStreetMap');
    }
  } catch (error) {
    console.error('Error in getAddressCoordinate:', error.message);

    // Customize the error message if needed
    throw new Error(
      `Failed to fetch coordinates for the address: ${address}. Reason: ${error.message}`
    );
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error('Invalid origin or destination provided');
  }

  try {
    // Fetch coordinates for origin and destination
    const originCoordinates = await this.getAddressCoordinate(origin);
    const destinationCoordinates = await this.getAddressCoordinate(destination);

    console.log('Origin Coordinates:', originCoordinates);
    console.log('Destination Coordinates:', destinationCoordinates);

    // Replace with your actual OpenRouteService API key
    const orsApiKey = '5b3ce3597851110001cf62487cd57becabea46e8842b5271c4da5bd7';
    const routeUrl = `https://api.openrouteservice.org/v2/directions/driving-car?start=${originCoordinates.lon},${originCoordinates.lat}&end=${destinationCoordinates.lon},${destinationCoordinates.lat}`;
    console.log(routeUrl);

    // Fetch route information (distance and duration)
    const routeResponse = await axios.get(routeUrl, {
      headers: {
        Authorization: orsApiKey,
      },
    });

    console.log('Route Response:', routeResponse.data); // Debugging line

    if (!routeResponse.data.features || routeResponse.data.features.length === 0) {
      throw new Error('No route found');
    }
    
    // Extract distance and duration from the response
    const { distance, duration } = routeResponse.data.features[0].properties.summary;

    return {
      distance: {
        text: `${(distance / 1000).toFixed(2)} KM`, // Convert to KM
        value: distance, // Original value in meters
      },
      duration: {
        text: `${Math.round(duration / 60)} minutes`, // Convert to minutes
        value: duration, // Original value in seconds
      },
      status: 'OK',
    };
  } catch (error) {
    console.error('Error in getDistanceTime:', error.message);
    throw error;
  }
};



module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input){
    throw new Error('Query is required')
  }
  const orsApiKey = process.env.MAPS_API;
    // OpenRouteService Geocode endpoint for autocomplete
    const geocodeUrl = `https://api.openrouteservice.org/geocode/autocomplete`;
 
  try{
    const response = await axios.get(geocodeUrl, {
      params: {
        api_key: orsApiKey,
        text: input, // The search query
        size: 5,     // Limit to 5 suggestions
      },
    });

    // Parse response
    if (response.data.features && response.data.features.length > 0) {
      const terms  = response.data.features.map((feature, index) => ({
       offset: index * 25, // Increment offset for each suggestion
      value: feature.properties.label.split(",")[0],// [longitude, latitude]
      }));

      return terms ;
    } else {
      throw new Error('No suggestions found');
    }
  } catch (err) {
    console.error('Error fetching autocomplete suggestions:', err.message);
    throw err;
  }
};


module.exports.getCaptainsInTheRadius = async (lat, lon, radius) => {
  console.log('Radius Search:', { lat, lon, radius });
  if (lat == null || lon == null) {
      throw new Error('Latitude and Longitude must be provided.');
  }

  const captains = await captainModel.find({
      location: {
          $geoWithin: {
              $centerSphere: [[lon, lat], radius / 6371] // Notice longitude first
          }
      }
  });
  return captains;
};