const mongoose = require('mongoose');
const app = require('../app');

function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true })  // Removed useUnifiedTopology
        .then(() => {
            console.log('Connected to DB');
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = connectToDb;
