import Discord from 'discord.js';
import { Config } from './config';
import { ApplyRolesEmbeds } from './services/apply-roles-embeds';
import { AssignRoleChannel } from './services/assign-role-channel';
import { I18n } from './services/i18n';

export const MessageRoutes = {
    async handle(message: Discord.Message) {
        if (message.author.bot) {
            return;
        }

        const roleIdsLanguages = Object.keys(Config.values.roleLanguages);
        const role = message.member!.roles.cache.find((role) => roleIdsLanguages.includes(role.id));
        const t = I18n.getFixedTByRoleId(role?.id);

        if (await ApplyRolesEmbeds.handleFromDiscordMessage(message)) {
            return;
        }

        if (await AssignRoleChannel.handleFromDiscordMessage(message, t)) {
            return;
        }
    },
};
