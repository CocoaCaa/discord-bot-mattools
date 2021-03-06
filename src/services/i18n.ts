import i18next, { TFunction } from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { Config } from '../config';

export const I18n = {
    init() {
        i18next.use(Backend).init({
            backend: {
                loadPath: path.resolve(process.cwd(), 'locales', '{{lng}}.json'),
            },
            fallbackLng: ['en', 'ja-JP', 'zh-Hans', 'zh-Hant'],
        });
    },
    getFixedTByRoleId(roleId?: string) {
        const lng = Config.values.roleLanguages[roleId ?? ''];
        if (!lng) {
            return i18next.getFixedT('en');
        }
        return i18next.getFixedT(lng);
    },
    get getFixedT(): TFunction {
        return i18next.getFixedT.bind(i18next);
    },
};
