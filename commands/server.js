module.exports = {
    name: 'server',
    description: 'Responds with the name of the current server',
    execute(message, args) {
        message.channel.send(`This server's name is: ${message.guild.name}`);
    }
}