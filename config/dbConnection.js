const mongoose = require('mongoose');
require('dotenv').config();
const DATABASE_URI = process.env.DATABASE_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(DATABASE_URI, { bufferCommands: false });
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectDB