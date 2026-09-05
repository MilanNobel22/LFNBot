const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

client.once('ready', () => {
    console.log(`[ONLINE] Ingelogd als ${client.user.tag}`);
    client.user.setActivity('Management Systeem', { type: 3 });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Fout bij uitvoering van command ${interaction.commandName}:`, error);
        
        const errorContent = { 
            content: 'Er is een interne fout opgetreden bij de uitvoering van dit command.', 
            ephemeral: true 
        };

        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(errorContent).catch(() => null);
        } else {
            await interaction.reply(errorContent).catch(() => null);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
