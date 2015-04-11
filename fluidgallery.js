/*
 *  Project: fluidgallery
 *  Description: A fancy gallery that pops up from the image
 *  Author: Alan Parsons
 *  Website: http://www.parsonsprojects.co.uk/
 *  License: http://opensource.org/licenses/MIT
 */

/*
 * Usage see below:
 * $('[data-fluidgallery]').each(function(){
 *    $(this).fluidgallery();
 * });
 */

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window is passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    var // plugin name
        pluginName = "fluidgallery",
        // key using in $.data()
        dataKey = "plugin_" + pluginName,
        $el, plugin, windowResize, currentIndex;

    var debutGeste = function (e) {

        if(e.type == 'mousedown' && plugin.options.mouseDrag) {
            debut = e.pageX;
            isTouching = true;
            $(document).on('mousemove', geste);
        } else if(e.type == 'touchstart') {
            if (e.touches.length == 1) {
                debut = e.touches[0].pageX;
                isTouching = true;
                $(document).on('touchmove', geste);
            }
        } else {
            return false;
        }

        $(document).one('touchend mouseup', function(e){
            e.stopPropagation();
            e.preventDefault();
            finGeste();
        });

    };

    var finGeste = function () {         
        $(document).off('touchmove mousemove');
        plugin.elements.wrap.removeClass('fg-grab');
        isTouching = false;
        debut = null;
    };

    var geste = function (e) {               
        if(isTouching) {
            var actuel, delta;

            if(e.type == 'mousemove') { 
                actuel = e.pageX;
            } else {
                actuel = e.touches[0].pageX;
            }

            delta = debut - actuel;
            plugin.elements.wrap.addClass('fg-grab');

            if (Math.abs(delta) >= 30) {     // this '30' is the length of the swipe
                plugin.addLoader(plugin.elements.wrap);
                plugin.options.onDrag();
                if (delta > 0) {
                    plugin.nextFb();
                } else {
                    plugin.prevFb();
                }                       
                finGeste();
            }            

        }
        e.stopPropagation();
        e.preventDefault(); 
    };

    var Plugin = function (element, options) {
        plugin = this;
        plugin.element = element;
        $el = $(element);

        plugin.options = {
            speed        : 400, // Interger in ms
            offsetTop    : '50px', // Can be % or px value
            offsetBottom : '50px', // Can be % or px value
            offsetX      : '20px', // Can be % or px value
            positionType : 'absolute', // Can be absolute or fixed 'string'
            mobileWidth  : 480, // Interger in px
            mouseDrag    : true,
            gallery      : false,
            onLoad       : function() {},
            onUpdate     : function() {},
            onResize     : function() {},
            onDrag       : function() {}
        };

        plugin.elements = {
            ghost    : '',
            overlay  : '',
            image    : '',
            label    : '',
            controls : '',
            close    : '',
            loader   : '',
            wrap     : ''
        };

        /*
         * Initialization
         */

        plugin.init(options);
    };

    Plugin.prototype = {
        // initialize options
        init: function (options) {

            $.extend(plugin.options, options,
            //check if the plugin exists first
            ( typeof $.html5data === 'function' ?
              $el.html5data(pluginName)
              //if not, fall back to the global namespace
              : $el.data() )
            );

            // Add class to items
            $el.addClass('fg');

            // On click of item
            $el.on('click', function(e){
                // Stop default
                e.stopPropagation();
                e.preventDefault();
                // Store this element
                $el = $(this);
                // Update index
                currentIndex = $el.index();
                // Add a loader helps if slow to load image
                plugin.addLoader($el.find('.image'));
                // Initiate gallery
                plugin.runFG();
            });

            // Resize timeout so we only run
            // after user has finished resizing
            $(window).resize(function(){
                clearTimeout(windowResize);
                windowResize = setTimeout(plugin.resizeFb, 100);
            });

        },

        addLoader: function($element) {

            // Just adding a loader
            plugin.elements.loader = $('<div class="fg-loader" style="display: none;"><span></span></div>').appendTo($element);

            // Just removing the loader
            plugin.elements.loader.stop(true, true).fadeIn(400);

        },

        removeLoader: function() {

            // Just removing the loader
            plugin.elements.loader.stop(true, true).fadeOut(400, function(){
                plugin.elements.loader.remove();
            });

        },

        removeFb: function () {

            // Store some vars
            var $img = $('.fg').eq(currentIndex).find('img'), // Get the current item as it may have changed
                imgWidth = $img.width(),
                imgHeight = $img.height(),
                imgOffset = $img.offset(),
                imgTop = imgOffset.top,
                imgLeft = imgOffset.left;

            // Stop any animation and hide external elements
            if(plugin.options.gallery) $controls.stop(true, true).hide();
            plugin.elements.close.stop(true, true).hide();
            plugin.elements.label.stop(true, true).hide();

            // Hide the overlay
            plugin.elements.overlay.animate({
                opacity: 0
            }, plugin.options.speed);

            // If gallery is fixed then fix it
            if(plugin.options.positionType == 'fixed') {
                imgTop = Math.abs(imgTop - $(window).scrollTop());
            }

            // Zoom the image back down and remove markup from DOM
            plugin.elements.ghost.animate({
                top: imgTop,
                left: imgLeft,
                width: imgWidth,
                height: imgHeight
            }, plugin.options.speed, function() {
                plugin.elements.ghost.remove();
            });

        },

        runFG: function() {

            // Check to see if we are already running the gallery
            if($el.data('fg-state') === 0 || !$el.data('fg-state')) {
                // Generate the gallery
                plugin.generateFb();
            } else {
                // Update stated and remove that gallery
                $el.data('fg-state', 0).addClass('fg-closed').removeClass('fg-opened');
                plugin.removeFb();
            }

        },

        generateFb: function () {

            // Make sure there is no ghost already there
            if(plugin.elements.ghost.length) {
                plugin.elements.ghost.remove();
                $('.fg').removeClass('fg-opened');
            }

            $el.data('fg-state', 1).removeClass('fg-closed').addClass('fg-opened');

            // Create gallery ghost
            plugin.elements.ghost = $('<div class="fg-ghost" style="position: absolute;" />').appendTo('body');
            // Create wrap inside
            plugin.elements.wrap = $('<div class="fg-wrap" />').appendTo(plugin.elements.ghost);
            // Add image holder
            plugin.elements.image = $('<div class="fg-image" />').appendTo(plugin.elements.wrap);
            // Insert close button
            plugin.elements.close = $('<div class="fg-close" style="display: none;"><span></span><span></span></div>').appendTo(plugin.elements.wrap);
            // Add label
            plugin.elements.label = $('<div class="fg-label" style="display: none;" />').appendTo(plugin.elements.wrap);
            // Create fg modal background
            plugin.elements.overlay = $('<div class="fg-overlay" />').appendTo(plugin.elements.ghost);

            // Position the elements we just created
            plugin.positionFb();

            // Close Fluidbox when overlay is closed
            plugin.elements.overlay.on('click', function(e){
                if(e.target !== this) return false; // make sure we are clicking the right element
                plugin.closeFb();
            });

            // Close gallery on close button
            plugin.elements.close.on('click', function(){
                plugin.closeFb();
            });

            if($el.attr('data-fg-gallery')) plugin.options.gallery = true;

            // Add some controls if needed
            if(plugin.options.gallery) {

                $controls = $('<div class="fg-controls" style="display: none;" />').appendTo(plugin.elements.wrap);
                $prev = $('<div class="fg-prev"><span></span></div>').appendTo($controls);
                $next = $('<div class="fg-next"><span></span></div>').appendTo($controls);

                $prev.on('click', function(){
                    plugin.addLoader(plugin.elements.wrap);
                    plugin.prevFb();
                });

                $next.on('click', function(){
                    plugin.addLoader(plugin.elements.wrap);
                    plugin.nextFb();
                });

                plugin.elements.wrap.on('touchstart mousedown', debutGeste);

            }

        },

        nextFb: function() {

            // Create next index
            var nextIndex = currentIndex + 1,
                gallery = $el.attr('data-fg-gallery'),
                $nextItem;
            // If next index doest exist go to start
            if(nextIndex >= $('.fg').length) nextIndex = 0;
            $nextItem = $('.fg').eq(nextIndex);
            // Update current index
            currentIndex = nextIndex;
            // If next item is hidden kepp looking
            if(!$nextItem.is(":visible") || $nextItem.attr('data-fg-gallery') != gallery) {
                plugin.nextFb();
            } else {
                plugin.updateFb($nextItem);
            }

        },

        prevFb: function() {

            // Create prev index
            var prevIndex = currentIndex - 1,
                gallery = $el.attr('data-fg-gallery'),
                $prevItem;
            // If prev item is negative go to the end
            if(prevIndex < 0) prevIndex = $('.fg').length - 1;
            $prevItem = $('.fg').eq(prevIndex);
            // Update current index
            currentIndex = prevIndex;
            // If prev item is hidden keep looking
            if(!$prevItem.is(":visible") || $prevItem.attr('data-fg-gallery') != gallery) {
                plugin.prevFb();
            } else {
                plugin.updateFb($prevItem);
            }

        },

        closeFb: function() {

            // Loop back to check state
            plugin.runFG();

        },

        updateFb: function(el) {

            var imgSrc = el.attr('data-fg-large'),
                img = new Image();

            img.onload = function() {
                // Update image and title once image is ready
                plugin.elements.image.find('img').attr('src', imgSrc);
                plugin.elements.label.text(el.attr('data-fg-title'));
                // Remove loader and update position
                plugin.removeLoader();
                plugin.resizeFb();
                plugin.options.onUpdate();
            };
            // Needs to be after to run in IE8
            img.src = imgSrc;

        },

        resizeFb: function() {

            // Store some vars
            var wWidth = $(window).width(),
                wHeight = $(window).height(),
                $img = plugin.elements.image.find('img'),
                wScroll = $(window).scrollTop(),
                offsetTop = plugin.options.offsetTop,
                offsetBottom = plugin.options.offsetBottom,
                offsetH = plugin.options.offsetX,
                image = new Image(),
                imgWidth, imgHeight;

            // Create new offscreen image to test
            image.src = $img.attr("src");

            // Get accurate measurements from that.
            imgWidth = image.width;
            imgHeight = image.height;

            // If gallery is fixed then remove scrollTop value
            if(plugin.options.positionType == 'fixed') {
                wScroll = 0;
            }

            // Check if value is percent and calculate pixel
            if(offsetTop.indexOf('%') >= 0) {
                offsetTop = (parseInt(offsetTop) / 100) * wHeight;
            }

            // Check if value is percent and calculate pixel
            if(offsetBottom.indexOf('%') >= 0) {
                offsetBottom = (parseInt(offsetBottom) / 100) * wHeight;
            }

            // Check if value is percent and calculate pixel
            if(offsetH.indexOf('%') >= 0) {
                offsetH = (parseInt(offsetH) / 100) * wWidth;
            }

            if(plugin.options.mobileWidth > wWidth) {
                offsetH = 20;
                offsetTop = 70;
                offsetBottom = 20;
            }

            // Generate the correct position and dimensions
            var newHeight = Math.abs(wHeight - parseInt(offsetTop) - parseInt(offsetBottom)),
                newWidth = imgWidth / imgHeight * newHeight,
                offsetX = Math.abs((wWidth / 2) - (newWidth / 2)),
                offsetY = parseInt(offsetTop) + wScroll;

            if(newWidth > imgWidth) {
                newWidth = imgWidth;
                newHeight = imgHeight / imgWidth * newWidth;
                offsetX = Math.abs((wWidth / 2) - (newWidth / 2) - parseInt(offsetH));
                offsetY = parseInt(offsetTop) + wScroll;
            }

            // Check new dimensions arent too big for the window width
            if(newWidth > wWidth) {
                newWidth = wWidth - parseInt(offsetH);
                newHeight = imgHeight / imgWidth * newWidth;
                offsetX = Math.abs((wWidth / 2) - (newWidth / 2) - parseInt(offsetH));
                offsetY = parseInt(offsetTop) + wScroll;
            }

            // Animate overlay in
            plugin.elements.overlay.animate({
                opacity: 1
            }, plugin.options.speed);

            // Animate element to correct position
            plugin.elements.ghost.animate({
                top: offsetY,
                left: offsetX,
                height: newHeight,
                width: newWidth
            }, plugin.options.speed, function(){
                plugin.elements.ghost.addClass('fg-loaded');
                if(plugin.options.gallery) $controls.fadeIn();
                plugin.elements.close.fadeIn();
                plugin.elements.label.fadeIn();
                plugin.removeLoader();
                plugin.options.onResize();
            });

        },

        positionFb: function () {

            // Some vars
            var imgWidth = $el.find('img').width(),
                imgHeight = $el.find('img').height(),
                imgOffset = $el.find('img').offset(),
                imgTop = imgOffset.top,
                imgLeft = imgOffset.left,
                img = new Image();

            // If gallery is fixed then fix it
            if(plugin.options.positionType == 'fixed') {
                imgTop = Math.abs(imgTop - $(window).scrollTop());
                plugin.elements.ghost.css({'position': 'fixed'});
            }

            // Position gallery over original image
            plugin.elements.ghost.css({
                top: imgTop,
                left: imgLeft,
                width: imgWidth,
                height: imgHeight
            });

            // Add image to DOM
            plugin.elements.image.prepend('<img src=""/>');

            // Update with correct image
            plugin.updateFb($el, plugin.options.onLoad());

        }

    };

    /*
     * Plugin wrapper, preventing against multiple instantiations and
     * return plugin instance.
     */
    $.fn[pluginName] = function (options) {

        var plugin = this.data(dataKey);

        // has plugin instantiated ?
        if (plugin instanceof Plugin) {
            // if have options arguments, call plugin.init() again
            if (typeof options !== 'undefined') {
                plugin.init(options);
            }
        } else {
            plugin = new Plugin(this, options);
            this.data(dataKey, plugin);
        }

        return plugin;
    };

}(jQuery, window, document));

