const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Start streaming a tv channel")
    .setDMPermission(true)
    .addStringOption(opt => opt.setName("tvchannel").setDescription("The TV channel to stream").setRequired(false).setAutocomplete(true))
    .setDefaultMemberPermissions(null),

    async run(interaction) {
        const apiBaseURL = 'http://localhost:3000';
        const tvchannel = interaction.options.getString('tvchannel') || 'Canal+' // CANAL+ by default
        const channel = interaction.member?.voice?.channel;
        if (!channel) { 
            await interaction.reply("You are not in a voice channel");
            return;
        }
        await axios.post(`${apiBaseURL}/api/start-stream`, {
            guildId: channel.guild.id,
            channelId: channel.id,
            channelName: tvchannel,
        })
        await interaction.reply(`Started streaming ${tvchannel} in ${channel}`);
    },
    async autocomplete(interaction) {
        const apiBaseURL = 'http://localhost:3000';
        const focusedValue = interaction.options.getFocused();
        const choices = (await axios.post(`${apiBaseURL}/api/channels`, { channelName: focusedValue })).data.results;
		await interaction.respond(
			choices.map(choice => ({ name: choice.item.name, value: choice.item.name })),
		);
    }
};