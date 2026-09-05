const { PermissionFlagsBits } = require('discord.js');
const config = require('../config/config');

function isStaff(member) {
    if (!member) return false;
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    return member.roles.cache.has(config.STAFF_ROLE_ID);
}

function checkBotPermissions(guild, requiredPermissions = []) {
    const me = guild.members.me;
    if (!me) return { result: false, missing: ['Bot Member Fetch Failed'] };

    const missing = requiredPermissions.filter(perm => !me.permissions.has(perm));
    return {
        result: missing.length === 0,
        missing
    };
}

function canManageMember(executorMember, targetMember, guildMe) {
    if (targetMember.id === guildMe.id) {
        return { canManage: false, reason: 'De bot kan zichzelf niet beheren.' };
    }
    
    if (targetMember.roles.highest.position >= guildMe.roles.highest.position) {
        return { 
            canManage: false, 
            reason: 'De hoogste rol van de bot staat niet hoog genoeg in de hiÃ«rarchie om deze gebruiker te beheren.' 
        };
    }

    if (executorMember.id !== executorMember.guild.ownerId && 
        targetMember.roles.highest.position >= executorMember.roles.highest.position) {
        return { 
            canManage: false, 
            reason: 'Je kunt geen gebruikers beheren met een gelijke of hogere rol dan jijzelf.' 
        };
    }

    return { canManage: true };
}

module.exports = {
    isStaff,
    checkBotPermissions,
    canManageMember
};
