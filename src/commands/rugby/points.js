const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const User= require('../../database/user')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Get/set/add the points of a user")
    .setDMPermission(true)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
    .addSubcommand(subcommand =>
        subcommand
            .setName('get')
            .setDescription('Get the points of a user')
            .addUserOption(opt => opt.setName("user").setDescription("the user to get the points").setRequired(true)),
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('set')
            .setDescription('Set the points of a user')
            .addUserOption(opt => opt.setName("user").setDescription("the user to set the points").setRequired(true))
            .addIntegerOption(opt => opt.setName("points").setDescription("the points to set").setRequired(true)),
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Add points to a user')
            .addUserOption(opt => opt.setName("user").setDescription("the user to add the points").setRequired(true))
            .addIntegerOption(opt => opt.setName("points").setDescription("the points to add").setRequired(true)),
    ),


    async run(interaction) {

        let points = interaction.options.getInteger("points");
        const user_input = interaction.options.getUser("user");
        let user = await User.findOne({id: user_input.id})
        if(!user) {
            user = new User({
              id: user_input.id,
              points: points
            });
            await user.save()
        } else {
            method = interaction.options.getSubcommand();
            switch (method) {
                case "get":
                    points = user.points
                    break
                case "set":
                    user.points = points
                    break
                case "add":
                    user.points += points;  
                    break
            }
            await user.save()
        }
        await interaction.reply({content: `${user_input} a désormais ${user.points} points.`, ephemeral: true})
    }
};