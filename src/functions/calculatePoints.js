const Match = require('../database/match');
const User = require('../database/user');

module.exports = async function calculatePoints(user, date) {
    let userToEdit = await User.findOne({ id: user });
    //userToEdit.points = 0;
    await userToEdit.save();

    const matches = await Match.find({ 'pronostics.user_id': user, date: { $gte: new Date(date) } });

    for (let i = 0; i < matches.length; i++) {

        if(!matches[i].winner) return
        var pronostic = matches[i].pronostics.find(u => u.user_id === user);

        if(pronostic.winner === matches[i].winner) {
            userToEdit.points = userToEdit.points + 1;
            await userToEdit.save();
        }
    }
}