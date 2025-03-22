const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
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
    .setDescription("Create a bet for the pronos")
    .setDMPermission(false)
    .addStringOption(opt => opt.setName("date").setDescription("La date des matchs au format : 2023-11-18").setRequired(false))
    .setDefaultMemberPermissions(null),

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

        var config = {
            method: 'get',
            url: `https://v1.rugby.api-sports.io/games?league=16&season=${process.env.API_SEASON}&date=${date}&timezone=Europe/Paris`,
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

                  const matchISODate = convertToISO(date, match.time);
              
                  const homeTeam = new ButtonBuilder()
                    .setCustomId("bet/"+match.homeTeam+"/"+match.awayTeam+"/"+matchISODate)
                    .setLabel(match.homeTeam)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(`${getEmojiId(match.homeTeam)}`);
              
                  const awayTeam = new ButtonBuilder()
                    .setCustomId("bet/"+match.awayTeam+"/"+match.homeTeam+"/"+matchISODate)
                    .setLabel(match.awayTeam)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(`${getEmojiId(match.awayTeam)}`);
              
                  const row = new ActionRowBuilder()
                    .addComponents(homeTeam, awayTeam);
              
                  await interaction.channel.send({
                    content: `**${match.homeTeam}** vs **${match.awayTeam}**`,
                    components: [row]
                  });             
               });
               }
               
               if(matchData.length === 0) {
                await interaction.reply({ content: "Aucun match pour cette date !", ephemeral: true });
                return;
               } else {
                await interaction.reply({ content: 'Génération des pronostics ...', ephemeral: true })
               }
               interaction.channel.send({ content: "**__Pronostics pour les matchs du " + date + "__** :" });
               sendMatchs(matchData);

          }).catch(function (error) {
            console.log(error);
          });
    },
    async button(interaction) {

      const slicedCustomId = interaction.customId.split("/")

      let user = await User.findOne({id: interaction.user.id})
      if(!user) {
        user = new User({
          id: interaction.user.id,
          points: 0
        });
        await user.save()
      }
      
      function isDatePassed(dateISO) {
        const currentDate = Date.now();
        const parsedDate = Date.parse(dateISO);
      
        return parsedDate <= currentDate;
      }

      const isPassed = isDatePassed(slicedCustomId[3]);
      if(isPassed === true) {
        await interaction.reply({ content: `Le match est passé !`, ephemeral: true });
        return;
      }

      await interaction.reply({ content: `Vous avez prédit que le vainqueur sera : **${interaction.component.label}**`, ephemeral: true });
   
      let matchInDB = await Match.findOne({ homeTeam: slicedCustomId[1], date: slicedCustomId[3]}).exec();
      if(!matchInDB) {
        matchInDB = await Match.findOne({ awayTeam: slicedCustomId[1], date: slicedCustomId[3]}).exec();
      }

      if(!matchInDB) {
        console.log("match not found in db")
      }else {

        function findPronosticByUserId(user_id) {
          for (const pronostic of matchInDB.pronostics) {
            if (pronostic.user_id === user_id) {
              return pronostic;
            }
          }
          return null;
        }

        const userPronostic = findPronosticByUserId(interaction.user.id)
        if(!userPronostic) {
          const newProno = {
            "user_id": interaction.user.id,
            "winner": interaction.component.label
          };
  
          const result = await Match.updateOne(
            { "homeTeam": matchInDB.homeTeam, "awayTeam": matchInDB.awayTeam, "date": matchInDB.date },
            { "$push": { "pronostics": newProno } }
          );
        } else {

          const result = await Match.updateOne(
            { "homeTeam": matchInDB.homeTeam, "awayTeam": matchInDB.awayTeam, "date": matchInDB.date, "pronostics.user_id": interaction.user.id },
            { "$set": { "pronostics.$.winner": interaction.component.label } }
            );
        }

      }
    }
};