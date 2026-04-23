/**
 * This is an example of how you add the various elements to 
 * your plugin. Just delete this and start from scratch.
 */

import Example from './components/Example.vue';
import Attribute from './components/Attribute.vue';

import * as en from './i18n/en.json';
import * as de from './i18n/de.json';

const id = 'template';
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
    key: 'template',
    slot: 'tab',
    icon: 'fa-folder',
    label: 'template',
    component: Example,
    componentTag: 'tmp',
    props: {
        title: 'Template #1',
    }
});

SpPS.intoSlot({
    of,
    key: 'template-two',
    slot: 'tab',
    icon: 'fa-folder',
    label: 'template-2',
    component: Example,
    componentTag: 'tmp',
    props: {
        title: 'Template #2',
    }
});

SpPS.intoSlot({
    of,
    key: 'template-tools',
    slot: 'tools',
    icon: 'fa-folder',
    label: 'plugin-tools',
    href: 'tools',
    args: {
        title: 'Plugin Tools',
    }
});

SpPS.intoSlot({
    of,
    key: 'template-settings',
    slot: 'settings',
    icon: 'fa-folder',
    label: 'plugin-settings',
    href: 'settings',
    args: {
        title: 'Template Settings',
    }
});

SpPS.registerRoutes(id, [{
    path: '/template/tools',
    component: Example,
    props: {
        title: 'Plugin Tools',
    },
}, {
    path: '/template/settings',
    component: Example,
    props: {
        title: 'Template Settings',
    },
}]);


SpPS.registerComponent({
    of,
    type: 'attribute',
    key: id,
    datatype: 'template_attribute',
    component: Attribute,
});