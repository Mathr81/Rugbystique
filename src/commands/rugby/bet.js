const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ThreadMemberFlags } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const Match = require('../../database/match');
const User = require('../../database/user');
const getEmojiId = require('../../functions/getEmojiId');
const convertToISO = require('../../functions/convertToISO');
const addMatch = require('../../functions/addMatch');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("bet")
    .setDescription("Crées un pari pour chaque match de la journée")
    .setDMPermission(false)
    .setDefaultMemberPermissions(null),

    async run(interaction) {
      interaction.reply({ content: 'Génération des pronostics ...', ephemeral: true })

        function getDateString() {
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Add 1 because the getMonth() function returns a zero-based value
            const day = date.getDate();
           
            return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
           }

        date = getDateString()

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
                  time: match.time
                };
              });


              var matchs = {};
              async function sendMatchs(matchData) {
                matchData.map(async (match, i) => {
                  matchs[i] = { homeTeam: match.homeTeam, awayTeam: match.awayTeam, matchTime: match.time };
                  addMatch(match.homeTeam, match.awayTeam, convertToISO(date, match.time));
              
                  const homeTeam = new ButtonBuilder()
                    .setCustomId(match.homeTeam)
                    .setLabel(match.homeTeam)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(getEmojiId(match.homeTeam));
              
                  const awayTeam = new ButtonBuilder()
                    .setCustomId(match.awayTeam)
                    .setLabel(match.awayTeam)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(getEmojiId(match.awayTeam));
              
                  const row = new ActionRowBuilder()
                    .addComponents(homeTeam, awayTeam);
              
                  await interaction.channel.send({
                    content: `**${match.homeTeam}** vs **${match.awayTeam}**`,
                    components: [row]
                  });               
               });
               }
               
               sendMatchs(matchData);

               // Transformer l'objet matchs en tableau
               const matchsArray = Object.values(matchs);

               function findTeams(matchsArray, team) {
                const match = matchsArray.find(m => m.homeTeam === team || m.awayTeam === team);
                return match ? {homeTeam: match.homeTeam, awayTeam: match.awayTeam, matchTime: match.matchTime} : null;
               }

               interaction.client.on('interactionCreate', async (buttonInteraction) => {
                if (!buttonInteraction.isButton()) return;

                let user = await User.findOne({id: buttonInteraction.user.id})
                if(!user) {
                  user = new User({
                    id: buttonInteraction.user.id,
                    points: 0
                  });
                  await user.save()
                }

                const teams = findTeams(matchsArray, buttonInteraction.component.label);

                await buttonInteraction.reply({ content: `Vous avez parié sur : **${buttonInteraction.component.label}**`, ephemeral: true });

                let matchToEdit = await Match.findOne({ homeTeam: teams.homeTeam, awayTeam: teams.awayTeam, date: convertToISO(date, teams.matchTime), 'pronostics.user_id': buttonInteraction.user.id }).exec();

                if(!matchToEdit) {
                  
                    const newProno = {
                      "user_id": buttonInteraction.user.id,
                      "winner": buttonInteraction.component.label
                    };
                    
                    const result = await Match.updateOne(
                      { "homeTeam": teams.homeTeam, "awayTeam": teams.awayTeam, "date": convertToISO(date, teams.matchTime) },
                      { "$push": { "pronostics": newProno } }
                      );
                  } else {

                    const result = await Match.updateOne(
                      { "homeTeam": teams.homeTeam, "awayTeam": teams.awayTeam, "date": convertToISO(date, teams.matchTime), "pronostics.user_id": buttonInteraction.user.id },
                      { "$set": { "pronostics.$.winner": buttonInteraction.component.label } }
                      );
                  }
              });

          }).catch(function (error) {
            console.log(error);
          });
    }
};