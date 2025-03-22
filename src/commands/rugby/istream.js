const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');
const getDateString = require('../../functions/getDateString');
const toISOFormat = require('../../functions/dateFormatter');
const convertToISO = require('../../functions/convertToISO');
const axios = require('axios');
const addMatch = require('../../functions/addMatch');
const Match = require('../../database/match');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName("istream")
    .setDescription("Announce that you will stream a match and setup everything for it")
    .setDMPermission(false)
    .setDefaultMemberPermissions(null)
    .addStringOption(opt => opt.setName("date").setDescription("The date of the stream in the format : 2023-11-18").setRequired(false))
    .addIntegerOption(opt => opt.setName("probability").setDescription("The probability of that you will stream ( from 1 to 10 )").setRequired(false)),

    async run(interaction) {

        await interaction.deferReply()

        let date = interaction.options.getString("date");
        if(!date) {
            date = getDateString()
        }
        
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
            const matchData = response.data.response.map(match => {
                const { home, away } = match.teams;
                return {
                  homeTeam: home.name,
                  awayTeam: away.name,
                  matchTime: match.time,
                };
              });
              
              if(matchData.length === 0) {
                await interaction.followUp({ content:"Il n'y a pas de matchs pour cette date", ephemeral: true });
                return;
              }

              matchData.map(match => {
                addMatch(match.homeTeam, match.awayTeam, convertToISO(date, match.matchTime));
              });
            
            let matchsVersus = ""
            for (let i = 0; i < matchData.length; i++) {
                matchsVersus += `\n${i+1} - ${matchData[i].homeTeam} vs ${matchData[i].awayTeam}`
            }

            const numbersEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]
            let numbersEmojisCroped = []
            for (let i = 0; i < matchData.length; i++) {
                numbersEmojisCroped.push(numbersEmojis[i])
            }         

            if (numbersEmojisCroped.length > 5) {
                numbersEmojisCroped = numbersEmojisCroped.slice(0, 5)
            }

            const firstEmbedRow = new ActionRowBuilder()
                .addComponents(
                    numbersEmojisCroped.map(number => {
                        return new ButtonBuilder()
                            .setCustomId(`istream/stream/${interaction.user.id}/${number}/${date}`)
                            .setLabel(number)
                            .setStyle(ButtonStyle.Secondary)
                    })
                )

            const firstEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("What match do you want to stream ?")
            .setFields([{name: "Matchs", value: matchsVersus}])
            
            await interaction.editReply({embeds: [firstEmbed], components: [firstEmbedRow]})

            /*
            const probability = interaction.options.getInteger("probability");

            let probability_word_embed = ""

            if(probability) {
                if(probability > 1 || probability < 3) {
                    probability_word_embed = `maybe`
                } else if(probability > 3 || probability < 6) {
                    probability_word_embed = `probably`
                } else {
                    probability_word_embed = `surely`
                }
            }     

            const announcement_embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`${interaction.author} will ${probability_word_embed} stream the match : ${match}`)
            await process.env.STREAM_ANNOUNCE_CHANNEL.send({embeds: [announcement_embed]})
            await interaction.followUp(`Ping \`${interaction.client.ws.ping}ms\`.`)*/
          })
          .catch(function (error) {
            console.log(error);
          });
    }, async button(interaction) {
        const step = interaction.customId.split("/")[1];

        if(interaction.customId.split("/").length === 3 && interaction.user.id !== interaction.customId.split("/")[2]) {
            await interaction.reply({ content: 'You are not allowed to do that !', ephemeral: true });
            return;          
        } else if(interaction.customId.split("/").length === 4 && interaction.user.id !== interaction.customId.split("/")[3]) {
            await interaction.reply({ content: 'You are not allowed to do that !', ephemeral: true });
            return;
        }

        switch(step) {
            case "stream": {
                const number = interaction.customId.split("/")[3];
                const date = interaction.customId.split("/")[4];
              
                const debutJournee = new Date(date);
                debutJournee.setHours(0, 0, 0, 0);
                
                const finJournee = new Date(date);
                finJournee.setHours(23, 59, 59, 999);
                
                const matchs = await Match.find({date :{$gte : debutJournee, $lt : finJournee}}).exec();
                const match = matchs[parseInt(number) - 1];

                const diffusion_guild = process.env.STREAM_GUILD
                const guild = await interaction.client.guilds.cache.get(diffusion_guild)
                const channel = await guild.channels.create({ 
                    name: match.homeTeam + " vs " + match.awayTeam, 
                    type: ChannelType.GuildVoice,
                    parent: process.env.STREAM_CATEGORY,
                    permissionOverwrites: [
                        {
                          id: guild.id,
                          deny : [PermissionsBitField.Flags.ViewChannel],
                          deny: [PermissionsBitField.Flags.Connect], 
                          deny: [PermissionsBitField.Flags.Stream],
                          deny: [PermissionsBitField.Flags.Speak]
                        },
                        {
                          id: interaction.member.id,
                          allow: [PermissionsBitField.Flags.Connect],
                          allow: [PermissionsBitField.Flags.Stream]
                        }
                    ]
                })

                const secondEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle("Everything is setup !")
                    .setDescription(`A voice channel has been created : ${channel}`)
                    .setFields([
                        {name: "Match", value: `${match.homeTeam} vs ${match.awayTeam}`},
                        {name: "Date", value: `${date}`},
                    ])
                    .setFooter({text: `Currently the channel is only visible by you, when it's the moment of the stream, simply click on the embed on the channel.`, iconURL: interaction.user.displayAvatarURL()})

                const secondEmbedRow = new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId(`istream/delete/${interaction.user.id}/${channel.id}`)
                            .setLabel("Cancel")
                            .setEmoji("☠️")
                            .setStyle(ButtonStyle.Danger),
                    ])

                await interaction.update({embeds: [secondEmbed], components: [secondEmbedRow]})

                const thirdEmbedRow = new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId(`istream/open/yes/${interaction.user.id}`)
                            .setLabel("Open to everyone")
                            .setEmoji("🔓")
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`istream/delete/${interaction.user.id}`)
                            .setLabel("Delete the channel")
                            .setEmoji("☠️")
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId(`istream/speak/${interaction.user.id}`)
                            .setLabel("Allow other to speak")
                            .setEmoji("🎙️")
                            .setStyle(ButtonStyle.Secondary),
                    ])

                const thirdEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle("Control panel")
                    .setDescription(`You can now stream the match : ${match.homeTeam} vs ${match.awayTeam}`)
                    .setFields([
                        {name: "Match", value: `${match.homeTeam} vs ${match.awayTeam}`},
                        {name: "Date", value: `${date}`},
                    ])

                await channel.send({embeds: [thirdEmbed], components: [thirdEmbedRow]})
            } break
            case "open": {
                if(interaction.customId.split("/")[2] === "yes") {
                    const permissions = interaction.channel.permissionsFor(interaction.guild.id);
                    const permissionsBitfield = new PermissionsBitField();
                    permissionsBitfield.add(PermissionsBitField.Flags.ViewChannel);
                    permissionsBitfield.add(PermissionsBitField.Flags.Connect);

                    await permissions.add(permissionsBitfield);
                                        
                  const thirdEmbedRow = new ActionRowBuilder()
                      .addComponents([
                          new ButtonBuilder()
                              .setCustomId(`istream/open/no/${interaction.user.id}`)
                              .setLabel("Close to everyone")
                              .setEmoji("🔒")
                              .setStyle(ButtonStyle.Danger),
                          new ButtonBuilder()
                              .setCustomId(`istream/delete/${interaction.user.id}`)
                              .setLabel("Delete the channel")
                              .setEmoji("☠️")
                              .setStyle(ButtonStyle.Danger),
                          new ButtonBuilder()
                              .setCustomId(`istream/speak/yes/${interaction.user.id}`)
                              .setLabel("Allow other to speak")
                              .setEmoji("🎙️")
                              .setStyle(ButtonStyle.Secondary),
                      ])
                  await interaction.update({embeds: [interaction.message.embeds[0]], components: [ thirdEmbedRow ]})
                } else {
                    const permissions = interaction.channel.permissionsFor(interaction.guild.id);
                    const permissionsBitfield = new PermissionsBitField();
                    permissionsBitfield.add(PermissionsBitField.Flags.ViewChannel);
                    permissionsBitfield.add(PermissionsBitField.Flags.Connect);

                    await permissions.remove(permissionsBitfield);
                  const thirdEmbedRow = new ActionRowBuilder()
                      .addComponents([
                          new ButtonBuilder()
                              .setCustomId(`istream/open/yes/${interaction.user.id}`)
                              .setLabel("Open to everyone")
                              .setEmoji("🔓")
                              .setStyle(ButtonStyle.Success),
                          new ButtonBuilder()
                              .setCustomId(`istream/delete/${interaction.user.id}`)
                              .setLabel("Delete the channel")
                              .setEmoji("☠️")
                              .setStyle(ButtonStyle.Danger),
                          new ButtonBuilder()
                              .setCustomId(`istream/speak/yes/${interaction.user.id}`)
                              .setLabel("Allow other to speak")
                              .setEmoji("🎙️")
                              .setStyle(ButtonStyle.Secondary),
                      ])
                  await interaction.update({embeds: [interaction.message.embeds[0]], components: [ thirdEmbedRow ]})
                }
            } break
            case "delete": {
                if (interaction.customId.split("/").length === 4) {
                    let channelToDelete = await interaction.client.channels.cache.get(interaction.customId.split("/")[3]);
                    await channelToDelete.delete();
                    await interaction.embed.delete();
                    return;
                } else {
                    await interaction.channel.delete();
                }
                
            } break
            case "speak": {
                const permissions = interaction.channel.permissionsFor(interaction.guild.roles.everyone);
                const permissionsBitfield = new PermissionsBitField();
                permissionsBitfield.add(PermissionsBitField.Flags.Speak);

                await permissions.add(permissionsBitfield);

                await interaction.update({embeds: [interaction.message.embeds[0]], components: [ interaction.message.components[0] ]})
            } break
        }
    }
};
