const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'first name must be at least 3 characters'],
        },
        lastname: {
            type: String,
            minlength: [3, 'last name must be at least 3 characters'],
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    socketId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },

   vehicle: {
    color: {
        type: String,
        required: true,
        default: "Unknown",
    },
    plate: {
        type: String,
        required: true,
        default: "Unknown",
    },
    capacity: {
        type: String,
        required: true,
        default: "0",
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ["car", "motorcycle", "auto"],
        default: "car",
    },
}
,

    location: {
        ltd:{
            type: Number,
        },
        lng: {
            type: Number,
        }
    }

})

captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {expiresIn: '24h'})
    return token;
}

captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.hash(password, this.password);
}

captainSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

const captainModel = mongoose.model('captain', captainSchema);

module.exports = captainModel;
