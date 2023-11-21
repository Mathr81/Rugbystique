const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id: String,
    pronos: [
        {
            date: Date,
            homeTeam: String,
            awayTeam: String,
            pronos: {
                winner: String
            }
        }
    ]
});

module.exports = mongoose.model('User', userSchema);