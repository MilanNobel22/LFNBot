const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promotie')
        .setDescription('Promoveer een lid naar een nieuwe rank')
        .addUserOption(option =>
            option.setName('gebruiker')
                .setDescription('Het lid dat je wilt promoveren')
                .setRequired(true))
        .addStringOption(option => {
            option.setName('rank')
                .setDescription('De nieuwe rank voor het lid')
                .setRequired(true);

            config.RAW_RANK_TIERS.forEach(tier => {
                option.addChoices({ name: tier.name, value: tier.key });
            });

            return option;
        }),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.STAFF_ROLE_ID)) {
            return interaction.reply({
                content: 'Je hebt geen toestemming om dit commando te gebruiken.',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('gebruiker');
        const selectedRankKey = interaction.options.getString('rank');
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!targetMember) {
            return interaction.reply({
                content: 'Gebruiker kon niet worden gevonden op deze server.',
                ephemeral: true
            });
        }

        const selectedTier = config.RAW_RANK_TIERS.find(tier => tier.key === selectedRankKey);
        if (!selectedTier) {
            return interaction.reply({
                content: 'Ongeldige rank geselecteerd.',
                ephemeral: true
            });
        }

        try {
            // 1. Verzamel ALLE mogelijke rank-rollen uit config.js en verwijder deze
            const allRankRoles = config.RAW_RANK_TIERS.flatMap(tier => tier.roles);
            await targetMember.roles.remove(allRankRoles);

            // 2. Bepaal nieuwe rollen: Hoofd-gangrol + nieuwe rank-rol
            let rolesToAdd = [config.MAIN_ROLE_ID, ...selectedTier.roles];
            const tierRoleIds = selectedTier.roles;

            // Groep 1: Adviseur, Linkerhand, Rechterhand
            const group1Triggers = ["1524394140001894511", "1524394140001894512", "1524394139821543517"];
            const group1Extra = ["1524394139960213520", "1524394139960213518", "1524394139960213517", "1524394139947634798"];

            // Groep 2: Underboss, Boss
            const group2Triggers = ["1524394140001894513", "1524394140023128286"];
            const group2Extra = ["1524394139960213520", "1524394139960213518", "1524394139960213517", "1524394139947634798", "1524394139960213515", "1535367730264408074"];

            if (tierRoleIds.some(id => group1Triggers.includes(id))) {
                rolesToAdd.push(...group1Extra);
            }
            if (tierRoleIds.some(id => group2Triggers.includes(id))) {
                rolesToAdd.push(...group2Extra);
            }

            // Unieke rollen maken
            rolesToAdd = [...new Set(rolesToAdd)];

            // 3. Toevoegen aan lid
            await targetMember.roles.add(rolesToAdd);

            // Action Embed
            const actionEmbed = new EmbedBuilder()
                .setTitle('🎉 Lid Gepromoveerd')
                .setColor(config.COLORS.SUCCESS)
                .addFields(
                    { name: 'Gebruiker', value: `${targetUser}`, inline: true },
                    { name: 'Nieuwe Rank', value: selectedTier.name, inline: true },
                    { name: 'Gepromoveerd door', value: `${interaction.user}`, inline: true }
                )
                .setTimestamp();

            const actionChannel = interaction.guild.channels.cache.get(config.ACTION_CHANNELS.promotie);
            if (actionChannel) await actionChannel.send({ embeds: [actionEmbed] });

            // Log Embed
            const logEmbed = new EmbedBuilder()
                .setTitle('📝 Log: Promotie')
                .setColor(config.COLORS.LOG)
                .addFields(
                    { name: 'Gebruiker', value: `${targetUser.tag} (${targetUser.id})` },
                    { name: 'Nieuwe Rank', value: selectedTier.name },
                    { name: 'Gepromoveerd door', value: `${interaction.user.tag} (${interaction.user.id})` }
                )
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.get(config.LOG_CHANNELS.promotie);
            if (logChannel) await logChannel.send({ embeds: [logEmbed] });

            await interaction.reply({
                content: `**${targetUser.tag}** is succesvol gepromoveerd naar **${selectedTier.name}**! Oude rank-rollen zijn verwijderd en eventuele extra rollen zijn toegekend.`,
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