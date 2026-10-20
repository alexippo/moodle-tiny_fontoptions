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
 * Keep the text of the toolbar lists readable on a dark toolbar.
 *
 * Before Moodle 5.3 the editor always uses the light TinyMCE skin. Dark mode plugins make its buttons dark
 * and invert the icons, but the Moodle toolbar had no text, so the text of the headings and font lists
 * stayed dark on a dark background. When the buttons turn out to be dark, the editor gets a class
 * which makes that text light (styles.css).
 *
 * Moodle 5.3 and later pick the dark TinyMCE skin themselves and mark the editor with data-bs-theme;
 * that skin already has light text, so such an editor is left alone.
 *
 * @module      tiny_fontoptions/colours
 * @copyright   2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/** @var {string} Class added to the editor container when its toolbar buttons are dark. */
const darkToolbarClass = 'tiny-fontoptions-dark-toolbar';

/**
 * Get the background colour an element is shown on.
 *
 * @param {HTMLElement} element
 * @returns {number[]|null} Red, green and blue, or null if no element has a background.
 */
const getBackground = (element) => {
    for (let node = element; node instanceof Element; node = node.parentElement) {
        const match = window.getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
        if (match && (match.length < 4 || Number(match[3]) > 0)) {
            return match.slice(0, 3).map(Number);
        }
    }
    return null;
};

/**
 * Whether a colour is dark, by its relative luminance.
 *
 * @param {number[]} rgb
 * @returns {boolean}
 */
const isDark = (rgb) => {
    const [r, g, b] = rgb.map((value) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.2;
};

/**
 * Mark the editor when its toolbar buttons are dark.
 *
 * @param {TinyMCE.Editor} editor
 */
export const setup = (editor) => {
    // TinyMCE builds the toolbar in a SkinLoaded handler of its own which runs after this one.
    editor.once('SkinLoaded', () => setTimeout(() => {
        const container = editor.getContainer();
        if (editor.removed || !container || container.hasAttribute('data-bs-theme')) {
            return;
        }
        const button = container.querySelector('.tox-tbtn');
        const background = button ? getBackground(button) : null;
        if (background && isDark(background)) {
            container.classList.add(darkToolbarClass);
        }
    }));
};
