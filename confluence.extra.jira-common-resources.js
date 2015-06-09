AJS.JiraIssues={Remote:{}};
var appLinksI18n={entries:{}};
jQuery(document).ready(function(){AJS.JiraIssues=jQuery.extend(AJS.JiraIssues||{},{bindOAuthLink:function(C,F){var E={onSuccess:function(){F()
},onFailure:function(){}};
var D=C.attr("href");
C.click(function(G){AppLinks.authenticateRemoteCredentials(D,E.onSuccess,E.onFailure);
G.preventDefault()
})
},getOAuthRealm:function(F){var D=F.getResponseHeader("WWW-Authenticate")||"";
var C=/OAuth realm\=\"([^\"]+)\"/;
var E=C.exec(D);
if(E){return E[1]
}else{return null
}}});
jQuery("a.static-oauth-init").each(function(){AJS.JiraIssues.bindOAuthLink(jQuery(this),function(){window.location.reload()
})
});
var A=function(I){var E=AJS.JiraIssues.Remote[I];
var H="";
for(var G=0;
G<E.length;
G++){H=H+(E[G].key+(G<E.length-1?",":""))
}var D=function(L){var J="issuekey in ("+L+")";
var M="/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery="+encodeURIComponent(J);
var K=contextPath+"/plugins/servlet/issue-retriever?appId="+I+"&url="+encodeURIComponent(M)+"&columns=summary&columns=type&columns=resolution&columns=status";
return K
};
var F=function(K){var J=AJS.$("item",K);
J.each(function(){var U=AJS.$("link",this).text();
var V=AJS.$("key",this).text();
var R=AJS.$("summary",this).text();
var S=AJS.$("type",this);
var M=AJS.$("resolution",this);
var W=M.attr("id")!="-1";
var O=AJS.$("status",this);
var N=AJS.$(".unknown-jira-issue."+V);
for(var P=0;
P<N.length;
P++){var T=AJS.$("<a style=\"background-image: url('"+S.attr("iconUrl")+'\')" href="'+U+'"></a>');
T.text(V);
var L=AJS.$('<span class="jira-status"></span>');
L.text(O.text().toUpperCase());
var Q=AJS.$('<span class="jira-issue'+(W?" resolved":"")+'" ></span>');
Q.append(T);
Q.append(document.createTextNode(" - "+R+" - "));
Q.append(L);
AJS.$(N[P]).replaceWith(Q)
}})
};
var C=D(H);
AJS.$.ajax({url:C,success:F,error:function(K){if(K.status==401){var J=AJS.JiraIssues.getOAuthRealm(K);
if(J){AJS.$(E).each(function(){var L=AJS.$('<span class="oauth-msg"> - <a class="oauth-init" href="'+J+'">'+"Login & Approve"+"</a> "+"to see more on this issue"+"</span>");
AJS.$(".unknown-jira-issue."+this.key).addClass("single-issue-oauth").append(L);
AJS.JiraIssues.bindOAuthLink(AJS.$("a.oauth-init",L),function(){window.location.reload()
})
})
}}else{if(K.status==400&&E.length>1){AJS.$(E).each(function(){var L=this.key;
var M=D(L);
AJS.$.ajax({url:M,success:F,error:function(O){var N=AJS.$(".unknown-jira-issue."+L);
N.removeClass("single-issue-oauth");
AJS.$(".oauth-msg",N).remove();
N.addClass("jira-error")
}})
})
}}}})
};
for(var B in AJS.JiraIssues.Remote){A(B)
}});
