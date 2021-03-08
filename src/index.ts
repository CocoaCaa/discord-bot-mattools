import Discord from 'discord.js';
import { Config } from './config';
import { MessageRoutes } from './message-routes';
import { ApplyRolesEmbeds } from './services/apply-roles-embeds';
import { I18n } from './services/i18n';

async function start(): Promise<void> {
    await Config.load();
    I18n.init();

    const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
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
    client.on('messageReactionAdd', async (reaction, user) => {
        if (user.bot) {
            return;
        }

        try {
            if (reaction.partial) {
                await reaction.fetch();
            }
            await ApplyRolesEmbeds.handleFromMessageReactionAdd(reaction, user);
        } catch (err) {
            console.error(err);
        }
    });
    client.on('messageReactionRemove', async (reaction, user) => {
        if (user.bot) {
            return;
        }

        try {
            if (reaction.partial) {
                await reaction.fetch();
            }
            await ApplyRolesEmbeds.handleFromMessageReactionRemove(reaction, user);
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
