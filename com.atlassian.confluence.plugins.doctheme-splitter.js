/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', {expires: 7, path: '/', domain: 'http://10.20.160.198/wiki/s/en/2166/34/1.9/_/download/batch/com.atlassian.confluence.plugins.doctheme:splitter/jquery.com', secure: true});
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
/*
 * jQuery.splitter.js - two-pane splitter window plugin
 *
 * version 1.51 (2009/01/09) 
 * 
 * Dual licensed under the MIT and GPL licenses: 
 *   http://www.opensource.org/licenses/mit-license.php 
 *   http://www.gnu.org/licenses/gpl.html 
 */

/**
 * The splitter() plugin implements a two-pane resizable splitter window.
 * The selected elements in the jQuery object are converted to a splitter;
 * each selected element should have two child elements, used for the panes
 * of the splitter. The plugin adds a third child element for the splitbar.
 * 
 * For more details see: http://methvin.com/splitter/
 *
 *
 * @example $('#MySplitter').splitter();
 * @desc Create a vertical splitter with default settings 
 *
 * @example $('#MySplitter').splitter({type: 'h', accessKey: 'M'});
 * @desc Create a horizontal splitter resizable via Alt+Shift+M
 *
 * @name splitter
 * @type jQuery
 * @param Object options Options for the splitter (not required)
 * @cat Plugins/Splitter
 * @return jQuery
 * @author Dave Methvin (dave.methvin@gmail.com)
 */
 ;(function($){
 
 $.fn.splitter = function(args){
	args = args || {};
	return this.each(function() {
		var zombie;		// left-behind splitbar for outline resizes
		function startSplitMouse(evt) {
			if ( opts.outline )
				zombie = zombie || bar.clone(false).insertAfter(A);
			panes.css("-webkit-user-select", "none");	// Safari selects A/B text on a move
			bar.addClass(opts.activeClass);
			A._posSplit = A[0][opts.pxSplit] - evt[opts.eventPos];
			$(document)
				.bind("mousemove", doSplitMouse)
				.bind("mouseup", endSplitMouse);
		}
		function doSplitMouse(evt) {
			var newPos = A._posSplit+evt[opts.eventPos];
			if ( opts.outline ) {
				newPos = Math.max(0, Math.min(newPos, splitter._DA - bar._DA));
				bar.css(opts.origin, newPos);
			} else 
				resplit(newPos);
		}
		function endSplitMouse(evt) {
			bar.removeClass(opts.activeClass);
			var newPos = A._posSplit+evt[opts.eventPos];
			if ( opts.outline ) {
				zombie.remove(); zombie = null;
				resplit(newPos);
			}
			panes.css("-webkit-user-select", "text");	// let Safari select text again
			$(document)
				.unbind("mousemove", doSplitMouse)
				.unbind("mouseup", endSplitMouse);
		}
		function resplit(newPos) {
			// Constrain new splitbar position to fit pane size limits
			newPos = Math.max(A._min, splitter._DA - B._max, 
					Math.min(newPos, A._max, splitter._DA - bar._DA - B._min));
			// Resize/position the two panes
			bar._DA = bar[0][opts.pxSplit];		// bar size may change during dock
			bar.css(opts.origin, newPos).css(opts.fixed, splitter._DF);
			A.css(opts.origin, 0).css(opts.split, newPos).css(opts.fixed,  splitter._DF);
			B.css(opts.origin, newPos+bar._DA)
				.css(opts.split, splitter._DA-bar._DA-newPos).css(opts.fixed,  splitter._DF);
			// IE fires resize for us; all others pay cash
			if ( !$.browser.msie )
				panes.trigger("resize");
		}
		function dimSum(jq, dims) {
			// Opera returns -1 for missing min/max width, turn into 0
			var sum = 0;
			for ( var i=1; i < arguments.length; i++ )
				sum += Math.max(parseInt(jq.css(arguments[i])) || 0, 0);
			return sum;
		}
		
		// Determine settings based on incoming opts, element classes, and defaults
		var vh = (args.splitHorizontal? 'h' : args.splitVertical? 'v' : args.type) || 'v';
		var opts = $.extend({
			activeClass: 'active',	// class name for active splitter
			pxPerKey: 8,			// splitter px moved per keypress
			tabIndex: 0,			// tab order indicator
			accessKey: ''			// accessKey for splitbar
		},{
			v: {					// Vertical splitters:
				keyLeft: 39, keyRight: 37, cursor: "e-resize",
				splitbarClass: "vsplitbar", outlineClass: "voutline",
				type: 'v', eventPos: "pageX", origin: "left",
				split: "width",  pxSplit: "offsetWidth",  side1: "Left", side2: "Right",
				fixed: "height", pxFixed: "offsetHeight", side3: "Top",  side4: "Bottom"
			},
			h: {					// Horizontal splitters:
				keyTop: 40, keyBottom: 38,  cursor: "n-resize",
				splitbarClass: "hsplitbar", outlineClass: "houtline",
				type: 'h', eventPos: "pageY", origin: "top",
				split: "height", pxSplit: "offsetHeight", side1: "Top",  side2: "Bottom",
				fixed: "width",  pxFixed: "offsetWidth",  side3: "Left", side4: "Right"
			}
		}[vh], args);

		// Create jQuery object closures for splitter and both panes
		var splitter = $(this).css({position: "relative"});
		var panes = $(">*", splitter[0]).css({
			position: "absolute", 			// positioned inside splitter container
			"z-index": "0",					// splitbar is positioned above
			"-moz-outline-style": "none"	// don't show dotted outline
		});
		var A = $(panes[0]);		// left  or top
		var B = $(panes[1]);		// right or bottom

		// Focuser element, provides keyboard support; title is shown by Opera accessKeys
		var focuser = $('<a href="javascript:void(0)"></a>')
			.attr({accessKey: opts.accessKey, tabIndex: opts.tabIndex, title: opts.splitbarClass})
			.bind($.browser.opera?"click":"focus", function(){ this.focus(); bar.addClass(opts.activeClass) })
			.bind("keydown", function(e){
				var key = e.which || e.keyCode;
				var dir = key==opts["key"+opts.side1]? 1 : key==opts["key"+opts.side2]? -1 : 0;
				if ( dir )
					resplit(A[0][opts.pxSplit]+dir*opts.pxPerKey, false);
			})
			.bind("blur", function(){ bar.removeClass(opts.activeClass) });
			
		// Splitbar element, can be already in the doc or we create one
		var bar = $(panes[2] || '<div></div>')
			.insertAfter(A).css("z-index", "10").append(focuser)
			.attr({"class": opts.splitbarClass, unselectable: "on"})
			.css({position: "absolute",	"user-select": "none", "-webkit-user-select": "none",
				"-khtml-user-select": "none", "-moz-user-select": "none"})
			.bind("mousedown", startSplitMouse);
		// Use our cursor unless the style specifies a non-default cursor
		if ( /^(auto|default|)$/.test(bar.css("cursor")) )
			bar.css("cursor", opts.cursor);

		// Cache several dimensions for speed, rather than re-querying constantly
		bar._DA = bar[0][opts.pxSplit];
		splitter._PBF = $.boxModel? dimSum(splitter, "border"+opts.side3+"Width", "border"+opts.side4+"Width") : 0;
		splitter._PBA = $.boxModel? dimSum(splitter, "border"+opts.side1+"Width", "border"+opts.side2+"Width") : 0;
		A._pane = opts.side1;
		B._pane = opts.side2;
		$.each([A,B], function(){
			this._min = opts["min"+this._pane] || dimSum(this, "min-"+opts.split);
			this._max = opts["max"+this._pane] || dimSum(this, "max-"+opts.split) || 9999;
			this._init = opts["size"+this._pane]===true ?
				parseInt($.curCSS(this[0],opts.split)) : opts["size"+this._pane];
		});
		
		// Determine initial position, get from cookie if specified
		var initPos = A._init;
		if ( !isNaN(B._init) )	// recalc initial B size as an offset from the top or left side
			initPos = splitter[0][opts.pxSplit] - splitter._PBA - B._init - bar._DA;
		if ( opts.cookie ) {
			if ( !$.cookie )
				alert('jQuery.splitter(): jQuery cookie plugin required');
			var ckpos = parseInt($.cookie(opts.cookie));
			if ( !isNaN(ckpos) )
				initPos = ckpos;
			$(window).bind("unload", function(){
				var state = String(bar.css(opts.origin));	// current location of splitbar
				$.cookie(opts.cookie, state, {expires: opts.cookieExpires || 365, 
					path: opts.cookiePath || document.location.pathname});
			});
		}
		if ( isNaN(initPos) )	// King Solomon's algorithm
			initPos = Math.round((splitter[0][opts.pxSplit] - splitter._PBA - bar._DA)/2);

        var resizeHandler = function(){
            var top = splitter.offset().top;
            var footer = $("#footer").height();
            if (!footer)
                footer = 24;
            var wh = $(window).height()-footer;
            splitter.css("height", Math.max(wh-top-splitter._hadjust, splitter._hmin)+"px");
            if ( !$.browser.msie ) splitter.trigger("resize");
        };
        args.update = function (isBound) {
            splitter._hadjust = dimSum(splitter, "borderTopWidth", "borderBottomWidth", "marginBottom");
            splitter._hmin = Math.max(dimSum(splitter, "minHeight"), 20);
            isBound && $(window).bind("resize", resizeHandler);
            resizeHandler();
        };
		// Resize event propagation and splitter sizing
		if ( opts.anchorToWindow ) {
			// Account for margin or border on the splitter container and enforce min height
            args.update(true);
		}
		else if ( opts.resizeToWidth && !$.browser.msie )
			$(window).bind("resize", function(){
				splitter.trigger("resize"); 
			});

		// Resize event handler; triggered immediately to set initial position
		splitter.bind("resize", function(e, size){
			// Custom events bubble in jQuery 1.3; don't Yo Dawg
			if ( e.target != this ) return;
			// Determine new width/height of splitter container
			splitter._DF = splitter[0][opts.pxFixed] - splitter._PBF;
			splitter._DA = splitter[0][opts.pxSplit] - splitter._PBA;
			// Bail if splitter isn't visible or content isn't there yet
			if ( splitter._DF <= 0 || splitter._DA <= 0 ) return;
			// Re-divvy the adjustable dimension; maintain size of the preferred pane
			resplit(!isNaN(size)? size : (!(opts.sizeRight||opts.sizeBottom)? A[0][opts.pxSplit] :
				splitter._DA-B[0][opts.pxSplit]-bar._DA));
		}).trigger("resize" , [initPos]);
	});
};
})(jQuery);

