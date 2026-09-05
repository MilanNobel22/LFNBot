const { SlashCommandBuilder } = require('discord.js');
const { createActionEmbed } = require('../utils/embeds');
const { isStaff } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Overzicht van alle beschikbare commands'),

    async execute(interaction) {
        const fields = [
            { name: ' Algemene Commands', value: '`/ping` - Bekijk bot latency\n`/userinfo` - Bekijk informatie over een lid\n`/serverinfo` - Bekijk server statistieken\n`/help` - Dit overzicht', inline: false }
        ];

        if (isStaff(interaction.member)) {
            fields.push({
                name: ' Management Commands (Staff)',
                value: '`/aannemen` - Neem iemand aan op een rank\n`/promotie` - Promoveer een medewerker\n`/ontslaan` - Ontsla een medewerker\n`/blacklist` - Plaats iemand op de blacklist\n`/embed` - Maak een kanaal-webhook aan',
                inline: false
            });
        }

        const embed = createActionEmbed('Help Centre', 'Hier is een overzicht van de beschikbare commands op basis van jouw permissies:', fields);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
