import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface Config {
    bot: {
        token: string;
    };
    applyRolesEmbeds: Record<
        string,
        {
            title: string;
            description: string;
            reactions: Record<
                string,
                {
                    role: string;
                }
            >;
        }
    >;
    assignRoleChannels: Record<
        string,
        {
            roleId: string;
            leaveCommand: string;
        }
    >;
}

let config: Config;

export const Config = {
    async load() {
        const configFile = await fs.promises.readFile(path.resolve(process.cwd(), 'config.yml'), 'utf-8');
        config = yaml.load(configFile) as any;
    },
    get values(): Config {
        return config;
    },
};
