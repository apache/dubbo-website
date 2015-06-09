if(!AJS.MacroBrowser.Macros["gadget"]){
    AJS.MacroBrowser.Macros["gadget"] = {};
}

AJS.MacroBrowser.Macros["gadget"].postPreview = function (iframe, macro) {
    var hasAJS = iframe.contentWindow.AJS;
    var bodyParamMap = {};
    var keyValuePairs = AJS.$("#macro-insert-container .macro-body-div textarea").val().split("&");
    for (var i = 0; i < keyValuePairs.length; i++) {
        var keyValue = keyValuePairs[i].split("=");
        try {
            bodyParamMap[decodeURI(keyValue[0])] = decodeURI(keyValue[1]);
        } catch(e) {
            //Do nothing, just skip it. It's not essential that we capture all preferences, and not all are valid
            //to be decoded as a URI
        }
    }
    if (macro.needsConfig && hasAJS) {
        var bodyConfigured = !!bodyParamMap["isConfigured"];

        if (!bodyConfigured) {
            var okButton = AJS.$("#macro-browser-dialog .dialog-button-panel .ok");
            AJS.$("#save-warning-span").addClass("gadget-not-configured-warning").text(AJS.params.gadgetPreviewWarning).removeClass("hidden");
            okButton.attr("disabled", "disabled");
        }
    }
};

AJS.MacroBrowser.Macros["gadget"].populateBodyParams = function(body) {
    var bodyParamMap = {};
    var keyValuePairs = AJS.$("textarea", body).val().split("&");
    for (var i = 0; i < keyValuePairs.length; i++) {
        var keyValue = keyValuePairs[i].split("=");
        bodyParamMap[decodeURI(keyValue[0])] = decodeURI(keyValue[1]);
    }
    return bodyParamMap;
};

AJS.MacroBrowser.Macros["gadget"].prepareMacroForPreview = function(wikiMarkup) {
    var posOfBrace = wikiMarkup.indexOf('}');
    return wikiMarkup.substring(0, posOfBrace) + "|forceWrite=true" + wikiMarkup.substring(posOfBrace, wikiMarkup.length);
};

AJS.MacroBrowser.Macros["gadget"].manipulateMarkup = function (macro) {
        if(AJS.MacroBrowser.gadgetPrefsChanged){
            var container = top.document.getElementById("macro-insert-container");
            var textArea = AJS.$(".macro-body-div .textarea", container);
            var baseVal = "";
            for (var key in AJS.MacroBrowser.gadgetPrefs)
            {
                if (baseVal.length != 0)
                {
                    baseVal += "&";
                }
                baseVal = baseVal + encodeURI(key) + "=" + encodeURI(AJS.MacroBrowser.gadgetPrefs[key]);
            }
            textArea.val(baseVal);
        }
};

//Adds special behaviour for "gadget" macros : only considered the same if they share the same url as the selected macro
AJS.MacroBrowser.Macros["gadget"].getMacroDetailsFromSelectedMacro = function(metadataList, selectedMacroToUse) {
    var selectedUrl = selectedMacroToUse.params["url"];
    for (var i = 0; i < metadataList.length; i++) {
        var tempMacro = metadataList[i];
        if (tempMacro.macroName == selectedMacroToUse.name) {
            for (var j = 0; j < tempMacro.formDetails.parameters.length; j++) {
                if (tempMacro.formDetails.parameters[j].name == "url") {
                    if (tempMacro.formDetails.parameters[j].defaultValue == selectedUrl) {
                        return tempMacro;
                    }
                }
            }
        }
    }
};

//Add special handling to intepret and merge existing body params for opensocial preference gadgets
AJS.MacroBrowser.Macros["gadget"].applySpecialBodyHandling = function(macro, previousBodyMarkup, bodyParamMap) {
    var result="";
    if (macro.nonHiddenUserPrefs) {
        var first = true;
        //reparse the possible existing key value pairs
        var userPreferenceMap = {};

        if (previousBodyMarkup) {
            var keyValuePairs = previousBodyMarkup.split("&");
            for (var i = 0; i < keyValuePairs.length; i++) {
                var keyValue = keyValuePairs[i].split("=");
                var userPrefKey = decodeURI(keyValue[0]);
                var userPrefValue = decodeURI(keyValue[1]);
                userPreferenceMap[userPrefKey] = userPrefValue;
            }
        }

        //New values take precedence over existing values
        for (var param1 in bodyParamMap) {
            userPreferenceMap[param1] = bodyParamMap[param1];
        }

        var isDefaultValue = function (macro, name, value)
        {
            var params = macro.formDetails.parameters;
            for (var i = 0; i < params.length; i++)
            {
                if (params[i].name == name)
                {
                    return value == params[i].defaultValue;
                }
            }
            //Not necessarily bad ... could be a param we don't have metadata for
            AJS.log("Unable to find matching param for " + name);
            return false;
        };

        for (var param in userPreferenceMap) {
            if (!isDefaultValue(macro, param, userPreferenceMap[param]))
            {
                if (!first)
                {
                    result += "&";
                }
                first = false;
                result = result + encodeURI(param) + "=" + encodeURI(userPreferenceMap[param]);
            }
        }
        return result;
    }
    else
    {
        return previousBodyMarkup;
    }
};

