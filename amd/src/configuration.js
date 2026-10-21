// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Editor configuration for the Tiny font options plugin.
 *
 * Moodle removes fontfamily, fontsize, forecolor, backcolor and justify from the editor,
 * keeps headings and most text formatting in the Format menu only,
 * and does not load the advlist and autolink TinyMCE plugins,
 * so they are added back here after that has happened.
 *
 * The buttons are added to toolbar sections here; plugins configured after this one (by name) add theirs after ours.
 * Once every plugin has been configured, the toolbar is put into the order of the toolbar order settings,
 * or else into the default order (see defaultOrders), with the buttons of all plugins.
 *
 * @module      tiny_fontoptions/configuration
 * @copyright   2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getPluginOptionName} from 'editor_tiny/options';
import {
    addMenubarItem,
    addToolbarSection,
} from 'editor_tiny/utils';
import {
    alignJustifyItem,
    backColorItem,
    blocksItem,
    extraPlugins,
    fontFamilyItem,
    fontSizeItem,
    foreColorItem,
    insertItems,
    justifyMenuItem,
    pluginName,
    removeFormatItem,
    scriptItems,
    textFormatItems,
} from './common';

/**
 * @var {Object} The default toolbar orders, in the format of plugininfo::format_toolbar_order().
 *
 * TinyMCE moves whole sections to the "More" drawer, from the end, so the most used ones come first
 * and the wide lists (fonts, headings) after them. The sections are kept short, as the drawer wraps them,
 * and a section wider than a phone screen would be split, so there the wide headings list only shares its section
 * with the alignment buttons, and the lists (their split buttons are wider) get a section of their own.
 * The buttons of other plugins are placed as well, when the site has them; all other buttons follow ("*").
 */
const defaultOrders = {
    desktop: 'undo redo | bold italic underline strikethrough'
        + ' | tiny_forecolor tiny_backcolor forecolor backcolor tiny_styles_button removeformat'
        + ' | superscript subscript emoticons charmap tiny_equation tiny_mce_wiris_formulaeditor'
        + ' tiny_mce_wiris_formulaeditorchemistry | fontfamily fontsize | blocks outdent indent bullist numlist'
        + ' | alignleft aligncenter alignright alignjustify | tiny_link_link tiny_link_unlink tiny_noautolink'
        + ' | tiny_media_image tiny_media_video tiny_h5p | table hr | fullscreen | *',
    phone: 'undo redo | bold italic underline strikethrough | tiny_forecolor tiny_backcolor forecolor backcolor removeformat'
        + ' | superscript subscript emoticons charmap | fontfamily fontsize'
        + ' | blocks alignleft aligncenter alignright alignjustify | bullist numlist outdent indent'
        + ' | tiny_link_link tiny_link_unlink tiny_noautolink | tiny_media_image tiny_media_video tiny_h5p | table hr'
        + ' | tiny_equation fullscreen | *',
};

/** @var {boolean} Whether TinyMCE runs on a phone. */
let phone = false;

/**
 * Remember the device type, once TinyMCE has been loaded.
 *
 * @param {TinyMCE} tinyMCE
 */
export const setTinyMCE = (tinyMCE) => {
    phone = tinyMCE.Env.deviceType.isPhone();
};

/**
 * Whether to lay out the toolbar for a phone.
 *
 * @param {string} preview The device of the hidden editor of a toolbar order setting, or an empty string.
 * @returns {boolean}
 */
const isPhone = (preview) => (preview ? preview === 'phone' : phone);

const getMenuConfiguration = (instanceConfig, config) => {
    const format = (instanceConfig.menu?.format?.items ?? '').split(' ');
    let menu = instanceConfig.menu;

    // Put them back to where TinyMCE has them by default.
    const fontsAfter = format.includes('blocks') ? 'blocks' : null;
    menu = addMenubarItem(menu, 'format', `${fontFamilyItem} ${fontSizeItem}`, fontsAfter);

    if (config.colors) {
        const colorsAfter = format.includes('lineheight') ? 'lineheight' : null;
        menu = addMenubarItem(menu, 'format', `| ${foreColorItem} ${backColorItem}`, colorsAfter);
    }

    if (config.justify) {
        const justifyAfter = format.includes('align') ? 'align' : null;
        menu = addMenubarItem(menu, 'format', justifyMenuItem, justifyAfter);
    }
    return menu;
};

/**
 * Add buttons to a toolbar section, skipping the ones which are already on the toolbar.
 *
 * @param {Array} toolbar
 * @param {string} section
 * @param {string[]} buttons
 * @param {string|null} after Add after this button, or at the end of the section if it is not there.
 * @returns {Array}
 */
const addButtons = (toolbar, section, buttons, after = null) => {
    const existing = toolbar.flatMap((item) => item.items);
    const newButtons = buttons.filter((button) => !existing.includes(button));
    return toolbar.map((item) => {
        if (item.name !== section || !newButtons.length) {
            return item;
        }
        const items = [...item.items];
        const index = after ? items.indexOf(after) : -1;
        items.splice(index === -1 ? items.length : index + 1, 0, ...newButtons);
        return {...item, items};
    });
};

/**
 * Add a toolbar section with the given buttons after another section, unless there is nothing to add.
 *
 * @param {Array} toolbar
 * @param {string} name
 * @param {string} relativeTo
 * @param {string[]} buttons
 * @returns {Array}
 */
