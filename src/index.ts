import Discord from 'discord.js';

async function start(): Promise<void> {
    const client = new Discord.Client();
    client.on('ready', () => {
        console.log('I am ready!');
    });
    client.on('message', (message) => {
        if (message.content === 'ping') {
            message.channel.send('pong');
        }
    });

    client.login('your token here');
}

start().catch((err) => {
    console.error(err);
    process.exit(1);
});
