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
 * Tiny font options plugin settings.
 *
 * @package    tiny_fontoptions
 * @copyright  2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

use tiny_fontoptions\plugininfo;

$ADMIN->add('editortiny', new admin_category('tiny_fontoptions', new lang_string('pluginname', 'tiny_fontoptions')));

$settings = new admin_settingpage('tiny_fontoptions_settings', new lang_string('settings', 'tiny_fontoptions'));
if ($ADMIN->fulltree) {
    // The older tiny_fontfamily and tiny_fontsize plugins add their own items, so the menu would show them twice.
    $conflicts = array_intersect(['fontfamily', 'fontsize'], \editor_tiny\plugininfo\tiny::get_enabled_plugins());
    if ($conflicts) {
        $names = implode(', ', array_map(fn($name) => "tiny_{$name}", $conflicts));
        $settings->add(new admin_setting_heading(
            'tiny_fontoptions/conflicts',
            '',
            html_writer::div(get_string('conflictwarning', 'tiny_fontoptions', $names), 'alert alert-warning')
        ));
    }

    $settings->add(new admin_setting_configtextarea(
        'tiny_fontoptions/fontfamilies',
        new lang_string('fontfamilies', 'tiny_fontoptions'),
        new lang_string('fontfamilies_desc', 'tiny_fontoptions'),
        plugininfo::DEFAULT_FONTFAMILIES,
        PARAM_TEXT,
        60,
        10
    ));

    $settings->add(new admin_setting_configtext(
        'tiny_fontoptions/fontsizes',
        new lang_string('fontsizes', 'tiny_fontoptions'),
        new lang_string('fontsizes_desc', 'tiny_fontoptions'),
        plugininfo::DEFAULT_FONTSIZES,
        PARAM_TEXT,
        60
    ));

    $settings->add(new admin_setting_configcheckbox(
        'tiny_fontoptions/showcolors',
        new lang_string('showcolors', 'tiny_fontoptions'),
        new lang_string('showcolors_desc', 'tiny_fontoptions'),
        1
    ));

    foreach (['justify', 'advlist', 'autolink'] as $name) {
        $settings->add(new admin_setting_configcheckbox(
            "tiny_fontoptions/{$name}",
            new lang_string($name, 'tiny_fontoptions'),
            new lang_string("{$name}_desc", 'tiny_fontoptions'),
            1
        ));
    }

    $settings->add(new admin_setting_heading(
        'tiny_fontoptions/toolbarheading',
        new lang_string('toolbarheading', 'tiny_fontoptions'),
        new lang_string('toolbarheading_desc', 'tiny_fontoptions')
    ));

    foreach (['headings', 'showtoolbar', 'textformat', 'insert'] as $name) {
        $settings->add(new admin_setting_configcheckbox(
            "tiny_fontoptions/{$name}",
            new lang_string($name, 'tiny_fontoptions'),
            new lang_string("{$name}_desc", 'tiny_fontoptions'),
            1
        ));
    }

    $settings->add(new admin_setting_configcheckbox(
        'tiny_fontoptions/expandtoolbar',
        new lang_string('expandtoolbar', 'tiny_fontoptions'),
        new lang_string('expandtoolbar_desc', 'tiny_fontoptions'),
        1
    ));

    $modes = [];
    foreach (plugininfo::MOBILE_TOOLBAR_MODES as $mode) {
        $modes[$mode] = new lang_string("mobiletoolbar_{$mode}", 'tiny_fontoptions');
    }
    $settings->add(new admin_setting_configselect(
        'tiny_fontoptions/mobiletoolbar',
        new lang_string('mobiletoolbar', 'tiny_fontoptions'),
        new lang_string('mobiletoolbar_desc', 'tiny_fontoptions'),
        plugininfo::MOBILE_TOOLBAR_MODES[0],
        $modes
    ));
}
