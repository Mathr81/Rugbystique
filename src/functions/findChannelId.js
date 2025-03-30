const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');
const channels_country = "France";

module.exports = async function findChannelId(input, count, type) {
    if(!count) {count = 1}
    if(!type) {type = "sorted"}
    
    const isId = /^\d+$/.test(input);

    if (isId) {
        return input;
    } else {
        const filePath = path.join(__dirname, '../assets/', type + '_channels/', channels_country + '.json');
        const channels = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const options = {
            keys: ['name'],
            threshold: 0.3,
        };
        
        const fuse = new Fuse(channels, options);
        const result = fuse.search(input).slice(0, count);

        if (count == 1) {
            return result.length > 0 ? result[0].item.id : null;
        } else {
            return result
        }
    }
}