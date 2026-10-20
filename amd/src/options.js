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
 * Options for the Tiny font options plugin.
 *
 * @module      tiny_fontoptions/options
 * @copyright   2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getPluginOptionName} from 'editor_tiny/options';
import {pluginName} from './common';

const fontFamiliesName = getPluginOptionName(pluginName, 'fontfamilies');
const fontSizesName = getPluginOptionName(pluginName, 'fontsizes');

// Every value passed from PHP (plugininfo::get_plugin_configuration_for_context) is registered here,
// so that TinyMCE knows these options. Most of them are read in configuration.js.
const pluginOptions = {
    fontfamilies: {processor: 'string', "default": ''},
    fontsizes: {processor: 'string', "default": ''},
    showtoolbar: {processor: 'boolean', "default": true},
    colors: {processor: 'boolean', "default": false},
    justify: {processor: 'boolean', "default": false},
    advlist: {processor: 'boolean', "default": false},
    autolink: {processor: 'boolean', "default": false},
    advlistnumberstyles: {processor: 'string', "default": ''},
    headings: {processor: 'boolean', "default": false},
    textformat: {processor: 'boolean', "default": false},
    insert: {processor: 'boolean', "default": false},
    mobiletoolbar: {processor: 'string', "default": ''},
    expandtoolbar: {processor: 'boolean', "default": false},
};

/**
 * Register the plugin options and pass the configured lists to TinyMCE.
 *
 * @param {TinyMCE.Editor} editor
 */
export const register = (editor) => {
    Object.entries(pluginOptions).forEach(([name, spec]) => {
        editor.options.register(getPluginOptionName(pluginName, name), spec);
    });

    // The built-in fontfamily and fontsize controls read these TinyMCE options.
    const fontFamilies = editor.options.get(fontFamiliesName);
    if (fontFamilies) {
        editor.options.set('font_family_formats', fontFamilies);
    }
    const fontSizes = editor.options.get(fontSizesName);
    if (fontSizes) {
        editor.options.set('font_size_formats', fontSizes);
    }

    // TinyMCE only recognises the theme font as "System Font" when the stack starts with -apple-system.
    // Moodle themes use other stacks (Boost starts with system-ui), so the toolbar showed the whole stack.
    // Tell TinyMCE which stack is the default one, as it is actually rendered in the editor.
    editor.on('init', () => {
        const bodyFont = editor.dom.getStyle(editor.getBody(), 'font-family', true);
        if (bodyFont) {
            const stack = bodyFont.split(',').map((font) => font.trim().replace(/^['"]+|['"]+$/g, '')).filter(Boolean);
            editor.options.set('default_font_stack', stack);
        }
    });
};
