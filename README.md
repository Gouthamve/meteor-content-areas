ongoworks:content-areas
==============

WIP - don't use yet

This Meteor package allows you to make some areas of a page editable with minimal coding. It is not a full-fledged content management system. It is intended for cases where you need to give an administrator an easy way to edit or rearrange portions of pages. It could be used as one piece of a full CMS.

## Prerequisites

Requires Meteor 0.9.3+

## Installation

*Note: Not yet published. For now you can test by cloning this repo into your app's `packages` folder before you run the command below.*

```bash
$ meteor add ongoworks:content-areas
```

## Enabling Page Editing

Only certain parts of a page will be editable. We'll discuss how to define editable areas, but for now, let's talk about how to toggle page edit mode. To do this, add a button, keyboard shortcut, or whatever user interface you want, and in the event handler, call:

```js
PageEdit.activate();
```

When you activate editing, a control panel appears. You can style and position the control panel to match your app using CSS. The relevant selectors are ".page-edit-controls" and ".page-edit-controls button".

The control panel contains two buttons, one to scrap changes and the other to commit them. Once you commit your changes, all users of the site will immediately see them. You can also call `PageEdit.deactivate()` from your code, but keep in mind that this will scrap all changes.

You can use the reactive `PageEdit.isActive()` or `{{#if PageEdit.isActive}}` to check whether page editing is currently active.

### Page Edit Permissions

TODO Probably a `PageEdit.canEdit(func)` that should be defined in common code.

## Editable Blocks

An editable block is simply a block of markdown that you want to be editable when in page editing mode. This uses the Meteor `markdown` (formerly `showdown`) package to parse the markdown.

### Defining

First, let's see what a block of markdown would look like if you were *only* using the `markdown` package:

```html
{{#markdown}}
## Editable Block Heading

This is some text in the editable content block.

1. Editable step 1
2. Editable step 2
3. Editable step 3

And an [editable link](https://reactioncommerce.com) for good measure.
{{/markdown}}
```

Now let's see the same markdown block as an editable block.

```html
{{#editableBlock id="foo"}}
## Editable Block Heading

This is some text in the editable content block.

1. Editable step 1
2. Editable step 2
3. Editable step 3

And an [editable link](https://reactioncommerce.com) for good measure.
{{/editableBlock}}
```

Notice there are only two differences. We used the `editableBlock` component instead of the `markdown` component, and we added an `id` attribute. This `id` attribute must be a unique string among all `editableBlock` components in your app (and all apps that connect to the same database).

### Using

Once you have an editable block defined, it will look like normal page content, but when in edit mode, you will be able to click the content and edit the markdown in place. If you commit your changes, all users of the site will begin seeing your changed markdown instead of the original markdown in the `editableBlock` block.

### Reverting

TODO not yet possible but we will switch to using some type of data structure where we store the last N commits and the control panel will have prev/next buttons to easily view the various commits of each block while in edit mode.

### Translating

TODO I think it should be possible to have an optional `variant` attribute, which would be specifically useful for translation but also generically useful for content with variants. The idea would be to support something like this:

```html
{{#editableBlock id="foo" variant=reactiveLanguageId}}
{{> getDefaultMarkDownForLanguage reactiveLanguageId}}
{{/editableBlock}}
```

## Editable Areas

An editable area does not allow editing the content itself at all. It allows you to add, remove, and rearrange the blocks of content that are within the area. For example, on your page, you might have five editable areas: footer, header, subheader, main, and sidebar. They would have some default blocks of content in them, but when in editing mode, you can add, remove, or move content. You might drag something from the footer into the header, add an extra predefined template in the subheader, and remove some of the default content blocks from the main area.

### Defining

Adding an editable area to any template is easy:

```html
{{> editableArea name="col3"}}
```

The `name` attribute references an `EditableArea` object that you must have already defined somewhere in your client code. Here's an example:

```js
var col3Area = new EditableArea("col3", {
  allowedTemplates: ["block1", "block2"],
  initialTemplates: ["block2"]
});
```

As you can see, the "content blocks" that are shown within an editable area are any Meteor template. The templates that appear in the area will have the same data context as the `editableArea` itself. The `initialTemplates` option sets the templates that appear in the area by default, and the order in which they appear. The `allowedTemplates` option sets the full list of templates that are allowed in the area.

### Using

* When in edit mode, you can add one of the `allowedTemplates` to the area by selecting its name from a select control.
* When in edit mode, you can remove any template from the area by clicking its remove button.
* When in edit mode, you can drag and drop templates between different editable areas on the same page, or to change the order within the same editable area.

### Styling

Use CSS to style. The relevant selectors are

* .pe-editable-area.editable  (for editable areas)
* .content-area.editable  (for editable block)
* select.pe-editable-area-add-template
* button.pe-editable-area-remove-template

### Translating

TODO As with `editableBlock`, I think it should be possible to have an optional `variant` attribute. You may want different content blocks to appear for different locales.

### Special Blocks

TODO Add on packages could provide advanced features by providing templates that are aware of their `EditableArea` context. For example, a media manager package could provide an "editableImage" component, which displays an optional default image, but also allows file upload and dropped files when `PageEdit.isActive()`. It can store the images with metadata indicating which `EditableArea` the image should be shown in, and allow previously stored images to be added to other editable areas.

### Modifying From Code

Notice that when we defined an `EditableArea` in code, we got back an instance object. You can call methods on the instance to dynamically change the current or allowed template lists without necessarily being in page edit mode. These methods "commit" the change immediately.

```js
// get the current (reactive) array of templates that the area shows
col3Area.getTemplates()
// set the current array of templates that the area shows
col3Area.setTemplates(templates)
// add an array of additional templates to the current array of templates that the area shows
col3Area.addTemplates(templates)
// remove an array of templates from the current array of templates that the area shows
col3Area.removeTemplates(templates)
// remove all templates from the current array of templates that the area shows
col3Area.clear()
// forget all changes so that the `initialTemplates` list is once again used
col3Area.reset()
// get the (reactive) array of templates that the area allows
col3Area.getAllowedTemplates()
// set the array of templates that the area allows
col3Area.setAllowedTemplates(templates)
```

### Notes

You can include a certain named `editableArea` multiple times throughout your app, even on the same page, but any changes in one place will impact all other places, too.

## TODO / Ideas

(1) If we want to make this require zero coding by default, we can set up the instances `EditableArea` automatically when `{{> editableArea name="col3"}}` is used in a template. Then you could retrieve them by name in code. Something like this:

```html
{{> editableArea name="col3" initialTemplates="block2" allowedTemplates="block1,block2"}}
```

```js
EditableArea.byName('col3').setAllowedTemplates(templates);
```

(2) To avoid flickering, we should expose the content subscription readiness as `PageEdit.subs` so that editable pages can "wait on" that.

(3) Sorting within an area by drag/drop doesn't work right now

(4) Should we use a different drag/drop library? Trying to be as lightweight as possible.
