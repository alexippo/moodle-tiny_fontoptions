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

use advanced_testcase;
use editor_tiny\plugininfo\tiny;

/**
 * Unit tests for the Tiny font options plugin info.
 *
 * @package    tiny_fontoptions
 * @covers     \tiny_fontoptions\plugininfo
 * @copyright  2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
final class plugininfo_test extends advanced_testcase {
    /**
     * Test converting the font family setting into the TinyMCE format.
     *
     * @dataProvider format_font_families_provider
     * @param string|false $setting
     * @param string $expected
     */
    public function test_format_font_families($setting, string $expected): void {
        $this->assertSame($expected, plugininfo::format_font_families($setting));
    }

    /**
     * Data provider for test_format_font_families.
     *
     * @return array
     */
    public static function format_font_families_provider(): array {
        $defaults = 'Arial=arial,helvetica,sans-serif; Verdana=verdana,geneva,sans-serif; ' .
            'Tahoma=tahoma,arial,helvetica,sans-serif; Trebuchet MS=trebuchet ms,geneva,sans-serif; ' .
            'Times New Roman=times new roman,times,serif; Georgia=georgia,palatino,serif; ' .
            'Courier New=courier new,courier,monospace';
        return [
            'Not set' => [false, $defaults],
            'Empty' => ["  \n ", $defaults],
            'Label and stack' => ['Arial=arial,sans-serif', 'Arial=arial,sans-serif'],
            'Name only' => ['Roboto', 'Roboto=Roboto'],
            'Spaces and blank lines' => [" Arial = arial \r\n\r\n Georgia ", 'Arial=arial; Georgia=Georgia'],
            'Semicolons are removed' => ['Bad;Font=bad;font', 'BadFont=badfont'],
            'Empty label or stack is skipped' => ["=arial\nArial=\nGeorgia", 'Georgia=Georgia'],
        ];
    }

    /**
     * Test converting the font size setting into the TinyMCE format.
     *
     * @dataProvider format_font_sizes_provider
     * @param string|false $setting
     * @param string $expected
     */
    public function test_format_font_sizes($setting, string $expected): void {
        $this->assertSame($expected, plugininfo::format_font_sizes($setting));
    }

    /**
     * Data provider for test_format_font_sizes.
     *
     * @return array
     */
    public static function format_font_sizes_provider(): array {
        return [
            'Not set' => [false, plugininfo::DEFAULT_FONTSIZES],
            'Empty' => [' ', plugininfo::DEFAULT_FONTSIZES],
            'Units are kept' => ['10pt 12px 1.5em 2rem 150%', '10pt 12px 1.5em 2rem 150%'],
            'No unit means pt' => ['10 11.5', '10pt 11.5pt'],
            'Commas and semicolons' => ['8pt,10pt;12pt', '8pt 10pt 12pt'],
            'Invalid sizes are skipped' => ['big 10vh -2pt 14pt', '14pt'],
        ];
    }

    /**
     * Test which numbered list styles are offered.
     */
    public function test_get_advlist_number_styles(): void {
        global $CFG;

        $styles = plugininfo::get_advlist_number_styles();
        if ($CFG->branch >= 503) {
            $this->assertSame('', $styles);
        } else {
            $this->assertStringNotContainsString('lower-greek', $styles);
            $this->assertStringContainsString('lower-roman', $styles);
        }
    }

    /**
     * Test that the colour controls are skipped while tiny_fontcolor is enabled.
     */
    public function test_show_colors(): void {
        $this->resetAfterTest();

        set_config('showcolors', 0, 'tiny_fontoptions');
        $this->assertFalse(plugininfo::show_colors());

        set_config('showcolors', 1, 'tiny_fontoptions');
        $this->assertTrue(plugininfo::show_colors());

        if (!array_key_exists('fontcolor', \core_component::get_plugin_list('tiny'))) {
            return;
        }
        tiny::enable_plugin('fontcolor', 1);
        $this->assertFalse(plugininfo::show_colors());
    }

    /**
     * Test the configuration passed to the editor.
     */
    public function test_get_plugin_configuration_for_context(): void {
        $this->resetAfterTest();

        set_config('fontsizes', '9 11', 'tiny_fontoptions');
        set_config('headings', 1, 'tiny_fontoptions');
        set_config('textformat', 0, 'tiny_fontoptions');
        set_config('insert', 1, 'tiny_fontoptions');

        $config = plugininfo::get_plugin_configuration_for_context(\context_system::instance(), [], []);

        $this->assertSame('9pt 11pt', $config['fontsizes']);
        $this->assertTrue($config['headings']);
        $this->assertFalse($config['textformat']);
        $this->assertTrue($config['insert']);
        $this->assertEqualsCanonicalizing([
            'fontfamilies', 'fontsizes', 'showtoolbar', 'colors', 'justify', 'headings', 'textformat', 'insert',
            'advlist', 'autolink', 'advlistnumberstyles', 'mobiletoolbar', 'expandtoolbar',
            'toolbarorder', 'toolbarorderphone',
        ], array_keys($config));
    }

    /**
     * Test the toolbar order settings passed to the editor, and to the hidden editor of these settings.
     */
    public function test_get_plugin_configuration_for_context_toolbar_order(): void {
        $this->resetAfterTest();

        set_config('toolbarorder', "Undo redo\nbold", 'tiny_fontoptions');
        set_config('expandtoolbar', 1, 'tiny_fontoptions');
        $context = \context_system::instance();

        $config = plugininfo::get_plugin_configuration_for_context($context, [], []);
        $this->assertSame('undo redo | bold', $config['toolbarorder']);
        $this->assertSame('', $config['toolbarorderphone']);
        $this->assertArrayNotHasKey('preview', $config);

        $config = plugininfo::get_plugin_configuration_for_context($context, [plugininfo::PREVIEW_OPTION => 'phone'], []);
        $this->assertSame('phone', $config['preview']);
        $this->assertFalse($config['expandtoolbar']);
        $this->assertArrayNotHasKey('toolbarorder', $config);
        $this->assertArrayNotHasKey('toolbarorderphone', $config);
    }

    /**
     * Test converting a toolbar order setting into the format read by the editor.
     *
     * @dataProvider format_toolbar_order_provider
     * @param string|false $setting
     * @param string $expected
     */
    public function test_format_toolbar_order($setting, string $expected): void {
        $this->assertSame($expected, plugininfo::format_toolbar_order($setting));
    }

    /**
     * Data provider for test_format_toolbar_order.
     *
     * @return array
     */
    public static function format_toolbar_order_provider(): array {
        return [
            'Not set' => [false, ''],
            'Empty' => ["  \n ", ''],
            'Lines' => ["undo redo\r\n\r\n  bold   italic \n*", 'undo redo | bold italic | *'],
            'Bars' => ['undo redo | bold italic', 'undo redo | bold italic'],
            'Lower case' => ['Bold Tiny_Media_Image', 'bold tiny_media_image'],
            'Duplicates keep their first place' => ["bold italic\nitalic\n*\n*", 'bold italic | *'],
            'Star gets a section of its own' => ['bold * italic', 'bold | * | italic'],
            'Invalid names are skipped' => ['bold <b> it@lic tiny_h5p-x', 'bold tiny_h5p-x'],
        ];
    }

    /**
     * Test the toolbar mode for phones and tablets.
     */
    public function test_get_mobile_toolbar_mode(): void {
        $this->resetAfterTest();

        unset_config('mobiletoolbar', 'tiny_fontoptions');
        $this->assertSame('sliding', plugininfo::get_mobile_toolbar_mode());

        set_config('mobiletoolbar', 'wrap', 'tiny_fontoptions');
        $this->assertSame('wrap', plugininfo::get_mobile_toolbar_mode());

        set_config('mobiletoolbar', 'floating', 'tiny_fontoptions');
        $this->assertSame('', plugininfo::get_mobile_toolbar_mode());
    }
}
