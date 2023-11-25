const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: String,
    points: Number,
}, { versionKey: false }, { _id : false });

module.exports = mongoose.model('User', userSchema);