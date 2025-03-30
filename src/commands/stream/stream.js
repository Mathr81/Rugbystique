const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const findChannelId = require('../../functions/findChannelId');
const { streamPuppeteer, streamer } = require('../../loaders/loadUserBot')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("stream")
    .setDescription("Manage a live tv stream")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
    .addSubcommand(subcommand =>
        subcommand
            .setName('start')
            .setDescription('Start the stream')
            .addStringOption(opt => opt.setName("tvchannel").setDescription("The TV channel to stream").setRequired(false).setAutocomplete(true)),
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('stop')
            .setDescription('Stop the stream'),
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('reload')
            .setDescription('Reload the page ( in case the stream keeps loading )')
    ),

    async run(interaction) {
        method = interaction.options.getSubcommand();
        switch (method) {
            case "start":
                let controller;
                let tvchannel = interaction.options.getString('tvchannel') || 'Canal+' // CANAL+ by default
                const channel = interaction.member?.voice?.channel;
                if (tvchannel) { 
                    tvchannel = await findChannelId(tvchannel, 1); 
                    if (!tvchannel) {
                        msg.reply("Channel not found");
                        return
                    }
                    console.log("[Kool] => Found channel :", tvchannel);
                } else { tvchannel = "1839597702" } // CANAL+ by default
                streamer.tvchannel = tvchannel;
                if (!channel) { 
                    await interaction.reply("You are not in a voice channel");
                    return;
                }
                await streamer.joinVoice(channel.guild.id, channel.id);
                        
                await interaction.reply("Starting stream")
                // if (channel instanceof StageChannel) {
                //     await streamer.client.user.voice.setSuppressed(false);
                // }
        
                controller?.abort();
                controller = new AbortController();
                streamer.controller = controller
                await streamPuppeteer(tvchannel, streamer, {
                    width: parseInt(process.env.STREAM_OPTIONS_WIDTH),
                    height: parseInt(process.env.STREAM_OPTIONS_HEIGHT)
                }, controller.signal);
                break;
            case "stop":
                streamer.controller?.abort();
                streamer.leaveVoice();
                await interaction.reply("Ended stream")
                break
            case "reload":
                await streamer.page.reload();
                break
            default:
                break
        }
        
    },
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        choices = await findChannelId(focusedValue, 25, "merged")
		await interaction.respond(
			choices.map(choice => ({ name: choice.item.name, value: choice.item.name })),
		);
    }
};