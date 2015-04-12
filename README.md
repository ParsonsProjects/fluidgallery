# Fluidgallery
[![Build Status](https://travis-ci.org/ParsonsProjects/fluidgallery.svg?branch=master)](https://travis-ci.org/ParsonsProjects/fluidgallery)
![Latest Github release](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)
![Latest Github release](https://img.shields.io/github/release/ParsonsProjects/fluidgallery.svg?style=flat)
![Latest Github release](https://img.shields.io/github/issues/ParsonsProjects/fluidgallery.svg?style=flat)

Replicating and improving fluidbox with a gallery option. Using .animate

[Simple Demo](https://parsonsprojects.github.io/fluidgallery/)

# Introduction
This is a plugin inspired by [fluidbox](https://github.com/terrymun/Fluidbox) with some minor enhancments it works with multiple images allowing a gallery and uses jQuery animate instead of CSS translate for better IE8 compatability plus some other minor tweaks. At the moment this is still having the finishing touches applied but feel free to use or play around with.

I really liked the way that fluidbox pops up from the image itself but I needed some enhancments one was to allow me to group images into a gallery so that you could cycle through the images once the lightbox was opened. The second was to add some extra markup a title and a close button. The third was to make it compatable with IE8+

Although not thoroughly tested, this should work in >= IE8, Chrome, Firefox, Safari.

## Usage
### Basic

```html
<div data-fluidgallery data-fg-title="Puppies" data-fg-large="//c1.staticflickr.com/1/5/7767716_cb753a9f97_b.jpg">
	<img src="//c1.staticflickr.com/1/5/7767716_cb753a9f97_b.jpg" alt="Puppies">
</div>
```

In your JS file, you can simply chain the `.fluidgallery()` method to your selector on DOM ready:

```js
$(function () {
    $('[data-fluidgallery]').fluidgallery();
})
```

For multiple instances wrap in an each function

```js
$(function(){
	$('[data-fluidgallery]').each(function(){
		$(this).fluidgallery();
	});
});
```

For images to be grouped into a gallery add the data-fg-gallery attribute

```html
<div data-fluidgallery data-fg-gallery="Dogs" data-fg-title="Puppies" data-fg-large="//c1.staticflickr.com/1/5/7767716_cb753a9f97_b.jpg">
	<img src="//c1.staticflickr.com/1/5/7767716_cb753a9f97_b.jpg" alt="Puppies">
</div>
```

### Configuration
| Variable/Option  | Type      | Default value | Description                           |
|------------------|-----------|---------------|---------------------------------------|
| `speed`   | Numerical | `400`        | Interger in ms, controls the closing and opening speed |
| `offsetTop`   | Numerical | `'150px'`        | Can be % or px value, controls the distance from the top of the viewport |
| `offsetBottom`   | Numerical | `'100px'`        | Can be % or px value, controls the distance from the bottom of the viewport |
| `offsetX`   | Numerical | `'20px'`        | Can be % or px value, controls the distance from the edge of the screen when the image width is greater than the document |
| `positionType`   | String | `'absolute'`        | Can be absolute or fixed 'string', fixes the image to the window and follows users scroll |
| `mobileWidth`   | Numerical | `480`        | Mobile viewport makes the images fill more of the screen at this point and ignores other values |
| `mouseDrag`   | Boolen | `true`        | Controls if while in the gallery mouse dragging will cycle through images |

### Events
| Event              | Version | Description |
|--------------------|---------|-------------|
| `onLoad`   | 0.1.0-alpha | Fired once the gallery has been opened |
| `onUpdate`   | 0.1.0-alpha | Fired once image has been updated |
| `onResize`   | 0.1.0-alpha | Fired once the gallery has been resized |
| `onDrag`   | 0.1.0-alpha | Fired while the user is dragging |
