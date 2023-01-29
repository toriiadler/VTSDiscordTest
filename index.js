'use strict';

// Require the necessary discord.js and vtubestudio classes
const { Client, Intents, VoiceChannel } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { token } = require('./config.json');
const { WebSocket } = require("ws");
const { WebSocketBus, ApiClient, Plugin } = require("vtubestudio");

//websockets for vtubestudio
const webSocket = new WebSocket("ws://localhost:8001");
const bus = new WebSocketBus(webSocket);

// Create a new vtubestudio client instance
const apiClient = new ApiClient(bus);

// vtubestudio plugin wrapper
const plugin = new Plugin(apiClient, "Torii's Plugin", "Torii Adler");

// Create a new discord client instance
const client = new Client({ intents: ['GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILDS'] });
const tables = require('./tables.json'); // json table has user id as key and two hotkey ids in a list, can contain multiple ({"user id here": [ "hotkey id here", "hotkey id here"]}) refer to tables.json for more info

// TODO: CREATE VARIABLE DETERMINABLE BY USER FOR USER ID DETECTION
// TODO: MAKE CUSTOM PARAMETER FOR USER SPEAKING (BOOLEAN?)


async function vtubestudioconnect() { // defines vtubestudio connection
    const { WebSocket } = require("ws");
    const { WebSocketBus, ApiClient, Plugin } = require("vtubestudio");
    const webSocket = new WebSocket("ws://localhost:8001");
    const bus = new WebSocketBus(webSocket);
    const apiClient = new ApiClient(bus);

    const plugin = new Plugin(apiClient, "Torii's Plugin", "Torii Adler");


}

async function togglespeak(userID) { 
    await plugin.apiClient.hotkeyTrigger({ hotkeyID: tables[userID][0] });
    await plugin.apiClient.hotkeyTrigger({ hotkeyID: tables[userID][1] });
}
//async function DefineFunctionHere() {
    // await plugin.apiClient.hotkeyTrigger({ hotkeyID: "" }); //hotkeyID is hardcodable because i am a bad programmer
//}


client.on("messageCreate", async (message) => {
    if (message.content.toLowerCase() === "test") { // makes bot join voice call
        let connection = getVoiceConnection(message.guildId);
        if (!connection) {
            try {
                connection = joinVoiceChannel({
                    channelId: message.member.voice.channelId,
                    guildId: message.guildId,
                    adapterCreator: message.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: true,
                });
            } catch (error) {
                console.warn(error);
            }
        }
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
            connection.receiver.speaking.on("start", (userId) => {
                console.log(`${userId} start`);
                if (tables.hasOwnProperty(userId)) {
                    togglespeak(userId);
                }
            });
            connection.receiver.speaking.on("end", (userId) => {
                console.log(`${userId} end`);
                if (tables.hasOwnProperty(userId)) {
                    togglespeak(userId);
                }
            });
            console.log("Ready");
        } catch (error) {
            console.log(error);
            let connection = getVoiceConnection(message.guildId);
            await connection.disconnect();
        }
    } else if (message.content.toLowerCase() === "leave") { // disconnects bot
        let connection = getVoiceConnection(message.guildId);
        await connection.disconnect(); 
    } else if (message.content.toLowerCase() === "insert message here") { // user defined hard coded function
	    //await DefineFunctionHere()
    }
});




// When the client is ready, run this code (only once)
client.once('ready', () => {
    plugin.authenticate();
	console.log('Ready!');
	client.user.setActivity('peepee poo poo haha', { type: 'WATCHING' });
});

// Login to Discord with your client's token
client.login(token);

vtubestudioconnect();

