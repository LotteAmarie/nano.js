const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, watchedMessages } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: '${prefix}${command.name} ${command.usage}'`;
        }

        return message.channel.send(reply);
    }

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the '${command.name}' command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.on('raw', event => {
    if (event.t === 'MESSAGE_REACTION_ADD') {
        watchedMessages.map(msgId => {
            if (event.d.message_id === msgId) {
                let reactionChannel = client.channels.get(event.d.channel_id);

                if (reactionChannel.messages.has(event.d.message_id)) // Is the message already cached?
                    return;
                else { // recache the message and fire the event.
                    reactionChannel.fetchMessage(event.d.message_id)
                    .then(message => {
                        let messageReaction; 
                        if (event.d.emoji.id === null) {
                            messageReaction = message.reactions.get(event.d.emoji.name);
                        } else {
                            messageReaction = message.reactions.get(event.d.emoji.name + ':' + event.d.emoji.id);
                        }

                        let user = client.users.get(event.d.user_id);
                        client.emit('messageReactionAdd', messageReaction, user);
                    })
                    .catch(err => console.log(err));
                }
            }
        });
    } else if (event.t === 'MESSAGE_REACTION_REMOVE') {
        watchedMessages.map(msgId => {
            if (event.d.message_id === msgId) {
                let reactionChannel = client.channels.get(event.d.channel_id);

                if (reactionChannel.messages.has(event.d.message_id)) // Is the message already cached?
                    return;
                else { // recache the message and fire the event.
                    reactionChannel.fetchMessage(event.d.message_id)
                    .then(message => {
                        let messageReaction; 
                        if (event.d.emoji.id === null) {
                            messageReaction = message.reactions.get(event.d.emoji.name);
                        } else {
                            messageReaction = message.reactions.get(event.d.emoji.name + ':' + event.d.emoji.id);
                        }

                        let user = client.users.get(event.d.user_id);
                        client.emit('messageReactionRemove', messageReaction, user);
                    })
                    .catch(err => console.log(err));
                }
            }
        });
    }
});

client.on('messageReactionAdd', (messageReaction, user) => {
    if (messageReaction.message.id === watchedMessages[0]) { // Seated with Liquor, Final Fantasy 14 
        if (messageReaction.emoji.name === '✅') {
        var role = messageReaction.message.guild.roles.find(role => role.name.toLowerCase() === 'Final Fantasy 14'.toLowerCase());
            if (role) {
                var member = messageReaction.message.guild.members.find(member => member.id === user.id);
                if (member) {
                member.addRole(role.id);
                }
            }
        }
    }
});

client.on('messageReactionRemove', (messageReaction, user) => {
    if (messageReaction.message.id === watchedMessages[0]) { // Seated with Liquor, Final Fantasy 14
        if (messageReaction.emoji.name === '✅') {
            var role = messageReaction.message.guild.roles.find(role => role.name.toLowerCase() === 'Final Fantasy 14'.toLowerCase());
            if (role) {
                var member = messageReaction.message.guild.members.find(member => member.id === user.id);
                if (member) {
                    member.removeRole(role.id);
                }
            }
        }
    }
});

client.login(token);