const userModel = require('../models/user.model');

module.exports.createUser = async({
    firstname, lastname, email, password
}) => {
    if(!firstname || !email || !password) {
        throw new Error('Please provide all required fields');
    }
    try {
        const user = await userModel.create({
            fullname: {
                firstname,
                lastname
            },
            email,
            password
        });

        return user;
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
};