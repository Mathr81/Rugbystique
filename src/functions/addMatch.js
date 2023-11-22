const mongoose = require('mongoose');
const Match = require('../database/match');

module.exports = async function addMatch(homeTeam_imput, awayTeam_imput, date_imput) {
    let match = await Match.findOne({ homeTeam: homeTeam_imput, awayTeam: awayTeam_imput, date: date_imput }).exec();

    if(!match) {
        match = new Match({
            homeTeam: homeTeam_imput,
            awayTeam: awayTeam_imput,
            date: date_imput,
            pronostics: [],
        });

        await match.save();
    }
}
