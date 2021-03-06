import Discord from 'discord.js';
import { ApplyRolesEmbeds } from './services/apply-roles-embeds';
import { AssignRoleChannel } from './services/assign-role-channel';

export const MessageRoutes = {
    async handle(message: Discord.Message) {
        if (message.author.bot) {
            return;
        }

        // if (await AssignRoleChannel.handleFromDiscordMessage(message)) {
        //     return;
        // }

        if (await ApplyRolesEmbeds.handleFromDiscordMessage(message)) {
            return;
        }
    },
};
