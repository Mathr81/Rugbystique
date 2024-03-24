const getDateString = require('./getDateString')
const convertToISO = require('./convertToISO');
const addMatch = require('./addMatch');
const setWinners = require('./setWinners');
const User = require('../database/user')
const calculatePoints = require('./calculatePoints')
const axios = require('axios');
require('dotenv').config();

module.exports = async function runDailyActions() {
    function createMatchs(date) {
        
        var config = {
            method: 'get',
            url: `https://v1.rugby.api-sports.io/games?league=16&season=2023&date=${date}&timezone=Europe/Paris`,
            headers: {
                'x-rapidapi-key': process.env.API_KEY,
                'x-rapidapi-host': 'v1.rugby.api-sports.io'
            }
        };
        
        axios(config)
        .then(async function (response) {
            const matchData = response.data.response.map(match => {
                const { home, away } = match.teams;
                return {
                    homeTeam: home.name,
                    awayTeam: away.name,
                    matchTime: match.time,
                };
            });
            
            
            matchData.map(match => {
                addMatch(match.homeTeam, match.awayTeam, convertToISO(date, match.matchTime));
            })
        })
    }

    let date = getDateString()
    createMatchs(date)
    date = getDateString(new Date().getDate() - 1)
    setWinners(date)

    let users = await User.find()
        for (let i = 0; i < users.length; i++) {
            await calculatePoints(users[i].id, date)
        }

}