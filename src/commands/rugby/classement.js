const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const calculatePoints = require('../../functions/calculatePoints')
const User= require('../../database/user')
const getDateString = require('../../functions/getDateString')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("classement")
    .setDescription("Create the classement for the pronos")
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

    async run(interaction) {
        await interaction.reply({ content: `Création du classement ...`, ephemeral: true})

        let points = []

        let users = await User.find()
        for (let i = 0; i < users.length; i++) {
            //await calculatePoints(users[i].id, getDateString())

            points.push({id: users[i].id, points: users[i].points})
        }

        // Trier le tableau par ordre décroissant de points
        points.sort((a, b) => b.points - a.points);

        // Initialiser le rang
        let rang = 1;

        // Parcourir le tableau pour attribuer les rangs
        for (let i = 0; i < points.length; i++) {
            if (i > 0 && points[i].points < points[i - 1].points) {
                rang = i + 1;
            }
                points[i].rang = rang;
            }

        /*
        var rangs_list = points.map((line) => `${line.rang}\n`).join("");
        var ids_list = points.map((line) => `<@${line.id}>\n`).join("");
        var points_list = points.map((line) => `${line.points}\n`).join("");
        */
        var ids_list = points.map((line) => `<@${line.id}>\n`).join("").slice(0, 1023);
        var rangs_list = points.map((line) => `${line.rang}\n`).join("").slice(0, 1023);
        var points_list = points.map((line) => `${line.points}\n`).join("").slice(0, 1023);

        const embed = new EmbedBuilder()
            .setTitle('Classement')
            .setColor(0x0099ff)
            .setFooter({ text:`Updated at ${new Date().toLocaleString()}`})
            .setFields([
                {
                    name: 'Rang',
                    value: rangs_list,
                    inline: true
                },
                {
                    name: 'Utilisateur',
                    value: ids_list,
                    inline: true
                },
                {
                    name: 'Points',
                    value: points_list,
                    inline: true
                },
            ]);
            
        interaction.channel.send({ embeds: [embed] })
    }
};