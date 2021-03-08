import Discord from 'discord.js';
import { Config } from '../config';
import path from 'path';
import fs from 'fs';

interface Data {
    channels: Record<
        string,
        {
            embeds: Record<
                string,
                {
                    messageId: string;
                }
            >;
        }
    >;
}

const dataFilePath = path.resolve(process.cwd(), '.data', 'apply-roles-embeds.json');

let _data: Data;

export const ApplyRolesEmbeds = {
    async getData(): Promise<Data> {
        try {
            if (!_data) {
                _data = JSON.parse(await fs.promises.readFile(dataFilePath, 'utf-8'));
            }
        } catch {
            _data = {
                channels: {},
            };
        }
        return _data;
    },
    async saveData(): Promise<void> {
        await fs.promises.mkdir(path.dirname(dataFilePath), { recursive: true });
        await fs.promises.writeFile(dataFilePath, JSON.stringify(_data), 'utf-8');
    },
    async remove(message: Discord.Message, embedName: string): Promise<void> {
        const data = await this.getData();
        const channelData = data.channels[message.channel.id];
        if (!channelData) {
            return;
        }
        const embedData = channelData.embeds[embedName];
        if (!embedData) {
            return;
        }
        const embedMessage = await message.channel.messages.fetch(embedData.messageId, false, true);
        await embedMessage.delete();
        delete channelData.embeds[embedName];
        await this.saveData();
    },
    async add(message: Discord.Message, embedName: string): Promise<void> {
        const settings = Config.values.applyRolesEmbeds[embedName];
        if (!settings) {
            return;
        }

        const data = await this.getData();
        if (!data.channels[message.channel.id]) {
            data.channels[message.channel.id] = {
                embeds: {},
            };
        }
        const channelData = data.channels[message.channel.id]!;
        if (channelData.embeds[embedName]) {
            return;
        }

        const embed = new Discord.MessageEmbed().setTitle(settings.title).setDescription(settings.description);

        const sentMessage = await message.channel.send(embed);

        for (const [emoji] of Object.entries(settings.reactions)) {
            await sentMessage.react(emoji);
        }

        channelData.embeds[embedName] = {
            messageId: sentMessage.id,
        };

        await this.saveData();
    },
    async getReactionSettings(
        reaction: Discord.MessageReaction,
    ): Promise<typeof Config.values.applyRolesEmbeds[string]['reactions'][string] | undefined> {
        const data = await this.getData();
        const channelData = data.channels[reaction.message.channel.id];
        if (!channelData) {
            return;
        }
        const foundEmbedWithData = Object.entries(channelData.embeds).find(
            ([k, v]) => v.messageId === reaction.message.id,
        );
        if (!foundEmbedWithData) {
            return;
        }
        const [embedName] = foundEmbedWithData;

        const settings = Config.values.applyRolesEmbeds[embedName];
        if (!settings) {
            return;
        }

        return settings.reactions[reaction.emoji.name];
    },
    async handleFromDiscordMessage(message: Discord.Message): Promise<boolean> {
        const { commandPrefix } = Config.values;
        if (
            !message.content.startsWith(`${commandPrefix}mt embed`) ||
            !message.member?.hasPermission('ADMINISTRATOR')
        ) {
            return false;
        }

        const [, , action, embedName] = message.content.split(' ', 4);
        if (!action || !embedName) {
            return false;
        }

        switch (action) {
            case 'add':
                await this.add(message, embedName);
                return true;
            case 'remove':
                await this.remove(message, embedName);
                return true;
        }

        return false;
    },
    async handleFromMessageReactionAdd(
        reaction: Discord.MessageReaction,
        user: Discord.User | Discord.PartialUser,
    ): Promise<void> {
        const reactionSettings = await this.getReactionSettings(reaction);
        if (!reactionSettings) {
            return;
        }
        const member = await reaction.message.guild?.members.fetch(user.id);
        if (!member) {
            return;
        }
        await member.roles.add(reactionSettings.role);
    },
    async handleFromMessageReactionRemove(
        reaction: Discord.MessageReaction,
        user: Discord.User | Discord.PartialUser,
    ): Promise<void> {
        const reactionSettings = await this.getReactionSettings(reaction);
        if (!reactionSettings) {
            return;
        }
        const member = await reaction.message.guild?.members.fetch(user.id);
        if (!member) {
            return;
        }
        await member.roles.remove(reactionSettings.role);
    },
};
