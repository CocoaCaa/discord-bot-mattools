import Discord from 'discord.js';
import { Config } from '../config';
import path from 'path';
import fs from 'fs';
import { TFunction } from 'i18next';

interface Data {
    channels: Record<
        string,
        {
            users: Record<
                string,
                {
                    roleId: string;
                    name: string;
                }
            >;
        }
    >;
}

const dataFilePath = path.resolve(process.cwd(), '.data', 'assign-role-channels.json');

let _data: Data;

export const AssignRoleChannel = {
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
    async leave(message: Discord.Message, t: TFunction) {
        try {
            const data = await this.getData();
            const channelData = data.channels[message.channel.id];
            if (!channelData) {
                return;
            }
            const userData = channelData.users[message.author.id];
            if (!userData) {
                return;
            }
            await message.member?.roles.remove(userData.roleId);
            delete channelData.users[message.author.id];
            await this.saveData();
            await message.channel.send(
                `ROLE LEAVED> ${t('assignRoleChannel.leave', {
                    userId: message.author.id,
                    akaName: userData.name,
                    roleId: userData.roleId,
                })}`,
            );
        } finally {
            await message.delete();
        }
    },
    async join(message: Discord.Message, t: TFunction, settings: typeof Config.values.assignRoleChannels[string]) {
        const data = await this.getData();
        if (!data.channels[message.channel.id]) {
            data.channels[message.channel.id] = {
                users: {},
            };
        }
        const channelData = data.channels[message.channel.id]!;
        if (channelData.users[message.author.id]) {
            await message.delete();
            return;
        }

        const name = message.content.trim();
        channelData.users[message.author.id] = {
            roleId: settings.roleId,
            name,
        };
        await message.member?.roles.add(settings.roleId);
        await this.saveData();
        await message.delete();
        await message.channel.send(
            `ROLE JOINED> ${t('assignRoleChannel.join', {
                userId: message.author.id,
                akaName: name,
                roleId: settings.roleId,
            })}`,
        );
    },
    async handleFromDiscordMessage(message: Discord.Message, t: TFunction): Promise<boolean> {
        const settings = Config.values.assignRoleChannels[message.channel.id];
        if (!settings) {
            return false;
        }

        if (message.content.trim() === settings.leaveCommand) {
            await this.leave(message, t);
            return true;
        }

        await this.join(message, t, settings);
        return true;
    },
};
