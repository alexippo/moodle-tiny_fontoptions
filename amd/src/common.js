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
 * Common values for the Tiny font options plugin.
 *
 * @module      tiny_fontoptions/common
 * @copyright   2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

const component = 'tiny_fontoptions';

export default {
    component,
    pluginName: `${component}/plugin`,
    // Names of the controls built into TinyMCE.
    fontFamilyItem: 'fontfamily',
    fontSizeItem: 'fontsize',
    foreColorItem: 'forecolor',
    backColorItem: 'backcolor',
    alignJustifyItem: 'alignjustify',
    blocksItem: 'blocks',
    // More text formatting. Moodle keeps them in the Format menu only.
    textFormatItems: ['underline', 'strikethrough'],
    scriptItems: ['superscript', 'subscript'],
    removeFormatItem: 'removeformat',
    // Colour buttons of the tiny_fontcolor plugin, which it puts into the formatting section.
    fontColorItems: ['tiny_forecolor', 'tiny_backcolor'],
    // Insert buttons with the TinyMCE plugin each one needs (null: built into TinyMCE).
    insertItems: {table: 'table', charmap: 'charmap', hr: null},
    // Moodle removes "Justify" from the Align submenu, so the Format menu gets its own item.
    justifyMenuItem: `${component}_justify`,
    // TinyMCE plugins which ship with Moodle but are not loaded by it.
    extraPlugins: ['advlist', 'autolink'],
};
