const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Returns the rules of the guild")
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

    async run(interaction) {
		await interaction.deferReply()
		
		const rulesEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('RÈGLEMENT SERVEUR DISCORD')
			.addFields(
				{ name: 'I – Comportement', value: '- Restez courtois, poli. Vous pouvez être familier, nous ne vous demandons pas d’écrire comme Molière, nous ne sommes pas à L’Élysée\n- Pas de violence verbale gratuite. Vous pouvez taquiner gentiment sans aller dans l’extrême. Si cela reste dans la bonne humeur et le second degré nous le tolérons. Si le staff ou moi même estimons que cela ne respecte plus la règle, vous risquez un kick ou un ban en fonction de l’humeur de la personne qui s\'occupe de votre cas' },
				{ name: 'II – Chat écrit/ vocal', value: '- Pas de spam, sous peine de bannissement.\n- Pas de pub sur les différents chats, sous peine d’avertissement puis ban si l’avertissement n’est pas pris en compte.' },
				{ name: 'III – Profil/Pseudo', value: '- Ne doit pas être ressemblant/confondu avec celui d’un membre du staff, sous peine d’avertissement puis ban si l’avertissement n’est pas pris en compte.\n- Ne doit pas contenir de propos racistes, homophobes, sexistes … (genre la photo de profil Hitler on s’en passera) sous peine d’avertissement puis ban si l’avertissement n’est pas pris en compte.\n- Ne doit pas avoir de caractère pornographique, sous peine d’avertissement puis ban si l’avertissement n’est pas pris en compte.' },
				{ name: 'IV - Contacter le staff', value: '- Si pour une quelconque raison, vous voulez contacter un membre du staff (modo ou admin), ouvrez un ticket sur le salon <#1085290875476783156>\n- Si vous voulez entrer dans l’équipe de modération, contactez les <@&1085288453073272974>. Afin de devenir Modo vous passerez un genre d’entretien afin de voir vos motivations et vos idées pour améliorer le serveur. Ne stressez pas non plus, si vous êtes légitime ça se passera bien ;). C’est histoire de voir à qui je donne le rôle de modo et d’apprendre à la connaître. La décision vous sera donnée ultérieurement par message privé.' }
			)
			.setFooter({ text: '@everyone' });

        await interaction.channel.send({ embeds: [rulesEmbed] })
		await interaction.followUp({ content: "Rules embed successfully sent in this channel", ephemeral: true })
    }
};