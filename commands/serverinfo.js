const { SlashCommandBuilder } = require('discord.js');
const { createActionEmbed } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Toon informatie over deze Discord server'),

    async execute(interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();

        const embed = createActionEmbed(`Serverinformatie - ${guild.name}`, null, [
            { name: 'Servernaam', value: guild.name, inline: true },
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Eigenaar', value: `${owner.user.tag}`, inline: true },
            { name: 'Aantal Leden', value: `${guild.memberCount}`, inline: true },
            { name: 'Aantal Kanalen', value: `${guild.channels.cache.size}`, inline: true },
            { name: 'Aantal Rollen', value: `${guild.roles.cache.size}`, inline: true }
        ]);

        if (guild.iconURL()) {
            embed.setThumbnail(guild.iconURL({ dynamic: true }));
        }

        return interaction.reply({ embeds: [embed] });
    }
};
