# BroadcastBot

BroadcastBot is a Discord bot designed to broadcast messages to specified servers using webhooks. This guide will help you set up and run the bot on a Windows machine.

## Prerequisites

1. [Node.js](https://nodejs.org/) installed on your machine.
2. A Discord bot token and client ID. You can create a bot and get a token/ID from the [Discord Developer Portal](https://discord.com/developers/applications).
3. Permission to create webhooks, or at least the URL for a webhook for each server you intend to include.

## Installation
### Git Clone:
1. **Have Node.js installed and Clone the repository:**
   ```bash
   git clone https://github.com/avexiis/broadcastbot.git
   cd broadcastbot

2. **Install Dependencies:**
```bash
npm install discord.js fs axios
```
3. **Configure the bot:**
Open the bot.js file and replace the placeholder values with your actual bot token, client ID, and authorized user ID:
```JS
const TOKEN = 'BOT_TOKEN_GOES_HERE';
const CLIENT_ID = 'BOT_CLIENT_ID_GOES_HERE';
const AUTHORIZED_USER_ID = 'YOUR_DISCORD_USER_ID';
```
4. Run the bot by opening `Run.bat` OR open a command prompt window in your bot directory and type:
```bash
node bot.js
```

### Manual:
1. **Make sure you have node.js installed on your system**

2. **Download the repository as a .zip file**

3. **Open a command prompt and navigate to the bot directory**
```bash
cd C:\path\to\bot\folder
```
4. **Install Dependencies**
```bash
npm init -y
npm install discord.js fs axios
```
5. **Configure the bot:**
Open the bot.js file and replace the placeholder values with your actual bot token, client ID, and authorized user ID:
```JS
const TOKEN = 'BOT_TOKEN_GOES_HERE';
const CLIENT_ID = 'BOT_CLIENT_ID_GOES_HERE';
const AUTHORIZED_USER_ID = 'YOUR_DISCORD_USER_ID';
```
6. Run the bot by opening `Run.bat` OR open a command prompt window in your bot directory and type:
```bash
node bot.js
```


## Commands
- `/broadcast` - Broadcast a message to specified servers.

- `/addwebhook`- Add a webhook to the broadcast list.

Parameters: 

**Name** (required): The name of the server or channel.

**URL** (required): The webhook URL.

- `/removewebhook` - Remove a webhook from the broadcast list.

Parameters:

**Name** (required): The name of the server or channel.

## How it works
When the /broadcast command is issued, the bot shows a modal to collect the title and description for the embed message. Once the embed is created, the bot shows a dropdown menu to select the servers to broadcast the message to. Upon confirmation, the bot sends the embed message to the selected servers using the stored webhooks.

Discord limits the number of total simultaneous webhooks to 25 per interaction. To notify more than 25 servers, you wil have to run the broadcast command multiple times.
