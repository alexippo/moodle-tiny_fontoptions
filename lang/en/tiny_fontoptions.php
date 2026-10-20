<?php
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
 * Strings for the Tiny font options plugin.
 *
 * @package    tiny_fontoptions
 * @category   string
 * @copyright  2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['advlist'] = 'List styles';
$string['advlist_desc'] = 'Load the TinyMCE advlist plugin: the bullet and numbered list buttons get a menu of list styles (circle, square, a, b, c, i, ii, iii and so on). Moodle 5.3 and later load it themselves.';
$string['autolink'] = 'Automatic links';
$string['autolink_desc'] = 'Load the TinyMCE autolink plugin: a web address or e-mail address becomes a link as soon as it is typed.';
$string['conflictwarning'] = 'The {$a} plugin is enabled. It adds its own font items to the editor, so they will appear twice. Disable it in Site administration > Plugins > Text editors > TinyMCE editor > General settings.';
$string['expandtoolbar'] = 'Show all toolbar buttons';
$string['expandtoolbar_desc'] = 'Open the "More" (⋯) part of the toolbar when the editor is loaded, so all buttons are visible; the "More" button still collapses it. The editor grows by the height of the extra rows, so the editing area keeps its size. Not on phones, where the extra rows would take half of the screen.';
$string['fontfamilies'] = 'Font families';
$string['fontfamilies_desc'] = 'One font per line. Use "Label=font stack" (for example "Arial=arial,helvetica,sans-serif") or just a font name. Leave empty to use the defaults.';
$string['fontoptions:use'] = 'Use font family, font size and colour controls in the TinyMCE editor';
$string['fontsizes'] = 'Font sizes';
$string['fontsizes_desc'] = 'Sizes separated by spaces, for example "8pt 10pt 12pt 14pt". Numbers without a unit are treated as pt. Allowed units: pt, px, em, rem, %. Leave empty to use the defaults.';
$string['headings'] = 'Headings';
$string['headings_desc'] = 'Add the block format list (Paragraph, Heading 3–6, Preformatted, Blockquote) to the toolbar, before the indent and list buttons (on phones on its own). Moodle leaves out Heading 1 and 2, as the page already uses them.';
$string['insert'] = 'Insert buttons';
$string['insert_desc'] = 'Add Special character after Superscript and Subscript, and Table and Horizontal line after the Moodle link and media buttons.';
$string['justify'] = 'Justify';
$string['justify_desc'] = 'Add justified alignment to the toolbar and to the Format menu. Moodle removes it because justified text is harder to read for some people, for example people with dyslexia.';
$string['mobiletoolbar'] = 'Toolbar on phones and tablets';
$string['mobiletoolbar_desc'] = 'On phones and tablets TinyMCE puts all buttons in one row that scrolls sideways, and hides the menu bar on phones. With the "More" button the editor grows when it is opened, so the editing area keeps its size. Wrapped buttons can cover most of the editing area on a phone.';
$string['mobiletoolbar_scrolling'] = 'One row that scrolls sideways (TinyMCE default)';
$string['mobiletoolbar_sliding'] = 'As on a computer: buttons that do not fit go under the "More" (⋯) button (recommended)';
$string['mobiletoolbar_wrap'] = 'Wrap: all buttons, on as many rows as needed';
$string['pluginname'] = 'Font options';
$string['privacy:metadata'] = 'The Tiny font options plugin does not store any personal data.';
$string['settings'] = 'Font options settings';
$string['showcolors'] = 'Text and background colour';
$string['showcolors_desc'] = 'Add the TinyMCE text colour and background colour controls. They are not added while the tiny_fontcolor plugin is enabled, so that the colour controls are not duplicated.';
$string['showtoolbar'] = 'Fonts and colours';
$string['showtoolbar_desc'] = 'Add the text and background colour buttons after the text formatting, and the font family and font size lists after Superscript and Subscript. They are always available in the Format menu.';
$string['textformat'] = 'Text formatting';
$string['textformat_desc'] = 'Add Underline and Strikethrough next to Bold and Italic, Clear formatting after the colour buttons, and Superscript and Subscript after them.';
$string['toolbarheading'] = 'Toolbar';
$string['toolbarheading_desc'] = 'Moodle shows these controls in the menus only. The toolbar follows the TinyMCE default order: undo and redo, headings, text formatting and colours, lists, font and size, links and media, insert, then the other Moodle buttons. On phones, where only a few buttons fit on the first row, the text formatting comes first. Buttons that do not fit move to the "More" (⋯) button.';
$string['toolbarorder'] = 'Toolbar order (computer and tablet)';
$string['toolbarorder_buttons'] = 'All buttons on this site';
$string['toolbarorder_copy'] = 'Copy into the field';
$string['toolbarorder_copyconfirm'] = 'Replace the order in the field with the default order?';
$string['toolbarorder_default'] = 'Default order on this site:';
$string['toolbarorder_desc'] = 'Leave empty for the default order, which also takes in the buttons of plugins installed later. Otherwise one toolbar section per line, with the button names separated by spaces; buttons which do not fit move to the "More" (⋯) button, the last sections first. A button which is not listed is not on the toolbar (it stays in the menus); a line with "*" puts all such buttons there instead, so that the buttons of plugins installed later are on the toolbar too. Buttons which an editor does not have, for example of a disabled plugin, are skipped. "Copy into the field" below puts the default order into the field to start from.';
$string['toolbarorder_loading'] = 'Loading the editor…';
$string['toolbarorder_noeditor'] = 'The default order and the list of buttons are shown on the plugin settings page:';
$string['toolbarorder_unknown'] = 'There are no such buttons on this site: {$a}. They are skipped, unless they belong to a plugin which is disabled now.';
$string['toolbarorderphone'] = 'Toolbar order (phone)';
$string['toolbarorderphone_desc'] = 'As above, for phones, where only a few buttons fit on the first toolbar row. Leave empty for the default phone order, which puts the text formatting first.';
