const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
    zodiacSign: { type: String, required: true },
    description: { type: String, required: true },
});

const Reading = mongoose.model('Reading', readingSchema);

module.exports = Reading;
