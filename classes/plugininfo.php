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

namespace tiny_fontoptions;

use context;
use editor_tiny\editor;
use editor_tiny\plugin;
use editor_tiny\plugin_with_buttons;
use editor_tiny\plugin_with_configuration;
use editor_tiny\plugin_with_menuitems;

/**
 * Tiny font options plugin.
 *
 * Re-enables the font family, font size, text colour, background colour and justify controls
 * built into TinyMCE, which Moodle removes from the editor by default,
 * puts headings, more text formatting and insert buttons on the toolbar, which Moodle keeps in the menus only,
 * and loads the advlist and autolink TinyMCE plugins, which Moodle does not load.
 *
 * @package    tiny_fontoptions
 * @copyright  2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class plugininfo extends plugin implements plugin_with_buttons, plugin_with_configuration, plugin_with_menuitems {
    /** @var string Default font families, one "Label=css font stack" per line. */
    public const DEFAULT_FONTFAMILIES = "Arial=arial,helvetica,sans-serif\n" .
        "Verdana=verdana,geneva,sans-serif\n" .
        "Tahoma=tahoma,arial,helvetica,sans-serif\n" .
        "Trebuchet MS=trebuchet ms,geneva,sans-serif\n" .
        "Times New Roman=times new roman,times,serif\n" .
        "Georgia=georgia,palatino,serif\n" .
        "Courier New=courier new,courier,monospace";

    /** @var string Default font sizes, separated by spaces. */
    public const DEFAULT_FONTSIZES = '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt';

    /**
     * Get the buttons this plugin makes available.
     *
     * @return string[]
     */
    public static function get_available_buttons(): array {
        return [
            'blocks',
            'fontfamily',
            'fontsize',
            'underline',
            'strikethrough',
            'superscript',
            'subscript',
            'forecolor',
            'backcolor',
            'removeformat',
            'table',
            'charmap',
            'hr',
            'alignjustify',
        ];
    }

    /**
     * Get the menu items this plugin makes available.
     *
     * @return string[]
     */
    public static function get_available_menuitems(): array {
        return [
            'fontfamily',
            'fontsize',
            'forecolor',
            'backcolor',
            'tiny_fontoptions_justify',
        ];
    }

    /**
     * Get the plugin configuration passed to the editor.
     *
     * @param context $context The context that the editor is used within
     * @param array $options The options passed in when requesting the editor
     * @param array $fpoptions The filepicker options passed in when requesting the editor
     * @param editor|null $editor The editor instance in which the plugin is initialised
     * @return array
     */
    public static function get_plugin_configuration_for_context(
        context $context,
        array $options,
        array $fpoptions,
        ?editor $editor = null
    ): array {
        return [
            'fontfamilies' => self::format_font_families(get_config('tiny_fontoptions', 'fontfamilies')),
            'fontsizes' => self::format_font_sizes(get_config('tiny_fontoptions', 'fontsizes')),
            'showtoolbar' => (bool) get_config('tiny_fontoptions', 'showtoolbar'),
            'colors' => self::show_colors(),
            'justify' => (bool) get_config('tiny_fontoptions', 'justify'),
            'headings' => (bool) get_config('tiny_fontoptions', 'headings'),
            'textformat' => (bool) get_config('tiny_fontoptions', 'textformat'),
            'insert' => (bool) get_config('tiny_fontoptions', 'insert'),
            'advlist' => (bool) get_config('tiny_fontoptions', 'advlist'),
            'autolink' => (bool) get_config('tiny_fontoptions', 'autolink'),
            'advlistnumberstyles' => self::get_advlist_number_styles(),
        ];
    }

    /**
     * Numbered list styles to offer in advlist, limited to the ones that survive HTML cleaning.
     *
     * Before Moodle 5.3 (MDL-88618) HTMLPurifier removes list-style-type: lower-greek,
     * so the list would silently turn back into 1, 2, 3 after saving.
     *
     * @return string Empty string to keep the TinyMCE defaults.
     */
    public static function get_advlist_number_styles(): string {
        global $CFG;

        if ($CFG->branch >= 503) {
            return '';
        }
        return 'default,lower-alpha,lower-roman,upper-alpha,upper-roman';
    }

    /**
     * Whether to add the built-in text and background colour controls.
     *
     * They are skipped when tiny_fontcolor is enabled, as it provides its own colour controls.
     *
     * @return bool
     */
    public static function show_colors(): bool {
        if (!get_config('tiny_fontoptions', 'showcolors')) {
            return false;
        }
        return !in_array('fontcolor', \editor_tiny\plugininfo\tiny::get_enabled_plugins());
    }

    /**
     * Convert the font family setting into the TinyMCE font_family_formats format.
     *
     * Each line is either "Label=font stack" or just "Font name".
     *
     * @param string|false $setting
     * @return string e.g. "Arial=arial,helvetica,sans-serif; Georgia=georgia"
     */
    public static function format_font_families($setting): string {
        if ($setting === false || trim($setting) === '') {
            $setting = self::DEFAULT_FONTFAMILIES;
        }

        $formats = [];
        foreach (preg_split('/\R/', $setting) as $line) {
            // Semicolons separate entries in TinyMCE, so they cannot be part of an entry.
            $line = trim(str_replace(';', '', $line));
            if ($line === '') {
                continue;
            }
            if (strpos($line, '=') === false) {
                $line = "{$line}={$line}";
            }
            [$label, $stack] = array_map('trim', explode('=', $line, 2));
            if ($label !== '' && $stack !== '') {
                $formats[] = "{$label}={$stack}";
            }
        }
        return implode('; ', $formats);
    }

    /**
     * Convert the font size setting into the TinyMCE font_size_formats format.
     *
     * Sizes without a unit are treated as points.
     *
     * @param string|false $setting
     * @return string e.g. "8pt 10pt 12pt"
     */
    public static function format_font_sizes($setting): string {
        if ($setting === false || trim($setting) === '') {
            $setting = self::DEFAULT_FONTSIZES;
        }

        $sizes = [];
        foreach (preg_split('/[\s,;]+/', $setting, -1, PREG_SPLIT_NO_EMPTY) as $size) {
            if (preg_match('/^\d+(\.\d+)?$/', $size)) {
                $size .= 'pt';
            }
            if (preg_match('/^\d+(\.\d+)?(pt|px|em|rem|%)$/', $size)) {
                $sizes[] = $size;
            }
        }
        return implode(' ', $sizes);
    }
}
