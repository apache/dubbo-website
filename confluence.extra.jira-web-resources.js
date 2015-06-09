(function($){$.addFlex=function(t,p){if(t.grid){return false
}p=$.extend({height:200,width:"auto",striped:true,novstripe:false,minwidth:30,minheight:80,resizable:true,url:false,method:"POST",dataType:"xml",errormsg:"Connection Error",usepager:false,nowrap:true,page:1,total:1,useRp:true,rp:15,rpOptions:[10,15,20,25,40],title:false,pagestat:"Displaying {from} to {to} of {total} items",procmsg:"Processing, please wait ...",query:"",qtype:"",nomsg:"No items",minColToggle:1,showToggleBtn:true,hideOnSubmit:true,autoload:true,blockOpacity:0.5,onToggleCol:false,onChangeSort:false,onSuccess:false,onSubmit:false,onReload:false},p);
$(t).show().attr({cellPadding:0,cellSpacing:0,border:0}).removeAttr("width");
var g={hset:{},rePosDrag:function(){var cdleft=0-this.hDiv.scrollLeft;
if(this.hDiv.scrollLeft>0){cdleft-=Math.floor(p.cgwidth/2)
}$(g.cDrag).css({top:g.hDiv.offsetTop+1});
var cdpad=this.cdpad;
$("div",g.cDrag).hide();
$("thead tr:first th:visible",this.hDiv).each(function(){var n=$("thead tr:first th:visible",g.hDiv).index(this);
var cdpos=parseInt($("div",this).width());
var ppos=cdpos;
if(cdleft==0){cdleft-=Math.floor(p.cgwidth/2)
}cdpos=cdpos+cdleft+cdpad;
$("div:eq("+n+")",g.cDrag).css({left:cdpos+"px"}).show();
cdleft=cdpos
})
},fixHeight:function(newH){newH=false;
if(!newH){newH=$(g.bDiv).height()
}var hdHeight=$(this.hDiv).height();
$("div",this.cDrag).each(function(){$(this).height(newH+hdHeight)
});
var nd=parseInt($(g.nDiv).height());
if(nd>newH){$(g.nDiv).height(newH).width(200)
}else{$(g.nDiv).height("auto").width("auto")
}$(g.block).css({height:newH,marginBottom:(newH*-1)});
var hrH=g.bDiv.offsetTop+newH;
if(p.height!="auto"&&p.resizable){hrH=g.vDiv.offsetTop
}$(g.rDiv).css({height:hrH})
},dragStart:function(dragtype,e,obj){if(dragtype=="colresize"){$(g.nDiv).hide();
$(g.nBtn).hide();
var n=$("div",this.cDrag).index(obj);
var ow=$("th:visible div:eq("+n+")",this.hDiv).width();
$(obj).addClass("dragging").siblings().hide();
$(obj).prev().addClass("dragging").show();
this.colresize={startX:e.pageX,ol:parseInt(obj.style.left),ow:ow,n:n};
$("body").css("cursor","col-resize")
}else{if(dragtype=="vresize"){var hgo=false;
$("body").css("cursor","row-resize");
if(obj){hgo=true;
$("body").css("cursor","col-resize")
}this.vresize={h:p.height,sy:e.pageY,w:p.width,sx:e.pageX,hgo:hgo}
}else{if(dragtype=="colMove"){$(g.nDiv).hide();
$(g.nBtn).hide();
this.hset=$(this.hDiv).offset();
this.hset.right=this.hset.left+$("table",this.hDiv).width();
this.hset.bottom=this.hset.top+$("table",this.hDiv).height();
this.dcol=obj;
this.dcoln=$("th",this.hDiv).index(obj);
this.colCopy=document.createElement("div");
this.colCopy.className="colCopy";
this.colCopy.innerHTML=obj.innerHTML;
if($.browser.msie){this.colCopy.className="colCopy ie"
}$(this.colCopy).css({position:"absolute","float":"left",display:"none",textAlign:obj.align});
$("body").append(this.colCopy);
$(this.cDrag).hide()
}}}$("body").noSelect()
},dragMove:function(e){if(this.colresize){var n=this.colresize.n;
var diff=e.pageX-this.colresize.startX;
var nleft=this.colresize.ol+diff;
var nw=this.colresize.ow+diff;
if(nw>p.minwidth){$("div:eq("+n+")",this.cDrag).css("left",nleft);
this.colresize.nw=nw
}}else{if(this.vresize){var v=this.vresize;
var y=e.pageY;
var diff=y-v.sy;
if(!p.defwidth){p.defwidth=p.width
}if(p.width!="auto"&&!p.nohresize&&v.hgo){var x=e.pageX;
var xdiff=x-v.sx;
var newW=v.w+xdiff;
if(newW>p.defwidth){this.gDiv.style.width=newW+"px";
p.width=newW
}}var newH=v.h+diff;
if((newH>p.minheight||p.height<p.minheight)&&!v.hgo){this.bDiv.style.height=newH+"px";
p.height=newH;
this.fixHeight(newH)
}v=null
}else{if(this.colCopy){$(this.dcol).addClass("thMove").removeClass("thOver");
if(e.pageX>this.hset.right||e.pageX<this.hset.left||e.pageY>this.hset.bottom||e.pageY<this.hset.top){$("body").css("cursor","move")
}else{$("body").css("cursor","pointer")
}$(this.colCopy).css({top:e.pageY+10,left:e.pageX+20,display:"block"})
}}}},dragEnd:function(){if(this.colresize){var n=this.colresize.n;
var nw=this.colresize.nw;
$("th:visible div:eq("+n+")",this.hDiv).css("width",nw);
$("tr",this.bDiv).each(function(){$("td:visible div:eq("+n+")",this).css("width",nw)
});
this.hDiv.scrollLeft=this.bDiv.scrollLeft;
$("div:eq("+n+")",this.cDrag).siblings().show();
$(".dragging",this.cDrag).removeClass("dragging");
this.rePosDrag();
this.fixHeight();
this.colresize=false
}else{if(this.vresize){this.vresize=false
}else{if(this.colCopy){$(this.colCopy).remove();
if(this.dcolt!=null){if(this.dcoln>this.dcolt){$("th:eq("+this.dcolt+")",this.hDiv).before(this.dcol)
}else{$("th:eq("+this.dcolt+")",this.hDiv).after(this.dcol)
}this.switchCol(this.dcoln,this.dcolt);
$(this.cdropleft).remove();
$(this.cdropright).remove();
this.rePosDrag()
}this.dcol=null;
this.hset=null;
this.dcoln=null;
this.dcolt=null;
this.colCopy=null;
$(".thMove",this.hDiv).removeClass("thMove");
$(this.cDrag).show()
}}}$("body").css("cursor","default");
$("body").noSelect(false)
},toggleCol:function(cid,visible){var ncol=$("th[axis='col"+cid+"']",this.hDiv)[0];
var n=$("thead th",g.hDiv).index(ncol);
var cb=$("input[value="+cid+"]",g.nDiv)[0];
if(visible==null){visible=ncol.hide
}if($("input:checked",g.nDiv).length<p.minColToggle&&!visible){return false
}if(visible){ncol.hide=false;
$(ncol).show();
cb.checked=true
}else{ncol.hide=true;
$(ncol).hide();
cb.checked=false
}$("tbody tr",t).each(function(){if(visible){$("td:eq("+n+")",this).show()
}else{$("td:eq("+n+")",this).hide()
}});
this.rePosDrag();
if(p.onToggleCol){p.onToggleCol(cid,visible)
}return visible
},switchCol:function(cdrag,cdrop){$("tbody tr",t).each(function(){if(cdrag>cdrop){$("td:eq("+cdrop+")",this).before($("td:eq("+cdrag+")",this))
}else{$("td:eq("+cdrop+")",this).after($("td:eq("+cdrag+")",this))
}});
if(cdrag>cdrop){$("tr:eq("+cdrop+")",this.nDiv).before($("tr:eq("+cdrag+")",this.nDiv))
}else{$("tr:eq("+cdrop+")",this.nDiv).after($("tr:eq("+cdrag+")",this.nDiv))
}if($.browser.msie&&$.browser.version<7){$("tr:eq("+cdrop+") input",this.nDiv)[0].checked=true
}this.hDiv.scrollLeft=this.bDiv.scrollLeft
},scroll:function(){this.hDiv.scrollLeft=this.bDiv.scrollLeft;
this.rePosDrag()
},addData:function(data){if(p.preProcess){data=p.preProcess(data)
}$(".pReload",this.pDiv).removeClass("loading");
this.loading=false;
if(!data){$(".pPageStat",this.pDiv).html(p.errormsg);
return false
}if(p.dataType=="xml"){p.total=+$("rows total",data).text()
}else{p.total=data.total
}if(p.total==0){$("tr, a, td, div",t).unbind();
$(t).empty();
p.pages=1;
p.page=1;
this.buildpager();
$(".pPageStat",this.pDiv).html(p.nomsg);
return false
}p.pages=Math.ceil(p.total/p.rp);
if(p.dataType=="xml"){p.page=+$("rows page",data).text()
}else{p.page=data.page
}this.buildpager();
var tbody=document.createElement("tbody");
if(p.dataType=="json"){$.each(data.rows,function(i,row){var tr=document.createElement("tr");
if(i%2&&p.striped){tr.className="erow"
}if(row.id){tr.id="row"+row.id
}$("thead tr:first th",g.hDiv).each(function(){var td=document.createElement("td");
var idx=$(this).attr("axis").substr(3);
td.align=this.align;
td.innerHTML=row.cell[idx];
td.nowrap=this.nowrap;
$(tr).append(td);
td=null
});
if($("thead",this.gDiv).length<1){for(idx=0;
idx<cell.length;
idx++){var td=document.createElement("td");
td.innerHTML=row.cell[idx];
$(tr).append(td);
td=null
}}$(tbody).append(tr);
tr=null
})
}else{if(p.dataType=="xml"){i=1;
$("rows row",data).each(function(){i++;
var tr=document.createElement("tr");
if(i%2&&p.striped){tr.className="erow"
}var nid=$(this).attr("id");
if(nid){tr.id="row"+nid
}nid=null;
var robj=this;
$("thead tr:first th",g.hDiv).each(function(){var td=document.createElement("td");
var idx=$(this).attr("axis").substr(3);
td.align=this.align;
td.innerHTML=$("cell:eq("+idx+")",robj).text();
$(tr).append(td);
td=null
});
if($("thead",this.gDiv).length<1){$("cell",this).each(function(){var td=document.createElement("td");
td.innerHTML=$(this).text();
$(tr).append(td);
td=null
})
}$(tbody).append(tr);
tr=null;
robj=null
})
}}$("tr",t).unbind();
$(t).empty();
$(t).append(tbody);
this.addCellProp();
this.addRowProp();
this.rePosDrag();
if(p.onSuccess){p.onSuccess(data)
}if(p.hideOnSubmit){$(g.block).remove()
}this.hDiv.scrollLeft=this.bDiv.scrollLeft;
if($.browser.opera){$(t).css("visibility","visible")
}tbody=null;
data=null;
i=null
},changeSort:function(th){if(this.loading){return true
}$(g.nDiv).hide();
$(g.nBtn).hide();
if(p.sortname==$(th).attr("abbr")){if(p.sortorder=="asc"){p.sortorder="desc"
}else{p.sortorder="asc"
}}$(th).addClass("sorted").siblings().removeClass("sorted");
$(".sdesc",this.hDiv).removeClass("sdesc");
$(".sasc",this.hDiv).removeClass("sasc");
$("div",th).addClass("s"+p.sortorder);
p.sortname=$(th).attr("abbr");
if(p.onChangeSort){p.onChangeSort(p.sortname,p.sortorder)
}else{this.populate()
}},buildpager:function(){$(".pcontrol input",this.pDiv).val(p.page);
$(".pcontrol span",this.pDiv).html(p.pages);
var r1=(p.page-1)*p.rp+1;
var r2=r1+p.rp-1;
if(p.total<r2){r2=p.total
}var stat=p.pagestat;
stat=stat.replace(/{from}/,r1);
stat=stat.replace(/{to}/,r2);
stat=stat.replace(/{total}/,p.total);
$(".pPageStat",this.pDiv).html(stat);
if(p.pages==1){var groupIndex=0;
if(p.useRp){groupIndex--
}if(p.searchitems){groupIndex--
}$(".pGroup",g.pDiv).each(function(){if(groupIndex>=0&&groupIndex<3){$(this).css("opacity","0.3");
$(".pButton",this).each(function(){$(this).css("cursor","default");
$(this).hover(function(){$(this).css({border:"0px",width:"22px",height:"22px",cursor:"default"});
$("span",this).each(function(){$(this).css({border:"0px",width:"22px",height:"22px",cursor:"default"})
})
},function(){})
});
$("input",this).each(function(){$(this).attr("readonly","true")
})
}groupIndex++
})
}else{$(g.gDiv).find(".pFirst, .pPrev").each(function(){if(p.page==1){$(this).removeClass("pBtnOver");
$(this).css({cursor:"default",opacity:"0.3"})
}else{$(this).css({cursor:"pointer",opacity:"1.0"})
}});
$(g.gDiv).find(".pLast, .pNext").each(function(){if(p.page==p.pages){$(this).removeClass("pBtnOver");
$(this).css({cursor:"default",opacity:"0.3"})
}else{$(this).css({cursor:"pointer",opacity:"1.0"})
}})
}},populate:function(){if(this.loading){return true
}if(p.onSubmit){var gh=p.onSubmit();
if(!gh){return false
}}this.loading=true;
if(!p.url){return false
}$(".pPageStat",this.pDiv).html(p.procmsg);
$(".pReload",this.pDiv).addClass("loading");
$(g.block).css({top:g.bDiv.offsetTop});
if(p.hideOnSubmit){$(this.gDiv).prepend(g.block)
}if($.browser.opera){$(t).css("visibility","hidden")
}if(!p.newp){p.newp=1
}if(p.page>p.pages){p.page=p.pages
}var param=[{name:"page",value:p.newp},{name:"rp",value:p.rp},{name:"sortname",value:p.sortname},{name:"sortorder",value:p.sortorder},{name:"query",value:p.query},{name:"qtype",value:p.qtype}];
if(p.params){for(var pi=0;
pi<p.params.length;
pi++){param[param.length]=p.params[pi]
}}$.ajax({type:p.method,url:p.url,data:param,dataType:p.dataType,dataFilter:function(data){if(p.dataType=="json"&&$.isPlainObject&&!$.isPlainObject(data)){return eval("("+data+")")
}return data
},success:function(data){g.addData(data)
},error:function(xmlhttprequest,textmsg,error){try{if(p.onError){p.onError(xmlhttprequest,textmsg,error)
}}catch(e){}}})
},doSearch:function(){p.query=$("input[name=q]",g.sDiv).val();
p.qtype=$("select[name=qtype]",g.sDiv).val();
p.newp=1;
this.populate()
},changePage:function(ctype){if(this.loading){return true
}switch(ctype){case"first":p.newp=1;
break;
case"prev":if(p.page>1){p.newp=parseInt(p.page)-1
}break;
case"next":if(p.page<p.pages){p.newp=parseInt(p.page)+1
}break;
case"last":p.newp=p.pages;
break;
case"input":var nv=parseInt($(".pcontrol input",this.pDiv).val());
if(isNaN(nv)){nv=1
}if(nv<1){nv=1
}else{if(nv>p.pages){nv=p.pages
}}$(".pcontrol input",this.pDiv).val(nv);
p.newp=nv;
break
}if(p.newp==p.page){return false
}if(p.onChangePage){p.onChangePage(p.newp)
}else{this.populate()
}},addCellProp:function(){$("tbody tr td",g.bDiv).each(function(){var tdDiv=document.createElement("div");
var n=$("td",$(this).parent()).index(this);
var pth=$("th:eq("+n+")",g.hDiv).get(0);
if(pth!=null){if(p.sortname==$(pth).attr("abbr")&&p.sortname){this.className="sorted"
}$(tdDiv).css({textAlign:pth.align,width:$("div:first",pth)[0].style.width});
if(pth.hide){$(this).css("display","none")
}}if(this.nowrap==false){$(tdDiv).css("white-space","normal")
}if(this.innerHTML==""){this.innerHTML="&nbsp;"
}tdDiv.innerHTML=this.innerHTML;
var prnt=$(this).parent()[0];
var pid=false;
if(prnt.id){pid=prnt.id.substr(3)
}if(pth!=null){if(pth.process){pth.process(tdDiv,pid)
}}$(this).empty().append(tdDiv).removeAttr("width")
})
},getCellDim:function(obj){var ht=parseInt($(obj).height());
var pht=parseInt($(obj).parent().height());
var wt=parseInt(obj.style.width);
var pwt=parseInt($(obj).parent().width());
var top=obj.offsetParent.offsetTop;
var left=obj.offsetParent.offsetLeft;
var pdl=parseInt($(obj).css("paddingLeft"));
var pdt=parseInt($(obj).css("paddingTop"));
return{ht:ht,wt:wt,top:top,left:left,pdl:pdl,pdt:pdt,pht:pht,pwt:pwt}
},addRowProp:function(){$("tbody tr",g.bDiv).each(function(){$(this).click(function(e){var obj=(e.target||e.srcElement);
if(obj.href||obj.type){return true
}$(this).toggleClass("trSelected");
if(p.singleSelect){$(this).siblings().removeClass("trSelected")
}}).mousedown(function(e){if(e.shiftKey){$(this).toggleClass("trSelected");
g.multisel=true;
this.focus();
$(g.gDiv).noSelect()
}}).mouseup(function(){if(g.multisel){g.multisel=false;
$(g.gDiv).noSelect(false)
}}).hover(function(e){if(g.multisel){$(this).toggleClass("trSelected")
}},function(){});
if($.browser.msie&&$.browser.version<7){$(this).hover(function(){$(this).addClass("trOver")
},function(){$(this).removeClass("trOver")
})
}})
},pager:0};
if(p.colModel){thead=document.createElement("thead");
tr=document.createElement("tr");
for(i=0;
i<p.colModel.length;
i++){var cm=p.colModel[i];
var th=document.createElement("th");
th.innerHTML=cm.display;
if(cm.name&&cm.sortable){$(th).attr("abbr",cm.name)
}$(th).attr("axis","col"+i);
if(cm.align){th.align=cm.align
}if(cm.width){$(th).attr("width",cm.width)
}if(cm.hide){th.hide=true
}if(cm.process){th.process=cm.process
}if(cm.nowrap!=undefined){th.nowrap=cm.nowrap
}else{th.nowrap=p.nowrap
}$(tr).append(th)
}$(thead).append(tr);
$(t).prepend(thead)
}g.options=p;
g.gDiv=document.createElement("div");
g.mDiv=document.createElement("div");
g.hDiv=document.createElement("div");
g.bDiv=document.createElement("div");
g.vDiv=document.createElement("div");
g.rDiv=document.createElement("div");
g.cDrag=document.createElement("div");
g.block=document.createElement("div");
g.nDiv=document.createElement("div");
g.nBtn=document.createElement("div");
g.iDiv=document.createElement("div");
g.tDiv=document.createElement("div");
g.sDiv=document.createElement("div");
if(p.usepager){g.pDiv=document.createElement("div")
}g.hTable=document.createElement("table");
g.gDiv.className="flexigrid";
if(p.width!="auto"){g.gDiv.style.width=p.width+"px"
}if($.browser.msie){$(g.gDiv).addClass("ie")
}if(p.novstripe){$(g.gDiv).addClass("novstripe")
}$(t).before(g.gDiv);
$(g.gDiv).append(t);
if(p.buttons){g.tDiv.className="tDiv";
var tDiv2=document.createElement("div");
tDiv2.className="tDiv2";
for(i=0;
i<p.buttons.length;
i++){var btn=p.buttons[i];
if(!btn.separator){var btnDiv=document.createElement("div");
btnDiv.className="fbutton";
btnDiv.innerHTML="<div><span>"+btn.name+"</span></div>";
if(btn.bclass){$("span",btnDiv).addClass(btn.bclass).css({paddingLeft:20})
}btnDiv.onpress=btn.onpress;
btnDiv.name=btn.name;
if(btn.onpress){$(btnDiv).click(function(){this.onpress(this.name,g.gDiv)
})
}$(tDiv2).append(btnDiv);
if($.browser.msie&&$.browser.version<7){$(btnDiv).hover(function(){$(this).addClass("fbOver")
},function(){$(this).removeClass("fbOver")
})
}}else{$(tDiv2).append("<div class='btnseparator'></div>")
}}$(g.tDiv).append(tDiv2);
$(g.tDiv).append("<div style='clear:both'></div>");
$(g.gDiv).prepend(g.tDiv)
}g.hDiv.className="hDiv";
$(t).before(g.hDiv);
g.hTable.cellPadding=0;
g.hTable.cellSpacing=0;
$(g.hDiv).append('<div class="hDivBox"></div>');
$("div",g.hDiv).append(g.hTable);
var thead=$("thead:first",t).get(0);
if(thead){$(g.hTable).append(thead)
}thead=null;
if(!p.colmodel){var ci=0
}$("thead tr:first th",g.hDiv).each(function(){var thdiv=document.createElement("div");
if($(this).attr("abbr")){$(this).click(function(e){if(!$(this).hasClass("thOver")){return false
}var obj=(e.target||e.srcElement);
if(obj.href||obj.type){return true
}g.changeSort(this)
});
if($(this).attr("abbr")==p.sortname){this.className="sorted";
thdiv.className="s"+p.sortorder
}}if(this.hide){$(this).hide()
}if(!p.colmodel){$(this).attr("axis","col"+ci++)
}$(thdiv).css({textAlign:this.align,width:this.width+"px"});
thdiv.innerHTML=this.innerHTML;
$(this).empty().append(thdiv).removeAttr("width").mousedown(function(e){g.dragStart("colMove",e,this)
}).hover(function(){if(!g.colresize&&!$(this).hasClass("thMove")&&!g.colCopy){$(this).addClass("thOver")
}if($(this).attr("abbr")!=p.sortname&&!g.colCopy&&!g.colresize&&$(this).attr("abbr")){$("div",this).addClass("s"+p.sortorder)
}else{if($(this).attr("abbr")==p.sortname&&!g.colCopy&&!g.colresize&&$(this).attr("abbr")){var no="";
if(p.sortorder=="asc"){no="desc"
}else{no="asc"
}$("div",this).removeClass("s"+p.sortorder).addClass("s"+no)
}}if(g.colCopy){var n=$("th",g.hDiv).index(this);
if(n==g.dcoln){return false
}if(n<g.dcoln){$(this).append(g.cdropleft)
}else{$(this).append(g.cdropright)
}g.dcolt=n
}else{if(!g.colresize){var nv=$("th:visible",g.hDiv).index(this);
var onl=parseInt($("div:eq("+nv+")",g.cDrag).css("left"));
var nw=parseInt($(g.nBtn).width())+parseInt($(g.nBtn).css("borderLeftWidth"));
nl=onl-nw+Math.floor(p.cgwidth/2);
$(g.nDiv).hide();
$(g.nBtn).hide();
$(g.nBtn).css({left:nl,top:g.hDiv.offsetTop}).show();
var ndw=parseInt($(g.nDiv).width());
$(g.nDiv).css({top:g.bDiv.offsetTop});
if((nl+ndw)>$(g.gDiv).width()){$(g.nDiv).css("left",onl-ndw+1)
}else{$(g.nDiv).css("left",nl)
}if($(this).hasClass("sorted")){$(g.nBtn).addClass("srtd")
}else{$(g.nBtn).removeClass("srtd")
}}}},function(){$(this).removeClass("thOver");
if($(this).attr("abbr")!=p.sortname){$("div",this).removeClass("s"+p.sortorder)
}else{if($(this).attr("abbr")==p.sortname){var no="";
if(p.sortorder=="asc"){no="desc"
}else{no="asc"
}$("div",this).addClass("s"+p.sortorder).removeClass("s"+no)
}}if(g.colCopy){$(g.cdropleft).remove();
$(g.cdropright).remove();
g.dcolt=null
}})
});
g.bDiv.className="bDiv";
$(t).before(g.bDiv);
$(g.bDiv).css({height:(p.height=="auto")?"auto":p.height+"px"}).scroll(function(e){g.scroll()
}).append(t);
if(p.height=="auto"){$("table",g.bDiv).addClass("autoht")
}g.addCellProp();
g.addRowProp();
var cdcol=$("thead tr:first th:first",g.hDiv).get(0);
if(cdcol!=null){g.cDrag.className="cDrag";
g.cdpad=0;
g.cdpad+=(isNaN(parseInt($("div",cdcol).css("borderLeftWidth")))?0:parseInt($("div",cdcol).css("borderLeftWidth")));
g.cdpad+=(isNaN(parseInt($("div",cdcol).css("borderRightWidth")))?0:parseInt($("div",cdcol).css("borderRightWidth")));
g.cdpad+=(isNaN(parseInt($("div",cdcol).css("paddingLeft")))?0:parseInt($("div",cdcol).css("paddingLeft")));
g.cdpad+=(isNaN(parseInt($("div",cdcol).css("paddingRight")))?0:parseInt($("div",cdcol).css("paddingRight")));
g.cdpad+=(isNaN(parseInt($(cdcol).css("borderLeftWidth")))?0:parseInt($(cdcol).css("borderLeftWidth")));
g.cdpad+=(isNaN(parseInt($(cdcol).css("borderRightWidth")))?0:parseInt($(cdcol).css("borderRightWidth")));
g.cdpad+=(isNaN(parseInt($(cdcol).css("paddingLeft")))?0:parseInt($(cdcol).css("paddingLeft")));
g.cdpad+=(isNaN(parseInt($(cdcol).css("paddingRight")))?0:parseInt($(cdcol).css("paddingRight")));
$(g.bDiv).before(g.cDrag);
var cdheight=$(g.bDiv).height();
var hdheight=$(g.hDiv).height();
$(g.cDrag).css({top:-hdheight+"px"});
$("thead tr:first th",g.hDiv).each(function(){var cgDiv=document.createElement("div");
$(g.cDrag).append(cgDiv);
if(!p.cgwidth){p.cgwidth=$(cgDiv).width()
}$(cgDiv).css({height:cdheight+hdheight}).mousedown(function(e){g.dragStart("colresize",e,this)
});
if($.browser.msie&&$.browser.version<7){g.fixHeight($(g.gDiv).height());
$(cgDiv).hover(function(){g.fixHeight();
$(this).addClass("dragging")
},function(){if(!g.colresize){$(this).removeClass("dragging")
}})
}})
}if(p.striped){$("tbody tr:odd",g.bDiv).addClass("erow")
}if(p.resizable&&p.height!="auto"){g.vDiv.className="vGrip";
$(g.vDiv).mousedown(function(e){g.dragStart("vresize",e)
}).html("<span></span>");
$(g.bDiv).after(g.vDiv)
}if(p.resizable&&p.width!="auto"&&!p.nohresize){g.rDiv.className="hGrip";
$(g.rDiv).mousedown(function(e){g.dragStart("vresize",e,true)
}).html("<span></span>").css("height",$(g.gDiv).height());
if($.browser.msie&&$.browser.version<7){$(g.rDiv).hover(function(){$(this).addClass("hgOver")
},function(){$(this).removeClass("hgOver")
})
}$(g.gDiv).append(g.rDiv)
}if(p.usepager){g.pDiv.className="pDiv";
g.pDiv.innerHTML='<div class="pDiv2"></div>';
$(g.bDiv).after(g.pDiv);
var html=' <div class="pGroup"> <div class="pFirst pButton"><span></span></div><div class="pPrev pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">Page <input type="text" size="4" value="1" /> of <span> 1 </span></span></div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pNext pButton"><span></span></div><div class="pLast pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pReload pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pPageStat"></span></div>';
$("div",g.pDiv).html(html);
$(".pReload",g.pDiv).click(function(){if(p.onReload){var gh=p.onReload();
if(!gh){return false
}}g.populate()
});
$(".pFirst",g.pDiv).click(function(){g.changePage("first")
});
$(".pPrev",g.pDiv).click(function(){g.changePage("prev")
});
$(".pNext",g.pDiv).click(function(){g.changePage("next")
});
$(".pLast",g.pDiv).click(function(){g.changePage("last")
});
$(".pcontrol input",g.pDiv).keydown(function(e){if(e.keyCode==13){g.changePage("input")
}});
$(".pReload",g.pDiv).hover(function(){$(this).addClass("pBtnOver")
},function(){$(this).removeClass("pBtnOver")
});
$(".pFirst, .pPrev").hover(function(){if(!(p.page&&p.page==1)){$(this).addClass("pBtnOver")
}},function(){$(this).removeClass("pBtnOver")
});
$(".pLast, .pNext").hover(function(){if(!(p.page&&p.pages&&p.page==p.pages)){$(this).addClass("pBtnOver")
}},function(){$(this).removeClass("pBtnOver")
});
if(p.useRp){var opt="";
for(var nx=0;
nx<p.rpOptions.length;
nx++){if(p.rp==p.rpOptions[nx]){sel='selected="selected"'
}else{sel=""
}opt+="<option value='"+p.rpOptions[nx]+"' "+sel+" >"+p.rpOptions[nx]+"&nbsp;&nbsp;</option>"
}$(".pDiv2",g.pDiv).prepend("<div class='pGroup'><select name='rp'>"+opt+"</select></div> <div class='btnseparator'></div>");
$("select",g.pDiv).change(function(){if(p.onRpChange){p.onRpChange(+this.value)
}else{p.newp=1;
p.rp=+this.value;
g.populate()
}})
}if(p.searchitems){$(".pDiv2",g.pDiv).prepend("<div class='pGroup'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");
$(".pSearch",g.pDiv).click(function(){$(g.sDiv).slideToggle("fast",function(){$(".sDiv:visible input:first",g.gDiv).trigger("focus")
})
});
g.sDiv.className="sDiv";
sitems=p.searchitems;
var sopt="";
for(var s=0;
s<sitems.length;
s++){if(p.qtype==""&&sitems[s].isdefault==true){p.qtype=sitems[s].name;
sel='selected="selected"'
}else{sel=""
}sopt+="<option value='"+sitems[s].name+"' "+sel+" >"+sitems[s].display+"&nbsp;&nbsp;</option>"
}if(p.qtype==""){p.qtype=sitems[0].name
}$(g.sDiv).append("<div class='sDiv2'>Quick Search <input type='text' size='30' name='q' class='qsbox' /> <select name='qtype'>"+sopt+"</select> <input type='button' value='Clear' /></div>");
$("input[name=q],select[name=qtype]",g.sDiv).keydown(function(e){if(e.keyCode==13){g.doSearch()
}});
$("input[value=Clear]",g.sDiv).click(function(){$("input[name=q]",g.sDiv).val("");
p.query="";
g.doSearch()
});
$(g.bDiv).after(g.sDiv)
}}$(g.pDiv,g.sDiv).append("<div style='clear:both'></div>");
if(p.title){g.mDiv.className="mDiv";
g.mDiv.innerHTML='<div class="ftitle">'+p.title+"</div>";
$(g.gDiv).prepend(g.mDiv);
if(p.showTableToggleBtn){$(g.mDiv).append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
$("div.ptogtitle",g.mDiv).click(function(){$(g.gDiv).toggleClass("hideBody");
$(this).toggleClass("vsble")
})
}}g.cdropleft=document.createElement("span");
g.cdropleft.className="cdropleft";
g.cdropright=document.createElement("span");
g.cdropright.className="cdropright";
g.block.className="gBlock";
var gh=$(g.bDiv).height();
var gtop=g.bDiv.offsetTop;
$(g.block).css({width:g.bDiv.style.width,height:gh,background:"white",position:"relative",marginBottom:(gh*-1),zIndex:1,top:gtop,left:"0px"});
$(g.block).fadeTo(0,p.blockOpacity);
if($("th",g.hDiv).length){g.nDiv.className="nDiv";
g.nDiv.innerHTML="<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
$(g.nDiv).css({marginBottom:(gh*-1),display:"none",top:gtop}).noSelect();
var cn=0;
$("th div",g.hDiv).each(function(){var kcol=$("th[axis='col"+cn+"']",g.hDiv)[0];
var chk='checked="checked"';
if(kcol.style.display=="none"){chk=""
}$("tbody",g.nDiv).append('<tr><td class="ndcol1"><input type="checkbox" '+chk+' class="togCol" value="'+cn+'" /></td><td class="ndcol2">'+this.innerHTML+"</td></tr>");
cn++
});
if($.browser.msie&&$.browser.version<7){$("tr",g.nDiv).hover(function(){$(this).addClass("ndcolover")
},function(){$(this).removeClass("ndcolover")
})
}$("td.ndcol2",g.nDiv).click(function(){if($("input:checked",g.nDiv).length<=p.minColToggle&&$(this).prev().find("input")[0].checked){return false
}return g.toggleCol($(this).prev().find("input").val())
});
$("input.togCol",g.nDiv).click(function(){if($("input:checked",g.nDiv).length<p.minColToggle&&this.checked==false){return false
}$(this).parent().next().trigger("click")
});
$(g.gDiv).prepend(g.nDiv);
$(g.nBtn).addClass("nBtn").html("<div></div>").attr("title","Hide/Show Columns").click(function(){$(g.nDiv).toggle();
return true
});
if(p.showToggleBtn){$(g.gDiv).prepend(g.nBtn)
}}$(g.iDiv).addClass("iDiv").css({display:"none"});
$(g.bDiv).append(g.iDiv);
$(g.bDiv).hover(function(){$(g.nDiv).hide();
$(g.nBtn).hide()
},function(){if(g.multisel){g.multisel=false
}});
$(g.gDiv).hover(function(){},function(){$(g.nDiv).hide();
$(g.nBtn).hide()
});
$(document).mousemove(function(e){g.dragMove(e)
}).mouseup(function(e){g.dragEnd()
}).hover(function(){},function(){g.dragEnd()
});
if($.browser.msie&&$.browser.version<7){$(".hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv",g.gDiv).css({width:"100%"});
$(g.gDiv).addClass("ie6");
if(p.width!="auto"){$(g.gDiv).addClass("ie6fullwidthbug")
}}g.rePosDrag();
g.fixHeight();
t.p=p;
t.grid=g;
if(p.url&&p.autoload){g.populate()
}return t
};
var docloaded=false;
$(document).ready(function(){docloaded=true
});
$.fn.flexigrid=function(p){return this.each(function(){if(!docloaded){$(this).hide();
var t=this;
$(document).ready(function(){$.addFlex(t,p)
})
}else{$.addFlex(this,p)
}})
};
$.fn.flexReload=function(p){return this.each(function(){if(this.grid&&this.p.url){this.grid.populate()
}})
};
$.fn.flexOptions=function(p){return this.each(function(){if(this.grid){$.extend(this.p,p)
}})
};
$.fn.flexToggleCol=function(cid,visible){return this.each(function(){if(this.grid){this.grid.toggleCol(cid,visible)
}})
};
$.fn.flexAddData=function(data){return this.each(function(){if(this.grid){this.grid.addData(data)
}})
};
$.fn.noSelect=function(p){if(p==null){prevent=true
}else{prevent=p
}if(prevent){return this.each(function(){if($.browser.msie||$.browser.safari){$(this).bind("selectstart",function(){return false
})
}else{if($.browser.mozilla){$(this).css("MozUserSelect","none");
$("body").trigger("focus")
}else{if($.browser.opera){$(this).bind("mousedown",function(){return false
})
}else{$(this).attr("unselectable","on")
}}}})
}else{return this.each(function(){if($.browser.msie||$.browser.safari){$(this).unbind("selectstart")
}else{if($.browser.mozilla){$(this).css("MozUserSelect","inherit")
}else{if($.browser.opera){$(this).unbind("mousedown")
}else{$(this).removeAttr("unselectable","on")
}}}})
}}
})(jQuery);
jQuery(document).ready(function(){var A=jQuery.extend(window.JiraIssues||{},{fixMenusShowingUnderWidgetInIE:function(){if(jQuery.browser.msie){jQuery("ul.ajs-menu-bar li.ajs-menu-item").each(function(){jQuery(this).hover(function(){jQuery("div.ajs-drop-down",jQuery(this)).parents().each(function(){var C=jQuery(this);
var B=C.css("position");
if(B&&B!="auto"){C.addClass("ajs-menu-bar-z-index-fix-for-ie")
}})
},function(){jQuery("div.ajs-drop-down",jQuery(this)).parents().removeClass("ajs-menu-bar-z-index-fix-for-ie")
})
})
}},onSuccessFunction:function(D){if(!jQuery("fieldset input[name='height']",D).length){var B=jQuery(".bDiv table[id^='jiraissues_table']",D)[0];
var E=B.grid;
var C=B.clientHeight+jQuery(".hDiv",D)[0].clientHeight;
jQuery(".bDiv",D).css("height",C+"px");
E.options.height=C;
E.fixHeight(C)
}},onErrorFunction:function(H,C,B,N,F){var O=jQuery("#"+C);
var G=B+": ";
if(N.status=="200"){G+=F
}else{G+=N.responseText
}var I=N.getResponseHeader("WWW-Authenticate")||"";
if(N.status=="401"&&I.indexOf("OAuth")!=-1){var M=/OAuth realm\=\"([^\"]+)\"/;
var E=M.exec(I);
if(E){O.empty();
A.bigMessageFunction(C,'<a class="oauth-init" href="'+E[1]+'">'+"Login & Approve"+"</a> "+"to retrieve data from JIRA"+"</span>");
jQuery(".bmDiv",H).css({"z-index":2});
var J={onSuccess:function(){window.location.reload()
},onFailure:function(){}};
var L=jQuery(".oauth-init",O.parent());
var D=L.attr("href");
L.click(function(P){AppLinks.authenticateRemoteCredentials(D,J.onSuccess,J.onFailure);
P.preventDefault()
});
AJS.$(".gBlock").remove()
}}else{if(N.status=="400"){A.bigMessageFunction(C,"The JIRA server was not able to process the search. This may indicate a problem with the syntax of this macro. Alternatively, if this table is requesting specific issue keys, you may not have permission to view one of these issues. ")
}else{var K=jQuery("iframe.jiraissues_errorMsgSandbox",H);
K.load(function(){var R=this.contentWindow||this.contentDocument;
var Q=jQuery((R.document?R.document:R).body);
jQuery("a",Q).each(function(){this.target="_top"
});
jQuery(".pPageStat",H).empty().text(Q.text());
var P=jQuery("div.bmDiv",H)[0];
K.removeClass("hidden");
K.css({height:P.clientHeight+"px",width:P.clientWidth+"px"})
});
K[0].src=jQuery("fieldset input[name='retrieverUrlHtml']",H).val();
A.bigMessageFunction(C,K)
}}jQuery(H).find(".pReload").removeClass("loading");
O[0].grid.loading=false;
jQuery(H).find(".pButton").each(function(){jQuery(this).removeClass("pBtnOver");
jQuery(this).css({cursor:"default",opacity:"0.3"})
});
jQuery(H).find("span.pcontrol input").attr("readonly","true")
},onReloadFunction:function(B,D,C){jQuery(".bmDiv",D).remove();
jQuery(".bmDistance",D).remove();
C.onSubmit=function(){A.reloadOnSubmitFunction(B,C);
return true
}
},reloadOnSubmitFunction:function(B,C){C.params=[{name:"useCache",value:false}];
C.onSubmit=function(){A.onSubmitFunction(B,C);
return true
}
},onSubmitFunction:function(B,C){C.params=[{name:"useCache",value:B}]
},showTrustWarningsFunction:function(D,C){var B=jQuery(D).children(".trusted_warnings");
if(C.trustedMessage){B.find("td:last").html(C.trustedMessage);
B.css("display","block")
}else{B.css("display","none")
}},preProcessFunction:function(E,B,D,C,F){if(D){A.showTrustWarningsFunction(E,C)
}if(C.total==0){jQuery(".pPageStat",E).html(F);
A.bigMessageFunction(B,F);
jQuery(".pReload",E).removeClass("loading")
}},bigMessageFunction:function(E,F){var D=jQuery("<div></div>");
var B=jQuery("<div></div>");
D.addClass("bmDistance");
B.addClass("bmDiv");
if(typeof F=="string"){B.html("<p><strong>"+F+"</strong></p>")
}else{F.appendTo(B)
}var C=jQuery("#"+E);
C.after(B).after(D)
},getParamsFrom:function(C){var B={};
C.children("input").each(function(){B[jQuery(this).attr("name")]=jQuery(this).attr("value")
});
return B
},initializeColumnWidth:function(F,N){var D={};
if(!(N&&N.length)){return D
}var H=37,L=11,J=F.width()-(H+(N.length*L)),I=false,O=false,M=0,C=140;
for(var K=0,E=N.length;
K<E;
K++){var G=N[K].name;
switch(G){case"summary":I=true;
M++;
break;
case"description":O=true;
M++;
break;
case"type":M++;
D[G]=30;
J-=30;
break;
case"priority":M++;
D[G]=50;
J-=50;
break;
case"status":M++;
D[G]=100;
J-=100;
break;
case"key":M++;
D[G]=90;
J-=90;
break;
case"comments":case"attachments":case"version":case"component":case"resolution":M++;
D[G]=80;
J-=80;
break;
default:D[G]=C
}}if(I||O){J-=(C*(N.length-M));
var B=250;
if(I&&O){D.summary=Math.max(J/2,B);
D.description=Math.max(J/2,B)
}else{if(I){D.summary=Math.max(J,B)
}else{D.description=Math.max(J,B)
}}}else{if(!I&&!O&&(N.length>M)){C=J/(N.length-M);
for(K=0;
K<E;
K++){if(!{resolution:true,key:true,type:true,priority:true,status:true}[N[K]]){D[N[K]]=C
}}}}return D
}});
A.fixMenusShowingUnderWidgetInIE();
jQuery(".jiraissues_table").each(function(F,I){var J=jQuery(I),H=J.children("fieldset"),E=A.getParamsFrom(H),C="jiraissues_table_"+F;
J.append('<table id="'+C+'" style="display:none"></table>');
J.css("width",E.width);
var D=[];
H.children(".columns").each(function(K){var L=jQuery(this).hasClass("nowrap");
D[K]={display:this.name,name:this.value,nowrap:L,sortable:true,align:"left"}
});
var B=A.initializeColumnWidth(J,D);
jQuery.each(D,function(K,L){L.width=B[L.name]
});
var G=jQuery("<div></div>");
jQuery("<a></a>").attr({rel:"nofollow",href:E.clickableUrl}).text(E.title).appendTo(G);
jQuery("#"+C).flexigrid({url:E.retrieverUrlHtml,method:"GET",dataType:"json",colModel:D,sortname:E.sortField,sortorder:E.sortOrder,usepager:true,title:G.html(),page:parseInt(E.requestedPage,10),useRp:false,rp:parseInt(E.resultsPerPage,10),showTableToggleBtn:true,height:(function(){return E.height?parseInt(E.height,10):480
})(),onSuccess:function(){A.onSuccessFunction(I)
},onSubmit:function(){A.onSubmitFunction(E.useCache,this);
return true
},preProcess:function(K){A.preProcessFunction(I,C,E.showTrustWarnings,K,E.nomsg);
return K
},onError:function(M,L,K){A.onErrorFunction(I,C,E.jiraissuesError,M,L,K)
},onReload:function(){A.onReloadFunction(E.useCache,I,this);
return true
},errormsg:E.errormsg,pagestat:E.pagestat,procmsg:E.procmsg,nomsg:E.nomsg})
});
jQuery(".jiraissues_count").each(function(B,D){var C=jQuery(D);
jQuery.ajax({cache:false,type:"GET",url:C.find(".url").text(),data:{useCache:C.find(".use-cache").text(),rp:C.find(".rp").text(),showCount:"true"},success:function(F){var E=C.find(".result");
E.text(AJS.format(E.text(),F)).removeClass("hidden");
jQuery(".calculating, .error, .data",C).remove()
},error:function(F){var E=jQuery(".error",C);
E.text(AJS.format(E.text(),F.status));
jQuery(".calculating, .result, .data",C).remove()
}})
})
});
