# Changelog

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
