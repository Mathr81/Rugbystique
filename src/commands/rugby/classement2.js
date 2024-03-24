const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const calculatePoints = require('../../functions/calculatePoints')
const User= require('../../database/user')
const getDateString = require('../../functions/getDateString')

module.exports = {
    data: new SlashCommandBuilder()
    .setName("classement2")
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

       // ...

// Découper le tableau points en plusieurs parties de 20 éléments maximum
const pages = [];
const pageSize = 20;
for (let i = 0; i < points.length; i += pageSize) {
    const page = points.slice(i, i + pageSize);
    pages.push(page);
}

// Afficher la première page du classement
let currentPage = 0;

const currentPageEmbed = new EmbedBuilder()
    .setTitle(`Classement - Page ${currentPage + 1}`)
    .setColor(0x0099ff)
    .setFooter({ text:`Updated at ${new Date().toLocaleString()}`})
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

    const nextPageButton = new ButtonBuilder()
    .setStyle('Primary')
    .setLabel('Next Page')
    .setCustomId('nextPage')

    const previousPageButton = new ButtonBuilder()
    .setStyle('Primary')
    .setLabel('Previous Page')
    .setCustomId('previousPage')

const row = new ActionRowBuilder()
    .addComponents(previousPageButton, nextPageButton);

interaction.channel.send({
    embeds: [currentPageEmbed],
    components: [row]
});

// Gestionnaire d'événements pour le bouton "Next Page"
const filter = (interaction) => interaction.user.id === interaction.user.id;
const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

collector.on('collect', async (interaction) => {
    if (interaction.customId === 'nextPage') {
        // Afficher la page suivante du classement
        const nextPage = currentPage + 1;
        if (nextPage < pages.length) {
            const nextPageEmbed = new EmbedBuilder()
                .setTitle(`Classement - Page ${nextPage + 1}`)
                .setColor(0x0099ff)
                .setFooter({ text:`Updated at ${new Date().toLocaleString()}`})
                .setFields([
                    {
                        name: 'Rang',
                        value: pages[nextPage].map(line => line.rang).join('\n'),
                        inline: true
                    },
                    {
                        name: 'Utilisateur',
                        value: pages[nextPage].map(line => `<@${line.id}>`).join('\n'),
                        inline: true
                    },
                    {
                        name: 'Points',
                        value: pages[nextPage].map(line => line.points).join('\n'),
                        inline: true
                    },
                ]);

            currentPage = nextPage;

            await interaction.update({ embeds: [nextPageEmbed] });
        }
    } else if (interaction.customId === 'previousPage') {
        // Afficher la page précédente du classement
        let previousPage = currentPage - 1;
        if (previousPage >= 0) {
            const previousPageEmbed = new EmbedBuilder()
                .setTitle(`Classement - Page ${previousPage + 1}`)
                .setColor(0x0099ff)
                .setFooter({ text:`Updated at ${new Date().toLocaleString()}`})
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
                currentPage = previousPage;

                await interaction.update({ embeds: [previousPageEmbed] });
            }
        }
    });

    collector.on('end', async () => { // Supprimer les boutons "Next Page" et "Previous Page" après 15 secondes 
        row.components = []; 
        await interaction.update({ components: [row] }); });
}}
