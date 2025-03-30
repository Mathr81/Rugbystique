const { Events, InteractionType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async run(client, interaction) {
        if(interaction.type === InteractionType.ApplicationCommand) {
            try{
                const command = client.commands.get(interaction.commandName);
                await command.run(interaction);
            } catch(error) {
                console.error(error);
                const error_embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Une erreur est survenue')
                    .setThumbnail("https://e7.pngegg.com/pngimages/10/205/png-clipart-computer-icons-error-information-error-angle-triangle.png")
                    .setDescription("`" + error +"`")
                    .setFooter({ text: 'Veuillez signaler ceci à Mathr81', iconURL: 'https://cdn.discordapp.com/avatars/828938102021292094/0e50b7a53005ad6d6cb2e4fb4b17f5c6?size=256'});

                
                try {
                    await interaction.editReply({ embeds: [error_embed], ephemeral: true });
                } catch(error) {
                    await interaction.reply({ embeds: [error_embed], ephemeral: true });
                }
            }
        } else if(interaction.type === InteractionType.MessageComponent) {
            // Vérifie si le bouton est d'un type que nous connaissons (ici, les boutons correspondant aux commandes)
            const slicedCustomId = interaction.customId.split("/")
            const commandName = slicedCustomId[0]
            const command = client.commands.get(commandName);
            if(command) {
                try {
                    // Exécute la logique du bouton en utilisant la fonction button de la commande
                    await command.button(interaction);
                } catch(error) {
                    console.error(error);
                    const error_embed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Une erreur est survenue')
                        .setThumbnail("https://e7.pngegg.com/pngimages/10/205/png-clipart-computer-icons-error-information-error-angle-triangle.png")
                        .setDescription("`" + error +"`")
                        .setFooter({ text: 'Veuillez signaler ceci à Mathr81', iconURL: 'https://cdn.discordapp.com/avatars/828938102021292094/0e50b7a53005ad6d6cb2e4fb4b17f5c6?size=256'});

                    
                    try {
                        await interaction.editReply({ embeds: [error_embed], ephemeral: true });
                    } catch(error) {
                        await interaction.reply({ embeds: [error_embed], ephemeral: true });
                    }
                }
            }
        } else if(interaction.type === InteractionType.ApplicationCommandAutocomplete) {
            const command = client.commands.get(interaction.commandName);
            if(command) {
                try {
                    await command.autocomplete(interaction);
                } catch(error) {
                    return
                }
            }
        }
    }
};