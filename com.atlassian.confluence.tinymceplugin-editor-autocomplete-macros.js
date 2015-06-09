/**
 * Settings that each Autocomplete will be initialized on, depending on the trigger character used to activate the
 * autocomplete.
 */
AJS.toInit(function ($) {
    AJS.log("tinyMce-autocomplete-settings-macro initialising");
    var dropdownSelectionMade = function(autoCompleteControl, options) {
        autoCompleteControl.replaceWithSelectedSearchText();
        autoCompleteControl.die();
        tinymce.confluence.macrobrowser.macroBrowserToolbarButtonClicked(options);
    };

    var autoComplete = tinymce.confluence.Autocompleter,
        makeMacroDropdownItem = function (summary) {
            if (summary.hidden && !AJS.params.showHiddenUserMacros)
                return null;    // macros like {viewfile} hidden from the browser should be hidden from the dropdown

            var item = {
                className: "autocomplete-macro-" + summary.macroName,
                callback: function(autoCompleteControl) {
                    dropdownSelectionMade(autoCompleteControl, {
                        ignoreEditorSelection: true,       // the selected text will be the search term, ignore it
                        presetMacroMetadata: summary
                    });
                }
            };

            if (summary.icon) {
                item.name = summary.title;
                item.href = "#";
                item.icon = (summary.icon.relative ? AJS.params.staticResourceUrlPrefix : "") + summary.icon.location;
            } else {
                item.html = tinymce.confluence.Autocompleter.Util.dropdownLink(summary.title);
            }

            return item;
        };

    // Link settings.
    tinymce.confluence.Autocompleter.Settings["{"] = {

        ch : "{",
        endChars : ["}", ":"],

        dropDownClassName: "autocomplete-macros",

        getHeaderText : function (autoCompleteControl, value) {
            return "Macro suggestions";
        },

        getAdditionalLinks : function (autoCompleteControl, value) {
            return [
                {
                    className: "dropdown-insert-macro",
                    html: tinymce.confluence.Autocompleter.Util.dropdownLink(
                            "Open Macro Browser", "dropdown-prevent-highlight", "editor-icon"),
                    callback: function(autoCompleteControl) {
                        var searchText = autoCompleteControl.text();
                        dropdownSelectionMade(autoCompleteControl, { searchText: searchText });
                    }
                }
            ];
        },

        getDataAndRunCallback : function(autoCompleteControl, val, callback) {
            var dropdownItems = [];
            if (!val) {
                $("#rte-featured-macros div").each(function() {
                    var macroMetadata = AJS.MacroBrowser.getMacroMetadata($(this).text());
                    var dropdownItem = makeMacroDropdownItem(macroMetadata);
                    dropdownItem && dropdownItems.push(dropdownItem);
                });
            } else {
                var summaries = AJS.MacroBrowser.searchSummaries(val, { keywordsField: "keywordsNoDesc" }),
                    itemCount;

                for (var i = 0, ii = summaries.length; i < ii; i++) {
                    var dropdownItem = makeMacroDropdownItem(summaries[i]);
                    if (dropdownItem && dropdownItems.push(dropdownItem) == autoCompleteControl.maxResults)
                       break;
                }
            }
            callback([dropdownItems], val);
        },

        update : function (autoCompleteControl, data) {
            throw new Error("All items in the Macro Autocomplete dropdown must have a callback function");
        }

    }});

