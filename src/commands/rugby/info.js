const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { toEuropeanFormat, toISOFormat } = require('../../functions/dateFormatter');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Get information about the league/teams/players")
    .setDMPermission(true)
    .setDefaultMemberPermissions(null)
    .addSubcommand(subcommand =>
        subcommand
            .setName('league')
            .setDescription('Get information about the league')
            .addStringOption(opt => opt.setName("league").setDescription("The id of theleague to get information about").setRequired(true))
            .addIntegerOption(opt => opt.setName("year").setDescription("The year of the league to get information about").setRequired(false))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('teams')
            .setDescription('Get information about the teams in a league')
            .addStringOption(opt => opt.setName("league").setDescription("The id of theleague to get information about").setRequired(true))
            .addIntegerOption(opt => opt.setName("year").setDescription("The year of the league to get information about").setRequired(false))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('stats')
            .setDescription('Get information about the stats of a team')
            .addStringOption(opt => opt.setName("league").setDescription("The id of theleague to get information about").setRequired(true))
            .addStringOption(opt => opt.setName("team").setDescription("The id of the team to get information about").setRequired(false))
            .addIntegerOption(opt => opt.setName("year").setDescription("The year of the league to get information about").setRequired(false))
    ),

    async run(interaction) {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "league":
                var config = {
                    method: 'get',
                    url: `https://v1.rugby.api-sports.io/leagues?id=${interaction.options.getString("league")}&season=${interaction.options.getInteger("year") || 2023}`,
                    // url: `https://v1.rugby.api-sports.io/leagues?id=${interaction.options.getString("league")}&season=2023`,                 
                    headers: {
                      'x-rapidapi-key': process.env.API_KEY,
                      'x-rapidapi-host': 'v1.rugby.api-sports.io'
                    }
                };
                  
                await axios(config)
                    .then(async function (response) {  
                        console.log(JSON.stringify(response.data));

                        const league = response.data.response[0];

                        console.log(league);

                        const embed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(league.name)
                            .setDescription(`Type: ${league.type}`)
                            .setThumbnail(league.logo)
                            .addFields(
                                { name: 'Pays', value: `${league.country.name} (${league.country.code})`, inline: true },
                                { name: 'Saison', value: `${league.seasons[0].season}`, inline: true },
                                { name: 'Début', value: `${toEuropeanFormat(league.seasons[0].start)}`, inline: true },
                                { name: 'Fin', value: `${toEuropeanFormat(league.seasons[0].end)}`, inline: true }
                            )
                            .setFooter({ text: 'Source: API Sports', iconURL: league.country.flag });

                        await interaction.reply({ embeds: [embed] });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                break;
            case "teams":
                var config = {
                    method: 'get',
                    url: `https://v1.rugby.api-sports.io/teams?league=${interaction.options.getString("league")}&season=2023`,
                    headers: {
                      'x-rapidapi-key': process.env.API_KEY,
                      'x-rapidapi-host': 'v1.rugby.api-sports.io'
                    }
                };
                  
                await axios(config)
                    .then(async function (response) {
                        const teams = response.data.response;

                        await interaction.deferReply({ fetchReply: true });

                        for(const team of teams) {
                            const embed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(team.name)
                            .setThumbnail(team.logo)
                            .addFields(
                                { name: 'Pays', value: team.country.name ? team.country.name : 'N/A', inline: true },
                                { name: 'Fondée', value: team.founded ? team.founded.toString() : 'N/A', inline: true },
                                { name: 'Stade', value: team.arena.name ? team.arena.name : 'N/A', inline: true },
                                { name: 'Localisation', value: team.arena.location ? team.arena.location : 'N/A', inline: true },
                                { name: 'National', value: team.national ? 'Oui' : 'Non', inline: true },
                                { name: 'Id', value: team.id ? team.id.toString() : 'N/A', inline: true }
                            )
                            .setImage(team.country.flag)
                            // .setFooter({ text: 'Source: API Sports', iconURL: team.logo });

                            await interaction.channel.send({ embeds: [embed] });
                        }

                        await interaction.followUp({ content: `Here are the teams of the league with id : \`${interaction.options.getString("league")}\``, ephemeral: true });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                break;
            case "players":
                var config = {
                    method: 'get',
                    url: `https://v1.rugby.api-sports.io/players?team=${interaction.options.getString("team")}&league=${interaction.options.getString("league")}&season=2023`,
                    headers: {
                      'x-rapidapi-key': process.env.API_KEY,
                      'x-rapidapi-host': 'v1.rugby.api-sports.io'
                    }
                  };
                  
                // await axios(config)
                //     .then(async function (response) {
                //         const players = response.data.response;
                await interaction.reply({ content: "Not implemented yet", ephemeral: true });
                break;
        }
    }
};