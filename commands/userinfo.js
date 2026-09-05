const { SlashCommandBuilder } = require('discord.js');
const { createActionEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Toon gedetailleerde informatie over een gebruiker')
        .addUserOption(option => 
            option.setName('gebruiker')
                .setDescription('De gebruiker waar je info van wil opvragen')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('gebruiker') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({ embeds: [createErrorEmbed('Gebruiker niet gevonden in de server.')], ephemeral: true });
        }

        const roles = member.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .map(r => r.toString())
            .join(', ') || 'Geen rollen';

        const embed = createActionEmbed(`Gebruikersinformatie - ${targetUser.tag}`, null, [
            { name: 'Username', value: targetUser.username, inline: true },
            { name: 'User ID', value: targetUser.id, inline: true },
            { name: 'Account Aangemaakt', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: false },
            { name: 'Server Binnengekomen', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false },
            { name: 'Rollen', value: roles.length > 1024 ? `${roles.substring(0, 1020)}...` : roles, inline: false }
        ]);

        if (targetUser.displayAvatarURL()) {
            embed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));
        }

        return interaction.reply({ embeds: [embed] });
    }
};
