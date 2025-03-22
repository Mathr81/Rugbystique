const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const getDateString = require('../../functions/getDateString');
const Match = require('../../database/match');
const convertToISO = require('../../functions/convertToISO');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("setwinners")
    .setDescription("Set the winners of today's matches.")
    .setDMPermission(true)
    .setDefaultMemberPermissions(null)
    .addStringOption(opt => opt.setName("date").setDescription("The date to register winners in the format : 2023-11-18").setRequired(false)),

    async run(interaction) {
        const date = interaction.options.getString("date");
        if(!date) { date = getDateString() };
        var config = {
            method: 'get',
            url: `https://v1.rugby.api-sports.io/games?league=${process.env.API_LEAGUE_ID}&season=${process.env.API_SEASON}&date=${date}&timezone=Europe/Paris`,
            headers: {
              'x-rapidapi-key': process.env.API_KEY,
              'x-rapidapi-host': 'v1.rugby.api-sports.io'
            }
          };
          
          axios(config)
          .then(async function (response) {
            await interaction.reply({ content:`Enregistrement des résultats d'auhourd'hui ...`, ephemeral: true })

            var matches = [];
            for (var i = 0; i < response.data.response.length; i++) {
              var match = response.data.response[i];
              var winner = (match.scores.home > match.scores.away) ? match.teams.home.name : match.teams.away.name;
             
              const result = await Match.updateOne(
                { "homeTeam": match.teams.home.name, "awayTeam": match.teams.away.name, "date": convertToISO(date, match.time) },
                { "$set": { "winner": winner } }
              );

              matches.push({
                 "time": match.time,
                 "homeTeam": match.teams.home.name,
                 "awayTeam": match.teams.away.name,
                 "winner": winner,
              });
             }

             console.log(matches)
          })
          .catch(function (error) {
            console.log(error);
          });
    }
};