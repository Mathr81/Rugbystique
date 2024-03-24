const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder
} = require('discord.js');
const calculatePoints = require('../../functions/calculatePoints')
const User = require('../../database/user')
const getDateString = require('../../functions/getDateString')
const makeClassement = require('../../functions/makeClassement')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("classement3")
        .setDescription("Create the classement for the pronos")
        .setDMPermission(true)
        .setDefaultMemberPermissions(null),

    async run(interaction) {
        await interaction.reply({
            content: `Création du classement ...`,
            ephemeral: true
        })

        /*
        let points = []

        let users = await User.find()
        for (let i = 0; i < users.length; i++) {
            //await calculatePoints(users[i].id, getDateString())

            points.push({
                id: users[i].id,
                points: users[i].points
            })
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

        // Découper le tableau points en plusieurs parties de 20 éléments maximum
        const pages = [];
        const pageSize = 20;
        for (let i = 0; i < points.length; i += pageSize) {
            const page = points.slice(i, i + pageSize);
            pages.push(page);
        }
        */

        const pages =await makeClassement()

        // Afficher la première page du classement
        let currentPage = 0;

        const currentPageEmbed = new EmbedBuilder()
            .setTitle(`Classement - Page ${currentPage + 1}`)
            .setColor(0x0099ff)
            .setFooter({
                text: `Updated at ${new Date().toLocaleString()}`
            })
            .setFields([{
                    name: 'Rang',
                    value: pages[currentPage].map(line => line.rang).join('\n'),
                    inline: true
                },
                {
                    name: 'Utilisateur',
                    value: pages[currentPage].map(line => `<@${line.id}>`).join('\n'),
                    inline: true
                },
                {
                    name: 'Points',
                    value: pages[currentPage].map(line => line.points).join('\n'),
                    inline: true
                },
            ]);

        const nextPageButton = new ButtonBuilder()
            .setStyle('Primary')
            .setLabel('Next Page')
            .setCustomId(interaction.command.name + "/" + 'nextPage' + "/" + currentPage);

        const previousPageButton = new ButtonBuilder()
            .setStyle('Primary')
            .setLabel('Previous Page')
            .setCustomId(interaction.command.name + "/" + 'previousPage' + "/" + currentPage)
            .setDisabled(true); // Désactivé sur la première page

        const row = new ActionRowBuilder()
            .addComponents(previousPageButton, nextPageButton);

        interaction.channel.send({
            embeds: [currentPageEmbed],
            components: [row]
        });

        //module.exports.pages = pages;
    },

    async button(interaction) {

        const commandName = interaction.customId.split("/")[0];
    
        let currentPage = parseInt(interaction.customId.split("/")[2]);
    
        const pages = await makeClassement()
    
        if (interaction.customId.split("/")[1] === 'nextPage') {
            // Afficher la page suivante du classement
            const nextPage = currentPage + 1;
            if (nextPage < pages.length) {
                currentPage = nextPage;
            }
        } else if (interaction.customId.split("/")[1] === 'previousPage') {
            // Afficher la page précédente du classement
            const previousPage = currentPage - 1;
            if (previousPage >= 0) {
                currentPage = previousPage;
            }
        }

        const nextPageButton = new ButtonBuilder()
            .setStyle('Primary')
            .setLabel('Next Page')
            .setCustomId(commandName + "/" + 'nextPage' + "/" + currentPage);

        const previousPageButton = new ButtonBuilder()
            .setStyle('Primary')
            .setLabel('Previous Page')
            .setCustomId(commandName + "/" + 'previousPage' + "/" + currentPage)
            .setDisabled(true); // Désactivé sur la première page

        const row = new ActionRowBuilder()
            .addComponents(previousPageButton, nextPageButton);
    
        // Activer/désactiver les boutons suivant/precedent suivant la page actuele
        nextPageButton.setDisabled(currentPage === pages.length - 1);
        previousPageButton.setDisabled(currentPage === 0);
    
        const currentPageEmbed = new EmbedBuilder()
            .setTitle(`Classement - Page ${currentPage + 1}`)
            .setColor(0x0099ff)
            .setFields([
                {
                    name: 'Rang',
                    value: pages[currentPage].map(line => line.rang).join('\n'),
                    inline: true
                },
                {
                    name: 'Utilisateur',
                    value: pages[currentPage].map(line => `<@${line.id}>`).join('\n'),
                    inline: true
                },
                {
                    name: 'Points',
                    value: pages[currentPage].map(line => line.points).join('\n'),
                    inline: true
                },
            ]);

        await interaction.update({
            embeds: [currentPageEmbed],
            components: [row]
        });
    }
}