const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Plaats een lid op de blacklist')
        .addUserOption(option =>
            option.setName('gebruiker')
                .setDescription('Het lid dat je op de blacklist wilt zetten')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reden')
                .setDescription('De reden voor de blacklist')
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

        // RETAIN_ROLE, DISMISSED_ROLE en BLACKLIST_ROLE (1524394139867811926) behouden/geven
        const rolesToSet = [
            config.SPECIAL_ROLES.RETAIN_ROLE,
            config.SPECIAL_ROLES.DISMISSED_ROLE,
            config.SPECIAL_ROLES.BLACKLIST_ROLE
        ];

        // Systeemrollen (zoals Server Booster) behouden om crashes te voorkomen
        const managedRoles = targetMember.roles.cache.filter(role => role.managed).map(role => role.id);
        const finalRoles = [...new Set([...rolesToSet, ...managedRoles])];

        try {
            await targetMember.roles.set(finalRoles);

            const actionEmbed = new EmbedBuilder()
                .setTitle('⛔ Lid Geblacklisted')
                .setColor(config.COLORS.ERROR)
                .addFields(
                    { name: 'Gebruiker', value: `${targetUser}`, inline: true },
                    { name: 'Uitgevoerd door', value: `${interaction.user}`, inline: true },
                    { name: 'Reden', value: reason }
                )
                .setTimestamp();

            const actionChannel = interaction.guild.channels.cache.get(config.ACTION_CHANNELS.blacklist);
            if (actionChannel) await actionChannel.send({ embeds: [actionEmbed] });

            const logEmbed = new EmbedBuilder()
                .setTitle('📝 Log: Blacklist')
                .setColor(config.COLORS.LOG)
                .addFields(
                    { name: 'Gebruiker', value: `${targetUser.tag} (${targetUser.id})` },
                    { name: 'Uitgevoerd door', value: `${interaction.user.tag} (${interaction.user.id})` },
                    { name: 'Reden', value: reason }
                )
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.get(config.LOG_CHANNELS.blacklist);
            if (logChannel) await logChannel.send({ embeds: [logEmbed] });

            await interaction.reply({
                content: `**${targetUser.tag}** is succesvol geblacklisted en alle overige rollen zijn verwijderd.`,
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