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
 * Toolbar layout, in the TinyMCE default order (headings, then the text formatting):
 * history | blocks | formatting | script | colors | lists | fonts | content | insert | ... the rest of the Moodle toolbar.
 * TinyMCE moves whole sections to the "More" drawer, from the end, so the most used ones come first:
 * the Moodle lists section is moved up from the end of the toolbar, and the wide font lists come after it.
 * The sections are kept short, as the drawer wraps them.
 * On phones, where the first toolbar row has room for a few buttons only,
 * the text formatting comes first: history | formatting | script | colors | lists | blocks | fonts | content | ...
 * Plugins configured after this one (by name) add their buttons after ours.
 * The toolbar order settings, when set, then rearrange the whole toolbar, with the buttons of all plugins.
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
    fontColorItems,
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

/**
 * Remove buttons from a toolbar section.
 *
 * @param {Array} toolbar
 * @param {string} section
 * @param {string[]} buttons
 * @returns {Array}
 */
const removeButtons = (toolbar, section, buttons) => toolbar.map((item) => {
    if (item.name !== section) {
        return item;
    }
    return {...item, items: item.items.filter((button) => !buttons.includes(button))};
});

/**
 * Move a toolbar section after another one.
 *
 * @param {Array} toolbar
 * @param {string} name
 * @param {string} relativeTo
 * @returns {Array}
 */
const moveSection = (toolbar, name, relativeTo) => {
    const section = toolbar.find((item) => item.name === name);
    if (!section || !toolbar.some((item) => item.name === relativeTo)) {
        return toolbar;
    }
    const result = toolbar.filter((item) => item !== section);
    result.splice(result.findIndex((item) => item.name === relativeTo) + 1, 0, section);
    return result;
};

/**
 * Get the first of the given sections which is on the toolbar.
 *
 * @param {Array} toolbar
 * @param {string[]} names
 * @returns {string}
 */
const firstSection = (toolbar, names) =>
    names.find((name) => toolbar.some((item) => item.name === name)) ?? names[names.length - 1];

const getToolbarConfiguration = (instanceConfig, config) => {
    let toolbar = instanceConfig.toolbar ?? [];
    const onPhone = isPhone(config.preview);

    if (config.justify) {
        // Moodle removes this button from the alignment section.
        toolbar = addButtons(toolbar, 'alignment', [alignJustifyItem]);
    }

    // Bold, Italic, Underline, Strikethrough in the Moodle formatting section, then two short sections,
    // so that no button ends up alone on a row when the toolbar wraps.
    if (config.textformat) {
        toolbar = addButtons(toolbar, 'formatting', textFormatItems, 'italic');
        toolbar = addSection(toolbar, 'script', 'formatting', scriptItems);
    }

    // The tiny_fontcolor buttons are moved there too, so the colours are in the same place whichever plugin adds them.
    const formatting = toolbar.find((item) => item.name === 'formatting')?.items ?? [];
    const otherColors = fontColorItems.filter((button) => formatting.includes(button));
    toolbar = removeButtons(toolbar, 'formatting', otherColors);
    const colors = [...otherColors];
    if (config.showtoolbar && config.colors) {
        colors.push(foreColorItem, backColorItem);
    }
    if (config.textformat) {
        colors.push(removeFormatItem);
    }
    toolbar = addSection(toolbar, 'colors', firstSection(toolbar, ['script', 'formatting']), colors);

    // Moodle has the bullet and numbered lists at the end of the toolbar, so they were always in the drawer.
    toolbar = moveSection(toolbar, 'lists', firstSection(toolbar, ['colors', 'script', 'formatting']));

    // The headings come before the text formatting on a computer, and after it on phones.
    // The font lists come after both: they are wide and needed less often.
    const afterFormatting = firstSection(toolbar, ['lists', 'colors', 'script', 'formatting']);
    if (config.headings) {
        toolbar = addSection(toolbar, 'blocks', onPhone ? afterFormatting : 'history', [blocksItem]);
    }
    if (config.showtoolbar) {
        const fontsAfter = onPhone ? firstSection(toolbar, ['blocks', afterFormatting]) : afterFormatting;
        toolbar = addSection(toolbar, 'fonts', fontsAfter, [fontFamilyItem, fontSizeItem]);
    }

    if (config.insert) {
        const plugins = instanceConfig.plugins ?? [];
        const buttons = Object.entries(insertItems)
            .filter(([, plugin]) => plugin === null || plugins.includes(plugin))
            .map(([button]) => button);
        toolbar = addSection(toolbar, 'insert', 'content', buttons);
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
 * On phones, give the buttons which other plugins add to the formatting section a section of their own,
 * after the headings.
 *
 * Plugins configured after this one (such as tiny_styles with its wide list) add them to the end of the section
 * with Bold, Italic, Underline and Strikethrough, which then did not fit on the first toolbar row of a phone,
 * so TinyMCE put the whole section into the "More" drawer.
 *
 * @param {Array} toolbar
 * @returns {Array}
 */
const moveFormattingExtra = (toolbar) => {
    const formatting = toolbar.find((item) => item.name === 'formatting');
    const own = ['bold', 'italic', ...textFormatItems];
    const others = (formatting?.items ?? []).filter((button) => !own.includes(button));
    if (!others.length) {
        return toolbar;
    }
    const result = removeButtons(toolbar, 'formatting', others);
    return addSection(result, 'formattingextra', firstSection(result, ['blocks', 'lists', 'colors', 'script', 'formatting']),
        others);
};

/**
 * Put the toolbar into the order of a toolbar order setting.
 *
 * The buttons which are not listed keep their sections in place of "*", or are left out without it.
 * Listed buttons which the editor does not have are skipped by TinyMCE.
 *
 * @param {Array} toolbar
 * @param {string} order Sections separated by "|", buttons by spaces, see plugininfo::format_toolbar_order().
 * @returns {Array}
 */
export const applyOrder = (toolbar, order) => {
    const sections = order.split('|')
        .map((section) => section.trim().split(/\s+/).filter(Boolean))
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
    let toolbar = editor.options.get('toolbar');
    if (!Array.isArray(toolbar)) {
        return;
    }
    const onPhone = isPhone(editor.options.get(getPluginOptionName(pluginName, 'preview')));
    if (onPhone) {
        toolbar = moveFormattingExtra(toolbar);
    }
    const order = editor.options.get(getPluginOptionName(pluginName, onPhone ? 'toolbarorderphone' : 'toolbarorder'));
    if (order) {
        toolbar = applyOrder(toolbar, order);
    }
    editor.options.set('toolbar', toolbar);
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
