const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

function createActionEmbed(title, description, fields = []) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(config.COLORS.ACTION)
        .setTimestamp()
        .setFooter({ text: 'Management System' });

    if (description) embed.setDescription(description);
    if (fields.length > 0) embed.addFields(fields);

    return embed;
}

function createLogEmbed(title, fields = []) {
    return new EmbedBuilder()
        .setTitle(`[LOG] ${title}`)
        .setColor(config.COLORS.LOG)
        .addFields(fields)
        .setTimestamp()
        .setFooter({ text: 'Audit Logging System' });
}

function createErrorEmbed(message) {
    return new EmbedBuilder()
        .setTitle('Foutmelding')
        .setDescription(message)
        .setColor(config.COLORS.ERROR)
        .setTimestamp();
}

function createSuccessEmbed(message) {
    return new EmbedBuilder()
        .setTitle('Succesvol')
        .setDescription(message)
        .setColor(config.COLORS.SUCCESS)
        .setTimestamp();
}

module.exports = {
    createActionEmbed,
    createLogEmbed,
    createErrorEmbed,
    createSuccessEmbed
};
