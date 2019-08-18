module.exports = {
    name: 'prune',
    description: 'Deletes a given number of messages from the current channel. Restricted to messages newer than 25 days and between 1 and 99 messages.',
    execute(message, args) {
        const amount = parseInt(args[0]) + 1;

        if (isNaN(amount)) {
            return message.reply('That doesn\'t seem to be a valid number.');
        } else if (amount <= 1 || amount > 100) {
            return message.reply('you need to input a number between 1 and 99');
        }

        message.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            message.channel.send('there was an error trying to prune message in this channel!');
        });       
    }
}