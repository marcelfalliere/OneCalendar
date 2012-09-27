jQuery.webshims.register("dom-extend",function(d,i,v,p,q){var j=i.modules,g=/\s*,\s*/,n={},t={},l={},h={},u={},o=d.fn.val,r=function(b,a,c,f,e){return e?o.call(d(b)):o.call(d(b),c)};d.fn.val=function(b){var a=this[0];arguments.length&&null==b&&(b="");if(!arguments.length)return!a||1!==a.nodeType?o.call(this):d.prop(a,"value",b,"val",!0);if(d.isArray(b))return o.apply(this,arguments);var c=d.isFunction(b);return this.each(function(f){a=this;1===a.nodeType&&(c?(f=b.call(a,f,d.prop(a,"value",q,"val",
!0)),null==f&&(f=""),d.prop(a,"value",f,"val")):d.prop(a,"value",b,"val"))})};var m="_webshimsLib"+Math.round(1E3*Math.random()),x=function(b,a,c){b=b.jquery?b[0]:b;if(!b)return c||{};var f=d.data(b,m);c!==q&&(f||(f=d.data(b,m,{})),a&&(f[a]=c));return a?f&&f[a]:f};[{name:"getNativeElement",prop:"nativeElement"},{name:"getShadowElement",prop:"shadowElement"},{name:"getShadowFocusElement",prop:"shadowFocusElement"}].forEach(function(b){d.fn[b.name]=function(){return this.map(function(){var a=x(this,
"shadowData");return a&&a[b.prop]||this})}});["removeAttr","prop","attr"].forEach(function(b){n[b]=d[b];d[b]=function(a,c,f,e,k){var y="val"==e,C=!y?n[b]:r;if(!a||!t[c]||1!==a.nodeType||!y&&e&&"attr"==b&&d.attrFn[c])return C(a,c,f,e,k);var z=(a.nodeName||"").toLowerCase(),j=l[z],h="attr"==b&&(!1===f||null===f)?"removeAttr":b,g,i,o;j||(j=l["*"]);j&&(j=j[c]);j&&(g=j[h]);if(g){if("value"==c)i=g.isVal,g.isVal=y;if("removeAttr"===h)return g.value.call(a);if(f===q)return g.get?g.get.call(a):g.value;g.set&&
("attr"==b&&!0===f&&(f=c),o=g.set.call(a,f));if("value"==c)g.isVal=i}else o=C(a,c,f,e,k);if((f!==q||"removeAttr"===h)&&u[z]&&u[z][c]){var m;m="removeAttr"==h?!1:"prop"==h?!!f:!0;u[z][c].forEach(function(e){if(!e.only||(e.only="prop"==b)||"attr"==e.only&&"prop"!=b)e.call(a,f,m,y?"val":h,b)})}return o};h[b]=function(a,c,f){l[a]||(l[a]={});l[a][c]||(l[a][c]={});var e=l[a][c][b],k=function(e,a,k){return a&&a[e]?a[e]:k&&k[e]?k[e]:"prop"==b&&"value"==c?function(e){return f.isVal?r(this,c,e,!1,0===arguments.length):
n[b](this,c,e)}:"prop"==b&&"value"==e&&f.value.apply?function(e){var a=n[b](this,c);a&&a.apply&&(a=a.apply(this,arguments));return a}:function(e){return n[b](this,c,e)}};l[a][c][b]=f;if(f.value===q){if(!f.set)f.set=f.writeable?k("set",f,e):i.cfg.useStrict&&"prop"==c?function(){throw c+" is readonly on "+a;}:d.noop;if(!f.get)f.get=k("get",f,e)}["value","get","set"].forEach(function(a){f[a]&&(f["_sup"+a]=k(a,e))})}});var A=!d.browser.msie||8<parseInt(d.browser.version,10),B=function(){var b=i.getPrototypeOf(p.createElement("foobar")),
a=Object.prototype.hasOwnProperty;return function(c,f,e){var k=p.createElement(c),d=i.getPrototypeOf(k);if(A&&d&&b!==d&&(!k[f]||!a.call(k,f))){var j=k[f];e._supvalue=function(){return j&&j.apply?j.apply(this,arguments):j};d[f]=e.value}else e._supvalue=function(){var e=x(this,"propValue");return e&&e[f]&&e[f].apply?e[f].apply(this,arguments):e&&e[f]},s.extendValue(c,f,e.value);e.value._supvalue=e._supvalue}}(),s=function(){var b={};i.addReady(function(e,a){var c={},f=function(b){c[b]||(c[b]=d(e.getElementsByTagName(b)),
a[0]&&d.nodeName(a[0],b)&&(c[b]=c[b].add(a)))};d.each(b,function(e,a){f(e);!a||!a.forEach?i.warn("Error: with "+e+"-property. methods: "+a):a.forEach(function(a){c[e].each(a)})});c=null});var a,c=d([]),f=function(e,c){b[e]?b[e].push(c):b[e]=[c];d.isDOMReady&&(a||d(p.getElementsByTagName(e))).each(c)};return{createTmpCache:function(e){d.isDOMReady&&(a=a||d(p.getElementsByTagName(e)));return a||c},flushTmpCache:function(){a=null},content:function(e,a){f(e,function(){var e=d.attr(this,a);null!=e&&d.attr(this,
a,e)})},createElement:function(e,a){f(e,a)},extendValue:function(e,a,b){f(e,function(){d(this).each(function(){x(this,"propValue",{})[a]=this[a];this[a]=b})})}}}(),w=function(b,a){if(b.defaultValue===q)b.defaultValue="";if(!b.removeAttr)b.removeAttr={value:function(){b[a||"prop"].set.call(this,b.defaultValue);b.removeAttr._supvalue.call(this)}};if(!b.attr)b.attr={}};d.extend(i,{getID:function(){var b=(new Date).getTime();return function(a){var a=d(a),c=a.attr("id");c||(b++,c="ID-"+b,a.attr("id",c));
return c}}(),extendUNDEFProp:function(b,a){d.each(a,function(a,f){a in b||(b[a]=f)})},createPropDefault:w,data:x,moveToFirstEvent:function(){var b=d._data?"_data":"data";return function(a,c,f){if((a=(d[b](a,"events")||{})[c])&&1<a.length)c=a.pop(),f||(f="bind"),"bind"==f&&a.delegateCount?a.splice(a.delegateCount,0,c):a.unshift(c)}}(),addShadowDom:function(b,a,c){c=c||{};b.jquery&&(b=b[0]);a.jquery&&(a=a[0]);var f=d.data(b,m)||d.data(b,m,{}),e=d.data(a,m)||d.data(a,m,{}),k={};if(c.shadowFocusElement){if(c.shadowFocusElement){if(c.shadowFocusElement.jquery)c.shadowFocusElement=
c.shadowFocusElement[0];k=d.data(c.shadowFocusElement,m)||d.data(c.shadowFocusElement,m,k)}}else c.shadowFocusElement=a;f.hasShadow=a;k.nativeElement=e.nativeElement=b;k.shadowData=e.shadowData=f.shadowData={nativeElement:b,shadowElement:a,shadowFocusElement:c.shadowFocusElement};c.shadowChilds&&c.shadowChilds.each(function(){x(this,"shadowData",e.shadowData)});if(c.data)k.shadowData.data=e.shadowData.data=f.shadowData.data=c.data;c=null},propTypes:{standard:function(b){w(b);if(!b.prop)b.prop={set:function(a){b.attr.set.call(this,
""+a)},get:function(){return b.attr.get.call(this)||b.defaultValue}}},"boolean":function(b){w(b);if(!b.prop)b.prop={set:function(a){a?b.attr.set.call(this,""):b.removeAttr.value.call(this)},get:function(){return null!=b.attr.get.call(this)}}},src:function(){var b=p.createElement("a");b.style.display="none";return function(a,c){w(a);if(!a.prop)a.prop={set:function(b){a.attr.set.call(this,b)},get:function(){var a=this.getAttribute(c),e;if(null==a)return"";b.setAttribute("href",a+"");if(!d.support.hrefNormalized){try{d(b).insertAfterTo(this),
e=b.getAttribute("href",4)}catch(k){e=b.getAttribute("href",4)}d(b).detach()}return e||b.href}}}}(),enumarated:function(b){w(b);if(!b.prop)b.prop={set:function(a){b.attr.set.call(this,a)},get:function(){var a=(b.attr.get.call(this)||"").toLowerCase();if(!a||-1==b.limitedTo.indexOf(a))a=b.defaultValue;return a}}}},reflectProperties:function(b,a){"string"==typeof a&&(a=a.split(g));a.forEach(function(a){i.defineNodeNamesProperty(b,a,{prop:{set:function(b){d.attr(this,a,b)},get:function(){return d.attr(this,
a)||""}}})})},defineNodeNameProperty:function(b,a,c){t[a]=!0;if(c.reflect)i.propTypes[c.propType||"standard"](c,a);["prop","attr","removeAttr"].forEach(function(f){var e=c[f];e&&(e="prop"===f?d.extend({writeable:!0},e):d.extend({},e,{writeable:!0}),h[f](b,a,e),"*"!=b&&i.cfg.extendNative&&"prop"==f&&e.value&&d.isFunction(e.value)&&B(b,a,e),c[f]=e)});c.initAttr&&s.content(b,a);return c},defineNodeNameProperties:function(b,a,c,d){for(var e in a)!d&&a[e].initAttr&&s.createTmpCache(b),c&&(a[e][c]?i.log("override: "+
b+"["+e+"] for "+c):(a[e][c]={},["value","set","get"].forEach(function(b){b in a[e]&&(a[e][c][b]=a[e][b],delete a[e][b])}))),a[e]=i.defineNodeNameProperty(b,e,a[e]);d||s.flushTmpCache();return a},createElement:function(b,a,c){var f;d.isFunction(a)&&(a={after:a});s.createTmpCache(b);a.before&&s.createElement(b,a.before);c&&(f=i.defineNodeNameProperties(b,c,!1,!0));a.after&&s.createElement(b,a.after);s.flushTmpCache();return f},onNodeNamesPropertyModify:function(b,a,c,f){"string"==typeof b&&(b=b.split(g));
d.isFunction(c)&&(c={set:c});b.forEach(function(e){u[e]||(u[e]={});"string"==typeof a&&(a=a.split(g));c.initAttr&&s.createTmpCache(e);a.forEach(function(a){u[e][a]||(u[e][a]=[],t[a]=!0);if(c.set){if(f)c.set.only=f;u[e][a].push(c.set)}c.initAttr&&s.content(e,a)});s.flushTmpCache()})},defineNodeNamesBooleanProperty:function(b,a,c){c||(c={});if(d.isFunction(c))c.set=c;i.defineNodeNamesProperty(b,a,{attr:{set:function(b){this.setAttribute(a,b);c.set&&c.set.call(this,!0)},get:function(){return null==this.getAttribute(a)?
q:a}},removeAttr:{value:function(){this.removeAttribute(a);c.set&&c.set.call(this,!1)}},reflect:!0,propType:"boolean",initAttr:c.initAttr||!1})},contentAttr:function(b,a,c){if(b.nodeName){if(c===q)return c=(b.attributes[a]||{}).value,null==c?q:c;"boolean"==typeof c?c?b.setAttribute(a,a):b.removeAttribute(a):b.setAttribute(a,c)}},activeLang:function(){var b=[],a={},c,f,e=/:\/\/|^\.*\//,k=function(a,b,c){return b&&c&&-1!==d.inArray(b,c.availabeLangs||[])?(a.loading=!0,c=c.langSrc,e.test(c)||(c=i.cfg.basePath+
c),i.loader.loadScript(c+b+".js",function(){a.langObj[b]?(a.loading=!1,g(a,!0)):d(function(){a.langObj[b]&&g(a,!0);a.loading=!1})}),!0):!1},h=function(e){a[e]&&a[e].forEach(function(a){a.callback()})},g=function(a,e){if(a.activeLang!=c&&a.activeLang!==f){var b=j[a.module].options;if(a.langObj[c]||f&&a.langObj[f])a.activeLang=c,a.callback(a.langObj[c]||a.langObj[f],c),h(a.module);else if(!e&&!k(a,c,b)&&!k(a,f,b)&&a.langObj[""]&&""!==a.activeLang)a.activeLang="",a.callback(a.langObj[""],c),h(a.module)}};
return function(e){if("string"==typeof e&&e!==c)c=e,f=c.split("-")[0],c==f&&(f=!1),d.each(b,function(a,e){g(e)});else if("object"==typeof e)if(e.register)a[e.register]||(a[e.register]=[]),a[e.register].push(e),e.callback();else{if(!e.activeLang)e.activeLang="";b.push(e);g(e)}return c}}()});d.each({defineNodeNamesProperty:"defineNodeNameProperty",defineNodeNamesProperties:"defineNodeNameProperties",createElements:"createElement"},function(b,a){i[b]=function(b,d,e,k){"string"==typeof b&&(b=b.split(g));
var j={};b.forEach(function(b){j[b]=i[a](b,d,e,k)});return j}});i.isReady("webshimLocalization",!0)});
(function(d,i){var v=d.webshims.browserVersion;if(!(d.browser.mozilla&&5<v)&&(!d.browser.msie||12>v&&7<v)){var p={article:"article",aside:"complementary",section:"region",nav:"navigation",address:"contentinfo"},q=function(d,g){d.getAttribute("role")||d.setAttribute("role",g)};d.webshims.addReady(function(j,g){d.each(p,function(h,i){for(var l=d(h,j).add(g.filter(h)),r=0,m=l.length;r<m;r++)q(l[r],i)});if(j===i){var n=i.getElementsByTagName("header")[0],t=i.getElementsByTagName("footer"),l=t.length;
n&&!d(n).closest("section, article")[0]&&q(n,"banner");l&&(n=t[l-1],d(n).closest("section, article")[0]||q(n,"contentinfo"))}})}})(jQuery,document);
(function(d,i,v){var p=i.audio&&i.video,q=!1;if(p)d=document.createElement("video"),i.videoBuffered="buffered"in d,q="loop"in d,v.capturingEvents("play,playing,waiting,paused,ended,durationchange,loadedmetadata,canplay,volumechange".split(",")),i.videoBuffered||(v.addPolyfill("mediaelement-native-fix",{f:"mediaelement",test:i.videoBuffered,d:["dom-support"]}),v.reTest("mediaelement-native-fix"));jQuery.webshims.register("mediaelement-core",function(d,g,n,t,l){var h=g.mediaelement,u=g.cfg.mediaelement,
o=function(a,b){var a=d(a),c={src:a.attr("src")||"",elem:a,srcProp:a.prop("src")};if(!c.src)return c;var f=a.attr("type");if(f)c.type=f,c.container=d.trim(f.split(";")[0]);else if(b||(b=a[0].nodeName.toLowerCase(),"source"==b&&(b=(a.closest("video, audio")[0]||{nodeName:"video"}).nodeName.toLowerCase())),f=h.getTypeForSrc(c.src,b))c.type=f,c.container=f;if(f=a.attr("media"))c.media=f;return c},r=swfobject.hasFlashPlayerVersion("9.0.115"),m=!r&&"postMessage"in n&&p,v=function(){g.ready("mediaelement-swf",
function(){if(!h.createSWF)g.modules["mediaelement-swf"].test=d.noop,g.reTest(["mediaelement-swf"],p)})},A=function(){var a;return function(){!a&&m&&(a=!0,g.loader.loadScript("https://www.youtube.com/player_api"),d(function(){g.polyfill("mediaelement-yt")}))}}(),B=function(){r?v():A();d(function(){g.loader.loadList(["track-ui"])})};g.addPolyfill("mediaelement-yt",{test:!m,d:["dom-support"]});h.mimeTypes={audio:{"audio/ogg":["ogg","oga","ogm"],'audio/ogg;codecs="opus"':"opus","audio/mpeg":["mp2","mp3",
"mpga","mpega"],"audio/mp4":"mp4,mpg4,m4r,m4a,m4p,m4b,aac".split(","),"audio/wav":["wav"],"audio/3gpp":["3gp","3gpp"],"audio/webm":["webm"],"audio/fla":["flv","f4a","fla"],"application/x-mpegURL":["m3u8","m3u"]},video:{"video/ogg":["ogg","ogv","ogm"],"video/mpeg":["mpg","mpeg","mpe"],"video/mp4":["mp4","mpg4","m4v"],"video/quicktime":["mov","qt"],"video/x-msvideo":["avi"],"video/x-ms-asf":["asf","asx"],"video/flv":["flv","f4v"],"video/3gpp":["3gp","3gpp"],"video/webm":["webm"],"application/x-mpegURL":["m3u8",
"m3u"],"video/MP2T":["ts"]}};h.mimeTypes.source=d.extend({},h.mimeTypes.audio,h.mimeTypes.video);h.getTypeForSrc=function(a,b){if(-1!=a.indexOf("youtube.com/watch?")||-1!=a.indexOf("youtube.com/v/"))return"video/youtube";var a=a.split("?")[0].split("."),a=a[a.length-1],c;d.each(h.mimeTypes[b],function(b,d){if(-1!==d.indexOf(a))return c=b,!1});return c};h.srces=function(a,b){a=d(a);if(b)a.removeAttr("src").removeAttr("type").find("source").remove(),d.isArray(b)||(b=[b]),b.forEach(function(b){var c=
t.createElement("source");"string"==typeof b&&(b={src:b});c.setAttribute("src",b.src);b.type&&c.setAttribute("type",b.type);b.media&&c.setAttribute("media",b.media);a.append(c)});else{var b=[],c=a[0].nodeName.toLowerCase(),f=o(a,c);f.src?b.push(f):d("source",a).each(function(){f=o(this,c);f.src&&b.push(f)});return b}};d.fn.loadMediaSrc=function(a,b){return this.each(function(){b!==l&&(d(this).removeAttr("poster"),b&&d.attr(this,"poster",b));h.srces(this,a);d(this).mediaLoad()})};h.swfMimeTypes="video/3gpp,video/x-msvideo,video/quicktime,video/x-m4v,video/mp4,video/m4p,video/x-flv,video/flv,audio/mpeg,audio/aac,audio/mp4,audio/x-m4a,audio/m4a,audio/mp3,audio/x-fla,audio/fla,youtube/flv,jwplayer/jwplayer,video/youtube".split(",");
h.canThirdPlaySrces=function(a,b){var c="";if(r||m)a=d(a),b=b||h.srces(a),d.each(b,function(a,b){if(b.container&&b.src&&(r&&-1!=h.swfMimeTypes.indexOf(b.container)||m&&"video/youtube"==b.container))return c=b,!1});return c};var s={};h.canNativePlaySrces=function(a,b){var c="";if(p){var a=d(a),f=(a[0].nodeName||"").toLowerCase();if(!s[f])return c;b=b||h.srces(a);d.each(b,function(b,d){if(d.type&&s[f].prop._supvalue.call(a[0],d.type))return c=d,!1})}return c};if(p&&r&&!u.preferFlash){var w=function(a){var b=
a.target.parentNode;!u.preferFlash&&(d(a.target).is("audio, video")||b&&d("source:last",b)[0]==a.target)&&g.ready("mediaelement-swf",function(){setTimeout(function(){if(!d(a.target).closest("audio, video").is(".nonnative-api-active"))u.preferFlash=!0,t.removeEventListener("error",w,!0),d("audio, video").mediaLoad()},20)})};t.addEventListener("error",w,!0);d.webshims.ready("DOM",function(){d("audio, video").each(function(){this.error&&w({target:this})})})}h.setError=function(a,b){b||(b="can't play sources");
d(a).pause().data("mediaerror",b);g.warn("mediaelementError: "+b);setTimeout(function(){d(a).data("mediaerror")&&d(a).trigger("mediaerror")},1)};var b=function(){var a;return function(c,d,f){g.ready(r?"mediaelement-swf":"mediaelement-yt",function(){h.createSWF?h.createSWF(c,d,f):a||(a=!0,B(),b(c,d,f))});!a&&m&&!h.createSWF&&A()}}(),a=function(c,d,f,g,i){f||!1!==f&&d&&"third"==d.isActive?(f=h.canThirdPlaySrces(c,g))?b(c,f,d):i?h.setError(c,!1):a(c,d,!1,g,!0):(f=h.canNativePlaySrces(c,g))?d&&"third"==
d.isActive&&h.setActive(c,"html5",d):i?(h.setError(c,!1),d&&"third"==d.isActive&&h.setActive(c,"html5",d)):a(c,d,!0,g,!0)},c=/^(?:embed|object|datalist)$/i,f=function(b,f){var i=g.data(b,"mediaelementBase")||g.data(b,"mediaelementBase",{}),r=h.srces(b),m=b.parentNode;clearTimeout(i.loadTimer);d.data(b,"mediaerror",!1);if(r.length&&m&&!(1!=m.nodeType||c.test(m.nodeName||"")))f=f||g.data(b,"mediaelement"),a(b,f,u.preferFlash||l,r)};d(t).bind("ended",function(a){var b=g.data(a.target,"mediaelement");
(!q||b&&"html5"!=b.isActive||d.prop(a.target,"loop"))&&setTimeout(function(){!d.prop(a.target,"paused")&&d.prop(a.target,"loop")&&d(a.target).prop("currentTime",0).play()},1)});q||g.defineNodeNamesBooleanProperty(["audio","video"],"loop");["audio","video"].forEach(function(a){var b=g.defineNodeNameProperty(a,"load",{prop:{value:function(){var a=g.data(this,"mediaelement");f(this,a);p&&(!a||"html5"==a.isActive)&&b.prop._supvalue&&b.prop._supvalue.apply(this,arguments)}}});s[a]=g.defineNodeNameProperty(a,
"canPlayType",{prop:{value:function(b){var c="";p&&s[a].prop._supvalue&&(c=s[a].prop._supvalue.call(this,b),"no"==c&&(c=""));!c&&r&&(b=d.trim((b||"").split(";")[0]),-1!=h.swfMimeTypes.indexOf(b)&&(c="maybe"));return c}}})});g.onNodeNamesPropertyModify(["audio","video"],["src","poster"],{set:function(){var a=this,b=g.data(a,"mediaelementBase")||g.data(a,"mediaelementBase",{});clearTimeout(b.loadTimer);b.loadTimer=setTimeout(function(){f(a);a=null},9)}});n=function(){g.addReady(function(a,b){d("video, audio",
a).add(b.filter("video, audio")).each(function(){d.browser.msie&&8<g.browserVersion&&d.prop(this,"paused")&&!d.prop(this,"readyState")&&d(this).is('audio[preload="none"][controls]:not([autoplay])')?d(this).prop("preload","metadata").mediaLoad():f(this);if(p){var a,b,c=this,e=function(){var a=d.prop(c,"buffered");if(a){for(var b="",e=0,f=a.length;e<f;e++)b+=a.end(e);return b}},h=function(){var a=e();a!=b&&(b=a,d(c).triggerHandler("progress"))};d(this).bind("play loadstart progress",function(c){"progress"==
c.type&&(b=e());clearTimeout(a);a=setTimeout(h,999)}).bind("emptied stalled mediaerror abort suspend",function(c){"emptied"==c.type&&(b=!1);clearTimeout(a)})}})})};i.track?g.defineProperty(TextTrack.prototype,"shimActiveCues",{get:function(){return this._shimActiveCues||this.activeCues}}):d(function(){g.loader.loadList(["track-ui"])});p?(g.isReady("mediaelement-core",!0),n(),g.ready("WINDOWLOAD mediaelement",B)):g.ready("mediaelement-swf",n)})})(jQuery,Modernizr,jQuery.webshims);
jQuery.webshims.register("details",function(d,i,v,p,q,j){var g=function(g){var h=d(g).parent("details");if(h[0]&&h.children(":first").get(0)===g)return h},n=function(g,h){var g=d(g),h=d(h),i=d.data(h[0],"summaryElement");d.data(g[0],"detailsElement",h);if(!i||g[0]!==i[0])i&&(i.hasClass("fallback-summary")?i.remove():i.unbind(".summaryPolyfill").removeData("detailsElement").removeAttr("role").removeAttr("tabindex").removeAttr("aria-expanded").removeClass("summary-button").find("span.details-open-indicator").remove()),
d.data(h[0],"summaryElement",g),h.prop("open",h.prop("open"))};i.createElement("summary",function(){var l=g(this);if(l&&!d.data(this,"detailsElement")){var h,j,o=d.attr(this,"tabIndex")||"0";n(this,l);d(this).bind("focus.summaryPolyfill",function(){d(this).addClass("summary-has-focus")}).bind("blur.summaryPolyfill",function(){d(this).removeClass("summary-has-focus")}).bind("mouseenter.summaryPolyfill",function(){d(this).addClass("summary-has-hover")}).bind("mouseleave.summaryPolyfill",function(){d(this).removeClass("summary-has-hover")}).bind("click.summaryPolyfill",
function(i){var l=g(this);if(l){if(!j&&i.originalEvent)return j=!0,i.stopImmediatePropagation(),i.preventDefault(),d(this).trigger("click"),j=!1;clearTimeout(h);h=setTimeout(function(){i.isDefaultPrevented()||l.prop("open",!l.prop("open"))},0)}}).bind("keydown.summaryPolyfill",function(g){if((13==g.keyCode||32==g.keyCode)&&!g.isDefaultPrevented())j=!0,g.preventDefault(),d(this).trigger("click"),j=!1}).attr({tabindex:o,role:"button"}).prepend('<span class="details-open-indicator" />');i.moveToFirstEvent(this,
"click")}});var t;i.defineNodeNamesBooleanProperty("details","open",function(g){var h=d(d.data(this,"summaryElement"));if(h){var i=g?"removeClass":"addClass",o=d(this);if(!t&&j.animate){o.stop().css({width:"",height:""});var n={width:o.width(),height:o.height()}}h.attr("aria-expanded",""+g);o[i]("closed-details-summary").children().not(h[0])[i]("closed-details-child");!t&&j.animate&&(g={width:o.width(),height:o.height()},o.css(n).animate(g,{complete:function(){d(this).css({width:"",height:""})}}))}});
i.createElement("details",function(){t=!0;var g=d.data(this,"summaryElement");g||(g=d("> summary:first-child",this),g[0]?n(g,this):(d(this).prependPolyfill('<summary class="fallback-summary">'+j.text+"</summary>"),d.data(this,"summaryElement")));d.prop(this,"open",d.prop(this,"open"));t=!1})});