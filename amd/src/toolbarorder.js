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
 * Toolbar order settings: the default order and the buttons on the site, read from a hidden editor.
 *
 * Each Tiny plugin registers its buttons in the browser, so only an editor with the site configuration knows them.
 * The setting (classes/admin/setting_toolbarorder.php) loads one, which gets the default order
 * (no toolbar order setting is applied to it) and is laid out for the device of the setting.
 *
 * @module      tiny_fontoptions/toolbarorder
 * @copyright   2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getTinyMCE} from 'editor_tiny/loader';
import {getString} from 'core/str';
import {saveCancelPromise} from 'core/notification';
import {component} from './common';

/** @var {Object} Controls built into the TinyMCE theme, which are not in its button registry, with their tooltips. */
const builtInButtons = {
    align: 'Align',
    blocks: 'Blocks',
    fontfamily: 'Fonts',
    fontsize: 'Font sizes',
    fontsizeinput: 'Font size',
    styles: 'Formats',
};

/**
 * Wait for the editor with the given id to be initialised.
 *
 * @param {string} id
 * @returns {Promise<TinyMCE.Editor>}
 */
const getEditor = async(id) => {
    const tinyMCE = await getTinyMCE();
    const editor = tinyMCE.get(id) ?? await new Promise((resolve) => {
        const listener = ({editor}) => {
            if (editor.id === id) {
                tinyMCE.off('AddEditor', listener);
                resolve(editor);
            }
        };
        tinyMCE.on('AddEditor', listener);
    });
    if (!editor.initialized) {
        await new Promise((resolve) => editor.once('init', resolve));
    }
    return editor;
};

/**
 * Get the names of the buttons in the setting, as plugininfo::format_toolbar_order() reads them.
 *
 * @param {string} value
 * @returns {string[]}
 */
const getListedButtons = (value) => value.toLowerCase().split(/\s+|\|/).filter((name) => name && name !== '*');

/**
 * Set up a toolbar order setting.
 *
 * @param {string} fieldId The text area of the setting.
 * @param {string} previewId The block for the default order; the hidden editor is "<previewId>_editor".
 * @param {boolean} loadEditor Whether the hidden editor is loaded on this page.
 */
export const init = async(fieldId, previewId, loadEditor) => {
    const field = document.getElementById(fieldId);
    const preview = document.getElementById(previewId);

    // TinyMCE does not start on a page in quirks mode. admin/category.php is one when a setting on it
    // depends on another (as in the TinyMCE settings): it prints the script for that before the doctype.
    if (!loadEditor || document.compatMode !== 'CSS1Compat') {
        preview.querySelector('[data-region="default"]').hidden = true;
        preview.querySelector('[data-region="noeditor"]').hidden = false;
        return;
    }

    const editor = await getEditor(`${previewId}_editor`);

    // Every button the editor has, for the check of the names in the field.
    const {buttons: registered, menuItems} = editor.ui.registry.getAll();
    const buttons = {...builtInButtons};
    Object.entries(registered).forEach(([name, spec]) => {
        // The menu item text has no current value in it, unlike the tooltip of the colour buttons.
        const label = menuItems[name]?.text ?? spec.tooltip ?? spec.text;
        buttons[name] = typeof label === 'string' ? label : '';
    });

    // Buttons which this editor does not have are skipped by TinyMCE, so they are left out here too.
    const order = editor.options.get('toolbar')
        .map((section) => section.items.filter((button) => buttons[button.toLowerCase()] !== undefined))
        .filter((items) => items.length)
        .map((items) => items.join(' '))
        .concat('*')
        .join('\n');
    preview.querySelector('[data-region="order"]').textContent = order;

    // The list offers the buttons on the toolbar, the ones for the menu bar commands and all buttons of Moodle plugins
    // (named after their component), which another plugin may have taken off the toolbar and the menus
    // (tiny_wiris replaces tiny_equation), but not the buttons of the TinyMCE context toolbars
    // (table rows and cells, image, quick toolbars with Heading 1–6 and so on).
    // TinyMCE keeps the button names in lower case, while plugins may use capitals (such as tiny_mce_wiris_formulaEditor).
    const onToolbar = new Set(order.toLowerCase().split(/\s+/));
    const offered = new Set(editor.options.get('toolbar').flatMap((section) => section.items)
        .map((name) => name.toLowerCase()));
    Object.values(editor.options.get('menu') ?? {}).forEach((menu) => {
        (menu.items ?? '').split(/\s+/).forEach((name) => offered.add(name.toLowerCase()));
    });
    Object.keys(buttons).filter((name) => name.startsWith('tiny_')).forEach((name) => offered.add(name));
    Object.keys(buttons).filter((name) => offered.has(name)).sort().forEach((name) => {
        const item = document.createElement('li');
        const code = document.createElement('code');
        code.textContent = name;
        item.append(code);
        if (buttons[name]) {
            item.append(` — ${editor.translate(buttons[name])}`);
        }
        preview.querySelector(`[data-region="${onToolbar.has(name) ? 'buttons' : 'otherbuttons'}"]`).append(item);
    });

    const copy = preview.querySelector('[data-action="copy"]');
    copy.disabled = field.readOnly;
    copy.addEventListener('click', async() => {
        if (field.value.trim() !== '' && field.value.trim() !== order) {
            try {
                await saveCancelPromise(
                    getString('toolbarorder_copy', component),
                    getString('toolbarorder_copyconfirm', component),
                    getString('toolbarorder_copy', component)
                );
            } catch {
                return;
            }
        }
        field.value = order;
        field.dispatchEvent(new Event('input', {bubbles: true}));
        field.dispatchEvent(new Event('change', {bubbles: true}));
    });

    const unknown = preview.querySelector('[data-region="unknown"]');
    const checkButtons = async() => {
        const names = [...new Set(getListedButtons(field.value).filter((name) => buttons[name] === undefined))];
        unknown.hidden = !names.length;
        if (names.length) {
            unknown.textContent = await getString('toolbarorder_unknown', component, names.join(', '));
        }
    };
    field.addEventListener('input', checkButtons);
    checkButtons();
};
