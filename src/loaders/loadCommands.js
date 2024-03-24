const { readdirSync } = require('fs');
const mongoose = require('mongoose');
const Command = require('../database/command');

module.exports = async client => {
    let count = 0;
    const dirsCommands = readdirSync('./commands');
    for(const dirs of dirsCommands) {
        const filesDirs = readdirSync(`./commands/${dirs}/`).filter(f => f.endsWith(".js"));
        for(const files of filesDirs) {
            const command = require(`../commands/${dirs}/${files}`);
            client.commands.set(command.data.name, command);
            count++;

            let dbcommand = await Command.findOneAndDelete({ name: command.data.name })            
            dbcommand = new Command({
                name: command.data.name,
                description: command.data.description,
                category: dirs,
            })
            await dbcommand.save()
        }
    }
    console.log(`[commands] => ${count} logged commands`);

}