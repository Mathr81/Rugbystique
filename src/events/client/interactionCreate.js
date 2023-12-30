const { Events, InteractionType } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async run(client, interaction) {
        if(interaction.type === InteractionType.ApplicationCommand) {
            const command = client.commands.get(interaction.commandName);
            await command.run(interaction);
        } else if(interaction.type === InteractionType.MessageComponent) {
            // Vérifie si le bouton est d'un type que nous connaissons (ici, les boutons correspondant aux commandes)
            const slicedCustomId = interaction.customId.split("/")
            const commandName = slicedCustomId[0]
            const command = client.commands.get(commandName);
            if(command) {
                // Exécute la logique du bouton en utilisant la fonction buttonInteraction de la commande
                await command.button(interaction);
            }
        }
    }
};