const { SlashCommandBuilder } = require('discord.js');
const User= require('../../database/user')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("addpoints")
    .setDescription("Add points to a member")
    .setDMPermission(true)
    .setDefaultMemberPermissions(null)
    .addUserOption(opt => opt.setName("user").setDescription("the user to add the points").setRequired(true))
    .addStringOption(opt => opt.setName("points").setDescription("the points to add").setRequired(true)),


    async run(interaction) {

        let points = interaction.options.getString("points");
        const user_input = interaction.options.getUser("user");
        let user = await User.findOne({id: user_input.id})
        if (!user) {
            user = new User({
                id: user_input.id,
                points: 0
            });
        }
        user.points += parseInt(points);
        await user.save();

        await interaction.reply({content: `${user_input} a désormais ${user.points} points.`, ephemeral: true})
    }
};