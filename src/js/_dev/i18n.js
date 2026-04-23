import { createI18n } from 'vue-i18n';
import * as en from '../../i18n/en.json';
import * as de from '../../i18n/de.json';


export const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        en: { 
            plugin: {
                ['map-sync']: en.default
            }
        },
        de: {  
            plugin: {
                ['map-sync']: de.default
            }
        },
    }
});
