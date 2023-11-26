const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
}, { versionKey: false }, { _id : false });

module.exports = mongoose.model('Command', commandSchema);