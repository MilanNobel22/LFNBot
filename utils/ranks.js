const config = require('../config/config');

function getProcessedRanks() {
    const processed = {};
    let accumulatedRoles = [];

    for (const tier of config.RAW_RANK_TIERS) {
        accumulatedRoles = [...new Set([...accumulatedRoles, ...tier.roles])];
        processed[tier.key] = {
            key: tier.key,
            name: tier.name,
            tierSpecificRoles: tier.roles,
            roles: [...accumulatedRoles]
        };
    }

    return processed;
}

const RANKS = getProcessedRanks();

function getAllRankRoleIds() {
    const roleSet = new Set();
    for (const rankKey in RANKS) {
        RANKS[rankKey].roles.forEach(roleId => roleSet.add(roleId));
    }
    return Array.from(roleSet);
}

function getCurrentRank(member) {
    const rankKeys = Object.keys(RANKS).reverse();
    for (const key of rankKeys) {
        const rank = RANKS[key];
        const hasAllTierRoles = rank.tierSpecificRoles.every(roleId => member.roles.cache.has(roleId));
        if (hasAllTierRoles) {
            return rank;
        }
    }
    return null;
}

async function sendDM(user, embed) {
    try {
        await user.send({ embeds: [embed] });
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    RANKS,
    getAllRankRoleIds,
    getCurrentRank,
    sendDM
};
