module.exports = function getEmojiId(name) {

    const EmojiIds = {
        "Aviron Bayonnais": "1115020893970772070",
        "Bordeaux Begles": "1115021846912446505",
        "Castres Olympique": "1115024398177542265",
        "Clermont": "1115024662804578314",
        "Stade Rochelais": "1115022772817625169",
        "Lyon": "1115023294555504780",
        "Montpellier": "1115025363072983070",
        "Racing 92": "1115024337037176893",
        "RC Toulonnais": "1115020853260857374",
        "Section Paloise": "1115025416458088532",
        "Stade Francais Paris": "1115024269064286269",
        "Stade Toulousain": "1115030046063738983",
        "US Oyonnax": "1115025905291628665",
        "USA Perpignan": "1115021816709271612",
    }

    return EmojiIds[name] 
}