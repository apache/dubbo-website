AJS.log("autocomplete editor_plugin_src starting");
/**
 * Autocomplete dropdown appears when you press a trigger character the editor.
 */
(function() {

    tinymce.create('tinymce.plugins.AutoComplete', {
        init : function(ed) {

            ed.addCommand('mceConfAutocompleteLink', function() {
                tinymce.confluence.Autocompleter.Manager.shortcutFired("[");
            });
            ed.addCommand('mceConfAutocompleteImage', function() {
                tinymce.confluence.Autocompleter.Manager.shortcutFired("!");
            });

            ed.addShortcut("ctrl+shift+k", ed.getLang("AutoComplete"), "mceConfAutocompleteLink");
            ed.addShortcut("ctrl+shift+m", ed.getLang("AutoComplete"), "mceConfAutocompleteImage");

            var addAutocompleteHandlers = function (settings) {
                if (settings["confluence.prefs.editor.disable.autocomplete"]) {
                    return;
                }

                AJS.log("Autocomplete enabled, adding keyPress listener");

                // Certain keys prompt the autocomplete, e.g. typing [ goes into "link auto-complete" mode
                ed.onKeyPress.addToTop(tinymce.confluence.Autocompleter.Manager.triggerListener);
            };

            ed.onPostRender.add(function() {
                // The DOM might not necessarily be ready on editor post render (see similar code in the contextmenu plugin)
                AJS.$(function() {
                    if (AJS.params.remoteUser) {
                        AJS.$.getJSON(tinyMCE.settings.plugin_action_base_path + "/get-wysiwyg-settings.action", {}, addAutocompleteHandlers);
                    } else {
                        // Always enabled for anonymous users
                        addAutocompleteHandlers({});
                    }
                });
            });
        },

        getInfo : function() {
            return {
                longname : 'Auto Complete',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com/',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('autocomplete', tinymce.plugins.AutoComplete);
})();

tinymce.confluence.Autocompleter = {};

/**
 * Settings that each Autocomplete will be initialized on, depending on the trigger character used to activate the
 * autocomplete.
 */
AJS.toInit(function ($) {
    AJS.log("tinyMce-autocomplete-settings initialising");

tinymce.confluence.Autocompleter.Settings = {};
});

/**
 * Custom logging function allows for more structured output. log4javascript on the horizon.
 * @param owner the "class" this logger is for
 *
 * Params accepted by the returned log function:
 *  - caller : name of the calling method
 *  - desc : the actual log body
 *  - obj : an object or string to be rendered
 */
tinymce.confluence.Autocompleter.log = function (owner) {
    return function (caller, desc, obj) {
        // Log string objects on the same line, else on the next line
        var objIsStr = (obj != null && typeof obj != "object");
        var objStr = obj != null ? (objIsStr ? (" = " + obj) : " >") : "";
        AJS.log(owner + " - " + caller + " : " + (desc || null) + objStr);
        obj && !objIsStr && AJS.log(obj);
    };
};
AJS.log("tinyMce-autocomplete-util starting");
tinymce.confluence.Autocompleter.Util = (function() {

    var loadData = function (json, query, callback, field) {
        var hasErrors = json.statusMessage;
        var matrix;
        if (hasErrors) {
           matrix = [[{html: json.statusMessage, className: "error"}]];
        } else {
            var restMatrix = query ? AJS.REST.makeRestMatrixFromSearchData(json) : AJS.REST.makeRestMatrixFromData(json, field);
            matrix = AJS.REST.convertFromRest(restMatrix);
        }
        // do conversion
        callback(matrix, query);
    };

    return {
        /**
         * Returns the HTML of a AJS.dropdown link with an icon span. The icon span is required in the dropdown if we
         * want to use a sprite background for the link icon.
         * @param text escaped text of the dropdown item
         * @param className class name to be added to the link
         * @param iconClass class name to be added on the icon span
         * @return HTML string for the dropdown link
         */
        // we should remove this once AUI dropdown supports sprite icons
        dropdownLink : function(text, className, iconClass) {
            return "<a href='#' class='" + (className || "" ) + "'><span class='icon " + (iconClass || "") + "'></span><span>" + text + "</span></a>";
        },

        getRestData : function (autoCompleteControl, getUrl, getParams, val, callback, suggestionField) {
            var url = getUrl(val);
            if (url) {
                AJS.$.ajax({
                    type: "GET",
                    url: url,
                    data: getParams(autoCompleteControl, val),
                    success: function (json) {
                        loadData.call(autoCompleteControl, json, val, callback, suggestionField);
                    },
                    dataType: "json",
                    global: false,
                    timeout: 5000,
                    error: function (xml, status) { // ajax error handler
                        if (status == "timeout") {
                            loadData.call(autoCompleteControl, {statusMessage: "Timeout", query: val}, val, callback, suggestionField);
                        }
                    }
                });
            } else {
                // If no url, default items may be displayed - run the callback with no data.
                callback([], val);
            }
        }

    };

})(AJS.$);
AJS.log("tinyMce-autocomplete-control starting");
/**
 * Selects the word at the cursor and returns the word and the left/top location of the
 * bottom-left corner of the first word.
 *
 * @param options An options map including:
 *     - leadingChar: trigger character used to launch autocomplete
 *     - dontSuggest: Don't search based on text typed in the autocomplete span
 *     - backWords: the number of words to search backwards for
 */
tinymce.confluence.Autocompleter.Control = function(ed, options) {

    var log = tinymce.confluence.Autocompleter.log("Autocompleter.Control");

    /**
     * The Control to be returned.
     */
    var control = {},

        /**
         * This element wraps the search text and the trigger (if present).
         */
        AUTOCOMPLETE_ID = "autocomplete",

        /**
         * This element wraps the trigger character (e.g. @, [, !)
         */
        AUTOCOMPLETE_TRIGGER_ID = "autocomplete-trigger",

        /**
         * This element contains the text the user is searching for - it should always hold the cursor.
         */
        AUTOCOMPLETE_SEARCH_TEXT_ID = "autocomplete-search-text",

        adaptor = AJS.Editor.Adapter,
        rng = adaptor.getRange(),
        cursorPos = rng.startOffset,
        node = rng.startContainer,
        nodeText = node.nodeValue,
        leadingChar = options.leadingChar,
        selection = ed.selection,
        doc = ed.getDoc(),
        backWords = options.backWords || 0;

    if (AJS.$("#" + AUTOCOMPLETE_ID, doc).length) {
        log("init", "Autocomplete already exists, returning null.");
        return null;
    }
    control.backWords = backWords;
    control.maxResults = options.maxResults || 10;

    // Cursor may be in a <p> just outside of a TextNode, check for child node at startOffset
    if (nodeText == null && rng.collapsed && cursorPos && node.childNodes[cursorPos - 1]) {
        node = node.childNodes[cursorPos - 1];  // to the LEFT of the cursor
        nodeText = node.nodeValue;
        cursorPos = (nodeText && nodeText.length) || 0;
    }
    var text = "";
    // Cursor may still not be in a Text node, in which leave the text empty.
    if (nodeText != null) {
        text = (nodeText + "").substring(0, cursorPos);
        var pnode = node.previousSibling;
        while (pnode && pnode.nodeType == 3) {
            // add the text from any previous TextNodes
            text = pnode.nodeValue + text;
            pnode = pnode.previousSibling;
        }
    }
    // Disable trigger chars at the end of the certain strings e.g. “Hi there!”.
    // The regex allows "'<( left" and left' before the [ trigger and space, zero-width space, &nbsp; and em-dash
    // before all triggers.
    if (!backWords && text && !(/(["'<\(\u201c\u2018]\[|[\ufeff\u2014\s\xa0].)$/).test(text + leadingChar)) {
        log("init", "Cursor is in wrong word location to start autocomplete, returning null.");
        return null;
    }
    var $node = AJS.$(node);
    if ($node.closest("div.code, a[href], img, div.wysiwyg-macro-starttag, div.wysiwyg-macro-endtag").length || AJS.$("#property-panel:visible").length) {
        log("init", "Cursor is in wrong node to start autocomplete, returning null.");
        return null;
    }
    if (!leadingChar && nodeText == null) {
        log("init", "No text available for suggestion, range is", rng);

        // TODO - handle this (and weird TextNodes)
        nodeText = "";
    }

    // TODO - not this. See http://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expre
    function regexLastIndexOf(str, regex, startpos) {
        !regex.global && (regex = new RegExp(regex.source, "g" + "i".slice(0, regex.ignoreCase) + "m".slice(0, regex.multiLine)));
        if (startpos == null) {
            startpos = str.length;
        } else if (startpos < 0) {
            startpos = 0;
        }
        var stringToWorkWith = str.substring(0, startpos + 1),
            lastIndexOf = -1,
            nextStop = 0;
        while ((result = regex.exec(stringToWorkWith)) != null) {
            lastIndexOf = result.index;
            regex.lastIndex = ++nextStop;
        }
        return lastIndexOf;
    }

    /**
     * Returns a jQuery-wrapped reference to the autocomplete container.
     */
    control.getContainer = function () {
        return AJS.$("#" + AUTOCOMPLETE_ID, doc);
    };

    /**
     * Starting at the given endpoint, search backward through text nodes until the requested number of words are
     * found.
     * @param node
     * @param offset
     * @param backWords
     */
    function findRangeStart(node, offset, backWords) {
        var nodeText, pNode;

        for (var i = 0; i < backWords; i++) {
            nodeText = node.nodeValue.substring(0, offset);
            offset = regexLastIndexOf(nodeText, (/\s+/), offset);
            while (offset == -1) {
                pNode = node.previousSibling;
                if (pNode && pNode.nodeType == 3) {
                    node = pNode;
                    nodeText = pNode.nodeValue;
                    if (nodeText) {
                        offset = regexLastIndexOf(nodeText, (/\s+/), nodeText.length);
                    }
                } else {
                    i = backWords;  // no point looking further
                    break;
                }
            }
        }

        return {
            node: node,
            offset: offset + 1
        };
    }

    var suggestionHtml = "";
    if (rng.collapsed && backWords && nodeText) {
        var rangeStart = findRangeStart(node, cursorPos, backWords);

        // Select from the cursor back to the start of the first word
        if (tinymce.isIE && backWords == 1) {
            var range = selection.getRng();
            range.moveStart("character", rangeStart.offset - cursorPos);
            range.select();
        } else {
            range = adaptor.createRange();
            range.setStart(rangeStart.node, rangeStart.offset);
            range.setEnd(node, cursorPos);
            selection.setRng(range);
        }
    }
    // Use the existing selection as the search term
    // TODO - html format is failing due to our preProcess on serializer. Fix that.
    suggestionHtml = selection.getContent({format : 'text'});
    log("init", "suggestionHtml", suggestionHtml);

    var el = AJS("span").attr("id", AUTOCOMPLETE_ID);
    if (leadingChar) {
        el.append(AJS("span").attr("id", AUTOCOMPLETE_TRIGGER_ID).text(leadingChar));
    }
    
    var $searchTextSpan = AJS("span").attr("id", AUTOCOMPLETE_SEARCH_TEXT_ID);
    $searchTextSpan.text(adaptor.HIDDEN_CHAR);
    el.append($searchTextSpan);
    selection.setNode(el[0]);

    var autocompleteSpan = control.getContainer();
    control.previousSearchText = "";
    control.settings = tinymce.confluence.Autocompleter.Settings[leadingChar || "["];  // default to link

    // Put the cursor inside the new span, at the end.
    var searchNode = AJS.$("#" + AUTOCOMPLETE_SEARCH_TEXT_ID, control.getContainer()),
        searchTextNode = searchNode[0].firstChild,
        cursorPosition = searchTextNode.nodeValue.length,
        selNode = AJS.$(doc.createElement("span")).text(suggestionHtml || adaptor.HIDDEN_CHAR);
    searchNode.empty().append(selNode);
    selection.select(selNode[0]);
    selection.collapse();

    var position = tinymce.DOM.getPos(autocompleteSpan[0]),
        height = autocompleteSpan.height();
    log("init", "position", position);
    log("init", "pixel offset", autocompleteSpan.offset());


    // Events
    var before = function (e) {
            if (control.onBeforeKey && !control.onBeforeKey(e, control.text())) {
                e.stopPropagation();
                e.preventDefault();
                log("after", "blocked by onBeforeKey");
                return false;
            }
        },
        after = function (e) {
            var rng = adaptor.getRange(),
                span = control.getContainer(),
                node = rng.startContainer,
                parent = node.parentNode;
            node.nodeType == 3 && (parent = parent.parentNode);
            var grandpa = parent.parentNode,
                outsideSearchSpan = parent != span[0] && grandpa != span[0];
            if (e.keyCode == 27 || outsideSearchSpan) {
                log("after", "dying because of: " + outsideSearchSpan ? "outside search span" : "escape pressed");
                control.die();
            } else if (control.onAfterKey && !control.onAfterKey(e, control.text())) {
                e.stopPropagation();
                e.preventDefault();
                log("after", "blocked by onAfterKey");
                return false;
            }
        },
        press = function (e) {
            if (control.onKeyPress && !control.onKeyPress(e, control.text())) {
                e.stopPropagation();
                e.preventDefault();
                log("after", "blocked by onKeyPress");
                return false;
            }
        },
        click = function (e) {
            if (control.getContainer()[0] != e.target.parentNode) {
                log("click", "Clicked outside of autocomplete, closing.");
                control.die();
            }
        };
    AJS.$(doc).keydown(before).keyup(after).keypress(press).click(click);


    // For Recent History and certain other searches, ignore the selected text for searching.
    control.word = "";
    if (!options.keepAlias) {
        control.word = suggestionHtml;
    } else {
        log("init", "No suggestion based on previous or selected text");
    }

    control.left = position.x;
    control.top = position.y + height;

    control.text = function (text) {
        var span = AJS.$("#" + AUTOCOMPLETE_SEARCH_TEXT_ID, control.getContainer());
        if (text != null) {
            span.html(text);
            return this;
        } else {
            text = AJS.escapeEntities(span.text());
            return text.replace(adaptor.HIDDEN_CHAR, "");
        }
    };

    /**
     * Replaces the autocomplete component with the given text, which may be empty.
     * If the given text IS empty, it will always be collapsed.
     * If the collapse parameter is true, the range will be collapsed at the end of the text.
     * @param text  string to replace autocomplete with
     * @param collapse if true, collapse range to end of text, else select text
     */
    var replaceWithTextAndGetRange = function(text, collapse) {
        adaptor.replaceWithTextAndGetRange(control.getContainer(), text, collapse);
        control.die();
        return rng;
    };

    control.replaceWithSelectedSearchText = function () {
        // Get the autocomplete search text and select the entire autocomplete
        var replaceText = control.text();
        log("replaceWithSelectedSearchText", replaceText);
        replaceWithTextAndGetRange(replaceText, false);
        return replaceText;
    };

    control.die = function (notrigger) {
        if (control.dying) {
            log("die", "Already dying, returning.");
            return;
        }
        control.dying = true;

        var container = control.getContainer();
        if (container.length) {
             log("die", "Tearing down autocomplete, cleaning up autocompleter");
            // Replace autocomplete span with its current text
            var replaceText = ((notrigger || options.backWords) ? "" : control.settings.ch) + control.text();
            rng = replaceWithTextAndGetRange(replaceText, true);
        }
        AJS.$(doc).unbind("keydown", before).unbind("keyup", after).unbind("click", click).unbind("keypress", press);
        AJS.Editor.Adapter.unbindScroll("autocomplete");
        AJS.$(document).unbind("click.autocomplete-outside");
        this.onDeath && this.onDeath();
    };

    AJS.Editor.Adapter.bindScroll("autocomplete", function () {
        control.die();
    });
    AJS.$(document).bind("click.autocomplete-outside", function (e) {
        if (!AJS.$(e.target).closest("#autocomplete-dropdown").length) {
            control.die();
        }
    });

    control.update = function (data) {
        AJS.Editor.Adapter.storeCurrentSelectionState();
        replaceWithTextAndGetRange("", true);
        this.settings.update(this,data);
        control.die();
    };

    control.removeSpan = function () {
        control.getContainer().remove();
    };
    return control;
};

AJS.log("tinyMce-autocomplete-manager starting");
tinymce.confluence.Autocompleter.Manager = (function ($) {

    var log = tinymce.confluence.Autocompleter.log("Autocompleter.Manager");

    /**
     * There will only be one autoCompleteControl active at a time so a reference to it can be shared across methods.
     */
    var autoCompleteControl;

    /**
    *  The input driven dropdown component that does most of the work.
    */
    var idd;

    /**
     * Called when the user hits a key combination at the end of some text to autocomplete.
     * If there is no text at the cursor, the user's Recent History is displayed instead.
     *
     * options include:
     *  - leadingChar - determines the type of autocomplete, e.g. [ , !
     *  - backWords - the number of words to search backwards for
     */
    var startAutoComplete = function (options) {
            log("startAutoComplete", "Started");
            autoCompleteControl = tinymce.confluence.Autocompleter.Control(AJS.Editor.Adapter.getEditor(), options);
            if (!autoCompleteControl) {
                return false;
            }
            var selectionHandler = function (e, selection) {
                e.preventDefault();
                var result = AJS.$.data(selection[0], "properties");
                if (result && typeof result.callback == "function") {
                    result.callback(autoCompleteControl);
                } else if (result.className != "menu-header") {
                    log("selectionHandler", "Inserting link from dropdown selection");
                    autoCompleteControl.update(result);
                }
            };
            var moveHandler = function (selection, dir) {
                var current = AJS.dropDown.current;
                if (selection && selection.find("a").is(".menu-header")) {
                    dir == "up" ? current.moveUp(): current.moveDown();
                }
            };

            var winWidth = AJS.$(window).width();
            idd = AJS.inputDrivenDropdown({
                onShow : function (dd) {
                    log("onShow", "Post-processing the dropdown");
                    dd.find("ol:has(a.menu-header)").addClass("top-menu-item");
                    $("#autocomplete-dropdown ol:empty").hide();

                    var iframe = AJS.Editor.Adapter.getEditorFrame();
                    iframe.shim && iframe.shim.hide();

                    dd.find("a.menu-header").unbind().click(function (e) {
                        e.preventDefault();
                        autoCompleteControl.die();
                    });
                    this.reset();
                },
                dropdownPlacement : function (dd) {
                    var parent = $("#autocomplete-dropdown"),
                        anchor = autoCompleteControl.getContainer();
                    if (!parent.length) {
                        parent = AJS("div").addClass("aui-dd-parent quick-nav-drop-down").attr("id", "autocomplete-dropdown").appendTo("body");
                    }
                    var offset = AJS.Editor.Adapter.offset(anchor),
                        overlap = parent.width() + offset.left - winWidth + 10,
                        gapForArrowY = 10,
                        gapForArrowX = 0,
                        top = offset.top + anchor.height() + gapForArrowY,
                        left = offset.left - (overlap > 0 ? overlap : 0) - gapForArrowX;
                    parent.append(dd).css({
                        position: "absolute",
                        top: top,
                        left: left
                    });
                    if (window.Raphael) {
                        if (idd.raphaelArrow) {
                            idd.raphaelArrow.canvas.style.left = offset.left + 4 + "px";
                            idd.raphaelArrow.canvas.style.top = top - 5 + "px";
                        } else {
                            var r = Raphael(offset.left + 4, top - 5, 12, 6);
                            r.path("http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-autocomplete-resources/M0.001,6.001l6.001-6.001,6.001,6.001").attr({
                                fill: "#f0f0f0",
                                stroke: "#bbb"
                            });
                            r.canvas.style.zIndex = 3000;
                            idd.raphaelArrow = r;
                        }
                    }
                },
                onDeath : function () {
                    $("#autocomplete-dropdown").remove();
                    idd.raphaelArrow && idd.raphaelArrow.remove && idd.raphaelArrow.remove();
                },
                ajsDropDownOptions: {
                    selectionHandler: selectionHandler,
                    moveHandler: moveHandler,
                    className : "autocomplete " + autoCompleteControl.settings.dropDownClassName
                },
                getDataAndRunCallback: function(val) {
                    autoCompleteControl.settings.getDataAndRunCallback &&
                    autoCompleteControl.settings.getDataAndRunCallback(autoCompleteControl, val,
                        function(matrix, query) {
                            matrix.unshift([
                                {
                                    className: "menu-header dropdown-prevent-highlight",
                                    href: "#",
                                    name: autoCompleteControl.settings.getHeaderText(autoCompleteControl, val)
                                }
                            ]);
                            matrix.push(autoCompleteControl.settings.getAdditionalLinks(autoCompleteControl, val));

                            // If the idd control is still active update it with the new data.
                            idd && idd.show(matrix, query, [query]);
                        }
                    );
                }
            });

            autoCompleteControl.onBeforeKey = function (e, text) {
                if (e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 13) {
                    var current = AJS.dropDown.current;
                    if (!current) {
                        log("autoCompleteControl.onBeforeKey", "key caught before dropdown ready, ignoring");
                        return false;
                    }
                    if (current.getFocusIndex() == -1 && e.keyCode == 13) {  // user hit enter when nothing selected
                        reset();
                        return true;
                    }
                    return current.moveFocus(e);
                }
                if (e.keyCode == 27 || e.keyCode == 9 || (e.keyCode == 8 && !text)) {
                    // User has key-downed backspace but text is *already* blank - close autocomplete.
                    log("autoCompleteControl.onBeforeKey", "killing autoCompleteControl and returning false");
                    autoCompleteControl.die(e.keyCode == 8);
                    return false;
                }

                return true;
            };
            // Blocker for browser default actions for up and down keys
            autoCompleteControl.onKeyPress = function (e, text) {
                var ch = AJS.$.browser.msie ? e.keyCode : e.which,
                    character = String.fromCharCode(ch);   // charCode back to '@'
                if (e.keyCode == 40 || e.keyCode == 38 || e.keyCode == 13) {
                    tinymce.dom.Event.cancel(e);
                    return false;
                }
                var endCharIndex = AJS.indexOf(autoCompleteControl.settings.endChars,character);
                if (endCharIndex != -1) {
                    log("autoCompleteControl.onKeyPress", "caught autocomplete-closing char " + character + ", closing");
                    autoCompleteControl.die();
                }
                return true;
            };
            var twoLetters = /\S{2,}/;
            autoCompleteControl.onAfterKey = function (e, text) {
                // User deleted back to zero characters - should display default suggestions again.
                var forceUpdate = (e.keyCode == 8 && !text);
                if (forceUpdate || twoLetters.test(text)) {
                    log("onAfterKey", "Changed search string to “" + text + "”");
                    idd.change(text, forceUpdate);
                }
                return true;
            };
            autoCompleteControl.onDeath = function () {
                log("onDeath", "autoCompleteControl onDeath called");
                if (idd) {
                    idd.remove();
                    idd.closing = true;
                }
                AJS.Editor.Adapter.onHideEditor = onHideEditor;
            };

            var onHideEditor = AJS.Editor.Adapter.onHideEditor;
            AJS.Editor.Adapter.onHideEditor = function () {
                onHideEditor();
                reset();
            };
            // Start the dropdown with no text entered, to display the default suggestions.
            idd.change(autoCompleteControl.word, "force");
            return true;
        };

    var reset = function () {
        autoCompleteControl.die();
        autoCompleteControl = null;
    };

    return {

        getInputDrivenDropdown: function() {
            return idd;
        },

        // keyPress used so we can capture composite keystrokes like Sh-2 == @
        triggerListener: function(ed, e) {
            var returnValue = true,
                ch = AJS.$.browser.msie ? e.keyCode : e.which;

            if (idd) {
                // We need this listener because the autoCompleteControl's keypress listener may have been unbound by the
                // autoCompleteControl being taken down on enter *keydown*.
                if (ch == 13) { // enter
                    tinymce.dom.Event.cancel(e);
                    returnValue = false;
                }
            }
            idd && idd.closing && (idd = null);
            if (!returnValue) {
                return false;
            }

            var character = String.fromCharCode(ch);   // charCode back to '@'
            if (!idd && character in tinymce.confluence.Autocompleter.Settings) {
                log("triggerListener", "Auto-complete initiated: trigger is ", character);

                // Add the suggestion span and kill the event - we'll add the letter manually
                startAutoComplete({
                    leadingChar: character
                }) && tinymce.dom.Event.cancel(e);
            }

            return returnValue;
        },

        /**
         * Called when a Ctrl-Sh-K or Ctrl-Sh-M shortcut is fired, selects the previous word.
         *
         * Multiple shortcuts will select more previous words to narrow the search.
         */
        shortcutFired: function(leadingChar) {
            var backWords = 1;
            idd && idd.closing && (idd = null);
            if (idd) {
                backWords = autoCompleteControl.backWords + 1;
                log("shortcutFired", "autocomplete active, increasing word selection to: " + backWords);
                // the shortcut itself will be closing the previous autocomplete
                reset();
            }
            return startAutoComplete({
                leadingChar: leadingChar,
                backWords: backWords
            });
        }
    };
})(AJS.$);

