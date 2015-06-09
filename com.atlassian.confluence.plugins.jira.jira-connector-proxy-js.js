AppLinks=AJS.$.extend(window.AppLinks||{},{makeRequest:function(A){var B=contextPath||AJS.params.contextPath;
if(A.processData){if(A.appId){A.data=AJS.$.extend(A.data||{},{appId:A.appId})
}else{if(A.appType){A.data=AJS.$.extend(A.data||{},{appType:A.appType})
}}A.data=AJS.$.extend(A.data||{},{path:A.url})
}else{var C=A.url;
A=AJS.$.extend(A,{beforeSend:function(D){if(A.appId){D.setRequestHeader("X-AppId",A.appId)
}else{if(A.appType){D.setRequestHeader("X-AppType",A.appType)
}}D.setRequestHeader("X-AppPath",C)
}})
}A=AJS.$.extend(A,{url:B+"/plugins/servlet/applinks/proxy"});
return AJS.$.ajax(A)
},createProxyGetUrl:function(B){var C="";
if(B.includeContext){C=contextPath||AJS.params.contextPath
}var A=C+"/plugins/servlet/applinks/proxy";
if(B.appId){A+="?appId="+encodeURIComponent(B.appId)
}else{if(B.appType){A+="?appType="+encodeURIComponent(B.appType)
}else{AJS.log("You need to specify an appType or appId");
return""
}}if(B.path){A+="&path="+encodeURIComponent(B.path)
}return A
}});
