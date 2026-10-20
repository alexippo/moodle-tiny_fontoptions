# Changelog

## 1.7.3 (2026102208)

* With "Show all toolbar buttons", the first button in the opened drawer (such as Image) got the focus when
  the editor was loaded, on Moodle before 5.2. Their TinyMCE 7 takes the option not to move the focus
  in another form than TinyMCE 8 (Moodle 5.2 and later); both are handled now.

## 1.7.2 (2026102207)

* The text of the headings and font lists was dark on a dark toolbar, with dark mode plugins for Moodle
  before 5.3 (such as local_boost_dark), which make the buttons dark but keep the light TinyMCE skin.
  It is made light when the toolbar buttons turn out to be dark. Moodle 5.3 and later pick the dark TinyMCE skin
  themselves in dark mode, which already has light text, so their editor is left alone.

## 1.7.1 (2026102206)

* "Show all toolbar buttons" did not open the toolbar: the drawer was opened on the editor init event,
  before TinyMCE builds the toolbar (it does that once its skin has loaded). It is opened after that now.
  Checked in Chromium with TinyMCE 8.

## 1.7.0 (2026102205)

* New setting "Show all toolbar buttons", enabled by default: the "More" (⋯) part of the toolbar is opened
  when the editor is loaded (not on phones), so all buttons are visible; the "More" button still collapses it.
  The editor grows by the height of the extra rows, so the editing area keeps its size.

## 1.6.2 (2026102204)

* The bullet and numbered lists come right after the text formatting. Moodle has them at the end of
  the toolbar, so with the buttons this plugin adds they were always in the "More" drawer.
* Tablets get the same toolbar order as a computer; only phones put the text formatting before the headings.

## 1.6.1 (2026102203)

* On a computer the toolbar follows the TinyMCE default order: headings, then Bold, Italic, Underline,
  Strikethrough, and the font lists after the text formatting. With the font lists before them,
  a plugin which adds a button to the formatting section (such as tiny_styles) could push Bold and Italic
  into the "More" drawer, as TinyMCE moves whole sections there.

## 1.6.0 (2026102202)

* The editor grows when the "More" (⋯) drawer of the toolbar is opened, so the drawer no longer covers
  the editing area. "Toolbar on phones and tablets" defaults to this mode again.
* Shorter toolbar sections: Bold, Italic, Underline, Strikethrough | Superscript, Subscript |
  colours and Clear formatting. TinyMCE moves whole sections to the drawer and wraps them there,
  so a long section left Clear formatting alone on a row.
* The tiny_fontcolor buttons are moved to the colour section too.
* On phones and tablets the most used buttons come first (undo/redo, Bold, Italic…),
  headings and fonts after them; on a computer the word processor order stays.

## 1.5.1 (2026102201)

* "Toolbar on phones and tablets" defaults to the TinyMCE behaviour again (one row that scrolls sideways):
  on a phone, an opened "More" toolbar covered most of the editing area.

## 1.5.0 (2026102200)

* New setting "Toolbar on phones and tablets". TinyMCE puts all buttons in one side-scrolling row on these devices;
  the default is now the same as on a computer: the buttons that do not fit go under the "More" (⋯) button.
  Wrapping onto more rows and the TinyMCE side-scrolling row can be chosen instead.

## 1.4.1 (2026102101)

* Copyright: Donetsk Regional Institute of Postgraduate Pedagogical Education.
* PHPUnit tests for the plugin info, GitHub Actions workflow (moodle-plugin-ci).

## 1.4.0 (2026102100)

* Toolbar laid out the way word processors have it:
  undo/redo, headings, font and size, text formatting and colours, links and media, insert.
* New settings, all enabled by default:
  * Headings: the block format list (Paragraph, Heading 3–6, Preformatted, Blockquote).
  * Text formatting: Underline, Strikethrough, Superscript, Subscript next to Bold and Italic,
    and Clear formatting after the colours.
  * Insert buttons: Table, Special character, Horizontal line.
* Text and background colour buttons moved to the end of the Bold/Italic group,
  which is where tiny_fontcolor puts its own.
* A button that is already on the toolbar is not added twice.
* Tested on Moodle 5.2 (TinyMCE 8).

## 1.3.0 (2026102005)

* Font family, font size, text and background colour, justify.
* List styles (TinyMCE advlist) and automatic links (TinyMCE autolink).
