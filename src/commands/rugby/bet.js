const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const User = require('../../database/user');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("bet")
    .setDescription("Crées un pari pour chaque match de la journée")
    .setDMPermission(false)
    .setDefaultMemberPermissions(null),

    async run(interaction) {

        function getDateString() {
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Add 1 because the getMonth() function returns a zero-based value
            const day = date.getDate();
           
            return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
           }

        date = "2023-11-18"
        //date = getDateString()

        var config = {
            method: 'get',
            url: `https://v1.rugby.api-sports.io/games?league=16&season=2023&date=${date}`,
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
                  awayTeam: away.name
                };
              });

              var matchs = {};
              var i = 1

              async function sendMatches(matchData) {
                /*for (const match of matchData) {                   
                   
                  matchs[i] = {homeTeam: match.homeTeam, awayTeam: match.awayTeam};

                   const homeTeam = new ButtonBuilder()
                      .setCustomId(match.homeTeam)
                      .setLabel(match.homeTeam)
                      .setStyle(ButtonStyle.Secondary)

                    const awayTeam = new ButtonBuilder()
                      .setCustomId(match.awayTeam)
                      .setLabel(match.awayTeam)
                      .setStyle(ButtonStyle.Secondary)

                    const row = new ActionRowBuilder()
			                .addComponents(homeTeam, awayTeam);

                    await interaction.channel.send({
                      content: `**${match.homeTeam}** vs **${match.awayTeam}**`,
                      components: [row]
                    });
                };*/
                matchData.map(async (match, i) => {
                  matchs[i] = { homeTeam: match.homeTeam, awayTeam: match.awayTeam };
              
                  const homeTeam = new ButtonBuilder()
                    .setCustomId(match.homeTeam)
                    .setLabel(match.homeTeam)
                    .setStyle(ButtonStyle.Secondary);
              
                  const awayTeam = new ButtonBuilder()
                    .setCustomId(match.awayTeam)
                    .setLabel(match.awayTeam)
                    .setStyle(ButtonStyle.Secondary);
              
                  const row = new ActionRowBuilder()
                    .addComponents(homeTeam, awayTeam);
              
                  await interaction.channel.send({
                    content: `**${match.homeTeam}** vs **${match.awayTeam}**`,
                    components: [row]
                  });
               });
               }
               
               sendMatches(matchData);

               // Transformer l'objet matchs en tableau
               const matchsArray = Object.values(matchs);

               function findTeams(matchsArray, team) {
                const match = matchsArray.find(m => m.homeTeam === team || m.awayTeam === team);
                return match ? {homeTeam: match.homeTeam, awayTeam: match.awayTeam} : null;
               }

               interaction.client.on('interactionCreate', async (buttonInteraction) => {
                if (!buttonInteraction.isButton()) return;

                const teams = findTeams(matchsArray, buttonInteraction.component.label);

                async function addMatch() {

                  // Recherche un utilisateur avec l'ID spécifié
                  let user = await User.findOne({ user_id: buttonInteraction.user.id }).exec();

                  // Si l'utilisateur n'est pas trouvé, le crée avec un tableau vide de pronos
                  if (!user) {
                      user = new User({
                          user_id: buttonInteraction.user.id,
                          pronos: []
                      });

                      // Sauvegarde l'utilisateur dans la db
                      await user.save();
                  }
                    const newMatch = {
                        "date": date,
                        "homeTeam": teams.homeTeam,
                        "awayTeam": teams.awayTeam,
                        "pronos": {
                            "winner": buttonInteraction.component.label
                        }
                    };

                    const result = await User.updateOne(
                        { "user_id": buttonInteraction.user.id },
                        { "$push": { "pronos": newMatch } }
                    );
                }

                addMatch();
                await buttonInteraction.reply({ content: `Vous avez parié sur : ${buttonInteraction.component.label}`, ephemeral: true });
            });

          }).catch(function (error) {
            console.log(error);
          });
    }
};