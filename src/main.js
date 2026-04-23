/**
 * This is an example of how you add the various elements to 
 * your plugin. Just delete this and start from scratch.
 */


import * as en from './i18n/en.json';
import * as de from './i18n/de.json';
import Tab from './components/Tab.vue';

const id = 'map-sync';
const of = id;

SpPS.register({
    id,
    i18n: {
        en: { [id]: en.default },
        de: { [id]: de.default },
    }
});

SpPS.intoSlot({
    of,
    key: 'id',
    slot: 'tab',
    icon: 'fa-folder',
    label: 'plugin.map-sync.name',
    component: Tab,
    componentTag: 'tmp',
    props: {
        title: 'Template #1',
    }
});