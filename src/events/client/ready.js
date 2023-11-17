const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    async run(client) {

        await client.application.commands.set(client.commands.map(command => command.data));
        console.log("[interactions] => loaded");

        client.user.setActivity("les matchs à venir !", {type: ActivityType.Watching});
        console.log(`[bot] => ${client.user.username} is online`)
    }
}