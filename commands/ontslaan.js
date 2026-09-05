const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ontslaan')
        .setDescription('Ontsla een lid van het team')
        .addUserOption(option =>
            option.setName('gebruiker')
                .setDescription('Het lid dat je wilt ontslaan')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reden')
                .setDescription('De reden van het ontslag')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.STAFF_ROLE_ID)) {
            return interaction.reply({
                content: 'Je hebt geen toestemming om dit commando te gebruiken.',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('gebruiker');
        const reason = interaction.options.getString('reden');
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            return interaction.reply({
                content: 'Gebruiker kon niet worden gevonden op deze server.',
                ephemeral: true
            });
        }

        // Alleen RETAIN_ROLE (1524394139821543518) en DISMISSED_ROLE (1524394139867811925) behouden/geven
        const rolesToSet = [
            config.SPECIAL_ROLES.RETAIN_ROLE,
            config.SPECIAL_ROLES.DISMISSED_ROLE
        ];

        // Systeemrollen (zoals Server Booster) behouden om crashes te voorkomen
        const managedRoles = targetMember.roles.cache.filter(role => role.managed).map(role => role.id);
        const finalRoles = [...new Set([...rolesToSet, ...managedRoles])];

        try {
            await targetMember.roles.set(finalRoles);

            const actionEmbed = new EmbedBuilder()
                .setTitle('❌ Lid Ontslagen')
                .setColor(config.COLORS.ERROR)
                .addFields(
                    { name: 'Gebruiker', value: `${targetUser}`, inline: true },
                    { name: 'Uitgevoerd door', value: `${interaction.user}`, inline: true },
                    { name: 'Reden', value: reason }
                )
                .setTimestamp();

            const actionChannel = interaction.guild.channels.cache.get(config.ACTION_CHANNELS.ontslagen);
            if (actionChannel) await actionChannel.send({ embeds: [actionEmbed] });

            const logEmbed = new EmbedBuilder()
                .setTitle('📝 Log: Ontslag')
                .setColor(config.COLORS.LOG)
                .addFields(
                    { name: 'Gebruiker', value: `${targetUser.tag} (${targetUser.id})` },
                    { name: 'Uitgevoerd door', value: `${interaction.user.tag} (${interaction.user.id})` },
                    { name: 'Reden', value: reason }
                )
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.get(config.LOG_CHANNELS.ontslagen);
            if (logChannel) await logChannel.send({ embeds: [logEmbed] });

            await interaction.reply({
                content: `**${targetUser.tag}** is succesvol ontslagen en alle overige rollen zijn verwijderd.`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Er is een fout opgetreden bij het aanpassen van de rollen. Controleer of de rol van de bot hoog genoeg staat.',
                ephemeral: true
            });
        }
    }
};