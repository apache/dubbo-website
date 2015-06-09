
/**
 * Settings that each Autocomplete will be initialized on, depending on the trigger character used to activate the
 * autocomplete.
 */
AJS.toInit(function ($) {
    AJS.log("tinyMce-autocomplete-settings-media initialising");

    // these types match those in the Java Attachment.Type enum
    var embeddableAttachmentTypes = ["image","word","excel","pdf","powerpoint","multimedia"],

    getUrl = function(val) {
        var parentId = AJS.params.attachmentSourceContentId || AJS.params.contentId;
        var suggestionUrl = +parentId ? "/rest/prototype/1/content/" + parentId + "/attachments.json" : null;
         return AJS.params.contextPath + (val ? "http://10.20.160.198/rest/prototype/1/search.json": suggestionUrl);
    },

    getParams = function(autoCompleteControl, val)
    {
        return val ?
        {
            type: "attachment",
            attachmentType: embeddableAttachmentTypes,
            search: "name",
            "max-results": autoCompleteControl.maxResults,
            query: val
        } : {
            attachmentType: embeddableAttachmentTypes,
            "max-results": autoCompleteControl.maxResults
        };
    };

    // Media settings
    tinymce.confluence.Autocompleter.Settings["!"] = {
        ch : "!",
        endChars : ["!"],

        dropDownClassName: "autocomplete-media",

        getHeaderText : function (autoCompleteControl, value) {
            return "Media suggestions";
        },

        getAdditionalLinks : function (autoCompleteControl, value) {
            return [
                {
                    className: "dropdown-insert-image",
                    html: tinymce.confluence.Autocompleter.Util.dropdownLink(
                            "Open Image Browser", "dropdown-prevent-highlight", "editor-icon"),
                    callback: function(autoCompleteControl) {
                        autoCompleteControl.replaceWithSelectedSearchText();
                        autoCompleteControl.die();
                        tinyMCE.confImage.openDialog();
                    }
                },
                {
                    className: "dropdown-insert-macro",
                    html: tinymce.confluence.Autocompleter.Util.dropdownLink(
                            "Insert Other Media", "dropdown-prevent-highlight", "editor-icon"),
                    callback: function(autoCompleteControl) {
                        autoCompleteControl.replaceWithSelectedSearchText();
                        autoCompleteControl.die();
                        tinymce.confluence.macrobrowser.macroBrowserToolbarButtonClicked({
                            selectedCategory: "media"
                        });
                    }
                }
            ];
        },

        getDataAndRunCallback : function(autoCompleteControl, val, callback) {
            tinymce.confluence.Autocompleter.Util.getRestData(autoCompleteControl, getUrl, getParams, val, callback, "attachment");
        },

        update : function(autoCompleteControl, data) {
            var linkDetails = AJS.REST.wikiLink(data.restObj),
                name = data.restObj && data.restObj.title || data.name;

            if (data.restObj.niceType == "Image") {
                // leading ^ is not needed for images attached to the current page
                var destination = linkDetails.destination && linkDetails.destination.replace(/^\^/, "");
                var propertyMap = $.extend({
                    destination: destination,
                    pageId: data.ownerId || data.restObj.ownerId
                }, linkDetails.params);
                tinymce.confluence.ImageUtils.insertFromProperties(propertyMap);

            } else {
                // Other embeddable content, such as a viewfile macro variant
                var macroName;
                switch (data.restObj.niceType) {
                    case 'PDF Document':            macroName = "viewpdf"; break;
                    case 'Word Document':           macroName = "viewdoc"; break;
                    case 'Excel Spreadsheet':       macroName = "viewxls"; break;
                    case 'PowerPoint Presentation': macroName = "viewppt"; break;
                    case 'Multimedia':              macroName = "multimedia"; break;
                }
                var spacePage = linkDetails.destination.substring(0, linkDetails.destination.indexOf("^"));
                var macroParams = {
                    page: spacePage,
                    name: name
                };
                AJS.MacroBrowser.getMacroJsOverride("viewdoc").beforeParamsRetrieved(macroParams);  // tweak for macro expected format
                var paramsArr = [];
                for (var key in macroParams) {
                    macroParams[key] && paramsArr.push(key + "=" + macroParams[key]);
                }
                var macroMarkup = "{" + macroName + ":" + paramsArr.join("|") + "}";
                tinymce.confluence.macrobrowser.insertMacroAtSelectionFromMarkup(macroMarkup, function() { autoCompleteControl.die() });
            }
        }

    };
});

