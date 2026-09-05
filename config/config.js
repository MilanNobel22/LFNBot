module.exports = {
    // Staff rol ID die management commands mag gebruiken
    STAFF_ROLE_ID: "1534473795665133668",

    // Hoofd gang/familie rol die elk lid ALTIJD krijgt bij aannemen
    MAIN_ROLE_ID: "1524394139989442651",

    // Actiekanalen (Openbare, nette embeds voor de server)
    ACTION_CHANNELS: {
        aangenomen: "1524394142875123767",
        promotie: "1535366126861553777",
        ontslagen: "1524394142875123768",
        blacklist: "1524394142875123768"
    },

    // Logkanalen (Exclusieve, zakelijke staff logs)
    LOG_CHANNELS: {
        aangenomen: "1538130238569971802",
        ontslagen: "1538130275475660880",
        blacklist: "1538130275475660880",
        promotie: "1538130335336890409"
    },

    // Speciale rollen voor ontslag/blacklist
    SPECIAL_ROLES: {
        RETAIN_ROLE: "1524394139821543518",     // Rol die moet blijven staan
        DISMISSED_ROLE: "1524394139867811925",  // Rol die wordt gegeven bij ontslag
        BLACKLIST_ROLE: "1524394139867811926"   // Rol die wordt gegeven bij blacklist
    },

    // Embed Kleuren
    COLORS: {
        ACTION: 0x2b2d31,  // Modern donker/subtiel
        LOG: 0x1e1f22,     // Zakelijk donker
        SUCCESS: 0x57f287, // Groen
        WARNING: 0xfee75c, // Geel
        ERROR: 0xed4245    // Rood
    },

    // Cumulatieve Rank Structuur (Van Laag naar Hoog)
    RAW_RANK_TIERS: [
        {
            key: "rank1",
            name: "Loopjongen",
            roles: ["1524394139989442655"]
        },
        {
            key: "rank2",
            name: "Member",
            roles: ["1524394139989442656"]
        },
        {
            key: "rank3",
            name: "Full Member",
            roles: ["1524394139989442657"]
        },
        {
            key: "rank4",
            name: "Shooter",
            roles: ["1530276175040090132"]
        },
        {
            key: "rank5",
            name: "Top Shooter",
            roles: ["1524394139989442658"]
        },
        {
            key: "rank6",
            name: "Hitman",
            roles: ["1524394139989442659"]
        },
        {
            key: "rank7",
            name: "Head Hitman",
            roles: ["1524394140001894510"]
        },
        {
            key: "rank8",
            name: "Adviseur",
            roles: ["1524394140001894511"]
        },
        {
            key: "rank9",
            name: "Linkerhand",
            roles: ["1524394140001894512"]
        },
        {
            key: "rank10",
            name: "Rechterhand",
            roles: ["1524394139821543517"]
        },
        {
            key: "rank11",
            name: "Underboss",
            roles: ["1524394140001894513"]
        },
        {
            key: "rank12",
            name: "Boss",
            roles: ["1524394140023128286"]
        }
    ]
};