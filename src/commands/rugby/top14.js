const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const path = require('path')
const filePath = path.resolve(__dirname, 'top14.html');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("top14")
    .setDescription("Get top14 classement")
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

    async run(interaction) {
        await interaction.deferReply()
        // Lancez un navigateur Chrome
        const browser = await puppeteer.launch({ headless: false });

        // Ouvrez une nouvelle page
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 15 })

        // Accédez à la page index.html
        await page.goto(filePath, {waitUntil: 'networkidle2'});

        const element = await page.$('#wg-api-rugby-standings');
        await element.screenshot({path: 'screenshot.png', clip: {x: 0, y: 0, width: 800, height: 800}});

        // Fermez le navigateur
        await browser.close();

        await interaction.followUp({files: ['screenshot.png']})
        fs.unlinkSync('screenshot.png');
    }
};