/*
 * $.html5data v1.0
 * Copyright 2011, Mark Dalgleish
 *
 * This content is released under the MIT License
 * github.com/markdalgleish/jquery-html5data/blob/master/MIT-LICENSE.txt
 */(function(a,b){a.fn.html5data=function(c,d){var e={parseBooleans:!0,parseNumbers:!0,parseNulls:!0,parseJSON:!0,parse:b},f=a.extend({},e,d),g=[],h="data-"+(c?c+"-":""),i=function(b){var c=b.toLowerCase(),d=b.charAt(0);return f.parseBooleans===!0&&c==="true"?!0:f.parseBooleans===!0&&c==="false"?!1:f.parseNulls===!0&&c==="null"?null:f.parseNumbers===!0&&!isNaN(b*1)?b*1:f.parseJSON===!0&&d==="["||d==="{"?a.parseJSON(b):typeof f.parse=="function"?f.parse(b):b};this.each(function(){var a={},b,c,d;for(var e=0,f=this.attributes.length;e<f;e++){b=this.attributes[e];if(b.name.indexOf(h)===0){d="",c=b.name.replace(h,"").split("-");for(var j=0,k=c.length;j<k;j++)d+=j===0?c[j].toLowerCase():c[j].charAt(0).toUpperCase()+c[j].slice(1).toLowerCase();a[d]=i(b.value)}}g.push(a)});return g.length===1?g[0]:g},a.html5data=function(b,c,d){return a(b).html5data(c,d)}})(jQuery)