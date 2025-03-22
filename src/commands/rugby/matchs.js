const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const Match = require('../../functions/addMatch');
const convertToISO = require('../../functions/convertToISO');
const addMatch = require('../../functions/addMatch');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("matchs")
    .setDescription("Donne les matchs d'une certaine date")
    .setDMPermission(false)
    .setDefaultMemberPermissions(null)
    .addStringOption(opt => opt.setName("date").setDescription("La date des matchs au format : 2023-11-18").setRequired(false))
    .addBooleanOption(opt => opt.setName("challengecup").setDescription("Donner les matchs de challenge cup").setRequired(false)),

    async run(interaction) {
        function getDateString() {
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Add 1 because the getMonth() function returns a zero-based value
            const day = date.getDate();
           
            return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
           }

        var date = interaction.options.getString("date");
        if(!date) {
            date = getDateString()
        }

        if(interaction.options.getBoolean("challengecup")) {
            var league = 52;
        }else{
            var league = process.env.API_LEAGUE_ID;
        }
        
        var config = {
            method: 'get',
            url: `https://v1.rugby.api-sports.io/games?league=${league}&season=${process.env.API_SEASON}&date=${date}&timezone=Europe/Paris`,
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
              
              if(matchData.length === 0) {
                await interaction.reply({ content:"Il n'y a pas de matchs pour cette date", ephemeral: true });
                return;
              }
              if(!interaction.options.getBoolean("challengecup")) {
                matchData.map(match => {
                  addMatch(match.homeTeam, match.awayTeam, convertToISO(date, match.matchTime));
                 })
              }

              const embed = {
                color: 0x0099ff,
                title: 'Matchs',
                description: matchData.map(match => {
                 return `**${match.homeTeam}** vs **${match.awayTeam}** à ${match.matchTime}`;
                }).join('\n\n'),
              };

              await interaction.reply({ embeds: [embed] });
          })
          .catch(function (error) {
            console.log(error);
          });
    }
};
