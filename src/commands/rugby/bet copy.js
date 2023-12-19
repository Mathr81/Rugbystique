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
    .setName("betcopy")
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

        //date = getDateString()
        date = "2023-12-23"

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

                  const matchISODate = convertToISO(date, match.time);
              
                  const homeTeam = new ButtonBuilder()
                    .setCustomId("betcopy/"+match.homeTeam+"/"+match.awayTeam+"/"+matchISODate)
                    .setLabel(match.homeTeam)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(`${getEmojiId(match.homeTeam)}`);
              
                  const awayTeam = new ButtonBuilder()
                    .setCustomId("betcopy/"+match.awayTeam+"/"+match.homeTeam+"/"+matchISODate)
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
               
               sendMatchs(matchData);

              // Transformer l'objet matchs en tableau
              const matchsArray = Object.values(matchs);

          }).catch(function (error) {
            console.log(error);
          });
    },
    async button(interaction) {

      const slicedCustomId = interaction.customId.split("/")
      console.log(interaction.component.customId)
        // function findTeams(matchsArray, team) {
        // const match = matchsArray.find(m => m.homeTeam === team || m.awayTeam === team);
        // return match ? {homeTeam: match.homeTeam, awayTeam: match.awayTeam, matchTime: match.matchTime} : null;
        // }

      let user = await User.findOne({id: interaction.user.id})
      if(!user) {
        user = new User({
          id: interaction.user.id,
          points: 0
        });
        await user.save()
      }

      //const teams = findTeams(matchsArray, interaction.component.label);

      await interaction.reply({ content: `Vous avez prédit que le vainqueur sera : **${interaction.component.label}**`, ephemeral: true });

      
      let matchInDB = await Match.findOne({ homeTeam: slicedCustomId[1], date: slicedCustomId[3]}).exec();
      if(!matchInDB) {
        matchInDB = await Match.findOne({ awayTeam: slicedCustomId[1], date: slicedCustomId[3]}).exec();
      }

      if(!matchInDB) {
        console.log("match not found in db")
      }else {

        console.log(matchInDB)

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
      /*
      if(!matchToEdit) {
        
          const newProno = {
            "user_id": interaction.user.id,
            "winner": interaction.component.label
          };
          
          const result = await Match.updateOne(
            { "homeTeam": teams.homeTeam, "awayTeam": teams.awayTeam, "date": convertToISO(date, teams.matchTime) },
            { "$push": { "pronostics": newProno } }
            );
        } else {

          const result = await Match.updateOne(
            { "homeTeam": teams.homeTeam, "awayTeam": teams.awayTeam, "date": convertToISO(date, teams.matchTime), "pronostics.user_id": buttonInteraction.user.id },
            { "$set": { "pronostics.$.winner": interaction.component.label } }
            );
        }*/
    }
};