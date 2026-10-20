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
 * Toolbar layout, the way word processors have it:
 * history | blocks | fonts | formatting | script | colors | content | insert | ... the rest of the Moodle toolbar.
 * On phones and tablets, where the first toolbar row has room for a few buttons only,
 * the most used ones come first: history | formatting | script | colors | blocks | fonts | content | ...
 * The sections are kept short, as TinyMCE moves whole sections to the "More" drawer and wraps them there.
 * Plugins configured after this one (by name) add their buttons after ours.
 *
 * @module      tiny_fontoptions/configuration
 * @copyright   2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

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

/** @var {boolean} Whether TinyMCE runs on a phone or tablet, where it uses its mobile options. */
let touchDevice = false;

/**
 * Remember the device type, once TinyMCE has been loaded.
 *
 * @param {TinyMCE} tinyMCE
 */
export const setTinyMCE = (tinyMCE) => {
    const deviceType = tinyMCE.Env.deviceType;
    touchDevice = deviceType.isPhone() || deviceType.isTablet();
};

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

    // Headings and fonts come before the text formatting on a computer, and after it on phones and tablets.
    const relativeTo = touchDevice ? firstSection(toolbar, ['colors', 'script', 'formatting']) : 'history';
    if (config.headings) {
        toolbar = addSection(toolbar, 'blocks', relativeTo, [blocksItem]);
    }
    if (config.showtoolbar) {
        toolbar = addSection(toolbar, 'fonts', firstSection(toolbar, ['blocks', relativeTo]), [fontFamilyItem, fontSizeItem]);
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