/*Places focus on the main content section of pages*/
/* TODO - CONFDEV-2045 Clean up this code */
window.placeFocus = function () {

    var mainSection = document.getElementById('splitter-content');
    // Don't focus when there is an editor on the page.
    if(mainSection && AJS.$("#wysiwyg").length == 0)
    {
        mainSection.focus();
    }
};

AJS.toInit(function($) {
    // This code runs on every page, but we only want it to run in the Doc theme.
    if ($("#com-atlassian-confluence").hasClass("theme-documentation")) {
        var quickSearchQuery = $("#quick-search-query");
        // Unbind the default quicksearch event
        AJS.log("Overriding default quick search");
        quickSearchQuery.unbind("keyup");

        var siteSearchForm = quickSearchQuery.closest("form");
        var spaceKey = $("fieldset input[name='spaceSearch']", siteSearchForm).val() === "true" ? $("#confluence-space-key").attr("content") : "";

        siteSearchForm.submit(function() {
            var query = quickSearchQuery.val();

            if (query.search(/all:/gi) >= 0) {
                quickSearchQuery.val($.trim(query.replace(/all:/gi, '')));
            }
        });

        AJS.log("Applying doc-theme quick search");
        quickSearchQuery.quicksearch("/json/contentnamesearch.action", null, {
            dropdownPlacement : function (dropDown) {
                if (spaceKey) {
                    var searchFor = $("a.search-for", dropDown);
                    searchFor.attr("href", searchFor.attr("href") + "&where=" + encodeURIComponent(spaceKey));
                }

                siteSearchForm.find(".quick-nav-drop-down").append(dropDown);
            },
            makeParams : function(value) {
                var params = { query : value };

                if (params.query.search(/all:/gi) >= 0) {
                    $("input[name='where']", siteSearchForm).val("");
                    params.query = $.trim(params.query.replace(/all:/gi, ''));
                    if (!params.query)
                        params.query = "ALL";
                } else if (spaceKey) {
                    params.spaceKey = spaceKey;
                }

                return params;
            }
        });
        
        // DOC-79 - We need to overwrite the tooltip that Confluence appended to the quick search box when each page finish loading.
        quickSearchQuery.mouseover(function() {
            if(spaceKey) {
                quickSearchQuery.attr("title", $("input[name='tooltip']", siteSearchForm).val());
            }
        });
    }
});
