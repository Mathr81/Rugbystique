const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Command = require('../../database/command')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display help information')
        .setDMPermission(true)
        .setDefaultMemberPermissions(null),

    async run(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('List of available commands')
            .setDescription('Here are the commands organized by category:')
            .setColor(0x0099ff)
            .setFooter({ text: 'Le bot est en cours de développement, ceci est amené à changer !', iconURL: 'https://cdn.discordapp.com/avatars/828938102021292094/0e50b7a53005ad6d6cb2e4fb4b17f5c6?size=1024' });

        const botAvatarURL = interaction.client.user.displayAvatarURL();
        embed.setThumbnail(botAvatarURL);        

        const array = []
        const dbcommands = await Command.find()
        for (let i = 0; i < dbcommands.length; i++) {
            array.push({name: dbcommands[i].name, description: dbcommands[i].description, category: dbcommands[i].category})
        }

        console.log(array)

        // Group commands by directory
        const groupedCommands = array.reduce((acc, { name, category, description }) => {
            if (!acc[category]) {
                acc[category] = {
                    commands: [],
                    descriptions: []
                };
            }
            acc[category].commands.push(name);
            acc[category].descriptions.push(description);
            return acc;
        }, {});

        // Add fields to the embed for each directory and its corresponding commands
        for (const [category, { commands, descriptions }] of Object.entries(groupedCommands)) {
            const commandList = commands.map((command, index) => `\`${command}\` - ${descriptions[index]}`).join('\n');
            embed.addFields({ name: category, value: commandList, inline: true });
        }

        
        await interaction.reply({ embeds: [embed] });
    },
};