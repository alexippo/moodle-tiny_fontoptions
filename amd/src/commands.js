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
 * Commands for the Tiny font options plugin.
 *
 * @module      tiny_fontoptions/commands
 * @copyright   2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {get_string as getString} from 'core/str';
import {component, justifyMenuItem} from './common';

/**
 * Get the setup function for the menu items.
 *
 * Strings are fetched here because the TinyMCE plugin registration function cannot be async.
 *
 * @returns {function} The registration function to call within the Plugin.add function.
 */
export const getSetup = async() => {
    const justifyText = await getString('justify', component);

    return (editor) => {
        editor.ui.registry.addToggleMenuItem(justifyMenuItem, {
            text: justifyText,
            icon: 'align-justify',
            onAction: () => editor.execCommand('JustifyFull'),
            onSetup: (api) => {
                const update = () => api.setActive(editor.formatter.match('alignjustify'));
                update();
                editor.on('NodeChange', update);
                return () => editor.off('NodeChange', update);
            },
        });
    };
};
