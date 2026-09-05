const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aannemen')
        .setDescription('Neem een nieuw lid aan')
        .addUserOption(option =>
            option.setName('gebruiker')
                .setDescription('Het lid dat je wilt aannemen')
                .setRequired(true))
        .addStringOption(option => {
            option.setName('rank')
                .setDescription('De rank waarin het lid start')
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
            // Basis rollen: Hoofd-gangrol + de gekozen rank-rol(len)
            let rolesToAdd = [config.MAIN_ROLE_ID, ...selectedTier.roles];

            // Automatische extra rollen op basis van rank-IDs
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

            // Unieke rollen maken om dubbele toevoegingen te voorkomen
            rolesToAdd = [...new Set(rolesToAdd)];

            // Verwijder eventuele oude ontslag- of blacklistrollen
            await targetMember.roles.remove([
                config.SPECIAL_ROLES.DISMISSED_ROLE,
                config.SPECIAL_ROLES.BLACKLIST_ROLE
            ]).catch(() => {});

            // Voeg de rollen toe
            await targetMember.roles.add(rolesToAdd);

            const actionEmbed = new EmbedBuilder()
                .setTitle('✅ Nieuw Lid Aangenomen')
                .setColor(config.COLORS.SUCCESS)
                .addFields(
                    { name: 'Gebruiker', value: `${targetUser}`, inline: true },
                    { name: 'Rank', value: selectedTier.name, inline: true },
                    { name: 'Aangenomen door', value: `${interaction.user}`, inline: true }
                )
                .setTimestamp();

            const actionChannel = interaction.guild.channels.cache.get(config.ACTION_CHANNELS.aangenomen);
            if (actionChannel) await actionChannel.send({ embeds: [actionEmbed] });

            const logEmbed = new EmbedBuilder()
                .setTitle('📝 Log: Aangenomen')
                .setColor(config.COLORS.LOG)
                .addFields(
                    { name: 'Gebruiker', value: `${targetUser.tag} (${targetUser.id})` },
                    { name: 'Rank', value: selectedTier.name },
                    { name: 'Aangenomen door', value: `${interaction.user.tag} (${interaction.user.id})` }
                )
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.get(config.LOG_CHANNELS.aangenomen);
            if (logChannel) await logChannel.send({ embeds: [logEmbed] });

            await interaction.reply({
                content: `**${targetUser.tag}** is succesvol aangenomen als **${selectedTier.name}** inclusief eventuele bijbehorende extra rollen!`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Er is een fout opgetreden bij het toewijzen van de rollen. Controleer of de rol van de bot hoog genoeg staat.',
                ephemeral: true
            });
        }
    }
};