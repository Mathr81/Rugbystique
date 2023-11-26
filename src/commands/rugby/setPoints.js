const { SlashCommandBuilder } = require('discord.js');
const User= require('../../database/user')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("setpoints")
    .setDescription("Set the points of a member")
    .setDMPermission(true)
    .setDefaultMemberPermissions(null)
    .addUserOption(opt => opt.setName("user").setDescription("the user to set the points").setRequired(true))
    .addStringOption(opt => opt.setName("points").setDescription("the points to set").setRequired(true)),


    async run(interaction) {

        let points = interaction.options.getString("points");
        const user_input = interaction.options.getUser("user");
        let user = await User.findOne({id: user_input.id})
        if(!user) {
            user = new User({
              id: user_input.id,
              points: points
            });
            await user.save()
        } else {
            user.points = points
            await user.save()
        }
        await interaction.reply(`${user_input} a désormais ${points} points.`)
    }
};