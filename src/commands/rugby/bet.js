const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("bet")
    .setDescription("Create a bet")
    .setDMPermission(false)
    .setDefaultMemberPermissions(null),

    async run(interaction) {
        await interaction.reply(`Ping \`${interaction.client.ws.ping}ms\`.`)
    }
};