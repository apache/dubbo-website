
/**
 * Settings that each Autocomplete will be initialized on, depending on the trigger character used to activate the
 * autocomplete.
 */
AJS.toInit(function ($) {
    AJS.log("tinyMce-autocomplete-settings-links initialising");
    var autoComplete = tinymce.confluence.Autocompleter,

    getUrl = function(val) {
        var suggestionUrl = AJS.params.remoteUser ? "http://10.20.160.198/rest/prototype/1/session/history.json" : null;
         return AJS.params.contextPath + (val ? "http://10.20.160.198/rest/prototype/1/search.json": suggestionUrl);
    },

    getParams = function(autoCompleteControl, val) {
        var params = {
            "max-results": autoCompleteControl.maxResults
        };
        if (val) {
            params.query = val;
            params.search = "name";
        }
        return params;  
    };

    // Link settings.
    tinymce.confluence.Autocompleter.Settings["["] = {

        ch : "[",
        endChars : ["]"],

        dropDownClassName: "autocomplete-links",

        getHeaderText : function (autoCompleteControl, value) {
            return "Link suggestions";
        },

        getAdditionalLinks : function (autoCompleteControl, value) {
            var searchPrompt;
            if (value) {
                var message = "Search for &lsquo;{0}&rsquo;";
                searchPrompt = AJS.format(message, value);
            } else {
                searchPrompt = "Search";
            }

            return [
                {
                    className: "search-for",
                    name: searchPrompt,
                    href: "#",
                    callback : function (autoCompleteControl) {
                        autoCompleteControl.replaceWithSelectedSearchText();
                        AJS.Editor.LinkBrowser.open({
                            gwtOpener: AJS.Editor.LinkBrowser.openAndSearch
                        });
                    }
                },
                {
                    className: "dropdown-insert-link",
                    html: autoComplete.Util.dropdownLink("Insert Web Link", "dropdown-prevent-highlight", "editor-icon"),
                    callback: function (autoCompleteControl) {
                        autoCompleteControl.replaceWithSelectedSearchText();
                        AJS.Editor.LinkBrowser.open({
                            panelId: AJS.Editor.LinkBrowser.WEBLINK_PANEL_ID
                        });
                    }
                }
            ];
        },

        getDataAndRunCallback : function(autoCompleteControl, val, callback) {
            tinymce.confluence.Autocompleter.Util.getRestData(autoCompleteControl, getUrl, getParams, val, callback, "content");
        },

        update : function(autoCompleteControl, data) {
            var linkDetails = AJS.REST.wikiLink(data.restObj);            
            AJS.Editor.Adapter.insertLink(linkDetails);
        }

    }

});

