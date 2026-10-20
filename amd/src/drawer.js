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
 * Keep the editing area size when the toolbar drawer is opened, and open it when the editor is loaded.
 *
 * With the sliding toolbar, the "More" button opens a drawer with the buttons which do not fit on the first row.
 * Moodle gives the editor a fixed height, so the drawer took its space from the editing area,
 * and on a phone it covered most of it. The editor grows by the height of the drawer instead.
 *
 * @module      tiny_fontoptions/drawer
 * @copyright   2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getPluginOptionName} from 'editor_tiny/options';
import {pluginName} from './common';

const expandToolbarName = getPluginOptionName(pluginName, 'expandtoolbar');

/**
 * Open or close the toolbar drawer, without moving the focus.
 *
 * Without skipping the focus TinyMCE focuses the first button in the drawer.
 * TinyMCE 6 and 7 (Moodle 4.5-5.1) take skipFocus as the command value; TinyMCE 8 takes skip_focus
 * in the command arguments and reports skipFocus as deprecated.
 *
 * @param {TinyMCE.Editor} editor
 * @param {TinyMCE} tinyMCE
 */
const toggleDrawer = (editor, tinyMCE) => {
    const value = parseInt(tinyMCE.majorVersion) < 8 ? {skipFocus: true} : undefined;
    // eslint-disable-next-line camelcase
    editor.execCommand('ToggleToolbarDrawer', false, value, {skip_focus: true});
};

/**
 * Make the editor grow and shrink with its toolbar drawer.
 *
 * @param {TinyMCE.Editor} editor
 * @param {TinyMCE} tinyMCE
 */
export const setup = (editor, tinyMCE) => {
    // The height added to the editor for the drawer.
    let added = 0;

    const update = () => {
        const container = editor.getContainer();
        // An editor without a fixed height grows by itself.
        if (!container || !container.style.height.endsWith('px')) {
            return;
        }
        const drawer = container.querySelector('.tox-toolbar__overflow');
        const height = drawer && editor.queryCommandState('ToggleToolbarDrawer') ? drawer.scrollHeight : 0;
        if (height !== added) {
            container.style.height = `${parseFloat(container.style.height) + height - added}px`;
            added = height;
        }
    };

    editor.on('init', () => {
        if (editor.options.get('toolbar_mode') !== 'sliding') {
            return;
        }
        // The drawer content changes when the window is resized, as more or fewer buttons fit on the first row.
        editor.on('ToggleToolbarDrawer ResizeWindow', update);
        // The drawer slides open, so measure it again once it has.
        editor.getContainer().addEventListener('transitionend', (e) => {
            if (e.target.classList.contains('tox-toolbar__overflow')) {
                update();
            }
        });
        // TinyMCE moves the focus to the first button in the drawer it opens, and to the "More" button when it closes it.
        // That is meant for the keyboard. On a tap or click the focus goes back to the text, if it was there
        // (so a phone keeps its on-screen keyboard), or else stays on the "More" button.
        // Only a pointer gives pointerdown, which comes before the focus moves.
        let pointer = null;
        const container = editor.getContainer();
        container.addEventListener('pointerdown', (e) => {
            const button = e.target.closest?.('[data-mce-name="overflow-button"]');
            pointer = button ? {button, text: editor.hasFocus()} : null;
        }, true);
        container.addEventListener('keydown', () => {
            pointer = null;
        }, true);
        container.addEventListener('focusin', (e) => {
            if (!pointer || e.target.closest('.tox-edit-area')) {
                return;
            }
            const {button, text} = pointer;
            if (text) {
                pointer = null;
                editor.focus();
            } else if (e.target !== button && e.target.closest('.tox-toolbar__overflow')) {
                pointer = null;
                button.focus();
            }
        });
    });

    // Show all buttons, except on phones, where the extra rows would take half of the screen.
    // The "More" button still collapses them. Nothing is shown while every button fits on the first row.
    // TinyMCE builds the toolbar when its skin has loaded, in a SkinLoaded handler of its own which runs after this one,
    // so the drawer is opened once that has finished.
    editor.once('SkinLoaded', () => setTimeout(() => {
        if (editor.removed || editor.options.get('toolbar_mode') !== 'sliding') {
            return;
        }
        if (editor.options.get(expandToolbarName) && !tinyMCE.Env.deviceType.isPhone()) {
            toggleDrawer(editor, tinyMCE);
        }
    }));
};
