const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    homeTeam: String,
    awayTeam: String,
    date: Date,
    pronostics: [
        {
            user_id: String,
            winner: String,
        }
    ],
    winner: String,
}, { versionKey: false });

module.exports = mongoose.model('Match', matchSchema);