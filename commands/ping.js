module.exports = {
    name: 'ping',
    description: 'Ping!',
    cooldown: 3,
    execute(message, args) {
        if (message.mentions.users.size) {
            message.mentions.users.first().send('Pong.');
        } else {
            message.channel.send('Pong.');
        }
    }
}