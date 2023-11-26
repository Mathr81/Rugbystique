const { Client, IntentsBitField, Collection } = require('discord.js');
const client = new Client({intents: new IntentsBitField(3276799)});
const loadCommmands = require('./loaders/loadCommands');
const loadEvents = require('./loaders/loadEvents');
const loadDatabase = require('./loaders/loadDatabase');
require('dotenv').config();

const executeAtMidnight = require('./functions/executeAtMidnight')

client.commands = new Collection();

(async () => {
    await loadDatabase();
    await loadCommmands(client);
    await loadEvents(client);

    await executeAtMidnight();
    
    await client.login(process.env.TOKEN);
})();