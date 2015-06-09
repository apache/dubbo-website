AJS.$(document).bind(AppLinks.Event.READY,function(){(function(A){AppLinks.OAuthCallback=function(){};
AppLinks.OAuthCallback.prototype.success=function(){this.aouthWindow.close();
this.onSuccess()
};
AppLinks.OAuthCallback.prototype.failure=function(){this.aouthWindow.close();
this.onFailure()
};
AppLinks.OAuthCallback.prototype.show=function(B,D,C){this.onSuccess=D;
this.onFailure=C;
this.aouthWindow=window.open(B)
};
oauthCallback=new AppLinks.OAuthCallback();
AppLinks.authenticateRemoteCredentials=function(B,D,C){A(".applinks-error").remove();
oauthCallback.show(B,D,C)
}
})(AJS.$)
});
