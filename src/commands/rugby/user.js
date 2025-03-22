const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const User = require('../../database/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("user")
        .setDescription("Manage users in the database")
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a user from the database')
                .addUserOption(opt => 
                    opt.setName("user")
                       .setDescription("The user to delete")
                       .setRequired(true)
                )
        ),

    async run(interaction) {
        const user_input = interaction.options.getUser("user");
        const user = await User.findOne({ id: user_input.id });

        if (!user) {
            await interaction.reply({ content: `${user_input} doesn't exist in the database`, ephemeral: true });
        } else {
            const method = interaction.options.getSubcommand();
            switch (method) {
                case "delete":
                    await user.deleteOne();
                    await interaction.reply({ content: `${user_input} has been deleted from the database.`, ephemeral: true });
                    break;
                default:
                    await interaction.reply({ content: `Invalid subcommand`, ephemeral: true });
                    break;
            }
        }
    }
};
