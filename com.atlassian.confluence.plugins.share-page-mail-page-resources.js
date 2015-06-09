AJS.Confluence.SharePage={};
AJS.Confluence.SharePage.autocompleteUser=function(C){C=C||document.body;
var D=AJS.$,A=/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
var B=function(F){if(!F||!F.result){throw new Error("Invalid JSON format")
}var E=[];
E.push(F.result);
return E
};
D("input.autocomplete-sharepage[data-autocomplete-user-bound!=true]",C).each(function(){var G=D(this).attr("data-autocomplete-sharepage-bound","true").attr("autocomplete","off");
var F=G.attr("data-max")||10,I=G.attr("data-alignment")||"left",H=G.attr("data-dropdown-target"),E=null;
if(H){E=D(H)
}else{E=D("<div></div>");
G.after(E)
}E.addClass("aui-dd-parent autocomplete");
G.quicksearch(AJS.REST.getBaseUrl()+"search/user.json",function(){G.trigger("open.autocomplete-sharepage")
},{makeParams:function(J){return{"max-results":F,query:J}
},dropdownPlacement:function(J){E.append(J)
},makeRestMatrixFromData:B,addDropdownData:function(J){if(A.test(G.val())){J.push([{name:G.val(),email:G.val(),href:"#",icon:AJS.Confluence.getContextPath()+"/images/icons/profilepics/anonymous.png"}])
}if(!J.length){var K=G.attr("data-none-message");
if(K){J.push([{name:K,className:"no-results",href:"#"}])
}}return J
},ajsDropDownOptions:{alignment:I,displayHandler:function(J){if(J.restObj&&J.restObj.username){return J.name+" ("+J.restObj.username+")"
}return J.name
},selectionHandler:function(L,K){if(K.find(".search-for").length){G.trigger("selected.autocomplete-sharepage",{searchFor:G.val()});
return 
}if(K.find(".no-results").length){this.hide();
L.preventDefault();
return 
}var J=D("span:eq(0)",K).data("properties");
if(!J.email){J=J.restObj
}G.trigger("selected.autocomplete-sharepage",{content:J});
this.hide();
L.preventDefault()
}}})
})
};
(function(E){var D,B={hideCallback:A,width:280,offsetY:17,offsetX:-40,hideDelay:3600000};
var A=function(){E(".dashboard-actions .explanation").hide()
};
var C=function(I,G,H){I.empty();
I.append(AJS.template.load("share-content-popup").fill());
AJS.Confluence.SharePage.autocompleteUser();
var J=function(){D.hide();
return false
};
E(document).keyup(function(L){if(L.keyCode==27){J();
E(document).unbind("keyup",arguments.callee);
return false
}return true
});
I.find(".close-dialog").click(J);
I.find("form").submit(function(){var O=[];
I.find(".recipients li").each(function(P,Q){O.push(E(Q).attr("data-username"))
});
if(O.length<=0){return false
}E("button,input,textarea",this).attr("disabled","disabled");
I.find(".progress-messages").text("Sending");
var L=Raphael.spinner(I.find(".progress-messages-icon")[0],7,"#666");
I.find(".progress-messages-icon").css("left","10px").css("position","absolute");
I.find(".progress-messages").css("padding-left",I.find(".progress-messages-icon").innerWidth()+5);
var O=[];
I.find(".recipients li[data-username]").each(function(P,Q){O.push(E(Q).attr("data-username"))
});
var N=[];
I.find(".recipients li[data-email]").each(function(P,Q){N.push(E(Q).attr("data-email"))
});
var M={users:O,emails:N,note:I.find("#note").val(),entityId:AJS.params.pageId};
E.ajax({type:"POST",contentType:"application/json; charset=utf-8",url:AJS.Confluence.getContextPath()+"/rest/share-page/latest/share",data:JSON.stringify(M),dataType:"text",success:function(){setTimeout(function(){L();
I.find(".progress-messages-icon").css("width","17px");
I.find(".progress-messages-icon").css("height","17px");
I.find(".progress-messages-icon").addClass("done");
I.find(".progress-messages").text("Sent");
setTimeout(function(){J()
},1000)
},500)
},error:function(Q,P){L();
I.find(".progress-messages-icon").css("width","17px");
I.find(".progress-messages-icon").css("height","17px");
I.find(".progress-messages-icon").addClass("error");
I.find(".progress-messages").text("Error while sending")
}});
return false
});
var K=I.find("#users");
var F=I.find(".button-panel input");
K.bind("selected.autocomplete-sharepage",function(M,L){var N=function(P,Q){var S=I.find(".recipients"),R,O;
R="li[data-"+P+'="'+Q.content[P]+'"]';
if(S.find(R).length>0){S.find(R).hide()
}else{S.append(AJS.template.load("share-content-popup-recipient-"+P).fill(Q.content))
}O=S.find(R);
O.find(".remove-recipient").click(function(){O.remove();
if(S.find("li").length==0){F.attr("disabled","true")
}D.refresh();
K.focus();
return false
});
O.fadeIn(200)
};
if(L.content.email){N("email",L)
}else{N("username",L)
}D.refresh();
F.removeAttr("disabled");
K.val("");
return false
});
K.bind("open.autocomplete-sharepage",function(M,L){if(E("a:not(.no-results)",AJS.dropDown.current.links).length>0){AJS.dropDown.current.moveDown()
}});
K.keypress(function(L){if(L.keyCode==13){return false
}return true
});
E(document).bind("showLayer",function(N,M,L){if(M=="inlineDialog"&&L.popup==D){L.popup.find("#users").focus()
}});
H()
};
AJS.toInit(function(F){D=AJS.InlineDialog(F("#shareContentLink"),"shareContentPopup",C,B)
})
})(AJS.$);