const addSection = (toolbar, name, relativeTo, buttons) => {
    if (!buttons.length) {
        return toolbar;
    }
    if (!toolbar.some((item) => item.name === name)) {
        toolbar = addToolbarSection([...toolbar], name, relativeTo, true);
    }
    return addButtons(toolbar, name, buttons);
};

const getToolbarConfiguration = (instanceConfig, config) => {
    let toolbar = instanceConfig.toolbar ?? [];

    if (config.justify) {
        // Moodle removes this button from the alignment section.
        toolbar = addButtons(toolbar, 'alignment', [alignJustifyItem]);
    }
    if (config.textformat) {
        toolbar = addButtons(toolbar, 'formatting', textFormatItems, 'italic');
    }

    // The other buttons get sections of their own after the text formatting.
    // Their places on the toolbar come from the toolbar order (see defaultOrders).
    let after = 'formatting';
    const add = (name, buttons) => {
        toolbar = addSection(toolbar, name, after, buttons);
        if (toolbar.some((item) => item.name === name)) {
            after = name;
        }
    };
    const colors = config.showtoolbar && config.colors ? [foreColorItem, backColorItem] : [];
    add('colors', config.textformat ? [...colors, removeFormatItem] : colors);
    add('script', config.textformat ? scriptItems : []);
    add('fonts', config.showtoolbar ? [fontFamilyItem, fontSizeItem] : []);
    add('blocks', config.headings ? [blocksItem] : []);
    if (config.insert) {
        const plugins = instanceConfig.plugins ?? [];
        add('insert', Object.entries(insertItems)
            .filter(([, plugin]) => plugin === null || plugins.includes(plugin))
            .map(([button]) => button));
    }

    return toolbar;
};

const getPluginsConfiguration = (instanceConfig, config) => {
    const plugins = [...(instanceConfig.plugins ?? [])];
    extraPlugins
        .filter((plugin) => config[plugin] && !plugins.includes(plugin))
        .forEach((plugin) => plugins.push(plugin));
    return plugins;
};

/**
 * Put the toolbar into the order of a toolbar order setting.
 *
 * The buttons which are not listed keep their sections in place of "*", or are left out without it.
 * Listed buttons which the editor does not have are skipped by TinyMCE.
 *
 * @param {Array} toolbar
 * @param {string} order Sections separated by "|", buttons by spaces, see plugininfo::format_toolbar_order().
 * @param {boolean} onlyToolbar Leave out the listed buttons which are not on the toolbar. TinyMCE has some of them
 *     even when the plugin settings leave them out, such as the font lists.
 * @returns {Array}
 */
export const applyOrder = (toolbar, order, onlyToolbar = false) => {
    const onToolbar = new Set(toolbar.flatMap((item) => item.items).map((button) => button.toLowerCase()));
    const sections = order.split('|')
        .map((section) => section.trim().split(/\s+/)
            .filter((button) => button && (!onlyToolbar || button === '*' || onToolbar.has(button))))
        .filter((items) => items.length);
    const listed = sections.flat();
    const rest = toolbar
        .map((item) => ({...item, items: item.items.filter((button) => !listed.includes(button.toLowerCase()))}))
        .filter((item) => item.items.length);

    // A listed section is named after the section its first button comes from; the names stay unique.
    const sectionOf = (button) =>
        toolbar.find((item) => item.items.some((other) => other.toLowerCase() === button))?.name ?? 'custom';
    const names = new Set();
    const uniqueName = (name) => {
        let result = name;
        for (let i = 2; names.has(result); i++) {
            result = `${name}${i}`;
        }
        names.add(result);
        return result;
    };

    return sections
        .flatMap((items) => (items[0] === '*' ? rest : [{name: sectionOf(items[0]), items}]))
        .map((item) => ({...item, name: uniqueName(item.name)}));
};

/**
 * Finish the toolbar once every plugin has been configured: this runs when the editor is set up.
 *
 * @param {TinyMCE.Editor} editor
 */
export const setupToolbar = (editor) => {
    const toolbar = editor.options.get('toolbar');
    if (!Array.isArray(toolbar)) {
        return;
    }
    const onPhone = isPhone(editor.options.get(getPluginOptionName(pluginName, 'preview')));
    const order = editor.options.get(getPluginOptionName(pluginName, onPhone ? 'toolbarorderphone' : 'toolbarorder'));
    editor.options.set('toolbar', order
        ? applyOrder(toolbar, order)
        : applyOrder(toolbar, defaultOrders[onPhone ? 'phone' : 'desktop'], true));
};

export const configure = (instanceConfig, options) => {
    const config = options?.plugins?.[pluginName]?.config ?? {};
    const result = {
        menu: getMenuConfiguration(instanceConfig, config),
        toolbar: getToolbarConfiguration(instanceConfig, config),
        plugins: getPluginsConfiguration(instanceConfig, config),
    };
    if (config.advlistnumberstyles) {
        // eslint-disable-next-line camelcase
        result.advlist_number_styles = config.advlistnumberstyles;
    }
    if (config.mobiletoolbar) {
        // TinyMCE merges this with its own phone and tablet defaults, which use a side-scrolling toolbar.
        // eslint-disable-next-line camelcase
        result.mobile = {...instanceConfig.mobile, toolbar_mode: config.mobiletoolbar};
    }
    return result;
};
