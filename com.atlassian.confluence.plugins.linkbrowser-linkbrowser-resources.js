AJS.log("LinkBrowser editor plugin src starting");
// Register TinyMCE plugin
(function() {

    tinymce.create('tinymce.plugins.LinkBrowser', {
        init : function(ed) {
            ed.addCommand('mceConflink', AJS.Editor.LinkBrowser.open);
            ed.addCommand('mceConfAttachments', function () {
                return AJS.Editor.LinkBrowser.open({
                    panelId: AJS.Editor.LinkBrowser.ATTACHMENTS_PANEL_ID
                });                
            }); // attachments item in insert menu

            ed.addButton("linkbrowserButton", {title: "confluence.conflink_desc", cmd: "mceConflink", "class": "mce_conflink" });
            ed.addShortcut("ctrl+k", ed.getLang("confluence.conflink_desc"), "mceConflink");
        },
        getInfo : function () {
            return {
                longname : "Confluence Link Browser",
                author : "Atlassian",
                authorurl : "http://www.atlassian.com/",
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });

    tinymce.PluginManager.add('linkbrowser', tinymce.plugins.LinkBrowser);
})();

AJS.Editor.Adapter.addTinyMcePluginInit(function(settings) {
    settings.plugins += ",linkbrowser";
    var buttons = settings.theme_advanced_buttons1;
    var index = buttons.indexOf("confimage");
    settings.theme_advanced_buttons1 = buttons.substring(0, index) + "linkbrowserButton," + buttons.substring(index);
});

AJS.Editor.LinkBrowser = (function($) {

    var loadI18nThen = function (open) {
    	if (window.LinkBrowserI18n) {
	       open();
	    }
	    else {
            AJS.I18n.get("com.atlassian.confluence.plugins.linkbrowser", function(i18n) {
                window.LinkBrowserI18n = i18n;
                open();
            }, function() {
                alert("There was an error loading the link browser, please try again");
            });
	    }    	
    	return false;
    },

    makeRichTextLinkInfo = function (linkAlias) {
        var t = AJS.Editor.LinkBrowser,
            selectedNode = tinyMCE.activeEditor.selection.getNode(),
            linkNode = $(selectedNode);

        if (linkNode.is("a[href]")) {
            var location = linkNode.attr("wikidestination");
            if (location){
                // for RTE links, we need to see if the alias was put there by the user or by the link renderer
                // However, the user may have typed a new alias via the RTE and the aliasspecified attribute might not
                // have been updated, in which case we should compare the text against the original aliases.
                var alias = null;
                if (linkNode.attr("aliasspecified") == "true" || linkAlias != linkNode.attr("originalalias"))
                {
                    alias = linkNode.text();
                }
                t.selectedNode = selectedNode;
                return t.loadRTELink(location, alias, linkNode.attr("href"));
            }
        }

        if (linkAlias && linkAlias.length) {
            return t.loadSelection(linkAlias);
        }
    },

    makeMarkupLinkInfo = function (linkAlias) {
        var t = AJS.Editor.LinkBrowser,
            wikiLink = getSelectedWikiLink();

        if (wikiLink) {
            return t.parseWikiLink(wikiLink);
        }

        if (linkAlias && linkAlias.length) {
            return t.loadSelection(linkAlias);
        }
    },

    restoreSelection = function() {
        if (AJS.Editor.inRichTextMode())
            AJS.Editor.Adapter.restoreSelectionState();
        else
            restoreMarkupSelection();
    },

    storeMarkupSelection = function() {
        var t = AJS.Editor.LinkBrowser,
            textarea = $("#markupTextarea");

        t.selection = textarea.selectionRange();
        t.scrollTop = textarea.scrollTop();
        return t.selection.text;
    },

    restoreMarkupSelection = function() {
        var t = AJS.Editor.LinkBrowser,
            textarea = $("#markupTextarea");

        if (t.selection) {
            textarea.selectionRange(t.selection.start, t.selection.end);
        }
        textarea.scrollTop(t.scrollTop);
    },

    getSelectedWikiLink = function() {
    	var t = AJS.Editor.LinkBrowser,
	        textarea = $("#markupTextarea");

    	var beforeSelection = t.selection.textBefore;
    	var wikiText = textarea.val();

    	var m = /^(?:.|\n)*[^\\](?=\[(?:\\\]|[^\]])+$)/m.exec(" " + beforeSelection + " "); // spaces required for when [ is the first or last character
    	if (!m) return null;

    	var startIndex = m[0].substring(1).length;

    	// now try and find the end of the link we're inside of
    	m = /\[((?:\\\]|[^\]])+)\]/m.exec(wikiText.substring(startIndex));
    	if (!m) return null;

    	textarea.selectionRange(startIndex, startIndex + m[0].length);
    	t.selection = textarea.selectionRange();
    	return m[1];
    };

    return {

    ATTACHMENTS_PANEL_ID: "attachments-panel-id",
    WEBLINK_PANEL_ID: "weblink-panel-id",

    /**
     * Loads any I18N required and then launches the dialog.
     *
     * If the options include an "opener" function, that is used to launch the dialog; otherwise a LinkInfo object is
     * created for the current Editor and the default launcher called.
     *
     * @param options : panelId - (optional) a panel of the Link Browser to open to
     *                  gwtOpener - (optional) a GWT function used to launch the Link Browser
     */
    open: function(options) {
        options = options || {};
        return loadI18nThen(function () {
            
        	// prevent it from opening if another popup dialog is open
        	if ($('.aui-dialog:visible').length){
        		return false;
        	}
        	
            var linkAlias, isRTE = AJS.Editor.inRichTextMode();

            // Store the current selection and scroll position, and get the selected text.
            if (isRTE) {
                AJS.Editor.Adapter.storeCurrentSelectionState();
                linkAlias = tinyMCE.activeEditor.selection.getContent({format : 'text'});
            } else {
                linkAlias = storeMarkupSelection();
            }

            if (options.gwtOpener) {
                // Any supplied opener function must include required state in its scope.
                options.gwtOpener(linkAlias);
            } else {
                var linkInfo = isRTE ? makeRichTextLinkInfo(linkAlias) : makeMarkupLinkInfo(linkAlias);
                AJS.Editor.LinkBrowser.openDialog(linkInfo, options.panelId || "");
            }

            // Close the Link Browser on Escape key
            $(document).keydown(function (e) {
                if (e.keyCode == 27 && !AJS.dropDown.current)  {
                    AJS.Editor.LinkBrowser.fireCancelEvent();
                    $(document).unbind("keydown", arguments.callee);
                    return AJS.stopEvent(e);
                }
            });            
        });
    },

    // Called from GWT
    cancel: function() {
        restoreSelection();
        AJS.Editor.LinkBrowser.selectedNode = null;
    },

    // Called from GWT
    insert: function(destination, alias, href, aliasspecified, markup) {
        restoreSelection();
        if (AJS.Editor.inRichTextMode()) {
            var linkDetails = {destination: destination, alias: alias, href: href, aliasspecified: aliasspecified};

            AJS.Editor.Adapter.insertLink(linkDetails, AJS.Editor.LinkBrowser.selectedNode);
            AJS.Editor.LinkBrowser.selectedNode = null;
        }
        else {
            var textArea = $("#markupTextarea");
            textArea.selection("[" + markup + "]");
            var selection = textArea.selectionRange();
            textArea.selectionRange(selection.end, selection.end);
        }
    },

    // Called from GWT
    bindUploadAttachment: function(formElement, onSubmit, onError, onSuccess) {
        var form = $(formElement);
        form.ajaxForm({
            dataType: "json",
            data: {
                contentId: AJS.params.attachmentSourceContentId,
                responseFormat: "html" // ensure response comes back as HTML for IE compatibility
            },
            resetForm: true,
            beforeSubmit: function () {
                onSubmit();
            },
            error: function (xhr) {
                onError([xhr.responseText]);
            },
            success: function (response) {
                if (response.actionErrors) {
                    onError(response.actionErrors);
                }
                else if(response.attachmentsAdded) {
                    onSuccess(response.attachmentsAdded);
                }
            }
        });
        form.find("input:file").change(function () { form.submit(); });
    }
};})(AJS.$);

AJS.toInit(function ($) {
    AJS.log("LinkBrowser editor plugin src initialising");
    $("#editor-insert-link").click(function(e) {
        AJS.Editor.LinkBrowser.open();
        return AJS.stopEvent(e);
    });

    $("#markupTextarea").keyup(function (e) {
        if (e.ctrlKey && e.keyCode == 75) {// bind ctrl+k to insert link
            $("#editor-insert-link").click();
            return AJS.stopEvent(e);
        }

    }).keydown(function (e) {
        // prevent firefox's default behaviour
        if (e.ctrlKey && e.keyCode == 75) {
            return AJS.stopEvent(e);
        }
    });
});

