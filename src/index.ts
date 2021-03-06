import Discord from 'discord.js';
import { Config } from './config';
import { MessageRoutes } from './message-routes';

async function start(): Promise<void> {
    await Config.load();

    const client = new Discord.Client();
    client.on('ready', () => {
        console.log('I am ready!');
    });
    client.on('message', async (message) => {
        try {
            await MessageRoutes.handle(message);
        } catch (err) {
            console.error(err);
        }
    });
    await client.login(Config.values.bot.token);
}

start().catch((err) => {
    console.error(err);
    process.exit(1);
});
