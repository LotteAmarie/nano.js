module.exports = {
    name: 'user-info',
    description: 'responds with the user\'s username and user id',
    execute(message, args) {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    }
}