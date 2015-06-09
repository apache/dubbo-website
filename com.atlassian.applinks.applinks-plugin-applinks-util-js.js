if(jQuery!=undefined&&AJS!=undefined){jQuery=AJS.$
};
AppLinks=AJS.$.extend(window.AppLinks||{},{Event:{NAMESPACE:"applinks",PREREADY:this.NAMESPACE+".preready",READY:this.NAMESPACE+".ready"}});
AJS.toInit(function(){AppLinks=AJS.$.extend(window.AppLinks||{},{failure:function(E){var C=AppLinks.parseError(E);
var D=AJS.$(".page-error");
if(D.length>0){D.html(C).fadeIn("slow")
}else{alert("REST request failed: "+C)
}},jsonRequest:function(D,E,F,G,C){if(F){F=JSON.stringify(F)
}AJS.$(".page-error").fadeOut("fast");
if(!C){C=AppLinks.failure
}jQuery.ajax({url:D,type:E,data:F,dataType:"json",contentType:"application/json; charset=utf-8",cache:false,success:G,error:C})
},parseError:function(E){var C;
try{C=JSON.parse(E.responseText)
}catch(D){if(E.statusText){return C=E.statusText
}else{return E
}}if(C.message){if(AJS.$.isArray(C.message)){return C.message.join(" ")
}return C.message
}else{return E.statusText
}},put:function(D,E,F,C){AppLinks.jsonRequest(D,"PUT",E,F,C)
},post:function(D,E,F,C){AppLinks.jsonRequest(D,"POST",E,F,C)
},update:function(D,E,C){AppLinks.put(AppLinks.self_link(D),D,E,C)
},get:function(D,E,C){AppLinks.jsonRequest(D,"GET",null,E,C)
},self_link:function(E){for(var C=0,F=E.link.length;
C<F;
C++){var D=E.link[C];
if(D.rel=="self"){return D.href
}}throw"No self-link found"
},del:function(F,E,D){var C;
if(typeof (F)=="string"){C=F
}else{C=AppLinks.self_link(F)
}AppLinks.jsonRequest(C,"DELETE",null,E,D)
},SPI:{BASE_URL:AJS.params.contextPath+"/rest/applinks/1.0",getAllLinks:function(E,D){var C=AppLinks.SPI.BASE_URL+"/applicationlink";
AppLinks.get(C,E,D)
},getAllLinksWithAuthInfo:function(E,D){var C=AppLinks.SPI.BASE_URL+"/listApplicationlinks";
AppLinks.get(C,E,D)
},getLinksOfType:function(E,F,D){var C=AppLinks.SPI.BASE_URL+"/applicationlink/type/"+E;
AppLinks.get(C,F,D)
},tryToFetchManifest:function(E,F,D){var C=AppLinks.SPI.BASE_URL+"/applicationlinkForm/url/"+E+".json";
AppLinks.get(C,F,D)
},getManifestFor:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/manifest/"+F+".json";
AppLinks.get(C,E,D)
},createLink:function(J,H,L,D,I,K,F,M,E){var C=AppLinks.SPI.BASE_URL+"/applicationlinkForm/createAppLink";
var G={applicationLink:J,username:H,password:L,createTwoWayLink:D,customRpcURL:I,rpcUrl:K,configFormValues:F};
AppLinks.post(C,G,M,E)
},createLinkWithOrphanedTrust:function(J,H,M,D,I,K,F,L,N,E){var C=AppLinks.SPI.BASE_URL+"/applicationlinkForm/createAppLink";
var G={applicationLink:J,username:H,password:M,createTwoWayLink:D,customRpcURL:I,rpcUrl:K,configFormValues:F,orphanedTrust:L};
AppLinks.post(C,G,N,E)
},verifyTwoWayLinkDetails:function(C,H,I,F,G,E){var D=AppLinks.SPI.BASE_URL+"/applicationlinkForm/details/?username="+encodeURIComponent(I)+"&password="+encodeURIComponent(F)+"&remoteUrl="+encodeURIComponent(C)+"&rpcUrl="+encodeURIComponent(H);
AppLinks.get(D,G,E)
},getApplicationLinkInfo:function(E,F,D){var C=AppLinks.SPI.BASE_URL+"/applicationlinkInfo/id/"+E;
AppLinks.get(C,F,D)
},deleteLink:function(G,C,F,E){var D=AppLinks.SPI.BASE_URL+"/applicationlink/"+G.id;
if(C){D+="?reciprocate=true"
}AppLinks.del(D,F,E)
},makePrimary:function(E,D){var C=AppLinks.SPI.BASE_URL+"/applicationlink/primary/"+E.id;
AppLinks.post(C,null,D)
},relocate:function(H,F,C,G,E){var D=AppLinks.SPI.BASE_URL+"/relocateApplicationlink/"+H.id+"?newUrl="+encodeURIComponent(F)+"&nowarning="+(C?"true":"false");
AppLinks.post(D,null,G,E)
},legacyUpgrade:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/upgrade/legacy/"+F.id;
AppLinks.post(C,null,E,D)
},ualUpgrade:function(G,C,F,E){var D=AppLinks.SPI.BASE_URL+"/upgrade/ual/"+G.id;
AppLinks.post(D,C,F,E)
},getEntityTypesForApplicationType:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/type/entity/"+F;
AppLinks.get(C,E,D)
},getLocalEntitiesWithLinksToApplication:function(C,F,E){var D=AppLinks.SPI.BASE_URL+"/entitylink/localEntitiesWithLinksTo/"+C+".json";
AppLinks.get(D,F,E)
},getEntityLinksForApplication:function(C,F,E){var D=AppLinks.SPI.BASE_URL+"/entities/"+C+".json";
AppLinks.get(D,F,E)
},getEntityLinksForApplicationUsingAnonymousAccess:function(C,F,E){var D=AppLinks.SPI.BASE_URL+"/entities/anonymous/"+C+".json";
AppLinks.get(D,F,E)
},createNonUalEntityLink:function(L,G,D,F,J,E,K,I){var C=AppLinks.SPI.BASE_URL+"/entitylink/"+L+"/"+G+"?reciprocate=false";
var H={applicationId:D,typeId:F,key:J,name:E,isPrimary:false};
AppLinks.put(C,H,K,I)
},createEntityLink:function(H,G,D,C,I,F){var E=AppLinks.SPI.BASE_URL+"/entitylink/"+H+"/"+G+"?reciprocate=";
E+=(C?"true":"false");
AppLinks.put(E,D,I,F)
},getConfiguredEntityLinks:function(F,E,G,D){var C=AppLinks.SPI.BASE_URL+"/entitylink/primaryLinks/"+F+"/"+E+".json";
AppLinks.get(C,G,D)
},deleteEntityLink:function(H,G,D,C,I,F){var E=AppLinks.SPI.BASE_URL+"/entitylink/"+H+"/"+G+"?typeId="+D.typeId+"&key="+D.key+"&applicationId="+D.applicationId+"&reciprocate="+C;
AppLinks.del(E,I,F)
},makePrimaryEntityLink:function(G,F,C,H,E){var D=AppLinks.SPI.BASE_URL+"/entitylink/primary/"+G+"/"+F+"?typeId="+C.typeId+"&key="+C.key+"&applicationId="+C.applicationId;
AppLinks.post(D,null,H,E)
},canDeleteAppLink:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/permission/reciprocate-application-delete/"+F;
AppLinks.get(C,E,D)
},canDeleteEntityLink:function(G,F,C,H,E){var D=AppLinks.SPI.BASE_URL+"/permission/reciprocate-entity-delete/"+C.applicationId+"/"+G+"/"+F+"/"+C.typeId+"/"+C.key;
AppLinks.get(D,H,E)
},canCreateReciprocateEntityLink:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/permission/reciprocate-entity-create/"+F;
AppLinks.get(C,E,D)
},processPermissionCode:function(D){var C={noPermission:function(){},missing:function(){},credentialsRequired:function(E){},authenticationFailed:function(E){},noAuthentication:function(E){},noAuthenticationConfigured:function(){},noConnection:function(){},allowed:function(){},unrecognisedCode:function(E){},updateView:function(G,F,E){}};
if(!D){D={}
}D=AJS.$.extend(C,D);
return function(F){var E=F.code;
if(E=="NO_PERMISSION"){D.noPermission()
}else{if(E=="MISSING"){D.missing()
}else{if(E=="CREDENTIALS_REQUIRED"){D.credentialsRequired(F.url)
}else{if(E=="AUTHENTICATION_FAILED"){D.authenticationFailed(F.url)
}else{if(E=="NO_AUTHENTICATION"){D.noAuthentication(F.url)
}else{if(E=="NO_AUTHENTICATION_CONFIGURED"){D.noAuthenticationConfigured()
}else{if(E=="NO_CONNECTION"){D.noConnection()
}else{if(E=="ALLOWED"){D.allowed()
}else{D.unrecognisedCode(F.code)
}}}}}}}}}
},addAuthenticationTrigger:function(E,C,D){if(!D){D={}
}if(typeof D.onSuccess=="undefined"){D.onSuccess=function(){location.reload()
}
}if(typeof D.onFailure=="undefined"){D.onFailure=function(){return true
}
}AJS.$(E).unbind("click");
AJS.$(E).click(function(){if(D.before){D.before()
}AppLinks.authenticateRemoteCredentials(C,D.onSuccess,D.onFailure)
})
},deleteOrphanedTrust:function(G,E,F,D){var C=AppLinks.SPI.BASE_URL+"/orphaned-trust/"+E+"/"+G;
AppLinks.del(C,F,D)
},getOrphanedTrust:function(E,D){var C=AppLinks.SPI.BASE_URL+"/orphaned-trust/";
AppLinks.get(C,E,D)
}}});
var B="applinks";
var A=function(F,E){if(E){if(!AJS.$.isArray(E)){E=[new String(E)]
}for(var C=0;
C<E.length;
C++){var D=new RegExp("\\{"+C+"\\}","g");
F=F.replace(D,E[C])
}}return F
};
AppLinks.UI={showInfoBox:function(C){AJS.$(".aui-message.success").remove();
AppLinks.UI.createMessage("success",C,"page-info")
},hideInfoBox:function(){AJS.$(".aui-message.success").remove()
},showErrorBox:function(C){AppLinks.UI.createMessage("error",C,"page-error")
},hideErrorBox:function(){AJS.$(".aui-message.error").remove()
},showWarningBox:function(D){if(AJS.$.isArray(D)&&D.length>0){var C=AJS.$("<ul></ul>");
AJS.$(D).each(function(F){C.append(AJS.$("<li/>",{text:D[F]}))
});
var E=AJS.$('<div class="page-warning"></div>').append(C);
AppLinks.UI.createMessage("warning",E.html(),"page-warning")
}else{AppLinks.UI.createMessage("warning",D,"page-warning")
}},hideWarningBox:function(){AJS.$(".aui-message.warning").remove()
},shortenString:function(D,C){if(D.length>C){D=D.substring(0,C)+"..."
}return D
},createMessage:function(D,E,C){var F=AJS.$('<div class="'+C+'">');
F.html(E);
AJS.messages[D](".applinks-message-bar",{title:"",body:F.wrap("<div></div>").parent().html(),closeable:true,shadowed:true})
},displayValidationError:function(C,D,E){return function(K){AJS.$(".applinks-error").remove();
AJS.$(".loading").remove();
var H=K.responseText;
var J=AJS.$.parseJSON(H);
var G=J.message;
if(typeof J.fields=="undefined"){if(AJS.$.isArray(G)){AJS.$(G).each(function(M,L){var N=AJS.$('<div class="error applinks-error">');
N.text(L);
AJS.$(D).find("."+C).append(N)
})
}else{var I=AJS.$('<div class="error applinks-error">');
I.text(G.toString());
AJS.$(D).find("."+C).append(I)
}}else{var F=J.fields;
AJS.$(F).each(function(L){var M=AJS.$('<div class="error applinks-error" id="'+F[L]+'-error">');
M.text(G[L]);
if(AJS.$(D).find("."+F[L]).length>0){M.insertAfter(AJS.$(D).find("."+F[L]))
}else{M.insertAfter(AJS.$(D).find("."+C).append(M))
}})
}if(E){E()
}}
},addProtocolToURL:function(C){var F=AJS.$.trim(C);
var E=F.toLowerCase();
var D=false;
if(E.length>=7){if(E.substring(0,7).indexOf("http")!=-1){D=true
}}if(!D){F="http://"+F
}return F
},prettyJoin:function(D,G,F){if(!F){F=AppLinks.I18n.getText("http://10.20.160.198/wiki/s/en/2166/34/3.3/_/download/batch/com.atlassian.applinks.applinks-plugin:applinks-util-js/applinks.and")
}var C=D.length;
var E="";
AJS.$.each(D,function(H,I){if(H==(C-1)&&C>1){E+=" "+F+"  "+G(I)
}else{E+=G(I);
if(H+2<C){E+=", "
}}});
return E
},showLoadingIcon:function(C){AJS.$('<span class="loading">&nbsp;</span>').insertAfter(C)
},hideLoadingIcon:function(C){AJS.$(C).next(".loading").remove()
},findUrl:function(F){var E=undefined;
var G=F.toLowerCase();
var D=G.indexOf("http:");
if(D==-1){D=G.indexOf("https:")
}if(D>-1){var C=G.indexOf(" ",D);
if(C==-1){C=G.length
}E=F.substring(D,C)
}return E
},findApplicationType:function(C){C=C.toLowerCase();
if(C.indexOf("jira")!=-1){return"jira"
}else{if(C.indexOf("fisheye")!=-1){return"fecru"
}else{if(C.indexOf("confluence")!=-1){return"confluence"
}else{if(C.indexOf("refapp")!=-1){return"refapp"
}else{return undefined
}}}}},escapeSelector:function(C){return C.replace(/([#;&,\.\+\*\~':"\!\^$\[\]\(\)=>\|])/g,"\\$1")
},sanitiseHTML:function(C){var D={"<":"&lt;",'"':"&quot;","&":"&amp;"};
return C.replace(/[<"&]/g,function(E){return D[E]
})
},refreshOrphanedTrust:function(){var C=function(D){AJS.$("tr.orphaned-trust-row").each(function(){var I=AJS.$(this);
var J=I.attr("data-id");
var G=I.attr("data-type");
var F=false;
for(var E=0;
E<D.orphanedTrust.length;
E++){var H=D.orphanedTrust[E];
if(J==H.id&&G==H.type){F=true;
break
}}if(!F){I.remove();
if(D.orphanedTrust.length==0){AJS.$(".orphaned-trust-warning").hide()
}}})
};
AppLinks.SPI.getOrphanedTrust(C)
},removeCssClass:function(C,D){AJS.$(C).removeClass(function(F,H){var G=H.split(" ");
var E="";
AJS.$.each(G,function(I,J){if(J.indexOf(D)!=-1){E=J
}});
return E
})
}};
AppLinks.I18n={getTextWithPrefix:function(C,D){return A(appLinksI18n.entries[B+"."+C],D)
},getText:function(C,D){return A(AppLinks.I18n.resolveValue(C),D)
},getApplicationTypeName:function(C){return appLinksI18n.entries["applinks.application.type."+C]
},getEntityTypeName:function(C){return appLinksI18n.entries["applinks.entity.type."+C]
},getPluralizedEntityTypeName:function(C){return appLinksI18n.entries["applinks.entity.type.plural."+C]
},getAuthenticationTypeName:function(C){return appLinksI18n.entries["applinks.auth.provider."+C]
},resolveValue:function(C){var D=appLinksI18n.entries[C];
return typeof D=="undefined"?C:D
}};
AppLinks.Docs={createDocLink:function(D,E,C){if(!C){C=""
}else{C=" "+C
}return AJS.$("<a/>",{"class":"ual-help-link"+C,href:AppLinks.Docs.getDocHref(D,E),target:"_blank",text:AppLinks.I18n.getText("http://10.20.160.198/wiki/s/en/2166/34/3.3/_/download/batch/com.atlassian.applinks.applinks-plugin:applinks-util-js/applinks.help"),title:AppLinks.I18n.getText("http://10.20.160.198/wiki/s/en/2166/34/3.3/_/download/batch/com.atlassian.applinks.applinks-plugin:applinks-util-js/applinks.help")})
},getDocHref:function(D,E){var C=AppLinks.Docs.resolveValue("http://10.20.160.198/wiki/s/en/2166/34/3.3/_/download/batch/com.atlassian.applinks.applinks-plugin:applinks-util-js/applinks.docs.root")+"/"+AppLinks.Docs.resolveValue(D);
if(E){C+="#"+AppLinks.Docs.resolveValue(E)
}return C
},resolveValue:function(C){var D=applinksDocs.entries[C];
return typeof D=="undefined"?C:D
}};
AJS.$(document).trigger(AppLinks.Event.PREREADY);
AJS.$(document).trigger(AppLinks.Event.READY)
});
if(!this.JSON){this.JSON={}
}(function(){function f(n){return n<10?"0"+n:n
}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null
};
String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()
}
}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;
function quote(string){escapable.lastIndex=0;
return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];
return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)
})+'"':'"'+string+'"'
}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];
if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)
}if(typeof rep==="function"){value=rep.call(holder,key,value)
}switch(typeof value){case"string":return quote(value);
case"number":return isFinite(value)?String(value):"null";
case"boolean":case"null":return String(value);
case"object":if(!value){return"null"
}gap+=indent;
partial=[];
if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;
for(i=0;
i<length;
i+=1){partial[i]=str(i,value)||"null"
}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";
gap=mind;
return v
}if(rep&&typeof rep==="object"){length=rep.length;
for(i=0;
i<length;
i+=1){k=rep[i];
if(typeof k==="string"){v=str(k,value);
if(v){partial.push(quote(k)+(gap?": ":":")+v)
}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);
if(v){partial.push(quote(k)+(gap?": ":":")+v)
}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";
gap=mind;
return v
}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;
gap="";
indent="";
if(typeof space==="number"){for(i=0;
i<space;
i+=1){indent+=" "
}}else{if(typeof space==="string"){indent=space
}}rep=replacer;
if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")
}return str("",{"":value})
}
}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;
function walk(holder,key){var k,v,value=holder[key];
if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);
if(v!==undefined){value[k]=v
}else{delete value[k]
}}}}return reviver.call(holder,key,value)
}text=String(text);
cx.lastIndex=0;
if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)
})
}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");
return typeof reviver==="function"?walk({"":j},""):j
}throw new SyntaxError("JSON.parse")
}
}}());
AJS.$(document).bind(AppLinks.Event.READY,function(){AppLinks.autoComplete={cacheManager:function(C){var A={},B=[],C=C||30;
return{get:function(D){return A[D]
},put:function(D,E){A[D]=E;
B.push(D);
if(B.length>C){delete A[B.shift()]
}},clear:function(){A={};
B=[]
}}
}};
(function(D){var C=function(F){AJS.log("InputDrivenDropDown: truncating text");
var H=F.$.closest(".aui-dd-parent").width(),G=20;
D("a span:not(.icon)",F.$).each(function(){var J=D(this),I=AJS("var","&#8230;"),L=I.width(),K=false;
J.wrapInner(D("<em>"));
D("em",J).each(function(){var M=D(this);
M.show();
if(this.offsetLeft+this.offsetWidth+L>H-G){var T=this.childNodes,S=false;
for(var O=T.length-1;
O>=0;
O--){var P=T[O],N=1,R=(P.nodeType==3)?"nodeValue":"innerHTML",Q=P[R];
do{if(N<=Q.length){P[R]=Q.substr(0,Q.length-N++)
}else{break
}}while(this.offsetLeft+this.offsetWidth+L>H-G);
if(N<=Q.length){S=true;
break
}}if(S){K=true
}else{M.hide()
}}});
if(K){J.append(I);
this.elpss=I
}})
};
var B=function(F,K){if(!K.length||!K[0]){return 
}AJS.log("InputDrivenDropDown: highlighting tokens");
for(var H=0,I=K.length;
H<I;
H++){var G=K[H];
K[H]=G?G.replace(/[\.\*\+\?\|\(\)\[\]{}\\]/g,"\\$"):""
}var J=new RegExp("("+K.join("|")+")","gi");
D("li a:not(.dropdown-prevent-highlight) span",F.$).each(function(){var M=D(this),L=M.html().replace(J,"<strong>$1</strong>");
M.html(L)
})
};
var E=function(J,G){var I=J.options,H=J.dd;
if(H){H.hide();
H.$.remove()
}I.ajsDropDownOptions=I.ajsDropDownOptions||{};
if(I.ajsDropDownOptions&&!I.ajsDropDownOptions.alignment){I.ajsDropDownOptions.alignment="left"
}I.ajsDropDownOptions.selectionHandler=I.ajsDropDownOptions.selectionHandler||function(L,K){if(L.type!="click"){L.preventDefault();
D("a",K).click();
document.location=D("a",K).attr("href")
}};
var F=J.dd=new AJS.dropDown(G.matrix,I.ajsDropDownOptions)[0];
if(I.ajsDropDownOptions&&I.ajsDropDownOptions.className){F.$.addClass(I.ajsDropDownOptions.className)
}if(I.dropdownPlacement){I.dropdownPlacement(F.$)
}else{AJS.log("No dropdownPlacement function specified. Appending dropdown to the body.");
D("body").append(F.$)
}B(F,G.queryTokens||[G.query]);
C(F);
if(I.dropdownPostprocess){I.dropdownPostprocess(F.$)
}F.show(J._effect);
if(typeof I.onShow=="function"){I.onShow.call(F,F.$)
}return F
};
function A(G,F){this._effect="appear";
this._timer=null;
this.id=G;
this.options=F;
this.inactive=false;
this.busy=false;
this.cacheManager=AppLinks.autoComplete.cacheManager()
}A.prototype.clearCache=function(){this.cacheManager.clear()
};
A.prototype.change=function(H,G){var F=this;
if(H!=F._value||G){F._value=H;
F.busy=false;
clearTimeout(F._timer);
if(G||(/\S{0,}/).test(H)){var I=F.cacheManager.get(H);
if(I){E(F,I)
}else{F.busy=true;
F._timer=setTimeout(function(){F.options.getDataAndRunCallback.call(F,H,F.show)
},200)
}}else{F.dd&&F.dd.hide()
}}};
A.prototype.dropDownLength=function(){return this.dd.links?this.dd.links.length:0
};
A.prototype.dropDownItem=function(F){return this.dropDownLength()>F?this.dd.links[F]:null
};
A.prototype.hide=function(){this.dd&&this.dd.hide()
};
A.prototype.remove=function(){var F=this.dd;
if(F){this.hide();
F.$.remove()
}this.inactive=true;
this.options.onDeath&&this.options.onDeath()
};
A.prototype.show=function(G,I,H){if(this.inactive){AJS.log("Quick search abandoned before server response received, ignoring. "+this);
return 
}var F={matrix:G,query:I,queryTokens:H};
this.cacheManager.put(I,F);
E(this,F);
this.busy=false
};
AppLinks.inputDrivenDropdown=function(F){return new A("inputdriven-dropdown",F)
}
})(jQuery)
});
AJS.$(document).bind(AppLinks.Event.PREREADY,function(){(function(D){D.fn.wizard=function(V){var U={width:500,height:350,onshow:function(W,X){return true
},aftershow:function(){return true
},oncancel:function(){return true
},onsubmit:function(){return true
},aftersubmit:function(){return true
},onnext:function(){return true
},onprevious:function(){return true
},cancelLabel:AppLinks.I18n.getText("applinks.cancel"),submitLabel:AppLinks.I18n.getText("applinks.create"),nextLabel:AppLinks.I18n.getText("http://10.20.160.198/wiki/s/en/2166/34/3.3/_/download/batch/com.atlassian.applinks.applinks-plugin:applinks-util-js/applinks.next"),previousLabel:AppLinks.I18n.getText("applinks.previous"),id:""};
if(!V){V={}
}V=D.extend(U,V);
var T=this;
this.each(function(){var d=D(this);
var W=new AJS.Dialog(V.width,V.height,V.id);
var l=Q(W,V.onshow,V.aftershow);
var k=C(W,V.oncancel);
var Z=H(W,V.onsubmit,V.aftersubmit);
var m=A(W,V.onprevious);
var i=M(W,V.onnext);
var g=K(W);
var b=O(W);
var c=G(W);
var h=L(W);
var j=S(W);
var e=N(W);
if(V.showButtonId){D("#"+V.showButtonId).click(l)
}var Y=F(d);
for(var a=0;
a<Y.length;
a++){var f=Y[a];
J(W,f);
if(f.className){W.addHeader(f.title,f.className+"-header")
}else{W.addHeader(f.title)
}if(a!=0&&D(f.div).attr("previous")!="false"){W.addButton(V.previousLabel,m,"applinks-previous-button")
}if(a<Y.length-1&&D(f.div).attr("submit")!="true"&&D(f.div).attr("next")!="false"){W.addButton(V.nextLabel,i,"applinks-next-button")
}if(D(f.div).attr("submit")=="true"){W.addButton(V.submitLabel,Z,"wizard-submit")
}if(!W.getPage(a).buttonpanel){W.addButton("",null);
D(W.getPage(a).buttonpanel).empty();
var X=D('<a class="button-panel-button applinks-cancel-link">'+V.cancelLabel+"</a>");
W.getPage(a).buttonpanel.append(X);
X.click(k)
}else{var X=D('<a class="applinks-cancel-link">'+V.cancelLabel+"</a>");
D(W.getPage(a).buttonpanel).append(X);
X.click(k)
}if(a<Y.length-1){W.addPage()
}}T={dialog:W,nextPage:i,prevPage:m,submit:Z,cancel:k,show:l,disableNextBtn:g,enableNextBtn:b,disableSubmitBtn:c,enableSubmitBtn:h,disablePreviousBtn:j,enablePreviousBtn:e};
W.gotoPage(0);
W.gotoPanel(0)
});
return T
};
function S(T){return function(){B(R(T,"applinks-previous-button"))
}
}function N(T){return function(){I(R(T,"applinks-previous-button"))
}
}function K(T){return function(){B(R(T,"applinks-next-button"))
}
}function O(T){return function(){I(R(T,"applinks-next-button"))
}
}function G(T){return function(V){var U=R(T,"wizard-submit");
B(U);
if(typeof (V)=="undefined"||V){D('<span class="loading">&nbsp;</span>').insertBefore(U)
}else{U.parent().find(".loading").remove()
}}
}function L(T){return function(){var U=R(T,"wizard-submit");
I(U);
U.parent().find(".loading").remove()
}
}function R(U,T){return D(U.getPage(U.curpage).buttonpanel).find("."+T)
}function P(T){D(T.popup.element).find("form").each(function(){this.reset()
})
}function I(T){T.attr("disabled","")
}function B(T){T.attr("disabled","true")
}function Q(T,U,V){return function(W){if(U(T,W)!==false){T.gotoPage(0);
T.gotoPanel(0);
D(document).unbind("keydown.ual.dialog");
D(document).bind("keydown.ual.dialog",E(T));
T.show();
V()
}}
}function C(T,U){return function(){if(U(T)!==false){T.hide();
P(T)
}}
}function A(T,U){return function(){if(U(T)!==false){T.prevPage()
}}
}function M(T,U){return function(){if(U(T)!==false){T.nextPage()
}}
}function E(T){return function(U){if(U.keyCode===27){P(T);
D(document).unbind("keydown.ual.dialog")
}}
}function H(U,V,T){return function(){if(V(U)!==false){T(U);
P(U)
}}
}function J(V,W){var U=D("> div[panel]",W.div);
if(U.length>0){U.each(function(Y){var X=V.addPanel(U[Y].title,null,U[Y].className);
X.getCurrentPanel().body.append(U[Y])
})
}else{var T=V.addPanel(W.title);
T.getCurrentPanel().body.append(W.div)
}}function F(V){var U=D(" > div",V);
var T=[];
U.each(function(X){var W=D(this);
T[X]={title:W.attr("title"),className:W.attr("class"),div:W}
});
return T
}})(jQuery)
});
(function(A){AppLinks.Wizard={initAuthenticationUI:function(D){var H=A(D);
var F=H.find(".create-reciprocal-link");
var C=H.find(".ual-arrow");
var L=H.find(".two-way-link-details");
var J=H.find(".reciprocal-link-description");
var B=H.find(".no-reciprocal-link-description");
F.click(function(){if(F.attr("checked")){C.removeClass("no-background");
L.show();
J.show();
B.hide()
}else{C.addClass("no-background");
L.hide();
J.hide();
B.show()
}});
var I=H.find(".same-user-radio-btn");
var K=H.find(".different-user-radio-btn");
var E=H.find(".different-userbase-image");
var G=H.find(".same-userbase-image");
I.click(function(){E.addClass("different-userbase-image-grey");
G.removeClass("same-userbase-image-grey")
});
K.click(function(){G.addClass("same-userbase-image-grey");
E.removeClass("different-userbase-image-grey")
})
},initNonUALUI:function(E){var C=A(E);
var B=C.find(".application-types");
for(var D=0;
D<nonAppLinksApplicationTypes.length;
D++){A('<option value="'+nonAppLinksApplicationTypes[D].typeId+'">'+nonAppLinksApplicationTypes[D].label+"</option>").appendTo(B)
}},fetchManifest:function(D,G,C,B){var H=G.find("#application-url");
if(H.val()==""){A('<div class="error applinks-error">'+AppLinks.I18n.getText("applinks.error.url.field.empty")+"</div>").insertAfter(H);
return false
}var F=AppLinks.UI.addProtocolToURL(H.val());
AppLinks.UI.showLoadingIcon(H);
var E=function(J){var I=J;
D.enableNextBtn();
G.find(".loading").remove();
G.find(".reciprocal-rpc-url").val(A("#baseUrl").val());
if(typeof J.typeId!="undefined"){AppLinks.Wizard.handleUALManifest(I,G);
D.dialog.gotoPage(2);
G.find(".reciprocal-link-username").focus();
if(C){C(I)
}}else{AppLinks.Wizard.handleNonUALManifest(I,F,G);
D.dialog.gotoPage(1);
G.find(".application-name").focus();
if(B){B(I)
}}};
D.disableNextBtn();
AppLinks.SPI.tryToFetchManifest(F,E,AppLinks.UI.displayValidationError("manifest-validation-errors",G,function(){D.enableNextBtn()
}));
return F
},handleUALManifest:function(D,C){var B=A(C);
B.find(".remote-app-image").removeClass(function(F,H){var G=H.split(" ");
var E="";
A.each(G,function(I,J){if(J.indexOf("application-type-image-")!=-1){E=J
}});
return E
});
B.find(".remote-app-image").addClass("application-type-image-"+D.typeId);
B.find(".link-to-app-type").html(AppLinks.I18n.getText("http://10.20.160.198/wiki/s/en/2166/34/3.3/_/download/batch/com.atlassian.applinks.applinks-plugin:applinks-util-js/applinks.create.title.link.to",AppLinks.I18n.getApplicationTypeName(D.typeId)));
B.find(".remote-app-name").html(AppLinks.UI.shortenString(D.name,20));
B.find(".create-reciprocal-link").attr("checked","true");
B.find(".reciprocal-link-description").html(AppLinks.I18n.getText("http://10.20.160.198/wiki/s/en/2166/34/3.3/_/download/batch/com.atlassian.applinks.applinks-plugin:applinks-util-js/applinks.create.two.way.link",[D.name,'<a target="_blank" href="'+AppLinks.Docs.getDocHref("applinks.docs.adding.application.link","ual")+'">',"</a>"]));
B.find(".no-reciprocal-link-description").hide();
B.find(".no-reciprocal-link-description").html(AppLinks.I18n.getText("http://10.20.160.198/wiki/s/en/2166/34/3.3/_/download/batch/com.atlassian.applinks.applinks-plugin:applinks-util-js/applinks.create.two.way.no.link",D.name));
B.find(".reciprocal-link-username").val("");
B.find(".reciprocal-link-password").val("");
B.find(".ual-arrow").removeClass("no-background");
B.find(".two-way-link-details").show();
B.find(".reciprocal-link-description").show();
B.find(".no-reciprocal-link-description").hide()
},handleNonUALManifest:function(D,E,C){var B=A(C);
B.find(".application-name").val("");
B.find(".application-types option:first-child").attr("selected","selected");
B.find(".non-ual-application-url").text(E);
if(D.warning){B.find(".create-non-ual-warning").show();
B.find(".create-non-ual-warning").html(D.warning)
}else{B.find(".create-non-ual-warning").hide()
}},checkReciprocalLinkForm:function(C,D,G,J,F){var H=A(C);
if(H.find(".create-reciprocal-link").attr("checked")){var K=A.trim(H.find(".reciprocal-rpc-url").val());
if(K==""){A("<div class='error applinks-error'>"+AppLinks.I18n.getText("applinks.error.url.field.empty")+"</div>").insertAfter(H.find(".reciprocal-rpc-url"));
if(F){F()
}return 
}var E=H.find(".reciprocal-link-username");
var B=H.find(".reciprocal-link-password");
if(E.val()==""){A('<div class="error applinks-error">'+AppLinks.I18n.getText("applinks.error.username.empty")+"</div>").insertAfter(E);
if(F){F()
}return false
}var I=function(L){H.find(".same-user-description").find("input").attr("checked","true");
H.find(".trust-radio-btn").attr("checked","true");
H.find(".same-user-radio-btn").click();
G(L)
};
K=AppLinks.UI.addProtocolToURL(K);
AppLinks.SPI.verifyTwoWayLinkDetails(J,K,E.val(),B.val(),I,AppLinks.UI.displayValidationError("two-way-link-errors",C,F));
return false
}else{D();
return false
}}}
})(AJS.$);
