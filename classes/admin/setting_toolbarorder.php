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

namespace tiny_fontoptions\admin;

use admin_setting_configtextarea;
use context_system;
use lang_string;
use moodle_url;
use tiny_fontoptions\plugininfo;

/**
 * Toolbar order setting, for computers and tablets or for phones.
 *
 * Button names are only known in the browser, where each Tiny plugin registers its own,
 * so the setting loads a hidden editor with the site configuration and the default toolbar order
 * (see amd/src/toolbarorder.js) to show that order and the buttons there are.
 *
 * @package    tiny_fontoptions
 * @copyright  2026 Donetsk Regional Institute of Postgraduate Pedagogical Education <donoippo@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class setting_toolbarorder extends admin_setting_configtextarea {
    /** @var string The device the setting is for, a key of plugininfo::TOOLBAR_ORDERS. */
    protected string $device;

    /**
     * Constructor.
     *
     * @param string $device A key of plugininfo::TOOLBAR_ORDERS.
     */
    public function __construct(string $device) {
        $this->device = $device;
        $name = plugininfo::TOOLBAR_ORDERS[$device];
        parent::__construct(
            "tiny_fontoptions/{$name}",
            new lang_string($name, 'tiny_fontoptions'),
            new lang_string("{$name}_desc", 'tiny_fontoptions'),
            '',
            PARAM_TEXT,
            60,
            12
        );
    }

    /**
     * Return the setting with the default order and the list of buttons below it.
     *
     * @param string $data
     * @param string $query
     * @return string
     */
    public function output_html($data, $query = '') {
        global $CFG, $OUTPUT, $PAGE;
        require_once($CFG->libdir . '/formslib.php');
        require_once($CFG->dirroot . '/repository/lib.php');

        $id = $this->get_id();
        $previewid = "{$id}_preview";
        $element = $OUTPUT->render_from_template('tiny_fontoptions/setting_toolbarorder', [
            'cols' => $this->cols,
            'rows' => $this->rows,
            'id' => $id,
            'name' => $this->get_full_name(),
            'value' => $data,
            'forceltr' => true,
            'readonly' => $this->is_readonly(),
            'previewid' => $previewid,
            'settingsurl' => (new moodle_url('/admin/settings.php', ['section' => 'tiny_fontoptions_settings']))->out(false),
        ]);

        // The page admin/category.php outputs the settings before the page header and can print scripts before the doctype
        // (for settings which depend on others), so TinyMCE would not start in the quirks mode:
        // the setting links to its own page there.
        // Files are allowed, as in most text fields, as the media plugins only add their buttons then.
        $loadeditor = $OUTPUT->has_started();
        if ($loadeditor) {
            get_texteditor('tiny')->use_editor("{$previewid}_editor", [
                'context' => context_system::instance(),
                'maxfiles' => EDITOR_UNLIMITED_FILES,
                'return_types' => FILE_INTERNAL | FILE_EXTERNAL,
                plugininfo::PREVIEW_OPTION => $this->device,
            ]);
        }
        $PAGE->requires->js_call_amd('tiny_fontoptions/toolbarorder', 'init', [$id, $previewid, $loadeditor]);

        return format_admin_setting($this, $this->visiblename, $element, $this->description, true, '', null, $query);
    }
}
