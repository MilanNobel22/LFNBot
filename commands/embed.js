const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { isStaff } = require('../utils/permissions');
const { createActionEmbed, createErrorEmbed } = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Maak een webhook aan voor het huidige kanaal'),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [createErrorEmbed('Je hebt geen toestemming om dit command te gebruiken.')],
                ephemeral: true
            });
        }

        const channel = interaction.channel;

        if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
            return interaction.reply({
                embeds: [createErrorEmbed('Webhooks kunnen alleen in tekst- of aankondigingskanalen gemaakt worden.')],
                ephemeral: true
            });
        }

        if (!interaction.guild.members.me.permissionsIn(channel).has(PermissionFlagsBits.ManageWebhooks)) {
            return interaction.reply({
                embeds: [createErrorEmbed('De bot mist de **Manage Webhooks** permissie in dit kanaal.')],
                ephemeral: true
            });
        }

        try {
            const webhook = await channel.createWebhook({
                name: 'Server Embed Webhook',
                reason: `Aangemaakt via /embed door ${interaction.user.tag}`
            });

            const responseEmbed = createActionEmbed('Webhook Aangemaakt', 'Er is succesvol een nieuwe webhook gekoppeld aan dit kanaal.', [
                { name: 'Kanaal', value: `<#${channel.id}>`, inline: true },
                { name: 'Webhook Naam', value: webhook.name, inline: true },
                { name: 'Webhook URL', value: `\`\`\`${webhook.url}\`\`\``, inline: false }
            ]);

            return interaction.reply({
                embeds: [responseEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Embed Webhook Error:', error);
            return interaction.reply({
                embeds: [createErrorEmbed('Er is een fout opgetreden bij het aanmaken van de webhook.')],
                ephemeral: true
            });
        }
    }
};
