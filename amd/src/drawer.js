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
 * Keep the editing area size when the toolbar drawer is opened.
 *
 * With the sliding toolbar, the "More" button opens a drawer with the buttons which do not fit on the first row.
 * Moodle gives the editor a fixed height, so the drawer took its space from the editing area,
 * and on a phone it covered most of it. The editor grows by the height of the drawer instead.
 *
 * @module      tiny_fontoptions/drawer
 * @copyright   2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Make the editor grow and shrink with its toolbar drawer.
 *
 * @param {TinyMCE.Editor} editor
 */
export const setup = (editor) => {
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
    });
};
