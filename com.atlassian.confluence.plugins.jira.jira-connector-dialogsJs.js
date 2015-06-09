AJS.DataTable=function(G,C,A){var F=null;
if(G&&G.jquery){F=G
}else{if(typeof G=="string"){F=AJS.$(G)
}}F.addClass("data-table");
if(C&&C.length){this.columns=C;
var E=AJS.$("<tr></tr>").appendTo(F);
E.addClass("data-table-header");
for(var B=0;
B<C.length;
B++){var D=C[B];
E.append('<th class="'+D.className+'">'+D.title+"</th>")
}}this.tbl=F;
this.rowIdx=0
};
AJS.DataTable.prototype.addRow=function(D){var E=AJS.$("<tr></tr>").appendTo(this.tbl);
var B=this.columns;
for(var A=0;
A<this.columns.length;
A++){var C=B[A];
var F=AJS.$("<td></td>").appendTo(E);
F.addClass(C.className);
C.renderCell(F,D)
}E.data("row-data",D);
this._bindRowJs(E,this.rowIdx,"selected","hover");
this.rowIdx+=1;
E.attr("tabindex","-1")
};
AJS.DataTable.prototype.selectRow=function(A){var B=AJS.$("tbody tr",this.tbl)[A+1];
$(B).focus()
};
AJS.DataTable.prototype._bindRowJs=function(F,G,B,A){var E=AJS.$,D=this;
F.click(function(I){if(B){E(D.tbl).find("."+B).removeClass(B);
E(this).addClass(B)
}var H=F.data("row-data");
D.tbl.trigger("row-select",[H])
});
var C=function(K){switch(K.keyCode){case 13:var J;
var H=F.data("row-data");
F.keyup(J=function(L){D.tbl.trigger("row-action",[H]);
F.unbind("keyup",J);
return AJS.stopEvent(L)
});
break;
case 38:if(G>0){F.prev().focus()
}return AJS.stopEvent(K);
case 40:var I=E("tbody tr",D.tbl).length;
if(G<I-1){F.next().focus()
}return AJS.stopEvent(K)
}};
if(E.browser.mozilla){F.keypress(C)
}else{F.keydown(C)
}F.focus(function(H){F.click()
});
if(A){F.hover(function(){(this).addClass(A)
},function(){(this).removeClass(A)
})
}};
(function(){tinymce.create("tinymce.plugins.JiraLink",{init:function(B){var C="Insert JIRA Issue";
B.addCommand("mceJiralink",AJS.Editor.JiraConnector.open);
B.addShortcut("ctrl+shift+j","","mceJiralink");
B.addButton("jiralinkButton",{title:C,cmd:"mceJiralink","class":"mce_jiralink"});
var A=B.onPostRender.add(function(E){var D=E.controlManager;
D.setDisabled("jiralinkButton",true);
AJS.$.get(contextPath+"/rest/jiraanywhere/1.0/servers",function(F){if(F&&F.length){AJS.Editor.JiraConnector.servers=F;
D.setDisabled("jiralinkButton",false);
AJS.$("#linkinserters ul.toolbar-section").append('<li class="toolbar-button"><a id="editor-insert-issue" href="#" title="'+C+'"><label>'+C+'</label><span class="editor-icon"></span></a></li>');
AJS.$("#editor-insert-issue").click(function(G){AJS.Editor.JiraConnector.open();
return AJS.stopEvent(G)
});
AJS.$("#markupTextarea").keyup(function(G){if(G.ctrlKey&&G.shiftKey&&G.keyCode==74){AJS.$("#editor-insert-issue").click();
return AJS.stopEvent(G)
}}).keydown(function(G){if(G.ctrlKey&&G.shiftKey&&G.keyCode==74){return AJS.stopEvent(G)
}})
}})
})
},getInfo:function(){return{longname:"Confluence Jira Connector",author:"Atlassian",authorurl:"http://www.atlassian.com/",version:tinymce.majorVersion+"."+tinymce.minorVersion}
}});
tinymce.PluginManager.add("jiraconnector",tinymce.plugins.JiraLink)
})();
AJS.Editor.Adapter.addTinyMcePluginInit(function(B){B.plugins+=",jiraconnector";
var C=B.theme_advanced_buttons1;
var A=C.indexOf("confimage");
B.theme_advanced_buttons1=C.substring(0,A)+"jiralinkButton,"+C.substring(A)
});
AJS.Editor.JiraConnector=(function(G){var C="Insert JIRA Issue";
var F="Insert";
var D="Cancel";
var B;
var E=function(){var I=AJS.Editor.Markup,H=G("#markupTextarea");
if(I.selection){H.selectionRange(I.selection.start,I.selection.end)
}H.scrollTop(I.scrollTop)
};
var A=function(K){if(!B){B=new AJS.Dialog(800,590);
B.addHeader(C);
var J=AJS.Editor.JiraConnector.Panels;
for(var L=0;
L<J.length;
L++){B.addPanel(J[L].title());
var M=B.getCurrentPanel();
M.setPadding(0);
var I=J[L];
I.init(M)
}B.addButton(F,function(){var N=J[B.getCurrentPanel().id];
N.insertLink()
},"insert-issue-button");
B.addCancel(D,function(){AJS.Editor.JiraConnector.closePopup()
});
B.gotoPanel(0)
}B.show();
if(K){B.gotoPanel(1);
var H=AJS.Editor.JiraConnector.Panels[1];
H.setSummary(K)
}else{B.gotoPanel(B.getCurrentPanel().id)
}};
return{closePopup:function(){B.hide();
if(AJS.Editor.inRichTextMode()){AJS.Editor.Adapter.restoreSelectionState();
var H=tinymce.confluence.macrobrowser;
H.editedMacroDiv&&(H.editedMacroDiv=null)
}else{E()
}},open:function(){var N,I=AJS.Editor.inRichTextMode();
if(I){AJS.Editor.Adapter.storeCurrentSelectionState();
N=tinyMCE.activeEditor.selection.getContent({format:"text"});
var O=tinymce.confluence.macrobrowser,K=tinyMCE.activeEditor,H=O.getCurrentNode();
if(O.isMacroTag(H)&&G(H).text().indexOf("{jira:")==0){var J=H.parent()[0];
K.selection.select(J);
O.editedMacroDiv=J;
var L=tinymce.DOM.getOuterHTML(J);
AJS.safe.post(AJS.params.contextPath+"/json/convertxhtmltowikimarkupwithoutpage.action",{pageId:AJS.Editor.getContentId(),xhtml:L},function(Q){O.editedMacro=AJS.MacroBrowser.parseMacro(Q);
AJS.Editor.JiraConnector.edit(O.editedMacro)
},"json");
return 
}}else{var O=AJS.Editor.Markup,M=G("#markupTextarea");
O.selection=M.selectionRange();
O.scrollTop=M.scrollTop();
var P=AJS.MacroBrowser.getSelectedMacro(O.selection.textBefore,M.val());
if(P&&P.name=="jira"){AJS.Editor.JiraConnector.edit(P);
return 
}N=O.selection.text
}A(N)
},edit:function(J){var K=function(N){var M=N.indexOf("|");
if(M>=0){return N.substring(0,M)
}return N
};
var I=J.params[""]||J.params.jqlQuery||J.params.key||K(J.paramStr);
var L=J.params.server;
if(J&&!AJS.Editor.inRichTextMode()){G("#markupTextarea").selectionRange(J.startIndex,J.startIndex+J.markup.length)
}A();
if(I){B.gotoPanel(2);
var H=AJS.Editor.JiraConnector.Panels[2];
H.doSearch(I,L)
}}}
})(AJS.$);
AJS.MacroBrowser.setMacroJsOverride("jira",{opener:AJS.Editor.JiraConnector.edit});
AJS.Editor.JiraConnector.Panels=[];
AJS.Editor.JiraConnector.Panel=function(){};
AJS.Editor.JiraConnector.Panel.prototype={insertIssueLink:function(B){var D=AJS.$;
var F=function(G){var I=AJS.params.contentId||"0";
var H=tinymce.confluence.macrobrowser;
AJS.safe.post(AJS.params.contextPath+"/json/convertwikimarkuptoxhtmlwithoutpagewithspacekey.action",{pageId:I,spaceKey:AJS.params.spaceKey,wikiMarkup:G},function(L){var J=tinyMCE.activeEditor,K=J.dom.create("div",{},L);
D(".wysiwyg-macro",K).attr("wikihasprecedingnewline","true").attr("wikihastrailingnewline","true");
AJS.Editor.Adapter.restoreSelectionState();
AJS.Editor.Adapter.setNodeAtCursor(K,H.editedMacroDiv);
H.editedMacroDiv&&(H.editedMacroDiv=null)
},"json")
};
var A="{jira:"+B+"|server="+this.selectedServer.name+"}";
if(AJS.Editor.inRichTextMode()){F(A)
}else{var E=D("#markupTextarea");
var C=E.selectionRange();
E.selectionRange(C.start,C.end);
E.selection(A);
C=E.selectionRange();
E.selectionRange(C.end,C.end)
}AJS.Editor.JiraConnector.closePopup()
},disableInsert:function(){AJS.$(".insert-issue-button").disable()
},getOAuthRealm:function(D){var B=D.getResponseHeader("WWW-Authenticate")||"";
var A=/OAuth realm\=\"([^\"]+)\"/;
var C=A.exec(B);
if(C){return C[1]
}else{return null
}},enableInsert:function(){AJS.$(".insert-issue-button").enable()
},errorMsg:function(A,C){this.removeError(A);
var B=AJS.$('<div class="jira-error"></div>').appendTo(A);
B.append(C)
},ajaxError:function(C,B){if(C.status==401){var A=this.getOAuthRealm(C);
this.selectedServer.authUrl=A;
B.call(this)
}else{this.errorMsg(this.container,"Received the following HTTP error code from the server"+":"+C.status)
}},removeError:function(A){AJS.$("div.jira-error",A).remove()
},setActionOnEnter:function(A,B){A.keydown(function(C){if(C.which==13){var D=function(E){A.unbind("keyup",D);
B();
return AJS.stopEvent(E)
};
A.keyup(D);
return AJS.stopEvent(C)
}})
},createOauthForm:function(D){var C=this.selectedServer;
var B={onSuccess:function(){C.authUrl=null;
D(C)
},onFailure:function(){}};
var A=AJS.$('<div class="oauth-message"><a class="oauth-init" href="#">'+"Login & Approve"+"</a></div>");
A.append(document.createTextNode(" "+"to retrieve data from"+" "+this.selectedServer.name));
AJS.$(".oauth-init",A).click(function(E){AppLinks.authenticateRemoteCredentials(C.authUrl,B.onSuccess,B.onFailure);
E.preventDefault()
});
return A
},applinkServerSelect:function(A,B){var C=AJS.Editor.JiraConnector.servers;
AJS.$(C).each(function(){var D="<option ";
if(this.selected){selectedServer=this;
D+='selected="selected"'
}D+='value="'+this.id+'"></option>';
D=AJS.$(D);
D.text(this.name);
AJS.$(A).append(D);
D.data("jiraapplink",this)
});
AJS.$(A).change(function(F){var D=AJS.$("option:selected",A);
var E=D.data("jiraapplink");
B(E)
})
},showSpinner:function(D,A,C,B){AJS.$.data(D,"spinner",Raphael.spinner(D,A,"#666"));
if(C){AJS.$(D).css("marginLeft",-A*1.2)
}if(B){AJS.$(D).css("marginTop",-A*1.2)
}},hideSpinner:function(A){AJS.$(A).css("marginTop","");
AJS.$(A).css("marginLeft","");
var B=AJS.$.data(A,"spinner");
if(B){B();
delete B;
AJS.$.data(A,"spinner",null)
}},setSelectedIssue:function(A){this.selectedIssue=A;
this.enableInsert()
},insertSelected:function(){if(this.selectedIssue){this.insertIssueLink(this.selectedIssue.key)
}},createIssueTableFromUrl:function(C,K,B,A,D,H,I,F){var E=AJS.$;
E("div.data-table",C).remove();
var J=E('<div class="data-table jiraSearchResults" ></div>').appendTo(C);
var L=E('<div class="loading-data"></div>').appendTo(J);
this.showSpinner(L[0],50,false,true);
var G=this;
this.currentXhr=AppLinks.makeRequest({appId:K,type:"GET",url:B,dataType:"xml",success:function(R){L.remove();
G.removeError(C);
var M=E("item",R);
AJS.$(":disabled",C).enable();
if(M.length){var P=E('<table class="my-result"></table>');
E(".jiraSearchResults",C).append(P);
var N=[{className:"issue-key-column",title:"Key",renderCell:function(T,S){E("<span style=\"background-repeat:no-repeat;background-image: url('"+S.iconUrl+"');padding-left:20px;padding-bottom:2px;\" ></span>").appendTo(T).text(S.key)
}},{className:"issue-summary-column",title:"Summary",renderCell:function(T,S){T.text(S.summary)
}}];
var Q=new AJS.DataTable(P,N);
var O;
E(M).each(function(){var S={iconUrl:E("type",this).attr("iconUrl"),key:E("key",this).text(),summary:E("summary",this).text(),url:E("link",this).text()};
Q.addRow(S)
});
P.bind("row-action",function(T,S){D.call(G,S)
});
P.bind("row-select",function(T,S){A.call(G,S)
});
Q.selectRow(0);
if(I){I.call(G)
}}else{if(H){H()
}E(".jiraSearchResults",C).append('<div class="message-panel">No search results found.</div>')
}},error:function(M){AJS.$(":disabled",C).enable();
L.remove();
F.call(G,M)
}})
}};
AJS.Editor.JiraConnector.Panel.Recent=function(){};
AJS.Editor.JiraConnector.Panel.Recent.prototype=AJS.$.extend(AJS.Editor.JiraConnector.Panel.Recent.prototype,AJS.Editor.JiraConnector.Panel.prototype);
AJS.Editor.JiraConnector.Panel.Recent.prototype=AJS.$.extend(AJS.Editor.JiraConnector.Panel.Recent.prototype,{title:function(){return "Recently Viewed"
},init:function(A){A.html('<div id="my-recent-issues"></div>');
var C=this;
var D=AJS.Editor.JiraConnector.servers;
this.selectedServer=D[0];
if(D.length>1){var B=AJS.$('<div class="jira-server-select"><form action="#" method="post" class="aui"><div class="field-group"><label>Server</label><select class="select" ></select></div></form></div>').appendTo("div#my-recent-issues");
this.applinkServerSelect(AJS.$(".select",B),function(E){C.selectedServer=E;
C.onselect()
})
}A.onselect=function(){C.onselect()
}
},insertLink:function(){this.insertSelected()
},onselect:function(){var D=this;
var B=AJS.$("div#my-recent-issues");
this.container=B;
var E=function(){B.children().not(".jira-server-select").remove()
};
var C=function(G){D.ajaxError(G,B)
};
var F;
var A=function(){if(D.selectedServer.authUrl){E();
var G=D.createOauthForm(function(){F()
});
B.append(G)
}else{F()
}};
F=function(){if(D.currentXhr&&D.currentXhr.readyState!=4){return 
}AJS.$(".select",B).disable();
E();
D.createIssueTableFromUrl(B,D.selectedServer.id,"/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=key+in+issueHistory()&tempMax=50&field=summary&field=type&field=link",D.setSelectedIssue,D.insertLink,D.disableInsert,null,function(G){AJS.$("div.data-table",B).remove();
D.ajaxError(G,A)
})
};
A()
}});
AJS.Editor.JiraConnector.Panels.push(new AJS.Editor.JiraConnector.Panel.Recent());
AJS.Editor.JiraConnector.Panel.Create=function(){};
AJS.Editor.JiraConnector.Panel.Create.prototype=AJS.$.extend(AJS.Editor.JiraConnector.Panel.Create.prototype,AJS.Editor.JiraConnector.Panel.prototype);
AJS.Editor.JiraConnector.Panel.Create.prototype=AJS.$.extend(AJS.Editor.JiraConnector.Panel.Create.prototype,{errorMsg:function(A,C){this.removeError(A);
var B=AJS.$('<div class="jira-error"></div>').prependTo(A);
B.append(C)
},resetProject:function(){var B=AJS.$(".component-select",this.container);
var A=AJS.$(".version-select",this.container);
B.children().remove();
A.children().remove();
B.parent().hide();
A.parent().hide();
AJS.$('input[type="hidden"]',this.container).remove()
},setSummary:function(A){AJS.$(".issue-summary",this.container).val(A)
},resetIssue:function(){AJS.$(".issue-summary",this.container).val("").focus();
AJS.$(".issue-description",this.container).val("")
},resetForm:function(){var A=this.container;
AJS.$(".project-select",A).children().remove();
AJS.$(".type-select",A).children().remove();
this.resetProject()
},authCheck:function(A){this.selectedServer=A;
if(this.selectedServer.authUrl){this.showOauthChallenge()
}else{this.serverSelect()
}},ajaxAuthCheck:function(B){var A=this;
this.endLoading();
this.ajaxError(B,function(){A.authCheck(A.selectedServer)
})
},serverSelect:function(){AJS.$(".oauth-message",this.container).remove();
AJS.$("div.field-group",this.container).show();
this.resetForm();
this.loadProjects()
},showOauthChallenge:function(){AJS.$("div.field-group",this.container).not(".servers").hide();
AJS.$(".oauth-message",this.container).remove();
var A=this;
var B=this.createOauthForm(function(){A.serverSelect()
});
this.container.append(B)
},summaryOk:function(){return AJS.$(".issue-summary",this.container).val().replace("\\s","").length>0
},projectOk:function(){var A=AJS.$(".project-select option:selected",this.container).val();
return A&&A.length&&A!="-1"
},setButtonState:function(){if(this.summaryOk()&&this.projectOk()){this.enableInsert();
return true
}else{this.disableInsert();
return false
}},startLoading:function(){this.removeError(this.container);
AJS.$(".loading-blanket",this.container).show();
AJS.$("input,select,textarea",this.container).disable();
this.disableInsert()
},endLoading:function(){AJS.$(".loading-blanket",this.container).hide();
AJS.$("input,select,textarea",this.container).enable();
this.setButtonState()
},populateForm:function(B,C){this.resetProject();
this.startLoading();
var D=this;
var A=this.container;
populateRequest=AppLinks.makeRequest({appId:D.selectedServer.id,type:"GET",url:"/secure/CreateIssue.jspa?pid="+B+"&issuetype="+C,dataType:"html",success:function(K){D.endLoading();
var L=AJS.$('form[action$="http://10.20.160.198/wiki/s/en/2166/34/1.0/_/download/batch/com.atlassian.confluence.plugins.jira.jira-connector:dialogsJs/CreateIssueDetails.jspa"]',K);
var G=AJS.$('select[name="versions"] option',L).not('[value="-1"]');
var J=AJS.$('select[name="components"] option',L).not('[value="-1"]');
var H=AJS.$('input[name="reporter"]',L).val();
var I=AJS.$('select[name="priority"]',L).val();
var F=AJS.$("div.type-select-parent",A);
if(G.length){var E=AJS.$(".version-select",A);
E.parent().show();
E.append(G)
}if(J.length){var E=AJS.$(".component-select",A);
E.parent().show();
E.append(J)
}if(H){AJS.$("form",A).append('<input type="hidden" name="reporter" value="'+H+'" />')
}AJS.$("form",A).append('<input type="hidden" name="assignee" value="-1" />');
if(I){AJS.$("form",A).append('<input type="hidden" name="priority" value="'+I+'" />')
}},error:function(E){D.ajaxAuthCheck(E)
}})
},loadProjects:function(){this.startLoading();
this.disableInsert();
var B=this;
var D={};
var C={};
var A={};
AppLinks.makeRequest({appId:B.selectedServer.id,type:"GET",url:"http://10.20.160.198/rest/api/1.0/admin/issuetypeschemes.json",dataType:"json",success:function(G){var E=B.container;
AJS.$(G.types).each(function(){D[this.id]=this
});
var F=AJS.$(".project-select",E);
AJS.$(G.projects).each(function(){C[this.id]=this;
var H=AJS.$('<option value="'+this.id+'"></option>').appendTo(F);
H.text(this.name)
});
F.prepend('<option value="-1" selected>Select a Project</option>');
AJS.$(G.schemes).each(function(){A[this.id]=this
});
AJS.$(".type-select",E).disable();
F.unbind();
F.change(function(){var L=AJS.$("option:selected",F);
if(L.val()!="-1"){AJS.$('option[value="-1"]',F).remove();
var K=A[C[L.val()].scheme];
AJS.$(".type-select option",E).remove();
var I=AJS.$("select.type-select",E);
I.unbind();
AJS.$(K.types).each(function(){var M=D[this];
if(M){var N=AJS.$('<option value="'+M.id+'"></option>').appendTo(I);
N.text(M.name)
}});
AJS.$("option:first",I).attr("selected","selected");
var H=L.val();
var J=function(){var M=AJS.$("option:selected",I).val();
B.populateForm(H,M)
};
AJS.$(".type-select",E).enable();
J();
I.change(J);
if(B.summaryOk()){B.enableInsert()
}}});
B.endLoading();
F.focus()
},error:function(E){B.ajaxAuthCheck(E)
}})
},title:function(){return "Create New Issue"
},init:function(B){B.html('<div class="create-issue-container"></div>');
this.container=AJS.$("div.create-issue-container");
var A=this.container;
var G=AJS.Editor.JiraConnector.servers;
this.selectedServer=G[0];
A.append('<form action="#" method="post" class="aui"><div class="loading-blanket" style="display:none"><div class="loading-data"></div></div><div class="field-group servers"><label>Server</label><select class="select server-select"></select></div><div class="field-group project-select-parent" ><label>Project</label><select class="select project-select" name="pid"></select></div><div class="field-group type-select-parent" ><label>Issue Type</label><select class="select type-select" name="issuetype"></select></div><div class="field-group"><label>Summary</label><input class="text issue-summary" type="text" name="summary"/></div><div style="display:none" class="field-group component-parent" ><label>Component/s</label><select class="select component-select" multiple="multiple" size="3" name="components" ></select></div><div style="display:none" class="field-group version-parent" ><label>Version/s</label><select class="select version-select" multiple="multiple" size="3" name="versions"></select></div><div class="field-group"><label>Description</label><textarea class="issue-description" rows="5" name="description"/></div></form>');
var F=this;
var E=AJS.$("select.server-select",A);
if(G.length>1){this.applinkServerSelect(E,function(H){F.authCheck(H)
})
}else{E.parent().remove()
}var D=AJS.$(".issue-summary",A);
D.keyup(function(){F.setButtonState()
});
this.showSpinner(AJS.$(".loading-data",A)[0],50,true,true);
var C=function(){AJS.$(".insert-issue-button:enabled").click()
};
this.setActionOnEnter(D,C);
B.onselect=function(){F.onselect()
}
},insertLink:function(){var B=AJS.$("div.create-issue-container form");
var C="/secure/CreateIssueDetails.jspa?"+B.serialize();
this.startLoading();
var A=this;
AppLinks.makeRequest({appId:this.selectedServer.id,type:"GET",url:C,dataType:"html",success:function(F){var E=AJS.$("#key-val",F);
if(!E.length){E=AJS.$('#issuedetails a[id^="issue_key"]',F)
}if(!E.length){var G=AJS.$(".errMsg, .error",F);
var D=AJS.$("<ul></ul>");
G.each(function(){AJS.$("<li></li>").appendTo(D).text(AJS.$(this).text())
});
A.errorMsg(AJS.$("div.create-issue-container"),AJS.$("<div>"+"There were errors creating an issue in JIRA. Some required fields may not be available on this form. Try creating this issue in "+' <a target="_blank" href="'+A.selectedServer.url+'" >JIRA</a></div>').append(D))
}else{A.insertIssueLink(E.text(),A.selectedServer.url+"/browse/"+E.text());
A.resetIssue()
}A.endLoading()
},error:function(E,D){A.ajaxAuthCheck(E)
}})
},onselect:function(){var A=this.container;
if(!AJS.$(".project-select option",A).length||AJS.$(".oauth-message",A).length){this.authCheck(this.selectedServer)
}if(this.setButtonState()||this.projectOk()){AJS.$(".project-select",this.container).focus();
AJS.$(".issue-summary",this.container).focus()
}}});
AJS.Editor.JiraConnector.Panels.push(new AJS.Editor.JiraConnector.Panel.Create());
AJS.Editor.JiraConnector.Panel.Search=function(){this.jql_operators=/=|!=|~|>|<|!~| is | in /i;
this.issueKey=/\s*([A-Z][A-Z]+)-[0-9]+\s*/
};
AJS.Editor.JiraConnector.Panel.Search.prototype=AJS.$.extend(AJS.Editor.JiraConnector.Panel.Search.prototype,AJS.Editor.JiraConnector.Panel.prototype);
AJS.Editor.JiraConnector.Panel.Search.prototype=AJS.$.extend(AJS.Editor.JiraConnector.Panel.Search.prototype,{title:function(){return "Search"
},init:function(A){var K=AJS.Editor.JiraConnector.servers;
this.selectedServer=K[0];
var D=AJS.$;
A.html('<div id="my-jira-search"></div>');
var G=this;
var B=D("div#my-jira-search");
this.container=B;
var I=function(){B.children().not("div.jira-search-form").remove()
};
var F=function(){D("http://10.20.160.198/wiki/s/en/2166/34/1.0/_/download/batch/com.atlassian.confluence.plugins.jira.jira-connector:dialogsJs/input.text",B).enable();
D("button",B).enable()
};
var L=function(){D("button",B).disable();
D("http://10.20.160.198/wiki/s/en/2166/34/1.0/_/download/batch/com.atlassian.confluence.plugins.jira.jira-connector:dialogsJs/input.text",B).disable()
};
var H=function(N){if(N){G.selectedServer=N
}if(G.selectedServer.authUrl){L();
I();
var M=G.createOauthForm(function(){I();
F()
});
D(".search-help").hide();
B.append(M)
}else{I();
F();
D(".search-help").show()
}};
this.authCheck=H;
var E=function(P,T){D("div.jql-insert-check").remove();
if(P){D("input",B).val(P)
}if(T&&T!=this.selectedServer.name){var S=AJS.Editor.JiraConnector.servers;
for(var Q=0;
Q<S.length;
Q++){if(S[Q].name==T){D('option[value="'+S[Q].id+'"]',B).attr("selected","selected");
D("select",B).change();
break
}}}if(this.currentXhr&&this.currentXhr.readyState!=4){return 
}var N=P||D("input",B).val();
var O=N;
var R=false;
if(!N.match(G.jql_operators)){var M=N.match(G.issueKey)||[""];
if(M[0]==N){O="issuekey in ("+N+")";
R=true
}else{O='summary ~ "'+N+'" OR description ~ "'+N+'"'
}}D("select",B).disable();
L();
G.createIssueTableFromUrl(B,G.selectedServer.id,"/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery="+encodeURIComponent(O)+"&tempMax=20&field=summary&field=type&field=link",G.setSelectedIssue,G.insertLink,G.disableInsert,function(){if(!R){var U=(P&&!R)?true:false;
B.append('<div class="jql-insert-check"><input type="checkbox" name="as-jql" value="as-jql" />'+"Insert all query results as a table"+"</div>");
if(U){D("input:checkbox",B).attr("checked","true")
}G.lastSearch=O
}},function(U){D("div.data-table",B).remove();
if(U.status==400){G.errorMsg(B,"The JIRA server didnt understand your search query. If you entered JQL, please ensure that its correctly formed. If you entered an issue key, ensure that it exists and you have permission to view it.")
}else{G.ajaxError(U,H)
}})
};
this.doSearch=E;
var C=D('<div class="jira-search-form"><form><fieldset class="inline"><div class="search-input"><input type="text" class="text one-server" name="jiraSearch"/></div><button type="button">'+"Search"+'</button></fieldset></form><div class="search-help">'+"Search using JQL, a single issue key, or plain text"+"</div></div>").appendTo(B);
if(K.length>1){var J=D('<select class="select" tabindex="0"></select>').insertAfter("div.search-input",C);
G.applinkServerSelect(J,H);
D("input.one-server",C).removeClass("one-server")
}H(this.selectedServer);
D("button",B).click(function(){E()
});
this.setActionOnEnter(D("input",B),E);
A.onselect=function(){G.onselect()
}
},insertLink:function(){if(AJS.$(".jql-insert-check input:checkbox:checked").length){this.insertIssueLink(this.lastSearch)
}else{this.insertSelected()
}},onselect:function(){var A=AJS.$("div#my-jira-search");
var B=AJS.$("tr.selected",A);
if(B.length){this.enableInsert();
B.focus()
}else{if(AJS.$(".oauth-message",A).length){this.authCheck(this.selectedServer)
}AJS.$("input",A).focus();
this.disableInsert()
}}});
AJS.Editor.JiraConnector.Panels.push(new AJS.Editor.JiraConnector.Panel.Search());
