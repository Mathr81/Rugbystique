const User = require('../database/user');

module.exports = async function makeClassement() {
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

    return pages
}