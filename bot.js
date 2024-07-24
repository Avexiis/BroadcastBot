const { Client, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, EmbedBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const TOKEN = 'BOT_TOKEN_GOES_HERE';
const CLIENT_ID = 'BOT_CLIENT_ID_GOES_HERE';
const AUTHORIZED_USER_ID = 'YOUR_DISCORD_USER_ID';

const commands = [
    {
        name: 'broadcast',
        description: 'Broadcast a message to specified servers',
        options: []
    },
    {
        name: 'addwebhook',
        description: 'Add a webhook to the broadcast list',
        options: [
            {
                name: 'name',
                type: 3, // STRING
                description: 'The name of the server or channel',
                required: true
            },
            {
                name: 'url',
                type: 3, // STRING
                description: 'The webhook URL',
                required: true
            }
        ]
    },
    {
        name: 'removewebhook',
        description: 'Remove a webhook from the broadcast list',
        options: [
            {
                name: 'name',
                type: 3, // STRING
                description: 'The name of the server or channel',
                required: true
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

let embedData = null;  // Temporary storage for embed data
const serverSelectionMap = new Map();  // Map to store server selections

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'broadcast') {
            if (interaction.user.id !== AUTHORIZED_USER_ID) {
                return interaction.reply('You are not authorized to use this command.');
            }

            const modal = new ModalBuilder()
                .setCustomId('embedModal')
                .setTitle('Create an Embed');

            const titleInput = new TextInputBuilder()
                .setCustomId('titleInput')
                .setLabel('Title')
                .setStyle(TextInputStyle.Short);

            const descriptionInput = new TextInputBuilder()
                .setCustomId('descriptionInput')
                .setLabel('Description')
                .setStyle(TextInputStyle.Paragraph);

            const actionRow1 = new ActionRowBuilder().addComponents(titleInput);
            const actionRow2 = new ActionRowBuilder().addComponents(descriptionInput);

            modal.addComponents(actionRow1, actionRow2);

            await interaction.showModal(modal);
        } else if (commandName === 'addwebhook') {
            if (interaction.user.id !== AUTHORIZED_USER_ID) {
                return interaction.reply('You are not authorized to use this command.');
            }

            const name = interaction.options.getString('name');
            const url = interaction.options.getString('url');
            const webhooks = JSON.parse(fs.readFileSync('webhooks.json'));
            if (!webhooks.webhooks[name]) {
                webhooks.webhooks[name] = url;
                fs.writeFileSync('webhooks.json', JSON.stringify(webhooks, null, 2));
                await interaction.reply(`Webhook ${name} added to the list.`);
            } else {
                await interaction.reply(`Webhook ${name} is already in the list.`);
            }
        } else if (commandName === 'removewebhook') {
            if (interaction.user.id !== AUTHORIZED_USER_ID) {
                return interaction.reply('You are not authorized to use this command.');
            }

            const name = interaction.options.getString('name');
            let webhooks = JSON.parse(fs.readFileSync('webhooks.json'));
            if (webhooks.webhooks[name]) {
                delete webhooks.webhooks[name];
                fs.writeFileSync('webhooks.json', JSON.stringify(webhooks, null, 2));
                await interaction.reply(`Webhook ${name} removed from the list.`);
            } else {
                await interaction.reply(`Webhook ${name} is not in the list.`);
            }
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'embedModal') {
            const title = interaction.fields.getTextInputValue('titleInput');
            const description = interaction.fields.getTextInputValue('descriptionInput');

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(0x00ff00);

            embedData = embed.toJSON();  // Store the embed data

            const webhooks = JSON.parse(fs.readFileSync('webhooks.json'));
            const options = Object.keys(webhooks.webhooks).map(name => ({
                label: name,
                value: name
            }));

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_servers')
                        .setPlaceholder('Select servers to broadcast to')
                        .addOptions(options)
                        .setMaxValues(Math.min(options.length, 25))  // Allow selecting up to 25 options
                );

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'select_servers') {
            const selectedServers = interaction.values;

            if (!embedData) {
                return interaction.reply({ content: 'Error: Embed data not found.', ephemeral: true });
            }

            const uniqueId = crypto.randomUUID();  // Generate a unique ID
            serverSelectionMap.set(uniqueId, selectedServers);  // Store the selected servers

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`send_${uniqueId}`)
                        .setLabel('Send')
                        .setStyle(ButtonStyle.Success)
                );

            await interaction.reply({ content: 'Ready to send the embed to selected servers:', components: [row], ephemeral: true });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId.startsWith('send_')) {
            const uniqueId = interaction.customId.split('_')[1];
            const selectedServers = serverSelectionMap.get(uniqueId);  // Retrieve the selected servers

            if (!embedData) {
                return interaction.reply({ content: 'Error: Embed data not found.', ephemeral: true });
            }

            const webhooks = JSON.parse(fs.readFileSync('webhooks.json'));

            for (const server of selectedServers) {
                const url = webhooks.webhooks[server];
                if (url) {
                    try {
                        await axios.post(url, {
                            content: null,
                            embeds: [embedData],
                            allowed_mentions: { parse: [] }
                        });
                    } catch (error) {
                        console.error(`Error sending message to webhook ${server}:`, error);
                    }
                }
            }

            await interaction.reply('Broadcast message sent.');
            serverSelectionMap.delete(uniqueId);  // Clean up the stored selection
        }
    }
});

client.login(TOKEN);
