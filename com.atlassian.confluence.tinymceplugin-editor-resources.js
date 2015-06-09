var tinymce = {
	majorVersion : '3',
	minorVersion : '2.5',
	releaseDate : '2009-06-29',

	_init : function() {
        AJS.log("tinymce._init");
		var t = this, d = document, w = window, na = navigator, ua = na.userAgent, i, nl, n, base, p, v;

		// Browser checks
		t.isOpera = w.opera && opera.buildNumber;
		t.isWebKit = /WebKit/.test(ua);
		t.isIE = !t.isWebKit && !t.isOpera && (/MSIE/gi).test(ua) && (/Explorer/gi).test(na.appName);
		t.isIE6 = t.isIE && /MSIE [56]/.test(ua);
		t.isGecko = !t.isWebKit && /Gecko/.test(ua);
		t.isMac = ua.indexOf('Mac') != -1;
		t.isAir = /adobeair/i.test(ua);

		// TinyMCE .NET webcontrol might be setting the values for TinyMCE
		if (w.tinyMCEPreInit) {
			t.suffix = tinyMCEPreInit.suffix;
			t.baseURL = tinyMCEPreInit.base;
			t.query = tinyMCEPreInit.query;
			return;
		}

		// Get suffix and base
		t.suffix = '';

		// If base element found, add that infront of baseURL
		nl = d.getElementsByTagName('base');
        for (i=0; i<nl.length; i++) {
			if (v = nl[i].href) {
				// Host only value like http://site.com or http://site.com:8008
				if (/^https?:\/\/[^\/]+$/.test(v))
					v += '/';

				base = v ? v.match(/.*\//)[0] : ''; // Get only directory
			}
		}

        // ATLASSIAN - get base from document.location and our webresource called tinymce-resources
        if (!base) {
            var l = document.location;
            base = l.protocol + "//" + l.hostname + (l.port ? ":" + l.port : "");
        }


		function getBase(n) {
			if (n.src && /tiny_mce(|_gzip|_jquery|_prototype)(_dev|_src)?.js/.test(n.src) || /tinymceplugin/.test(n.src)) {
				if (/_(src|dev)\.js/g.test(n.src))
					t.suffix = '_src';

				if ((p = n.src.indexOf('?')) != -1)
					t.query = n.src.substring(p + 1);

				t.baseURL = n.src.substring(0, n.src.indexOf('/download/'));

				// If path to script is relative and a base href was found add that one infront
				if (base && t.baseURL.indexOf('://') == -1)
					t.baseURL = base + t.baseURL;

                // ATLASSIAN - we need to change the base to this plugin resource, not the edit page url
                t.baseURL += "/download/resources/com.atlassian.confluence.tinymceplugin/tinymcesource";
                return t.baseURL;
			}

			return null;
		};

        // Check document
		nl = d.getElementsByTagName('script');
		for (i=0; i<nl.length; i++) {
			if (getBase(nl[i]))
				return;
		}

		// Check head
		n = d.getElementsByTagName('head')[0];
		if (n) {
			nl = n.getElementsByTagName('script');
			for (i=0; i<nl.length; i++) {
				if (getBase(nl[i]))
					return;
			}
		}
		
		return;
    },

	is : function(o, t) {
		var n = typeof(o);

		if (!t)
			return n != 'undefined';

		if (t == 'array' && (o.hasOwnProperty && o instanceof Array))
			return true;

		return n == t;
	},


	each : function(o, cb, s) {
		var n, l;

		if (!o)
			return 0;

		s = s || o;

		if (typeof(o.length) != 'undefined') {
			// Indexed arrays, needed for Safari
			for (n=0, l = o.length; n<l; n++) {
				if (cb.call(s, o[n], n, o) === false)
					return 0;
			}
		} else {
			// Hashtables
			for (n in o) {
				if (o.hasOwnProperty(n)) {
					if (cb.call(s, o[n], n, o) === false)
						return 0;
				}
			}
		}

		return 1;
	},

	map : function(a, f) {
		var o = [];

		tinymce.each(a, function(v) {
			o.push(f(v));
		});

		return o;
	},

	grep : function(a, f) {
		var o = [];

		tinymce.each(a, function(v) {
			if (!f || f(v))
				o.push(v);
		});

		return o;
	},

	inArray : function(a, v) {
		var i, l;

		if (a) {
			for (i = 0, l = a.length; i < l; i++) {
				if (a[i] === v)
					return i;
			}
		}

		return -1;
	},

	extend : function(o, e) {
		var i, a = arguments;

		for (i=1; i<a.length; i++) {
			e = a[i];

			tinymce.each(e, function(v, n) {
				if (typeof(v) !== 'undefined')
					o[n] = v;
			});
		}

		return o;
	},


	trim : function(s) {
		return (s ? '' + s : '').replace(/^\s*|\s*$/g, '');
	},

	create : function(s, p) {
		var t = this, sp, ns, cn, scn, c, de = 0;

		// Parse : <prefix> <class>:<super class>
		s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
		cn = s[3].match(/(^|\.)(\w+)$/i)[2]; // Class name

		// Create namespace for new class
		ns = t.createNS(s[3].replace(/\.\w+$/, ''));

		// Class already exists
		if (ns[cn])
			return;

		// Make pure static class
		if (s[2] == 'static') {
			ns[cn] = p;

			if (this.onCreate)
				this.onCreate(s[2], s[3], ns[cn]);

			return;
		}

		// Create default constructor
		if (!p[cn]) {
			p[cn] = function() {};
			de = 1;
		}

		// Add constructor and methods
		ns[cn] = p[cn];
		t.extend(ns[cn].prototype, p);

		// Extend
		if (s[5]) {
			sp = t.resolve(s[5]).prototype;
			scn = s[5].match(/\.(\w+)$/i)[1]; // Class name

			// Extend constructor
			c = ns[cn];
			if (de) {
				// Add passthrough constructor
				ns[cn] = function() {
					return sp[scn].apply(this, arguments);
				};
			} else {
				// Add inherit constructor
				ns[cn] = function() {
					this.parent = sp[scn];
					return c.apply(this, arguments);
				};
			}
			ns[cn].prototype[cn] = ns[cn];

			// Add super methods
			t.each(sp, function(f, n) {
				ns[cn].prototype[n] = sp[n];
			});

			// Add overridden methods
			t.each(p, function(f, n) {
				// Extend methods if needed
				if (sp[n]) {
					ns[cn].prototype[n] = function() {
						this.parent = sp[n];
						return f.apply(this, arguments);
					};
				} else {
					if (n != cn)
						ns[cn].prototype[n] = f;
				}
			});
		}

		// Add static methods
		t.each(p['static'], function(f, n) {
			ns[cn][n] = f;
		});

		if (this.onCreate)
			this.onCreate(s[2], s[3], ns[cn].prototype);
	},

	walk : function(o, f, n, s) {
		s = s || this;

		if (o) {
			if (n)
				o = o[n];

			tinymce.each(o, function(o, i) {
				if (f.call(s, o, i, n) === false)
					return false;

				tinymce.walk(o, f, n, s);
			});
		}
	},

	createNS : function(n, o) {
		var i, v;

		o = o || window;

		n = n.split('.');
		for (i=0; i<n.length; i++) {
			v = n[i];

			if (!o[v])
				o[v] = {};

			o = o[v];
		}

		return o;
	},

	resolve : function(n, o) {
		var i, l;

		o = o || window;

		n = n.split('.');
		for (i=0, l = n.length; i<l; i++) {
			o = o[n[i]];

			if (!o)
				break;
		}

		return o;
	},

	addUnload : function(f, s) {
		var t = this, w = window;

		f = {func : f, scope : s || this};

		if (!t.unloads) {
			function unload() {
				var li = t.unloads, o, n;

				if (li) {
					// Call unload handlers
					for (n in li) {
						o = li[n];

						if (o && o.func)
							o.func.call(o.scope, 1); // Send in one arg to distinct unload and user destroy
					}

					// Detach unload function
					if (w.detachEvent) {
						w.detachEvent('onbeforeunload', fakeUnload);
						w.detachEvent('onunload', unload);
					} else if (w.removeEventListener)
						w.removeEventListener('unload', unload, false);

					// Destroy references
					t.unloads = o = li = w = unload = 0;

					// Run garbarge collector on IE
					if (window.CollectGarbage)
						window.CollectGarbage();
				}
			};

			function fakeUnload() {
				var d = document;

				// Is there things still loading, then do some magic
				if (d.readyState == 'interactive') {
					function stop() {
						// Prevent memory leak
						d.detachEvent('onstop', stop);

						// Call unload handler
						if (unload)
							unload();

						d = 0;
					};

					// Fire unload when the currently loading page is stopped
					if (d)
						d.attachEvent('onstop', stop);

					// Remove onstop listener after a while to prevent the unload function
					// to execute if the user presses cancel in an onbeforeunload
					// confirm dialog and then presses the browser stop button
					window.setTimeout(function() {
						if (d)
							d.detachEvent('onstop', stop);
					}, 0);
				}
			};

			// Attach unload handler
			if (w.attachEvent) {
				w.attachEvent('onunload', unload);
				w.attachEvent('onbeforeunload', fakeUnload);
			} else if (w.addEventListener)
				w.addEventListener('unload', unload, false);

			// Setup initial unload handler array
			t.unloads = [f];
		} else
			t.unloads.push(f);

		return f;
	},

	removeUnload : function(f) {
		var u = this.unloads, r = null;

		tinymce.each(u, function(o, i) {
			if (o && o.func == f) {
				u.splice(i, 1);
				r = f;
				return false;
			}
		});

		return r;
	},

	explode : function(s, d) {
		return s ? tinymce.map(s.split(d || ','), tinymce.trim) : s;
	},

	_addVer : function(u) {
		var v;

		if (!this.query)
			return u;

		v = (u.indexOf('?') == -1 ? '?' : '&') + this.query;

		if (u.indexOf('#') == -1)
			return u + v;

		return u.replace('#', v + '#');
	}

	};

// Required for GZip AJAX loading
window.tinymce = tinymce;

// Initialize the API
tinymce._init();
tinymce.create('tinymce.util.Dispatcher', {
	scope : null,
	listeners : null,

	Dispatcher : function(s) {
		this.scope = s || this;
		this.listeners = [];
	},

	add : function(cb, s) {
		this.listeners.push({cb : cb, scope : s || this.scope});

		return cb;
	},

	addToTop : function(cb, s) {
		this.listeners.unshift({cb : cb, scope : s || this.scope});

		return cb;
	},

	remove : function(cb) {
		var l = this.listeners, o = null;

		tinymce.each(l, function(c, i) {
			if (cb == c.cb) {
				o = cb;
				l.splice(i, 1);
				return false;
			}
		});

		return o;
	},

	dispatch : function() {
		var s, a = arguments, i, li = this.listeners, c;

		// Needs to be a real loop since the listener count might change while looping
		// And this is also more efficient
		for (i = 0; i<li.length; i++) {
			c = li[i];
			s = c.cb.apply(c.scope, a);

			if (s === false)
				break;
		}

		return s;
	}

	});
(function() {
	var each = tinymce.each;

	tinymce.create('http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/tinymce.util.URI', {
		URI : function(u, s) {
			var t = this, o, a, b;

			// Trim whitespace
			u = tinymce.trim(u);

			// Default settings
			s = t.settings = s || {};

			// Strange app protocol or local anchor
			if (/^(mailto|tel|news|javascript|about):/i.test(u) || /^\s*#/.test(u)) {
				t.source = u;
				return;
			}

			// Absolute path with no host, fake host and protocol
			if (u.indexOf('/') === 0 && u.indexOf('//') !== 0) {
                AJS.log("URI.URI Absolute path with no host u : " + u);
				u = (s.base_uri ? s.base_uri.protocol || 'http' : 'http') + '://mce_host' + u;
			}

			// Relative path http:// or protocol relative //path
			if (!/^\w*:?\/\//.test(u)) {
				AJS.log("URI.URI relative path with no host u : " + u);
				u = (s.base_uri.protocol || 'http') + '://mce_host' + t.toAbsPath(s.base_uri.path, u);
			}

			// Parse URL (Credits goes to Steave, http://blog.stevenlevithan.com/archives/parseuri)
			u = u.replace(/@@/g, '(mce_at)'); // Zope 3 workaround, they use @@something
			u = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(u);
			each(["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"], function(v, i) {
				var s = u[i];

				// Zope 3 workaround, they use @@something
				if (s)
					s = s.replace(/\(mce_at\)/g, '@@');

				t[v] = s;
			});

			if (b = s.base_uri) {
				if (!t.protocol)
					t.protocol = b.protocol;

				if (!t.userInfo)
					t.userInfo = b.userInfo;

				if (!t.port && t.host == 'mce_host')
					t.port = b.port;

				if (!t.host || t.host == 'mce_host')
					t.host = b.host;

				t.source = '';
			}

			//t.path = t.path || '/';
		},

		setPath : function(p) {
			var t = this;

			p = /^(.*?)\/?(\w+)?$/.exec(p);

			// Update path parts
			t.path = p[0];
			t.directory = p[1];
			t.file = p[2];

			// Rebuild source
			t.source = '';
			t.getURI();
		},

		toRelative : function(u) {
			var t = this, o;

			if (u === "./")
				return u;

			u = new tinymce.util.URI(u, {base_uri : t});

			// Not on same domain/port or protocol
			if ((u.host != 'mce_host' && t.host != u.host && u.host) || t.port != u.port || t.protocol != u.protocol)
				return u.getURI();

			o = t.toRelPath(t.path, u.path);

			// Add query
			if (u.query)
				o += '?' + u.query;

			// Add anchor
			if (u.anchor)
				o += '#' + u.anchor;

			return o;
		},

		toAbsolute : function(u, nh) {
			var u = new tinymce.util.URI(u, {base_uri : this});

			return u.getURI(this.host == u.host ? nh : 0);
		},

		toRelPath : function(base, path) {
			var items, bp = 0, out = '', i, l;

			// Split the paths
			base = base.substring(0, base.lastIndexOf('/'));
			base = base.split('/');
			items = path.split('/');

			if (base.length >= items.length) {
				for (i = 0, l = base.length; i < l; i++) {
					if (i >= items.length || base[i] != items[i]) {
						bp = i + 1;
						break;
					}
				}
			}

			if (base.length < items.length) {
				for (i = 0, l = items.length; i < l; i++) {
					if (i >= base.length || base[i] != items[i]) {
						bp = i + 1;
						break;
					}
				}
			}

			if (bp == 1)
				return path;

			for (i = 0, l = base.length - (bp - 1); i < l; i++)
				out += "../";

			for (i = bp - 1, l = items.length; i < l; i++) {
				if (i != bp - 1)
					out += "/" + items[i];
				else
					out += items[i];
			}

			return out;
		},

		toAbsPath : function(base, path) {
			var i, nb = 0, o = [], tr;

			// Split paths
			tr = /\/$/.test(path) ? '/' : '';
			base = base.split('/');
			path = path.split('/');

			// Remove empty chunks
			each(base, function(k) {
				if (k)
					o.push(k);
			});

			base = o;

			// Merge relURLParts chunks
			for (i = path.length - 1, o = []; i >= 0; i--) {
				// Ignore empty or .
				if (path[i].length == 0 || path[i] == ".")
					continue;

				// Is parent
				if (path[i] == '..') {
					nb++;
					continue;
				}

				// Move up
				if (nb > 0) {
					nb--;
					continue;
				}

				o.push(path[i]);
			}

			i = base.length - nb;

			// If /a/b/c or /
			if (i <= 0)
				return '/' + o.reverse().join('/') + tr;

			return '/' + base.slice(0, i).join('/') + '/' + o.reverse().join('/') + tr;
		},

		getURI : function(nh) {
			var s, t = this;

			// Rebuild source
			if (!t.source || nh) {
				s = '';

				if (!nh) {
					if (t.protocol)
						s += t.protocol + '://';

					if (t.userInfo)
						s += t.userInfo + '@';

					if (t.host)
						s += t.host;

					if (t.port)
						s += ':' + t.port;
				}

				if (t.path)
					s += t.path;

				if (t.query)
					s += '?' + t.query;

				if (t.anchor)
					s += '#' + t.anchor;

				t.source = s;
			}

			return t.source;
		}

		});
})();
(function() {
	var each = tinymce.each;

	tinymce.create('static tinymce.util.Cookie', {
		getHash : function(n) {
			var v = this.get(n), h;

			if (v) {
				each(v.split('&'), function(v) {
					v = v.split('=');
					h = h || {};
					h[unescape(v[0])] = unescape(v[1]);
				});
			}

			return h;
		},

		setHash : function(n, v, e, p, d, s) {
			var o = '';

			each(v, function(v, k) {
				o += (!o ? '' : '&') + escape(k) + '=' + escape(v);
			});

			this.set(n, o, e, p, d, s);
		},

		get : function(n) {
			var c = document.cookie, e, p = n + "=", b;

			// Strict mode
			if (!c)
				return;

			b = c.indexOf("; " + p);

			if (b == -1) {
				b = c.indexOf(p);

				if (b != 0)
					return null;
			} else
				b += 2;

			e = c.indexOf(";", b);

			if (e == -1)
				e = c.length;

			return unescape(c.substring(b + p.length, e));
		},

		set : function(n, v, e, p, d, s) {
			document.cookie = n + "=" + escape(v) +
				((e) ? "; expires=" + e.toGMTString() : "") +
				((p) ? "; path=" + escape(p) : "") +
				((d) ? "; domain=" + d : "") +
				((s) ? "; secure" : "");
		},

		remove : function(n, p) {
			var d = new Date();

			d.setTime(d.getTime() - 1000);

			this.set(n, '', d, p, d);
		}

		});
})();
tinymce.create('http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/static tinymce.util.JSON', {
	serialize : function(o) {
		var i, v, s = tinymce.util.JSON.serialize, t;

		if (o == null)
			return 'null';

		t = typeof o;

		if (t == 'string') {
			v = '\bb\tt\nn\ff\rr\""\'\'\\\\';

			return '"' + o.replace(/([\u0080-\uFFFF\x00-\x1f\"])/g, function(a, b) {
				i = v.indexOf(b);

				if (i + 1)
					return '\\' + v.charAt(i + 1);

				a = b.charCodeAt().toString(16);

				return '\\u' + '0000'.substring(a.length) + a;
			}) + '"';
		}

		if (t == 'object') {
			if (o.hasOwnProperty && o instanceof Array) {
					for (i=0, v = '['; i<o.length; i++)
						v += (i > 0 ? ',' : '') + s(o[i]);

					return v + ']';
				}

				v = '{';

				for (i in o)
					v += typeof o[i] != 'function' ? (v.length > 1 ? ',"' : '"') + i + '":' + s(o[i]) : '';

				return v + '}';
		}

		return '' + o;
	},

	parse : function(s) {
		try {
			return eval('(' + s + ')');
		} catch (ex) {
			// Ignore
		}
	}

	});
tinymce.create('http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/static tinymce.util.XHR', {
	send : function(o) {
		var x, t, w = window, c = 0;

		// Default settings
		o.scope = o.scope || this;
		o.success_scope = o.success_scope || o.scope;
		o.error_scope = o.error_scope || o.scope;
		o.async = o.async === false ? false : true;
		o.data = o.data || '';

		function get(s) {
			x = 0;

			try {
				x = new ActiveXObject(s);
			} catch (ex) {
			}

			return x;
		};

		x = w.XMLHttpRequest ? new XMLHttpRequest() : get('Microsoft.XMLHTTP') || get('Msxml2.XMLHTTP');

		if (x) {
			if (x.overrideMimeType)
				x.overrideMimeType(o.content_type);

			x.open(o.type || (o.data ? 'POST' : 'GET'), o.url, o.async);

			if (o.content_type)
				x.setRequestHeader('Content-Type', o.content_type);

			x.send(o.data);

			function ready() {
				if (!o.async || x.readyState == 4 || c++ > 10000) {
					if (o.success && c < 10000 && x.status == 200)
						o.success.call(o.success_scope, '' + x.responseText, x, o);
					else if (o.error)
						o.error.call(o.error_scope, c > 10000 ? 'TIMED_OUT' : 'GENERAL', x, o);

					x = null;
				} else
					w.setTimeout(ready, 10);
			};

			// Syncronous request
			if (!o.async)
				return ready();

			// Wait for response, onReadyStateChange can not be used since it leaks memory in IE
			t = w.setTimeout(ready, 10);
		}

		}
});
(function() {
	var extend = tinymce.extend, JSON = tinymce.util.JSON, XHR = tinymce.util.XHR;

	tinymce.create('tinymce.util.JSONRequest', {
		JSONRequest : function(s) {
			this.settings = extend({
			}, s);
			this.count = 0;
		},

		send : function(o) {
			var ecb = o.error, scb = o.success;

			o = extend(this.settings, o);

			o.success = function(c, x) {
				c = JSON.parse(c);

				if (typeof(c) == 'undefined') {
					c = {
						error : 'JSON Parse error.'
					};
				}

				if (c.error)
					ecb.call(o.error_scope || o.scope, c.error, x);
				else
					scb.call(o.success_scope || o.scope, c.result);
			};

			o.error = function(ty, x) {
				ecb.call(o.error_scope || o.scope, ty, x);
			};

			o.data = JSON.serialize({
				id : o.id || 'c' + (this.count++),
				method : o.method,
				params : o.params
			});

			// JSON content type for Ruby on rails. Bug: #1883287
			o.content_type = 'application/json';

			XHR.send(o);
		},

		'static' : {
			sendRPC : function(o) {
				return new tinymce.util.JSONRequest().send(o);
			}
		}

		});
}());(function(tinymce) {
	// Shorten names
	var each = tinymce.each, is = tinymce.is;
	var isWebKit = tinymce.isWebKit, isIE = tinymce.isIE;

	tinymce.create('tinymce.dom.DOMUtils', {
		doc : null,
		root : null,
		files : null,
		pixelStyles : /^(top|left|bottom|right|width|height|borderWidth)$/,
		props : {
			"for" : "htmlFor",
			"class" : "className",
			className : "className",
			checked : "checked",
			disabled : "disabled",
			maxlength : "maxLength",
			readonly : "readOnly",
			selected : "selected",
			value : "value",
			id : "id",
			name : "name",
			type : "type"
		},

		DOMUtils : function(d, s) {
			var t = this;

			t.doc = d;
			t.win = window;
			t.files = {};
			t.cssFlicker = false;
			t.counter = 0;
			t.boxModel = !tinymce.isIE || d.compatMode == "CSS1Compat"; 
			t.stdMode = d.documentMode === 8;

			t.settings = s = tinymce.extend({
				keep_values : false,
				hex_colors : 1,
				process_html : 1
			}, s);

			// Fix IE6SP2 flicker and check it failed for pre SP2
			if (tinymce.isIE6) {
				try {
					d.execCommand('BackgroundImageCache', false, true);
				} catch (e) {
					t.cssFlicker = true;
				}
			}

			tinymce.addUnload(t.destroy, t);
		},

		getRoot : function() {
			var t = this, s = t.settings;

			return (s && t.get(s.root_element)) || t.doc.body;
		},

		getViewPort : function(w) {
			var d, b;

			w = !w ? this.win : w;
			d = w.document;
			b = this.boxModel ? d.documentElement : d.body;

			// Returns viewport size excluding scrollbars
			return {
				x : w.pageXOffset || b.scrollLeft,
				y : w.pageYOffset || b.scrollTop,
				w : w.innerWidth || b.clientWidth,
				h : w.innerHeight || b.clientHeight
			};
		},

		getRect : function(e) {
			var p, t = this, sr;

			e = t.get(e);
			p = t.getPos(e);
			sr = t.getSize(e);

			return {
				x : p.x,
				y : p.y,
				w : sr.w,
				h : sr.h
			};
		},

		getSize : function(e) {
			var t = this, w, h;

			e = t.get(e);
			w = t.getStyle(e, 'width');
			h = t.getStyle(e, 'height');

			// Non pixel value, then force offset/clientWidth
			if (w.indexOf('px') === -1)
				w = 0;

			// Non pixel value, then force offset/clientWidth
			if (h.indexOf('px') === -1)
				h = 0;

			return {
				w : parseInt(w) || e.offsetWidth || e.clientWidth,
				h : parseInt(h) || e.offsetHeight || e.clientHeight
			};
		},

		getParent : function(n, f, r) {
			return this.getParents(n, f, r, false);
		},

		getParents : function(n, f, r, c) {
			var t = this, na, se = t.settings, o = [];

			n = t.get(n);
			c = c === undefined;

			if (se.strict_root)
				r = r || t.getRoot();

			// Wrap node name as func
			if (is(f, 'string')) {
				na = f;

				if (f === '*') {
					f = function(n) {return n.nodeType == 1;};
				} else {
					f = function(n) {
						return t.is(n, na);
					};
				}
			}

			while (n) {
				if (n == r || !n.nodeType || n.nodeType === 9)
					break;

				if (!f || f(n)) {
					if (c)
						o.push(n);
					else
						return n;
				}

				n = n.parentNode;
			}

			return c ? o : null;
		},

		get : function(e) {
			var n;

			if (e && this.doc && typeof(e) == 'string') {
				n = e;
				e = this.doc.getElementById(e);

				// IE and Opera returns meta elements when they match the specified input ID, but getElementsByName seems to do the trick
				if (e && e.id !== n)
					return this.doc.getElementsByName(n)[1];
			}

			return e;
		},


		select : function(pa, s) {
			var t = this;

			return tinymce.dom.Sizzle(pa, t.get(s) || t.get(t.settings.root_element) || t.doc, []);
		},

		is : function(n, patt) {
			return tinymce.dom.Sizzle.matches(patt, n.nodeType ? [n] : n).length > 0;
		},


		add : function(p, n, a, h, c) {
			var t = this;

			return this.run(p, function(p) {
				var e, k;

				e = is(n, 'string') ? t.doc.createElement(n) : n;
				t.setAttribs(e, a);

				if (h) {
					if (h.nodeType)
						e.appendChild(h);
					else
						t.setHTML(e, h);
				}

				return !c ? p.appendChild(e) : e;
			});
		},

		create : function(n, a, h) {
			return this.add(this.doc.createElement(n), n, a, h, 1);
		},

		createHTML : function(n, a, h) {
			var o = '', t = this, k;

			o += '<' + n;

			for (k in a) {
				if (a.hasOwnProperty(k))
					o += ' ' + k + '="' + t.encode(a[k]) + '"';
			}

			if (tinymce.is(h))
				return o + '>' + h + '</' + n + '>';

			return o + ' />';
		},

		remove : function(n, k) {
			var t = this;

			return this.run(n, function(n) {
				var p, g, i;

				p = n.parentNode;

				if (!p)
					return null;

				if (k) {
					for (i = n.childNodes.length - 1; i >= 0; i--)
						t.insertAfter(n.childNodes[i], n);

					//each(n.childNodes, function(c) {
					//	p.insertBefore(c.cloneNode(true), n);
					//});
				}

				// Fix IE psuedo leak
				if (t.fixPsuedoLeaks) {
					p = n.cloneNode(true);
					k = 'IELeakGarbageBin';
					g = t.get(k) || t.add(t.doc.body, 'div', {id : k, style : 'display:none'});
					g.appendChild(n);
					g.innerHTML = '';

					return p;
				}

				return p.removeChild(n);
			});
		},

		setStyle : function(n, na, v) {
			var t = this;

			return t.run(n, function(e) {
				var s, i;

				s = e.style;

				// Camelcase it, if needed
				na = na.replace(/-(\D)/g, function(a, b){
					return b.toUpperCase();
				});

				// Default px suffix on these
				if (t.pixelStyles.test(na) && (tinymce.is(v, 'number') || /^[\-0-9\.]+$/.test(v)))
					v += 'px';

				switch (na) {
					case 'opacity':
						// IE specific opacity
						if (isIE) {
							s.filter = v === '' ? '' : "alpha(opacity=" + (v * 100) + ")";

							if (!n.currentStyle || !n.currentStyle.hasLayout)
								s.display = 'inline-block';
						}

						// Fix for older browsers
						s[na] = s['-moz-opacity'] = s['-khtml-opacity'] = v || '';
						break;

					case 'float':
						isIE ? s.styleFloat = v : s.cssFloat = v;
						break;

					default:
						s[na] = v || '';
				}

				// Force update of the style data
				if (t.settings.update_styles)
					t.setAttrib(e, 'mce_style');
			});
		},

		getStyle : function(n, na, c) {
			n = this.get(n);

			if (!n)
				return false;

			// Gecko
			if (this.doc.defaultView && c) {
				// Remove camelcase
				na = na.replace(/[A-Z]/g, function(a){
					return '-' + a;
				});

				try {
					return this.doc.defaultView.getComputedStyle(n, null).getPropertyValue(na);
				} catch (ex) {
					// Old safari might fail
					return null;
				}
			}

			// Camelcase it, if needed
			na = na.replace(/-(\D)/g, function(a, b){
				return b.toUpperCase();
			});

			if (na == 'float')
				na = isIE ? 'styleFloat' : 'cssFloat';

			// IE & Opera
			if (n.currentStyle && c)
				return n.currentStyle[na];

			return n.style[na];
		},

		setStyles : function(e, o) {
			var t = this, s = t.settings, ol;

			ol = s.update_styles;
			s.update_styles = 0;

			each(o, function(v, n) {
				t.setStyle(e, n, v);
			});

			// Update style info
			s.update_styles = ol;
			if (s.update_styles)
				t.setAttrib(e, s.cssText);
		},

		setAttrib : function(e, n, v) {
			var t = this;

			// Whats the point
			if (!e || !n)
				return;

			// Strict XML mode
			if (t.settings.strict)
				n = n.toLowerCase();

			return this.run(e, function(e) {
				var s = t.settings;

				switch (n) {
					case "style":
						if (!is(v, 'string')) {
							each(v, function(v, n) {
								t.setStyle(e, n, v);
							});

							return;
						}

						// No mce_style for elements with these since they might get resized by the user
						if (s.keep_values) {
							if (v && !t._isRes(v))
								e.setAttribute('mce_style', v, 2);
							else
								e.removeAttribute('mce_style', 2);
						}

						e.style.cssText = v;
						break;

					case "class":
						e.className = v || ''; // Fix IE null bug
						break;

					case "src":
					case "href":
						if (s.keep_values) {
							if (s.url_converter)
								v = s.url_converter.call(s.url_converter_scope || t, v, n, e);

							t.setAttrib(e, 'mce_' + n, v, 2);
						}

						break;

					case "shape":
						e.setAttribute('mce_style', v);
						break;
				}

				if (is(v) && v !== null && v.length !== 0)
					e.setAttribute(n, '' + v, 2);
				else
					e.removeAttribute(n, 2);
			});
		},

		setAttribs : function(e, o) {
			var t = this;

			return this.run(e, function(e) {
				each(o, function(v, n) {
					t.setAttrib(e, n, v);
				});
			});
		},

		getAttrib : function(e, n, dv) {
			var v, t = this;

			e = t.get(e);

			if (!e || e.nodeType !== 1)
				return false;

			if (!is(dv))
				dv = '';

			// Try the mce variant for these
			if (/^(src|href|style|coords|shape)$/.test(n)) {
				v = e.getAttribute("mce_" + n);

				if (v)
					return v;
			}

			if (isIE && t.props[n]) {
				v = e[t.props[n]];
				v = v && v.nodeValue ? v.nodeValue : v;
			}

			if (!v)
				v = e.getAttribute(n, 2);

			if (n === 'style') {
				v = v || e.style.cssText;

				if (v) {
					v = t.serializeStyle(t.parseStyle(v));

					if (t.settings.keep_values && !t._isRes(v))
						e.setAttribute('mce_style', v);
				}
			}

			// Remove Apple and WebKit stuff
			if (isWebKit && n === "class" && v)
				v = v.replace(/(apple|webkit)\-[a-z\-]+/gi, '');

			// Handle IE issues
			if (isIE) {
				switch (n) {
					case 'rowspan':
					case 'colspan':
						// IE returns 1 as default value
						if (v === 1)
							v = '';

						break;

					case 'size':
						// IE returns +0 as default value for size
						if (v === '+0' || v === 20 || v === 0)
							v = '';

						break;

					case 'width':
					case 'height':
					case 'vspace':
					case 'checked':
					case 'disabled':
					case 'readonly':
						if (v === 0)
							v = '';

						break;

					case 'hspace':
						// IE returns -1 as default value
						if (v === -1)
							v = '';

						break;

					case 'maxlength':
					case 'tabindex':
						// IE returns default value
						if (v === 32768 || v === 2147483647 || v === '32768')
							v = '';

						break;

					case 'multiple':
					case 'compact':
					case 'noshade':
					case 'nowrap':
						if (v === 65535)
							return n;

						return dv;

					case 'shape':
						v = v.toLowerCase();
						break;

					default:
						// IE has odd anonymous function for event attributes
						if (n.indexOf('on') === 0 && v)
							v = ('' + v).replace(/^function\s+\w+\(\)\s+\{\s+(.*)\s+\}$/, '$1');
				}
			}

			return (v !== undefined && v !== null && v !== '') ? '' + v : dv;
		},

		getPos : function(n, ro) {
			var t = this, x = 0, y = 0, e, d = t.doc, r;

			n = t.get(n);
			ro = ro || d.body;

			if (n) {
				// Use getBoundingClientRect on IE, Opera has it but it's not perfect
				if (isIE && !t.stdMode) {
					n = n.getBoundingClientRect();
					e = t.boxModel ? d.documentElement : d.body;
					x = t.getStyle(t.select('html')[0], 'borderWidth'); // Remove border
					x = (x == 'medium' || t.boxModel && !t.isIE6) && 2 || x;
					n.top += t.win.self != t.win.top ? 2 : 0; // IE adds some strange extra cord if used in a frameset

					return {x : n.left + e.scrollLeft - x, y : n.top + e.scrollTop - x};
				}

				r = n;
				while (r && r != ro && r.nodeType) {
					x += r.offsetLeft || 0;
					y += r.offsetTop || 0;
					r = r.offsetParent;
				}

				r = n.parentNode;
				while (r && r != ro && r.nodeType) {
					x -= r.scrollLeft || 0;
					y -= r.scrollTop || 0;
					r = r.parentNode;
				}
			}

			return {x : x, y : y};
		},

		parseStyle : function(st) {
			var t = this, s = t.settings, o = {};

			if (!st)
				return o;

			function compress(p, s, ot) {
				var t, r, b, l;

				// Get values and check it it needs compressing
				t = o[p + '-top' + s];
				if (!t)
					return;

				r = o[p + '-right' + s];
				if (t != r)
					return;

				b = o[p + '-bottom' + s];
				if (r != b)
					return;

				l = o[p + '-left' + s];
				if (b != l)
					return;

				// Compress
				o[ot] = l;
				delete o[p + '-top' + s];
				delete o[p + '-right' + s];
				delete o[p + '-bottom' + s];
				delete o[p + '-left' + s];
			};

			function compress2(ta, a, b, c) {
				var t;

				t = o[a];
				if (!t)
					return;

				t = o[b];
				if (!t)
					return;

				t = o[c];
				if (!t)
					return;

				// Compress
				o[ta] = o[a] + ' ' + o[b] + ' ' + o[c];
				delete o[a];
				delete o[b];
				delete o[c];
			};

			st = st.replace(/&(#?[a-z0-9]+);/g, '&$1_MCE_SEMI_'); // Protect entities

			each(st.split(';'), function(v) {
				var sv, ur = [];

				if (v) {
					v = v.replace(/_MCE_SEMI_/g, ';'); // Restore entities
					v = v.replace(/url\([^\)]+\)/g, function(v) {ur.push(v);return 'url(' + ur.length + ')';});
					v = v.split(':');
					sv = tinymce.trim(v[1]);
					sv = sv.replace(/url\(([^\)]+)\)/g, function(a, b) {return ur[parseInt(b) - 1];});

					sv = sv.replace(/rgb\([^\)]+\)/g, function(v) {
						return t.toHex(v);
					});

					if (s.url_converter) {
						sv = sv.replace(/url\([\'\"]?([^\)\'\"]+)[\'\"]?\)/g, function(x, c) {
							return 'url(' + s.url_converter.call(s.url_converter_scope || t, t.decode(c), 'style', null) + ')';
						});
					}

					o[tinymce.trim(v[0]).toLowerCase()] = sv;
				}
			});

			compress("border", "", "border");
			compress("border", "-width", "border-width");
			compress("border", "-color", "border-color");
			compress("border", "-style", "border-style");
			compress("padding", "", "padding");
			compress("margin", "", "margin");
			compress2('border', 'border-width', 'border-style', 'border-color');

			if (isIE) {
				// Remove pointless border
				if (o.border == 'medium none')
					o.border = '';
			}

			return o;
		},

		serializeStyle : function(o) {
			var s = '';

			each(o, function(v, k) {
				if (k && v) {
					if (tinymce.isGecko && k.indexOf('-moz-') === 0)
						return;

					switch (k) {
						case 'color':
						case 'background-color':
							v = v.toLowerCase();
							break;
					}

					s += (s ? ' ' : '') + k + ': ' + v + ';';
				}
			});

			return s;
		},

		loadCSS : function(u) {
			var t = this, d = t.doc, head;

			if (!u)
				u = '';

			head = t.select('head')[0];

			each(u.split(','), function(u) {
				var link;

				if (t.files[u])
					return;

				t.files[u] = true;
				link = t.create('link', {rel : 'stylesheet', href : tinymce._addVer(u)});

				// IE 8 has a bug where dynamically loading stylesheets would produce a 1 item remaining bug
				// This fix seems to resolve that issue by realcing the document ones a stylesheet finishes loading
				// It's ugly but it seems to work fine.
				if (isIE && d.documentMode) {
					link.onload = function() {
						d.recalc();
						link.onload = null;
					};
				}

				head.appendChild(link);
			});
		},

		addClass : function(e, c) {
			return this.run(e, function(e) {
				var o;

				if (!c)
					return 0;

				if (this.hasClass(e, c))
					return e.className;

				o = this.removeClass(e, c);

				return e.className = (o != '' ? (o + ' ') : '') + c;
			});
		},

		removeClass : function(e, c) {
			var t = this, re;

			return t.run(e, function(e) {
				var v;

				if (t.hasClass(e, c)) {
					if (!re)
						re = new RegExp("(^|\\s+)" + c + "(\\s+|$)", "g");

					v = e.className.replace(re, ' ');

					return e.className = tinymce.trim(v != ' ' ? v : '');
				}

				return e.className;
			});
		},

		hasClass : function(n, c) {
			n = this.get(n);

			if (!n || !c)
				return false;

			return (' ' + n.className + ' ').indexOf(' ' + c + ' ') !== -1;
		},

		show : function(e) {
			return this.setStyle(e, 'display', 'block');
		},

		hide : function(e) {
			return this.setStyle(e, 'display', 'none');
		},

		isHidden : function(e) {
			e = this.get(e);

			return !e || e.style.display == 'none' || this.getStyle(e, 'display') == 'none';
		},

		uniqueId : function(p) {
			return (!p ? 'mce_' : p) + (this.counter++);
		},

		setHTML : function(e, h) {
			var t = this;

			return this.run(e, function(e) {
				var x, i, nl, n, p, x;

				h = t.processHTML(h);

				if (isIE) {
					function set() {
						try {
							// IE will remove comments from the beginning
							// unless you padd the contents with something
							e.innerHTML = '<br />' + h;
							e.removeChild(e.firstChild);
						} catch (ex) {
							// IE sometimes produces an unknown runtime error on innerHTML if it's an block element within a block element for example a div inside a p
							// This seems to fix this problem

							// Remove all child nodes
							while (e.firstChild)
								e.firstChild.removeNode();

							// Create new div with HTML contents and a BR infront to keep comments
							x = t.create('div');
							x.innerHTML = '<br />' + h;

							// Add all children from div to target
							each (x.childNodes, function(n, i) {
								// Skip br element
								if (i)
									e.appendChild(n);
							});
						}
					};

					// IE has a serious bug when it comes to paragraphs it can produce an invalid
					// DOM tree if contents like this <p><ul><li>Item 1</li></ul></p> is inserted
					// It seems to be that IE doesn't like a root block element placed inside another root block element
					if (t.settings.fix_ie_paragraphs)
						h = h.replace(/<p><\/p>|<p([^>]+)><\/p>|<p[^\/+]\/>/gi, '<p$1 mce_keep="true">&nbsp;</p>');

					set();

					if (t.settings.fix_ie_paragraphs) {
						// Check for odd paragraphs this is a sign of a broken DOM
						nl = e.getElementsByTagName("p");
						for (i = nl.length - 1, x = 0; i >= 0; i--) {
							n = nl[i];

							if (!n.hasChildNodes()) {
								if (!n.mce_keep) {
									x = 1; // Is broken
									break;
								}

								n.removeAttribute('mce_keep');
							}
						}
					}

					// Time to fix the madness IE left us
					if (x) {
						// So if we replace the p elements with divs and mark them and then replace them back to paragraphs
						// after we use innerHTML we can fix the DOM tree
						h = h.replace(/<p ([^>]+)>|<p>/g, '<div $1 mce_tmp="1">');
						h = h.replace(/<\/p>/g, '</div>');

						// Set the new HTML with DIVs
						set();

						// Replace all DIV elements with he mce_tmp attibute back to paragraphs
						// This is needed since IE has a annoying bug see above for details
						// This is a slow process but it has to be done. :(
						if (t.settings.fix_ie_paragraphs) {
							nl = e.getElementsByTagName("DIV");
							for (i = nl.length - 1; i >= 0; i--) {
								n = nl[i];

								// Is it a temp div
								if (n.mce_tmp) {
									// Create new paragraph
									p = t.doc.createElement('p');

									// Copy all attributes
									n.cloneNode(false).outerHTML.replace(/([a-z0-9\-_]+)=/gi, function(a, b) {
										var v;

										if (b !== 'mce_tmp') {
											v = n.getAttribute(b);

											if (!v && b === 'class')
												v = n.className;

											p.setAttribute(b, v);
										}
									});

									// Append all children to new paragraph
									for (x = 0; x<n.childNodes.length; x++)
										p.appendChild(n.childNodes[x].cloneNode(true));

									// Replace div with new paragraph
									n.swapNode(p);
								}
							}
						}
					}
				} else
					e.innerHTML = h;

				return h;
			});
		},

		processHTML : function(h) {
			var t = this, s = t.settings;

			if (!s.process_html)
				return h;

			// Convert strong and em to b and i in FF since it can't handle them
			if (tinymce.isGecko) {
				h = h.replace(/<(\/?)strong>|<strong( [^>]+)>/gi, '<$1b$2>');
				h = h.replace(/<(\/?)em>|<em( [^>]+)>/gi, '<$1i$2>');
			} else if (isIE) {
				h = h.replace(/&apos;/g, '&#39;'); // IE can't handle apos
				h = h.replace(/\s+(disabled|checked|readonly|selected)\s*=\s*[\"\']?(false|0)[\"\']?/gi, ''); // IE doesn't handle default values correct
			}

			// Fix some issues
			h = h.replace(/<a( )([^>]+)\/>|<a\/>/gi, '<a$1$2></a>'); // Force open

			// Store away src and href in mce_src and mce_href since browsers mess them up
			if (s.keep_values) {
				// Wrap scripts and styles in comments for serialization purposes
				if (/<script|noscript|style/.test(h)) {
					function trim(s) {
						// Remove prefix and suffix code for element
						s = s.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n');
						s = s.replace(/^[\r\n]*|[\r\n]*$/g, '');
						s = s.replace(/^\s*(\/\/\s*<!--|\/\/\s*<!\[CDATA\[|<!--|<!\[CDATA\[)[\r\n]*/g, '');
						s = s.replace(/\s*(\/\/\s*\]\]>|\/\/\s*-->|\]\]>|-->|\]\]-->)\s*$/g, '');

						return s;
					};

					// Wrap the script contents in CDATA and keep them from executing
					h = h.replace(/<script([^>]+|)>([\s\S]*?)<\/script>/g, function(v, attribs, text) {
						// Force type attribute
						if (!attribs)
							attribs = ' type="text/javascript"';

						// Prefix script type/language attribute values with mce- to prevent it from executing
						attribs = attribs.replace(/(type|language)=\"?/, '$&mce-');
						attribs = attribs.replace(/src=\"([^\"]+)\"?/, function(a, url) {
							if (s.url_converter)
								url = t.encode(s.url_converter.call(s.url_converter_scope || t, t.decode(url), 'src', 'script'));

							return 'mce_src="' + url + '"';
						});

						// Wrap text contents
						if (tinymce.trim(text))
							text = '<!--\n' + trim(text) + '\n// -->';

						return '<mce:script' + attribs + '>' + text + '</mce:script>';
					});

					// Wrap style elements
					h = h.replace(/<style([^>]+|)>([\s\S]*?)<\/style>/g, function(v, attribs, text) {
						// Wrap text contents
						if (text)
							text = '<!--\n' + trim(text) + '\n-->';

						return '<mce:style' + attribs + '>' + text + '</mce:style><style ' + attribs + ' mce_bogus="1">' + text + '</style>';
					});

					// Wrap noscript elements
					h = h.replace(/<noscript([^>]+|)>([\s\S]*?)<\/noscript>/g, function(v, attribs, text) {
						return '<mce:noscript' + attribs + '><!--' + t.encode(text).replace(/--/g, '&#45;&#45;') + '--></mce:noscript>';
					});
				}

				h = h.replace(/<!\[CDATA\[([\s\S]+)\]\]>/g, '<!--[CDATA[$1]]-->');

				// Process all tags with src, href or style
				h = h.replace(/<([\w:]+) [^>]*(src|href|style|shape|coords)[^>]*>/gi, function(a, n) {
					function handle(m, b, c) {
						var u = c;

						// Tag already got a mce_ version
						if (a.indexOf('mce_' + b) != -1)
							return m;

						if (b == 'style') {
							// No mce_style for elements with these since they might get resized by the user
							if (t._isRes(c))
								return m;

							if (s.hex_colors) {
								u = u.replace(/rgb\([^\)]+\)/g, function(v) {
									return t.toHex(v);
								});
							}

							if (s.url_converter) {
								u = u.replace(/url\([\'\"]?([^\)\'\"]+)\)/g, function(x, c) {
									return 'url(' + t.encode(s.url_converter.call(s.url_converter_scope || t, t.decode(c), b, n)) + ')';
								});
							}
						} else if (b != 'coords' && b != 'shape') {
							if (s.url_converter)
								u = t.encode(s.url_converter.call(s.url_converter_scope || t, t.decode(c), b, n));
						}

						return ' ' + b + '="' + c + '" mce_' + b + '="' + u + '"';
					};

					a = a.replace(/ (src|href|style|coords|shape)=[\"]([^\"]+)[\"]/gi, handle); // W3C
					a = a.replace(/ (src|href|style|coords|shape)=[\']([^\']+)[\']/gi, handle); // W3C

					return a.replace(/ (src|href|style|coords|shape)=([^\s\"\'>]+)/gi, handle); // IE
				});
			}

			return h;
		},

		getOuterHTML : function(e) {
			var d;

			e = this.get(e);

			if (!e)
				return null;

			if (e.outerHTML !== undefined)
				return e.outerHTML;

			d = (e.ownerDocument || this.doc).createElement("body");
			d.appendChild(e.cloneNode(true));

			return d.innerHTML;
		},

		setOuterHTML : function(e, h, d) {
			var t = this;

			return this.run(e, function(e) {
				var n, tp;

				e = t.get(e);
				d = d || e.ownerDocument || t.doc;

				if (isIE && e.nodeType == 1)
					e.outerHTML = h;
				else {
					tp = d.createElement("body");
					tp.innerHTML = h;

					n = tp.lastChild;
					while (n) {
						t.insertAfter(n.cloneNode(true), e);
						n = n.previousSibling;
					}

					t.remove(e);
				}
			});
		},

		decode : function(s) {
			var e, n, v;

			// Look for entities to decode
			if (/&[^;]+;/.test(s)) {
				// Decode the entities using a div element not super efficient but less code
				e = this.doc.createElement("div");
				e.innerHTML = s;
				n = e.firstChild;
				v = '';

				if (n) {
					do {
						v += n.nodeValue;
					} while (n.nextSibling);
				}

				return v || s;
			}

			return s;
		},

		encode : function(s) {
			return s ? ('' + s).replace(/[<>&\"]/g, function (c, b) {
				switch (c) {
					case '&':
						return '&amp;';

					case '"':
						return '&quot;';

					case '<':
						return '&lt;';

					case '>':
						return '&gt;';
				}

				return c;
			}) : s;
		},

		insertAfter : function(n, r) {
			var t = this;

			r = t.get(r);

			return this.run(n, function(n) {
				var p, ns;

				p = r.parentNode;
				ns = r.nextSibling;

				if (ns)
					p.insertBefore(n, ns);
				else
					p.appendChild(n);

				return n;
			});
		},

		isBlock : function(n) {
			if (n.nodeType && n.nodeType !== 1)
				return false;

			n = n.nodeName || n;

			return /^(H[1-6]|HR|P|DIV|ADDRESS|PRE|FORM|TABLE|LI|OL|UL|TR|TD|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|NOSCRIPT|NOFRAMES|MENU|ISINDEX|SAMP)$/.test(n);
		},

		replace : function(n, o, k) {
			var t = this;

			if (is(o, 'array'))
				n = n.cloneNode(true);

			return t.run(o, function(o) {
				if (k) {
					each(o.childNodes, function(c) {
						n.appendChild(c.cloneNode(true));
					});
				}

				// Fix IE psuedo leak for elements since replacing elements if fairly common
				// Will break parentNode for some unknown reason
				if (t.fixPsuedoLeaks && o.nodeType === 1) {
					o.parentNode.insertBefore(n, o);
					t.remove(o);
					return n;
				}

				return o.parentNode.replaceChild(n, o);
			});
		},

		findCommonAncestor : function(a, b) {
			var ps = a, pe;

			while (ps) {
				pe = b;

				while (pe && ps != pe)
					pe = pe.parentNode;

				if (ps == pe)
					break;

				ps = ps.parentNode;
			}

			if (!ps && a.ownerDocument)
				return a.ownerDocument.documentElement;

			return ps;
		},

		toHex : function(s) {
			var c = /^\s*rgb\s*?\(\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?\)\s*$/i.exec(s);

			function hex(s) {
				s = parseInt(s).toString(16);

				return s.length > 1 ? s : '0' + s; // 0 -> 00
			};

			if (c) {
				s = '#' + hex(c[1]) + hex(c[2]) + hex(c[3]);

				return s;
			}

			return s;
		},

		getClasses : function() {
			var t = this, cl = [], i, lo = {}, f = t.settings.class_filter, ov;

			if (t.classes)
				return t.classes;

			function addClasses(s) {
				// IE style imports
				each(s.imports, function(r) {
					addClasses(r);
				});

				each(s.cssRules || s.rules, function(r) {
					// Real type or fake it on IE
					switch (r.type || 1) {
						// Rule
						case 1:
							if (r.selectorText) {
								each(r.selectorText.split(','), function(v) {
									v = v.replace(/^\s*|\s*$|^\s\./g, "");

									// Is internal or it doesn't contain a class
									if (/\.mce/.test(v) || !/\.[\w\-]+$/.test(v))
										return;

									// Remove everything but class name
									ov = v;
									v = v.replace(/.*\.([a-z0-9_\-]+).*/i, '$1');

									// Filter classes
									if (f && !(v = f(v, ov)))
										return;

									if (!lo[v]) {
										cl.push({'class' : v});
										lo[v] = 1;
									}
								});
							}
							break;

						// Import
						case 3:
							addClasses(r.styleSheet);
							break;
					}
				});
			};

			try {
				each(t.doc.styleSheets, addClasses);
			} catch (ex) {
				// Ignore
			}

			if (cl.length > 0)
				t.classes = cl;

			return cl;
		},

		run : function(e, f, s) {
			var t = this, o;

			if (t.doc && typeof(e) === 'string')
				e = t.get(e);

			if (!e)
				return false;

			s = s || this;
			if (!e.nodeType && (e.length || e.length === 0)) {
				o = [];

				each(e, function(e, i) {
					if (e) {
						if (typeof(e) == 'string')
							e = t.doc.getElementById(e);

						o.push(f.call(s, e, i));
					}
				});

				return o;
			}

			return f.call(s, e);
		},

		getAttribs : function(n) {
			var o;

			n = this.get(n);

			if (!n)
				return [];

			if (isIE) {
				o = [];

				// Object will throw exception in IE
				if (n.nodeName == 'OBJECT')
					return n.attributes;

				// It's crazy that this is faster in IE but it's because it returns all attributes all the time
				n.cloneNode(false).outerHTML.replace(/([a-z0-9\:\-_]+)=/gi, function(a, b) {
					o.push({specified : 1, nodeName : b});
				});

				return o;
			}

			return n.attributes;
		},

		destroy : function(s) {
			var t = this;

			if (t.events)
				t.events.destroy();

			t.win = t.doc = t.root = t.events = null;

			// Manual destroy then remove unload handler
			if (!s)
				tinymce.removeUnload(t.destroy);
		},

		createRng : function() {
			var d = this.doc;

			return d.createRange ? d.createRange() : new tinymce.dom.Range(this);
		},

		split : function(pe, e, re) {
			var t = this, r = t.createRng(), bef, aft, pa;

			// W3C valid browsers tend to leave empty nodes to the left/right side of the contents, this makes sence
			// but we don't want that in our code since it serves no purpose
			// For example if this is chopped:
			//   <p>text 1<span><b>CHOP</b></span>text 2</p>
			// would produce:
			//   <p>text 1<span></span></p><b>CHOP</b><p><span></span>text 2</p>
			// this function will then trim of empty edges and produce:
			//   <p>text 1</p><b>CHOP</b><p>text 2</p>
			function trimEdge(n, na) {
				n = n[na];

				if (n && n[na] && n[na].nodeType == 1 && isEmpty(n[na]))
					t.remove(n[na]);
			};

			function isEmpty(n) {
				n = t.getOuterHTML(n);
				n = n.replace(/<(img|hr|table)/gi, '-'); // Keep these convert them to - chars
				n = n.replace(/<[^>]+>/g, ''); // Remove all tags

				return n.replace(/[ \t\r\n]+|&nbsp;|&#160;/g, '') == '';
			};

			if (pe && e) {
				// Get before chunk
				r.setStartBefore(pe);
				r.setEndBefore(e);
				bef = r.extractContents();

				// Get after chunk
				r = t.createRng();
				r.setStartAfter(e);
				r.setEndAfter(pe);
				aft = r.extractContents();

				// Insert chunks and remove parent
				pa = pe.parentNode;

				// Remove right side edge of the before contents
				trimEdge(bef, 'lastChild');

				if (!isEmpty(bef))
					pa.insertBefore(bef, pe);

				if (re)
					pa.replaceChild(re, e);
				else
					pa.insertBefore(e, pe);

				// Remove left site edge of the after contents
				trimEdge(aft, 'firstChild');

				if (!isEmpty(aft))
					pa.insertBefore(aft, pe);

				t.remove(pe);

				return re || e;
			}
		},

		bind : function(target, name, func, scope) {
			var t = this;

			if (!t.events)
				t.events = new tinymce.dom.EventUtils();

			return t.events.add(target, name, func, scope || this);
		},

		unbind : function(target, name, func) {
			var t = this;

			if (!t.events)
				t.events = new tinymce.dom.EventUtils();

			return t.events.remove(target, name, func);
		},


		_isRes : function(c) {
			// Is live resizble element
			return /^(top|left|bottom|right|width|height)/i.test(c) || /;\s*(top|left|bottom|right|width|height)/i.test(c);
		}

		/*
		walk : function(n, f, s) {
			var d = this.doc, w;

			if (d.createTreeWalker) {
				w = d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);

				while ((n = w.nextNode()) != null)
					f.call(s || this, n);
			} else
				tinymce.walk(n, f, 'childNodes', s);
		}
		*/

		/*
		toRGB : function(s) {
			var c = /^\s*?#([0-9A-F]{2})([0-9A-F]{1,2})([0-9A-F]{2})?\s*?$/.exec(s);

			if (c) {
				// #FFF -> #FFFFFF
				if (!is(c[3]))
					c[3] = c[2] = c[1];

				return "rgb(" + parseInt(c[1], 16) + "," + parseInt(c[2], 16) + "," + parseInt(c[3], 16) + ")";
			}

			return s;
		}
		*/

		});

	// Setup page DOM
	tinymce.DOM = new tinymce.dom.DOMUtils(document, {process_html : 0});
})(tinymce);
(function(ns) {
	// Traverse constants
	var EXTRACT = 0, CLONE = 1, DELETE = 2, extend = tinymce.extend;

	function indexOf(child, parent) {
		var i, node;

		if (child.parentNode != parent)
			return -1;

		for (node = parent.firstChild, i = 0; node != child; node = node.nextSibling)
			i++;

		return i;
	};

	function nodeIndex(n) {
		var i = 0;

		while (n.previousSibling) {
			i++;
			n = n.previousSibling;
		}

		return i;
	};

	function getSelectedNode(container, offset) {
		var child;

		if (container.nodeType == 3 /* TEXT_NODE */)
			return container;

		if (offset < 0)
			return container;

		child = container.firstChild;
		while (child != null && offset > 0) {
			--offset;
			child = child.nextSibling;
		}

		if (child != null)
			return child;

		return container;
	};

	// Range constructor
	function Range(dom) {
		var d = dom.doc;

		extend(this, {
			dom : dom,

			// Inital states
			startContainer : d,
			startOffset : 0,
			endContainer : d,
			endOffset : 0,
			collapsed : true,
			commonAncestorContainer : d,

			// Range constants
			START_TO_START : 0,
			START_TO_END : 1,
			END_TO_END : 2,
			END_TO_START : 3
		});
	};

	// Add range methods
	extend(Range.prototype, {
		setStart : function(n, o) {
			this._setEndPoint(true, n, o);
		},

		setEnd : function(n, o) {
			this._setEndPoint(false, n, o);
		},

		setStartBefore : function(n) {
			this.setStart(n.parentNode, nodeIndex(n));
		},

		setStartAfter : function(n) {
			this.setStart(n.parentNode, nodeIndex(n) + 1);
		},

		setEndBefore : function(n) {
			this.setEnd(n.parentNode, nodeIndex(n));
		},

		setEndAfter : function(n) {
			this.setEnd(n.parentNode, nodeIndex(n) + 1);
		},

		collapse : function(ts) {
			var t = this;

			if (ts) {
				t.endContainer = t.startContainer;
				t.endOffset = t.startOffset;
			} else {
				t.startContainer = t.endContainer;
				t.startOffset = t.endOffset;
			}

			t.collapsed = true;
		},

		selectNode : function(n) {
			this.setStartBefore(n);
			this.setEndAfter(n);
		},

		selectNodeContents : function(n) {
			this.setStart(n, 0);
			this.setEnd(n, n.nodeType === 1 ? n.childNodes.length : n.nodeValue.length);
		},

		compareBoundaryPoints : function(h, r) {
			var t = this, sc = t.startContainer, so = t.startOffset, ec = t.endContainer, eo = t.endOffset;

			// Check START_TO_START
			if (h === 0)
				return t._compareBoundaryPoints(sc, so, sc, so);

			// Check START_TO_END
			if (h === 1)
				return t._compareBoundaryPoints(sc, so, ec, eo);

			// Check END_TO_END
			if (h === 2)
				return t._compareBoundaryPoints(ec, eo, ec, eo);

			// Check END_TO_START
			if (h === 3)
				return t._compareBoundaryPoints(ec, eo, sc, so);
		},

		deleteContents : function() {
			this._traverse(DELETE);
		},

		extractContents : function() {
			return this._traverse(EXTRACT);
		},

		cloneContents : function() {
			return this._traverse(CLONE);
		},

		insertNode : function(n) {
			var t = this, nn, o;

			// Node is TEXT_NODE or CDATA
			if (n.nodeType === 3 || n.nodeType === 4) {
				nn = t.startContainer.splitText(t.startOffset);
				t.startContainer.parentNode.insertBefore(n, nn);
			} else {
				// Insert element node
				if (t.startContainer.childNodes.length > 0)
					o = t.startContainer.childNodes[t.startOffset];

				t.startContainer.insertBefore(n, o);
			}
		},

		surroundContents : function(n) {
			var t = this, f = t.extractContents();

			t.insertNode(n);
			n.appendChild(f);
			t.selectNode(n);
		},

		cloneRange : function() {
			var t = this;

			return extend(new Range(t.dom), {
				startContainer : t.startContainer,
				startOffset : t.startOffset,
				endContainer : t.endContainer,
				endOffset : t.endOffset,
				collapsed : t.collapsed,
				commonAncestorContainer : t.commonAncestorContainer
			});
		},

/*
		detach : function() {
			// Not implemented
		},
*/
		// Internal methods

		_isCollapsed : function() {
			return (this.startContainer == this.endContainer && this.startOffset == this.endOffset);
		},

		_compareBoundaryPoints : function (containerA, offsetA, containerB, offsetB) {
			var c, offsetC, n, cmnRoot, childA, childB;

			// In the first case the boundary-points have the same container. A is before B 
			// if its offset is less than the offset of B, A is equal to B if its offset is 
			// equal to the offset of B, and A is after B if its offset is greater than the 
			// offset of B.
			if (containerA == containerB) {
				if (offsetA == offsetB) {
					return 0; // equal
				} else if (offsetA < offsetB) {
					return -1; // before
				} else {
					return 1; // after
				}
			}

			// In the second case a child node C of the container of A is an ancestor 
			// container of B. In this case, A is before B if the offset of A is less than or 
			// equal to the index of the child node C and A is after B otherwise.
			c = containerB;
			while (c && c.parentNode != containerA) {
				c = c.parentNode;
			}
			if (c) {
				offsetC = 0;
				n = containerA.firstChild;

				while (n != c && offsetC < offsetA) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetA <= offsetC) {
					return -1; // before
				} else {
					return 1; // after
				}
			}

			// In the third case a child node C of the container of B is an ancestor container 
			// of A. In this case, A is before B if the index of the child node C is less than 
			// the offset of B and A is after B otherwise.
			c = containerA;
			while (c && c.parentNode != containerB) {
				c = c.parentNode;
			}

			if (c) {
				offsetC = 0;
				n = containerB.firstChild;

				while (n != c && offsetC < offsetB) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetC < offsetB) {
					return -1; // before
				} else {
					return 1; // after
				}
			}

			// In the fourth case, none of three other cases hold: the containers of A and B 
			// are siblings or descendants of sibling nodes. In this case, A is before B if 
			// the container of A is before the container of B in a pre-order traversal of the
			// Ranges' context tree and A is after B otherwise.
			cmnRoot = this.dom.findCommonAncestor(containerA, containerB);
			childA = containerA;

			while (childA && childA.parentNode != cmnRoot) {
				childA = childA.parentNode;  
			}

			if (!childA) {
				childA = cmnRoot;
			}

			childB = containerB;
			while (childB && childB.parentNode != cmnRoot) {
				childB = childB.parentNode;
			}

			if (!childB) {
				childB = cmnRoot;
			}

			if (childA == childB) {
				return 0; // equal
			}

			n = cmnRoot.firstChild;
			while (n) {
				if (n == childA) {
					return -1; // before
				}

				if (n == childB) {
					return 1; // after
				}

				n = n.nextSibling;
			}
		},

		_setEndPoint : function(st, n, o) {
			var t = this, ec, sc;

			if (st) {
				t.startContainer = n;
				t.startOffset = o;
			} else {
				t.endContainer = n;
				t.endOffset = o;
			}

			// If one boundary-point of a Range is set to have a root container 
			// other than the current one for the Range, the Range is collapsed to 
			// the new position. This enforces the restriction that both boundary-
			// points of a Range must have the same root container.
			ec = t.endContainer;
			while (ec.parentNode)
				ec = ec.parentNode;

			sc = t.startContainer;
			while (sc.parentNode)
				sc = sc.parentNode;

			if (sc != ec) {
				t.collapse(st);
			} else {
				// The start position of a Range is guaranteed to never be after the 
				// end position. To enforce this restriction, if the start is set to 
				// be at a position after the end, the Range is collapsed to that 
				// position.
				if (t._compareBoundaryPoints(t.startContainer, t.startOffset, t.endContainer, t.endOffset) > 0)
					t.collapse(st);
			}

			t.collapsed = t._isCollapsed();
			t.commonAncestorContainer = t.dom.findCommonAncestor(t.startContainer, t.endContainer);
		},

		// This code is heavily "inspired" by the Apache Xerces implementation. I hope they don't mind. :)

		_traverse : function(how) {
			var t = this, c, endContainerDepth = 0, startContainerDepth = 0, p, depthDiff, startNode, endNode, sp, ep;

			if (t.startContainer == t.endContainer)
				return t._traverseSameContainer(how);

			for (c = t.endContainer, p = c.parentNode; p != null; c = p, p = p.parentNode) {
				if (p == t.startContainer)
					return t._traverseCommonStartContainer(c, how);

				++endContainerDepth;
			}

			for (c = t.startContainer, p = c.parentNode; p != null; c = p, p = p.parentNode) {
				if (p == t.endContainer)
					return t._traverseCommonEndContainer(c, how);

				++startContainerDepth;
			}

			depthDiff = startContainerDepth - endContainerDepth;

			startNode = t.startContainer;
			while (depthDiff > 0) {
				startNode = startNode.parentNode;
				depthDiff--;
			}

			endNode = t.endContainer;
			while (depthDiff < 0) {
				endNode = endNode.parentNode;
				depthDiff++;
			}

			// ascend the ancestor hierarchy until we have a common parent.
			for (sp = startNode.parentNode, ep = endNode.parentNode; sp != ep; sp = sp.parentNode, ep = ep.parentNode) {
				startNode = sp;
				endNode = ep;
			}

			return t._traverseCommonAncestors(startNode, endNode, how);
		},

		_traverseSameContainer : function(how) {
			var t = this, frag, s, sub, n, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = t.dom.doc.createDocumentFragment();

			// If selection is empty, just return the fragment
			if (t.startOffset == t.endOffset)
				return frag;

			// Text node needs special case handling
			if (t.startContainer.nodeType == 3 /* TEXT_NODE */) {
				// get the substring
				s = t.startContainer.nodeValue;
				sub = s.substring(t.startOffset, t.endOffset);

				// set the original text node to its new value
				if (how != CLONE) {
					t.startContainer.deleteData(t.startOffset, t.endOffset - t.startOffset);

					// Nothing is partially selected, so collapse to start point
					t.collapse(true);
				}

				if (how == DELETE)
					return null;

				frag.appendChild(t.dom.doc.createTextNode(sub));
				return frag;
			}

			// Copy nodes between the start/end offsets.
			n = getSelectedNode(t.startContainer, t.startOffset);
			cnt = t.endOffset - t.startOffset;

			while (cnt > 0) {
				sibling = n.nextSibling;
				xferNode = t._traverseFullySelected(n, how);

				if (frag)
					frag.appendChild( xferNode );

				--cnt;
				n = sibling;
			}

			// Nothing is partially selected, so collapse to start point
			if (how != CLONE)
				t.collapse(true);

			return frag;
		},

		_traverseCommonStartContainer : function(endAncestor, how) {
			var t = this, frag, n, endIdx, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = t.dom.doc.createDocumentFragment();

			n = t._traverseRightBoundary(endAncestor, how);

			if (frag)
				frag.appendChild(n);

			endIdx = indexOf(endAncestor, t.startContainer);
			cnt = endIdx - t.startOffset;

			if (cnt <= 0) {
				// Collapse to just before the endAncestor, which 
				// is partially selected.
				if (how != CLONE) {
					t.setEndBefore(endAncestor);
					t.collapse(false);
				}

				return frag;
			}

			n = endAncestor.previousSibling;
			while (cnt > 0) {
				sibling = n.previousSibling;
				xferNode = t._traverseFullySelected(n, how);

				if (frag)
					frag.insertBefore(xferNode, frag.firstChild);

				--cnt;
				n = sibling;
			}

			// Collapse to just before the endAncestor, which 
			// is partially selected.
			if (how != CLONE) {
				t.setEndBefore(endAncestor);
				t.collapse(false);
			}

			return frag;
		},

		_traverseCommonEndContainer : function(startAncestor, how) {
			var t = this, frag, startIdx, n, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = t.dom.doc.createDocumentFragment();

			n = t._traverseLeftBoundary(startAncestor, how);
			if (frag)
				frag.appendChild(n);

			startIdx = indexOf(startAncestor, t.endContainer);
			++startIdx;  // Because we already traversed it....

			cnt = t.endOffset - startIdx;
			n = startAncestor.nextSibling;
			while (cnt > 0) {
				sibling = n.nextSibling;
				xferNode = t._traverseFullySelected(n, how);

				if (frag)
					frag.appendChild(xferNode);

				--cnt;
				n = sibling;
			}

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(true);
			}

			return frag;
		},

		_traverseCommonAncestors : function(startAncestor, endAncestor, how) {
			var t = this, n, frag, commonParent, startOffset, endOffset, cnt, sibling, nextSibling;

			if (how != DELETE)
				frag = t.dom.doc.createDocumentFragment();

			n = t._traverseLeftBoundary(startAncestor, how);
			if (frag)
				frag.appendChild(n);

			commonParent = startAncestor.parentNode;
			startOffset = indexOf(startAncestor, commonParent);
			endOffset = indexOf(endAncestor, commonParent);
			++startOffset;

			cnt = endOffset - startOffset;
			sibling = startAncestor.nextSibling;

			while (cnt > 0) {
				nextSibling = sibling.nextSibling;
				n = t._traverseFullySelected(sibling, how);

				if (frag)
					frag.appendChild(n);

				sibling = nextSibling;
				--cnt;
			}

			n = t._traverseRightBoundary(endAncestor, how);

			if (frag)
				frag.appendChild(n);

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(true);
			}

			return frag;
		},

		_traverseRightBoundary : function(root, how) {
			var t = this, next = getSelectedNode(t.endContainer, t.endOffset - 1), parent, clonedParent, prevSibling, clonedChild, clonedGrandParent;
			var isFullySelected = next != t.endContainer;

			if (next == root)
				return t._traverseNode(next, isFullySelected, false, how);

			parent = next.parentNode;
			clonedParent = t._traverseNode(parent, false, false, how);

			while (parent != null) {
				while (next != null) {
					prevSibling = next.previousSibling;
					clonedChild = t._traverseNode(next, isFullySelected, false, how);

					if (how != DELETE)
						clonedParent.insertBefore(clonedChild, clonedParent.firstChild);

					isFullySelected = true;
					next = prevSibling;
				}

				if (parent == root)
					return clonedParent;

				next = parent.previousSibling;
				parent = parent.parentNode;

				clonedGrandParent = t._traverseNode(parent, false, false, how);

				if (how != DELETE)
					clonedGrandParent.appendChild(clonedParent);

				clonedParent = clonedGrandParent;
			}

			// should never occur
			return null;
		},

		_traverseLeftBoundary : function(root, how) {
			var t = this, next = getSelectedNode(t.startContainer, t.startOffset);
			var isFullySelected = next != t.startContainer, parent, clonedParent, nextSibling, clonedChild, clonedGrandParent;

			if (next == root)
				return t._traverseNode(next, isFullySelected, true, how);

			parent = next.parentNode;
			clonedParent = t._traverseNode(parent, false, true, how);

			while (parent != null) {
				while (next != null) {
					nextSibling = next.nextSibling;
					clonedChild = t._traverseNode(next, isFullySelected, true, how);

					if (how != DELETE)
						clonedParent.appendChild(clonedChild);

					isFullySelected = true;
					next = nextSibling;
				}

				if (parent == root)
					return clonedParent;

				next = parent.nextSibling;
				parent = parent.parentNode;

				clonedGrandParent = t._traverseNode(parent, false, true, how);

				if (how != DELETE)
					clonedGrandParent.appendChild(clonedParent);

				clonedParent = clonedGrandParent;
			}

			// should never occur
			return null;
		},

		_traverseNode : function(n, isFullySelected, isLeft, how) {
			var t = this, txtValue, newNodeValue, oldNodeValue, offset, newNode;

			if (isFullySelected)
				return t._traverseFullySelected(n, how);

			if (n.nodeType == 3 /* TEXT_NODE */) {
				txtValue = n.nodeValue;

				if (isLeft) {
					offset = t.startOffset;
					newNodeValue = txtValue.substring(offset);
					oldNodeValue = txtValue.substring(0, offset);
				} else {
					offset = t.endOffset;
					newNodeValue = txtValue.substring(0, offset);
					oldNodeValue = txtValue.substring(offset);
				}

				if (how != CLONE)
					n.nodeValue = oldNodeValue;

				if (how == DELETE)
					return null;

				newNode = n.cloneNode(false);
				newNode.nodeValue = newNodeValue;

				return newNode;
			}

			if (how == DELETE)
				return null;

			return n.cloneNode(false);
		},

		_traverseFullySelected : function(n, how) {
			var t = this;

			if (how != DELETE)
				return how == CLONE ? n.cloneNode(true) : n;

			n.parentNode.removeChild(n);
			return null;
		}
	});

	ns.Range = Range;
})(tinymce.dom);
(function() {
	function Selection(selection) {
		var t = this, invisibleChar = '\uFEFF', range, lastIERng;

		function compareRanges(rng1, rng2) {
			if (rng1 && rng2) {
				// Both are control ranges and the selected element matches
				if (rng1.item && rng2.item && rng1.item(0) === rng2.item(0))
					return 1;

				// Both are text ranges and the range matches
				if (rng1.isEqual && rng2.isEqual && rng2.isEqual(rng1))
					return 1;
			}

			return 0;
		};

		function getRange() {
			var dom = selection.dom, ieRange = selection.getRng(), domRange = dom.createRng(), startPos, endPos, element, sc, ec, collapsed;

			function findIndex(element) {
				var nl = element.parentNode.childNodes, i;

				for (i = nl.length - 1; i >= 0; i--) {
					if (nl[i] == element)
						return i;
				}

				return -1;
			};

			function findEndPoint(start) {
				var rng = ieRange.duplicate(), parent, i, nl, n, offset = 0, index = 0, pos, tmpRng;

				// Insert marker character
				rng.collapse(start);
				parent = rng.parentElement();
				rng.pasteHTML(invisibleChar); // Needs to be a pasteHTML instead of .text = since IE has a bug with nodeValue

				// Find marker character
				nl = parent.childNodes;
				for (i = 0; i < nl.length; i++) {
					n = nl[i];

					// Calculate node index excluding text node fragmentation
					if (i > 0 && (n.nodeType !== 3 || nl[i - 1].nodeType !== 3))
						index++;

					// If text node then calculate offset
					if (n.nodeType === 3) {
						// Look for marker
						pos = n.nodeValue.indexOf(invisibleChar);
						if (pos !== -1) {
							offset += pos;
							break;
						}

						offset += n.nodeValue.length;
					} else
						offset = 0;
				}

				// Remove marker character
				rng.moveStart('character', -1);
				rng.text = '';

				return {index : index, offset : offset, parent : parent};
			};

			// If selection is outside the current document just return an empty range
			element = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
			if (element.ownerDocument != dom.doc)
				return domRange;

			// Handle control selection or text selection of a image
			if (ieRange.item || !element.hasChildNodes()) {
				domRange.setStart(element.parentNode, findIndex(element));
				domRange.setEnd(domRange.startContainer, domRange.startOffset + 1);

				return domRange;
			}

			// Check collapsed state
			collapsed = selection.isCollapsed();

			// Find start and end pos index and offset
			startPos = findEndPoint(true);
			endPos = findEndPoint(false);

			// Normalize the elements to avoid fragmented dom
			startPos.parent.normalize();
			endPos.parent.normalize();

			// Set start container and offset
			sc = startPos.parent.childNodes[Math.min(startPos.index, startPos.parent.childNodes.length - 1)];

			if (sc.nodeType != 3)
				domRange.setStart(startPos.parent, startPos.index);
			else
				domRange.setStart(startPos.parent.childNodes[startPos.index], startPos.offset);

			// Set end container and offset
			ec = endPos.parent.childNodes[Math.min(endPos.index, endPos.parent.childNodes.length - 1)];

			if (ec.nodeType != 3) {
				if (!collapsed)
					endPos.index++;

				domRange.setEnd(endPos.parent, endPos.index);
			} else
				domRange.setEnd(endPos.parent.childNodes[endPos.index], endPos.offset);

			// If not collapsed then make sure offsets are valid
			if (!collapsed) {
				sc = domRange.startContainer;
				if (sc.nodeType == 1)
					domRange.setStart(sc, Math.min(domRange.startOffset, sc.childNodes.length));

				ec = domRange.endContainer;
				if (ec.nodeType == 1)
					domRange.setEnd(ec, Math.min(domRange.endOffset, ec.childNodes.length));
			}

			// Restore selection to new range
			t.addRange(domRange);

			return domRange;
		};

		this.addRange = function(rng) {
			var ieRng, body = selection.dom.doc.body, startPos, endPos, sc, so, ec, eo;

			// Setup some shorter versions
			sc = rng.startContainer;
			so = rng.startOffset;
			ec = rng.endContainer;
			eo = rng.endOffset;
			ieRng = body.createTextRange();

			// Find element
			sc = sc.nodeType == 1 ? sc.childNodes[Math.min(so, sc.childNodes.length - 1)] : sc;
			ec = ec.nodeType == 1 ? ec.childNodes[Math.min(so == eo ? eo : eo - 1, ec.childNodes.length - 1)] : ec;

			// Single element selection
			if (sc == ec && sc.nodeType == 1) {
				// Make control selection for some elements
				if (/^(IMG|TABLE)$/.test(sc.nodeName) && so != eo) {
					ieRng = body.createControlRange();
					ieRng.addElement(sc);
				} else {
					ieRng = body.createTextRange();

					// Padd empty elements with invisible character
					if (!sc.hasChildNodes() && sc.canHaveHTML)
						sc.innerHTML = invisibleChar;

					// Select element contents
					ieRng.moveToElementText(sc);

					// If it's only containing a padding remove it so the caret remains
					if (sc.innerHTML == invisibleChar) {
						ieRng.collapse(true);
						sc.removeChild(sc.firstChild);
					}
				}

				if (so == eo)
					ieRng.collapse(eo <= rng.endContainer.childNodes.length - 1);

				ieRng.select();

				return;
			}

			function getCharPos(container, offset) {
				var nodeVal, rng, pos;

				if (container.nodeType != 3)
					return -1;

				nodeVal = container.nodeValue;
				rng = body.createTextRange();

				// Insert marker at offset position
				container.nodeValue = nodeVal.substring(0, offset) + invisibleChar + nodeVal.substring(offset);

				// Find char pos of marker and remove it
				rng.moveToElementText(container.parentNode);
				rng.findText(invisibleChar);
				pos = Math.abs(rng.moveStart('character', -0xFFFFF));
				container.nodeValue = nodeVal;

				return pos;
			};

			// Collapsed range
			if (rng.collapsed) {
				pos = getCharPos(sc, so);

				ieRng = body.createTextRange();
				ieRng.move('character', pos);
				ieRng.select();

				return;
			} else {
				// If same text container
				if (sc == ec && sc.nodeType == 3) {
					startPos = getCharPos(sc, so);

					ieRng.move('character', startPos);
					ieRng.moveEnd('character', eo - so);
					ieRng.select();

					return;
				}

				// Get caret positions
				startPos = getCharPos(sc, so);
				endPos = getCharPos(ec, eo);
				ieRng = body.createTextRange();

				// Move start of range to start character position or start element
				if (startPos == -1) {
					ieRng.moveToElementText(sc);
					startPos = 0;
				} else
					ieRng.move('character', startPos);

				// Move end of range to end character position or end element
				tmpRng = body.createTextRange();

				if (endPos == -1)
					tmpRng.moveToElementText(ec);
				else
					tmpRng.move('character', endPos);

				ieRng.setEndPoint('EndToEnd', tmpRng);
				ieRng.select();

				return;
			}
		};

		this.getRangeAt = function() {
			// Setup new range if the cache is empty
			if (!range || !compareRanges(lastIERng, selection.getRng())) {
				range = getRange();

				// Store away text range for next call
				lastIERng = selection.getRng();
			}

			// Return cached range
			return range;
		};

		this.destroy = function() {
			// Destroy cached range and last IE range to avoid memory leaks
			lastIERng = range = null;
		};
	};

	// Expose the selection object
	tinymce.dom.TridentSelection = Selection;
})();

/*
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false;

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	var origContext = context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, check, mode, extra, prune = true, contextXML = isXML(context);
	
	// Reset the position of the chunker regexp (start from head)
	chunker.lastIndex = 0;
	
	while ( (m = chunker.exec(selector)) !== null ) {
		parts.push( m[1] );
		
		if ( m[2] ) {
			extra = RegExp.rightContext;
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] )
					selector += parts.shift();

				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			var ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			var ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				var cur = parts.pop(), pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		throw "Syntax error, unrecognized expression: " + (cur || selector);
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = false;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.match[ type ].exec( expr )) ) {
			var left = RegExp.leftContext;

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.match[ type ].exec( expr )) != null ) {
				var filter = Expr.filter[ type ], found, item;
				anyFound = false;

				if ( curLoop == result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr == old ) {
			if ( anyFound == null ) {
				throw "Syntax error, unrecognized expression: " + expr;
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
	},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag && !isXML ) {
				part = part.toUpperCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = isXML ? part : part.toUpperCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( !part.match(/\W/) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !part.match(/\W/) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context, isXML){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0) ) {
						if ( !inplace )
							result.push( elem );
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			for ( var i = 0; curLoop[i] === false; i++ ){}
			return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
		},
		CHILD: function(match){
			if ( match[1] == "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( match[3].match(chunker).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 == i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 == i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while (node = node.previousSibling)  {
						if ( node.nodeType === 1 ) return false;
					}
					if ( type == 'first') return true;
					node = elem;
				case 'last':
					while (node = node.nextSibling)  {
						if ( node.nodeType === 1 ) return false;
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first == 1 && last == 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first == 0 ) {
						return diff == 0;
					} else {
						return ( diff % first == 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value != check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
try {
	Array.prototype.slice.call( document.documentElement.childNodes );

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( !!document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}
})();

if ( document.querySelectorAll ) (function(){
	var oldSizzle = Sizzle, div = document.createElement("div");
	div.innerHTML = "<p class='TEST'></p>";

	// Safari can't handle uppercase or unicode characters when
	// in quirks mode.
	if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
		return;
	}
	
	Sizzle = function(query, context, extra, seed){
		context = context || document;

		// Only use querySelectorAll on non-XML documents
		// (ID selectors don't work in non-HTML documents)
		if ( !seed && context.nodeType === 9 && !isXML(context) ) {
			try {
				return makeArray( context.querySelectorAll(query), extra );
			} catch(e){}
		}
		
		return oldSizzle(query, context, extra, seed);
	};

	for ( var prop in oldSizzle ) {
		Sizzle[ prop ] = oldSizzle[ prop ];
	}
})();

if ( document.getElementsByClassName && document.documentElement.getElementsByClassName ) (function(){
	var div = document.createElement("div");
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	if ( div.getElementsByClassName("e").length === 0 )
		return;

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 )
		return;

	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ){
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ) {
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ?  function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
		!!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

window.tinymce.dom.Sizzle = Sizzle;

})();

(function(tinymce) {
	// Shorten names
	var each = tinymce.each, DOM = tinymce.DOM, isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, Event;

	tinymce.create('tinymce.dom.EventUtils', {
		EventUtils : function() {
			this.inits = [];
			this.events = [];
		},

		add : function(o, n, f, s) {
			var cb, t = this, el = t.events, r;

			if (n instanceof Array) {
				r = [];

				each(n, function(n) {
					r.push(t.add(o, n, f, s));
				});

				return r;
			}

			// Handle array
			if (o && o.hasOwnProperty && o instanceof Array) {
				r = [];

				each(o, function(o) {
					o = DOM.get(o);
					r.push(t.add(o, n, f, s));
				});

				return r;
			}

			o = DOM.get(o);

			if (!o)
				return;

			// Setup event callback
			cb = function(e) {
				// Is all events disabled
				if (t.disabled)
					return;

				e = e || window.event;

				// Patch in target, preventDefault and stopPropagation in IE it's W3C valid
				if (e && isIE) {
					if (!e.target)
						e.target = e.srcElement;

					// Patch in preventDefault, stopPropagation methods for W3C compatibility
					tinymce.extend(e, t._stoppers);
				}

				if (!s)
					return f(e);

				return f.call(s, e);
			};

			if (n == 'unload') {
				tinymce.unloads.unshift({func : cb});
				return cb;
			}

			if (n == 'init') {
				if (t.domLoaded)
					cb();
				else
					t.inits.push(cb);

				return cb;
			}

			// Store away listener reference
			el.push({
				obj : o,
				name : n,
				func : f,
				cfunc : cb,
				scope : s
			});

			t._add(o, n, cb);

			return f;
		},

		remove : function(o, n, f) {
			var t = this, a = t.events, s = false, r;

			// Handle array
			if (o && o.hasOwnProperty && o instanceof Array) {
				r = [];

				each(o, function(o) {
					o = DOM.get(o);
					r.push(t.remove(o, n, f));
				});

				return r;
			}

			o = DOM.get(o);

			each(a, function(e, i) {
				if (e.obj == o && e.name == n && (!f || (e.func == f || e.cfunc == f))) {
					a.splice(i, 1);
					t._remove(o, n, e.cfunc);
					s = true;
					return false;
				}
			});

			return s;
		},

		clear : function(o) {
			var t = this, a = t.events, i, e;

			if (o) {
				o = DOM.get(o);

				for (i = a.length - 1; i >= 0; i--) {
					e = a[i];

					if (e.obj === o) {
						t._remove(e.obj, e.name, e.cfunc);
						e.obj = e.cfunc = null;
						a.splice(i, 1);
					}
				}
			}
		},

		cancel : function(e) {
			if (!e)
				return false;

			this.stop(e);

			return this.prevent(e);
		},

		stop : function(e) {
			if (e.stopPropagation)
				e.stopPropagation();
			else
				e.cancelBubble = true;

			return false;
		},

		prevent : function(e) {
			if (e.preventDefault)
				e.preventDefault();
			else
				e.returnValue = false;

			return false;
		},

		destroy : function() {
			var t = this;

			each(t.events, function(e, i) {
				t._remove(e.obj, e.name, e.cfunc);
				e.obj = e.cfunc = null;
			});

			t.events = [];
			t = null;
		},

		_add : function(o, n, f) {
			if (o.attachEvent)
				o.attachEvent('on' + n, f);
			else if (o.addEventListener)
				o.addEventListener(n, f, false);
			else
				o['on' + n] = f;
		},

		_remove : function(o, n, f) {
			if (o) {
				try {
					if (o.detachEvent)
						o.detachEvent('on' + n, f);
					else if (o.removeEventListener)
						o.removeEventListener(n, f, false);
					else
						o['on' + n] = null;
				} catch (ex) {
					// Might fail with permission denined on IE so we just ignore that
				}
			}
		},

		_pageInit : function(win) {
			AJS.log("Event:_pageInit starting");
			var t = this;

			// Keep it from running more than once
			if (t.domLoaded)
				return;

			t.domLoaded = true;

			each(t.inits, function(c) {
				c();
			});

			t.inits = [];
		},

		_wait : function(win) {
			var t = this, doc = win.document;

			// No need since the document is already loaded
			if (win.tinyMCE_GZ && tinyMCE_GZ.loaded) {
				t.domLoaded = 1;
				return;
			}

			// Use IE method
			if (doc.attachEvent) {
				doc.attachEvent("onreadystatechange", function() {
					if (doc.readyState === "complete") {
						doc.detachEvent("onreadystatechange", arguments.callee);
						t._pageInit(win);
					}
				});

				if (doc.documentElement.doScroll && win == win.top) {
					(function() {
						if (t.domLoaded)
							return;

						try {
							// If IE is used, use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							doc.documentElement.doScroll("left");
						} catch (ex) {
							setTimeout(arguments.callee, 0);
							return;
						}

						t._pageInit(win);
					})();
				}
			} else if (doc.addEventListener) {
				t._add(win, 'DOMContentLoaded', function() {
					t._pageInit(win);
				});
			}

			t._add(win, 'load', function() {
				t._pageInit(win);
			});
		},

		_stoppers : {
			preventDefault :  function() {
				this.returnValue = false;
			},

			stopPropagation : function() {
				this.cancelBubble = true;
			}
		}

		});

	// Shorten name and setup global instance
	Event = tinymce.dom.Event = new tinymce.dom.EventUtils();

	// Dispatch DOM content loaded event for IE and Safari
	Event._wait(window);

	tinymce.addUnload(function() {
		Event.destroy();
	});
})(tinymce);
(function(tinymce) {
	var each = tinymce.each;

	tinymce.create('tinymce.dom.Element', {
		Element : function(id, s) {
			var t = this, dom, el;

			s = s || {};
			t.id = id;
			t.dom = dom = s.dom || tinymce.DOM;
			t.settings = s;

			// Only IE leaks DOM references, this is a lot faster
			if (!tinymce.isIE)
				el = t.dom.get(t.id);

			each([
				'getPos',
				'getRect',
				'getParent',
				'add',
				'setStyle',
				'getStyle',
				'setStyles',
				'setAttrib',
				'setAttribs',
				'getAttrib',
				'addClass',
				'removeClass',
				'hasClass',
				'getOuterHTML',
				'setOuterHTML',
				'remove',
				'show',
				'hide',
				'isHidden',
				'setHTML',
				'get'
			], function(k) {
				t[k] = function() {
					var a = [id], i;

					for (i = 0; i < arguments.length; i++)
						a.push(arguments[i]);

					a = dom[k].apply(dom, a);
					t.update(k);

					return a;
				};
			});
		},

		on : function(n, f, s) {
			return tinymce.dom.Event.add(this.id, n, f, s);
		},

		getXY : function() {
			return {
				x : parseInt(this.getStyle('left')),
				y : parseInt(this.getStyle('top'))
			};
		},

		getSize : function() {
			var n = this.dom.get(this.id);

			return {
				w : parseInt(this.getStyle('width') || n.clientWidth),
				h : parseInt(this.getStyle('height') || n.clientHeight)
			};
		},

		moveTo : function(x, y) {
			this.setStyles({left : x, top : y});
		},

		moveBy : function(x, y) {
			var p = this.getXY();

			this.moveTo(p.x + x, p.y + y);
		},

		resizeTo : function(w, h) {
			this.setStyles({width : w, height : h});
		},

		resizeBy : function(w, h) {
			var s = this.getSize();

			this.resizeTo(s.w + w, s.h + h);
		},

		update : function(k) {
			var t = this, b, dom = t.dom;

			if (tinymce.isIE6 && t.settings.blocker) {
				k = k || '';

				// Ignore getters
				if (k.indexOf('get') === 0 || k.indexOf('has') === 0 || k.indexOf('is') === 0)
					return;

				// Remove blocker on remove
				if (k == 'remove') {
					dom.remove(t.blocker);
					return;
				}

				if (!t.blocker) {
					t.blocker = dom.uniqueId();
					b = dom.add(t.settings.container || dom.getRoot(), 'iframe', {id : t.blocker, style : 'position:absolute;', frameBorder : 0, src : 'javascript:""'});
					dom.setStyle(b, 'opacity', 0);
				} else
					b = dom.get(t.blocker);

				dom.setStyle(b, 'left', t.getStyle('left', 1));
				dom.setStyle(b, 'top', t.getStyle('top', 1));
				dom.setStyle(b, 'width', t.getStyle('width', 1));
				dom.setStyle(b, 'height', t.getStyle('height', 1));
				dom.setStyle(b, 'display', t.getStyle('display', 1));
				dom.setStyle(b, 'zIndex', parseInt(t.getStyle('zIndex', 1) || 0) - 1);
			}
		}

		});
})(tinymce);
(function(tinymce) {
	function trimNl(s) {
		return s.replace(/[\n\r]+/g, '');
	};

	// Shorten names
	var is = tinymce.is, isIE = tinymce.isIE, each = tinymce.each;

    // ATLASSIAN - need to catch elements as well as TextNodes because our insert code might leave the cursor in an
    // element and need to check the bookmark for a test.
	var atlassianNodeFilter = {
        acceptNode: function(node) {
            return (node.nodeType == 1 || node.nodeType == 3) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
    };

	tinymce.create('tinymce.dom.Selection', {
		Selection : function(dom, win, serializer) {
			var t = this;

			t.dom = dom;
			t.win = win;
			t.serializer = serializer;

			// Add events
			each([
				'onBeforeSetContent',
				'onBeforeGetContent',
				'onSetContent',
				'onGetContent'
			], function(e) {
				t[e] = new tinymce.util.Dispatcher(t);
			});

			// No W3C Range support
			if (!t.win.getSelection)
				t.tridentSel = new tinymce.dom.TridentSelection(t);

			// Prevent leaks
			tinymce.addUnload(t.destroy, t);
		},

		getContent : function(s) {
			var t = this, r = t.getRng(), e = t.dom.create("body"), se = t.getSel(), wb, wa, n;

			s = s || {};
			wb = wa = '';
			s.get = true;
			s.format = s.format || 'html';
			t.onBeforeGetContent.dispatch(t, s);

			if (s.format == 'text')
				return t.isCollapsed() ? '' : (r.text || (se.toString ? se.toString() : ''));

			if (r.cloneContents) {
				n = r.cloneContents();

				if (n)
					e.appendChild(n);
			} else if (is(r.item) || is(r.htmlText))
				e.innerHTML = r.item ? r.item(0).outerHTML : r.htmlText;
			else
				e.innerHTML = r.toString();

			// Keep whitespace before and after
			if (/^\s/.test(e.innerHTML))
				wb = ' ';

			if (/\s+$/.test(e.innerHTML))
				wa = ' ';

			s.getInner = true;

			s.content = t.isCollapsed() ? '' : wb + t.serializer.serialize(e, s) + wa;
			t.onGetContent.dispatch(t, s);

			return s.content;
		},

		setContent : function(h, s) {
			var t = this, r = t.getRng(), c, d = t.win.document;

			s = s || {format : 'html'};
			s.set = true;
			h = s.content = t.dom.processHTML(h);

			// Dispatch before set content event
			t.onBeforeSetContent.dispatch(t, s);
			h = s.content;

			if (r.insertNode) {
				// Make caret marker since insertNode places the caret in the beginning of text after insert
				h += '<span id="__caret">_</span>';

				// Delete and insert new node
				r.deleteContents();
				r.insertNode(t.getRng().createContextualFragment(h));

				// Move to caret marker
				c = t.dom.get('__caret');

				// Make sure we wrap it compleatly, Opera fails with a simple select call
				r = d.createRange();
				r.setStartBefore(c);
				r.setEndAfter(c);
				t.setRng(r);

				// Delete the marker, and hopefully the caret gets placed in the right location
				// Removed this since it seems to remove &nbsp; in FF and simply deleting it
				// doesn't seem to affect the caret position in any browser
				//d.execCommand('Delete', false, null);

				// Remove the caret position
				t.dom.remove('__caret');
			} else {
				if (r.item) {
					// Delete content and get caret text selection
					d.execCommand('Delete', false, null);
					r = t.getRng();
				}

				r.pasteHTML(h);
			}

			// Dispatch set content event
			t.onSetContent.dispatch(t, s);
		},

		getStart : function() {
			var t = this, r = t.getRng(), e;

			if (isIE) {
				if (r.item)
					return r.item(0);

				r = r.duplicate();
				r.collapse(1);
				e = r.parentElement();

				if (e && e.nodeName == 'BODY')
					return e.firstChild;

				return e;
			} else {
				e = r.startContainer;

				if (e.nodeName == 'BODY')
					return e.firstChild;

				return t.dom.getParent(e, '*');
			}
		},

		getEnd : function() {
			var t = this, r = t.getRng(), e;

			if (isIE) {
				if (r.item)
					return r.item(0);

				r = r.duplicate();
				r.collapse(0);
				e = r.parentElement();

				if (e && e.nodeName == 'BODY')
					return e.lastChild;

				return e;
			} else {
				e = r.endContainer;

				if (e.nodeName == 'BODY')
					return e.lastChild;

				return t.dom.getParent(e, '*');
			}
		},

		getBookmark : function(si) {
			var t = this, r = t.getRng(), tr, sx, sy, vp = t.dom.getViewPort(t.win), e, sp, bp, le, c = -0xFFFFFF, s, ro = t.dom.getRoot(), wb = 0, wa = 0, nv;
			sx = vp.x;
			sy = vp.y;

			// Simple bookmark fast but not as persistent
			if (si)
				return {rng : r, scrollX : sx, scrollY : sy};

			// Handle IE
			if (isIE) {
				// Control selection
				if (r.item) {
					e = r.item(0);

					each(t.dom.select(e.nodeName), function(n, i) {
						if (e == n) {
							sp = i;
							return false;
						}
					});

					return {
						tag : e.nodeName,
						index : sp,
						scrollX : sx,
						scrollY : sy
					};
				}

				// Text selection
				tr = t.dom.doc.body.createTextRange();
				tr.moveToElementText(ro);
				tr.collapse(true);
				bp = Math.abs(tr.move('character', c));

				tr = r.duplicate();
				tr.collapse(true);
				sp = Math.abs(tr.move('character', c));

				tr = r.duplicate();
				tr.collapse(false);
				le = Math.abs(tr.move('character', c)) - sp;

				return {
					start : sp - bp,
					length : le,
					scrollX : sx,
					scrollY : sy
				};
			}

			// Handle W3C
			e = t.getNode();
			s = t.getSel();

			if (!s)
				return null;

			// Image selection
			if (e && e.nodeName == 'IMG') {
				return {
					scrollX : sx,
					scrollY : sy
				};
			}

			// Text selection

			function getPos(r, sn, en) {
                // ATLASSIAN - use custom filter
                var w = t.dom.doc.createTreeWalker(r, NodeFilter.SHOW_ALL, atlassianNodeFilter, false), n, p = 0, d = {};

				while ((n = w.nextNode()) != null) {
					if (n == sn)
						d.start = p;

					if (n == en) {
						d.end = p;
						return d;
					}

					p += trimNl(n.nodeValue || '').length;
				}

				return null;
			};

			// Caret or selection
			if (s.anchorNode == s.focusNode && s.anchorOffset == s.focusOffset) {
				e = getPos(ro, s.anchorNode, s.focusNode);

				if (!e)
					return {scrollX : sx, scrollY : sy};

				// Count whitespace before
                // ATLASSIAN - use text before caret, not the whole value
                if (s.anchorNode.nodeValue && s.anchorOffset) {
                    var textBeforeCaret = s.anchorNode.nodeValue.substr(0, s.anchorOffset);
				    trimNl(textBeforeCaret).replace(/^\s+/, function(a) {wb = a.length;});
                }

				return {
					start : Math.max(e.start + s.anchorOffset - wb, 0),
					end : Math.max(e.end + s.focusOffset - wb, 0),
					scrollX : sx,
					scrollY : sy,
					beg : s.anchorOffset - wb == 0
				};
			} else {
				e = getPos(ro, r.startContainer, r.endContainer);

				// Count whitespace before start and end container
				//(r.startContainer.nodeValue || '').replace(/^\s+/, function(a) {wb = a.length;});
				//(r.endContainer.nodeValue || '').replace(/^\s+/, function(a) {wa = a.length;});

				if (!e)
					return {scrollX : sx, scrollY : sy};

				return {
					start : Math.max(e.start + r.startOffset - wb, 0),
					end : Math.max(e.end + r.endOffset - wa, 0),
					scrollX : sx,
					scrollY : sy,
					beg : r.startOffset - wb == 0
				};
			}
		},

		moveToBookmark : function(b) {
			var t = this, r = t.getRng(), ro = t.dom.getRoot(), sd, nvl, nv;

			function getPos(r, sp, ep) {
                // ATLASSIAN - use custom filter
                var w = t.dom.doc.createTreeWalker(r, NodeFilter.SHOW_ALL, atlassianNodeFilter, false), n, p = 0, d = {}, o, v, wa, wb;

				while ((n = w.nextNode()) != null) {
					wa = wb = 0;

					nv = n.nodeValue || '';
					//nv.replace(/^\s+[^\s]/, function(a) {wb = a.length - 1;});
					//nv.replace(/[^\s]\s+$/, function(a) {wa = a.length - 1;});

					nvl = trimNl(nv).length;
					p += nvl;

					if (p >= sp && !d.startNode) {
						o = sp - (p - nvl);

						// Fix for odd quirk in FF
                        // ATLASSIAN - node value length may be 0 for empty <p>
						if (b.beg && nvl && o >= nvl)
							continue;

						d.startNode = n;
						d.startOffset = o + wb;
					}

					if (p >= ep) {
						d.endNode = n;
						d.endOffset = ep - (p - nvl) + wb;
						return d;
					}
				}

				return null;
			};

			if (!b)
				return false;

            t.win.scrollTo(b.scrollX, b.scrollY);

            // ATLASSIAN - selection needs to be retrieved from window *after* scroll or the range will not be set correctly.
            var s = t.getSel();

			// Handle explorer
			if (isIE) {
				// Handle simple
				if (r = b.rng) {
					try {
						r.select();
					} catch (ex) {
						// Ignore
					}

					return true;
				}

				t.win.focus();

				// Handle control bookmark
				if (b.tag) {
					r = ro.createControlRange();

					each(t.dom.select(b.tag), function(n, i) {
						if (i == b.index)
							r.addElement(n);
					});
				} else {
					// Try/catch needed since this operation breaks when TinyMCE is placed in hidden divs/tabs
					try {
						// Incorrect bookmark
						if (b.start < 0)
							return true;

						r = s.createRange();
						r.moveToElementText(ro);
						r.collapse(true);
						r.moveStart('character', b.start);
						r.moveEnd('character', b.length);
					} catch (ex2) {
						return true;
					}
				}

				try {
					r.select();
				} catch (ex) {
					// Needed for some odd IE bug #1843306
				}

				return true;
			}

			// Handle W3C
			if (!s)
				return false;

			// Handle simple
			if (b.rng) {
				s.removeAllRanges();
				s.addRange(b.rng);
			} else {
				if (is(b.start) && is(b.end)) {
					try {
						sd = getPos(ro, b.start, b.end);

						if (sd) {
							r = t.dom.doc.createRange();
							r.setStart(sd.startNode, sd.startOffset);
							r.setEnd(sd.endNode, sd.endOffset);
							s.removeAllRanges();
							s.addRange(r);
						}

						if (!tinymce.isOpera)
							t.win.focus();
					} catch (ex) {
						// Ignore
					}
				}
			}
		},

		select : function(n, c) {
			var t = this, r = t.getRng(), s = t.getSel(), b, fn, ln, d = t.win.document;

			function find(n, start) {
				var walker, o;

				if (n) {
					walker = d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);

					// Find first/last non empty text node
					while (n = walker.nextNode()) {
						o = n;

						if (tinymce.trim(n.nodeValue).length != 0) {
							if (start)
								return n;
							else
								o = n;
						}
					}
				}

				return o;
			};

			if (isIE) {
				try {
					b = d.body;

					if (/^(IMG|TABLE)$/.test(n.nodeName)) {
						r = b.createControlRange();
						r.addElement(n);
					} else {
						r = b.createTextRange();
						r.moveToElementText(n);
					}

					r.select();
				} catch (ex) {
					// Throws illigal agrument in IE some times
				}
			} else {
				if (c) {
					fn = find(n, 1) || t.dom.select('br:first', n)[0];
					ln = find(n, 0) || t.dom.select('br:last', n)[0];

					if (fn && ln) {
						r = d.createRange();

						if (fn.nodeName == 'BR')
							r.setStartBefore(fn);
						else
							r.setStart(fn, 0);

						if (ln.nodeName == 'BR')
							r.setEndBefore(ln);
						else
							r.setEnd(ln, ln.nodeValue.length);
					} else
						r.selectNode(n);
				} else
					r.selectNode(n);

				t.setRng(r);
			}

			return n;
		},

		isCollapsed : function() {
			var t = this, r = t.getRng(), s = t.getSel();

			if (!r || r.item)
				return false;

			return !s || r.boundingWidth == 0 || r.collapsed;
		},

		collapse : function(b) {
			var t = this, r = t.getRng(), n;

			// Control range on IE
			if (r.item) {
				n = r.item(0);
				r = this.win.document.body.createTextRange();
				r.moveToElementText(n);
			}

			r.collapse(!!b);
			t.setRng(r);
		},

		getSel : function() {
			var t = this, w = this.win;

			return w.getSelection ? w.getSelection() : w.document.selection;
		},

		getRng : function(w3c) {
			var t = this, s, r;

			// Found tridentSel object then we need to use that one
			if (w3c && t.tridentSel)
				return t.tridentSel.getRangeAt(0);

			try {
				if (s = t.getSel())
					r = s.rangeCount > 0 ? s.getRangeAt(0) : (s.createRange ? s.createRange() : t.win.document.createRange());
			} catch (ex) {
				// IE throws unspecified error here if TinyMCE is placed in a frame/iframe
			}

			// No range found then create an empty one
			// This can occur when the editor is placed in a hidden container element on Gecko
			// Or on IE when there was an exception
			if (!r)
				r = isIE ? t.win.document.body.createTextRange() : t.win.document.createRange();

			return r;
		},

		setRng : function(r) {
			var s, t = this;

			if (!t.tridentSel) {
				s = t.getSel();

				if (s) {
					s.removeAllRanges();
					s.addRange(r);
				}
			} else {
				// Is W3C Range
				if (r.cloneRange) {
					t.tridentSel.addRange(r);
					return;
				}

				// Is IE specific range
				try {
					r.select();
				} catch (ex) {
					// Needed for some odd IE bug #1843306
				}
			}
		},

		setNode : function(n) {
			var t = this;

			t.setContent(t.dom.getOuterHTML(n));

			return n;
		},

		getNode : function() {
			var t = this, r = t.getRng(), s = t.getSel(), e;

			if (!isIE) {
				// Range maybe lost after the editor is made visible again
				if (!r)
					return t.dom.getRoot();

				e = r.commonAncestorContainer;

				// Handle selection a image or other control like element such as anchors
				if (!r.collapsed) {
					// If the anchor node is a element instead of a text node then return this element
					if (tinymce.isWebKit && s.anchorNode && s.anchorNode.nodeType == 1) 
						return s.anchorNode.childNodes[s.anchorOffset]; 

					if (r.startContainer == r.endContainer) {
						if (r.startOffset - r.endOffset < 2) {
							if (r.startContainer.hasChildNodes())
								e = r.startContainer.childNodes[r.startOffset];
						}
					}
				}

				return t.dom.getParent(e, '*');
			}

			return r.item ? r.item(0) : r.parentElement();
		},

		getSelectedBlocks : function(st, en) {
			var t = this, dom = t.dom, sb, eb, n, bl = [];

			sb = dom.getParent(st || t.getStart(), dom.isBlock);
			eb = dom.getParent(en || t.getEnd(), dom.isBlock);

			if (sb)
				bl.push(sb);

			if (sb && eb && sb != eb) {
				n = sb;

				while ((n = n.nextSibling) && n != eb) {
					if (dom.isBlock(n))
						bl.push(n);
				}
			}

			if (eb && sb != eb)
				bl.push(eb);

			return bl;
		},

		destroy : function(s) {
			var t = this;

			t.win = null;

			if (t.tridentSel)
				t.tridentSel.destroy();

			// Manual destroy then remove unload handler
			if (!s)
				tinymce.removeUnload(t.destroy);
		}

		});
})(tinymce);
(function(tinymce) {
	tinymce.create('tinymce.dom.XMLWriter', {
		node : null,

		XMLWriter : function(s) {
			// Get XML document
			function getXML() {
				var i = document.implementation;

				if (!i || !i.createDocument) {
					// Try IE objects
					try {return new ActiveXObject('MSXML2.DOMDocument');} catch (ex) {}
					try {return new ActiveXObject('Microsoft.XmlDom');} catch (ex) {}
				} else
					return i.createDocument('', '', null);
			};

			this.doc = getXML();

			// Since Opera and WebKit doesn't escape > into &gt; we need to do it our self to normalize the output for all browsers
			this.valid = tinymce.isOpera || tinymce.isWebKit;

			this.reset();
		},

		reset : function() {
			var t = this, d = t.doc;

			if (d.firstChild)
				d.removeChild(d.firstChild);

			t.node = d.appendChild(d.createElement("html"));
		},

		writeStartElement : function(n) {
			var t = this;

			t.node = t.node.appendChild(t.doc.createElement(n));
		},

		writeAttribute : function(n, v) {
			if (this.valid)
				v = v.replace(/>/g, '%MCGT%');

			this.node.setAttribute(n, v);
		},

		writeEndElement : function() {
			this.node = this.node.parentNode;
		},

		writeFullEndElement : function() {
			var t = this, n = t.node;

			n.appendChild(t.doc.createTextNode(""));
			t.node = n.parentNode;
		},

		writeText : function(v) {
			if (this.valid)
				v = v.replace(/>/g, '%MCGT%');

			this.node.appendChild(this.doc.createTextNode(v));
		},

		writeCDATA : function(v) {
			this.node.appendChild(this.doc.createCDATASection(v));
		},

		writeComment : function(v) {
			// Fix for bug #2035694
			if (tinymce.isIE)
				v = v.replace(/^\-|\-$/g, ' ');

			this.node.appendChild(this.doc.createComment(v.replace(/\-\-/g, ' ')));
		},

		getContent : function() {
			var h;

			h = this.doc.xml || new XMLSerializer().serializeToString(this.doc);
			h = h.replace(/<\?[^?]+\?>|<html>|<\/html>|<html\/>|<!DOCTYPE[^>]+>/g, '');
			h = h.replace(/ ?\/>/g, ' />');

			if (this.valid)
				h = h.replace(/\%MCGT%/g, '&gt;');

			return h;
		}

		});
})(tinymce);
(function(tinymce) {
	tinymce.create('tinymce.dom.StringWriter', {
		str : null,
		tags : null,
		count : 0,
		settings : null,
		indent : null,

		StringWriter : function(s) {
			this.settings = tinymce.extend({
				indent_char : ' ',
				indentation : 0
			}, s);

			this.reset();
		},

		reset : function() {
			this.indent = '';
			this.str = "";
			this.tags = [];
			this.count = 0;
		},

		writeStartElement : function(n) {
			this._writeAttributesEnd();
			this.writeRaw('<' + n);
			this.tags.push(n);
			this.inAttr = true;
			this.count++;
			this.elementCount = this.count;
		},

		writeAttribute : function(n, v) {
			var t = this;

			t.writeRaw(" " + t.encode(n) + '="' + t.encode(v) + '"');
		},

		writeEndElement : function() {
			var n;

			if (this.tags.length > 0) {
				n = this.tags.pop();

				if (this._writeAttributesEnd(1))
					this.writeRaw('</' + n + '>');

				if (this.settings.indentation > 0)
					this.writeRaw('\n');
			}
		},

		writeFullEndElement : function() {
			if (this.tags.length > 0) {
				this._writeAttributesEnd();
				this.writeRaw('</' + this.tags.pop() + '>');

				if (this.settings.indentation > 0)
					this.writeRaw('\n');
			}
		},

		writeText : function(v) {
			this._writeAttributesEnd();
			this.writeRaw(this.encode(v));
			this.count++;
		},

		writeCDATA : function(v) {
			this._writeAttributesEnd();
			this.writeRaw('<![CDATA[' + v + ']]>');
			this.count++;
		},

		writeComment : function(v) {
			this._writeAttributesEnd();
			this.writeRaw('<!-- ' + v + '-->');
			this.count++;
		},

		writeRaw : function(v) {
			this.str += v;
		},

		encode : function(s) {
			return s.replace(/[<>&"]/g, function(v) {
				switch (v) {
					case '<':
						return '&lt;';

					case '>':
						return '&gt;';

					case '&':
						return '&amp;';

					case '"':
						return '&quot;';
				}

				return v;
			});
		},

		getContent : function() {
			return this.str;
		},

		_writeAttributesEnd : function(s) {
			if (!this.inAttr)
				return;

			this.inAttr = false;

			if (s && this.elementCount == this.count) {
				this.writeRaw(' />');
				return false;
			}

			this.writeRaw('>');

			return true;
		}

		});
})(tinymce);
(function(tinymce) {
	// Shorten names
	var extend = tinymce.extend, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher, isIE = tinymce.isIE, isGecko = tinymce.isGecko;

	function wildcardToRE(s) {
		return s.replace(/([?+*])/g, '.$1');
	};

	tinymce.create('tinymce.dom.Serializer', {
		Serializer : function(s) {
			var t = this;

			t.key = 0;
			t.onPreProcess = new Dispatcher(t);
			t.onPostProcess = new Dispatcher(t);

			try {
				t.writer = new tinymce.dom.XMLWriter();
			} catch (ex) {
				// IE might throw exception if ActiveX is disabled so we then switch to the slightly slower StringWriter
				t.writer = new tinymce.dom.StringWriter();
			}

			// Default settings
			t.settings = s = extend({
				dom : tinymce.DOM,
				valid_nodes : 0,
				node_filter : 0,
				attr_filter : 0,
				invalid_attrs : /^(mce_|_moz_|sizset|sizcache)/,
				closed : /^(br|hr|input|meta|img|link|param|area)$/,
				entity_encoding : 'named',
				entities : '160,nbsp,161,iexcl,162,cent,163,pound,164,curren,165,yen,166,brvbar,167,sect,168,uml,169,copy,170,ordf,171,laquo,172,not,173,shy,174,reg,175,macr,176,deg,177,plusmn,178,sup2,179,sup3,180,acute,181,micro,182,para,183,middot,184,cedil,185,sup1,186,ordm,187,raquo,188,frac14,189,frac12,190,frac34,191,iquest,192,Agrave,193,Aacute,194,Acirc,195,Atilde,196,Auml,197,Aring,198,AElig,199,Ccedil,200,Egrave,201,Eacute,202,Ecirc,203,Euml,204,Igrave,205,Iacute,206,Icirc,207,Iuml,208,ETH,209,Ntilde,210,Ograve,211,Oacute,212,Ocirc,213,Otilde,214,Ouml,215,times,216,Oslash,217,Ugrave,218,Uacute,219,Ucirc,220,Uuml,221,Yacute,222,THORN,223,szlig,224,agrave,225,aacute,226,acirc,227,atilde,228,auml,229,aring,230,aelig,231,ccedil,232,egrave,233,eacute,234,ecirc,235,euml,236,igrave,237,iacute,238,icirc,239,iuml,240,eth,241,ntilde,242,ograve,243,oacute,244,ocirc,245,otilde,246,ouml,247,divide,248,oslash,249,ugrave,250,uacute,251,ucirc,252,uuml,253,yacute,254,thorn,255,yuml,402,fnof,913,Alpha,914,Beta,915,Gamma,916,Delta,917,Epsilon,918,Zeta,919,Eta,920,Theta,921,Iota,922,Kappa,923,Lambda,924,Mu,925,Nu,926,Xi,927,Omicron,928,Pi,929,Rho,931,Sigma,932,Tau,933,Upsilon,934,Phi,935,Chi,936,Psi,937,Omega,945,alpha,946,beta,947,gamma,948,delta,949,epsilon,950,zeta,951,eta,952,theta,953,iota,954,kappa,955,lambda,956,mu,957,nu,958,xi,959,omicron,960,pi,961,rho,962,sigmaf,963,sigma,964,tau,965,upsilon,966,phi,967,chi,968,psi,969,omega,977,thetasym,978,upsih,982,piv,8226,bull,8230,hellip,8242,prime,8243,Prime,8254,oline,8260,frasl,8472,weierp,8465,image,8476,real,8482,trade,8501,alefsym,8592,larr,8593,uarr,8594,rarr,8595,darr,8596,harr,8629,crarr,8656,lArr,8657,uArr,8658,rArr,8659,dArr,8660,hArr,8704,forall,8706,part,8707,exist,8709,empty,8711,nabla,8712,isin,8713,notin,8715,ni,8719,prod,8721,sum,8722,minus,8727,lowast,8730,radic,8733,prop,8734,infin,8736,ang,8743,and,8744,or,8745,cap,8746,cup,8747,int,8756,there4,8764,sim,8773,cong,8776,asymp,8800,ne,8801,equiv,8804,le,8805,ge,8834,sub,8835,sup,8836,nsub,8838,sube,8839,supe,8853,oplus,8855,otimes,8869,perp,8901,sdot,8968,lceil,8969,rceil,8970,lfloor,8971,rfloor,9001,lang,9002,rang,9674,loz,9824,spades,9827,clubs,9829,hearts,9830,diams,338,OElig,339,oelig,352,Scaron,353,scaron,376,Yuml,710,circ,732,tilde,8194,ensp,8195,emsp,8201,thinsp,8204,zwnj,8205,zwj,8206,lrm,8207,rlm,8211,ndash,8212,mdash,8216,lsquo,8217,rsquo,8218,sbquo,8220,ldquo,8221,rdquo,8222,bdquo,8224,dagger,8225,Dagger,8240,permil,8249,lsaquo,8250,rsaquo,8364,euro',
				bool_attrs : /(checked|disabled|readonly|selected|nowrap)/,
				valid_elements : '*[*]',
				extended_valid_elements : 0,
				valid_child_elements : 0,
				invalid_elements : 0,
				fix_table_elements : 1,
				fix_list_elements : true,
				fix_content_duplication : true,
				convert_fonts_to_spans : false,
				font_size_classes : 0,
				font_size_style_values : 0,
				apply_source_formatting : 0,
				indent_mode : 'simple',
				indent_char : '\t',
				indent_levels : 1,
				remove_linebreaks : 1,
				remove_redundant_brs : 1,
				element_format : 'xhtml'
			}, s);

			t.dom = s.dom;

			if (s.remove_redundant_brs) {
				t.onPostProcess.add(function(se, o) {
					// Remove single BR at end of block elements since they get rendered
					o.content = o.content.replace(/(<br \/>\s*)+<\/(p|h[1-6]|div|li)>/gi, function(a, b, c) {
						// Check if it's a single element
						if (/^<br \/>\s*<\//.test(a))
							return '</' + c + '>';

						return a;
					});
				});
			}

			// Remove XHTML element endings i.e. produce crap :) XHTML is better
			if (s.element_format == 'html') {
				t.onPostProcess.add(function(se, o) {
					o.content = o.content.replace(/<([^>]+) \/>/g, '<$1>');
				});
			}

			if (s.fix_list_elements) {
				t.onPreProcess.add(function(se, o) {
					var nl, x, a = ['ol', 'ul'], i, n, p, r = /^(OL|UL)$/, np;

					function prevNode(e, n) {
						var a = n.split(','), i;

						while ((e = e.previousSibling) != null) {
							for (i=0; i<a.length; i++) {
								if (e.nodeName == a[i])
									return e;
							}
						}

						return null;
					};

					for (x=0; x<a.length; x++) {
						nl = t.dom.select(a[x], o.node);

						for (i=0; i<nl.length; i++) {
							n = nl[i];
							p = n.parentNode;

							if (r.test(p.nodeName)) {
								np = prevNode(n, 'LI');

								if (!np) {
									np = t.dom.create('li');
									np.innerHTML = '&nbsp;';
									np.appendChild(n);
									p.insertBefore(np, p.firstChild);
								} else
									np.appendChild(n);
							}
						}
					}
				});
			}

			if (s.fix_table_elements) {
				t.onPreProcess.add(function(se, o) {
					each(t.dom.select('p table', o.node), function(n) {
						// IE has a odd bug where tables inside paragraphs sometimes gets wrapped in a BODY and documentFragement element
						// This hack seems to resolve that issue. This will normally not happed since your contents should be valid in the first place
						if (isIE)
							n.outerHTML = n.outerHTML;

						t.dom.split(t.dom.getParent(n, 'p'), n);
					});
				});
			}
		},

		setEntities : function(s) {
			var t = this, a, i, l = {}, re = '', v;

			// No need to setup more than once
			if (t.entityLookup)
				return;

			// Build regex and lookup array
			a = s.split(',');
			for (i = 0; i < a.length; i += 2) {
				v = a[i];

				// Don't add default &amp; &quot; etc.
				if (v == 34 || v == 38 || v == 60 || v == 62)
					continue;

				l[String.fromCharCode(a[i])] = a[i + 1];

				v = parseInt(a[i]).toString(16);
				re += '\\u' + '0000'.substring(v.length) + v;
			}

			if (!re) {
				t.settings.entity_encoding = 'raw';
				return;
			}

			t.entitiesRE = new RegExp('[' + re + ']', 'g');
			t.entityLookup = l;
		},

		setValidChildRules : function(s) {
			this.childRules = null;
			this.addValidChildRules(s);
		},

		addValidChildRules : function(s) {
			var t = this, inst, intr, bloc;

			if (!s)
				return;

			inst = 'A|BR|SPAN|BDO|MAP|OBJECT|IMG|TT|I|B|BIG|SMALL|EM|STRONG|DFN|CODE|Q|SAMP|KBD|VAR|CITE|ABBR|ACRONYM|SUB|SUP|#text|#comment';
			intr = 'A|BR|SPAN|BDO|OBJECT|APPLET|IMG|MAP|IFRAME|TT|I|B|U|S|STRIKE|BIG|SMALL|FONT|BASEFONT|EM|STRONG|DFN|CODE|Q|SAMP|KBD|VAR|CITE|ABBR|ACRONYM|SUB|SUP|INPUT|SELECT|TEXTAREA|LABEL|BUTTON|#text|#comment';
			bloc = 'H[1-6]|P|DIV|ADDRESS|PRE|FORM|TABLE|LI|OL|UL|TD|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|FORM|NOSCRIPT|NOFRAMES|MENU|ISINDEX|SAMP';

			each(s.split(','), function(s) {
				var p = s.split(/\[|\]/), re;

				s = '';
				each(p[1].split('|'), function(v) {
					if (s)
						s += '|';

					switch (v) {
						case '%itrans':
							v = intr;
							break;

						case '%itrans_na':
							v = intr.substring(2);
							break;

						case '%istrict':
							v = inst;
							break;

						case '%istrict_na':
							v = inst.substring(2);
							break;

						case '%btrans':
							v = bloc;
							break;

						case '%bstrict':
							v = bloc;
							break;
					}

					s += v;
				});
				re = new RegExp('^(' + s.toLowerCase() + ')$', 'i');

				each(p[0].split('/'), function(s) {
					t.childRules = t.childRules || {};
					t.childRules[s] = re;
				});
			});

			// Build regex
			s = '';
			each(t.childRules, function(v, k) {
				if (s)
					s += '|';

				s += k;
			});

			t.parentElementsRE = new RegExp('^(' + s.toLowerCase() + ')$', 'i');

			/*console.debug(t.parentElementsRE.toString());
			each(t.childRules, function(v) {
				console.debug(v.toString());
			});*/
		},

		setRules : function(s) {
			var t = this;

			t._setup();
			t.rules = {};
			t.wildRules = [];
			t.validElements = {};

			return t.addRules(s);
		},

		addRules : function(s) {
			var t = this, dr;

			if (!s)
				return;

			t._setup();

			each(s.split(','), function(s) {
				var p = s.split(/\[|\]/), tn = p[0].split('/'), ra, at, wat, va = [];

				// Extend with default rules
				if (dr)
					at = tinymce.extend([], dr.attribs);

				// Parse attributes
				if (p.length > 1) {
					each(p[1].split('|'), function(s) {
						var ar = {}, i;

						at = at || [];

						// Parse attribute rule
						s = s.replace(/::/g, '~');
						s = /^([!\-])?([\w*.?~_\-]+|)([=:<])?(.+)?$/.exec(s);
						s[2] = s[2].replace(/~/g, ':');

						// Add required attributes
						if (s[1] == '!') {
							ra = ra || [];
							ra.push(s[2]);
						}

						// Remove inherited attributes
						if (s[1] == '-') {
							for (i = 0; i <at.length; i++) {
								if (at[i].name == s[2]) {
									at.splice(i, 1);
									return;
								}
							}
						}

						switch (s[3]) {
							// Add default attrib values
							case '=':
								ar.defaultVal = s[4] || '';
								break;

							// Add forced attrib values
							case ':':
								ar.forcedVal = s[4];
								break;

							// Add validation values
							case '<':
								ar.validVals = s[4].split('?');
								break;
						}

						if (/[*.?]/.test(s[2])) {
							wat = wat || [];
							ar.nameRE = new RegExp('^' + wildcardToRE(s[2]) + '$');
							wat.push(ar);
						} else {
							ar.name = s[2];
							at.push(ar);
						}

						va.push(s[2]);
					});
				}

				// Handle element names
				each(tn, function(s, i) {
					var pr = s.charAt(0), x = 1, ru = {};

					// Extend with default rule data
					if (dr) {
						if (dr.noEmpty)
							ru.noEmpty = dr.noEmpty;

						if (dr.fullEnd)
							ru.fullEnd = dr.fullEnd;

						if (dr.padd)
							ru.padd = dr.padd;
					}

					// Handle prefixes
					switch (pr) {
						case '-':
							ru.noEmpty = true;
							break;

						case '+':
							ru.fullEnd = true;
							break;

						case '#':
							ru.padd = true;
							break;

						default:
							x = 0;
					}

					tn[i] = s = s.substring(x);
					t.validElements[s] = 1;

					// Add element name or element regex
					if (/[*.?]/.test(tn[0])) {
						ru.nameRE = new RegExp('^' + wildcardToRE(tn[0]) + '$');
						t.wildRules = t.wildRules || {};
						t.wildRules.push(ru);
					} else {
						ru.name = tn[0];

						// Store away default rule
						if (tn[0] == '@')
							dr = ru;

						t.rules[s] = ru;
					}

					ru.attribs = at;

					if (ra)
						ru.requiredAttribs = ra;

					if (wat) {
						// Build valid attributes regexp
						s = '';
						each(va, function(v) {
							if (s)
								s += '|';

							s += '(' + wildcardToRE(v) + ')';
						});
						ru.validAttribsRE = new RegExp('^' + s.toLowerCase() + '$');
						ru.wildAttribs = wat;
					}
				});
			});

			// Build valid elements regexp
			s = '';
			each(t.validElements, function(v, k) {
				if (s)
					s += '|';

				if (k != '@')
					s += k;
			});
			t.validElementsRE = new RegExp('^(' + wildcardToRE(s.toLowerCase()) + ')$');

			//console.debug(t.validElementsRE.toString());
			//console.dir(t.rules);
			//console.dir(t.wildRules);
		},

		findRule : function(n) {
			var t = this, rl = t.rules, i, r;

			t._setup();

			// Exact match
			r = rl[n];
			if (r)
				return r;

			// Try wildcards
			rl = t.wildRules;
			for (i = 0; i < rl.length; i++) {
				if (rl[i].nameRE.test(n))
					return rl[i];
			}

			return null;
		},

		findAttribRule : function(ru, n) {
			var i, wa = ru.wildAttribs;

			for (i = 0; i < wa.length; i++) {
				if (wa[i].nameRE.test(n))
					return wa[i];
			}

			return null;
		},

		serialize : function(n, o) {
			var h, t = this, doc;

			t._setup();
			o = o || {};
			o.format = o.format || 'html';
			n = n.cloneNode(true);
			t.processObj = o;

			// Nodes needs to be attached to something in WebKit due to a bug https://bugs.webkit.org/show_bug.cgi?id=25571
			if (tinymce.isWebKit) {
				doc = n.ownerDocument.implementation.createHTMLDocument("");
				doc.body.appendChild(n);
			}

			t.key = '' + (parseInt(t.key) + 1);

			// Pre process
			if (!o.no_events) {
				o.node = n;
				t.onPreProcess.dispatch(t, o);
			}

			// Serialize HTML DOM into a string
			t.writer.reset();
			t._serializeNode(n, o.getInner);

			// Post process
			o.content = t.writer.getContent();

			if (!o.no_events)
				t.onPostProcess.dispatch(t, o);

			t._postProcess(o);
			o.node = null;

			return tinymce.trim(o.content);
		},

		// Internal functions

		_postProcess : function(o) {
			var t = this, s = t.settings, h = o.content, sc = [], p;

			if (o.format == 'html') {
				// Protect some elements
				p = t._protect({
					content : h,
					patterns : [
						{pattern : /(<script[^>]*>)(.*?)(<\/script>)/g},
						{pattern : /(<noscript[^>]*>)(.*?)(<\/noscript>)/g},
						{pattern : /(<style[^>]*>)(.*?)(<\/style>)/g},
						{pattern : /(<pre[^>]*>)(.*?)(<\/pre>)/g, encode : 1},
						{pattern : /(<!--\[CDATA\[)(.*?)(\]\]-->)/g}
					]
				});

				h = p.content;

				// Entity encode
				if (s.entity_encoding !== 'raw')
					h = t._encode(h);

				// Use BR instead of &nbsp; padded P elements inside editor and use <p>&nbsp;</p> outside editor
/*				if (o.set)
					h = h.replace(/<p>\s+(&nbsp;|&#160;|\u00a0|<br \/>)\s+<\/p>/g, '<p><br /></p>');
				else
					h = h.replace(/<p>\s+(&nbsp;|&#160;|\u00a0|<br \/>)\s+<\/p>/g, '<p>$1</p>');*/

				// Since Gecko and Safari keeps whitespace in the DOM we need to
				// remove it inorder to match other browsers. But I think Gecko and Safari is right.
				// This process is only done when getting contents out from the editor.
				if (!o.set) {
					// We need to replace paragraph whitespace with an nbsp before indentation to keep the \u00a0 char
					h = h.replace(/<p>\s+<\/p>|<p([^>]+)>\s+<\/p>/g, s.entity_encoding == 'numeric' ? '<p$1>&#160;</p>' : '<p$1>&nbsp;</p>');

					if (s.remove_linebreaks) {
						h = h.replace(/\r?\n|\r/g, ' ');
						h = h.replace(/(<[^>]+>)\s+/g, '$1 ');
						h = h.replace(/\s+(<\/[^>]+>)/g, ' $1');
						h = h.replace(/<(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object) ([^>]+)>\s+/g, '<$1 $2>'); // Trim block start
						h = h.replace(/<(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object)>\s+/g, '<$1>'); // Trim block start
						h = h.replace(/\s+<\/(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object)>/g, '</$1>'); // Trim block end
					}

					// Simple indentation
					if (s.apply_source_formatting && s.indent_mode == 'simple') {
						// Add line breaks before and after block elements
						h = h.replace(/<(\/?)(ul|hr|table|meta|link|tbody|tr|object|body|head|html|map)(|[^>]+)>\s*/g, '\n<$1$2$3>\n');
						h = h.replace(/\s*<(p|h[1-6]|blockquote|div|title|style|pre|script|td|li|area)(|[^>]+)>/g, '\n<$1$2>');
						h = h.replace(/<\/(p|h[1-6]|blockquote|div|title|style|pre|script|td|li)>\s*/g, '</$1>\n');
						h = h.replace(/\n\n/g, '\n');
					}
				}

				h = t._unprotect(h, p);

				// Restore CDATA sections
				h = h.replace(/<!--\[CDATA\[([\s\S]+)\]\]-->/g, '<![CDATA[$1]]>');

				// Restore scripts
				h = h.replace(/(type|language)=\"mce-/g, '$1="');

				// Restore the \u00a0 character if raw mode is enabled
				if (s.entity_encoding == 'raw')
					h = h.replace(/<p>&nbsp;<\/p>|<p([^>]+)>&nbsp;<\/p>/g, '<p$1>\u00a0</p>');

				// Restore noscript elements
				h = h.replace(/<noscript([^>]+|)>([\s\S]*?)<\/noscript>/g, function(v, attribs, text) {
					return '<noscript' + attribs + '>' + t.dom.decode(text.replace(/<!--|-->/g, '')) + '</noscript>';
				});
			}

			o.content = h;
		},

		_serializeNode : function(n, inn) {
			var t = this, s = t.settings, w = t.writer, hc, el, cn, i, l, a, at, no, v, nn, ru, ar, iv, closed;

			if (!s.node_filter || s.node_filter(n)) {
				switch (n.nodeType) {
					case 1: // Element
						if (n.hasAttribute ? n.hasAttribute('mce_bogus') : n.getAttribute('mce_bogus'))
							return;

						iv = false;
						hc = n.hasChildNodes();
						nn = n.getAttribute('mce_name') || n.nodeName.toLowerCase();

						// Add correct prefix on IE
						if (isIE) {
							if (n.scopeName !== 'HTML' && n.scopeName !== 'html')
								nn = n.scopeName + ':' + nn;
						}

						// Remove mce prefix on IE needed for the abbr element
						if (nn.indexOf('mce:') === 0)
							nn = nn.substring(4);

						// Check if valid
						if (!t.validElementsRE || !t.validElementsRE.test(nn) || (t.invalidElementsRE && t.invalidElementsRE.test(nn)) || inn) {
							iv = true;
							break;
						}

						if (isIE) {
							// Fix IE content duplication (DOM can have multiple copies of the same node)
							if (s.fix_content_duplication) {
								if (n.mce_serialized == t.key)
									return;

								n.mce_serialized = t.key;
							}

							// IE sometimes adds a / infront of the node name
							if (nn.charAt(0) == '/')
								nn = nn.substring(1);
						} else if (isGecko) {
							// Ignore br elements
							if (n.nodeName === 'BR' && n.getAttribute('type') == '_moz')
								return;
						}

						// Check if valid child
						if (t.childRules) {
							if (t.parentElementsRE.test(t.elementName)) {
								if (!t.childRules[t.elementName].test(nn)) {
									iv = true;
									break;
								}
							}

							t.elementName = nn;
						}

						ru = t.findRule(nn);
						nn = ru.name || nn;
						closed = s.closed.test(nn);

						// Skip empty nodes or empty node name in IE
						if ((!hc && ru.noEmpty) || (isIE && !nn)) {
							iv = true;
							break;
						}

						// Check required
						if (ru.requiredAttribs) {
							a = ru.requiredAttribs;

							for (i = a.length - 1; i >= 0; i--) {
								if (this.dom.getAttrib(n, a[i]) !== '')
									break;
							}

							// None of the required was there
							if (i == -1) {
								iv = true;
								break;
							}
						}

						w.writeStartElement(nn);

						// Add ordered attributes
						if (ru.attribs) {
							for (i=0, at = ru.attribs, l = at.length; i<l; i++) {
								a = at[i];
								v = t._getAttrib(n, a);

								if (v !== null)
									w.writeAttribute(a.name, v);
							}
						}

						// Add wild attributes
						if (ru.validAttribsRE) {
							at = t.dom.getAttribs(n);
							for (i=at.length-1; i>-1; i--) {
								no = at[i];

								if (no.specified) {
									a = no.nodeName.toLowerCase();

									if (s.invalid_attrs.test(a) || !ru.validAttribsRE.test(a))
										continue;

									ar = t.findAttribRule(ru, a);
									v = t._getAttrib(n, ar, a);

									if (v !== null)
										w.writeAttribute(a, v);
								}
							}
						}

						// Write text from script
						if (nn === 'script' && tinymce.trim(n.innerHTML)) {
							w.writeText('// '); // Padd it with a comment so it will parse on older browsers
							w.writeCDATA(n.innerHTML.replace(/<!--|-->|<\[CDATA\[|\]\]>/g, '')); // Remove comments and cdata stuctures
							hc = false;
							break;
						}

						// Padd empty nodes with a &nbsp;
						if (ru.padd) {
							// If it has only one bogus child, padd it anyway workaround for <td><br /></td> bug
							if (hc && (cn = n.firstChild) && cn.nodeType === 1 && n.childNodes.length === 1) {
								if (cn.hasAttribute ? cn.hasAttribute('mce_bogus') : cn.getAttribute('mce_bogus'))
									w.writeText('\u00a0');
							} else if (!hc)
								w.writeText('\u00a0'); // No children then padd it
						}

						break;

					case 3: // Text
						// Check if valid child
						if (t.childRules && t.parentElementsRE.test(t.elementName)) {
							if (!t.childRules[t.elementName].test(n.nodeName))
								return;
						}

						return w.writeText(n.nodeValue);

					case 4: // CDATA
						return w.writeCDATA(n.nodeValue);

					case 8: // Comment
						return w.writeComment(n.nodeValue);
				}
			} else if (n.nodeType == 1)
				hc = n.hasChildNodes();

			if (hc && !closed) {
				cn = n.firstChild;

				while (cn) {
					t._serializeNode(cn);
					t.elementName = nn;
					cn = cn.nextSibling;
				}
			}

			// Write element end
			if (!iv) {
				if (!closed)
					w.writeFullEndElement();
				else
					w.writeEndElement();
			}
		},

		_protect : function(o) {
			var t = this;

			o.items = o.items || [];

			function enc(s) {
				return s.replace(/[\r\n\\]/g, function(c) {
					if (c === '\n')
						return '\\n';
					else if (c === '\\')
						return '\\\\';

					return '\\r';
				});
			};

			function dec(s) {
				return s.replace(/\\[\\rn]/g, function(c) {
					if (c === '\\n')
						return '\n';
					else if (c === '\\\\')
						return '\\';

					return '\r';
				});
			};

			each(o.patterns, function(p) {
				o.content = dec(enc(o.content).replace(p.pattern, function(x, a, b, c) {
					b = dec(b);

					if (p.encode)
						b = t._encode(b);

					o.items.push(b);
					return a + '<!--mce:' + (o.items.length - 1) + '-->' + c;
				}));
			});

			return o;
		},

		_unprotect : function(h, o) {
			h = h.replace(/\<!--mce:([0-9]+)--\>/g, function(a, b) {
				return o.items[parseInt(b)];
			});

			o.items = [];

			return h;
		},

		_encode : function(h) {
			var t = this, s = t.settings, l;

			// Entity encode
			if (s.entity_encoding !== 'raw') {
				if (s.entity_encoding.indexOf('named') != -1) {
					t.setEntities(s.entities);
					l = t.entityLookup;

					h = h.replace(t.entitiesRE, function(a) {
						var v;

						if (v = l[a])
							a = '&' + v + ';';

						return a;
					});
				}

				if (s.entity_encoding.indexOf('numeric') != -1) {
					h = h.replace(/[\u007E-\uFFFF]/g, function(a) {
						return '&#' + a.charCodeAt(0) + ';';
					});
				}
			}

			return h;
		},

		_setup : function() {
			var t = this, s = this.settings;

			if (t.done)
				return;

			t.done = 1;

			t.setRules(s.valid_elements);
			t.addRules(s.extended_valid_elements);
			t.addValidChildRules(s.valid_child_elements);

			if (s.invalid_elements)
				t.invalidElementsRE = new RegExp('^(' + wildcardToRE(s.invalid_elements.replace(/,/g, '|').toLowerCase()) + ')$');

			if (s.attrib_value_filter)
				t.attribValueFilter = s.attribValueFilter;
		},

		_getAttrib : function(n, a, na) {
			var i, v;

			na = na || a.name;

			if (a.forcedVal && (v = a.forcedVal)) {
				if (v === '{$uid}')
					return this.dom.uniqueId();

				return v;
			}

			v = this.dom.getAttrib(n, na);

			// Bool attr
			if (this.settings.bool_attrs.test(na) && v) {
				v = ('' + v).toLowerCase();

				if (v === 'false' || v === '0')
					return null;

				v = na;
			}

			switch (na) {
				case 'rowspan':
				case 'colspan':
					// Whats the point? Remove usless attribute value
					if (v == '1')
						v = '';

					break;
			}

			if (this.attribValueFilter)
				v = this.attribValueFilter(na, v, n);

			if (a.validVals) {
				for (i = a.validVals.length - 1; i >= 0; i--) {
					if (v == a.validVals[i])
						break;
				}

				if (i == -1)
					return null;
			}

			if (v === '' && typeof(a.defaultVal) != 'undefined') {
				v = a.defaultVal;

				if (v === '{$uid}')
					return this.dom.uniqueId();

				return v;
			} else {
				// Remove internal mceItemXX classes when content is extracted from editor
				if (na == 'class' && this.processObj.get)
					v = v.replace(/\s?mceItem\w+\s?/g, '');
			}

			if (v === '')
				return null;


			return v;
		}

		});
})(tinymce);
(function(tinymce) {
	var each = tinymce.each, Event = tinymce.dom.Event;

	tinymce.create('tinymce.dom.ScriptLoader', {
		ScriptLoader : function(s) {
			this.settings = s || {};
			this.queue = [];
			this.lookup = {};
		},

		isDone : function(u) {
			return this.lookup[u] ? this.lookup[u].state == 2 : 0;
		},

		markDone : function(u) {
			this.lookup[u] = {state : 2, url : u};
		},

		add : function(u, cb, s, pr) {
			var t = this, lo = t.lookup, o;

			if (o = lo[u]) {
				// Is loaded fire callback
				if (cb && o.state == 2)
					cb.call(s || this);

				return o;
			}

			o = {state : 0, url : u, func : cb, scope : s || this};

			if (pr)
				t.queue.unshift(o);
			else
				t.queue.push(o);

			lo[u] = o;

			return o;
		},

		load : function(u, cb, s) {
			var t = this, o;

			if (o = t.lookup[u]) {
				// Is loaded fire callback
				if (cb && o.state == 2)
					cb.call(s || t);

				return o;
			}

			function loadScript(u) {
				if (Event.domLoaded || t.settings.strict_mode) {
					tinymce.util.XHR.send({
						url : tinymce._addVer(u),
						error : t.settings.error,
						async : false,
						success : function(co) {
							t.eval(co);
						}
					});
				} else
					document.write('<script type="text/javascript" src="' + tinymce._addVer(u) + '"></script>');
			};

			if (!tinymce.is(u, 'string')) {
				each(u, function(u) {
					loadScript(u);
				});

				if (cb)
					cb.call(s || t);
			} else {
				loadScript(u);

				if (cb)
					cb.call(s || t);
			}
		},

		loadQueue : function(cb, s) {
			var t = this;

			if (!t.queueLoading) {
				t.queueLoading = 1;
				t.queueCallbacks = [];

				t.loadScripts(t.queue, function() {
					t.queueLoading = 0;

					if (cb)
						cb.call(s || t);

					each(t.queueCallbacks, function(o) {
						o.func.call(o.scope);
					});
				});
			} else if (cb)
				t.queueCallbacks.push({func : cb, scope : s || t});
		},

		eval : function(co) {
			var w = window;

			// Evaluate script
			if (!w.execScript) {
				try {
					eval.call(w, co);
				} catch (ex) {
					eval(co, w); // Firefox 3.0a8
				}
			} else
				w.execScript(co); // IE
		},

		loadScripts : function(sc, cb, s) {
			var t = this, lo = t.lookup;

			function done(o) {
				o.state = 2; // Has been loaded

				// Run callback
				if (o.func)
					o.func.call(o.scope || t);
			};

			function allDone() {
				var l;

				// Check if all files are loaded
				l = sc.length;
				each(sc, function(o) {
					o = lo[o.url];

					if (o.state === 2) {// It has finished loading
						done(o);
						l--;
					} else
						load(o);
				});

				// They are all loaded
				if (l === 0 && cb) {
					cb.call(s || t);
					cb = 0;
				}
			};

			function load(o) {
				if (o.state > 0)
					return;

				o.state = 1; // Is loading

				tinymce.dom.ScriptLoader.loadScript(o.url, function() {
					done(o);
					allDone();
				});

				/*
				tinymce.util.XHR.send({
					url : o.url,
					error : t.settings.error,
					success : function(co) {
						t.eval(co);
						done(o);
						allDone();
					}
				});
				*/
			};

			each(sc, function(o) {
				var u = o.url;

				// Add to queue if needed
				if (!lo[u]) {
					lo[u] = o;
					t.queue.push(o);
				} else
					o = lo[u];

				// Is already loading or has been loaded
				if (o.state > 0)
					return;

				if (!Event.domLoaded && !t.settings.strict_mode) {
					var ix, ol = '';

					// Add onload events
					if (cb || o.func) {
						o.state = 1; // Is loading

						ix = tinymce.dom.ScriptLoader._addOnLoad(function() {
							done(o);
							allDone();
						});

						if (tinymce.isIE)
							ol = ' onreadystatechange="';
						else
							ol = ' onload="';

						ol += 'tinymce.dom.ScriptLoader._onLoad(this,\'' + u + '\',' + ix + ');"';
					}

					document.write('<script type="text/javascript" src="' + tinymce._addVer(u) + '"' + ol + '></script>');

					if (!o.func)
						done(o);
				} else
					load(o);
			});

			allDone();
		},

		// Static methods
		'static' : {
			_addOnLoad : function(f) {
				var t = this;

				t._funcs = t._funcs || [];
				t._funcs.push(f);

				return t._funcs.length - 1;
			},

			_onLoad : function(e, u, ix) {
				if (!tinymce.isIE || e.readyState == 'complete')
					this._funcs[ix].call(this);
			},

			loadScript : function(u, cb) {
				var id = tinymce.DOM.uniqueId(), e;

				function done() {
					Event.clear(id);
					tinymce.DOM.remove(id);

					if (cb) {
						cb.call(document, u);
						cb = 0;
					}
				};

				if (tinymce.isIE) {
/*					Event.add(e, 'readystatechange', function(e) {
						if (e.target && e.target.readyState == 'complete')
							done();
					});*/

					tinymce.util.XHR.send({
						url : tinymce._addVer(u),
						async : false,
						success : function(co) {
							window.execScript(co);
							done();
						}
					});
				} else {
					e = tinymce.DOM.create('script', {id : id, type : 'text/javascript', src : tinymce._addVer(u)});
					Event.add(e, 'load', done);

					// Check for head or body
					(document.getElementsByTagName('head')[0] || document.body).appendChild(e);
				}
			}
		}

		});

	// Global script loader
	tinymce.ScriptLoader = new tinymce.dom.ScriptLoader();
})(tinymce);
(function(tinymce) {
	// Shorten class names
	var DOM = tinymce.DOM, is = tinymce.is;

	tinymce.create('tinymce.ui.Control', {
		Control : function(id, s) {
			this.id = id;
			this.settings = s = s || {};
			this.rendered = false;
			this.onRender = new tinymce.util.Dispatcher(this);
			this.classPrefix = '';
			this.scope = s.scope || this;
			this.disabled = 0;
			this.active = 0;
		},

		setDisabled : function(s) {
			var e;

			if (s != this.disabled) {
				e = DOM.get(this.id);

				// Add accessibility title for unavailable actions
				if (e && this.settings.unavailable_prefix) {
					if (s) {
						this.prevTitle = e.title;
						e.title = this.settings.unavailable_prefix + ": " + e.title;
					} else
						e.title = this.prevTitle;
				}

				this.setState('Disabled', s);
				this.setState('Enabled', !s);
				this.disabled = s;
			}
		},

		isDisabled : function() {
			return this.disabled;
		},

		setActive : function(s) {
			if (s != this.active) {
				this.setState('Active', s);
				this.active = s;
			}
		},

		isActive : function() {
			return this.active;
		},

		setState : function(c, s) {
			var n = DOM.get(this.id);

			c = this.classPrefix + c;

			if (s)
				DOM.addClass(n, c);
			else
				DOM.removeClass(n, c);
		},

		isRendered : function() {
			return this.rendered;
		},

		renderHTML : function() {
		},

		renderTo : function(n) {
			DOM.setHTML(n, this.renderHTML());
		},

		postRender : function() {
			var t = this, b;

			// Set pending states
			if (is(t.disabled)) {
				b = t.disabled;
				t.disabled = -1;
				t.setDisabled(b);
			}

			if (is(t.active)) {
				b = t.active;
				t.active = -1;
				t.setActive(b);
			}
		},

		remove : function() {
			DOM.remove(this.id);
			this.destroy();
		},

		destroy : function() {
			tinymce.dom.Event.clear(this.id);
		}

		});
})(tinymce);tinymce.create('tinymce.ui.Container:tinymce.ui.Control', {
	Container : function(id, s) {
		this.parent(id, s);
		this.controls = [];
		this.lookup = {};
	},

	add : function(c) {
		this.lookup[c.id] = c;
		this.controls.push(c);

		return c;
	},

	get : function(n) {
		return this.lookup[n];
	}

	});

tinymce.create('tinymce.ui.Separator:tinymce.ui.Control', {
	Separator : function(id, s) {
		this.parent(id, s);
		this.classPrefix = 'mceSeparator';
	},

	renderHTML : function() {
		return tinymce.DOM.createHTML('span', {'class' : this.classPrefix});
	}

	});
(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	tinymce.create('tinymce.ui.MenuItem:tinymce.ui.Control', {
		MenuItem : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceMenuItem';
		},

		setSelected : function(s) {
			this.setState('Selected', s);
			this.selected = s;
		},

		isSelected : function() {
			return this.selected;
		},

		postRender : function() {
			var t = this;

			t.parent();

			// Set pending state
			if (is(t.selected))
				t.setSelected(t.selected);
		}

		});
})(tinymce);
(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	tinymce.create('tinymce.ui.Menu:tinymce.ui.MenuItem', {
		Menu : function(id, s) {
			var t = this;

			t.parent(id, s);
			t.items = {};
			t.collapsed = false;
			t.menuCount = 0;
			t.onAddItem = new tinymce.util.Dispatcher(this);
		},

		expand : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.expand)
						o.expand();
				}, 'items', t);
			}

			t.collapsed = false;
		},

		collapse : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.collapse)
						o.collapse();
				}, 'items', t);
			}

			t.collapsed = true;
		},

		isCollapsed : function() {
			return this.collapsed;
		},

		add : function(o) {
			if (!o.settings)
				o = new tinymce.ui.MenuItem(o.id || DOM.uniqueId(), o);

			this.onAddItem.dispatch(this, o);

			return this.items[o.id] = o;
		},

		addSeparator : function() {
			return this.add({separator : true});
		},

		addMenu : function(o) {
			if (!o.collapse)
				o = this.createMenu(o);

			this.menuCount++;

			return this.add(o);
		},

		hasMenus : function() {
			return this.menuCount !== 0;
		},

		remove : function(o) {
			delete this.items[o.id];
		},

		removeAll : function() {
			var t = this;

			walk(t, function(o) {
				if (o.removeAll)
					o.removeAll();
				else
					o.remove();

				o.destroy();
			}, 'items', t);

			t.items = {};
		},

		createMenu : function(o) {
			var m = new tinymce.ui.Menu(o.id || DOM.uniqueId(), o);

			m.onAddItem.add(this.onAddItem.dispatch, this.onAddItem);

			return m;
		}

		});
})(tinymce);(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event, Element = tinymce.dom.Element;

	tinymce.create('tinymce.ui.DropMenu:tinymce.ui.Menu', {
		DropMenu : function(id, s) {
			s = s || {};
			s.container = s.container || DOM.doc.body;
			s.offset_x = s.offset_x || 0;
			s.offset_y = s.offset_y || 0;
			s.vp_offset_x = s.vp_offset_x || 0;
			s.vp_offset_y = s.vp_offset_y || 0;

			if (is(s.icons) && !s.icons)
				s['class'] += ' mceNoIcons';

			this.parent(id, s);
			this.onShowMenu = new tinymce.util.Dispatcher(this);
			this.onHideMenu = new tinymce.util.Dispatcher(this);
			this.classPrefix = 'mceMenu';
		},

		createMenu : function(s) {
			var t = this, cs = t.settings, m;

			s.container = s.container || cs.container;
			s.parent = t;
			s.constrain = s.constrain || cs.constrain;
			s['class'] = s['class'] || cs['class'];
			s.vp_offset_x = s.vp_offset_x || cs.vp_offset_x;
			s.vp_offset_y = s.vp_offset_y || cs.vp_offset_y;
			m = new tinymce.ui.DropMenu(s.id || DOM.uniqueId(), s);

			m.onAddItem.add(t.onAddItem.dispatch, t.onAddItem);

			return m;
		},

		update : function() {
			var t = this, s = t.settings, tb = DOM.get('menu_' + t.id + '_tbl'), co = DOM.get('menu_' + t.id + '_co'), tw, th;

			tw = s.max_width ? Math.min(tb.clientWidth, s.max_width) : tb.clientWidth;
			th = s.max_height ? Math.min(tb.clientHeight, s.max_height) : tb.clientHeight;

			if (!DOM.boxModel)
				t.element.setStyles({width : tw + 2, height : th + 2});
			else
				t.element.setStyles({width : tw, height : th});

			if (s.max_width)
				DOM.setStyle(co, 'width', tw);

			if (s.max_height) {
				DOM.setStyle(co, 'height', th);

				if (tb.clientHeight < s.max_height)
					DOM.setStyle(co, 'overflow', 'hidden');
			}
		},

		showMenu : function(x, y, px) {
			var t = this, s = t.settings, co, vp = DOM.getViewPort(), w, h, mx, my, ot = 2, dm, tb, cp = t.classPrefix;

			t.collapse(1);

			if (t.isMenuVisible)
				return;

	if (!t.rendered) {
				co = DOM.add(t.settings.container, t.renderNode());

				each(t.items, function(o) {
					o.postRender();
				});

				t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});
			} else
				co = DOM.get('menu_' + t.id);

			// Move layer out of sight unless it's Opera since it scrolls to top of page due to an bug
			if (!tinymce.isOpera)
				DOM.setStyles(co, {left : -0xFFFF , top : -0xFFFF});

			DOM.show(co);
			t.update();

			x += s.offset_x || 0;
			y += s.offset_y || 0;
			vp.w -= 4;
			vp.h -= 4;

			// Move inside viewport if not submenu
			if (s.constrain) {
				w = co.clientWidth - ot;
				h = co.clientHeight - ot;
				mx = vp.x + vp.w;
				my = vp.y + vp.h;

				if ((x + s.vp_offset_x + w) > mx)
					x = px ? px - w : Math.max(0, (mx - s.vp_offset_x) - w);

				if ((y + s.vp_offset_y + h) > my)
					y = Math.max(0, (my - s.vp_offset_y) - h);
			}

			DOM.setStyles(co, {left : x , top : y});
			t.element.update();

			t.isMenuVisible = 1;
			t.mouseClickFunc = Event.add(co, 'click', function(e) {
				var m;

				e = e.target;

				if (e && (e = DOM.getParent(e, 'tr')) && !DOM.hasClass(e, cp + 'ItemSub')) {
					m = t.items[e.id];

					if (m.isDisabled())
						return;

					dm = t;

					while (dm) {
						if (dm.hideMenu)
							dm.hideMenu();

						dm = dm.settings.parent;
					}

					if (m.settings.onclick)
						m.settings.onclick(e);

					return Event.cancel(e); // Cancel to fix onbeforeunload problem
				}
			});

			if (t.hasMenus()) {
				t.mouseOverFunc = Event.add(co, 'mouseover', function(e) {
					var m, r, mi;

					e = e.target;
					if (e && (e = DOM.getParent(e, 'tr'))) {
						m = t.items[e.id];

						if (t.lastMenu)
							t.lastMenu.collapse(1);

						if (m.isDisabled())
							return;

						if (e && DOM.hasClass(e, cp + 'ItemSub')) {
							//p = DOM.getPos(s.container);
							r = DOM.getRect(e);
							m.showMenu((r.x + r.w - ot), r.y - ot, r.x);
							t.lastMenu = m;
							DOM.addClass(DOM.get(m.id).firstChild, cp + 'ItemActive');
						}
					}
				});
			}

			t.onShowMenu.dispatch(t);

           if (s.keyboard_focus) {
				Event.add(co, 'keydown', t._keyHandler, t);
				DOM.select('a', 'menu_' + t.id)[0].focus(); // Select first link
				t._focusIdx = 0;
			}
        },

		hideMenu : function(c) {
			var t = this, co = DOM.get('menu_' + t.id), e;

			if (!t.isMenuVisible)
				return;

			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);
			Event.remove(co, 'keydown', t._keyHandler);
			DOM.hide(co);
			t.isMenuVisible = 0;

			if (!c)
				t.collapse(1);

			if (t.element)
				t.element.hide();

			if (e = DOM.get(t.id))
				DOM.removeClass(e.firstChild, t.classPrefix + 'ItemActive');

			t.onHideMenu.dispatch(t);
		},

		add : function(o) {
			var t = this, co;

			o = t.parent(o);

			if (t.isRendered && (co = DOM.get('menu_' + t.id)))
				t._add(DOM.select('tbody', co)[0], o);

			return o;
		},

		collapse : function(d) {
			this.parent(d);
			this.hideMenu(1);
		},

		remove : function(o) {
			DOM.remove(o.id);
			this.destroy();

			return this.parent(o);
		},

		destroy : function() {
			var t = this, co = DOM.get('menu_' + t.id);

			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);

			if (t.element)
				t.element.remove();

			DOM.remove(co);
		},

		renderNode : function() {
			var t = this, s = t.settings, n, tb, co, w;

			w = DOM.create('div', {id : 'menu_' + t.id, 'class' : s['class'], 'style' : 'position:absolute;left:0;top:0;z-index:200000'});
			co = DOM.add(w, 'div', {id : 'menu_' + t.id + '_co', 'class' : t.classPrefix + (s['class'] ? ' ' + s['class'] : '')});
			t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});

			if (s.menu_line)
				DOM.add(co, 'span', {'class' : t.classPrefix + 'Line'});

//			n = DOM.add(co, 'div', {id : 'menu_' + t.id + '_co', 'class' : 'mceMenuContainer'});
			n = DOM.add(co, 'table', {id : 'menu_' + t.id + '_tbl', border : 0, cellPadding : 0, cellSpacing : 0});
			tb = DOM.add(n, 'tbody');

			each(t.items, function(o) {
				t._add(tb, o);
			});

			t.rendered = true;

			return w;
		},

		// Internal functions

		_keyHandler : function(e) {
			var t = this, kc = e.keyCode;

			function focus(d) {
				var i = t._focusIdx + d, e = DOM.select('a', 'menu_' + t.id)[i];

				if (e) {
					t._focusIdx = i;
					e.focus();
				}
			};

			switch (kc) {
				case 38:
					focus(-1); // Select first link
					return;

				case 40:
					focus(1);
					return;

				case 13:
					return;

				case 27:
					return this.hideMenu();
			}
		},

		_add : function(tb, o) {
			var n, s = o.settings, a, ro, it, cp = this.classPrefix, ic;

			if (s.separator) {
				ro = DOM.add(tb, 'tr', {id : o.id, 'class' : cp + 'ItemSeparator'});
				DOM.add(ro, 'td', {'class' : cp + 'ItemSeparator'});

				if (n = ro.previousSibling)
					DOM.addClass(n, 'mceLast');

				return;
			}

			n = ro = DOM.add(tb, 'tr', {id : o.id, 'class' : cp + 'Item ' + cp + 'ItemEnabled'});
			n = it = DOM.add(n, 'td');
			n = a = DOM.add(n, 'a', {href : 'javascript:;', onclick : "return false;", onmousedown : 'return false;'});

			DOM.addClass(it, s['class']);
//			n = DOM.add(n, 'span', {'class' : 'item'});

			ic = DOM.add(n, 'span', {'class' : 'mceIcon' + (s.icon ? ' mce_' + s.icon : '')});

			if (s.icon_src)
				DOM.add(ic, 'img', {src : s.icon_src});

			n = DOM.add(n, s.element || 'span', {'class' : 'mceText', title : o.settings.title}, o.settings.title);

			if (o.settings.style)
				DOM.setAttrib(n, 'style', o.settings.style);

			if (tb.childNodes.length == 1)
				DOM.addClass(ro, 'mceFirst');

			if ((n = ro.previousSibling) && DOM.hasClass(n, cp + 'ItemSeparator'))
				DOM.addClass(ro, 'mceFirst');

			if (o.collapse)
				DOM.addClass(ro, cp + 'ItemSub');

			if (n = ro.previousSibling)
				DOM.removeClass(n, 'mceLast');

			DOM.addClass(ro, 'mceLast');
		}

		});
})(tinymce);(function(tinymce) {
	var DOM = tinymce.DOM;

	tinymce.create('tinymce.ui.Button:tinymce.ui.Control', {
		Button : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceButton';
		},

		renderHTML : function() {
			var cp = this.classPrefix, s = this.settings, h, l;

			l = DOM.encode(s.label || '');
			h = '<a id="' + this.id + '" href="javascript:;" class="' + cp + ' ' + cp + 'Enabled ' + s['class'] + (l ? ' ' + cp + 'Labelled' : '') +'" onmousedown="return false;" onclick="return false;" title="' + DOM.encode(s.title) + '">';

			if (s.image)
				h += '<img class="mceIcon" src="' + s.image + '" />' + l + '</a>';
			else
				h += '<span class="mceIcon ' + s['class'] + '"></span>' + (l ? '<span class="' + cp + 'Label">' + l + '</span>' : '') + '</a>';

			return h;
		},

		postRender : function() {
			var t = this, s = t.settings;

			tinymce.dom.Event.add(t.id, 'click', function(e) {
				if (!t.isDisabled())
					return s.onclick.call(s.scope, e);
			});
		}

		});
})(tinymce);
(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	tinymce.create('tinymce.ui.ListBox:tinymce.ui.Control', {
		ListBox : function(id, s) {
			var t = this;

			t.parent(id, s);
			t.items = [];
			t.onChange = new Dispatcher(t);
			t.onPostRender = new Dispatcher(t);
			t.onAdd = new Dispatcher(t);
			t.onRenderMenu = new tinymce.util.Dispatcher(this);
			t.classPrefix = 'mceListBox';
		},

		select : function(va) {
			var t = this, fv, f;

			if (va == undefined)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && va.call)
				f = va;
			else {
				f = function(v) {
					return v == va;
				};
			}

			// Do we need to do something?
			if (va != t.selectedValue) {
				// Find item
				each(t.items, function(o, i) {
					if (f(o.value)) {
						fv = 1;
						t.selectByIndex(i);
						return false;
					}
				});

				if (!fv)
					t.selectByIndex(-1);
			}
		},

		selectByIndex : function(idx) {
			var t = this, e, o;

			if (idx != t.selectedIndex) {
				e = DOM.get(t.id + '_text');
				o = t.items[idx];

				if (o) {
					t.selectedValue = o.value;
					t.selectedIndex = idx;
					DOM.setHTML(e, DOM.encode(o.title));
					DOM.removeClass(e, 'mceTitle');
				} else {
					DOM.setHTML(e, DOM.encode(t.settings.title));
					DOM.addClass(e, 'mceTitle');
					t.selectedValue = t.selectedIndex = null;
				}

				e = 0;
			}
		},

		add : function(n, v, o) {
			var t = this;

			o = o || {};
			o = tinymce.extend(o, {
				title : n,
				value : v
			});

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		getLength : function() {
			return this.items.length;
		},

		renderHTML : function() {
			var h = '', t = this, s = t.settings, cp = t.classPrefix;

			h = '<table id="' + t.id + '" cellpadding="0" cellspacing="0" class="' + cp + ' ' + cp + 'Enabled' + (s['class'] ? (' ' + s['class']) : '') + '"><tbody><tr>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_text', href : 'javascript:;', 'class' : 'mceText', onclick : "return false;", onmousedown : 'return false;'}, DOM.encode(t.settings.title)) + '</td>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', tabindex : -1, href : 'javascript:;', 'class' : 'mceOpen', onclick : "return false;", onmousedown : 'return false;'}, '<span></span>') + '</td>';
			h += '</tr></tbody></table>';

			return h;
		},

		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(this.id), m;

			if (t.isDisabled() || t.items.length == 0)
				return;

			if (t.menu && t.menu.isMenuVisible)
				return t.hideMenu();

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			p1 = DOM.getPos(this.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.keyboard_focus = !tinymce.isOpera; // Opera is buggy when it comes to auto focus

			// Select in menu
			if (t.oldID)
				m.items[t.oldID].setSelected(0);

			each(t.items, function(o) {
				if (o.value === t.selectedValue) {
					m.items[o.id].setSelected(1);
					t.oldID = o.id;
				}
			});

			m.showMenu(0, e.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			DOM.addClass(t.id, t.classPrefix + 'Selected');

			//DOM.get(t.id + '_text').focus();
		},

		hideMenu : function(e) {
			var t = this;

			// Prevent double toogles by canceling the mouse click event to the button
			if (e && e.type == "mousedown" && (e.target.id == t.id + '_text' || e.target.id == t.id + '_open'))
				return;

			if (!e || !DOM.getParent(e.target, '.mceMenu')) {
				DOM.removeClass(t.id, t.classPrefix + 'Selected');
				Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);

				if (t.menu)
					t.menu.hideMenu();
			}
		},

		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : t.classPrefix + 'Menu mceNoIcons'
                // ATLASSIAN - don't limit height or width, more useful to reveal options
                //, max_width : 150,
				// max_height : 150
			});

			m.onHideMenu.add(t.hideMenu, t);

			m.add({
				title : t.settings.title,
				'class' : 'mceMenuItemTitle',
				onclick : function() {
					if (t.settings.onselect('') !== false)
						t.select(''); // Must be runned after
				}
			});

			each(t.items, function(o) {
				o.id = DOM.uniqueId();
				o.onclick = function() {
					if (t.settings.onselect(o.value) !== false)
						t.select(o.value); // Must be runned after
				};

				m.add(o);
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		postRender : function() {
			var t = this, cp = t.classPrefix;

			Event.add(t.id, 'click', t.showMenu, t);
			Event.add(t.id + '_text', 'focus', function(e) {
				if (!t._focused) {
					t.keyDownHandler = Event.add(t.id + '_text', 'keydown', function(e) {
						var idx = -1, v, kc = e.keyCode;

						// Find current index
						each(t.items, function(v, i) {
							if (t.selectedValue == v.value)
								idx = i;
						});

						// Move up/down
						if (kc == 38)
							v = t.items[idx - 1];
						else if (kc == 40)
							v = t.items[idx + 1];
						else if (kc == 13) {
							// Fake select on enter
							v = t.selectedValue;
							t.selectedValue = null; // Needs to be null to fake change
							t.settings.onselect(v);
							return Event.cancel(e);
						}

						if (v) {
							t.hideMenu();
							t.select(v.value);
						}
					});
				}

				t._focused = 1;
			});
			Event.add(t.id + '_text', 'blur', function() {Event.remove(t.id + '_text', 'keydown', t.keyDownHandler); t._focused = 0;});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.addClass(t.id, cp + 'Hover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.removeClass(t.id, cp + 'Hover');
				});
			}

			t.onPostRender.dispatch(t, DOM.get(t.id));
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_text');
			Event.clear(this.id + '_open');
		}

		});
})(tinymce);(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	tinymce.create('tinymce.ui.NativeListBox:tinymce.ui.ListBox', {
		NativeListBox : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceNativeListBox';
		},

		setDisabled : function(s) {
			DOM.get(this.id).disabled = s;
		},

		isDisabled : function() {
			return DOM.get(this.id).disabled;
		},

		select : function(va) {
			var t = this, fv, f;

			if (va == undefined)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && va.call)
				f = va;
			else {
				f = function(v) {
					return v == va;
				};
			}

			// Do we need to do something?
			if (va != t.selectedValue) {
				// Find item
				each(t.items, function(o, i) {
					if (f(o.value)) {
						fv = 1;
						t.selectByIndex(i);
						return false;
					}
				});

				if (!fv)
					t.selectByIndex(-1);
			}
		},

		selectByIndex : function(idx) {
			DOM.get(this.id).selectedIndex = idx + 1;
			this.selectedValue = this.items[idx] ? this.items[idx].value : null;
		},

		add : function(n, v, a) {
			var o, t = this;

			a = a || {};
			a.value = v;

			if (t.isRendered())
				DOM.add(DOM.get(this.id), 'option', a, n);

			o = {
				title : n,
				value : v,
				attribs : a
			};

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		getLength : function() {
			return DOM.get(this.id).options.length - 1;
		},

		renderHTML : function() {
			var h, t = this;

			h = DOM.createHTML('option', {value : ''}, '-- ' + t.settings.title + ' --');

			each(t.items, function(it) {
				h += DOM.createHTML('option', {value : it.value}, it.title);
			});

			h = DOM.createHTML('select', {id : t.id, 'class' : 'mceNativeListBox'}, h);

			return h;
		},

		postRender : function() {
			var t = this, ch;

			t.rendered = true;

			function onChange(e) {
				var v = t.items[e.target.selectedIndex - 1];

				if (v && (v = v.value)) {
					t.onChange.dispatch(t, v);

					if (t.settings.onselect)
						t.settings.onselect(v);
				}
			};

			Event.add(t.id, 'change', onChange);

			// Accessibility keyhandler
			Event.add(t.id, 'keydown', function(e) {
				var bf;

				Event.remove(t.id, 'change', ch);

				bf = Event.add(t.id, 'blur', function() {
					Event.add(t.id, 'change', onChange);
					Event.remove(t.id, 'blur', bf);
				});

				if (e.keyCode == 13 || e.keyCode == 32) {
					onChange(e);
					return Event.cancel(e);
				}
			});

			t.onPostRender.dispatch(t, DOM.get(t.id));
		}

		});
})(tinymce);(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	tinymce.create('tinymce.ui.MenuButton:tinymce.ui.Button', {
		MenuButton : function(id, s) {
			this.parent(id, s);
			this.onRenderMenu = new tinymce.util.Dispatcher(this);
			s.menu_container = s.menu_container || DOM.doc.body;
		},

		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(t.id), m;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			if (t.isMenuVisible)
				return t.hideMenu();

			p1 = DOM.getPos(t.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.vp_offset_x = p2.x;
			m.settings.vp_offset_y = p2.y;
			m.settings.keyboard_focus = t._focused;
			m.showMenu(0, e.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			t.setState('Selected', 1);

			t.isMenuVisible = 1;
		},

		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : this.classPrefix + 'Menu',
				icons : t.settings.icons
			});

			m.onHideMenu.add(t.hideMenu, t);

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		hideMenu : function(e) {
			var t = this;

			// Prevent double toogles by canceling the mouse click event to the button
			if (e && e.type == "mousedown" && DOM.getParent(e.target, function(e) {return e.id === t.id || e.id === t.id + '_open';}))
				return;

			if (!e || !DOM.getParent(e.target, '.mceMenu')) {
				t.setState('Selected', 0);
				Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
				if (t.menu)
					t.menu.hideMenu();
			}

			t.isMenuVisible = 0;
		},

		postRender : function() {
			var t = this, s = t.settings;

			Event.add(t.id, 'click', function() {
				if (!t.isDisabled()) {
					if (s.onclick)
						s.onclick(t.value);

					t.showMenu();
				}
			});
		}

		});
})(tinymce);
(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	tinymce.create('tinymce.ui.SplitButton:tinymce.ui.MenuButton', {
		SplitButton : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceSplitButton';
		},

		renderHTML : function() {
			var h, t = this, s = t.settings, h1;

			h = '<tbody><tr>';

			if (s.image)
				h1 = DOM.createHTML('img ', {src : s.image, 'class' : 'mceAction ' + s['class']});
			else
				h1 = DOM.createHTML('span', {'class' : 'mceAction ' + s['class']}, '');

			h += '<td>' + DOM.createHTML('a', {id : t.id + '_action', href : 'javascript:;', 'class' : 'mceAction ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';

			h1 = DOM.createHTML('span', {'class' : 'mceOpen ' + s['class']});
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', href : 'javascript:;', 'class' : 'mceOpen ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';

			h += '</tr></tbody>';

			return DOM.createHTML('table', {id : t.id, 'class' : 'mceSplitButton mceSplitButtonEnabled ' + s['class'], cellpadding : '0', cellspacing : '0', onmousedown : 'return false;', title : s.title}, h);
		},

		postRender : function() {
			var t = this, s = t.settings;

			if (s.onclick) {
				Event.add(t.id + '_action', 'click', function() {
					if (!t.isDisabled())
						s.onclick(t.value);
				});
			}

			Event.add(t.id + '_open', 'click', t.showMenu, t);
			Event.add(t.id + '_open', 'focus', function() {t._focused = 1;});
			Event.add(t.id + '_open', 'blur', function() {t._focused = 0;});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.addClass(t.id, 'mceSplitButtonHover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.removeClass(t.id, 'mceSplitButtonHover');
				});
			}
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_action');
			Event.clear(this.id + '_open');
		}

		});
})(tinymce);
(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, is = tinymce.is, each = tinymce.each;

	tinymce.create('tinymce.ui.ColorSplitButton:tinymce.ui.SplitButton', {
		ColorSplitButton : function(id, s) {
			var t = this;

			t.parent(id, s);

			t.settings = s = tinymce.extend({
				colors : '000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,008000,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF',
				grid_width : 8,
				default_color : '#888888'
			}, t.settings);

			t.onShowMenu = new tinymce.util.Dispatcher(t);
			t.onHideMenu = new tinymce.util.Dispatcher(t);

			t.value = s.default_color;
		},

		showMenu : function() {
			var t = this, r, p, e, p2;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			if (t.isMenuVisible)
				return t.hideMenu();

			e = DOM.get(t.id);
			DOM.show(t.id + '_menu');
			DOM.addClass(e, 'mceSplitButtonSelected');
			p2 = DOM.getPos(e);
			DOM.setStyles(t.id + '_menu', {
				left : p2.x,
				top : p2.y + e.clientHeight,
				zIndex : 200000
			});
			e = 0;

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			t.onShowMenu.dispatch(t);

			if (t._focused) {
				t._keyHandler = Event.add(t.id + '_menu', 'keydown', function(e) {
					if (e.keyCode == 27)
						t.hideMenu();
				});

				DOM.select('a', t.id + '_menu')[0].focus(); // Select first link
			}

			t.isMenuVisible = 1;
		},

		hideMenu : function(e) {
			var t = this;

			// Prevent double toogles by canceling the mouse click event to the button
			if (e && e.type == "mousedown" && DOM.getParent(e.target, function(e) {return e.id === t.id + '_open';}))
				return;

			if (!e || !DOM.getParent(e.target, '.mceSplitButtonMenu')) {
				DOM.removeClass(t.id, 'mceSplitButtonSelected');
				Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
				Event.remove(t.id + '_menu', 'keydown', t._keyHandler);
				DOM.hide(t.id + '_menu');
			}

			t.onHideMenu.dispatch(t);

			t.isMenuVisible = 0;
		},

		renderMenu : function() {
			var t = this, m, i = 0, s = t.settings, n, tb, tr, w;

			w = DOM.add(s.menu_container, 'div', {id : t.id + '_menu', 'class' : s['menu_class'] + ' ' + s['class'], style : 'position:absolute;left:0;top:-1000px;'});
			m = DOM.add(w, 'div', {'class' : s['class'] + ' mceSplitButtonMenu'});
			DOM.add(m, 'span', {'class' : 'mceMenuLine'});

			n = DOM.add(m, 'table', {'class' : 'mceColorSplitMenu'});
			tb = DOM.add(n, 'tbody');

			// Generate color grid
			i = 0;
			each(is(s.colors, 'array') ? s.colors : s.colors.split(','), function(c) {
				c = c.replace(/^#/, '');

				if (!i--) {
					tr = DOM.add(tb, 'tr');
					i = s.grid_width - 1;
				}

				n = DOM.add(tr, 'td');

				n = DOM.add(n, 'a', {
					href : 'javascript:;',
					style : {
						backgroundColor : '#' + c
					},
					mce_color : '#' + c
				});
			});

			if (s.more_colors_func) {
				n = DOM.add(tb, 'tr');
				n = DOM.add(n, 'td', {colspan : s.grid_width, 'class' : 'mceMoreColors'});
				n = DOM.add(n, 'a', {id : t.id + '_more', href : 'javascript:;', onclick : 'return false;', 'class' : 'mceMoreColors'}, s.more_colors_title);

				Event.add(n, 'click', function(e) {
					s.more_colors_func.call(s.more_colors_scope || this);
					return Event.cancel(e); // Cancel to fix onbeforeunload problem
				});
			}

			DOM.addClass(m, 'mceColorSplitMenu');

			Event.add(t.id + '_menu', 'click', function(e) {
				var c;

				e = e.target;

				if (e.nodeName == 'A' && (c = e.getAttribute('mce_color')))
					t.setColor(c);

				return Event.cancel(e); // Prevent IE auto save warning
			});

			return w;
		},

		setColor : function(c) {
			var t = this;

			DOM.setStyle(t.id + '_preview', 'backgroundColor', c);

			t.value = c;
			t.hideMenu();
			t.settings.onselect(c);
		},

		postRender : function() {
			var t = this, id = t.id;

			t.parent();
			DOM.add(id + '_action', 'div', {id : id + '_preview', 'class' : 'mceColorPreview'});
			DOM.setStyle(t.id + '_preview', 'backgroundColor', t.value);
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_menu');
			Event.clear(this.id + '_more');
			DOM.remove(this.id + '_menu');
		}

		});
})(tinymce);
tinymce.create('tinymce.ui.Toolbar:tinymce.ui.Container', {
	renderHTML : function() {
		var t = this, h = '', c, co, dom = tinymce.DOM, s = t.settings, i, pr, nx, cl;

		cl = t.controls;
		for (i=0; i<cl.length; i++) {
			// Get current control, prev control, next control and if the control is a list box or not
			co = cl[i];
			pr = cl[i - 1];
			nx = cl[i + 1];

			// Add toolbar start
			if (i === 0) {
				c = 'mceToolbarStart';

				if (co.Button)
					c += ' mceToolbarStartButton';
				else if (co.SplitButton)
					c += ' mceToolbarStartSplitButton';
				else if (co.ListBox)
					c += ' mceToolbarStartListBox';

				h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Add toolbar end before list box and after the previous button
			// This is to fix the o2k7 editor skins
			if (pr && co.ListBox) {
				if (pr.Button || pr.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarEnd'}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Render control HTML

			// IE 8 quick fix, needed to propertly generate a hit area for anchors
			if (dom.stdMode)
				h += '<td style="position: relative">' + co.renderHTML() + '</td>';
			else
				h += '<td>' + co.renderHTML() + '</td>';

			// Add toolbar start after list box and before the next button
			// This is to fix the o2k7 editor skins
			if (nx && co.ListBox) {
				if (nx.Button || nx.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}

		c = 'mceToolbarEnd';

		if (co.Button)
			c += ' mceToolbarEndButton';
		else if (co.SplitButton)
			c += ' mceToolbarEndSplitButton';
		else if (co.ListBox)
			c += ' mceToolbarEndListBox';

		h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));

		return dom.createHTML('table', {id : t.id, 'class' : 'mceToolbar' + (s['class'] ? ' ' + s['class'] : ''), cellpadding : '0', cellspacing : '0', align : t.settings.align || ''}, '<tbody><tr>' + h + '</tr></tbody>');
	}

	});
(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each;

	tinymce.create('tinymce.AddOnManager', {
		items : [],
		urls : {},
		lookup : {},
		onAdd : new Dispatcher(this),

		get : function(n) {
			return this.lookup[n];
		},

		requireLangPack : function(n) {
			var u, s = tinymce.EditorManager.settings;

			if (s && s.language) {
				u = this.urls[n] + '/langs/' + s.language + '.js';

				if (!tinymce.dom.Event.domLoaded && !s.strict_mode)
					tinymce.ScriptLoader.load(u);
				else
					tinymce.ScriptLoader.add(u);
			}
		},

		add : function(id, o) {
			this.items.push(o);
			this.lookup[id] = o;
			this.onAdd.dispatch(this, id, o);

			return o;
		},

		load : function(n, u, cb, s) {
			var t = this;

			if (t.urls[n])
				return;

			if (u.indexOf('/') != 0 && u.indexOf('://') == -1)
				u = tinymce.baseURL + '/' +  u;

			t.urls[n] = u.substring(0, u.lastIndexOf('/'));
            // ATLASSIAN - We load the scripts via requireResources
            //tinymce.ScriptLoader.add(u, cb, s);
            AJS.log("Script for [" + n + "] will not be loaded by TinyMCE. Please use Atlassian's requireResource.");
        }

		});

	// Create plugin and theme managers
	tinymce.PluginManager = new tinymce.AddOnManager();
	tinymce.ThemeManager = new tinymce.AddOnManager();
}(tinymce));(function(tinymce) {
	// Shorten names
	var each = tinymce.each, extend = tinymce.extend, DOM = tinymce.DOM, Event = tinymce.dom.Event, ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager, explode = tinymce.explode;

	tinymce.create('static tinymce.EditorManager', {
		editors : {},
		i18n : {},
		activeEditor : null,

		preInit : function() {
            AJS.log("EditorManager.preInit");
			var t = this, lo = window.location;

            //ATLASSIAN - Use the TinyMCE plugin url as the document base
			// Setup some URLs where the editor API is located and where the document is
			tinymce.documentBaseURL =  tinymce.baseURL;
			AJS.log("tinymce.documentBaseURL = " + tinymce.documentBaseURL);
			if (!/[\/\\]$/.test(tinymce.documentBaseURL))
				tinymce.documentBaseURL += '/';

            var parts = tinymce.documentBaseURL.match(/(.*)\/s\/.*\/_(\/[^\?]*).*/);
            if (parts.length == 3) { // we remove the caching part of the url
                tinymce.documentBaseURL = parts[1] + parts[2];
            }
            AJS.log("EditorManager.preInit tinymce.documentBaseURL=" + tinymce.documentBaseURL);

			tinymce.baseURL = new tinymce.util.URI(tinymce.documentBaseURL).toAbsolute(tinymce.baseURL);
			tinymce.EditorManager.baseURI = new tinymce.util.URI(tinymce.baseURL);

			// Add before unload listener
			// This was required since IE was leaking memory if you added and removed beforeunload listeners
			// with attachEvent/detatchEvent so this only adds one listener and instances can the attach to the onBeforeUnload event
			t.onBeforeUnload = new tinymce.util.Dispatcher(t);

			// Must be on window or IE will leak if the editor is placed in frame or iframe
			Event.add(window, 'beforeunload', function(e) {
				t.onBeforeUnload.dispatch(t, e);
			});
		},

		init : function(s) {
            AJS.log("http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/EditorManager.init");
			var t = this, pl, sl = tinymce.ScriptLoader, c, e, el = [], ed;

			function execCallback(se, n, s) {
				var f = se[n];

				if (!f)
					return;

				if (tinymce.is(f, 'string')) {
					s = f.replace(/\.\w+$/, '');
					s = s ? tinymce.resolve(s) : 0;
					f = tinymce.resolve(f);
				}

				return f.apply(s || this, Array.prototype.slice.call(arguments, 2));
			};

			s = extend({
				theme : "simple",
				language : "en",
				strict_loading_mode : document.contentType == 'application/xhtml+xml'
			}, s);

			t.settings = s;

            // ATLASSIAN - No need to load any scripts, all loaded via #requireResource

            // ATLASSIAN - In tinyMCE the following block is added as an onInit event for "legacy" reasons that don't
            // apply to us, so we just execute it.
            {
				var l, co;

				execCallback(s, 'onpageload');

				// Verify that it's a valid browser
				if (s.browsers) {
					l = false;

					each(explode(s.browsers), function(v) {
						switch (v) {
							case 'ie':
							case 'msie':
								if (tinymce.isIE)
									l = true;
								break;

							case 'gecko':
								if (tinymce.isGecko)
									l = true;
								break;

							case 'safari':
							case 'webkit':
								if (tinymce.isWebKit)
									l = true;
								break;

							case 'opera':
								if (tinymce.isOpera)
									l = true;

								break;
						}
					});

					// Not a valid one
					if (!l)
                        return;
                    }

				switch (s.mode) {
					case "exact":
						l = s.elements || '';

						if(l.length > 0) {
							each(explode(l), function(v) {
								if (DOM.get(v)) {
									ed = new tinymce.Editor(v, s);
									el.push(ed);
									ed.render(1);
								} else {
									c = 0;

									each(document.forms, function(f) {
										each(f.elements, function(e) {
											if (e.name === v) {
												v = 'mce_editor_' + c;
												DOM.setAttrib(e, 'id', v);

												ed = new tinymce.Editor(v, s);
												el.push(ed);
												ed.render(1);
											}
										});
									});
								}
							});
						}
						break;

					case "textareas":
					case "specific_textareas":
						function hasClass(n, c) {
							return c.constructor === RegExp ? c.test(n.className) : DOM.hasClass(n, c);
						};

						each(DOM.select('textarea'), function(v) {
							if (s.editor_deselector && hasClass(v, s.editor_deselector))
								return;

							if (!s.editor_selector || hasClass(v, s.editor_selector)) {
								// Can we use the name
								e = DOM.get(v.name);
								if (!v.id && !e)
									v.id = v.name;

								// Generate unique name if missing or already exists
								if (!v.id || t.get(v.id))
									v.id = DOM.uniqueId();

								ed = new tinymce.Editor(v.id, s);
								el.push(ed);
								ed.render(1);
							}
						});
						break;
				}

				// Call onInit when all editors are initialized
				if (s.oninit) {
					l = co = 0;

					each (el, function(ed) {
						co++;

						if (!ed.initialized) {
							// Wait for it
							ed.onInit.add(function() {
								l++;

								// All done
								if (l == co)
									execCallback(s, 'oninit');
							});
						} else
							l++;

						// All done
						if (l == co)
							execCallback(s, 'oninit');
					});
				}
                AJS.log("finish s.oninit");
            }
		},

		get : function(id) {
			return this.editors[id];
		},

		getInstanceById : function(id) {
			return this.get(id);
		},

		add : function(e) {
			this.editors[e.id] = e;
			this._setActive(e);

			return e;
		},

		remove : function(e) {
			var t = this;

			// Not in the collection
			if (!t.editors[e.id])
				return null;

			delete t.editors[e.id];

			// Select another editor since the active one was removed
			if (t.activeEditor == e) {
				t._setActive(null);

				each(t.editors, function(e) {
					t._setActive(e);
					return false; // Break
				});
			}

			e.destroy();

			return e;
		},

		execCommand : function(c, u, v) {
			var t = this, ed = t.get(v), w;

			// Manager commands
			switch (c) {
				case "mceFocus":
					ed.focus();
					return true;

				case "mceAddEditor":
				case "mceAddControl":
					if (!t.get(v))
						new tinymce.Editor(v, t.settings).render();

					return true;

				case "mceAddFrameControl":
					w = v.window;

					// Add tinyMCE global instance and tinymce namespace to specified window
					w.tinyMCE = tinyMCE;
					w.tinymce = tinymce;

					tinymce.DOM.doc = w.document;
					tinymce.DOM.win = w;

					ed = new tinymce.Editor(v.element_id, v);
					ed.render();

					// Fix IE memory leaks
					if (tinymce.isIE) {
						function clr() {
							ed.destroy();
							w.detachEvent('onunload', clr);
							w = w.tinyMCE = w.tinymce = null; // IE leak
						};

						w.attachEvent('onunload', clr);
					}

					v.page_window = null;

					return true;

				case "mceRemoveEditor":
				case "mceRemoveControl":
					if (ed)
						ed.remove();

					return true;

				case 'mceToggleEditor':
					if (!ed) {
						t.execCommand('mceAddControl', 0, v);
						return true;
					}

					if (ed.isHidden())
						ed.show();
					else
						ed.hide();

					return true;
			}

			// Run command on active editor
			if (t.activeEditor)
				return t.activeEditor.execCommand(c, u, v);

			return false;
		},

		execInstanceCommand : function(id, c, u, v) {
			var ed = this.get(id);

			if (ed)
				return ed.execCommand(c, u, v);

			return false;
		},

		triggerSave : function() {
			each(this.editors, function(e) {
				e.save();
			});
		},

		addI18n : function(p, o) {
			var lo, i18n = this.i18n;

			if (!tinymce.is(p, 'string')) {
				each(p, function(o, lc) {
					each(o, function(o, g) {
						each(o, function(o, k) {
							if (g === 'common')
								i18n[lc + '.' + k] = o;
							else
								i18n[lc + '.' + g + '.' + k] = o;
						});
					});
				});
			} else {
				each(o, function(o, k) {
					i18n[p + '.' + k] = o;
				});
			}
		},

		// Private methods

		_setActive : function(e) {
			this.selectedInstance = this.activeEditor = e;
		}

		});

	tinymce.EditorManager.preInit();
})(tinymce);

// Short for editor manager window.tinyMCE is needed when TinyMCE gets loaded though a XHR call
var tinyMCE = window.tinyMCE = tinymce.EditorManager;
(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend, Dispatcher = tinymce.util.Dispatcher;
	var each = tinymce.each, isGecko = tinymce.isGecko, isIE = tinymce.isIE, isWebKit = tinymce.isWebKit;
	var is = tinymce.is, ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager, EditorManager = tinymce.EditorManager;
	var inArray = tinymce.inArray, grep = tinymce.grep, explode = tinymce.explode;

	tinymce.create('tinymce.Editor', {
		Editor : function(id, s) {
            AJS.log("Editor: creating Editor");
			var t = this;

			t.id = t.editorId = id;
			t.execCommands = {};
			t.queryStateCommands = {};
			t.queryValueCommands = {};
			t.plugins = {};

			// Add events to the editor
			each([
				'onPreInit',
				'onBeforeRenderUI',
				'onPostRender',
				'onInit',
				'onRemove',
				'onActivate',
				'onDeactivate',
				'onClick',
				'onEvent',
				'onMouseUp',
				'onMouseDown',
				'onDblClick',
				'onKeyDown',
				'onKeyUp',
				'onKeyPress',
				'onContextMenu',
				'onSubmit',
				'onReset',
				'onPaste',
				'onPreProcess',
				'onPostProcess',
				'onBeforeSetContent',
				'onBeforeGetContent',
				'onSetContent',
				'onGetContent',
				'onLoadContent',
				'onSaveContent',
				'onNodeChange',
				'onChange',
				'onBeforeExecCommand',
				'onExecCommand',
				'onUndo',
				'onRedo',
				'onVisualAid',
				'onSetProgressState'
			], function(e) {
				t[e] = new Dispatcher(t);
			});

			// Default editor config
			t.settings = s = extend({
				id : id,
				language : 'en',
				docs_language : 'en',
				theme : 'simple',
				skin : 'default',
				delta_width : 0,
				delta_height : 0,
				popup_css : '',
				plugins : '',
				document_base_url : tinymce.documentBaseURL,
				add_form_submit_trigger : 1,
				submit_patch : 1,
				add_unload_trigger : 1,
				convert_urls : 1,
				relative_urls : 1,
				remove_script_host : 1,
				table_inline_editing : 0,
				object_resizing : 1,
				cleanup : 1,
				accessibility_focus : 1,
				custom_shortcuts : 1,
				custom_undo_redo_keyboard_shortcuts : 1,
				custom_undo_redo_restore_selection : 1,
				custom_undo_redo : 1,
				doctype : '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">',
				visual_table_class : 'mceItemTable',
				visual : 1,
				inline_styles : true,
				convert_fonts_to_spans : true,
				font_size_style_values : 'xx-small,x-small,small,medium,large,x-large,xx-large',
				apply_source_formatting : 1,
				directionality : 'ltr',
				forced_root_block : 'p',
				valid_elements : '@[id|class|style|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],a[rel|rev|charset|hreflang|tabindex|accesskey|type|name|href|target|title|class|onfocus|onblur],strong/b,em/i,strike,u,#p[align],-ol[type|compact],-ul[type|compact],-li,br,img[longdesc|usemap|src|border|alt=|title|hspace|vspace|width|height|align],-sub,-sup,-blockquote[cite],-table[border=0|cellspacing|cellpadding|width|frame|rules|height|align|summary|bgcolor|background|bordercolor],-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],#th[colspan|rowspan|width|height|align|valign|scope],caption,-div,-span,-code,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],-font[face|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],object[classid|width|height|codebase|*],param[name|value],embed[type|width|height|src|*],script[src|type],map[name],area[shape|coords|href|alt|target],bdo,button,col[align|char|charoff|span|valign|width],colgroup[align|char|charoff|span|valign|width],dfn,fieldset,form[action|accept|accept-charset|enctype|method],input[accept|alt|checked|disabled|maxlength|name|readonly|size|src|type|value|tabindex|accesskey],kbd,label[for],legend,noscript,optgroup[label|disabled],option[disabled|label|selected|value],q[cite],samp,select[disabled|multiple|name|size],small,textarea[cols|rows|disabled|name|readonly],tt,var,big',
				hidden_input : 1,
				padd_empty_editor : 1,
				render_ui : 1,
				init_theme : 1,
				force_p_newlines : 1,
				indentation : '30px',
				keep_styles : 1,
				fix_table_elements : 1,
				removeformat_selector : 'span,b,strong,em,i,font,u,strike'
			}, s);

			// Setup URIs
			t.documentBaseURI = new tinymce.util.URI(s.document_base_url || tinymce.documentBaseURL, {
				base_uri : tinyMCE.baseURI
			});
			t.baseURI = EditorManager.baseURI;

			// Call setup
			t.execCallback('setup', t);
		},

		render : function(nst) {
            AJS.log("Editor:render starting");
            var t = this, s = t.settings, id = t.id, sl = tinymce.ScriptLoader;
			// ATLASSIAN - No need for this as we initialise TinyMCE on DOM ready
            // Page is not loaded yet, wait for it
//			if (!Event.domLoaded) {
//                console.log("!Event.domLoaded");
//                Event.add(document, 'init', function() {
//					t.render();
//				});
//				return;
//			}

			// Force strict loading mode if render us called by user and not internally
			if (!nst) {
				s.strict_loading_mode = 1;
				tinyMCE.settings = s;
			}

			// Element not found, then skip initialization
			if (!t.getElement())
                return;

			if (s.strict_loading_mode) {
				sl.settings.strict_mode = s.strict_loading_mode;
				tinymce.DOM.settings.strict = 1;
			}

			// Add hidden input for non input elements inside form elements
			if (!/TEXTAREA|INPUT/i.test(t.getElement().nodeName) && s.hidden_input && DOM.getParent(id, 'form'))
				DOM.insertAfter(DOM.create('input', {type : 'hidden', name : id}), id);

			if (tinymce.WindowManager)
				t.windowManager = new tinymce.WindowManager(t);

			if (s.encoding == 'xml') {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = DOM.encode(o.content);
				});
			}

			if (s.add_form_submit_trigger) {
				t.onSubmit.addToTop(function() {
					if (t.initialized) {
						t.save();
						t.isNotDirty = 1;
					}
				});
			}

			if (s.add_unload_trigger) {
				t._beforeUnload = tinyMCE.onBeforeUnload.add(function() {
					if (t.initialized && !t.destroyed && !t.isHidden())
						t.save({format : 'raw', no_events : true});
				});
			}

			tinymce.addUnload(t.destroy, t);

			if (s.submit_patch) {
				t.onBeforeRenderUI.add(function() {
					var n = t.getElement().form;

					if (!n)
						return;

					// Already patched
					if (n._mceOldSubmit)
						return;

					// Check page uses id="submit" or name="submit" for it's submit button
					if (!n.submit.nodeType && !n.submit.length) {
						t.formElement = n;
						n._mceOldSubmit = n.submit;
						n.submit = function() {
							// Save all instances
							EditorManager.triggerSave();
							t.isNotDirty = 1;

							return t.formElement._mceOldSubmit(t.formElement);
						};
					}

					n = null;
				});
			}

            // ATLASSIAN - Don't actually load anything - scripts are all loaded via #requireResource
			// Load scripts
			function loadScripts() {
//				if (s.language)
//					sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

				if (s.theme && s.theme.charAt(0) != '-' && !ThemeManager.urls[s.theme])
					ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				each(explode(s.plugins), function(p) {
					if (p && p.charAt(0) != '-' && !PluginManager.urls[p]) {
						// Skip safari plugin for other browsers
						if (!isWebKit && p == 'safari')
							return;

						PluginManager.load(p, 'plugins/' + p + '/editor_plugin' + tinymce.suffix + '.js');
					}
				});
                //ATLASSIAN - No need to use the script loader, just init immediately
				// Init when que is loaded
//				sl.loadQueue(function() {
					if (!t.removed)
						t.init();
//				});
			};

			// Load compat2x first
			if (s.plugins.indexOf('compat2x') != -1) {
				PluginManager.load('compat2x', 'plugins/compat2x/editor_plugin' + tinymce.suffix + '.js');
				sl.loadQueue(loadScripts);
			} else
				loadScripts();
		},

		init : function() {
            AJS.log("Editor:init starting");
			var n, t = this, s = t.settings, w, h, e = t.getElement(), o, ti, u, bi, bc, re;

			EditorManager.add(t);

			// Create theme
			if (s.theme) {
				s.theme = s.theme.replace(/-/, '');
				o = ThemeManager.get(s.theme);
				t.theme = new o();

				if (t.theme.init && s.init_theme)
					t.theme.init(t, ThemeManager.urls[s.theme] || tinymce.documentBaseURL.replace(/\/$/, ''));
			}

			// Create all plugins
			each(explode(s.plugins.replace(/\-/g, '')), function(p) {
				var c = PluginManager.get(p), u = PluginManager.urls[p] || tinymce.documentBaseURL.replace(/\/$/, ''), po;

				if (c) {
					po = new c(t, u);

					t.plugins[p] = po;

					if (po.init)
						po.init(t, u);
				}
			});

			// Setup popup CSS path(s)
			if (s.popup_css !== false) {
				if (s.popup_css)
					s.popup_css = t.documentBaseURI.toAbsolute(s.popup_css);
				else
					s.popup_css = t.baseURI.toAbsolute("themes/" + s.theme + "/skins/" + s.skin + "/dialog.css");
			}

			if (s.popup_css_add)
				s.popup_css += ',' + t.documentBaseURI.toAbsolute(s.popup_css_add);

			// Setup control factory
			t.controlManager = new tinymce.ControlManager(t);
			t.undoManager = new tinymce.UndoManager(t);

			// Pass through
			t.undoManager.onAdd.add(function(um, l) {
				if (!l.initial)
					return t.onChange.dispatch(t, l, um);
			});

			t.undoManager.onUndo.add(function(um, l) {
				return t.onUndo.dispatch(t, l, um);
			});

			t.undoManager.onRedo.add(function(um, l) {
				return t.onRedo.dispatch(t, l, um);
			});

			if (s.custom_undo_redo) {
				t.onExecCommand.add(function(ed, cmd, ui, val, a) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!a || !a.skip_undo))
						t.undoManager.add();
				});
			}

			t.onExecCommand.add(function(ed, c) {
				// Don't refresh the select lists until caret move
				if (!/^(FontName|FontSize)$/.test(c))
					t.nodeChanged();
			});

			// Remove ghost selections on images and tables in Gecko
			if (isGecko) {
				function repaint(a, o) {
					if (!o || !o.initial)
						t.execCommand('mceRepaint');
				};

				t.onUndo.add(repaint);
				t.onRedo.add(repaint);
				t.onSetContent.add(repaint);
			}

			// Enables users to override the control factory
			t.onBeforeRenderUI.dispatch(t, t.controlManager);

			// Measure box
			if (s.render_ui) {
				w = s.width || e.style.width || e.offsetWidth;
				h = s.height || e.style.height || e.offsetHeight;
				t.orgDisplay = e.style.display;
				re = /^[0-9\.]+(|px)$/i;

				if (re.test('' + w))
					w = Math.max(parseInt(w) + (o.deltaWidth || 0), 100);

				if (re.test('' + h))
					h = Math.max(parseInt(h) + (o.deltaHeight || 0), 100);

				// Render UI
				o = t.theme.renderUI({
					targetNode : e,
					width : w,
					height : h,
					deltaWidth : s.delta_width,
					deltaHeight : s.delta_height
				});

				t.editorContainer = o.editorContainer;
			}


			// User specified a document.domain value
			if (document.domain && location.hostname != document.domain)
				tinymce.relaxedDomain = document.domain;

			// Resize editor
			DOM.setStyles(o.sizeContainer || o.editorContainer, {
				width : w,
				height : h
			});

			h = (o.iframeHeight || h) + (typeof(h) == 'number' ? (o.deltaHeight || 0) : '');
			if (h < 100)
				h = 100;

            // ATLASSIAN - use the user's current base url for the iframe
            AJS.log("Editor:init iframe base href=" + AJS.Editor.Adapter.getCurrentBaseUrl());

			t.iframeHTML = s.doctype + '<html><head xmlns="http://www.w3.org/1999/xhtml">';

			// We only need to override paths if we have to
			// IE has a bug where it remove site absolute urls to relative ones if this is specified
			if (s.document_base_url != tinymce.documentBaseURL)
				t.iframeHTML += '<base href="' + AJS.Editor.Adapter.getCurrentBaseUrl() + '" />';

			t.iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

			if (tinymce.relaxedDomain)
				t.iframeHTML += '<script type="text/javascript">document.domain = "' + tinymce.relaxedDomain + '";</script>';

			bi = s.body_id || 'tinymce';
			if (bi.indexOf('=') != -1) {
				bi = t.getParam('body_id', '', 'hash');
				bi = bi[t.id] || bi;
			}

			bc = s.body_class || '';
			if (bc.indexOf('=') != -1) {
				bc = t.getParam('body_class', '', 'hash');
				bc = bc[t.id] || '';
			}

			t.iframeHTML += '</head><body id="' + bi + '" class="mceContentBody ' + bc + '"></body></html>';

			// Domain relaxing enabled, then set document domain
			if (tinymce.relaxedDomain) {
				// We need to write the contents here in IE since multiple writes messes up refresh button and back button
				if (isIE || (tinymce.isOpera && parseFloat(opera.version()) >= 9.5))
					u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";var ed = window.parent.tinyMCE.get("' + t.id + '");document.write(ed.iframeHTML);document.close();ed.setupIframe();})()';
				else if (tinymce.isOpera)
					u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";document.close();ed.setupIframe();})()';					
			}

			// Create iframe
			n = DOM.add(o.iframeContainer, 'iframe', {
				id : t.id + "_ifr",
				src : u || 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder : '0',
				style : {
					width : '100%',
					height : h
				}
			});

			t.contentAreaContainer = o.iframeContainer;
			DOM.get(o.editorContainer).style.display = t.orgDisplay;
			DOM.get(t.id).style.display = 'none';

			if (!isIE || !tinymce.relaxedDomain)
				t.setupIframe();

			e = n = o = null; // Cleanup
            AJS.log("Editor:init finished rendering editor!!!");
		},

		setupIframe : function() {
			var t = this, s = t.settings, e = DOM.get(t.id), d = t.getDoc(), h, b;
            AJS.log("Editor:setupIframe isIE=" + isIE);

			// Setup iframe body
			if (!isIE || !tinymce.relaxedDomain) {
				d.open();
				d.write(t.iframeHTML);
				d.close();
			}

			// Design mode needs to be added here Ctrl+A will fail otherwise
			if (!isIE) {
				try {
					if (!s.readonly)
						d.designMode = 'On';
				} catch (ex) {
					// Will fail on Gecko if the editor is placed in an hidden container element
					// The design mode will be set ones the editor is focused
				}
			}

			// IE needs to use contentEditable or it will display non secure items for HTTPS
			if (isIE) {
				// It will not steal focus if we hide it while setting contentEditable
				b = t.getBody();
				DOM.hide(b);

				if (!s.readonly)
					b.contentEditable = true;

				DOM.show(b);
			}

			// Setup objects
			t.dom = new tinymce.DOM.DOMUtils(t.getDoc(), {
				keep_values : true,
				url_converter : t.convertURL,
				url_converter_scope : t,
				hex_colors : s.force_hex_style_colors,
				class_filter : s.class_filter,
				update_styles : 1,
				fix_ie_paragraphs : 1
			});

			t.serializer = new tinymce.dom.Serializer({
				entity_encoding : s.entity_encoding,
				entities : s.entities,
				valid_elements : s.verify_html === false ? '*[*]' : s.valid_elements,
				extended_valid_elements : s.extended_valid_elements,
				valid_child_elements : s.valid_child_elements,
				invalid_elements : s.invalid_elements,
				fix_table_elements : s.fix_table_elements,
				fix_list_elements : s.fix_list_elements,
				fix_content_duplication : s.fix_content_duplication,
				convert_fonts_to_spans : s.convert_fonts_to_spans,
				font_size_classes  : s.font_size_classes,
				font_size_style_values : s.font_size_style_values,
				apply_source_formatting : s.apply_source_formatting,
				remove_linebreaks : s.remove_linebreaks,
				element_format : s.element_format,
				dom : t.dom
			});

			t.selection = new tinymce.dom.Selection(t.dom, t.getWin(), t.serializer);
			t.forceBlocks = new tinymce.ForceBlocks(t, {
				forced_root_block : s.forced_root_block
			});
			t.editorCommands = new tinymce.EditorCommands(t);

			// Pass through
			t.serializer.onPreProcess.add(function(se, o) {
				return t.onPreProcess.dispatch(t, o, se);
			});

			t.serializer.onPostProcess.add(function(se, o) {
				return t.onPostProcess.dispatch(t, o, se);
			});

			t.onPreInit.dispatch(t);

			if (!s.gecko_spellcheck)
				t.getBody().spellcheck = 0;

			if (!s.readonly)
				t._addEvents();

			t.controlManager.onPostRender.dispatch(t, t.controlManager);
			t.onPostRender.dispatch(t);
            AJS.log("Editor:setupIframe after post render");

			if (s.directionality)
				t.getBody().dir = s.directionality;

			if (s.nowrap)
				t.getBody().style.whiteSpace = "nowrap";

			if (s.custom_elements) {
				function handleCustom(ed, o) {
					each(explode(s.custom_elements), function(v) {
						var n;

						if (v.indexOf('~') === 0) {
							v = v.substring(1);
							n = 'span';
						} else
							n = 'div';

						o.content = o.content.replace(new RegExp('<(' + v + ')([^>]*)>', 'g'), '<' + n + ' mce_name="$1"$2>');
						o.content = o.content.replace(new RegExp('</(' + v + ')>', 'g'), '</' + n + '>');
					});
				};

				t.onBeforeSetContent.add(handleCustom);
				t.onPostProcess.add(function(ed, o) {
					if (o.set)
						handleCustom(ed, o);
				});
			}

			if (s.handle_node_change_callback) {
				t.onNodeChange.add(function(ed, cm, n) {
					t.execCallback('handle_node_change_callback', t.id, n, -1, -1, true, t.selection.isCollapsed());
				});
			}

			if (s.save_callback) {
				t.onSaveContent.add(function(ed, o) {
					var h = t.execCallback('save_callback', t.id, o.content, t.getBody());

					if (h)
						o.content = h;
				});
			}

			if (s.onchange_callback) {
				t.onChange.add(function(ed, l) {
					t.execCallback('onchange_callback', t, l);
				});
			}

			if (s.convert_newlines_to_brs) {
				t.onBeforeSetContent.add(function(ed, o) {
					if (o.initial)
						o.content = o.content.replace(/\r?\n/g, '<br />');
				});
			}

			if (s.fix_nesting && isIE) {
				t.onBeforeSetContent.add(function(ed, o) {
					o.content = t._fixNesting(o.content);
				});
			}

			if (s.preformatted) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^\s*<pre.*?>/, '');
					o.content = o.content.replace(/<\/pre>\s*$/, '');

					if (o.set)
						o.content = '<pre class="mceItemHidden">' + o.content + '</pre>';
				});
			}

			if (s.verify_css_classes) {
				t.serializer.attribValueFilter = function(n, v) {
					var s, cl;

					if (n == 'class') {
						// Build regexp for classes
						if (!t.classesRE) {
							cl = t.dom.getClasses();

							if (cl.length > 0) {
								s = '';

								each (cl, function(o) {
									s += (s ? '|' : '') + o['class'];
								});

								t.classesRE = new RegExp('(' + s + ')', 'gi');
							}
						}

						return !t.classesRE || /(\bmceItem\w+\b|\bmceTemp\w+\b)/g.test(v) || t.classesRE.test(v) ? v : '';
					}

					return v;
				};
			}

			if (s.convert_fonts_to_spans)
				t._convertFonts();

			if (s.inline_styles)
				t._convertInlineElements();

			if (s.cleanup_callback) {
				t.onBeforeSetContent.add(function(ed, o) {
					o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);
				});

				t.onPreProcess.add(function(ed, o) {
					if (o.set)
						t.execCallback('cleanup_callback', 'insert_to_editor_dom', o.node, o);

					if (o.get)
						t.execCallback('cleanup_callback', 'get_from_editor_dom', o.node, o);
				});

				t.onPostProcess.add(function(ed, o) {
					if (o.set)
						o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);

					if (o.get)
						o.content = t.execCallback('cleanup_callback', 'get_from_editor', o.content, o);
				});
			}

			if (s.save_callback) {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = t.execCallback('save_callback', t.id, o.content, t.getBody());
				});
			}

			if (s.handle_event_callback) {
				t.onEvent.add(function(ed, e, o) {
					if (t.execCallback('handle_event_callback', e, ed, o) === false)
						Event.cancel(e);
				});
			}

			// Add visual aids when new contents is added
			t.onSetContent.add(function() {
				t.addVisual(t.getBody());
			});

			// Remove empty contents
			if (s.padd_empty_editor) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
				});
			}

			if (isGecko) {
				// Fix gecko link bug, when a link is placed at the end of block elements there is
				// no way to move the caret behind the link. This fix adds a bogus br element after the link
				function fixLinks(ed, o) {
					each(ed.dom.select('a'), function(n) {
						var pn = n.parentNode;

						if (ed.dom.isBlock(pn) && pn.lastChild === n)
							ed.dom.add(pn, 'br', {'mce_bogus' : 1});
					});
				};

				t.onExecCommand.add(function(ed, cmd) {
					if (cmd === 'CreateLink')
						fixLinks(ed);
				});

				t.onSetContent.add(t.selection.onSetContent.add(fixLinks));

				if (!s.readonly) {
					try {
						// Design mode must be set here once again to fix a bug where
						// Ctrl+A/Delete/Backspace didn't work if the editor was added using mceAddControl then removed then added again
						d.designMode = 'Off';
						d.designMode = 'On';
					} catch (ex) {
						// Will fail on Gecko if the editor is placed in an hidden container element
						// The design mode will be set ones the editor is focused
					}
				}
			}
// ATLASSIAN - seems to work fine in FF, removing setTimeout improves performance in IE
			// A small timeout was needed since firefox will remove. Bug: #1838304
//			setTimeout(function () {
				if (t.removed)
					return;

                // ATLASSIAN - we need an event hook where the Editor exists but is not yet initialized
                AJS.log("AJS.Editor.Adapter.onSetContent attached to Editor.onSetContent");
                t.onSetContent.addToTop(AJS.Editor.Adapter.onSetContent);

				t.load({initial : true, format : (s.cleanup_on_startup ? 'html' : 'raw')});
				t.startContent = t.getContent({format : 'raw'});
				t.undoManager.add({initial : true});
				t.initialized = true;

				t.onInit.dispatch(t);
				t.execCallback('setupcontent_callback', t.id, t.getBody(), t.getDoc());
				t.execCallback('init_instance_callback', t);
				t.focus(true);
				t.nodeChanged({initial : 1});

				// Load specified content CSS last
				if (s.content_css) {
					tinymce.each(explode(s.content_css), function(u) {
                        AJS.log("About to load content css: " + t.documentBaseURI.toAbsolute(u));
						t.dom.loadCSS(t.documentBaseURI.toAbsolute(u));
					});
				}

				// Handle auto focus
				if (s.auto_focus) {
					setTimeout(function () {
						var ed = EditorManager.get(s.auto_focus);

						ed.selection.select(ed.getBody(), 1);
						ed.selection.collapse(1);
						ed.getWin().focus();
					}, 100);
				}
//			}, 1);
	
			e = null;
		},


		focus : function(sf) {
			var oed, t = this, ce = t.settings.content_editable;

			if (!sf) {
				// Is not content editable or the selection is outside the area in IE
				// the IE statement is needed to avoid bluring if element selections inside layers since
				// the layer is like it's own document in IE
				if (!ce && (!isIE || t.selection.getNode().ownerDocument != t.getDoc()))
					t.getWin().focus();

			}

			if (EditorManager.activeEditor != t) {
				if ((oed = EditorManager.activeEditor) != null)
					oed.onDeactivate.dispatch(oed, t);

				t.onActivate.dispatch(t, oed);
			}

			EditorManager._setActive(t);
		},

		execCallback : function(n) {
			var t = this, f = t.settings[n], s;

			if (!f)
				return;

			// Look through lookup
			if (t.callbackLookup && (s = t.callbackLookup[n])) {
				f = s.func;
				s = s.scope;
			}

			if (is(f, 'string')) {
				s = f.replace(/\.\w+$/, '');
				s = s ? tinymce.resolve(s) : 0;
				f = tinymce.resolve(f);
				t.callbackLookup = t.callbackLookup || {};
				t.callbackLookup[n] = {func : f, scope : s};
			}

			return f.apply(s || t, Array.prototype.slice.call(arguments, 1));
		},

		translate : function(s) {
			var c = this.settings.language || 'en', i18n = EditorManager.i18n;

			if (!s)
				return '';

			return i18n[c + '.' + s] || s.replace(/{\#([^}]+)\}/g, function(a, b) {
				return i18n[c + '.' + b] || '{#' + b + '}';
			});
		},

		getLang : function(n, dv) {
			return EditorManager.i18n[(this.settings.language || 'en') + '.' + n] || (is(dv) ? dv : '{#' + n + '}');
		},

		getParam : function(n, dv, ty) {
			var tr = tinymce.trim, v = is(this.settings[n]) ? this.settings[n] : dv, o;

			if (ty === 'hash') {
				o = {};

				if (is(v, 'string')) {
					each(v.indexOf('=') > 0 ? v.split(/[;,](?![^=;,]*(?:[;,]|$))/) : v.split(','), function(v) {
						v = v.split('=');

						if (v.length > 1)
							o[tr(v[0])] = tr(v[1]);
						else
							o[tr(v[0])] = tr(v);
					});
				} else
					o = v;

				return o;
			}

			return v;
		},

		nodeChanged : function(o) {
			var t = this, s = t.selection, n = s.getNode() || t.getBody();

			// Fix for bug #1896577 it seems that this can not be fired while the editor is loading
			if (t.initialized) {
				t.onNodeChange.dispatch(
					t,
					o ? o.controlManager || t.controlManager : t.controlManager,
					isIE && n.ownerDocument != t.getDoc() ? t.getBody() : n, // Fix for IE initial state
					s.isCollapsed(),
					o
				);
			}
		},

		addButton : function(n, s) {
			var t = this;

			t.buttons = t.buttons || {};
			t.buttons[n] = s;
		},

		addCommand : function(n, f, s) {
			this.execCommands[n] = {func : f, scope : s || this};
		},

		addQueryStateHandler : function(n, f, s) {
			this.queryStateCommands[n] = {func : f, scope : s || this};
		},

		addQueryValueHandler : function(n, f, s) {
			this.queryValueCommands[n] = {func : f, scope : s || this};
		},

		addShortcut : function(pa, desc, cmd_func, sc) {
			var t = this, c;

			if (!t.settings.custom_shortcuts)
				return false;

			t.shortcuts = t.shortcuts || {};

			if (is(cmd_func, 'string')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c, false, null);
				};
			}

			if (is(cmd_func, 'object')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c[0], c[1], c[2]);
				};
			}

			each(explode(pa), function(pa) {
				var o = {
					func : cmd_func,
					scope : sc || this,
					desc : desc,
					alt : false,
					ctrl : false,
					shift : false
				};

				each(explode(pa, '+'), function(v) {
					switch (v) {
						case 'alt':
						case 'ctrl':
						case 'shift':
							o[v] = true;
							break;

						default:
							o.charCode = v.charCodeAt(0);
							o.keyCode = v.toUpperCase().charCodeAt(0);
					}
				});

				t.shortcuts[(o.ctrl ? 'ctrl' : '') + ',' + (o.alt ? 'alt' : '') + ',' + (o.shift ? 'shift' : '') + ',' + o.keyCode] = o;
			});

			return true;
		},

		execCommand : function(cmd, ui, val, a) {
			var t = this, s = 0, o, st;

			if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll)$/.test(cmd) && (!a || !a.skip_focus))
				t.focus();

			o = {};
			t.onBeforeExecCommand.dispatch(t, cmd, ui, val, o);
			if (o.terminate)
				return false;

			// Command callback
			if (t.execCallback('execcommand_callback', t.id, t.selection.getNode(), cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Registred commands
			if (o = t.execCommands[cmd]) {
				st = o.func.call(o.scope, ui, val);

				// Fall through on true
				if (st !== true) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					return st;
				}
			}

			// Plugin commands
			each(t.plugins, function(p) {
				if (p.execCommand && p.execCommand(cmd, ui, val)) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					s = 1;
					return false;
				}
			});

			if (s)
				return true;

			// Theme commands
			if (t.theme && t.theme.execCommand && t.theme.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Execute global commands
			if (tinymce.GlobalCommands.execCommand(t, cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Editor commands
			if (t.editorCommands.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Browser commands
			t.getDoc().execCommand(cmd, ui, val);
			t.onExecCommand.dispatch(t, cmd, ui, val, a);
		},

		queryCommandState : function(c) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryStateCommands[c]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandState(c);
			if (o !== -1)
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandState(c);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		queryCommandValue : function(c) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryValueCommands[c]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandValue(c);
			if (is(o))
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandValue(c);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		show : function() {
			var t = this;

			DOM.show(t.getContainer());
			DOM.hide(t.id);
			t.load();
		},

		hide : function() {
			var t = this, d = t.getDoc();

			// Fixed bug where IE has a blinking cursor left from the editor
			if (isIE && d)
				d.execCommand('SelectAll');

			// We must save before we hide so Safari doesn't crash
			t.save();
			DOM.hide(t.getContainer());
			DOM.setStyle(t.id, 'display', t.orgDisplay);
		},

		isHidden : function() {
			return !DOM.isHidden(this.id);
		},

		setProgressState : function(b, ti, o) {
			this.onSetProgressState.dispatch(this, b, ti, o);

			return b;
		},

		load : function(o) {
			var t = this, e = t.getElement(), h;

			if (e) {
				o = o || {};
				o.load = true;

				// Double encode existing entities in the value
				h = t.setContent(is(e.value) ? e.value : e.innerHTML, o);
				o.element = e;

				if (!o.no_events)
					t.onLoadContent.dispatch(t, o);

				o.element = e = null;

				return h;
			}
		},

		save : function(o) {
			var t = this, e = t.getElement(), h, f;

			if (!e || !t.initialized)
				return;

			o = o || {};
			o.save = true;

			// Add undo level will trigger onchange event
			if (!o.no_events) {
				t.undoManager.typing = 0;
				t.undoManager.add();
			}

			o.element = e;
			h = o.content = t.getContent(o);

			if (!o.no_events)
				t.onSaveContent.dispatch(t, o);

			h = o.content;

			if (!/TEXTAREA|INPUT/i.test(e.nodeName)) {
				e.innerHTML = h;

				// Update hidden form element
				if (f = DOM.getParent(t.id, 'form')) {
					each(f.elements, function(e) {
						if (e.name == t.id) {
							e.value = h;
							return false;
						}
					});
				}
			} else
				e.value = h;

			o.element = e = null;

			return h;
		},

		setContent : function(h, o) {
			var t = this;

			o = o || {};
			o.format = o.format || 'html';
			o.set = true;
			o.content = h;

			if (!o.no_events)
				t.onBeforeSetContent.dispatch(t, o);

			// Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (!tinymce.isIE && (h.length === 0 || /^\s+$/.test(h))) {
				o.content = t.dom.setHTML(t.getBody(), '<br mce_bogus="1" />');
				o.format = 'raw';
			}
            // ATLASSIAN - also padd the end of a table if it is the last thing in Gecko
            else if (tinymce.isGecko && AJS.$.trim(h).match("<\/table>$")) {
                o.content += "<br mce_bogus='1' />";
            }

            o.content = t.dom.setHTML(t.getBody(), tinymce.trim(o.content));

			if (o.format != 'raw' && t.settings.cleanup) {
				o.getInner = true;
				o.content = t.dom.setHTML(t.getBody(), t.serializer.serialize(t.getBody(), o));
			}

			if (!o.no_events)
				t.onSetContent.dispatch(t, o);

			return o.content;
		},

		getContent : function(o) {
			var t = this, h, n;

			o = o || {};
			o.format = o.format || 'html';
			o.get = true;

			if (!o.no_events)
				t.onBeforeGetContent.dispatch(t, o);

            // ATLASSIAN - similar to the onSetContent hook above, this catches the Editor HTML before it is processed
            n = t.getBody().cloneNode(true);
            AJS.Editor.Adapter.onBeforeGetContent(n);

			if (o.format != 'raw' && t.settings.cleanup) {
				o.getInner = true;
				h = t.serializer.serialize(n, o);
			} else
				h = n.innerHTML;

			h = h.replace(/^\s*|\s*$/g, '');
			o.content = h;

			if (!o.no_events)
				t.onGetContent.dispatch(t, o);

			return o.content;
		},

		isDirty : function() {
			var t = this;

			return tinymce.trim(t.startContent) != tinymce.trim(t.getContent({format : 'raw', no_events : 1})) && !t.isNotDirty;
		},

        setDirty : function(dirty) {
            var t = this;

            t.isNotDirty = dirty ? 0 : 1;
        },

        getContainer : function() {
			var t = this;

			if (!t.container)
				t.container = DOM.get(t.editorContainer || t.id + '_parent');

			return t.container;
		},

		getContentAreaContainer : function() {
			return this.contentAreaContainer;
		},

		getElement : function() {
			return DOM.get(this.settings.content_element || this.id);
		},

		getWin : function() {
			var t = this, e;

			if (!t.contentWindow) {
				e = DOM.get(t.id + "_ifr");

				if (e)
					t.contentWindow = e.contentWindow;
			}

			return t.contentWindow;
		},

		getDoc : function() {
			var t = this, w;

			if (!t.contentDocument) {
				w = t.getWin();

				if (w)
					t.contentDocument = w.document;
			}

			return t.contentDocument;
		},

		getBody : function() {
			return this.bodyElement || this.getDoc().body;
		},

		convertURL : function(u, n, e) {
			var t = this, s = t.settings;

			// Use callback instead
			if (s.urlconverter_callback)
				return t.execCallback('urlconverter_callback', u, e, true, n);

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!s.convert_urls || (e && e.nodeName == 'LINK') || u.indexOf('file:') === 0)
				return u;

			// Convert to relative
			if (s.relative_urls)
				return t.documentBaseURI.toRelative(u);

			// Convert to absolute
			u = t.documentBaseURI.toAbsolute(u, s.remove_script_host);

			return u;
		},

		addVisual : function(e) {
			var t = this, s = t.settings;

			e = e || t.getBody();

			if (!is(t.hasVisual))
				t.hasVisual = s.visual;

			each(t.dom.select('table,a', e), function(e) {
				var v;

				switch (e.nodeName) {
					case 'TABLE':
						v = t.dom.getAttrib(e, 'border');

						if (!v || v == '0') {
							if (t.hasVisual)
								t.dom.addClass(e, s.visual_table_class);
							else
								t.dom.removeClass(e, s.visual_table_class);
						}

						return;

					case 'A':
						v = t.dom.getAttrib(e, 'name');

						if (v) {
							if (t.hasVisual)
								t.dom.addClass(e, 'mceItemAnchor');
							else
								t.dom.removeClass(e, 'mceItemAnchor');
						}

						return;
				}
			});

			t.onVisualAid.dispatch(t, e, t.hasVisual);
		},

		remove : function() {
			var t = this, e = t.getContainer();

			t.removed = 1; // Cancels post remove event execution
			t.hide();

			t.execCallback('remove_instance_callback', t);
			t.onRemove.dispatch(t);

			// Clear all execCommand listeners this is required to avoid errors if the editor was removed inside another command
			t.onExecCommand.listeners = [];

			EditorManager.remove(t);
			DOM.remove(e);
		},

		destroy : function(s) {
			var t = this;

			// One time is enough
			if (t.destroyed)
				return;

			if (!s) {
				tinymce.removeUnload(t.destroy);
				tinyMCE.onBeforeUnload.remove(t._beforeUnload);

				// Manual destroy
				if (t.theme && t.theme.destroy)
					t.theme.destroy();

				// Destroy controls, selection and dom
				t.controlManager.destroy();
				t.selection.destroy();
				t.dom.destroy();

				// Remove all events

				// Don't clear the window or document if content editable
				// is enabled since other instances might still be present
				if (!t.settings.content_editable) {
					Event.clear(t.getWin());
					Event.clear(t.getDoc());
				}

				Event.clear(t.getBody());
				Event.clear(t.formElement);
			}

			if (t.formElement) {
				t.formElement.submit = t.formElement._mceOldSubmit;
				t.formElement._mceOldSubmit = null;
			}

			t.contentAreaContainer = t.formElement = t.container = t.settings.content_element = t.bodyElement = t.contentDocument = t.contentWindow = null;

			if (t.selection)
				t.selection = t.selection.win = t.selection.dom = t.selection.dom.doc = null;

			t.destroyed = 1;
		},

		// Internal functions

		_addEvents : function() {
			// 'focus', 'blur', 'dblclick', 'beforedeactivate', submit, reset
			var t = this, i, s = t.settings, lo = {
				mouseup : 'onMouseUp',
				mousedown : 'onMouseDown',
				click : 'onClick',
				keyup : 'onKeyUp',
				keydown : 'onKeyDown',
				keypress : 'onKeyPress',
				submit : 'onSubmit',
				reset : 'onReset',
				contextmenu : 'onContextMenu',
				dblclick : 'onDblClick',
				paste : 'onPaste' // Doesn't work in all browsers yet
			};

			function eventHandler(e, o) {
				var ty = e.type;

				// Don't fire events when it's removed
				if (t.removed)
					return;

				// Generic event handler
				if (t.onEvent.dispatch(t, e, o) !== false) {
					// Specific event handler
					t[lo[e.fakeType || e.type]].dispatch(t, e, o);
				}
			};

			// Add DOM events
			each(lo, function(v, k) {
				switch (k) {
					case 'contextmenu':
						if (tinymce.isOpera) {
							// Fake contextmenu on Opera
							t.dom.bind(t.getBody(), 'mousedown', function(e) {
								if (e.ctrlKey) {
									e.fakeType = 'contextmenu';
									eventHandler(e);
								}
							});
						} else
							t.dom.bind(t.getBody(), k, eventHandler);
						break;

					case 'paste':
						t.dom.bind(t.getBody(), k, function(e) {
							eventHandler(e);
						});
						break;

					case 'submit':
					case 'reset':
						t.dom.bind(t.getElement().form || DOM.getParent(t.id, 'form'), k, eventHandler);
						break;

					default:
						t.dom.bind(s.content_editable ? t.getBody() : t.getDoc(), k, eventHandler);
				}
			});

			t.dom.bind(s.content_editable ? t.getBody() : (isGecko ? t.getDoc() : t.getWin()), 'focus', function(e) {
				t.focus(true);
			});


			// Fixes bug where a specified document_base_uri could result in broken images
			// This will also fix drag drop of images in Gecko
			if (tinymce.isGecko) {
				// Convert all images to absolute URLs
/*				t.onSetContent.add(function(ed, o) {
					each(ed.dom.select('img'), function(e) {
						var v;

						if (v = e.getAttribute('mce_src'))
							e.src = t.documentBaseURI.toAbsolute(v);
					})
				});*/

				t.dom.bind(t.getDoc(), 'DOMNodeInserted', function(e) {
					var v;

					e = e.target;

					if (e.nodeType === 1 && e.nodeName === 'IMG' && (v = e.getAttribute('mce_src')))
						e.src = t.documentBaseURI.toAbsolute(v);
				});
			}

			// Set various midas options in Gecko
			if (isGecko) {
				function setOpts() {
					var t = this, d = t.getDoc(), s = t.settings;

					if (isGecko && !s.readonly) {
						if (t._isHidden()) {
							try {
								if (!s.content_editable)
									d.designMode = 'On';
							} catch (ex) {
								// Fails if it's hidden
							}
						}

						try {
							// Try new Gecko method
							d.execCommand("styleWithCSS", 0, false);
						} catch (ex) {
							// Use old method
							if (!t._isHidden())
								try {d.execCommand("useCSS", 0, true);} catch (ex) {}
						}

						if (!s.table_inline_editing)
							try {d.execCommand('enableInlineTableEditing', false, false);} catch (ex) {}

						if (!s.object_resizing)
							try {d.execCommand('enableObjectResizing', false, false);} catch (ex) {}
					}
				};

				t.onBeforeExecCommand.add(setOpts);
				t.onMouseDown.add(setOpts);
			}

			// Add node change handlers
			t.onMouseUp.add(t.nodeChanged);
			t.onClick.add(t.nodeChanged);
			t.onKeyUp.add(function(ed, e) {
				var c = e.keyCode;

				if ((c >= 33 && c <= 36) || (c >= 37 && c <= 40) || c == 13 || c == 45 || c == 46 || c == 8 || (tinymce.isMac && (c == 91 || c == 93)) || e.ctrlKey)
					t.nodeChanged();
			});

			// Add reset handler
			t.onReset.add(function() {
				t.setContent(t.startContent, {format : 'raw'});
			});

			// Add shortcuts
			if (s.custom_shortcuts) {
				if (s.custom_undo_redo_keyboard_shortcuts) {
					t.addShortcut('ctrl+z', t.getLang('undo_desc'), 'Undo');
					t.addShortcut('ctrl+y', t.getLang('redo_desc'), 'Redo');
				}

				// Add default shortcuts for gecko and webkit
				if (isGecko || isWebKit) {
					t.addShortcut('ctrl+b', t.getLang('bold_desc'), 'Bold');
					t.addShortcut('ctrl+i', t.getLang('italic_desc'), 'Italic');
					t.addShortcut('ctrl+u', t.getLang('underline_desc'), 'Underline');
				}

				// BlockFormat shortcuts keys
				for (i=1; i<=6; i++) {
                    // For safari compatibility we add these shortcuts both with and without the alt/option key
					t.addShortcut('ctrl+alt+' + i + ',ctrl+' + i, '', ['FormatBlock', false, 'h' + i]); // ATLASSIAN - our format block method expects html tag names
                }

				t.addShortcut('ctrl+alt+7,ctrl+7', '', ['FormatBlock', false, 'p']); // ATLASSIAN - added ctrl+alt+7 as a shortcut.
                // ATLASSIAN - not supported
//				t.addShortcut('ctrl+8', '', ['FormatBlock', false, '<div>']);
//				t.addShortcut('ctrl+9', '', ['FormatBlock', false, '<address>']);

				function find(e) {
					var v = null;

					if (!e.altKey && !e.ctrlKey && !e.metaKey)
						return v;

					each(t.shortcuts, function(o) {
                        //We allow both the cmd and ctrl modifiers on OSX
						if (tinymce.isMac && (o.ctrl != e.metaKey && o.ctrl != e.ctrlKey))
							return;
						else if (!tinymce.isMac && o.ctrl != e.ctrlKey)
							return;
						if (o.alt != e.altKey)
							return;

						if (o.shift != e.shiftKey)
							return;

						if (e.keyCode == o.keyCode || (e.charCode && e.charCode == o.charCode)) {
							v = o;
							return false;
						}
					});

					return v;
				};

				t.onKeyUp.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyPress.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyDown.add(function(ed, e) {
					var o = find(e);

					if (o) {
						o.func.call(o.scope);
						return Event.cancel(e);
					}
				});
			}

			if (tinymce.isIE) {
				// Fix so resize will only update the width and height attributes not the styles of an image
				// It will also block mceItemNoResize items
				t.dom.bind(t.getDoc(), 'controlselect', function(e) {
					var re = t.resizeInfo, cb;

					e = e.target;

					// Don't do this action for non image elements
					if (e.nodeName !== 'IMG')
						return;

					if (re)
						t.dom.unbind(re.node, re.ev, re.cb);

					if (!t.dom.hasClass(e, 'mceItemNoResize')) {
						ev = 'resizeend';
						cb = t.dom.bind(e, ev, function(e) {
							var v;

							e = e.target;

							if (v = t.dom.getStyle(e, 'width')) {
								t.dom.setAttrib(e, 'width', v.replace(/[^0-9%]+/g, ''));
								t.dom.setStyle(e, 'width', '');
							}

							if (v = t.dom.getStyle(e, 'height')) {
								t.dom.setAttrib(e, 'height', v.replace(/[^0-9%]+/g, ''));
								t.dom.setStyle(e, 'height', '');
							}
						});
					} else {
						ev = 'resizestart';
						cb = t.dom.bind(e, 'resizestart', Event.cancel, Event);
					}

					re = t.resizeInfo = {
						node : e,
						ev : ev,
						cb : cb
					};
				});

				t.onKeyDown.add(function(ed, e) {
					switch (e.keyCode) {
						case 8:
							// Fix IE control + backspace browser bug
							if (t.selection.getRng().item) {
								t.selection.getRng().item(0).removeNode();
								return Event.cancel(e);
							}
					}
				});

				/*if (t.dom.boxModel) {
					t.getBody().style.height = '100%';

					Event.add(t.getWin(), 'resize', function(e) {
						var docElm = t.getDoc().documentElement;

						docElm.style.height = (docElm.offsetHeight - 10) + 'px';
					});
				}*/
			}

			if (tinymce.isOpera) {
				t.onClick.add(function(ed, e) {
					Event.prevent(e);
				});
			}

			// Add custom undo/redo handlers
			if (s.custom_undo_redo) {
				function addUndo() {
					t.undoManager.typing = 0;
					t.undoManager.add();
				};

				// Add undo level on editor blur
				if (tinymce.isIE) {
					t.dom.bind(t.getWin(), 'blur', function(e) {
						var n;

						// Check added for fullscreen bug
						if (t.selection) {
							n = t.selection.getNode();

							// Add undo level is selection was lost to another document
							if (!t.removed && n.ownerDocument && n.ownerDocument != t.getDoc())
								addUndo();
						}
					});
				} else {
					t.dom.bind(t.getDoc(), 'blur', function() {
						if (t.selection && !t.removed)
							addUndo();
					});
				}

				t.onMouseDown.add(addUndo);

				t.onKeyUp.add(function(ed, e) {
					if ((e.keyCode >= 33 && e.keyCode <= 36) || (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13 || e.keyCode == 45 || e.ctrlKey) {
						t.undoManager.typing = 0;
						t.undoManager.add();
					}
				});

				t.onKeyDown.add(function(ed, e) {
					// Is caracter positon keys
					if ((e.keyCode >= 33 && e.keyCode <= 36) || (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13 || e.keyCode == 45) {
						if (t.undoManager.typing) {
							t.undoManager.add();
							t.undoManager.typing = 0;
						}

						return;
					}

					if (!t.undoManager.typing) {
						t.undoManager.add();
						t.undoManager.typing = 1;
					}
				});
			}
		},

		_convertInlineElements : function() {
			var t = this, s = t.settings, dom = t.dom, v, e, na, st, sp;

			function convert(ed, o) {
				if (!s.inline_styles)
					return;

				if (o.get) {
					each(t.dom.select('table,u,strike', o.node), function(n) {
						switch (n.nodeName) {
							case 'TABLE':
								if (v = dom.getAttrib(n, 'height')) {
									dom.setStyle(n, 'height', v);
									dom.setAttrib(n, 'height', '');
								}
								break;

							case 'U':
							case 'STRIKE':
								//sp = dom.create('span', {style : dom.getAttrib(n, 'style')});
								n.style.textDecoration = n.nodeName == 'U' ? 'underline' : 'line-through';
								dom.setAttrib(n, 'mce_style', '');
								dom.setAttrib(n, 'mce_name', 'span');
								break;
						}
					});
				} else if (o.set) {
					each(t.dom.select('table,span', o.node).reverse(), function(n) {
						if (n.nodeName == 'TABLE') {
							if (v = dom.getStyle(n, 'height'))
								dom.setAttrib(n, 'height', v.replace(/[^0-9%]+/g, ''));
						} else {
							// Convert spans to elements
							if (n.style.textDecoration == 'underline')
								na = 'u';
							else if (n.style.textDecoration == 'line-through')
								na = 'strike';
							else
								na = '';

							if (na) {
								n.style.textDecoration = '';
								dom.setAttrib(n, 'mce_style', '');

								e = dom.create(na, {
									style : dom.getAttrib(n, 'style')
								});

								dom.replace(e, n, 1);
							}
						}
					});
				}
			};

			t.onPreProcess.add(convert);

			if (!s.cleanup_on_startup) {
				t.onSetContent.add(function(ed, o) {
					if (o.initial)
						convert(t, {node : t.getBody(), set : 1});
				});
			}
		},

		_convertFonts : function() {
			var t = this, s = t.settings, dom = t.dom, fz, fzn, sl, cl;

			// No need
			if (!s.inline_styles)
				return;

			// Font pt values and font size names
			fz = [8, 10, 12, 14, 18, 24, 36];
			fzn = ['xx-small', 'x-small','small','medium','large','x-large', 'xx-large'];

			if (sl = s.font_size_style_values)
				sl = explode(sl);

			if (cl = s.font_size_classes)
				cl = explode(cl);

			function process(no) {
				var n, sp, nl, x;

				// Keep unit tests happy
				if (!s.inline_styles)
					return;

				nl = t.dom.select('font', no);
				for (x = nl.length - 1; x >= 0; x--) {
					n = nl[x];

					sp = dom.create('span', {
						style : dom.getAttrib(n, 'style'),
						'class' : dom.getAttrib(n, 'class')
					});

					dom.setStyles(sp, {
						fontFamily : dom.getAttrib(n, 'face'),
						color : dom.getAttrib(n, 'color'),
						backgroundColor : n.style.backgroundColor
					});

					if (n.size) {
						if (sl)
							dom.setStyle(sp, 'fontSize', sl[parseInt(n.size) - 1]);
						else
							dom.setAttrib(sp, 'class', cl[parseInt(n.size) - 1]);
					}

					dom.setAttrib(sp, 'mce_style', '');
					dom.replace(sp, n, 1);
				}
			};

			// Run on cleanup
			t.onPreProcess.add(function(ed, o) {
				if (o.get)
					process(o.node);
			});

			t.onSetContent.add(function(ed, o) {
				if (o.initial)
					process(o.node);
			});
		},

		_isHidden : function() {
			var s;

			if (!isGecko)
				return 0;

			// Weird, wheres that cursor selection?
			s = this.selection.getSel();
			return (!s || !s.rangeCount || s.rangeCount == 0);
		},

		// Fix for bug #1867292
		_fixNesting : function(s) {
			var d = [], i;

			s = s.replace(/<(\/)?([^\s>]+)[^>]*?>/g, function(a, b, c) {
				var e;

				// Handle end element
				if (b === '/') {
					if (!d.length)
						return '';

					if (c !== d[d.length - 1].tag) {
						for (i=d.length - 1; i>=0; i--) {
							if (d[i].tag === c) {
								d[i].close = 1;
								break;
							}
						}

						return '';
					} else {
						d.pop();

						if (d.length && d[d.length - 1].close) {
							a = a + '</' + d[d.length - 1].tag + '>';
							d.pop();
						}
					}
				} else {
					// Ignore these
					if (/^(br|hr|input|meta|img|link|param)$/i.test(c))
						return a;

					// Ignore closed ones
					if (/\/>$/.test(a))
						return a;

					d.push({tag : c}); // Push start element
				}

				return a;
			});

			// End all open tags
			for (i=d.length - 1; i>=0; i--)
				s += '</' + d[i].tag + '>';

			return s;
		}

		});
})(tinymce);
(function(tinymce) {
	var each = tinymce.each, isIE = tinymce.isIE, isGecko = tinymce.isGecko, isOpera = tinymce.isOpera, isWebKit = tinymce.isWebKit;

	tinymce.create('tinymce.EditorCommands', {
		EditorCommands : function(ed) {
			this.editor = ed;
		},

		execCommand : function(cmd, ui, val) {
			var t = this, ed = t.editor, f;

			switch (cmd) {
				// Ignore these
				case 'mceResetDesignMode':
				case 'mceBeginUndoLevel':
					return true;

				// Ignore these
				case 'unlink':
					t.UnLink();
					return true;

				// Bundle these together
				case 'JustifyLeft':
				case 'JustifyCenter':
				case 'JustifyRight':
				case 'JustifyFull':
					t.mceJustify(cmd, cmd.substring(7).toLowerCase());
					return true;

				default:
					f = this[cmd];

					if (f) {
						f.call(this, ui, val);
						return true;
					}
			}

			return false;
		},

		Indent : function() {
			var ed = this.editor, d = ed.dom, s = ed.selection, e, iv, iu;

			// Setup indent level
			iv = ed.settings.indentation;
			iu = /[a-z%]+$/i.exec(iv);
			iv = parseInt(iv);

			if (ed.settings.inline_styles && (!this.queryStateInsertUnorderedList() && !this.queryStateInsertOrderedList())) {
				each(s.getSelectedBlocks(), function(e) {
					d.setStyle(e, 'paddingLeft', (parseInt(e.style.paddingLeft || 0) + iv) + iu);
				});

				return;
			}

			ed.getDoc().execCommand('Indent', false, null);

			if (isIE) {
				d.getParent(s.getNode(), function(n) {
					if (n.nodeName == 'BLOCKQUOTE') {
						n.dir = n.style.cssText = '';
					}
				});
			}
		},

		Outdent : function() {
			var ed = this.editor, d = ed.dom, s = ed.selection, e, v, iv, iu;

			// Setup indent level
			iv = ed.settings.indentation;
			iu = /[a-z%]+$/i.exec(iv);
			iv = parseInt(iv);

			if (ed.settings.inline_styles && (!this.queryStateInsertUnorderedList() && !this.queryStateInsertOrderedList())) {
				each(s.getSelectedBlocks(), function(e) {
					v = Math.max(0, parseInt(e.style.paddingLeft || 0) - iv);
					d.setStyle(e, 'paddingLeft', v ? v + iu : '');
				});

				return;
			}

			ed.getDoc().execCommand('Outdent', false, null);
		},

/*
		mceSetAttribute : function(u, v) {
			var ed = this.editor, d = ed.dom, e;

			if (e = d.getParent(ed.selection.getNode(), d.isBlock))
				d.setAttrib(e, v.name, v.value);
		},
*/
		mceSetContent : function(u, v) {
			this.editor.setContent(v);
		},

		mceToggleVisualAid : function() {
			var ed = this.editor;

			ed.hasVisual = !ed.hasVisual;
			ed.addVisual();
		},

		mceReplaceContent : function(u, v) {
			var s = this.editor.selection;

			s.setContent(v.replace(/\{\$selection\}/g, s.getContent({format : 'text'})));
		},

		mceInsertLink : function(u, v) {
			var ed = this.editor, s = ed.selection, e = ed.dom.getParent(s.getNode(), 'a');

			if (tinymce.is(v, 'string'))
				v = {href : v};

			function set(e) {
				each(v, function(v, k) {
					ed.dom.setAttrib(e, k, v);
				});
			};

			if (!e) {
				ed.execCommand('CreateLink', false, 'javascript:mctmp(0);');
				each(ed.dom.select('a[href=javascript:mctmp(0);]'), function(e) {
					set(e);
				});
			} else {
				if (v.href)
					set(e);
				else
					ed.dom.remove(e, 1);
			}
		},

		UnLink : function() {
			var ed = this.editor, s = ed.selection;

			if (s.isCollapsed())
				s.select(s.getNode());

			ed.getDoc().execCommand('unlink', false, null);
			s.collapse(0);
		},

		FontName : function(u, v) {
			var t = this, ed = t.editor, s = ed.selection, e;

			if (!v) {
				if (s.isCollapsed())
					s.select(s.getNode());
			} else {
				if (ed.settings.convert_fonts_to_spans)
					t._applyInlineStyle('span', {style : {fontFamily : v}});
				else
					ed.getDoc().execCommand('FontName', false, v);
			}
		},

		FontSize : function(u, v) {
			var ed = this.editor, s = ed.settings, fc, fs;

			// Use style options instead
			if (s.convert_fonts_to_spans && v >= 1 && v <= 7) {
				fs = tinymce.explode(s.font_size_style_values);
				fc = tinymce.explode(s.font_size_classes);

				if (fc)
					v = fc[v - 1] || v;
				else
					v = fs[v - 1] || v;
			}

			if (v >= 1 && v <= 7)
				ed.getDoc().execCommand('FontSize', false, v);
			else
				this._applyInlineStyle('span', {style : {fontSize : v}});
		},

		queryCommandValue : function(c) {
			var f = this['queryValue' + c];

			if (f)
				return f.call(this, c);

			return false;
		},

		queryCommandState : function(cmd) {
			var f;

			switch (cmd) {
				// Bundle these together
				case 'JustifyLeft':
				case 'JustifyCenter':
				case 'JustifyRight':
				case 'JustifyFull':
					return this.queryStateJustify(cmd, cmd.substring(7).toLowerCase());

				default:
					if (f = this['queryState' + cmd])
						return f.call(this, cmd);
			}

			return -1;
		},

		_queryState : function(c) {
			try {
				return this.editor.getDoc().queryCommandState(c);
			} catch (ex) {
				// Ignore exception
			}
		},

		_queryVal : function(c) {
			try {
				return this.editor.getDoc().queryCommandValue(c);
			} catch (ex) {
				// Ignore exception
			}
		},

		queryValueFontSize : function() {
			var ed = this.editor, v = 0, p;

			if (p = ed.dom.getParent(ed.selection.getNode(), 'span'))
				v = p.style.fontSize;

			if (!v && (isOpera || isWebKit)) {
				if (p = ed.dom.getParent(ed.selection.getNode(), 'font'))
					v = p.size;

				return v;
			}

			return v || this._queryVal('FontSize');
		},

		queryValueFontName : function() {
			var ed = this.editor, v = 0, p;

			if (p = ed.dom.getParent(ed.selection.getNode(), 'font'))
				v = p.face;

			if (p = ed.dom.getParent(ed.selection.getNode(), 'span'))
				v = p.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();

			if (!v)
				v = this._queryVal('FontName');

			return v;
		},

		mceJustify : function(c, v) {
			var ed = this.editor, se = ed.selection, n = se.getNode(), nn = n.nodeName, bl, nb, dom = ed.dom, rm;

			if (ed.settings.inline_styles && this.queryStateJustify(c, v))
				rm = 1;

			bl = dom.getParent(n, ed.dom.isBlock);

			if (nn == 'IMG') {
				if (v == 'full')
					return;

				if (rm) {
					if (v == 'center')
						dom.setStyle(bl || n.parentNode, 'textAlign', '');

					dom.setStyle(n, 'float', '');
					this.mceRepaint();
					return;
				}

				if (v == 'center') {
					// Do not change table elements
					if (bl && /^(TD|TH)$/.test(bl.nodeName))
						bl = 0;

					if (!bl || bl.childNodes.length > 1) {
						nb = dom.create('p');
						nb.appendChild(n.cloneNode(false));

						if (bl)
							dom.insertAfter(nb, bl);
						else
							dom.insertAfter(nb, n);

						dom.remove(n);
						n = nb.firstChild;
						bl = nb;
					}

					dom.setStyle(bl, 'textAlign', v);
					dom.setStyle(n, 'float', '');
				} else {
					dom.setStyle(n, 'float', v);
					dom.setStyle(bl || n.parentNode, 'textAlign', '');
				}

				this.mceRepaint();
				return;
			}

			// Handle the alignment outselfs, less quirks in all browsers
			if (ed.settings.inline_styles && ed.settings.forced_root_block) {
				if (rm)
					v = '';

				each(se.getSelectedBlocks(dom.getParent(se.getStart(), dom.isBlock), dom.getParent(se.getEnd(), dom.isBlock)), function(e) {
					dom.setAttrib(e, 'align', '');
					dom.setStyle(e, 'textAlign', v == 'full' ? 'justify' : v);
				});

				return;
			} else if (!rm)
				ed.getDoc().execCommand(c, false, null);

			if (ed.settings.inline_styles) {
				if (rm) {
					dom.getParent(ed.selection.getNode(), function(n) {
						if (n.style && n.style.textAlign)
							dom.setStyle(n, 'textAlign', '');
					});

					return;
				}

				each(dom.select('*'), function(n) {
					var v = n.align;

					if (v) {
						if (v == 'full')
							v = 'justify';

						dom.setStyle(n, 'textAlign', v);
						dom.setAttrib(n, 'align', '');
					}
				});
			}
		},

		mceSetCSSClass : function(u, v) {
			this.mceSetStyleInfo(0, {command : 'setattrib', name : 'class', value : v});
		},

		getSelectedElement : function() {
			var t = this, ed = t.editor, dom = ed.dom, se = ed.selection, r = se.getRng(), r1, r2, sc, ec, so, eo, e, sp, ep, re;

			if (se.isCollapsed() || r.item)
				return se.getNode();

			// Setup regexp
			re = ed.settings.merge_styles_invalid_parents;
			if (tinymce.is(re, 'string'))
				re = new RegExp(re, 'i');

			if (isIE) {
				r1 = r.duplicate();
				r1.collapse(true);
				sc = r1.parentElement();

				r2 = r.duplicate();
				r2.collapse(false);
				ec = r2.parentElement();

				if (sc != ec) {
					r1.move('character', 1);
					sc = r1.parentElement();
				}

				if (sc == ec) {
					r1 = r.duplicate();
					r1.moveToElementText(sc);

					if (r1.compareEndPoints('StartToStart', r) == 0 && r1.compareEndPoints('EndToEnd', r) == 0)
						return re && re.test(sc.nodeName) ? null : sc;
				}
			} else {
				function getParent(n) {
					return dom.getParent(n, '*');
				};

				sc = r.startContainer;
				ec = r.endContainer;
				so = r.startOffset;
				eo = r.endOffset;

				if (!r.collapsed) {
					if (sc == ec) {
						if (so - eo < 2) {
							if (sc.hasChildNodes()) {
								sp = sc.childNodes[so];
								return re && re.test(sp.nodeName) ? null : sp;
							}
						}
					}
				}

				if (sc.nodeType != 3 || ec.nodeType != 3)
					return null;

				if (so == 0) {
					sp = getParent(sc);

					if (sp && sp.firstChild != sc)
						sp = null;
				}

				if (so == sc.nodeValue.length) {
					e = sc.nextSibling;

					if (e && e.nodeType == 1)
						sp = sc.nextSibling;
				}

				if (eo == 0) {
					e = ec.previousSibling;

					if (e && e.nodeType == 1)
						ep = e;
				}

				if (eo == ec.nodeValue.length) {
					ep = getParent(ec);

					if (ep && ep.lastChild != ec)
						ep = null;
				}

				// Same element
				if (sp == ep)
					return re && sp && re.test(sp.nodeName) ? null : sp;
			}

			return null;
		},

		mceSetStyleInfo : function(u, v) {
			var t = this, ed = t.editor, d = ed.getDoc(), dom = ed.dom, e, b, s = ed.selection, nn = v.wrapper || 'span', b = s.getBookmark(), re;

			function set(n, e) {
				if (n.nodeType == 1) {
					switch (v.command) {
						case 'setattrib':
							return dom.setAttrib(n, v.name, v.value);

						case 'setstyle':
							return dom.setStyle(n, v.name, v.value);

						case 'removeformat':
							return dom.setAttrib(n, 'class', '');
					}
				}
			};

			// Setup regexp
			re = ed.settings.merge_styles_invalid_parents;
			if (tinymce.is(re, 'string'))
				re = new RegExp(re, 'i');

			// Set style info on selected element
			if ((e = t.getSelectedElement()) && !ed.settings.force_span_wrappers)
				set(e, 1);
			else {
				// Generate wrappers and set styles on them
				d.execCommand('FontName', false, '__');
				each(dom.select('span,font'), function(n) {
					var sp, e;

					if (dom.getAttrib(n, 'face') == '__' || n.style.fontFamily === '__') {
						sp = dom.create(nn, {mce_new : '1'});

						set(sp);

						each (n.childNodes, function(n) {
							sp.appendChild(n.cloneNode(true));
						});

						dom.replace(sp, n);
					}
				});
			}

			// Remove wrappers inside new ones
			each(dom.select(nn).reverse(), function(n) {
				var p = n.parentNode;

				// Check if it's an old span in a new wrapper
				if (!dom.getAttrib(n, 'mce_new')) {
					// Find new wrapper
					p = dom.getParent(n, '*[mce_new]');

					if (p)
						dom.remove(n, 1);
				}
			});

			// Merge wrappers with parent wrappers
			each(dom.select(nn).reverse(), function(n) {
				var p = n.parentNode;

				if (!p || !dom.getAttrib(n, 'mce_new'))
					return;

				if (ed.settings.force_span_wrappers && p.nodeName != 'SPAN')
					return;

				// Has parent of the same type and only child
				if (p.nodeName == nn.toUpperCase() && p.childNodes.length == 1)
					return dom.remove(p, 1);

				// Has parent that is more suitable to have the class and only child
				if (n.nodeType == 1 && (!re || !re.test(p.nodeName)) && p.childNodes.length == 1) {
					set(p); // Set style info on parent instead
					dom.setAttrib(n, 'class', '');
				}
			});

			// Remove empty wrappers
			each(dom.select(nn).reverse(), function(n) {
				if (dom.getAttrib(n, 'mce_new') || (dom.getAttribs(n).length <= 1 && n.className === '')) {
					if (!dom.getAttrib(n, 'class') && !dom.getAttrib(n, 'style'))
						return dom.remove(n, 1);

					dom.setAttrib(n, 'mce_new', ''); // Remove mce_new marker
				}
			});

			s.moveToBookmark(b);
		},

		queryStateJustify : function(c, v) {
			var ed = this.editor, n = ed.selection.getNode(), dom = ed.dom;

			if (n && n.nodeName == 'IMG') {
				if (dom.getStyle(n, 'float') == v)
					return 1;

				return n.parentNode.style.textAlign == v;
			}

			n = dom.getParent(ed.selection.getStart(), function(n) {
				return n.nodeType == 1 && n.style.textAlign;
			});

			if (v == 'full')
				v = 'justify';

			if (ed.settings.inline_styles)
				return (n && n.style.textAlign == v);

			return this._queryState(c);
		},

		ForeColor : function(ui, v) {
			var ed = this.editor;

			if (ed.settings.convert_fonts_to_spans) {
				this._applyInlineStyle('span', {style : {color : v}});
				return;
			} else
				ed.getDoc().execCommand('ForeColor', false, v);
		},

		HiliteColor : function(ui, val) {
			var t = this, ed = t.editor, d = ed.getDoc();

			if (ed.settings.convert_fonts_to_spans) {
				this._applyInlineStyle('span', {style : {backgroundColor : val}});
				return;
			}

			function set(s) {
				if (!isGecko)
					return;

				try {
					// Try new Gecko method
					d.execCommand("styleWithCSS", 0, s);
				} catch (ex) {
					// Use old
					d.execCommand("useCSS", 0, !s);
				}
			};

			if (isGecko || isOpera) {
				set(true);
				d.execCommand('hilitecolor', false, val);
				set(false);
			} else
				d.execCommand('BackColor', false, val);
		},

		FormatBlock : function(ui, val) {
            // ATLASSIAN - Run our custom formatter for everything but heading formats.
            if(!/H[1-6]/i.test(val)) {
                tinymce.confluence.formatter.formatBlock(val);
                return;
            }

			var t = this, ed = t.editor, s = ed.selection, dom = ed.dom, bl, nb, b;

			function isBlock(n) {
				return /^(P|DIV|H[1-6]|ADDRESS|BLOCKQUOTE|PRE)$/.test(n.nodeName);
			};

			bl = dom.getParent(s.getNode(), function(n) {
				return isBlock(n);
			});

			// IE has an issue where it removes the parent div if you change format on the paragrah in <div><p>Content</p></div>
			// FF and Opera doesn't change parent DIV elements if you switch format
			if (bl) {
				if ((isIE && isBlock(bl.parentNode)) || bl.nodeName == 'DIV') {
					// Rename block element
					nb = ed.dom.create(val);

					each(dom.getAttribs(bl), function(v) {
						dom.setAttrib(nb, v.nodeName, dom.getAttrib(bl, v.nodeName));
					});

					b = s.getBookmark();
					dom.replace(nb, bl, 1);
					s.moveToBookmark(b);
					ed.nodeChanged();
					return;
				}
			}

			val = ed.settings.forced_root_block ? (val || '<p>') : val;

			if (val.indexOf('<') == -1)
				val = '<' + val + '>';

			if (tinymce.isGecko)
				val = val.replace(/<(div|blockquote|code|dt|dd|dl|samp)>/gi, '$1');

			ed.getDoc().execCommand('FormatBlock', false, val);
		},

		mceCleanup : function() {
			var ed = this.editor, s = ed.selection, b = s.getBookmark();
			ed.setContent(ed.getContent());
			s.moveToBookmark(b);
		},

		mceRemoveNode : function(ui, val) {
			var ed = this.editor, s = ed.selection, b, n = val || s.getNode();

			// Make sure that the body node isn't removed
			if (n == ed.getBody())
				return;

			b = s.getBookmark();
			ed.dom.remove(n, 1);
			s.moveToBookmark(b);
			ed.nodeChanged();
		},

		mceSelectNodeDepth : function(ui, val) {
			var ed = this.editor, s = ed.selection, c = 0;

			ed.dom.getParent(s.getNode(), function(n) {
				if (n.nodeType == 1 && c++ == val) {
					s.select(n);
					ed.nodeChanged();
					return false;
				}
			}, ed.getBody());
		},

		mceSelectNode : function(u, v) {
			this.editor.selection.select(v);
		},

		mceInsertContent : function(ui, val) {
			this.editor.selection.setContent(val);
		},

		mceInsertRawHTML : function(ui, val) {
			var ed = this.editor;

			ed.selection.setContent('tiny_mce_marker');
			ed.setContent(ed.getContent().replace(/tiny_mce_marker/g, val));
		},

		mceRepaint : function() {
			var s, b, e = this.editor;

			if (tinymce.isGecko) {
				try {
					s = e.selection;
					b = s.getBookmark(true);

					if (s.getSel())
						s.getSel().selectAllChildren(e.getBody());

					s.collapse(true);
					s.moveToBookmark(b);
				} catch (ex) {
					// Ignore
				}
			}
		},

		queryStateUnderline : function() {
			var ed = this.editor, n = ed.selection.getNode();

			if (n && n.nodeName == 'A')
				return false;

			return this._queryState('Underline');
		},

		queryStateOutdent : function() {
			var ed = this.editor, n;

			if (ed.settings.inline_styles) {
				if ((n = ed.dom.getParent(ed.selection.getStart(), ed.dom.isBlock)) && parseInt(n.style.paddingLeft) > 0)
					return true;

				if ((n = ed.dom.getParent(ed.selection.getEnd(), ed.dom.isBlock)) && parseInt(n.style.paddingLeft) > 0)
					return true;
			}

			return this.queryStateInsertUnorderedList() || this.queryStateInsertOrderedList() || (!ed.settings.inline_styles && !!ed.dom.getParent(ed.selection.getNode(), 'BLOCKQUOTE'));
		},

		queryStateInsertUnorderedList : function() {
			return this.editor.dom.getParent(this.editor.selection.getNode(), 'UL');
		},

		queryStateInsertOrderedList : function() {
			return this.editor.dom.getParent(this.editor.selection.getNode(), 'OL');
		},

		queryStatemceBlockQuote : function() {
			return !!this.editor.dom.getParent(this.editor.selection.getStart(), function(n) {return n.nodeName === 'BLOCKQUOTE';});
		},

		_applyInlineStyle : function(na, at, op) {
			var t = this, ed = t.editor, dom = ed.dom, bm, lo = {}, kh, found;

			na = na.toUpperCase();

			if (op && op.check_classes && at['class'])
				op.check_classes.push(at['class']);

			function removeEmpty() {
				each(dom.select(na).reverse(), function(n) {
					var c = 0;

					// Check if there is any attributes
					each(dom.getAttribs(n), function(an) {
						if (an.nodeName.substring(0, 1) != '_' && dom.getAttrib(n, an.nodeName) != '') {
							//console.log(dom.getOuterHTML(n), dom.getAttrib(n, an.nodeName));
							c++;
						}
					});

					// No attributes then remove the element and keep the children
					if (c == 0)
						dom.remove(n, 1);
				});
			};

			function replaceFonts() {
				var bm;

				each(dom.select('span,font'), function(n) {
					if (n.style.fontFamily == 'mceinline' || n.face == 'mceinline') {
						if (!bm)
							bm = ed.selection.getBookmark();

						at._mce_new = '1';
						dom.replace(dom.create(na, at), n, 1);
					}
				});

				// Remove redundant elements
				each(dom.select(na + '[_mce_new]'), function(n) {
					function removeStyle(n) {
						if (n.nodeType == 1) {
							each(at.style, function(v, k) {
								dom.setStyle(n, k, '');
							});

							// Remove spans with the same class or marked classes
							if (at['class'] && n.className && op) {
								each(op.check_classes, function(c) {
									if (dom.hasClass(n, c))
										dom.removeClass(n, c);
								});
							}
						}
					};

					// Remove specified style information from child elements
					each(dom.select(na, n), removeStyle);

					// Remove the specified style information on parent if current node is only child (IE)
					if (n.parentNode && n.parentNode.nodeType == 1 && n.parentNode.childNodes.length == 1)
						removeStyle(n.parentNode);

					// Remove the child elements style info if a parent already has it
					dom.getParent(n.parentNode, function(pn) {
						if (pn.nodeType == 1) {
							if (at.style) {
								each(at.style, function(v, k) {
									var sv;

									if (!lo[k] && (sv = dom.getStyle(pn, k))) {
										if (sv === v)
											dom.setStyle(n, k, '');

										lo[k] = 1;
									}
								});
							}

							// Remove spans with the same class or marked classes
							if (at['class'] && pn.className && op) {
								each(op.check_classes, function(c) {
									if (dom.hasClass(pn, c))
										dom.removeClass(n, c);
								});
							}
						}

						return false;
					});

					n.removeAttribute('_mce_new');
				});

				removeEmpty();
				ed.selection.moveToBookmark(bm);

				return !!bm;
			};

			// Create inline elements
			ed.focus();
			ed.getDoc().execCommand('FontName', false, 'mceinline');
			replaceFonts();

			if (kh = t._applyInlineStyle.keyhandler) {
				ed.onKeyUp.remove(kh);
				ed.onKeyPress.remove(kh);
				ed.onKeyDown.remove(kh);
				ed.onSetContent.remove(t._applyInlineStyle.chandler);
			}

			if (ed.selection.isCollapsed()) {
				// IE will format the current word so this code can't be executed on that browser
				if (!isIE) {
					each(dom.getParents(ed.selection.getNode(), 'span'), function(n) {
						each(at.style, function(v, k) {
							var kv;

							if (kv = dom.getStyle(n, k)) {
								if (kv == v) {
									dom.setStyle(n, k, '');
									found = 2;
									return false;
								}

								found = 1;
								return false;
							}
						});

						if (found)
							return false;
					});

					if (found == 2) {
						bm = ed.selection.getBookmark();

						removeEmpty();

						ed.selection.moveToBookmark(bm);

						// Node change needs to be detached since the onselect event
						// for the select box will run the onclick handler after onselect call. Todo: Add a nicer fix!
						window.setTimeout(function() {
							ed.nodeChanged();
						}, 1);

						return;
					}
				}

				// Start collecting styles
				t._pendingStyles = tinymce.extend(t._pendingStyles || {}, at.style);

				t._applyInlineStyle.chandler = ed.onSetContent.add(function() {
					delete t._pendingStyles;
				});

				t._applyInlineStyle.keyhandler = kh = function(e) {
					// Use pending styles
					if (t._pendingStyles) {
						at.style = t._pendingStyles;
						delete t._pendingStyles;
					}

					if (replaceFonts()) {
						ed.onKeyDown.remove(t._applyInlineStyle.keyhandler);
						ed.onKeyPress.remove(t._applyInlineStyle.keyhandler);
					}

					if (e.type == 'keyup')
						ed.onKeyUp.remove(t._applyInlineStyle.keyhandler);
				};

				ed.onKeyDown.add(kh);
				ed.onKeyPress.add(kh);
				ed.onKeyUp.add(kh);
			} else
				t._pendingStyles = 0;
		}
	});
})(tinymce);(function(tinymce) {
	tinymce.create('tinymce.UndoManager', {
		index : 0,
		data : null,
		typing : 0,

		UndoManager : function(ed) {
			var t = this, Dispatcher = tinymce.util.Dispatcher;

			t.editor = ed;
			t.data = [];
			t.onAdd = new Dispatcher(this);
			t.onUndo = new Dispatcher(this);
			t.onRedo = new Dispatcher(this);
		},

		add : function(l) {
			var t = this, i, ed = t.editor, b, s = ed.settings, la;

			l = l || {};
			l.content = l.content || ed.getContent({format : 'raw', no_events : 1});

			// Add undo level if needed
			l.content = l.content.replace(/^\s*|\s*$/g, '');
			la = t.data[t.index > 0 && (t.index == 0 || t.index == t.data.length) ? t.index - 1 : t.index];
			if (!l.initial && la && l.content == la.content)
				return null;

			// Time to compress
			if (s.custom_undo_redo_levels) {
				if (t.data.length > s.custom_undo_redo_levels) {
					for (i = 0; i < t.data.length - 1; i++)
						t.data[i] = t.data[i + 1];

					t.data.length--;
					t.index = t.data.length;
				}
			}

			if (s.custom_undo_redo_restore_selection && !l.initial)
				l.bookmark = b = l.bookmark || ed.selection.getBookmark();

			if (t.index < t.data.length)
				t.index++;

			// Only initial marked undo levels should be allowed as first item
			// This to workaround a bug with Firefox and the blur event
			if (t.data.length === 0 && !l.initial)
				return null;

			// Add level
			t.data.length = t.index + 1;
			t.data[t.index++] = l;

			if (l.initial)
				t.index = 0;

			// Set initial bookmark use first real undo level
			if (t.data.length == 2 && t.data[0].initial)
				t.data[0].bookmark = b;

			t.onAdd.dispatch(t, l);
			ed.isNotDirty = 0;

			//console.dir(t.data);

			return l;
		},

		undo : function() {
			var t = this, ed = t.editor, l = l, i;

			if (t.typing) {
				t.add();
				t.typing = 0;
			}

			if (t.index > 0) {
				// If undo on last index then take snapshot
				if (t.index == t.data.length && t.index > 1) {
					i = t.index;
					t.typing = 0;

					if (!t.add())
						t.index = i;

					--t.index;
				}

				l = t.data[--t.index];
				ed.setContent(l.content, {format : 'raw'});
				ed.selection.moveToBookmark(l.bookmark);

				t.onUndo.dispatch(t, l);
			}

			return l;
		},

		redo : function() {
			var t = this, ed = t.editor, l = null;

			if (t.index < t.data.length - 1) {
				l = t.data[++t.index];
				ed.setContent(l.content, {format : 'raw'});
				ed.selection.moveToBookmark(l.bookmark);

				t.onRedo.dispatch(t, l);
			}

			return l;
		},

		clear : function() {
			var t = this;

			t.data = [];
			t.index = 0;
			t.typing = 0;
			t.add({initial : true});
		},

		hasUndo : function() {
			return this.index != 0 || this.typing;
		},

		hasRedo : function() {
			return this.index < this.data.length - 1;
		}

		});
})(tinymce);
(function(tinymce) {
	// Shorten names
	var Event, isIE, isGecko, isOpera, each, extend;

	Event = tinymce.dom.Event;
	isIE = tinymce.isIE;
	isGecko = tinymce.isGecko;
	isOpera = tinymce.isOpera;
	each = tinymce.each;
	extend = tinymce.extend;

	function isEmpty(n) {
		n = n.innerHTML;

		n = n.replace(/<(img|hr|table|input|select|textarea)[ \>]/gi, '-'); // Keep these convert them to - chars
		n = n.replace(/<[^>]+>/g, ''); // Remove all tags

		return n.replace(/[ \t\r\n]+/g, '') == '';
	};

	tinymce.create('tinymce.ForceBlocks', {
		ForceBlocks : function(ed) {
			var t = this, s = ed.settings, elm;

			t.editor = ed;
			t.dom = ed.dom;
			elm = (s.forced_root_block || 'p').toLowerCase();
			s.element = elm.toUpperCase();

			ed.onPreInit.add(t.setup, t);

			t.reOpera = new RegExp('(\\u00a0|&#160;|&nbsp;)<\/' + elm + '>', 'gi');
			t.rePadd = new RegExp('<p( )([^>]+)><\\\/p>|<p( )([^>]+)\\\/>|<p( )([^>]+)>\\s+<\\\/p>|<p><\\\/p>|<p\\\/>|<p>\\s+<\\\/p>'.replace(/p/g, elm), 'gi');
			t.reNbsp2BR1 = new RegExp('<p( )([^>]+)>[\\s\\u00a0]+<\\\/p>|<p>[\\s\\u00a0]+<\\\/p>'.replace(/p/g, elm), 'gi');
			t.reNbsp2BR2 = new RegExp('<%p()([^>]+)>(&nbsp;|&#160;)<\\\/%p>|<%p>(&nbsp;|&#160;)<\\\/%p>'.replace(/%p/g, elm), 'gi');
			t.reBR2Nbsp = new RegExp('<p( )([^>]+)>\\s*<br \\\/>\\s*<\\\/p>|<p>\\s*<br \\\/>\\s*<\\\/p>'.replace(/p/g, elm), 'gi');

			function padd(ed, o) {
				if (isOpera)
					o.content = o.content.replace(t.reOpera, '</' + elm + '>');

				o.content = o.content.replace(t.rePadd, '<' + elm + '$1$2$3$4$5$6>\u00a0</' + elm + '>');

				if (!isIE && !isOpera && o.set) {
					// Use &nbsp; instead of BR in padded paragraphs
					o.content = o.content.replace(t.reNbsp2BR1, '<' + elm + '$1$2><br /></' + elm + '>');
					o.content = o.content.replace(t.reNbsp2BR2, '<' + elm + '$1$2><br /></' + elm + '>');
				} else
					o.content = o.content.replace(t.reBR2Nbsp, '<' + elm + '$1$2>\u00a0</' + elm + '>');
			};

			ed.onBeforeSetContent.add(padd);
			ed.onPostProcess.add(padd);

			if (s.forced_root_block) {
				ed.onInit.add(t.forceRoots, t);
				ed.onSetContent.add(t.forceRoots, t);
				ed.onBeforeGetContent.add(t.forceRoots, t);
			}
		},

		setup : function() {
			var t = this, ed = t.editor, s = ed.settings;

			// Force root blocks when typing and when getting output
			if (s.forced_root_block) {
				ed.onKeyUp.add(t.forceRoots, t);
				ed.onPreProcess.add(t.forceRoots, t);
			}

			if (s.force_br_newlines) {
				// Force IE to produce BRs on enter
				if (isIE) {
					ed.onKeyPress.add(function(ed, e) {
						var n, s = ed.selection;

						if (e.keyCode == 13 && s.getNode().nodeName != 'LI') {
							s.setContent('<br id="__" /> ', {format : 'raw'});
							n = ed.dom.get('__');
							n.removeAttribute('id');
							s.select(n);
							s.collapse();
							return Event.cancel(e);
						}
					});
				}

				return;
			}

			if (!isIE && s.force_p_newlines) {
/*				ed.onPreProcess.add(function(ed, o) {
					each(ed.dom.select('br', o.node), function(n) {
						var p = n.parentNode;

						// Replace <p><br /></p> with <p>&nbsp;</p>
						if (p && p.nodeName == 'p' && (p.childNodes.length == 1 || p.lastChild == n)) {
							p.replaceChild(ed.getDoc().createTextNode('\u00a0'), n);
						}
					});
				});*/

				ed.onKeyPress.add(function(ed, e) {
					if (e.keyCode == 13 && !e.shiftKey) {
						if (!t.insertPara(e))
							Event.cancel(e);
					}
				});

				if (isGecko) {
					ed.onKeyDown.add(function(ed, e) {
						if ((e.keyCode == 8 || e.keyCode == 46) && !e.shiftKey)
							t.backspaceDelete(e, e.keyCode == 8);
					});
				}
			}

			function ren(rn, na) {
				var ne = ed.dom.create(na);

				each(rn.attributes, function(a) {
					if (a.specified && a.nodeValue)
						ne.setAttribute(a.nodeName.toLowerCase(), a.nodeValue);
				});

				each(rn.childNodes, function(n) {
					ne.appendChild(n.cloneNode(true));
				});

				rn.parentNode.replaceChild(ne, rn);

				return ne;
			};

			// Padd empty inline elements within block elements
			// For example: <p><strong><em></em></strong></p> becomes <p><strong><em>&nbsp;</em></strong></p>
			ed.onPreProcess.add(function(ed, o) {
				each(ed.dom.select('p,h1,h2,h3,h4,h5,h6,div', o.node), function(p) {
					if (isEmpty(p)) {
						each(ed.dom.select('span,em,strong,b,i', o.node), function(n) {
							if (!n.hasChildNodes()) {
								n.appendChild(ed.getDoc().createTextNode('\u00a0'));
								return false; // Break the loop one padding is enough
							}
						});
					}
				});
			});

			// IE specific fixes
			if (isIE) {
				// Replaces IE:s auto generated paragraphs with the specified element name
				if (s.element != 'P') {
					ed.onKeyPress.add(function(ed, e) {
						t.lastElm = ed.selection.getNode().nodeName;
					});

					ed.onKeyUp.add(function(ed, e) {
						var bl, sel = ed.selection, n = sel.getNode(), b = ed.getBody();

						if (b.childNodes.length === 1 && n.nodeName == 'P') {
							n = ren(n, s.element);
							sel.select(n);
							sel.collapse();
							ed.nodeChanged();
						} else if (e.keyCode == 13 && !e.shiftKey && t.lastElm != 'P') {
							bl = ed.dom.getParent(n, 'p');

							if (bl) {
								ren(bl, s.element);
								ed.nodeChanged();
							}
						}
					});
				}
			}
		},

		find : function(n, t, s) {
			var ed = this.editor, w = ed.getDoc().createTreeWalker(n, 4, null, false), c = -1;

			while (n = w.nextNode()) {
				c++;

				// Index by node
				if (t == 0 && n == s)
					return c;

				// Node by index
				if (t == 1 && c == s)
					return n;
			}

			return -1;
		},

		forceRoots : function(ed, e) {
			var t = this, ed = t.editor, b = ed.getBody(), d = ed.getDoc(), se = ed.selection, s = se.getSel(), r = se.getRng(), si = -2, ei, so, eo, tr, c = -0xFFFFFF;
			var nx, bl, bp, sp, le, nl = b.childNodes, i, n, eid;

			// Fix for bug #1863847
			//if (e && e.keyCode == 13)
			//	return true;

			// Wrap non blocks into blocks
			for (i = nl.length - 1; i >= 0; i--) {
				nx = nl[i];

				// Is text or non block element
				if (nx.nodeType == 3 || (!t.dom.isBlock(nx) && nx.nodeType != 8)) {
					if (!bl) {
						// Create new block but ignore whitespace
						if (nx.nodeType != 3 || /[^\s]/g.test(nx.nodeValue)) {
							// Store selection
							if (si == -2 && r) {
								if (!isIE) {
									// If selection is element then mark it
									if (r.startContainer.nodeType == 1 && (n = r.startContainer.childNodes[r.startOffset]) && n.nodeType == 1) {
										// Save the id of the selected element
										eid = n.getAttribute("id");
										n.setAttribute("id", "__mce");
									} else {
										// If element is inside body, might not be the case in contentEdiable mode
										if (ed.dom.getParent(r.startContainer, function(e) {return e === b;})) {
											so = r.startOffset;
											eo = r.endOffset;
											si = t.find(b, 0, r.startContainer);
											ei = t.find(b, 0, r.endContainer);
										}
									}
								} else {
									tr = d.body.createTextRange();
									tr.moveToElementText(b);
									tr.collapse(1);
									bp = tr.move('character', c) * -1;

									tr = r.duplicate();
									tr.collapse(1);
									sp = tr.move('character', c) * -1;

									tr = r.duplicate();
									tr.collapse(0);
									le = (tr.move('character', c) * -1) - sp;

									si = sp - bp;
									ei = le;
								}
							}

							bl = ed.dom.create(ed.settings.forced_root_block);
							bl.appendChild(nx.cloneNode(1));
							nx.parentNode.replaceChild(bl, nx);
						}
					} else {
						if (bl.hasChildNodes())
							bl.insertBefore(nx, bl.firstChild);
						else
							bl.appendChild(nx);
					}
				} else
					bl = null; // Time to create new block
			}

			// Restore selection
			if (si != -2) {
				if (!isIE) {
					bl = b.getElementsByTagName(ed.settings.element)[0];
					r = d.createRange();

					// Select last location or generated block
					if (si != -1)
						r.setStart(t.find(b, 1, si), so);
					else
						r.setStart(bl, 0);

					// Select last location or generated block
					if (ei != -1)
						r.setEnd(t.find(b, 1, ei), eo);
					else
						r.setEnd(bl, 0);

					if (s) {
						s.removeAllRanges();
						s.addRange(r);
					}
				} else {
					try {
						r = s.createRange();
						r.moveToElementText(b);
						r.collapse(1);
						r.moveStart('character', si);
						r.moveEnd('character', ei);
						r.select();
					} catch (ex) {
						// Ignore
					}
				}
			} else if (!isIE && (n = ed.dom.get('__mce'))) {
				// Restore the id of the selected element
				if (eid)
					n.setAttribute('id', eid);
				else
					n.removeAttribute('id');

				// Move caret before selected element
				r = d.createRange();
				r.setStartBefore(n);
				r.setEndBefore(n);
				se.setRng(r);
			}
		},

		getParentBlock : function(n) {
			var d = this.dom;

			return d.getParent(n, d.isBlock);
		},

		insertPara : function(e) {
			var t = this, ed = t.editor, dom = ed.dom, d = ed.getDoc(), se = ed.settings, s = ed.selection.getSel(), r = s.getRangeAt(0), b = d.body;
			var rb, ra, dir, sn, so, en, eo, sb, eb, bn, bef, aft, sc, ec, n, vp = dom.getViewPort(ed.getWin()), y, ch, car;

			// If root blocks are forced then use Operas default behavior since it's really good
// Removed due to bug: #1853816
//			if (se.forced_root_block && isOpera)
//				return true;

			// Setup before range
			rb = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			rb.setStart(s.anchorNode, s.anchorOffset);
			rb.collapse(true);

			// Setup after range
			ra = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			ra.setStart(s.focusNode, s.focusOffset);
			ra.collapse(true);

			// Setup start/end points
			dir = rb.compareBoundaryPoints(rb.START_TO_END, ra) < 0;
			sn = dir ? s.anchorNode : s.focusNode;
			so = dir ? s.anchorOffset : s.focusOffset;
			en = dir ? s.focusNode : s.anchorNode;
			eo = dir ? s.focusOffset : s.anchorOffset;

            // ATLASSIAN - Skip paragraphs for table cells
            if (/^(TD|TH)$/.test(sn.nodeName) || (sn.nodeType==3 && /^(TD|TH)$/.test(sn.parentNode.nodeName))) {
                return true;
            }

			// If selection is in empty table cell
			if (sn === en && /^(TD|TH)$/.test(sn.nodeName)) {
				if (sn.firstChild.nodeName == 'BR')
					dom.remove(sn.firstChild); // Remove BR

				// Create two new block elements
				if (sn.childNodes.length == 0) {
					ed.dom.add(sn, se.element, null, '<br />');
					aft = ed.dom.add(sn, se.element, null, '<br />');
				} else {
					n = sn.innerHTML;
					sn.innerHTML = '';
					ed.dom.add(sn, se.element, null, n);
					aft = ed.dom.add(sn, se.element, null, '<br />');
				}

				// Move caret into the last one
				r = d.createRange();
				r.selectNodeContents(aft);
				r.collapse(1);
				ed.selection.setRng(r);

				return false;
			}

			// If the caret is in an invalid location in FF we need to move it into the first block
			if (sn == b && en == b && b.firstChild && ed.dom.isBlock(b.firstChild)) {
				sn = en = sn.firstChild;
				so = eo = 0;
				rb = d.createRange();
				rb.setStart(sn, 0);
				ra = d.createRange();
				ra.setStart(en, 0);
			}

			// Never use body as start or end node
			sn = sn.nodeName == "HTML" ? d.body : sn; // Fix for Opera bug: https://bugs.opera.com/show_bug.cgi?id=273224&comments=yes
			sn = sn.nodeName == "BODY" ? sn.firstChild : sn;
			en = en.nodeName == "HTML" ? d.body : en; // Fix for Opera bug: https://bugs.opera.com/show_bug.cgi?id=273224&comments=yes
			en = en.nodeName == "BODY" ? en.firstChild : en;

			// Get start and end blocks
			sb = t.getParentBlock(sn);
			eb = t.getParentBlock(en);
			bn = sb ? sb.nodeName : se.element; // Get block name to create

			// Return inside list use default browser behavior
			if (t.dom.getParent(sb, 'ol,ul,pre'))
				return true;

			// If caption or absolute layers then always generate new blocks within
			if (sb && (sb.nodeName == 'CAPTION' || /absolute|relative|fixed/gi.test(dom.getStyle(sb, 'position', 1)))) {
				bn = se.element;
				sb = null;
			}

			// If caption or absolute layers then always generate new blocks within
			if (eb && (eb.nodeName == 'CAPTION' || /absolute|relative|fixed/gi.test(dom.getStyle(sb, 'position', 1)))) {
				bn = se.element;
				eb = null;
			}

			// Use P instead
			if (/(TD|TABLE|TH|CAPTION)/.test(bn) || (sb && bn == "DIV" && /left|right/gi.test(dom.getStyle(sb, 'float', 1)))) {
				bn = se.element;
				sb = eb = null;
			}

			// Setup new before and after blocks
			bef = (sb && sb.nodeName == bn) ? sb.cloneNode(0) : ed.dom.create(bn);
			aft = (eb && eb.nodeName == bn) ? eb.cloneNode(0) : ed.dom.create(bn);

			// Remove id from after clone
			aft.removeAttribute('id');

			// Is header and cursor is at the end, then force paragraph under
			if (/^(H[1-6])$/.test(bn) && sn.nodeValue && so == sn.nodeValue.length)
				aft = ed.dom.create(se.element);

			// Find start chop node
			n = sc = sn;
			do {
				if (n == b || n.nodeType == 9 || t.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName))
					break;

				sc = n;
			} while ((n = n.previousSibling ? n.previousSibling : n.parentNode));

			// Find end chop node
			n = ec = en;
			do {
				if (n == b || n.nodeType == 9 || t.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName))
					break;

				ec = n;
			} while ((n = n.nextSibling ? n.nextSibling : n.parentNode));

			// Place first chop part into before block element
			if (sc.nodeName == bn)
				rb.setStart(sc, 0);
			else
				rb.setStartBefore(sc);

			rb.setEnd(sn, so);
			bef.appendChild(rb.cloneContents() || d.createTextNode('')); // Empty text node needed for Safari

			// Place secnd chop part within new block element
			try {
				ra.setEndAfter(ec);
			} catch(ex) {
				//console.debug(s.focusNode, s.focusOffset);
			}

			ra.setStart(en, eo);
			aft.appendChild(ra.cloneContents() || d.createTextNode('')); // Empty text node needed for Safari

			// Create range around everything
			r = d.createRange();
			if (!sc.previousSibling && sc.parentNode.nodeName == bn) {
				r.setStartBefore(sc.parentNode);
			} else {
				if (rb.startContainer.nodeName == bn && rb.startOffset == 0)
					r.setStartBefore(rb.startContainer);
				else
					r.setStart(rb.startContainer, rb.startOffset);
			}

			if (!ec.nextSibling && ec.parentNode.nodeName == bn)
				r.setEndAfter(ec.parentNode);
			else
				r.setEnd(ra.endContainer, ra.endOffset);

			// Delete and replace it with new block elements
			r.deleteContents();

			if (isOpera)
				ed.getWin().scrollTo(0, vp.y);

			// Never wrap blocks in blocks
			if (bef.firstChild && bef.firstChild.nodeName == bn)
				bef.innerHTML = bef.firstChild.innerHTML;

			if (aft.firstChild && aft.firstChild.nodeName == bn)
				aft.innerHTML = aft.firstChild.innerHTML;

			// Padd empty blocks
			if (isEmpty(bef))
				bef.innerHTML = '<br />';

			function appendStyles(e, en) {
				var nl = [], nn, n, i;

				e.innerHTML = '';

				// Make clones of style elements
				if (se.keep_styles) {
					n = en;
					do {
						// We only want style specific elements
						if (/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(n.nodeName)) {
							nn = n.cloneNode(false);
							dom.setAttrib(nn, 'id', ''); // Remove ID since it needs to be unique
							nl.push(nn);
						}
					} while (n = n.parentNode);
				}

				// Append style elements to aft
				if (nl.length > 0) {
					for (i = nl.length - 1, nn = e; i >= 0; i--)
						nn = nn.appendChild(nl[i]);

					// Padd most inner style element
					nl[0].innerHTML = isOpera ? '&nbsp;' : '<br />'; // Extra space for Opera so that the caret can move there
					return nl[0]; // Move caret to most inner element
				} else
					e.innerHTML = isOpera ? '&nbsp;' : '<br />'; // Extra space for Opera so that the caret can move there
			};

			// Fill empty afterblook with current style
			if (isEmpty(aft))
				car = appendStyles(aft, en);

			// Opera needs this one backwards for older versions
			if (isOpera && parseFloat(opera.version()) < 9.5) {
				r.insertNode(bef);
				r.insertNode(aft);
			} else {
				r.insertNode(aft);
				r.insertNode(bef);
			}

			// Normalize
			aft.normalize();
			bef.normalize();

			function first(n) {
				return d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false).nextNode() || n;
			};

			// Move cursor and scroll into view
			r = d.createRange();
			r.selectNodeContents(isGecko ? first(car || aft) : car || aft);
			r.collapse(1);
			s.removeAllRanges();
			s.addRange(r);

			// scrollIntoView seems to scroll the parent window in most browsers now including FF 3.0b4 so it's time to stop using it and do it our selfs
			y = ed.dom.getPos(aft).y;
			ch = aft.clientHeight;

			// Is element within viewport
			if (y < vp.y || y + ch > vp.y + vp.h) {
				ed.getWin().scrollTo(0, y < vp.y ? y : y - vp.h + 25); // Needs to be hardcoded to roughly one line of text if a huge text block is broken into two blocks
				//console.log('SCROLL!', 'vp.y: ' + vp.y, 'y' + y, 'vp.h' + vp.h, 'clientHeight' + aft.clientHeight, 'yyy: ' + (y < vp.y ? y : y - vp.h + aft.clientHeight));
			}

			return false;
		},

		backspaceDelete : function(e, bs) {
			var t = this, ed = t.editor, b = ed.getBody(), n, se = ed.selection, r = se.getRng(), sc = r.startContainer, n, w, tn;

			// The caret sometimes gets stuck in Gecko if you delete empty paragraphs
			// This workaround removes the element by hand and moves the caret to the previous element
			if (sc && ed.dom.isBlock(sc) && !/^(TD|TH)$/.test(sc.nodeName) && bs) {
				if (sc.childNodes.length == 0 || (sc.childNodes.length == 1 && sc.firstChild.nodeName == 'BR')) {
					// Find previous block element
					n = sc;
					while ((n = n.previousSibling) && !ed.dom.isBlock(n)) ;

					if (n) {
						if (sc != b.firstChild) {
							// Find last text node
							w = ed.dom.doc.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);
							while (tn = w.nextNode())
								n = tn;

							// Place caret at the end of last text node
							r = ed.getDoc().createRange();
							r.setStart(n, n.nodeValue ? n.nodeValue.length : 0);
							r.setEnd(n, n.nodeValue ? n.nodeValue.length : 0);
							se.setRng(r);

							// Remove the target container
							ed.dom.remove(sc);
						}

						return Event.cancel(e);
					}
				}
			}

			// Gecko generates BR elements here and there, we don't like those so lets remove them
			function handler(e) {
				var pr;

				e = e.target;

				// A new BR was created in a block element, remove it
				if (e && e.parentNode && e.nodeName == 'BR' && (n = t.getParentBlock(e))) {
					pr = e.previousSibling;

					Event.remove(b, 'DOMNodeInserted', handler);

					// Is there whitespace at the end of the node before then we might need the pesky BR
					// to place the caret at a correct location see bug: #2013943
					if (pr && pr.nodeType == 3 && /\s+$/.test(pr.nodeValue))
						return;

					// Only remove BR elements that got inserted in the middle of the text
					if (e.previousSibling || e.nextSibling)
						ed.dom.remove(e);
				}
			};

			// Listen for new nodes
			Event._add(b, 'DOMNodeInserted', handler);

			// Remove listener
			window.setTimeout(function() {
				Event._remove(b, 'DOMNodeInserted', handler);
			}, 1);
		}
	});
})(tinymce);
(function(tinymce) {
	// Shorten names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, extend = tinymce.extend;

	tinymce.create('tinymce.ControlManager', {
		ControlManager : function(ed, s) {
			var t = this, i;

			s = s || {};
			t.editor = ed;
			t.controls = {};
			t.onAdd = new tinymce.util.Dispatcher(t);
			t.onPostRender = new tinymce.util.Dispatcher(t);
			t.prefix = s.prefix || ed.id + '_';
			t._cls = {};

			t.onPostRender.add(function() {
				each(t.controls, function(c) {
					c.postRender();
				});
			});
		},

		get : function(id) {
			return this.controls[this.prefix + id] || this.controls[id];
		},

		setActive : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setActive(s);

			return c;
		},

		setDisabled : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setDisabled(s);

			return c;
		},

		add : function(c) {
			var t = this;

			if (c) {
				t.controls[c.id] = c;
				t.onAdd.dispatch(c, t);
			}

			return c;
		},

		createControl : function(n) {
			var c, t = this, ed = t.editor;

			each(ed.plugins, function(p) {
				if (p.createControl) {
					c = p.createControl(n, t);

					if (c)
						return false;
				}
			});

			switch (n) {
				case "|":
				case "separator":
					return t.createSeparator();
			}

			if (!c && ed.buttons && (c = ed.buttons[n]))
				return t.createButton(n, c);

			return t.add(c);
		},

		createDropMenu : function(id, s, cc) {
			var t = this, ed = t.editor, c, bm, v, cls;

			s = extend({
				'class' : 'mceDropDown',
				constrain : ed.settings.constrain_menus
			}, s);

			s['class'] = s['class'] + ' ' + ed.getParam('skin') + 'Skin';
			if (v = ed.getParam('skin_variant'))
				s['class'] += ' ' + ed.getParam('skin') + 'Skin' + v.substring(0, 1).toUpperCase() + v.substring(1);

			id = t.prefix + id;
			cls = cc || t._cls.dropmenu || tinymce.ui.DropMenu;
			c = t.controls[id] = new cls(id, s);
			c.onAddItem.add(function(c, o) {
				var s = o.settings;

				s.title = ed.getLang(s.title, s.title);

				if (!s.onclick) {
					s.onclick = function(v) {
						ed.execCommand(s.cmd, s.ui || false, s.value);
					};
				}
			});

			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();

					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		createListBox : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;

			if (ed.settings.use_native_selects)
				c = new tinymce.ui.NativeListBox(id, s);
			else {
				cls = cc || t._cls.listbox || tinymce.ui.ListBox;
				c = new cls(id, s);
			}

			t.controls[id] = c;

			// Fix focus problem in Safari
			if (tinymce.isWebKit) {
				c.onPostRender.add(function(c, n) {
					// Store bookmark on mousedown
					Event.add(n, 'mousedown', function() {
						ed.bookmark = ed.selection.getBookmark(1);
					});

					// Restore on focus, since it might be lost
					Event.add(n, 'focus', function() {
						ed.selection.moveToBookmark(ed.bookmark);
						ed.bookmark = null;
					});
				});
			}

			if (c.hideMenu)
				ed.onMouseDown.add(c.hideMenu, c);

			return t.add(c);
		},

		createButton : function(id, s, cc) {
			var t = this, ed = t.editor, o, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.label = ed.translate(s.label);
			s.scope = s.scope || ed;

			if (!s.onclick && !s.menu_button) {
				s.onclick = function() {
					ed.execCommand(s.cmd, s.ui || false, s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				unavailable_prefix : ed.getLang('unavailable', ''),
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;

			if (s.menu_button) {
				cls = cc || t._cls.menubutton || tinymce.ui.MenuButton;
				c = new cls(id, s);
				ed.onMouseDown.add(c.hideMenu, c);
			} else {
				cls = t._cls.button || tinymce.ui.Button;
				c = new cls(id, s);
			}

			return t.add(c);
		},

		createMenuButton : function(id, s, cc) {
			s = s || {};
			s.menu_button = 1;

			return this.createButton(id, s, cc);
		},

		createSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					if (tinymce.isIE)
						bm = ed.selection.getBookmark(1);

					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.splitbutton || tinymce.ui.SplitButton;
			c = t.add(new cls(id, s));
			ed.onMouseDown.add(c.hideMenu, c);

			return c;
		},

		createColorSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls, bm;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				'menu_class' : ed.getParam('skin') + 'Skin',
				scope : s.scope,
				more_colors_title : ed.getLang('colorpicker.more_colors')
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.colorsplitbutton || tinymce.ui.ColorSplitButton;
			c = new cls(id, s);
			ed.onMouseDown.add(c.hideMenu, c);

			// Remove the menu element when the editor is removed
			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();
					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		createToolbar : function(id, s, cc) {
			var c, t = this, cls;

			id = t.prefix + id;
			cls = cc || t._cls.toolbar || tinymce.ui.Toolbar;
			c = new cls(id, s);

			if (t.get(id))
				return null;

			return t.add(c);
		},

		createSeparator : function(cc) {
			var cls = cc || this._cls.separator || tinymce.ui.Separator;

			return new cls();
		},

		setControlType : function(n, c) {
			return this._cls[n.toLowerCase()] = c;
		},

		destroy : function() {
			each(this.controls, function(c) {
				c.destroy();
			});

			this.controls = null;
		}

		});
})(tinymce);
(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isIE = tinymce.isIE, isOpera = tinymce.isOpera;

	tinymce.create('tinymce.WindowManager', {
		WindowManager : function(ed) {
			var t = this;

			t.editor = ed;
			t.onOpen = new Dispatcher(t);
			t.onClose = new Dispatcher(t);
			t.params = {};
			t.features = {};
		},

		open : function(s, p) {
			var t = this, f = '', x, y, mo = t.editor.settings.dialog_type == 'modal', w, sw, sh, vp = tinymce.DOM.getViewPort(), u;

			// Default some options
			s = s || {};
			p = p || {};
			sw = isOpera ? vp.w : screen.width; // Opera uses windows inside the Opera window
			sh = isOpera ? vp.h : screen.height;
			s.name = s.name || 'mc_' + new Date().getTime();
			s.width = parseInt(s.width || 320);
			s.height = parseInt(s.height || 240);
			s.resizable = true;
			s.left = s.left || parseInt(sw / 2.0) - (s.width / 2.0);
			s.top = s.top || parseInt(sh / 2.0) - (s.height / 2.0);
			p.inline = false;
			p.mce_width = s.width;
			p.mce_height = s.height;
			p.mce_auto_focus = s.auto_focus;

            AJS.log("WindowManager:open popup name=" + s.name);

			if (mo) {
				if (isIE) {
					s.center = true;
					s.help = false;
					s.dialogWidth = s.width + 'px';
					s.dialogHeight = s.height + 'px';
					s.scroll = s.scrollbars || false;
				}
			}

			// Build features string
			each(s, function(v, k) {
				if (tinymce.is(v, 'boolean'))
					v = v ? 'yes' : 'no';

				if (!/^(name|url)$/.test(k)) {
					if (isIE && mo)
						f += (f ? ';' : '') + k + ':' + v;
					else
						f += (f ? ',' : '') + k + '=' + v;
				}
			});

			t.features = s;
			t.params = p;
			t.onOpen.dispatch(t, s, p);

			u = s.url || s.file;
			u = tinymce._addVer(u);

			try {
				if (isIE && mo) {
					w = 1;
					window.showModalDialog(u, window, f);
				} else
					w = window.open(u, s.name, f);
			} catch (ex) {
				// Ignore
			}

			if (!w)
				alert(t.editor.getLang('popup_blocked'));
		},

		close : function(w) {
			w.close();
			this.onClose.dispatch(this);
		},

		createInstance : function(cl, a, b, c, d, e) {
			var f = tinymce.resolve(cl);

			return new f(a, b, c, d, e);
		},

		confirm : function(t, cb, s, w) {
			w = w || window;

			cb.call(s || this, w.confirm(this._decode(this.editor.getLang(t, t))));
		},

		alert : function(tx, cb, s, w) {
			var t = this;

			w = w || window;
			w.alert(t._decode(t.editor.getLang(tx, tx)));

			if (cb)
				cb.call(s || t);
		},

		// Internal functions

		_decode : function(s) {
			return tinymce.DOM.decode(s).replace(/\\n/g, '\n');
		}

		});
}(tinymce));(function(tinymce) {
	tinymce.CommandManager = function() {
		var execCommands = {}, queryStateCommands = {}, queryValueCommands = {};

		function add(collection, cmd, func, scope) {
			if (typeof(cmd) == 'string')
				cmd = [cmd];

			tinymce.each(cmd, function(cmd) {
				collection[cmd.toLowerCase()] = {func : func, scope : scope};
			});
		};

		tinymce.extend(this, {
			add : function(cmd, func, scope) {
				add(execCommands, cmd, func, scope);
			},

			addQueryStateHandler : function(cmd, func, scope) {
				add(queryStateCommands, cmd, func, scope);
			},

			addQueryValueHandler : function(cmd, func, scope) {
				add(queryValueCommands, cmd, func, scope);
			},

			execCommand : function(scope, cmd, ui, value, args) {
				if (cmd = execCommands[cmd.toLowerCase()]) {
					if (cmd.func.call(scope || cmd.scope, ui, value, args) !== false)
						return true;
				}
			},

			queryCommandValue : function() {
				if (cmd = queryValueCommands[cmd.toLowerCase()])
					return cmd.func.call(scope || cmd.scope, ui, value, args);
			},

			queryCommandState : function() {
				if (cmd = queryStateCommands[cmd.toLowerCase()])
					return cmd.func.call(scope || cmd.scope, ui, value, args);
			}
		});
	};

	tinymce.GlobalCommands = new tinymce.CommandManager();
})(tinymce);(function(tinymce) {
	function processRange(dom, start, end, callback) {
		var ancestor, n, startPoint, endPoint, sib;

		function findEndPoint(n, c) {
			do {
				if (n.parentNode == c)
					return n;

				n = n.parentNode;
			} while(n);
		};

		function process(n) {
			callback(n);
			tinymce.walk(n, callback, 'childNodes');
		};

		// Find common ancestor and end points
		ancestor = dom.findCommonAncestor(start, end);
		startPoint = findEndPoint(start, ancestor) || start;
		endPoint = findEndPoint(end, ancestor) || end;

		// Process left leaf
		for (n = start; n && n != startPoint; n = n.parentNode) {
			for (sib = n.nextSibling; sib; sib = sib.nextSibling)
				process(sib);
		}

		// Process middle from start to end point
		if (startPoint != endPoint) {
			for (n = startPoint.nextSibling; n && n != endPoint; n = n.nextSibling)
				process(n);
		} else
			process(startPoint);

		// Process right leaf
		for (n = end; n && n != endPoint; n = n.parentNode) {
			for (sib = n.previousSibling; sib; sib = sib.previousSibling)
				process(sib);
		}
	};

	tinymce.GlobalCommands.add('RemoveFormat', function() {
		var ed = this, dom = ed.dom, s = ed.selection, r = s.getRng(1), nodes = [], bm, start, end, sc, so, ec, eo, n;

		function findFormatRoot(n) {
			var sp;

			dom.getParent(n, function(n) {
				if (dom.is(n, ed.getParam('removeformat_selector')))
					sp = n;

				return dom.isBlock(n);
			}, ed.getBody());

			return sp;
		};

		function collect(n) {
			if (dom.is(n, ed.getParam('removeformat_selector')))
				nodes.push(n);
		};

		function walk(n) {
			collect(n);
			tinymce.walk(n, collect, 'childNodes');
		};

		bm = s.getBookmark();
		sc = r.startContainer;
		ec = r.endContainer;
		so = r.startOffset;
		eo = r.endOffset;
		sc = sc.nodeType == 1 ? sc.childNodes[Math.min(so, sc.childNodes.length - 1)] : sc;
		ec = ec.nodeType == 1 ? ec.childNodes[Math.min(so == eo ? eo : eo - 1, ec.childNodes.length - 1)] : ec;

		// Same container
		if (sc == ec) { // TEXT_NODE
			start = findFormatRoot(sc);

			// Handle single text node
			if (sc.nodeType == 3) {
				if (start && start.nodeType == 1) { // ELEMENT
					n = sc.splitText(so);
					n.splitText(eo - so);
					dom.split(start, n);

					s.moveToBookmark(bm);
				}

				return;
			}

			// Handle single element
			walk(dom.split(start, sc) || sc);
		} else {
			// Find start/end format root
			start = findFormatRoot(sc);
			end = findFormatRoot(ec);

			// Split start text node
			if (start) {
				if (sc.nodeType == 3) { // TEXT
					// Since IE doesn't support white space nodes in the DOM we need to
					// add this invisible character so that the splitText function can split the contents
					if (so == sc.nodeValue.length)
						sc.nodeValue += '\uFEFF'; // Yet another pesky IE fix

					sc = sc.splitText(so);
				}
			}

			// Split end text node
			if (end) {
				if (ec.nodeType == 3) // TEXT
					ec.splitText(eo);
			}

			// If the start and end format root is the same then we need to wrap
			// the end node in a span since the split calls might change the reference
			// Example: <p><b><em>x[yz<span>---</span>12]3</em></b></p>
			if (start && start == end)
				dom.replace(dom.create('span', {id : '__end'}, ec.cloneNode(true)), ec);

			// Split all start containers down to the format root
			if (start)
				start = dom.split(start, sc);
			else
				start = sc;

			// If there is a span wrapper use that one instead
			if (n = dom.get('__end')) {
				ec = n;
				end = findFormatRoot(ec);
			}

			// Split all end containers down to the format root
			if (end)
				end = dom.split(end, ec);
			else
				end = ec;

			// Collect nodes in between
			processRange(dom, start, end, collect);

			// Remove invisible character for IE workaround if we find it
			if (sc.nodeValue == '\uFEFF')
				sc.nodeValue = '';

			// Process start/end container elements
			walk(ec);
			walk(sc);
		}

		// Remove all collected nodes
		tinymce.each(nodes, function(n) {
			dom.remove(n, 1);
		});

		// Remove leftover wrapper
		dom.remove('__end', 1);

		s.moveToBookmark(bm);
	});
})(tinymce);
(function(tinymce) {
	tinymce.GlobalCommands.add('mceBlockQuote', function() {
		var ed = this, s = ed.selection, dom = ed.dom, sb, eb, n, bm, bq, r, bq2, i, nl;

		function getBQ(e) {
			return dom.getParent(e, function(n) {return n.nodeName === 'BLOCKQUOTE';});
		};

		// Get start/end block
		sb = dom.getParent(s.getStart(), dom.isBlock);
		eb = dom.getParent(s.getEnd(), dom.isBlock);

		// Remove blockquote(s)
		if (bq = getBQ(sb)) {
			if (sb != eb || sb.childNodes.length > 1 || (sb.childNodes.length == 1 && sb.firstChild.nodeName != 'BR'))
				bm = s.getBookmark();

			// Move all elements after the end block into new bq
			if (getBQ(eb)) {
				bq2 = bq.cloneNode(false);

				while (n = eb.nextSibling)
					bq2.appendChild(n.parentNode.removeChild(n));
			}

			// Add new bq after
			if (bq2)
				dom.insertAfter(bq2, bq);

			// Move all selected blocks after the current bq
			nl = s.getSelectedBlocks(sb, eb);
			for (i = nl.length - 1; i >= 0; i--) {
				dom.insertAfter(nl[i], bq);
			}

			// Empty bq, then remove it
			if (/^\s*$/.test(bq.innerHTML))
				dom.remove(bq, 1); // Keep children so boomark restoration works correctly

			// Empty bq, then remote it
			if (bq2 && /^\s*$/.test(bq2.innerHTML))
				dom.remove(bq2, 1); // Keep children so boomark restoration works correctly

			if (!bm) {
				// Move caret inside empty block element
				if (!tinymce.isIE) {
					r = ed.getDoc().createRange();
					r.setStart(sb, 0);
					r.setEnd(sb, 0);
					s.setRng(r);
				} else {
					s.select(sb);
					s.collapse(0);

					// IE misses the empty block some times element so we must move back the caret
					if (dom.getParent(s.getStart(), dom.isBlock) != sb) {
						r = s.getRng();
						r.move('character', -1);
						r.select();
					}
				}
			} else
				ed.selection.moveToBookmark(bm);

			return;
		}

		// Since IE can start with a totally empty document we need to add the first bq and paragraph
		if (tinymce.isIE && !sb && !eb) {
			ed.getDoc().execCommand('Indent');
			n = getBQ(s.getNode());
			n.style.margin = n.dir = ''; // IE adds margin and dir to bq
			return;
		}

		if (!sb || !eb)
			return;

		// If empty paragraph node then do not use bookmark
		if (sb != eb || sb.childNodes.length > 1 || (sb.childNodes.length == 1 && sb.firstChild.nodeName != 'BR'))
			bm = s.getBookmark();

		// Move selected block elements into a bq
		tinymce.each(s.getSelectedBlocks(getBQ(s.getStart()), getBQ(s.getEnd())), function(e) {
			// Found existing BQ add to this one
			if (e.nodeName == 'BLOCKQUOTE' && !bq) {
				bq = e;
				return;
			}

			// No BQ found, create one
			if (!bq) {
				bq = dom.create('blockquote');
				e.parentNode.insertBefore(bq, e);
			}

			// Add children from existing BQ
			if (e.nodeName == 'BLOCKQUOTE' && bq) {
				n = e.firstChild;

				while (n) {
					bq.appendChild(n.cloneNode(true));
					n = n.nextSibling;
				}

				dom.remove(e);
				return;
			}

			// Add non BQ element to BQ
			bq.appendChild(dom.remove(e));
		});

		if (!bm) {
			// Move caret inside empty block element
			if (!tinymce.isIE) {
				r = ed.getDoc().createRange();
				r.setStart(sb, 0);
				r.setEnd(sb, 0);
				s.setRng(r);
			} else {
				s.select(sb);
				s.collapse(1);
			}
		} else
			s.moveToBookmark(bm);
	});
})(tinymce);
(function(tinymce) {
	tinymce.each(['Cut', 'Copy', 'Paste'], function(cmd) {
		tinymce.GlobalCommands.add(cmd, function() {
			var ed = this, doc = ed.getDoc();

			try {
				doc.execCommand(cmd, false, null);

				// On WebKit the command will just be ignored if it's not enabled
				if (!doc.queryCommandSupported(cmd))
					throw 'Error';
			} catch (ex) {
				ed.windowManager.alert(ed.getLang('clipboard_no_support'));
			}
		});
	});
})(tinymce);
(function(tinymce) {
	tinymce.GlobalCommands.add('InsertHorizontalRule', function() {
		if (tinymce.isOpera)
			return this.getDoc().execCommand('InsertHorizontalRule', false, '');

		this.selection.setContent('<hr />');
	});
})(tinymce);
(function() {
	var cmds = tinymce.GlobalCommands;

	cmds.add(['mceEndUndoLevel', 'mceAddUndoLevel'], function() {
		this.undoManager.add();
	});

	cmds.add('Undo', function() {
		var ed = this;

		if (ed.settings.custom_undo_redo) {
			ed.undoManager.undo();
			ed.nodeChanged();
			return true;
		}

		return false; // Run browser command
	});

	cmds.add('Redo', function() {
		var ed = this;

		if (ed.settings.custom_undo_redo) {
			ed.undoManager.redo();
			ed.nodeChanged();
			return true;
		}

		return false; // Run browser command
	});
})();

/**
 * $Id: editor_template_src.js 1045 2009-03-04 20:03:18Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend, each = tinymce.each, Cookie = tinymce.util.Cookie, lastExtID, explode = tinymce.explode;

	// Tell it to load theme specific language pack(s)
	tinymce.ThemeManager.requireLangPack('advanced');

	tinymce.create('tinymce.themes.AdvancedTheme', {
		sizes : [8, 10, 12, 14, 18, 24, 36],

		// Control name lookup, format: title, command
		controls : {
			bold : ['bold_desc', 'Bold'],
			italic : ['italic_desc', 'Italic'],
			underline : ['underline_desc', 'Underline'],
			strikethrough : ['striketrough_desc', 'Strikethrough'],
			justifyleft : ['justifyleft_desc', 'JustifyLeft'],
			justifycenter : ['justifycenter_desc', 'JustifyCenter'],
			justifyright : ['justifyright_desc', 'JustifyRight'],
			justifyfull : ['justifyfull_desc', 'JustifyFull'],
			bullist : ['bullist_desc', 'InsertUnorderedList'],
			numlist : ['numlist_desc', 'InsertOrderedList'],
			outdent : ['outdent_desc', 'Outdent'],
			indent : ['indent_desc', 'Indent'],
			cut : ['cut_desc', 'Cut'],
			copy : ['copy_desc', 'Copy'],
			paste : ['paste_desc', 'Paste'],
			undo : ['undo_desc', 'Undo'],
			redo : ['redo_desc', 'Redo'],
			link : ['link_desc', 'mceLink'],
			unlink : ['unlink_desc', 'unlink'],
			image : ['image_desc', 'mceImage'],
			cleanup : ['cleanup_desc', 'mceCleanup'],
			help : ['help_desc', 'mceHelp'],
			code : ['code_desc', 'mceCodeEditor'],
			hr : ['hr_desc', 'InsertHorizontalRule'],
			removeformat : ['removeformat_desc', 'RemoveFormat'],
			sub : ['sub_desc', 'subscript'],
			sup : ['sup_desc', 'superscript'],
			forecolor : ['forecolor_desc', 'ForeColor'],
			forecolorpicker : ['forecolor_desc', 'mceForeColor'],
			backcolor : ['backcolor_desc', 'HiliteColor'],
			backcolorpicker : ['backcolor_desc', 'mceBackColor'],
			charmap : ['charmap_desc', 'mceCharMap'],
			visualaid : ['visualaid_desc', 'mceToggleVisualAid'],
			anchor : ['anchor_desc', 'mceInsertAnchor'],
			newdocument : ['newdocument_desc', 'mceNewDocument'],
			blockquote : ['blockquote_desc', 'mceBlockQuote']
		},

		stateControls : ['bold', 'italic', 'underline', 'strikethrough', 'bullist', 'numlist', 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', 'sub', 'sup', 'blockquote'],

		init : function(ed, url) {
			var t = this, s, v, o;
	
			t.editor = ed;
			t.url = url;
			t.onResolveName = new tinymce.util.Dispatcher(this);

			// Default settings
			t.settings = s = extend({
				theme_advanced_path : true,
				theme_advanced_toolbar_location : 'bottom',
				theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect",
				theme_advanced_buttons2 : "bullist,numlist,|,outdent,indent,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code",
				theme_advanced_buttons3 : "hr,removeformat,visualaid,|,sub,sup,|,charmap",
				theme_advanced_blockformats : "p,address,pre,h1,h2,h3,h4,h5,h6",
				theme_advanced_toolbar_align : "center",
				theme_advanced_fonts : "Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats",
				theme_advanced_more_colors : 1,
				theme_advanced_row_height : 23,
				theme_advanced_resize_horizontal : 1,
				theme_advanced_resizing_use_cookie : 1,
				theme_advanced_font_sizes : "1,2,3,4,5,6,7",
				readonly : ed.settings.readonly
			}, ed.settings);

			// Setup default font_size_style_values
			if (!s.font_size_style_values)
				s.font_size_style_values = "8pt,10pt,12pt,14pt,18pt,24pt,36pt";

			if (tinymce.is(s.theme_advanced_font_sizes, 'string')) {
				s.font_size_style_values = tinymce.explode(s.font_size_style_values);
				s.font_size_classes = tinymce.explode(s.font_size_classes || '');

				// Parse string value
				o = {};
				ed.settings.theme_advanced_font_sizes = s.theme_advanced_font_sizes;
				each(ed.getParam('theme_advanced_font_sizes', '', 'hash'), function(v, k) {
					var cl;

					if (k == v && v >= 1 && v <= 7) {
						k = v + ' (' + t.sizes[v - 1] + 'pt)';

						if (ed.settings.convert_fonts_to_spans) {
							cl = s.font_size_classes[v - 1];
							v = s.font_size_style_values[v - 1] || (t.sizes[v - 1] + 'pt');
						}
					}

					if (/^\s*\./.test(v))
						cl = v.replace(/\./g, '');

					o[k] = cl ? {'class' : cl} : {fontSize : v};
				});

				s.theme_advanced_font_sizes = o;
			}

			if ((v = s.theme_advanced_path_location) && v != 'none')
				s.theme_advanced_statusbar_location = s.theme_advanced_path_location;

			if (s.theme_advanced_statusbar_location == 'none')
				s.theme_advanced_statusbar_location = 0;

			// Init editor
			ed.onInit.add(function() {
				ed.onNodeChange.add(t._nodeChanged, t);

                // ATLASSIAN - don't include the default advanced theme's css
                //if (ed.settings.content_css !== false)
				//	ed.dom.loadCSS(ed.baseURI.toAbsolute("themes/advanced/skins/" + ed.settings.skin + "/content.css"));
			});

			ed.onSetProgressState.add(function(ed, b, ti) {
				var co, id = ed.id, tb;

				if (b) {
					t.progressTimer = setTimeout(function() {
						co = ed.getContainer();
						co = co.insertBefore(DOM.create('DIV', {style : 'position:relative'}), co.firstChild);
						tb = DOM.get(ed.id + '_tbl');

						DOM.add(co, 'div', {id : id + '_blocker', 'class' : 'mceBlocker', style : {width : tb.clientWidth + 2, height : tb.clientHeight + 2}});
						DOM.add(co, 'div', {id : id + '_progress', 'class' : 'mceProgress', style : {left : tb.clientWidth / 2, top : tb.clientHeight / 2}});
					}, ti || 0);
				} else {
					DOM.remove(id + '_blocker');
					DOM.remove(id + '_progress');
					clearTimeout(t.progressTimer);
				}
			});

			DOM.loadCSS(s.editor_css ? ed.documentBaseURI.toAbsolute(s.editor_css) : url + "/skins/" + ed.settings.skin + "/ui.css");

			if (s.skin_variant)
				DOM.loadCSS(url + "/skins/" + ed.settings.skin + "/ui_" + s.skin_variant + ".css");
		},

		createControl : function(n, cf) {
			var cd, c;

			if (c = cf.createControl(n))
				return c;

			switch (n) {
				case "styleselect":
					return this._createStyleSelect();

				case "formatselect":
					return this._createBlockFormats();

				case "fontselect":
					return this._createFontSelect();

				case "fontsizeselect":
					return this._createFontSizeSelect();

				case "forecolor":
					return this._createForeColorMenu();

				case "backcolor":
					return this._createBackColorMenu();
			}

			if ((cd = this.controls[n]))
				return cf.createButton(n, {title : "advanced." + cd[0], cmd : cd[1], ui : cd[2], value : cd[3]});
		},

		execCommand : function(cmd, ui, val) {
			var f = this['_' + cmd];

			if (f) {
				f.call(this, ui, val);
				return true;
			}

			return false;
		},

		_importClasses : function(e) {
			var ed = this.editor, c = ed.controlManager.get('styleselect');

			if (c.getLength() == 0) {
				each(ed.dom.getClasses(), function(o) {
					c.add(o['class'], o['class']);
				});
			}
		},

		_createStyleSelect : function(n) {
			var t = this, ed = t.editor, cf = ed.controlManager, c = cf.createListBox('styleselect', {
				title : 'advanced.style_select',
				onselect : function(v) {
					if (c.selectedValue === v) {
						ed.execCommand('mceSetStyleInfo', 0, {command : 'removeformat'});
						c.select();
						return false;
					} else
						ed.execCommand('mceSetCSSClass', 0, v);
				}
			});

			if (c) {
				each(ed.getParam('theme_advanced_styles', '', 'hash'), function(v, k) {
					if (v)
						c.add(t.editor.translate(k), v);
				});

				c.onPostRender.add(function(ed, n) {
					if (!c.NativeListBox) {
						Event.add(n.id + '_text', 'focus', t._importClasses, t);
						Event.add(n.id + '_text', 'mousedown', t._importClasses, t);
						Event.add(n.id + '_open', 'focus', t._importClasses, t);
						Event.add(n.id + '_open', 'mousedown', t._importClasses, t);
					} else
						Event.add(n.id, 'focus', t._importClasses, t);
				});
			}

			return c;
		},

		_createFontSelect : function() {
			var c, t = this, ed = t.editor;

			c = ed.controlManager.createListBox('fontselect', {title : 'advanced.fontdefault', cmd : 'FontName'});
			if (c) {
				each(ed.getParam('theme_advanced_fonts', t.settings.theme_advanced_fonts, 'hash'), function(v, k) {
					c.add(ed.translate(k), v, {style : v.indexOf('dings') == -1 ? 'font-family:' + v : ''});
				});
			}

			return c;
		},

		_createFontSizeSelect : function() {
			var t = this, ed = t.editor, c, i = 0, cl = [];

			c = ed.controlManager.createListBox('fontsizeselect', {title : 'advanced.font_size', onselect : function(v) {
				if (v.fontSize)
					ed.execCommand('FontSize', false, v.fontSize);
				else {
					each(t.settings.theme_advanced_font_sizes, function(v, k) {
						if (v['class'])
							cl.push(v['class']);
					});

					ed.editorCommands._applyInlineStyle('span', {'class' : v['class']}, {check_classes : cl});
				}
			}});

			if (c) {
				each(t.settings.theme_advanced_font_sizes, function(v, k) {
					var fz = v.fontSize;

					if (fz >= 1 && fz <= 7)
						fz = t.sizes[parseInt(fz) - 1] + 'pt';

					c.add(k, v, {'style' : 'font-size:' + fz, 'class' : 'mceFontSize' + (i++) + (' ' + (v['class'] || ''))});
				});
			}

			return c;
		},

		_createBlockFormats : function() {
			var c, fmts = {
				//p : 'advanced.paragraph',
				address : 'advanced.address',
				pre : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.pre',
				h1 : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.h1',
				h2 : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.h2',
				h3 : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.h3',
				h4 : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.h4',
				h5 : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.h5',
				h6 : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.h6',
                macro_quote : 'advanced.macro_quote',
                macro_noformat : 'advanced.macro_noformat',
                macro_panel : 'advanced.macro_panel',
                macro_code : 'advanced.macro_code',
                div : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.div',
				blockquote : 'advanced.blockquote',
				code : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.code',
				dt : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.dt',
				dd : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.dd',
				samp : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.samp'
			}, t = this;

            // ATLASSIAN - make the default format style be paragraphs
            c = t.editor.controlManager.createListBox('formatselect', {title : 'advanced.paragraph', cmd : 'FormatBlock'});
			if (c) {
				each(t.editor.getParam('theme_advanced_blockformats', t.settings.theme_advanced_blockformats, 'hash'), function(v, k) {
					c.add(t.editor.translate(k != v ? k : fmts[v]), v, {'class' : 'mce_formatPreview mce_' + v});
				});
			}

			return c;
		},

		_createForeColorMenu : function() {
			var c, t = this, s = t.settings, o = {}, v;

			if (s.theme_advanced_more_colors) {
				o.more_colors_func = function() {
					t._mceColorPicker(0, {
						color : c.value,
						func : function(co) {
							c.setColor(co);
						}
					});
				};
			}

			if (v = s.theme_advanced_text_colors)
				o.colors = v;

			if (s.theme_advanced_default_foreground_color)
				o.default_color = s.theme_advanced_default_foreground_color;

			o.title = 'advanced.forecolor_desc';
			o.cmd = 'ForeColor';
			o.scope = this;

			c = t.editor.controlManager.createColorSplitButton('forecolor', o);

			return c;
		},

		_createBackColorMenu : function() {
			var c, t = this, s = t.settings, o = {}, v;

			if (s.theme_advanced_more_colors) {
				o.more_colors_func = function() {
					t._mceColorPicker(0, {
						color : c.value,
						func : function(co) {
							c.setColor(co);
						}
					});
				};
			}

			if (v = s.theme_advanced_background_colors)
				o.colors = v;

			if (s.theme_advanced_default_background_color)
				o.default_color = s.theme_advanced_default_background_color;

			o.title = 'advanced.backcolor_desc';
			o.cmd = 'HiliteColor';
			o.scope = this;

			c = t.editor.controlManager.createColorSplitButton('backcolor', o);

			return c;
		},

		renderUI : function(o) {
			var n, ic, tb, t = this, ed = t.editor, s = t.settings, sc, p, nl;

			n = p = DOM.create('span', {id : ed.id + '_parent', 'class' : 'mceEditor ' + ed.settings.skin + 'Skin' + (s.skin_variant ? ' ' + ed.settings.skin + 'Skin' + t._ufirst(s.skin_variant) : '')});

			if (!DOM.boxModel)
				n = DOM.add(n, 'div', {'class' : 'mceOldBoxModel'});

			n = sc = DOM.add(n, 'table', {id : ed.id + '_tbl', 'class' : 'mceLayout', cellSpacing : 0, cellPadding : 0});
			n = tb = DOM.add(n, 'tbody');

			switch ((s.theme_advanced_layout_manager || '').toLowerCase()) {
				case "rowlayout":
					ic = t._rowLayout(s, tb, o);
					break;

				case "customlayout":
					ic = ed.execCallback("theme_advanced_custom_layout", s, tb, o, p);
					break;

				default:
					ic = t._simpleLayout(s, tb, o, p);
			}

			n = o.targetNode;

			// Add classes to first and last TRs
			nl = DOM.stdMode ? sc.getElementsByTagName('tr') : sc.rows; // Quick fix for IE 8
			DOM.addClass(nl[0], 'mceFirst');
			DOM.addClass(nl[nl.length - 1], 'mceLast');

			// Add classes to first and last TDs
			each(DOM.select('tr', tb), function(n) {
				DOM.addClass(n.firstChild, 'mceFirst');
				DOM.addClass(n.childNodes[n.childNodes.length - 1], 'mceLast');
			});

			if (DOM.get(s.theme_advanced_toolbar_container))
				DOM.get(s.theme_advanced_toolbar_container).appendChild(p);
			else
				DOM.insertAfter(p, n);

			Event.add(ed.id + '_path_row', 'click', function(e) {
				e = e.target;

				if (e.nodeName == 'A') {
					t._sel(e.className.replace(/^.*mcePath_([0-9]+).*$/, '$1'));

					return Event.cancel(e);
				}
			});
/*
			if (DOM.get(ed.id + '_path_row')) {
				Event.add(ed.id + '_tbl', 'mouseover', function(e) {
					var re;
	
					e = e.target;

					if (e.nodeName == 'SPAN' && DOM.hasClass(e.parentNode, 'mceButton')) {
						re = DOM.get(ed.id + '_path_row');
						t.lastPath = re.innerHTML;
						DOM.setHTML(re, e.parentNode.title);
					}
				});

				Event.add(ed.id + '_tbl', 'mouseout', function(e) {
					if (t.lastPath) {
						DOM.setHTML(ed.id + '_path_row', t.lastPath);
						t.lastPath = 0;
					}
				});
			}
*/

			if (!ed.getParam('accessibility_focus'))
				Event.add(DOM.add(p, 'a', {href : '#'}, '<!-- IE -->'), 'focus', function() {tinyMCE.get(ed.id).focus();});

			if (s.theme_advanced_toolbar_location == 'external')
				o.deltaHeight = 0;

			t.deltaHeight = o.deltaHeight;
			o.targetNode = null;

			return {
				iframeContainer : ic,
				editorContainer : ed.id + '_parent',
				sizeContainer : sc,
				deltaHeight : o.deltaHeight
			};
		},

		getInfo : function() {
			return {
				longname : 'Advanced theme',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com/',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			}
		},

		resizeBy : function(dw, dh) {
			var e = DOM.get(this.editor.id + '_tbl');

			this.resizeTo(e.clientWidth + dw, e.clientHeight + dh);
		},

		resizeTo : function(w, h) {
			var ed = this.editor, s = ed.settings, e = DOM.get(ed.id + '_tbl'), ifr = DOM.get(ed.id + '_ifr'), dh;

			// Boundery fix box
			w = Math.max(s.theme_advanced_resizing_min_width || 100, w);
			h = Math.max(s.theme_advanced_resizing_min_height || 100, h);
			w = Math.min(s.theme_advanced_resizing_max_width || 0xFFFF, w);
			h = Math.min(s.theme_advanced_resizing_max_height || 0xFFFF, h);

			// Calc difference between iframe and container
			dh = e.clientHeight - ifr.clientHeight;

			// Resize iframe and container
			DOM.setStyle(ifr, 'height', h - dh);
			DOM.setStyles(e, {width : w, height : h});
		},

		destroy : function() {
			var id = this.editor.id;

			Event.clear(id + '_resize');
			Event.clear(id + '_path_row');
			Event.clear(id + '_external_close');
		},

		// Internal functions

		_simpleLayout : function(s, tb, o, p) {
			var t = this, ed = t.editor, lo = s.theme_advanced_toolbar_location, sl = s.theme_advanced_statusbar_location, n, ic, etb, c;

			if (s.readonly) {
				n = DOM.add(tb, 'tr');
				n = ic = DOM.add(n, 'td', {'class' : 'mceIframeContainer'});
				return ic;
			}

			// Create toolbar container at top
			if (lo == 'top')
				t._addToolbars(tb, o);

			// Create external toolbar
			if (lo == 'external') {
				n = c = DOM.create('div', {style : 'position:relative'});
				n = DOM.add(n, 'div', {id : ed.id + '_external', 'class' : 'mceExternalToolbar'});
				DOM.add(n, 'a', {id : ed.id + '_external_close', href : 'javascript:;', 'class' : 'mceExternalClose'});
				n = DOM.add(n, 'table', {id : ed.id + '_tblext', cellSpacing : 0, cellPadding : 0});
				etb = DOM.add(n, 'tbody');

				if (p.firstChild.className == 'mceOldBoxModel')
					p.firstChild.appendChild(c);
				else
					p.insertBefore(c, p.firstChild);

				t._addToolbars(etb, o);

				ed.onMouseUp.add(function() {
					var e = DOM.get(ed.id + '_external');
					DOM.show(e);

					DOM.hide(lastExtID);

					var f = Event.add(ed.id + '_external_close', 'click', function() {
						DOM.hide(ed.id + '_external');
						Event.remove(ed.id + '_external_close', 'click', f);
					});

					DOM.show(e);
					DOM.setStyle(e, 'top', 0 - DOM.getRect(ed.id + '_tblext').h - 1);

					// Fixes IE rendering bug
					DOM.hide(e);
					DOM.show(e);
					e.style.filter = '';

					lastExtID = ed.id + '_external';

					e = null;
				});
			}

			if (sl == 'top')
				t._addStatusBar(tb, o);

			// Create iframe container
			if (!s.theme_advanced_toolbar_container) {
				n = DOM.add(tb, 'tr');
				n = ic = DOM.add(n, 'td', {'class' : 'mceIframeContainer'});
			}

			// Create toolbar container at bottom
			if (lo == 'bottom')
				t._addToolbars(tb, o);

			if (sl == 'bottom')
				t._addStatusBar(tb, o);

			return ic;
		},

		_rowLayout : function(s, tb, o) {
			var t = this, ed = t.editor, dc, da, cf = ed.controlManager, n, ic, to, a;

			dc = s.theme_advanced_containers_default_class || '';
			da = s.theme_advanced_containers_default_align || 'center';

			each(explode(s.theme_advanced_containers || ''), function(c, i) {
				var v = s['theme_advanced_container_' + c] || '';

				switch (v.toLowerCase()) {
					case 'mceeditor':
						n = DOM.add(tb, 'tr');
						n = ic = DOM.add(n, 'td', {'class' : 'mceIframeContainer'});
						break;

					case 'mceelementpath':
						t._addStatusBar(tb, o);
						break;

					default:
						a = (s['theme_advanced_container_' + c + '_align'] || da).toLowerCase();
						a = 'mce' + t._ufirst(a);

						n = DOM.add(DOM.add(tb, 'tr'), 'td', {
							'class' : 'mceToolbar ' + (s['theme_advanced_container_' + c + '_class'] || dc) + ' ' + a || da
						});

						to = cf.createToolbar("toolbar" + i);
						t._addControls(v, to);
						DOM.setHTML(n, to.renderHTML());
						o.deltaHeight -= s.theme_advanced_row_height;
				}
			});

			return ic;
		},

		_addControls : function(v, tb) {
			var t = this, s = t.settings, di, cf = t.editor.controlManager;

			if (s.theme_advanced_disable && !t._disabled) {
				di = {};

				each(explode(s.theme_advanced_disable), function(v) {
					di[v] = 1;
				});

				t._disabled = di;
			} else
				di = t._disabled;

			each(explode(v), function(n) {
				var c;

				if (di && di[n])
					return;

				// Compatiblity with 2.x
				if (n == 'tablecontrols') {
					each(["table","|","row_props","cell_props","|","row_before","row_after","delete_row","|","col_before","col_after","delete_col","|","split_cells","merge_cells"], function(n) {
						n = t.createControl(n, cf);

						if (n)
							tb.add(n);
					});

					return;
				}

				c = t.createControl(n, cf);

				if (c)
					tb.add(c);
			});
		},

		_addToolbars : function(c, o) {
			var t = this, i, tb, ed = t.editor, s = t.settings, v, cf = ed.controlManager, di, n, h = [], a;

			a = s.theme_advanced_toolbar_align.toLowerCase();
			a = 'mce' + t._ufirst(a);

			n = DOM.add(DOM.add(c, 'tr'), 'td', {'class' : 'mceToolbar ' + a});

			if (!ed.getParam('accessibility_focus'))
				h.push(DOM.createHTML('a', {href : '#', onfocus : 'tinyMCE.get(\'' + ed.id + '\').focus();'}, '<!-- IE -->'));

			h.push(DOM.createHTML('a', {href : '#', accesskey : 'q', title : ed.getLang("advanced.toolbar_focus")}, '<!-- IE -->'));

			// Create toolbar and add the controls
			for (i=1; (v = s['theme_advanced_buttons' + i]); i++) {
				tb = cf.createToolbar("toolbar" + i, {'class' : 'mceToolbarRow' + i});

				if (s['theme_advanced_buttons' + i + '_add'])
					v += ',' + s['theme_advanced_buttons' + i + '_add'];

				if (s['theme_advanced_buttons' + i + '_add_before'])
					v = s['theme_advanced_buttons' + i + '_add_before'] + ',' + v;

				t._addControls(v, tb);

				//n.appendChild(n = tb.render());
				h.push(tb.renderHTML());

				o.deltaHeight -= s.theme_advanced_row_height;
			}

			h.push(DOM.createHTML('a', {href : '#', accesskey : 'z', title : ed.getLang("advanced.toolbar_focus"), onfocus : 'tinyMCE.getInstanceById(\'' + ed.id + '\').focus();'}, '<!-- IE -->'));
			DOM.setHTML(n, h.join(''));
		},

		_addStatusBar : function(tb, o) {
			var n, t = this, ed = t.editor, s = t.settings, r, mf, me, td;

			n = DOM.add(tb, 'tr');
			n = td = DOM.add(n, 'td', {'class' : 'mceStatusbar'});
			n = DOM.add(n, 'div', {id : ed.id + '_path_row'}, s.theme_advanced_path ? ed.translate('http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/advanced.path') + ': ' : '&#160;');
			DOM.add(n, 'a', {href : '#', accesskey : 'x'});

			if (s.theme_advanced_resizing) {
				DOM.add(td, 'a', {id : ed.id + '_resize', href : 'javascript:;', onclick : "return false;", 'class' : 'mceResize'});

				if (s.theme_advanced_resizing_use_cookie) {
					ed.onPostRender.add(function() {
						var o = Cookie.getHash("TinyMCE_" + ed.id + "_size"), c = DOM.get(ed.id + '_tbl');

						if (!o)
							return;

						if (s.theme_advanced_resize_horizontal)
							c.style.width = Math.max(10, o.cw) + 'px';

						c.style.height = Math.max(10, o.ch) + 'px';
						DOM.get(ed.id + '_ifr').style.height = Math.max(10, parseInt(o.ch) + t.deltaHeight) + 'px';
					});
				}

				ed.onPostRender.add(function() {
					Event.add(ed.id + '_resize', 'mousedown', function(e) {
						var c, p, w, h, n, pa;

						// Measure container
						c = DOM.get(ed.id + '_tbl');
						w = c.clientWidth;
						h = c.clientHeight;

						miw = s.theme_advanced_resizing_min_width || 100;
						mih = s.theme_advanced_resizing_min_height || 100;
						maw = s.theme_advanced_resizing_max_width || 0xFFFF;
						mah = s.theme_advanced_resizing_max_height || 0xFFFF;

						// Setup placeholder
						p = DOM.add(DOM.get(ed.id + '_parent'), 'div', {'class' : 'mcePlaceHolder'});
						DOM.setStyles(p, {width : w, height : h});

						// Replace with placeholder
						DOM.hide(c);
						DOM.show(p);

						// Create internal resize obj
						r = {
							x : e.screenX,
							y : e.screenY,
							w : w,
							h : h,
							dx : null,
							dy : null
						};

						// Start listening
						mf = Event.add(DOM.doc, 'mousemove', function(e) {
							var w, h;

							// Calc delta values
							r.dx = e.screenX - r.x;
							r.dy = e.screenY - r.y;

							// Boundery fix box
							w = Math.max(miw, r.w + r.dx);
							h = Math.max(mih, r.h + r.dy);
							w = Math.min(maw, w);
							h = Math.min(mah, h);

							// Resize placeholder
							if (s.theme_advanced_resize_horizontal)
								p.style.width = w + 'px';

							p.style.height = h + 'px';

							return Event.cancel(e);
						});

						me = Event.add(DOM.doc, 'mouseup', function(e) {
							var ifr;

							// Stop listening
							Event.remove(DOM.doc, 'mousemove', mf);
							Event.remove(DOM.doc, 'mouseup', me);

							c.style.display = '';
							DOM.remove(p);

							if (r.dx === null)
								return;

							ifr = DOM.get(ed.id + '_ifr');

							if (s.theme_advanced_resize_horizontal)
								c.style.width = Math.max(10, r.w + r.dx) + 'px';

							c.style.height = Math.max(10, r.h + r.dy) + 'px';
							ifr.style.height = Math.max(10, ifr.clientHeight + r.dy) + 'px';

							if (s.theme_advanced_resizing_use_cookie) {
								Cookie.setHash("TinyMCE_" + ed.id + "_size", {
									cw : r.w + r.dx,
									ch : r.h + r.dy
								});
							}
						});

						return Event.cancel(e);
					});
				});
			}

			o.deltaHeight -= 21;
			n = tb = null;
		},

		_nodeChanged : function(ed, cm, n, co) {
			var t = this, p, de = 0, v, c, s = t.settings, cl, fz, fn;

			if (s.readonly)
				return;

			tinymce.each(t.stateControls, function(c) {
				cm.setActive(c, ed.queryCommandState(t.controls[c][1]));
			});

			cm.setActive('visualaid', ed.hasVisual);
			cm.setDisabled('undo', !ed.undoManager.hasUndo() && !ed.typing);
			cm.setDisabled('redo', !ed.undoManager.hasRedo());
			cm.setDisabled('outdent', !ed.queryCommandState('Outdent'));
            // ATLASSIAN - only support indentation in lists
            cm.setDisabled('indent', !(ed.queryCommandState('InsertUnorderedList') || ed.queryCommandState('InsertOrderedList')));

			p = DOM.getParent(n, 'A');
			if (c = cm.get('link')) {
				if (!p || !p.name) {
					c.setDisabled(!p && co);
					c.setActive(!!p);
				}
			}

			if (c = cm.get('unlink')) {
				c.setDisabled(!p && co);
				c.setActive(!!p && !p.name);
			}

			if (c = cm.get('anchor')) {
				c.setActive(!!p && p.name);

				if (tinymce.isWebKit) {
					p = DOM.getParent(n, 'IMG');
					c.setActive(!!p && DOM.getAttrib(p, 'mce_name') == 'a');
				}
			}

			p = DOM.getParent(n, 'IMG');
			if (c = cm.get('image'))
				c.setActive(!!p && n.className.indexOf('mceItem') == -1);

			if (c = cm.get('styleselect')) {
				if (n.className) {
					t._importClasses();
					c.select(n.className);
				} else
					c.select();
			}

			if (c = cm.get('formatselect')) {
				p = DOM.getParent(n, DOM.isBlock);

				if (p)
					c.select(p.nodeName.toLowerCase());
			}

			if (ed.settings.convert_fonts_to_spans) {
				ed.dom.getParent(n, function(n) {
					if (n.nodeName === 'SPAN') {
						if (!cl && n.className)
							cl = n.className;

						if (!fz && n.style.fontSize)
							fz = n.style.fontSize;

						if (!fn && n.style.fontFamily)
							fn = n.style.fontFamily.replace(/[\"\']+/g, '').replace(/^([^,]+).*/, '$1').toLowerCase();
					}

					return false;
				});

				if (c = cm.get('fontselect')) {
					c.select(function(v) {
						return v.replace(/^([^,]+).*/, '$1').toLowerCase() == fn;
					});
				}

				if (c = cm.get('fontsizeselect')) {
					c.select(function(v) {
						if (v.fontSize && v.fontSize === fz)
							return true;

						if (v['class'] && v['class'] === cl)
							return true;
					});
				}
			} else {
				if (c = cm.get('fontselect'))
					c.select(ed.queryCommandValue('FontName'));

				if (c = cm.get('fontsizeselect')) {
					v = ed.queryCommandValue('FontSize');
					c.select(function(iv) {
						return iv.fontSize == v;
					});
				}
			}

			if (s.theme_advanced_path && s.theme_advanced_statusbar_location) {
				p = DOM.get(ed.id + '_path') || DOM.add(ed.id + '_path_row', 'span', {id : ed.id + '_path'});
				DOM.setHTML(p, '');

				ed.dom.getParent(n, function(n) {
					var na = n.nodeName.toLowerCase(), u, pi, ti = '';

					// Ignore non element and hidden elements
					if (n.nodeType != 1 || n.nodeName === 'BR' || (DOM.hasClass(n, 'mceItemHidden') || DOM.hasClass(n, 'mceItemRemoved')))
						return;

					// Fake name
					if (v = DOM.getAttrib(n, 'mce_name'))
						na = v;

					// Handle prefix
					if (tinymce.isIE && n.scopeName !== 'HTML')
						na = n.scopeName + ':' + na;

					// Remove internal prefix
					na = na.replace(/mce\:/g, '');

					// Handle node name
					switch (na) {
						case 'b':
							na = 'strong';
							break;

						case 'i':
							na = 'em';
							break;

						case 'img':
							if (v = DOM.getAttrib(n, 'src'))
								ti += 'src: ' + v + ' ';

							break;

						case 'a':
							if (v = DOM.getAttrib(n, 'name')) {
								ti += 'name: ' + v + ' ';
								na += '#' + v;
							}

							if (v = DOM.getAttrib(n, 'href'))
								ti += 'href: ' + v + ' ';

							break;

						case 'font':
							if (s.convert_fonts_to_spans)
								na = 'span';

							if (v = DOM.getAttrib(n, 'face'))
								ti += 'font: ' + v + ' ';

							if (v = DOM.getAttrib(n, 'size'))
								ti += 'size: ' + v + ' ';

							if (v = DOM.getAttrib(n, 'color'))
								ti += 'color: ' + v + ' ';

							break;

						case 'span':
							if (v = DOM.getAttrib(n, 'style'))
								ti += 'style: ' + v + ' ';

							break;
					}

					if (v = DOM.getAttrib(n, 'id'))
						ti += 'id: ' + v + ' ';

					if (v = n.className) {
						v = v.replace(/(webkit-[\w\-]+|Apple-[\w\-]+|mceItem\w+|mceVisualAid)/g, '');

						if (v && v.indexOf('mceItem') == -1) {
							ti += 'class: ' + v + ' ';

							if (DOM.isBlock(n) || na == 'img' || na == 'span')
								na += '.' + v;
						}
					}

					na = na.replace(/(html:)/g, '');
					na = {name : na, node : n, title : ti};
					t.onResolveName.dispatch(t, na);
					ti = na.title;
					na = na.name;

					//u = "javascript:tinymce.EditorManager.get('" + ed.id + "').theme._sel('" + (de++) + "');";
					pi = DOM.create('a', {'href' : "javascript:;", onmousedown : "return false;", title : ti, 'class' : 'mcePath_' + (de++)}, na);

					if (p.hasChildNodes()) {
						p.insertBefore(DOM.doc.createTextNode(' \u00bb '), p.firstChild);
						p.insertBefore(pi, p.firstChild);
					} else
						p.appendChild(pi);
				}, ed.getBody());
			}
		},

		// Commands gets called by execCommand

		_sel : function(v) {
			this.editor.execCommand('mceSelectNodeDepth', false, v);
		},

		_mceInsertAnchor : function(ui, v) {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/anchor.htm',
				width : 320 + parseInt(ed.getLang('advanced.anchor_delta_width', 0)),
				height : 90 + parseInt(ed.getLang('advanced.anchor_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceCharMap : function() {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinyMCE.settings.plugin_action_base_path + '/charmap.action',
				width : 650 + parseInt(ed.getLang('advanced.charmap_delta_width', 0)),
				height : 350 + parseInt(ed.getLang('advanced.charmap_delta_height', 0)),
				inline : true,
                name: "charmap_inserter"
            }, {
				theme_url : this.url
			});
		},

		_mceHelp : function() {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/about.htm',
				width : 480,
				height : 380,
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceColorPicker : function(u, v) {
			var ed = this.editor;

			v = v || {};

			ed.windowManager.open({
                name: "color_picker",
                url : tinyMCE.settings.plugin_action_base_path + '/color_picker.action',
				width : 375 + parseInt(ed.getLang('advanced.colorpicker_delta_width', 0)),
				height : 280 + parseInt(ed.getLang('advanced.colorpicker_delta_height', 0)),
				close_previous : false,
				inline : true
			}, {
				input_color : v.color,
				func : v.func,
				theme_url : this.url
			});
		},

		_mceCodeEditor : function(ui, val) {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/source_editor.htm',
				width : parseInt(ed.getParam("theme_advanced_source_editor_width", 720)),
				height : parseInt(ed.getParam("theme_advanced_source_editor_height", 580)),
				inline : true,
				resizable : true,
				maximizable : true
			}, {
				theme_url : this.url
			});
		},

		_mceImage : function(ui, val) {
			var ed = this.editor;

			// Internal image object like a flash placeholder
			if (ed.dom.getAttrib(ed.selection.getNode(), 'class').indexOf('mceItem') != -1)
				return;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/image.htm',
				width : 355 + parseInt(ed.getLang('advanced.image_delta_width', 0)),
				height : 275 + parseInt(ed.getLang('advanced.image_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceLink : function(ui, val) {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/link.htm',
				width : 310 + parseInt(ed.getLang('advanced.link_delta_width', 0)),
				height : 200 + parseInt(ed.getLang('advanced.link_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceNewDocument : function() {
			var ed = this.editor;

			ed.windowManager.confirm('advanced.newdocument', function(s) {
				if (s)
					ed.execCommand('mceSetContent', false, '');
			});
		},

		_mceForeColor : function() {
			var t = this;

			this._mceColorPicker(0, {
				color: t.fgColor,
				func : function(co) {
					t.fgColor = co;
					t.editor.execCommand('ForeColor', false, co);
				}
			});
		},

		_mceBackColor : function() {
			var t = this;

			this._mceColorPicker(0, {
				color: t.bgColor,
				func : function(co) {
					t.bgColor = co;
					t.editor.execCommand('HiliteColor', false, co);
				}
			});
		},

		_ufirst : function(s) {
			return s.substring(0, 1).toUpperCase() + s.substring(1);
		}
	});

	tinymce.ThemeManager.add('advanced', tinymce.themes.AdvancedTheme);
}(tinymce));
/**
 * $Id: editor_plugin_src.js 953 2008-11-04 10:16:50Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	tinymce.create('tinymce.plugins.TablePlugin', {
		init : function(ed, url) {
			var t = this;

			t.editor = ed;
			t.url = url;

			// Register buttons
			each([
				['table', 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/table.desc', 'mceInsertTable', true],
				['delete_table', 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/table.del', 'mceTableDelete'],
				['delete_col', 'table.delete_col_desc', 'mceTableDeleteCol'],
				['delete_row', 'table.delete_row_desc', 'mceTableDeleteRow'],
				['col_after', 'table.col_after_desc', 'mceTableInsertColAfter'],
				['col_before', 'table.col_before_desc', 'mceTableInsertColBefore'],
				['row_after', 'table.row_after_desc', 'mceTableInsertRowAfter'],
				['row_before', 'table.row_before_desc', 'mceTableInsertRowBefore'],
				['row_props', 'table.row_desc', 'mceTableRowProps', true],
				['cell_props', 'table.cell_desc', 'mceTableCellProps', true],
				['split_cells', 'table.split_cells_desc', 'mceTableSplitCells', true],
				['merge_cells', 'table.merge_cells_desc', 'mceTableMergeCells', true]
			], function(c) {
				ed.addButton(c[0], {title : c[1], cmd : c[2], ui : c[3]});
			});

			if (ed.getParam('inline_styles')) {
				// Force move of attribs to styles in strict mode
				ed.onPreProcess.add(function(ed, o) {
					var dom = ed.dom;

					each(dom.select('table', o.node), function(n) {
						var v;

						if (v = dom.getAttrib(n, 'width')) {
							dom.setStyle(n, 'width', v);
							dom.setAttrib(n, 'width');
						}

						if (v = dom.getAttrib(n, 'height')) {
							dom.setStyle(n, 'height', v);
							dom.setAttrib(n, 'height');
						}
					});
				});
			}

			ed.onInit.add(function() {
				if (ed && ed.plugins.contextmenu) {
					ed.plugins.contextmenu.onContextMenu.add(function(th, m, e) {
						var sm, se = ed.selection, el = se.getNode() || ed.getBody();

                        if (ed.dom.getParent(e, 'td') || ed.dom.getParent(e, 'th') || ed.dom.getParent(e, 'table')) {
							//ATLASSIAN - we want insert link, image menus
                            //m.removeAll();

							m.add({title : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/table.del', icon : 'delete_table', cmd : 'mceTableDelete', ui : true});
							m.addSeparator();

							// Row menu
							sm = m.addMenu({title : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/table.row'});
							sm.add({title : 'table.row_before_desc', icon : 'row_before', cmd : 'mceTableInsertRowBefore'});
							sm.add({title : 'table.row_after_desc', icon : 'row_after', cmd : 'mceTableInsertRowAfter'});
							sm.add({title : 'table.delete_row_desc', icon : 'delete_row', cmd : 'mceTableDeleteRow'});
							sm.add({title : 'table.heading_row', icon : 'row_props', cmd : 'mceTableHeadingRow'});
							sm.addSeparator();
							sm.add({title : 'table.cut_row_desc', icon : 'cut', cmd : 'mceTableCutRow'});
							sm.add({title : 'table.copy_row_desc', icon : 'copy', cmd : 'mceTableCopyRow'});
                            if(ed.tableRowClipboard) {
                                sm.add({title : 'table.paste_row_before_desc', icon : 'paste', cmd : 'mceTablePasteRowBefore'});
                                sm.add({title : 'table.paste_row_after_desc', icon : 'paste', cmd : 'mceTablePasteRowAfter'});
                            }
							// Column menu
							sm = m.addMenu({title : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/table.col'});
							sm.add({title : 'table.col_before_desc', icon : 'col_before', cmd : 'mceTableInsertColBefore'});
							sm.add({title : 'table.col_after_desc', icon : 'col_after', cmd : 'mceTableInsertColAfter'});
							sm.add({title : 'table.delete_col_desc', icon : 'delete_col', cmd : 'mceTableDeleteCol'});
						} else {
							m.add({title : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/table.desc', icon : 'table', cmd : 'mceInsertTable', ui : true});
                        }
                        m.addSeparator();
                    });
				}
			});

            // ATLASSIAN - tab handling done in tinyMceAdapter.js
			// Add undo level when new rows are created using the tab key
//			ed.onKeyDown.add(function(ed, e) {
//				if (e.keyCode == 9 && ed.dom.getParent(ed.selection.getNode(), 'TABLE')) {
//					if (!tinymce.isGecko && !tinymce.isOpera) {
//						tinyMCE.execInstanceCommand(ed.editorId, "mceTableMoveToNextRow", true);
//						return tinymce.dom.Event.cancel(e);
//					}
//
//					ed.undoManager.add();
//				}
//			});

			// Select whole table is a table border is clicked
			if (!tinymce.isIE) {
				if (ed.getParam('table_selection', true)) {
					ed.onClick.add(function(ed, e) {
						e = e.target;

						if (e.nodeName === 'TABLE')
							ed.selection.select(e);
					});
				}
			}

			ed.onNodeChange.add(function(ed, cm, n) {
				var p = ed.dom.getParent(n, 'td,th,caption');

                // ATLASSIAN - we can't add tables inside tables, so disable
                cm.setDisabled('table', n.nodeName === 'TABLE' || !!p);
				if (p && p.nodeName === 'CAPTION')
					p = null;

				cm.setDisabled('delete_table', !p);
				cm.setDisabled('delete_col', !p);
				cm.setDisabled('delete_table', !p);
				cm.setDisabled('delete_row', !p);
				cm.setDisabled('col_after', !p);
				cm.setDisabled('col_before', !p);
				cm.setDisabled('row_after', !p);
				cm.setDisabled('row_before', !p);
				cm.setDisabled('row_props', !p);
				cm.setDisabled('cell_props', !p);
				cm.setDisabled('split_cells', !p || (parseInt(ed.dom.getAttrib(p, 'colspan', '1')) < 2 && parseInt(ed.dom.getAttrib(p, 'rowspan', '1')) < 2));
				cm.setDisabled('merge_cells', !p);
			});

			// Padd empty table cells
			if (!tinymce.isIE) {
				ed.onBeforeSetContent.add(function(ed, o) {
					if (o.initial)
						o.content = o.content.replace(/<(td|th)([^>]+|)>\s*<\/(td|th)>/g, tinymce.isOpera ? '<$1$2>&nbsp;</$1>' : '<$1$2><br mce_bogus="1" /></$1>');
				});
			}
		},

		execCommand : function(cmd, ui, val) {
			var ed = this.editor, b;

			// Is table command
			switch (cmd) {
                case "mceTableMoveToPrevRow":
				case "mceTableMoveToNextRow":
				case "mceInsertTable":
				case "mceTableRowProps":
				case "mceTableCellProps":
				case "mceTableSplitCells":
				case "mceTableMergeCells":
				case "mceTableInsertRowBefore":
				case "mceTableInsertRowAfter":
				case "mceTableDeleteRow":
				case "mceTableHeadingRow":
				case "mceTableInsertColBefore":
				case "mceTableInsertColAfter":
				case "mceTableDeleteCol":
				case "mceTableCutRow":
				case "mceTableCopyRow":
				case "mceTablePasteRowBefore":
				case "mceTablePasteRowAfter":
				case "mceTableDelete":
					ed.execCommand('mceBeginUndoLevel');
					this._doExecCommand(cmd, ui, val);
					ed.execCommand('mceEndUndoLevel');

					return true;
			}

			// Pass to next handler in chain
			return false;
		},

		getInfo : function() {
			return {
				longname : 'Tables',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com/',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/table',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		// Private plugin internal methods

		/**
		 * Executes the table commands.
		 */
		_doExecCommand : function(command, user_interface, value) {
			var inst = this.editor, ed = inst, url = this.url;
			var focusElm = inst.selection.getNode();
			var trElm = inst.dom.getParent(focusElm, "tr");
			var tdElm = inst.dom.getParent(focusElm, "td,th");
			var tableElm = inst.dom.getParent(focusElm, "table");
			var doc = inst.contentWindow.document;
			var tableBorder = tableElm ? tableElm.getAttribute("border") : "";
            var actionBaseUrl = tinyMCE.settings.plugin_action_base_path;
            var cellStyle = tinyMCE.settings.confluence_table_cell_style;

            // Get first TD if no TD found
			if (trElm && tdElm == null)
				tdElm = trElm.cells[0];

			function inArray(ar, v) {
				for (var i=0; i<ar.length; i++) {
					// Is array
					if (ar[i] && ar[i].length > 0 && inArray(ar[i], v))
						return true;

					// Found value
					if (ar[i] == v)
						return true;
				}

				return false;
			}

			function select(dx, dy) {
				var td;

				grid = getTableGrid(tableElm);
				dx = dx || 0;
				dy = dy || 0;
				dx = Math.max(cpos.cellindex + dx, 0);
				dy = Math.max(cpos.rowindex + dy, 0);

				// Recalculate grid and select
				inst.execCommand('mceRepaint');
				td = getCell(grid, dy, dx);

				if (td) {
					inst.selection.select(td.firstChild || td);
					inst.selection.collapse(1);
				}
			};

			function makeTD() {
				var newTD = doc.createElement("td");

				if (!tinymce.isIE)
					newTD.innerHTML = '<br mce_bogus="1"/>';
			}

			function getColRowSpan(td) {
				var colspan = inst.dom.getAttrib(td, "colspan");
				var rowspan = inst.dom.getAttrib(td, "rowspan");

				colspan = colspan == "" ? 1 : parseInt(colspan);
				rowspan = rowspan == "" ? 1 : parseInt(rowspan);

				return {colspan : colspan, rowspan : rowspan};
			}

			function getCellPos(grid, td) {
				var x, y;

				for (y=0; y<grid.length; y++) {
					for (x=0; x<grid[y].length; x++) {
						if (grid[y][x] == td)
							return {cellindex : x, rowindex : y};
					}
				}

				return null;
			}

			function getCell(grid, row, col) {
				if (grid[row] && grid[row][col])
					return grid[row][col];

				return null;
			}

            //ATLASSIAN - used by the mceTableMoveToPrevRow command
            function getPrevCell(table, cell) {
                var i, j;

                for (i = 0; i < table.rows.length; i++) {
                    for (j = 0; j < table.rows[i].cells.length; j++) {
                        if (table.rows[i].cells[j] == cell) {
                            return j == 0 ? undefined : table.rows[i].cells[j - 1];
                        }
                    }
                }
            }

			function getNextCell(table, cell) {
				var cells = [], x = 0, i, j, cell, nextCell;

				for (i = 0; i < table.rows.length; i++)
					for (j = 0; j < table.rows[i].cells.length; j++, x++)
						cells[x] = table.rows[i].cells[j];

				for (i = 0; i < cells.length; i++)
					if (cells[i] == cell)
						if (nextCell = cells[i+1])
							return nextCell;
			}

			function getTableGrid(table) {
				var grid = [], rows = table.rows, x, y, td, sd, xstart, x2, y2;

				for (y=0; y<rows.length; y++) {
					for (x=0; x<rows[y].cells.length; x++) {
						td = rows[y].cells[x];
						sd = getColRowSpan(td);

						// All ready filled
						for (xstart = x; grid[y] && grid[y][xstart]; xstart++) ;

						// Fill box
						for (y2=y; y2<y+sd['rowspan']; y2++) {
							if (!grid[y2])
								grid[y2] = [];

							for (x2=xstart; x2<xstart+sd['colspan']; x2++)
								grid[y2][x2] = td;
						}
					}
				}

				return grid;
			}

			function trimRow(table, tr, td, new_tr) {
				var grid = getTableGrid(table), cpos = getCellPos(grid, td);
				var cells, lastElm;

				// Time to crop away some
				if (new_tr.cells.length != tr.childNodes.length) {
					cells = tr.childNodes;
					lastElm = null;

					for (var x=0; td = getCell(grid, cpos.rowindex, x); x++) {
						var remove = true;
						var sd = getColRowSpan(td);

						// Remove due to rowspan
						if (inArray(cells, td)) {
							new_tr.childNodes[x]._delete = true;
						} else if ((lastElm == null || td != lastElm) && sd.colspan > 1) { // Remove due to colspan
							for (var i=x; i<x+td.colSpan; i++)
								new_tr.childNodes[i]._delete = true;
						}

						if ((lastElm == null || td != lastElm) && sd.rowspan > 1)
							td.rowSpan = sd.rowspan + 1;

						lastElm = td;
					}

					deleteMarked(tableElm);
				}
			}

			function prevElm(node, name) {
				while ((node = node.previousSibling) != null) {
					if (node.nodeName == name)
						return node;
				}

				return null;
			}

			function nextElm(node, names) {
				var namesAr = names.split(',');

				while ((node = node.nextSibling) != null) {
					for (var i=0; i<namesAr.length; i++) {
						if (node.nodeName.toLowerCase() == namesAr[i].toLowerCase() )
							return node;
					}
				}

				return null;
			}

			function deleteMarked(tbl) {
				if (tbl.rows == 0)
					return;

				var tr = tbl.rows[0];
				do {
					var next = nextElm(tr, "TR");

					// Delete row
					if (tr._delete) {
						tr.parentNode.removeChild(tr);
						continue;
					}

					// Delete cells
					var td = tr.cells[0];
					if (td.cells > 1) {
						do {
							var nexttd = nextElm(td, "TD,TH");

							if (td._delete)
								td.parentNode.removeChild(td);
						} while ((td = nexttd) != null);
					}
				} while ((tr = next) != null);
			}

			function addRows(td_elm, tr_elm, rowspan) {
				// Add rows
				td_elm.rowSpan = 1;
				var trNext = nextElm(tr_elm, "TR");
				for (var i=1; i<rowspan && trNext; i++) {
					var newTD = doc.createElement("td");

					if (!tinymce.isIE)
						newTD.innerHTML = '<br mce_bogus="1"/>';

					if (tinymce.isIE)
						trNext.insertBefore(newTD, trNext.cells(td_elm.cellIndex));
					else
						trNext.insertBefore(newTD, trNext.cells[td_elm.cellIndex]);

					trNext = nextElm(trNext, "TR");
				}
			}

			function copyRow(doc, table, tr) {
				var grid = getTableGrid(table);
				var newTR = tr.cloneNode(false);
				var cpos = getCellPos(grid, tr.cells[0]);
				var lastCell = null;
				var tableBorder = inst.dom.getAttrib(table, "border");
				var tdElm = null;

				for (var x=0; tdElm = getCell(grid, cpos.rowindex, x); x++) {
					var newTD = null;

					if (lastCell != tdElm) {
						for (var i=0; i<tr.cells.length; i++) {
							if (tdElm == tr.cells[i]) {
								newTD = tdElm.cloneNode(true);
								break;
							}
						}
					}

					if (newTD == null) {
						newTD = doc.createElement("td");

						if (!tinymce.isIE)
							newTD.innerHTML = '<br mce_bogus="1"/>';
					}

					// Reset col/row span
					newTD.colSpan = 1;
					newTD.rowSpan = 1;

					newTR.appendChild(newTD);

					lastCell = tdElm;
				}

				return newTR;
			}

			// ---- Commands -----

			// Handle commands
			switch (command) {
                // ATLASSIAN - add ability to move to previous cell/row
                case "mceTableMoveToPrevRow":
                    var prevCell = getPrevCell(tableElm, tdElm);

                    if (!prevCell) {
                        inst.execCommand("mceTableInsertRowBefore", tdElm);
                        prevCell = getPrevCell(tableElm, tdElm);
                    }

                    if (tinymce.isGecko && prevCell.firstChild) {
                        prevCell = prevCell.firstChild;
                    }
					inst.selection.select(prevCell);
					inst.selection.collapse(true);

                    return true;

				case "mceTableMoveToNextRow":
					var nextCell = getNextCell(tableElm, tdElm);

					if (!nextCell) {
						inst.execCommand("mceTableInsertRowAfter", tdElm);
						nextCell = getNextCell(tableElm, tdElm);
					}

                    // ATLASSIAN - need to select the first element in the cell for FF
                    if (tinymce.isGecko && nextCell.firstChild) {
                        nextCell = nextCell.firstChild;
                    }
					inst.selection.select(nextCell);
					inst.selection.collapse(true);

					return true;

				case "mceTableRowProps":
					if (trElm == null)
						return true;

					if (user_interface) {
						inst.windowManager.open({
							url : actionBaseUrl + '/row.action',
							width : 400 + parseInt(inst.getLang('table.rowprops_delta_width', 0)),
							height : 295 + parseInt(inst.getLang('table.rowprops_delta_height', 0)),
							inline : 1
						}, {
							plugin_url : url
						});
					}

					return true;

				case "mceTableCellProps":
					if (tdElm == null)
						return true;

					if (user_interface) {
						inst.windowManager.open({
							url : actionBaseUrl + '/cell.action',
							width : 400 + parseInt(inst.getLang('table.cellprops_delta_width', 0)),
							height : 295 + parseInt(inst.getLang('table.cellprops_delta_height', 0)),
							inline : 1
						}, {
							plugin_url : url
						});
					}

					return true;

				case "mceInsertTable":
					if (user_interface) {
						inst.windowManager.open({
							url : actionBaseUrl + '/wysiwyg-table.action',
							width : 400 + parseInt(inst.getLang('table.table_delta_width', 0)),
							height : 320 + parseInt(inst.getLang('table.table_delta_height', 0)),
							inline : 1,
                            name: "table_inserter"

                        }, {
							plugin_url : url,
							action : value ? value.action : 0
						});
					}

					return true;

				case "mceTableDelete":
					var table = inst.dom.getParent(inst.selection.getNode(), "table");
					if (table) {
						table.parentNode.removeChild(table);
						inst.execCommand('mceRepaint');
					}
					return true;

				case "mceTableSplitCells":
				case "mceTableMergeCells":
				case "mceTableInsertRowBefore":
				case "mceTableInsertRowAfter":
				case "mceTableDeleteRow":
				case "mceTableHeadingRow":
				case "mceTableInsertColBefore":
				case "mceTableInsertColAfter":
				case "mceTableDeleteCol":
				case "mceTableCutRow":
				case "mceTableCopyRow":
				case "mceTablePasteRowBefore":
				case "mceTablePasteRowAfter":
					// No table just return (invalid command)
					if (!tableElm)
						return true;

					// Table has a tbody use that reference
					// Changed logic by ApTest 2005.07.12 (www.aptest.com)
					// Now lookk at the focused element and take its parentNode.  That will be a tbody or a table.
					if (trElm && tableElm != trElm.parentNode)
						tableElm = trElm.parentNode;

					if (tableElm && trElm) {
						switch (command) {
							case "mceTableCutRow":
								if (!trElm || !tdElm)
									return true;

								inst.tableRowClipboard = copyRow(doc, tableElm, trElm);
								inst.execCommand("mceTableDeleteRow");
								break;

							case "mceTableCopyRow":
								if (!trElm || !tdElm)
									return true;

								inst.tableRowClipboard = copyRow(doc, tableElm, trElm);
								break;

							case "mceTablePasteRowBefore":
								if (!trElm || !tdElm)
									return true;

								var newTR = inst.tableRowClipboard.cloneNode(true);

								var prevTR = prevElm(trElm, "TR");
								if (prevTR != null)
									trimRow(tableElm, prevTR, prevTR.cells[0], newTR);

								trElm.parentNode.insertBefore(newTR, trElm);
								break;

							case "mceTablePasteRowAfter":
								if (!trElm || !tdElm)
									return true;
								
								var nextTR = nextElm(trElm, "TR");
								var newTR = inst.tableRowClipboard.cloneNode(true);

								trimRow(tableElm, trElm, tdElm, newTR);

								if (nextTR == null)
									trElm.parentNode.appendChild(newTR);
								else
									nextTR.parentNode.insertBefore(newTR, nextTR);

								break;

							case "mceTableInsertRowBefore":
								if (!trElm || !tdElm)
									return true;

								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);
								var newTR = doc.createElement("tr");
								var lastTDElm = null;

								cpos.rowindex--;
								if (cpos.rowindex < 0)
									cpos.rowindex = 0;

								// Create cells
								for (var x=0; tdElm = getCell(grid, cpos.rowindex, x); x++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['rowspan'] == 1) {
											var newTD = doc.createElement("td");

											if (!tinymce.isIE)
												newTD.innerHTML = '<br mce_bogus="1"/>';

											newTD.colSpan = tdElm.colSpan;
                                            // uses the cell style from confluence                                            
                                            newTD.className = cellStyle;
											newTR.appendChild(newTD);
										} else
											tdElm.rowSpan = sd['rowspan'] + 1;

										lastTDElm = tdElm;
									}
								}

								trElm.parentNode.insertBefore(newTR, trElm);
								select(0, 1);
							break;

							case "mceTableInsertRowAfter":
								if (!trElm || !tdElm)
									return true;

								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);
								var newTR = doc.createElement("tr");
								var lastTDElm = null;

								// Create cells
								for (var x=0; tdElm = getCell(grid, cpos.rowindex, x); x++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['rowspan'] == 1) {
											var newTD = doc.createElement("td");

											if (!tinymce.isIE)
												newTD.innerHTML = '<br mce_bogus="1"/>';

											newTD.colSpan = tdElm.colSpan;
                                            // uses the cell style from confluence
                                            newTD.className = cellStyle;
											newTR.appendChild(newTD);
										} else
											tdElm.rowSpan = sd['rowspan'] + 1;

										lastTDElm = tdElm;
									}
								}

								if (newTR.hasChildNodes()) {
									var nextTR = nextElm(trElm, "TR");
									if (nextTR)
										nextTR.parentNode.insertBefore(newTR, nextTR);
									else
										tableElm.appendChild(newTR);
								}

								select(0, 1);
							break;

							case "mceTableDeleteRow":
								if (!trElm || !tdElm)
									return true;

								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);

								// Only one row, remove whole table
								if (grid.length == 1 && tableElm.nodeName == 'TBODY') {
									inst.dom.remove(inst.dom.getParent(tableElm, "table"));
									return true;
								}

								// Move down row spanned cells
								var cells = trElm.cells;
								var nextTR = nextElm(trElm, "TR");
								for (var x=0; x<cells.length; x++) {
									if (cells[x].rowSpan > 1) {
										var newTD = cells[x].cloneNode(true);
										var sd = getColRowSpan(cells[x]);

										newTD.rowSpan = sd.rowspan - 1;

										var nextTD = nextTR.cells[x];

										if (nextTD == null)
											nextTR.appendChild(newTD);
										else
											nextTR.insertBefore(newTD, nextTD);
									}
								}

								// Delete cells
								var lastTDElm = null;
								for (var x=0; tdElm = getCell(grid, cpos.rowindex, x); x++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd.rowspan > 1) {
											tdElm.rowSpan = sd.rowspan - 1;
										} else {
											trElm = tdElm.parentNode;

											if (trElm.parentNode)
												trElm._delete = true;
										}

										lastTDElm = tdElm;
									}
								}

								deleteMarked(tableElm);

								select(0, -1);
							break;

                            // ATLASSIAN - add support to toggle row as headings
                            case "mceTableHeadingRow":
                                if(!trElm)
                                    return;

                                var cells = trElm.cells;
                                for (var i=0; i<cells.length; i++) {
                                    var cell = cells[i];
                                    var newCell;
                                    if (cell.nodeName == "TD") {
                                        newCell = doc.createElement("th");
                                        newCell.className = tinyMCE.settings.confluence_table_header_style;
                                    }
                                    else if (cell.nodeName == "TH") {
                                        newCell = doc.createElement("td");
                                        newCell.className = tinyMCE.settings.confluence_table_cell_style;
                                    }

                                    tinymce.DOM.replace(newCell, cell, true);
                                }
                            break;

                            case "mceTableInsertColBefore":
								if (!trElm || !tdElm)
									return true;

								var grid = getTableGrid(inst.dom.getParent(tableElm, "table"));
								var cpos = getCellPos(grid, tdElm);
								var lastTDElm = null;

								for (var y=0; tdElm = getCell(grid, y, cpos.cellindex); y++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['colspan'] == 1) {
											var newTD = doc.createElement(tdElm.nodeName);

											if (!tinymce.isIE)
												newTD.innerHTML = '<br mce_bogus="1"/>';

											newTD.rowSpan = tdElm.rowSpan;
                                            // copy whatever style the current column has.  Copies header rows.
                                            newTD.className = tdElm.className;
											tdElm.parentNode.insertBefore(newTD, tdElm);
										} else
											tdElm.colSpan++;

										lastTDElm = tdElm;
									}
								}

								select();
							break;

							case "mceTableInsertColAfter":
								if (!trElm || !tdElm)
									return true;

								var grid = getTableGrid(inst.dom.getParent(tableElm, "table"));
								var cpos = getCellPos(grid, tdElm);
								var lastTDElm = null;

								for (var y=0; tdElm = getCell(grid, y, cpos.cellindex); y++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['colspan'] == 1) {
											var newTD = doc.createElement(tdElm.nodeName);

											if (!tinymce.isIE)
												newTD.innerHTML = '<br mce_bogus="1"/>';

											newTD.rowSpan = tdElm.rowSpan;
                                            // copy whatever style the current column has.  Copies header rows.
                                            newTD.className = tdElm.className;

											var nextTD = nextElm(tdElm, "TD,TH");
											if (nextTD == null)
												tdElm.parentNode.appendChild(newTD);
											else
												nextTD.parentNode.insertBefore(newTD, nextTD);
										} else
											tdElm.colSpan++;

										lastTDElm = tdElm;
									}
								}

								select(1);
							break;

							case "mceTableDeleteCol":
								if (!trElm || !tdElm)
									return true;

								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);
								var lastTDElm = null;

								// Only one col, remove whole table
								if ((grid.length > 1 && grid[0].length <= 1) && tableElm.nodeName == 'TBODY') {
									inst.dom.remove(inst.dom.getParent(tableElm, "table"));
									return true;
								}

								// Delete cells
								for (var y=0; tdElm = getCell(grid, y, cpos.cellindex); y++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['colspan'] > 1)
											tdElm.colSpan = sd['colspan'] - 1;
										else {
											if (tdElm.parentNode)
												tdElm.parentNode.removeChild(tdElm);
										}

										lastTDElm = tdElm;
									}
								}

								select(-1);
							break;

						case "mceTableSplitCells":
							if (!trElm || !tdElm)
								return true;

							var spandata = getColRowSpan(tdElm);

							var colspan = spandata["colspan"];
							var rowspan = spandata["rowspan"];

							// Needs splitting
							if (colspan > 1 || rowspan > 1) {
								// Generate cols
								tdElm.colSpan = 1;
								for (var i=1; i<colspan; i++) {
									var newTD = doc.createElement("td");

									if (!tinymce.isIE)
										newTD.innerHTML = '<br mce_bogus="1"/>';

									trElm.insertBefore(newTD, nextElm(tdElm, "TD,TH"));

									if (rowspan > 1)
										addRows(newTD, trElm, rowspan);
								}

								addRows(tdElm, trElm, rowspan);
							}

							// Apply visual aids
							tableElm = inst.dom.getParent(inst.selection.getNode(), "table");
							break;

						case "mceTableMergeCells":
							var rows = [];
							var sel = inst.selection.getSel();
							var grid = getTableGrid(tableElm);

							if (tinymce.isIE || sel.rangeCount == 1) {
								if (user_interface) {
									// Setup template
									var sp = getColRowSpan(tdElm);

									inst.windowManager.open({
										url : url + '/merge_cells.htm',
										width : 240 + parseInt(inst.getLang('table.merge_cells_delta_width', 0)),
										height : 110 + parseInt(inst.getLang('table.merge_cells_delta_height', 0)),
										inline : 1
									}, {
										action : "update",
										numcols : sp.colspan,
										numrows : sp.rowspan,
										plugin_url : url
									});

									return true;
								} else {
									var numRows = parseInt(value['numrows']);
									var numCols = parseInt(value['numcols']);
									var cpos = getCellPos(grid, tdElm);

									if (("" + numRows) == "NaN")
										numRows = 1;

									if (("" + numCols) == "NaN")
										numCols = 1;

									// Get rows and cells
									var tRows = tableElm.rows;
									for (var y=cpos.rowindex; y<grid.length; y++) {
										var rowCells = [];

										for (var x=cpos.cellindex; x<grid[y].length; x++) {
											var td = getCell(grid, y, x);

											if (td && !inArray(rows, td) && !inArray(rowCells, td)) {
												var cp = getCellPos(grid, td);

												// Within range
												if (cp.cellindex < cpos.cellindex+numCols && cp.rowindex < cpos.rowindex+numRows)
													rowCells[rowCells.length] = td;
											}
										}

										if (rowCells.length > 0)
											rows[rows.length] = rowCells;

										var td = getCell(grid, cpos.rowindex, cpos.cellindex);
										each(ed.dom.select('br', td), function(e, i) {
											if (i > 0 && ed.dom.getAttrib('mce_bogus'))
												ed.dom.remove(e);
										});
									}

									//return true;
								}
							} else {
								var cells = [];
								var sel = inst.selection.getSel();
								var lastTR = null;
								var curRow = null;
								var x1 = -1, y1 = -1, x2, y2;

								// Only one cell selected, whats the point?
								if (sel.rangeCount < 2)
									return true;

								// Get all selected cells
								for (var i=0; i<sel.rangeCount; i++) {
									var rng = sel.getRangeAt(i);
									var tdElm = rng.startContainer.childNodes[rng.startOffset];

									if (!tdElm)
										break;

									if (tdElm.nodeName == "TD" || tdElm.nodeName == "TH")
										cells[cells.length] = tdElm;
								}

								// Get rows and cells
								var tRows = tableElm.rows;
								for (var y=0; y<tRows.length; y++) {
									var rowCells = [];

									for (var x=0; x<tRows[y].cells.length; x++) {
										var td = tRows[y].cells[x];

										for (var i=0; i<cells.length; i++) {
											if (td == cells[i]) {
												rowCells[rowCells.length] = td;
											}
										}
									}

									if (rowCells.length > 0)
										rows[rows.length] = rowCells;
								}

								// Find selected cells in grid and box
								var curRow = [];
								var lastTR = null;
								for (var y=0; y<grid.length; y++) {
									for (var x=0; x<grid[y].length; x++) {
										grid[y][x]._selected = false;

										for (var i=0; i<cells.length; i++) {
											if (grid[y][x] == cells[i]) {
												// Get start pos
												if (x1 == -1) {
													x1 = x;
													y1 = y;
												}

												// Get end pos
												x2 = x;
												y2 = y;

												grid[y][x]._selected = true;
											}
										}
									}
								}

								// Is there gaps, if so deny
								for (var y=y1; y<=y2; y++) {
									for (var x=x1; x<=x2; x++) {
										if (!grid[y][x]._selected) {
											alert("Invalid selection for merge.");
											return true;
										}
									}
								}
							}

							// Validate selection and get total rowspan and colspan
							var rowSpan = 1, colSpan = 1;

							// Validate horizontal and get total colspan
							var lastRowSpan = -1;
							for (var y=0; y<rows.length; y++) {
								var rowColSpan = 0;

								for (var x=0; x<rows[y].length; x++) {
									var sd = getColRowSpan(rows[y][x]);

									rowColSpan += sd['colspan'];

									if (lastRowSpan != -1 && sd['rowspan'] != lastRowSpan) {
										alert("Invalid selection for merge.");
										return true;
									}

									lastRowSpan = sd['rowspan'];
								}

								if (rowColSpan > colSpan)
									colSpan = rowColSpan;

								lastRowSpan = -1;
							}

							// Validate vertical and get total rowspan
							var lastColSpan = -1;
							for (var x=0; x<rows[0].length; x++) {
								var colRowSpan = 0;

								for (var y=0; y<rows.length; y++) {
									var sd = getColRowSpan(rows[y][x]);

									colRowSpan += sd['rowspan'];

									if (lastColSpan != -1 && sd['colspan'] != lastColSpan) {
										alert("Invalid selection for merge.");
										return true;
									}

									lastColSpan = sd['colspan'];
								}

								if (colRowSpan > rowSpan)
									rowSpan = colRowSpan;

								lastColSpan = -1;
							}

							// Setup td
							tdElm = rows[0][0];
							tdElm.rowSpan = rowSpan;
							tdElm.colSpan = colSpan;

							// Merge cells
							for (var y=0; y<rows.length; y++) {
								for (var x=0; x<rows[y].length; x++) {
									var html = rows[y][x].innerHTML;
									var chk = html.replace(/[ \t\r\n]/g, "");

									if (chk != "<br/>" && chk != "<br>" && chk != '<br mce_bogus="1"/>' && (x+y > 0))
										tdElm.innerHTML += html;

									// Not current cell
									if (rows[y][x] != tdElm && !rows[y][x]._deleted) {
										var cpos = getCellPos(grid, rows[y][x]);
										var tr = rows[y][x].parentNode;

										tr.removeChild(rows[y][x]);
										rows[y][x]._deleted = true;

										// Empty TR, remove it
										if (!tr.hasChildNodes()) {
											tr.parentNode.removeChild(tr);

											var lastCell = null;
											for (var x=0; cellElm = getCell(grid, cpos.rowindex, x); x++) {
												if (cellElm != lastCell && cellElm.rowSpan > 1)
													cellElm.rowSpan--;

												lastCell = cellElm;
											}

											if (tdElm.rowSpan > 1)
												tdElm.rowSpan--;
										}
									}
								}
							}

							// Remove all but one bogus br
							each(ed.dom.select('br', tdElm), function(e, i) {
								if (i > 0 && ed.dom.getAttrib(e, 'mce_bogus'))
									ed.dom.remove(e);
							});

							break;
						}

						tableElm = inst.dom.getParent(inst.selection.getNode(), "table");
						inst.addVisual(tableElm);
						inst.nodeChanged();
					}

				return true;
			}

			// Pass to next handler in chain
			return false;
		}
	});

	// Register plugin
	tinymce.PluginManager.add('table', tinymce.plugins.TablePlugin);
})();

/**
 * $Id: editor_plugin_src.js 1143 2009-05-27 10:05:31Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	tinymce.create('tinymce.plugins.PastePlugin', {
		init : function(ed, url) {
			var t = this, cb;

			t.editor = ed;
			t.url = url;

			// Setup plugin events
			t.onPreProcess = new tinymce.util.Dispatcher(t);
			t.onPostProcess = new tinymce.util.Dispatcher(t);

			// Register default handlers
			t.onPreProcess.add(t._preProcess);
			t.onPostProcess.add(t._postProcess);

			// Register optional preprocess handler
			t.onPreProcess.add(function(pl, o) {
				ed.execCallback('paste_preprocess', pl, o);
			});

			// Register optional postprocess
			t.onPostProcess.add(function(pl, o) {
				ed.execCallback('paste_postprocess', pl, o);
			});

			// This function executes the process handlers and inserts the contents
			function process(o) {
				var dom = ed.dom;

				// Execute pre process handlers
				t.onPreProcess.dispatch(t, o);

				// Create DOM structure
				o.node = dom.create('div', 0, o.content);

				// Execute post process handlers
				t.onPostProcess.dispatch(t, o);

				// Serialize content
				o.content = ed.serializer.serialize(o.node, {getInner : 1});

				//  Insert cleaned content. We need to handle insertion of contents containing block elements separately
				if (/<(p|h[1-6]|ul|ol)/.test(o.content))
					t._insertBlockContent(ed, dom, o.content);
				else
					t._insert(o.content);
			};

			// Add command for external usage
			ed.addCommand('mceInsertClipboardContent', function(u, o) {
				process(o);
			});

			// This function grabs the contents from the clipboard by adding a
			// hidden div and placing the caret inside it and after the browser paste
			// is done it grabs that contents and processes that
			function grabContent(e) {
				var n, or, rng, sel = ed.selection, dom = ed.dom, body = ed.getBody(), posY;

				if (dom.get('_mcePaste'))
					return;

				// Create container to paste into
				n = dom.add(body, 'div', {id : '_mcePaste'}, '&nbsp;');

				// If contentEditable mode we need to find out the position of the closest element
				if (body != ed.getDoc().body)
					posY = dom.getPos(ed.selection.getStart(), body).y;
				else
					posY = body.scrollTop;

				// Styles needs to be applied after the element is added to the document since WebKit will otherwise remove all styles
				dom.setStyles(n, {
					position : 'absolute',
					left : -10000,
					top : posY,
					width : 1,
					height : 1,
					overflow : 'hidden'
				});

				if (tinymce.isIE) {
					// Select the container
					rng = dom.doc.body.createTextRange();
					rng.moveToElementText(n);
					rng.execCommand('Paste');

					// Remove container
					dom.remove(n);

					// Process contents
					process({content : n.innerHTML});

					return tinymce.dom.Event.cancel(e);
				} else {
					or = ed.selection.getRng();

					// Move caret into hidden div
					n = n.firstChild;
					rng = ed.getDoc().createRange();
					rng.setStart(n, 0);
					rng.setEnd(n, 1);
					sel.setRng(rng);

					// Wait a while and grab the pasted contents
					window.setTimeout(function() {
						var n = dom.get('_mcePaste'), h;

						// Webkit clones the _mcePaste div for some odd reason so this will ensure that we get the real new div not the old empty one
						n.id = '_mceRemoved';
						dom.remove(n);
						n = dom.get('_mcePaste') || n;

						// Grab the HTML contents
						// We need to look for a apple style wrapper on webkit it also adds a div wrapper if you copy/paste the body of the editor
						// It's amazing how strange the contentEditable mode works in WebKit
						h = (dom.select('> span.Apple-style-span div', n)[0] || dom.select('> span.Apple-style-span', n)[0] || n).innerHTML;

						// Remove hidden div and restore selection
						dom.remove(n);

						// Restore the old selection
						if (or)
							sel.setRng(or);

						process({content : h});
					}, 0);
				}
			};

			// Check if we should use the new auto process method			
			if (ed.getParam('paste_auto_cleanup_on_paste', true)) {
				// Is it's Opera or older FF use key handler
				if (tinymce.isOpera || /Firefox\/2/.test(navigator.userAgent)) {
					ed.onKeyDown.add(function(ed, e) {
						if (((tinymce.isMac ? e.metaKey : e.ctrlKey) && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45))
							grabContent(e);
					});
				} else {
					// Grab contents on paste event on Gecko and WebKit
					ed.onPaste.addToTop(function(ed, e) {
						return grabContent(e);
					});
				}
			}

			// Block all drag/drop events
			if (ed.getParam('paste_block_drop')) {
				ed.onInit.add(function() {
					ed.dom.bind(ed.getBody(), ['dragend', 'dragover', 'draggesture', 'dragdrop', 'drop', 'drag'], function(e) {
						e.preventDefault();
						e.stopPropagation();

						return false;
					});
				});
			}

			// Add legacy support
			t._legacySupport();
		},

		getInfo : function() {
			return {
				longname : 'Paste text/word',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com/',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/paste',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		_preProcess : function(pl, o) {
			var ed = this.editor, h = o.content, process, stripClass;

			//console.log('Before preprocess:' + o.content);

			function process(items) {
				each(items, function(v) {
					// Remove or replace
					if (v.constructor == RegExp)
						h = h.replace(v, '');
					else
						h = h.replace(v[0], v[1]);
				});
			};

			// Process away some basic content
			process([
				/^\s*(&nbsp;)+/g,											// nbsp entities at the start of contents
				/(&nbsp;|<br[^>]*>)+\s*$/g									// nbsp entities at the end of contents
			]);

			// Detect Word content and process it more aggressive
			if (/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/.test(h) || o.wordContent) {
				o.wordContent = true; // Mark the pasted contents as word specific content
				//console.log('Word contents detected.');

				if (ed.getParam('paste_convert_middot_lists', true)) {
					process([
						[/<!--\[if !supportLists\]-->/gi, '$&__MCE_ITEM__'],			// Convert supportLists to a list item marker
						[/(<span[^>]+:\s*symbol[^>]+>)/gi, '$1__MCE_ITEM__'],				// Convert symbol spans to list items
						[/(<span[^>]+mso-list:[^>]+>)/gi, '$1__MCE_ITEM__']				// Convert mso-list to item marker
					]);
				}

				process([
					/<!--[\s\S]+?-->/gi,												// Word comments
					/<\/?(img|font|meta|link|style|div|v:\w+)[^>]*>/gi,					// Remove some tags including VML content
					/<\\?\?xml[^>]*>/gi,												// XML namespace declarations
					/<\/?o:[^>]*>/gi,													// MS namespaced elements <o:tag>
					/ (id|name|language|type|on\w+|v:\w+)=\"([^\"]*)\"/gi,				// on.., class, style and language attributes with quotes
					/ (id|name|language|type|on\w+|v:\w+)=(\w+)/gi,						// on.., class, style and language attributes without quotes (IE)
					[/<(\/?)s>/gi, '<$1strike>'],										// Convert <s> into <strike> for line-though
					/<script[^>]+>[\s\S]*?<\/script>/gi,								// All scripts elements for msoShowComment for example
					[/&nbsp;/g, '\u00a0']												// Replace nsbp entites to char since it's easier to handle
				]);

				// Remove all spans if no styles is to be retained
				if (!ed.getParam('paste_retain_style_properties')) {
					process([
						/<\/?(span)[^>]*>/gi
					]);
				}
			}

			// Allow for class names to be retained if desired; either all, or just the ones from Word
			// Note that the paste_strip_class_attributes: 'none, verify_css_classes: true is also a good variation.
			stripClass = ed.getParam('paste_strip_class_attributes', 'all');
			if (stripClass != 'none') {
				if (stripClass == 'all') {
					process([
						/ class=\"([^\"]*)\"/gi,	// class attributes with quotes
						/ class=(\w+)/gi			// class attributes without quotes (IE)
					]);
				} else { // Only strip the 'mso*' classes
					process([
						/ class=\"(mso[^\"]*)\"/gi,	// class attributes with quotes
						/ class=(mso\w+)/gi			// class attributes without quotes (IE)
					]);
				}
			}

			// Remove spans option
			if (ed.getParam('paste_remove_spans')) {
				process([
					/<\/?(span)[^>]*>/gi
				]);
			}

			//console.log('After preprocess:' + h);

			o.content = h;
		},

		/**
		 * Various post process items.
		 */
		_postProcess : function(pl, o) {
			var t = this, ed = t.editor, dom = ed.dom, styleProps;

			if (o.wordContent) {
				// Remove named anchors or TOC links
				each(dom.select('a', o.node), function(a) {
					if (!a.href || a.href.indexOf('#_Toc') != -1)
						dom.remove(a, 1);
				});

				if (t.editor.getParam('paste_convert_middot_lists', true))
					t._convertLists(pl, o);

				// Process styles
				styleProps = ed.getParam('paste_retain_style_properties'); // retained properties

				// If string property then split it
				if (tinymce.is(styleProps, 'string'))
					styleProps = tinymce.explode(styleProps);

				// Retains some style properties
				each(dom.select('*', o.node), function(el) {
					var newStyle = {}, npc = 0, i, sp, sv;

					// Store a subset of the existing styles
					if (styleProps) {
						for (i = 0; i < styleProps.length; i++) {
							sp = styleProps[i];
							sv = dom.getStyle(el, sp);

							if (sv) {
								newStyle[sp] = sv;
								npc++;
							}
						}
					}

					// Remove all of the existing styles
					dom.setAttrib(el, 'style', '');

					if (styleProps && npc > 0)
						dom.setStyles(el, newStyle); // Add back the stored subset of styles
					else // Remove empty span tags that do not have class attributes
						if (el.nodeName == 'SPAN' && !el.className)
							dom.remove(el, true);
				});
			}

			// Remove all style information or only specifically on WebKit to avoid the style bug on that browser
			if (ed.getParam("paste_remove_styles") || (ed.getParam("paste_remove_styles_if_webkit") && tinymce.isWebKit)) {
				each(dom.select('*[style]', o.node), function(el) {
					el.removeAttribute('style');
					el.removeAttribute('mce_style');
				});
			} else {
				if (tinymce.isWebKit) {
					// We need to compress the styles on WebKit since if you paste <img border="0" /> it will become <img border="0" style="... lots of junk ..." />
					// Removing the mce_style that contains the real value will force the Serializer engine to compress the styles
					each(dom.select('*', o.node), function(el) {
						el.removeAttribute('mce_style');
					});
				}
			}
		},

		/**
		 * Converts the most common bullet and number formats in Office into a real semantic UL/LI list.
		 */
		_convertLists : function(pl, o) {
			var dom = pl.editor.dom, listElm, li, lastMargin = -1, margin, levels = [], lastType, html;

			// Convert middot lists into real semantic lists
			each(dom.select('p', o.node), function(p) {
				var sib, val = '', type, html, idx, parents;

				// Get text node value at beginning of paragraph
				for (sib = p.firstChild; sib && sib.nodeType == 3; sib = sib.nextSibling)
					val += sib.nodeValue;

				val = p.innerHTML.replace(/<\/?\w+[^>]*>/gi, '').replace(/&nbsp;/g, '\u00a0');

				// Detect unordered lists look for bullets
				if (/^(__MCE_ITEM__)+[\u2022\u00b7\u00a7\u00d8o]\s*\u00a0*/.test(val))
					type = 'ul';

				// Detect ordered lists 1., a. or ixv.
				if (/^__MCE_ITEM__\s*\w+\.\s*\u00a0{2,}/.test(val))
					type = 'ol';

				// Check if node value matches the list pattern: o&nbsp;&nbsp;
				if (type) {
					margin = parseFloat(p.style.marginLeft || 0);

					if (margin > lastMargin)
						levels.push(margin);

					if (!listElm || type != lastType) {
						listElm = dom.create(type);
						dom.insertAfter(listElm, p);
					} else {
						// Nested list element
						if (margin > lastMargin) {
							listElm = li.appendChild(dom.create(type));
						} else if (margin < lastMargin) {
							// Find parent level based on margin value
							idx = tinymce.inArray(levels, margin);
							parents = dom.getParents(listElm.parentNode, type);
							listElm = parents[parents.length - 1 - idx] || listElm;
						}
					}

					// Remove middot or number spans if they exists
					each(dom.select('span', p), function(span) {
						var html = span.innerHTML.replace(/<\/?\w+[^>]*>/gi, '');

						// Remove span with the middot or the number
						if (type == 'ul' && /^[\u2022\u00b7\u00a7\u00d8o]/.test(html))
							dom.remove(span);
						else if (/^[\s\S]*\w+\.(&nbsp;|\u00a0)*\s*/.test(html))
							dom.remove(span);
					});

					html = p.innerHTML;

					// Remove middot/list items
					if (type == 'ul')
						html = p.innerHTML.replace(/__MCE_ITEM__/g, '').replace(/^[\u2022\u00b7\u00a7\u00d8o]\s*(&nbsp;|\u00a0)+\s*/, '');
					else
						html = p.innerHTML.replace(/__MCE_ITEM__/g, '').replace(/^\s*\w+\.(&nbsp;|\u00a0)+\s*/, '');

					// Create li and add paragraph data into the new li
					li = listElm.appendChild(dom.create('li', 0, html));
					dom.remove(p);

					lastMargin = margin;
					lastType = type;
				} else
					listElm = lastMargin = 0; // End list element
			});

			// Remove any left over makers
			html = o.node.innerHTML;
			if (html.indexOf('__MCE_ITEM__') != -1)
				o.node.innerHTML = html.replace(/__MCE_ITEM__/g, '');
		},

		/**
		 * This method will split the current block parent and insert the contents inside the split position.
		 * This logic can be improved so text nodes at the start/end remain in the start/end block elements
		 */
		_insertBlockContent : function(ed, dom, content) {
			var parentBlock, marker, sel = ed.selection, last, elm, vp, y, elmHeight;

			function select(n) {
				var r;

				if (tinymce.isIE) {
					r = ed.getDoc().body.createTextRange();
					r.moveToElementText(n);
					r.collapse(false);
					r.select();
				} else {
					sel.select(n, 1);
					sel.collapse(false);
				}
			};

			// Insert a marker for the caret position
			this._insert('<span id="_marker">&nbsp;</span>', 1);
			marker = dom.get('_marker');
			parentBlock = dom.getParent(marker, 'p,h1,h2,h3,h4,h5,h6,ul,ol');

			if (parentBlock) {
				// Split parent block
				marker = dom.split(parentBlock, marker);

				// Insert nodes before the marker
				each(dom.create('div', 0, content).childNodes, function(n) {
					last = marker.parentNode.insertBefore(n.cloneNode(true), marker);
				});

				// Move caret after marker
				select(last);
			} else {
				dom.setOuterHTML(marker, content);
				sel.select(ed.getBody(), 1);
				sel.collapse(0);
			}

			dom.remove('_marker'); // Remove marker if it's left

			// Get element, position and height
			elm = sel.getStart();
			vp = dom.getViewPort(ed.getWin());
			y = ed.dom.getPos(elm).y;
			elmHeight = elm.clientHeight;

			// Is element within viewport if not then scroll it into view
			if (y < vp.y || y + elmHeight > vp.y + vp.h)
				ed.getDoc().body.scrollTop = y < vp.y ? y : y - vp.h + 25;
		},

		/**
		 * Inserts the specified contents at the caret position.
		 */
		_insert : function(h, skip_undo) {
			var ed = this.editor;

			// First delete the contents seems to work better on WebKit
			if (!ed.selection.isCollapsed())
				ed.getDoc().execCommand('Delete', false, null);

			// It's better to use the insertHTML method on Gecko since it will combine paragraphs correctly before inserting the contents
			ed.execCommand(tinymce.isGecko ? 'insertHTML' : 'mceInsertContent', false, h, {skip_undo : skip_undo});
		},

		/**
		 * This method will open the old style paste dialogs. Some users might want the old behavior but still use the new cleanup engine.
		 */
		_legacySupport : function() {
			var t = this, ed = t.editor;

			// Register commands for backwards compatibility
			each(['mcePasteText', 'mcePasteWord'], function(cmd) {
				ed.addCommand(cmd, function() {
					ed.windowManager.open({
						file : t.url + (cmd == 'mcePasteText' ? 'http://10.20.160.198/pastetext.htm' : 'http://10.20.160.198/pasteword.htm'),
						width : parseInt(ed.getParam("paste_dialog_width", "450")),
						height : parseInt(ed.getParam("paste_dialog_height", "400")),
						inline : 1
					});
				});
			});

			// Register buttons for backwards compatibility
			ed.addButton('pastetext', {title : 'paste.paste_text_desc', cmd : 'mcePasteText'});
			ed.addButton('pasteword', {title : 'paste.paste_word_desc', cmd : 'mcePasteWord'});
			ed.addButton('selectall', {title : 'paste.selectall_desc', cmd : 'selectall'});
		}
	});

	// Register plugin
	tinymce.PluginManager.add('paste', tinymce.plugins.PastePlugin);
})();

/**
 * $Id: editor_plugin_src.js 520 2008-01-07 16:30:32Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.plugins.EmotionsPlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceEmotion', function() {
				ed.windowManager.open({
					file : tinyMCE.settings.plugin_action_base_path + '/emotions.action',
					width : 250 + parseInt(ed.getLang('emotions.delta_width', 0)),
					height : 210 + parseInt(ed.getLang('emotions.delta_height', 0)),
					inline : 1,
                    name : "emoticon_inserter"
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			ed.addButton('emotions', {title : 'emotions.emotions_desc', cmd : 'mceEmotion'});
		},

		getInfo : function() {
			return {
				longname : 'Emotions',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com/',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/emotions',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('emotions', tinymce.plugins.EmotionsPlugin);
})();
/**
 * $Id: editor_plugin_src.js 923 2008-09-09 16:45:29Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var DOM = tinymce.DOM;

	tinymce.create('tinymce.plugins.FullScreenPlugin', {
		init : function(ed, url) {
			var t = this, s = {}, vp;

			t.editor = ed;

			// Register commands
			ed.addCommand('mceFullScreen', function() {
				var win, de = DOM.doc.documentElement;

				if (ed.getParam('fullscreen_is_enabled')) {
					if (ed.getParam('fullscreen_new_window'))
						closeFullscreen(); // Call to close in new window
					else {
						DOM.win.setTimeout(function() {
							tinymce.dom.Event.remove(DOM.win, 'resize', t.resizeFunc);
							tinyMCE.get(ed.getParam('fullscreen_editor_id')).setContent(ed.getContent({format : 'raw'}), {format : 'raw'});
							tinyMCE.remove(ed);
							DOM.remove('mce_fullscreen_container');
							de.style.overflow = ed.getParam('fullscreen_html_overflow');
							DOM.setStyle(DOM.doc.body, 'overflow', ed.getParam('fullscreen_overflow'));
							DOM.win.scrollTo(ed.getParam('fullscreen_scrollx'), ed.getParam('fullscreen_scrolly'));
							tinyMCE.settings = tinyMCE.oldSettings; // Restore old settings
						}, 10);
					}

					return;
				}

				if (ed.getParam('fullscreen_new_window')) {
					win = DOM.win.open(url + "/fullscreen.htm", "mceFullScreenPopup", "fullscreen=yes,menubar=no,toolbar=no,scrollbars=no,resizable=yes,left=0,top=0,width=" + screen.availWidth + ",height=" + screen.availHeight);
					try {
						win.resizeTo(screen.availWidth, screen.availHeight);
					} catch (e) {
						// Ignore
					}
				} else {
					tinyMCE.oldSettings = tinyMCE.settings; // Store old settings
					s.fullscreen_overflow = DOM.getStyle(DOM.doc.body, 'overflow', 1) || 'auto';
					s.fullscreen_html_overflow = DOM.getStyle(de, 'overflow', 1);
					vp = DOM.getViewPort();
					s.fullscreen_scrollx = vp.x;
					s.fullscreen_scrolly = vp.y;

					// Fixes an Opera bug where the scrollbars doesn't reappear
					if (tinymce.isOpera && s.fullscreen_overflow == 'visible')
						s.fullscreen_overflow = 'auto';

					// Fixes an IE bug where horizontal scrollbars would appear
					if (tinymce.isIE && s.fullscreen_overflow == 'scroll')
						s.fullscreen_overflow = 'auto';

					// Fixes an IE bug where the scrollbars doesn't reappear
					if (tinymce.isIE && (s.fullscreen_html_overflow == 'visible' || s.fullscreen_html_overflow == 'scroll'))
						s.fullscreen_html_overflow = 'auto'; 

					if (s.fullscreen_overflow == '0px')
						s.fullscreen_overflow = '';

					DOM.setStyle(DOM.doc.body, 'overflow', 'hidden');
					de.style.overflow = 'hidden'; //Fix for IE6/7
					vp = DOM.getViewPort();
					DOM.win.scrollTo(0, 0);

					if (tinymce.isIE)
						vp.h -= 1;

					n = DOM.add(DOM.doc.body, 'div', {id : 'mce_fullscreen_container', style : 'position:' + (tinymce.isIE6 || (tinymce.isIE && !DOM.boxModel) ? 'absolute' : 'fixed') + ';top:0;left:0;width:' + vp.w + 'px;height:' + vp.h + 'px;z-index:500;'});
					DOM.add(n, 'div', {id : 'mce_fullscreen'});

					tinymce.each(ed.settings, function(v, n) {
						s[n] = v;
					});

					s.id = 'mce_fullscreen';
					s.width = n.clientWidth;
					s.height = n.clientHeight - 15;
					s.fullscreen_is_enabled = true;
					s.fullscreen_editor_id = ed.id;
					s.theme_advanced_resizing = false;
					s.save_onsavecallback = function() {
						ed.setContent(tinyMCE.get(s.id).getContent({format : 'raw'}), {format : 'raw'});
					};

					tinymce.each(ed.getParam('fullscreen_settings'), function(v, k) {
						s[k] = v;
					});

					if (s.theme_advanced_toolbar_location === 'external')
						s.theme_advanced_toolbar_location = 'top';

					t.fullscreenEditor = new tinymce.Editor(AJS.Editor.Adapter.settings.full_screen_editor_id, s);
					t.fullscreenEditor.onInit.add(function() {
						t.fullscreenEditor.setContent(ed.getContent());
						t.fullscreenEditor.focus();
					});

                    var initCallbacks = AJS.Editor.Adapter.fullscreenEditorOnInitCallbacks;
                    for (var i = 0, ii = initCallbacks.length; i < ii; i++) {
                        var f = initCallbacks[i];
                        if (AJS.$.isFunction(f)) {
                            t.fullscreenEditor.onInit.add(f);
                        }
                    }

					t.fullscreenEditor.render();
					tinyMCE.add(t.fullscreenEditor);

					t.fullscreenElement = new tinymce.dom.Element('mce_fullscreen_container');
					t.fullscreenElement.update();
					//document.body.overflow = 'hidden';

					t.resizeFunc = tinymce.dom.Event.add(DOM.win, 'resize', function() {
						var vp = tinymce.DOM.getViewPort();

						t.fullscreenEditor.theme.resizeTo(vp.w, vp.h);
					});
				}
			});

			// Register buttons
			ed.addButton('fullscreen', {title : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/fullscreen.desc', cmd : 'mceFullScreen'});

			ed.onNodeChange.add(function(ed, cm) {
				cm.setActive('fullscreen', ed.getParam('fullscreen_is_enabled'));
			});
		},

		getInfo : function() {
			return {
				longname : 'Fullscreen',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com/',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/fullscreen',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('fullscreen', tinymce.plugins.FullScreenPlugin);
})();

/**
 * $Id: editor_plugin_src.js 848 2008-05-15 11:54:40Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var Event = tinymce.dom.Event, each = tinymce.each, DOM = tinymce.DOM;

	tinymce.create('tinymce.plugins.ContextMenu', {
		init : function(ed) {
			var t = this;

			t.editor = ed;
			t.onContextMenu = new tinymce.util.Dispatcher(this);

            function button() { return AJS.$(".mceToolbar a.mce_contextmenu"); };

            // ATLASSIAN - support context menu user preference
            ed.onPostRender.add(function(ed) {
                // dom might not necessarily be ready on editor post render
                AJS.$(function() {
                    var b = button();
                    if (b.length) {
                        if (AJS.params.remoteUser) {
                            AJS.$.getJSON(tinyMCE.settings.plugin_action_base_path + "/get-wysiwyg-contextmenu.action", {},
                            function(on) {
                                on && b.addClass("on");
                            });
                        }
                        // for anonymous users: if going to fullscreen mode, copy button state from normal mode
                        else if (ed.id.indexOf("fullscreen") && AJS.$("#wysiwyg .mceToolbar a.mce_contextmenu").hasClass("on")) {
                            b.addClass("on");
                        }
                    }
                });
            });
			ed.onContextMenu.add(function(ed, e) {
				if (!e.ctrlKey && button().hasClass("on")) {
					t._getMenu(ed).showMenu(e.clientX, e.clientY);
					Event.cancel(e);
				}
			});

			function hide() {
				if (t._menu) {
					t._menu.removeAll();
					t._menu.destroy();
				}
			};

			ed.onMouseDown.add(hide);
			ed.onKeyDown.add(hide);

            // ATLASSIAN - add button to toggle the context menu on/off
            ed.addCommand('mceContextMenu', function() {
                hide();
                var b = button();
                var setButton = function(on) {
                    on ? b.addClass("on") : b.removeClass("on");
                };
                if (AJS.params.remoteUser) {
                    AJS.$.getJSON(tinyMCE.settings.plugin_action_base_path + "/set-wysiwyg-contextmenu.action",
                    { contextMenuPref: !b.hasClass("on") }, setButton);
                }
                else {
                    setButton(!b.hasClass("on"));
                }
            });
            ed.addButton('contextmenu', {title : 'http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/contextmenu.desc', cmd : 'mceContextMenu'});
        },

		getInfo : function() {
			return {
				longname : 'Contextmenu',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com/',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/contextmenu',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		_getMenu : function(ed) {
			var t = this, m = t._menu, se = ed.selection, col = se.isCollapsed(), el = se.getNode() || ed.getBody(), am, p1, p2;

			if (m) {
				m.removeAll();
				m.destroy();
			}

			p1 = DOM.getPos(ed.getContentAreaContainer());
			p2 = DOM.getPos(ed.getContainer());

			m = ed.controlManager.createDropMenu('contextmenu', {
				offset_x : p1.x + ed.getParam('contextmenu_offset_x', 0),
				offset_y : p1.y + ed.getParam('contextmenu_offset_y', 0),
				constrain : 1
			});

			t._menu = m;

            // ATLASSIAN - useless in firefox and safari
//			m.add({title : 'advanced.cut_desc', icon : 'cut', cmd : 'Cut'}).setDisabled(col);
//			m.add({title : 'advanced.copy_desc', icon : 'copy', cmd : 'Copy'}).setDisabled(col);
//			m.add({title : 'advanced.paste_desc', icon : 'paste', cmd : 'Paste'});

            // ATLASSIAN - Confluence Plugin context menu items
            m.add({title : 'confluence.conflink_desc', icon : 'conflink', cmd : 'mceConflink'});
            if (el.nodeName == 'A') {
                m.add({title : 'advanced.unlink_desc', icon : 'unlink', cmd : 'mceConfUnlink'});
            }
			m.add({title : 'confluence.confimage_desc', icon : 'confimage', cmd : 'mceConfimage', ui : true});
			m.add({title : 'confluence.conf_macro_browser_desc', icon : 'conf_macro_browser', cmd : 'mceConfMacroBrowser'});
            m.addSeparator();

            t.onContextMenu.dispatch(t, m, el, col);

            // ATLASSIAN - add the disable context menu last
            m.add({title : 'contextmenu.disable_desc', icon : 'contextmenu', cmd : 'mceContextMenu', ui : true});

			return m;
		}
	});

	// Register plugin
	tinymce.PluginManager.add('contextmenu', tinymce.plugins.ContextMenu);
})();

/**
 * $Id: editor_plugin_src.js 686 2008-03-09 18:13:49Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.plugins.SearchReplacePlugin', {
		init : function(ed, url) {
			function open(m) {
				ed.windowManager.open({
					file : tinyMCE.settings.plugin_action_base_path +  '/searchreplace.action',
					width : 400 + parseInt(ed.getLang('searchreplace.delta_width', 0)),
					height : 225 + parseInt(ed.getLang('searchreplace.delta_height', 0)),
					inline : 1,
					auto_focus : 0
				}, {
					mode : m,
					search_string : ed.selection.getContent({format : 'text'}),
					plugin_url : url
				});
			};

			// Register commands
			ed.addCommand('mceSearch', function() {
				open('search');
			});

			ed.addCommand('mceReplace', function() {
				open('replace');
			});

			// Register buttons
			ed.addButton('search', {title : 'searchreplace.search_desc', cmd : 'mceSearch'});
			ed.addButton('replace', {title : 'searchreplace.replace_desc', cmd : 'mceReplace'});

			ed.addShortcut('ctrl+f', 'searchreplace.search_desc', 'mceSearch');
		},

		getInfo : function() {
			return {
				longname : 'Search/Replace',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com/',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/searchreplace',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('searchreplace', tinymce.plugins.SearchReplacePlugin);
})();
tinymce.confluence = tinymce.confluence || {};

tinymce.confluence.formatter = new (function ($) {
    /**
     * This structure describes how to create a new instance of a block format.
     * rawText: if true, extract the raw text from the macro body and throw any formatting away.
     */
    var formatDescriptors = {
        p: {
            rawText: false},
        macro_quote: {
            macroName: "quote",
            rawText: false },
        macro_panel: {
            macroName: "panel",
            rawText: false },
        macro_noformat: {
            macroName: "noformat",
            rawText: true },
        macro_code: {
            macroName: "code",
            rawText: true }
    };

    // Public (privileged) methods here - called from tiny_mce_src.js
    this.formatBlock = function(format) {
        var ed = tinyMCE.activeEditor,
            selection = ed.selection,
            outerBlock = getEnclosingBlock(selection.getNode()),
            bookmark = selection.getBookmark(); // get the bookmark before we do any formatting

        if (!format || format == 'p') {
            removeFormat(outerBlock, ed.dom);
        }
        else if (!outerBlock) { 
            formatRange(ed, format);
        }
        else {
            formatElement(ed, format, outerBlock);
        }

        // clean up code
        selection.moveToBookmark(bookmark);
        ed.nodeChanged();

        // only execute the FormatBlock command for known formatting
        if(/^(P)$/i.test(format)) {
            ed.getDoc().execCommand('FormatBlock', false, format);
        }
    };

    // Private members - variables and functions.
    function formatElement(editor, format, outerBlock) {
        AJS.log("formatElement");

        var $blockToFormat = $(outerBlock),
            macroBody = $blockToFormat.html(),
            formatDescriptor = formatDescriptors[format];

        if (formatDescriptor.rawText) {
            macroBody = $blockToFormat.text();
        }

        // if we are already in a formatting macro, we need to
        // remove the formatting before applying the new one
        var macro = getEnclosingMacro($blockToFormat);
        if (macro.length && getFormatDescriptor(macro)) {
            var s = editor.selection, b = s.getBookmark();
            removeFormat(macro[0], editor.dom, macro);
            s.moveToBookmark(b);
            insertMacro(formatDescriptor, macroBody, s.getNode());
        }
        else {
            insertMacro(formatDescriptor, macroBody, $blockToFormat[0]);
        }
    };

    function formatRange(editor, format) {
        AJS.log("formatRange");
        var range = editor.selection.getRng(), formatDescriptor = formatDescriptors[format];
        var macroBody;
        if (formatDescriptor.rawText) {
            macroBody = range.text || editor.selection.getContent({format : 'text'});
        }
        else {
            macroBody = range.htmlText || editor.selection.getContent();
        }
        insertMacro(formatDescriptor, macroBody);
    };

    function getBodySelector(formatDescriptor) {
        return formatDescriptor.rawText ? "pre" : "p";
    };

    function insertMacro(formatDescriptor, macroBody, node) {
        macroBody = macroBody || " ";
        var macroName = formatDescriptor.macroName,
            markup = "\n{" + macroName + "}\ntext\n{" + macroName + "}\n"; // newlines and 'text' is required

        var data = {
        		pageId: AJS.Editor.getContentId(), spaceKey: AJS.params.spaceKey, wikiMarkup: markup
        };
        var callback = function(macroHtml) {
            var editor = tinyMCE.activeEditor, s = editor.selection;
            if (node) {
                s.select(node);
            }
            var $macro = $("<div>" + macroHtml + "</div>"),
                toInsert = $macro.find("div.wysiwyg-macro " + getBodySelector(formatDescriptor));
            if (toInsert.length == 1) {
                if (formatDescriptor.rawText) {
                    // Raw text formats shouldn't have any HTML tags rendered, so "escape" them by inserting as text.
                    toInsert.text(macroBody);
                } else {
                    toInsert.html(macroBody);
                }
            }
            else {
                AJS.log("Error: cannot find macro body");
            }

            tinymce.confluence.macrobrowser.processMacros($macro);
            s.setContent($macro.html());
        };
        
        AJS.safe.post(AJS.params.contextPath + "/json/convertwikimarkuptoxhtmlwithoutpagewithspacekey.action", data, callback, "json");
    };

    /**
     * Returns a html element that is an 'enclosing block' of the given node. An enclosing block in this context
     * refers to a format block described in formatDescriptors.
     */
    function getEnclosingBlock (node) {

        if (/^(P|DIV|H[1-6]|PRE)$/i.test(node.nodeName)) {
            return node;
        }
        // otherwise we try and find the first ancestor that is a block element
        var enclosingElem = null;
        $(node).parents().each(function(i, parent) {
            if (/^(P|DIV|H[1-6]|PRE)$/i.test(parent.nodeName)) {
                enclosingElem = parent;
                return false;
            }
        });
        return enclosingElem;
    };

    function getEnclosingMacro($node) {
        return $node.hasClass("wysiwyg-macro") ? $node : $node.parents("div.wysiwyg-macro:first");
    };

    function getFormatDescriptor($node) {
        var macroName = $node.attr("macroname");
        return formatDescriptors["macro_" + macroName];
    };

    function removeFormat(enclosingBlock, domUtils, enclosingMacro) {
        AJS.log("removeFormat");
        // Can't remove format from range - doesn't make sense.
        if (!enclosingBlock) {
            AJS.log("removeFormat: enclosingBlock null, returning");
            return;
        }
        var content, $enclosingBlock = $(enclosingBlock);
        // look for an enclosing macro first
        enclosingMacro = enclosingMacro || getEnclosingMacro($enclosingBlock);
        if (enclosingMacro.length) {
            var descriptor = getFormatDescriptor(enclosingMacro);
            if (descriptor) {
                AJS.log("Remove macro format: " + descriptor.macroName);
                $enclosingBlock = enclosingMacro;
                content = enclosingMacro.find(getBodySelector(descriptor));
                if (descriptor.rawText) {
                    content = content.text();   // removes formatting tags (e.g. code-quotes) but unescapes script tags
                    content = AJS("i").text(content).html(); // escapes script tags again
                } else {
                    content = content.html();   // removes wrapper element from around content
                }
            }
        }
        if (!content) {
            content = enclosingBlock.childNodes;
        }

        if ($enclosingBlock.parent("body").length) {
            // Text in the editor should never be directly inside the body - should at least
            // be in a p. This is how the wiki-renderer does it too.
            var p =  domUtils.create("p");
            $(p).append(content);
            $enclosingBlock.replaceWith(p);
        }
        else {
            $enclosingBlock.replaceWith(content);
        }
    };
})(AJS.$);

tinymce.confluence.macrobrowser = (function($) { return {
    /**
     * The current selection range in the editor
     */
    storedRange : null,
    /**
     * The current bookmark location in the editor
     */
    bookmark : null,

    getCurrentNode : function () {
        return $(tinyMCE.activeEditor.selection.getNode());
    },
    isMacroDiv : function(node) {
        return $(node).hasClass("wysiwyg-macro");
    },
    isMacroTag : function(node) {
        return $(node).hasClass("wysiwyg-macro-tag");
    },
    isMacroStartTag : function(node) {
        return $(node).hasClass("wysiwyg-macro-starttag");
    },
    isMacroEndTag : function(node) {
        return $(node).hasClass("wysiwyg-macro-endtag");
    },
    isMacroBody : function(node) {
        return $(node).hasClass("wysiwyg-macro-body");
    },
    hasMacroBody : function(node) {
        return $(node).attr("macrohasbody") == "true";
    },
    /**
     * Returns an array of macro names for macro divs enclosing the current node.
     */
    getNestingMacros : function(node) {
        var $node = $(node || this.getCurrentNode());
        var nestingMacros = [];
        $node.parents(".wysiwyg-macro").each(function() {
            nestingMacros.push($(this).attr("macroname"));
        });
        return nestingMacros;
    },
    processMacros : function(node, editor) {
        // the editor we're working with is not always the active one i.e fullscreen -> normal
        editor = editor || tinyMCE.activeEditor;
        var domUtils = editor.dom;

        // wrap macro body elments in a p if none exists
        $(".wysiwyg-macro-body", node).each(function() {
            var macroBody = this;
            if (!macroBody.firstChild) {
                domUtils.add(macroBody, "p");
            }
            else if(!($(macroBody.firstChild).is("p, pre, .wysiwyg-macro"))) {
                var p = domUtils.create("p");
                while (macroBody.firstChild) {
                    p.appendChild(macroBody.firstChild);
                }
                domUtils.add(macroBody, p);
            }
        });
        AJS.Editor.Adapter.onSetContent(node);
    },
    flushRedundantPadding : function () {
        var domUtils = tinyMCE.activeEditor.dom;
        // remove unnecessary p's added by Confluence's renderer
        $("p.atl_conf_pad", tinyMCE.activeEditor.getDoc()).each(function() {
            if ($(this).next().length) {
                AJS.log("onSetContent: removing p.atl_conf_pad");
                domUtils.remove(this);
            }
        });
    },

    handleKeyPressInMacroTag : function (isReturn, code, selectionNode) {
        var t = tinymce.confluence.macrobrowser, domUtils = tinyMCE.activeEditor.dom;
        var s = tinyMCE.activeEditor.selection;

        var pContent = isReturn ? "&nbsp;" : String.fromCharCode(code);
        var macroDiv = selectionNode.parentNode;
        var hasMacroBody = t.hasMacroBody(macroDiv);
        var bodyDiv = hasMacroBody ? $(".wysiwyg-macro-body:first", macroDiv)[0] : null;

        var rng;
        if (AJS.Editor.Adapter.IERange) {
            rng = AJS.Editor.Adapter.IERange.getSelection().getRangeAt(0);
        } else {
            rng = s.getRng();
        }

        var cursorLocation = rng.startOffset;
        var atStartOfMacroTag = cursorLocation == 0;
        var extraNode;
        var newNodeName;
        if (atStartOfMacroTag) {
            // Cursor is at start of either the start or end tag (if present)
            if (t.isMacroStartTag(selectionNode)) {
                extraNode = domUtils.create("p", {}, pContent);
                // typing at start of starting tag - insert para before macro div.
                var parent = macroDiv.parentNode;
                parent.insertBefore(extraNode, macroDiv);
            } else {
                // at start of end tag, add text to body in node with same type as body nodes
                newNodeName = $(":first", bodyDiv)[0].nodeName || "p";
                extraNode = domUtils.create(newNodeName, {}, pContent);
                bodyDiv.appendChild(extraNode);
            }
        } else {
            AJS.log("Not atStartOfMacroTag");
            // Cursor is either inside the tag or at the end.
            var needsP = isReturn || t.isMacroEndTag(selectionNode);
            if (!needsP) {
                var macroTagText = $(selectionNode).text();
                // Assumes that div text is a single node and the cursor is at the end of the text (after the '}')
                needsP = cursorLocation == macroTagText.length;
            }
            if (!needsP) {
                // Typing inside the start tag - allow.
                return true;
            }

            if (hasMacroBody && t.isMacroStartTag(selectionNode)) {
                // insert appropriate new node at start of body, inside body div
                newNodeName = $(":first", bodyDiv)[0].nodeName || "p";
                extraNode = domUtils.create(newNodeName, {}, pContent);
                bodyDiv.insertBefore(extraNode, bodyDiv.firstChild);
            } else {
                // put after the entire macro
                extraNode = domUtils.create("p", {}, pContent);
                domUtils.insertAfter(extraNode, macroDiv);
            }
        }
        s.select(extraNode, true);  // select the textnode in the p rather than the p itself
        s.collapse(isReturn); // collapse to end (after the new character) or start (before nbsp)

        return false;
    },

    onTinyMceInitialised : function(editor) {
        var t = tinymce.confluence.macrobrowser;

        editor.onSetContent.add(function(editor) {
            AJS.log("onSetContent: process macros and remove uncessary p's");
            t.processMacros(editor.getDoc(), editor);
            t.flushRedundantPadding();
        });

        // override enter key press on macro tags so it adds a 'p' instead of a 'div'
        editor.onKeyPress.addToTop(function(editor, e) {

            // Ignore key combinations.
            if (e.ctrlKey || e.metaKey || e.altKey) return true;

            // Ignore arrows, tabs, etc. TODO - find displayable chars better.
            var code = e.charCode || e.keyCode;
            var isPrintableChar = false;  // (code >= 32 && code <= 126);
            var isReturn = (code == 13 && !e.shiftKey);
            if (!isReturn && !isPrintableChar) {
                return true;
            }

            // Ignore anything outside a macro tag.
            var s = editor.selection, selectionNode = s.getNode();
            if (!t.isMacroTag(selectionNode)) {
                return true;
            }

            var returnVal = t.handleKeyPressInMacroTag(isReturn, code, selectionNode);
            if (!returnVal)
                tinymce.dom.Event.cancel(e);

            return returnVal;
        });
    },

    logMCESelection : function (title) {
        var s = tinyMCE.activeEditor.selection;
        AJS.log("******************************");
        AJS.log("Logging TinyMCE selection title:    " + title);
        AJS.log("Bookmark:");
        AJS.log(s.getBookmark());
        var rangeNodeText = $(s.getRng().startContainer).text() || $(s.getRng().startContainer.parentNode).text();
        AJS.log("Range: " + rangeNodeText);
        AJS.log(s.getRng());
    },

    getSelectedMacro : function(editor) {
        var t = tinymce.confluence.macrobrowser,
            $selectionNode = t.getCurrentNode();
        AJS.log("getSelectedMacro: $selectionNode=" + $selectionNode[0]);
        // when we upgrade to jquery 1.3 use closest() instead of parents()
        return t.isMacroDiv($selectionNode) ? $selectionNode : $selectionNode.parents(".wysiwyg-macro:first");
    },

    openMacro : function(macro) {
        AJS.MacroBrowser.open({
            selectedMacro : macro,
            onComplete : tinymce.confluence.macrobrowser.macroBrowserComplete,
            onCancel : tinymce.confluence.macrobrowser.macroBrowserCancel
        });
    },

    /**
     * Called to insert a new macro.
     * If user has not selected text, just open the Macro Browser.
     * If user has selected text, it will convert it to wiki markup for the body of the macro
     */
    macroBrowserToolbarButtonClicked : function(options) {

        var t = tinymce.confluence.macrobrowser,
            editor = tinyMCE.activeEditor,
            node = t.getCurrentNode();

        AJS.Editor.Adapter.storeCurrentSelectionState();

        // Editing an existing macro
        if (!options.ignoreEditorSelection && t.isMacroTag(node)) {
            var macroDiv = node.parent()[0];
            editor.selection.select(macroDiv);      // select the entire macro for the user to see
            t.editedMacroDiv = macroDiv;
            var macroHtml = tinymce.DOM.getOuterHTML(macroDiv);
            
            AJS.safe.post(AJS.params.contextPath + "/json/convertxhtmltowikimarkupwithoutpage.action", {pageId: AJS.Editor.getContentId(), xhtml: macroHtml}, function(markup) {
                t.editedMacro = AJS.MacroBrowser.parseMacro(markup);
                t.openMacro(t.editedMacro);
            }, "json");
            return;
        }
        // Inserting new macro
        var settings = $.extend({
            nestingMacros : t.getNestingMacros(node),
            onComplete : t.macroBrowserComplete,
            onCancel : t.macroBrowserCancel,
            mode : "insert"
        }, options);

        var selectedHtml = !options.ignoreEditorSelection && editor.selection.getContent();
        if (!selectedHtml) { // no selected text
            AJS.MacroBrowser.open(settings);
            return;
        }

        // selected text for the macro body
        AJS.safe.post(AJS.params.contextPath + "/json/convertxhtmltowikimarkupwithoutpage.action", {pageId: AJS.Editor.getContentId(), xhtml: selectedHtml}, function(markup) {
            settings.selectedMarkup = markup;
            settings.selectedHtml = selectedHtml;
            AJS.MacroBrowser.open(settings);
        }, "json");
    },
    /**
     * Takes macro markup (usually generated by the Macro Browser) and inserts/updates the relevant Macro macroHeader
     * in the RTE.
     * @param macro macro object describing inserted/edited macro
     */
    macroBrowserComplete : function(macro) {
        var t = tinymce.confluence.macrobrowser;

        // Put any starting and ending text from an edited macro around the macro tags.
        if (t.editedMacro) {
            if (t.editedMacro.beforeTag) {
                macro.markup = t.editedMacro.beforeTag + macro.markup;
            }
            if (t.editedMacro.afterTag) {
                macro.markup += t.editedMacro.afterTag;
            }
        }
        t.insertMacroAtSelectionFromMarkup(macro.markup);
    },

    insertMacroAtSelectionFromMarkup: function (markup, callback) {
        var t = tinymce.confluence.macrobrowser,
            contentId = AJS.params.contentId || "0";
        AJS.safe.post(AJS.params.contextPath + "/json/convertwikimarkuptoxhtmlwithoutpagewithspacekey.action", 
            {pageId: contentId, spaceKey: AJS.params.spaceKey, wikiMarkup: markup},
            function (macroHtml) {
                var ed = tinyMCE.activeEditor,
                    macro = ed.dom.create("div", {}, macroHtml);
                t.processMacros(macro);

                // The converter call above doesn't know if it should have lines before/after so add both because it's
                // better than losing both.
                $(".wysiwyg-macro", macro).attr("wikihasprecedingnewline", "true").attr("wikihastrailingnewline", "true");

                AJS.Editor.Adapter.restoreSelectionState();  // restores to original caret or range user was at
                AJS.Editor.Adapter.setNodeAtCursor(macro, t.editedMacroDiv);
                t.editedMacroDiv && (t.editedMacroDiv = null);

                t.flushRedundantPadding();

                callback && callback();
            },
            "json"
        );
    },
    // Called when the macro browser is closed to clean up and reset data.
    macroBrowserCancel : function() {
        var t = tinymce.confluence.macrobrowser;
        AJS.Editor.Adapter.restoreSelectionState();
        t.editedMacroDiv = null;
        t.editedMacro = null;
    }
};})(AJS.$);

(function($) {
    /**
     * Keys of properties that should be stored in the wiki markup of the image.
     */
    var imagetextKeys = ["align", "thumbnail", "border", "width", "height"],

        /**
         *  Keys of properties that should be stored as attributes of the image element.
         */
        imageElementAttributeKeys =  ["imagetext", "src", "align", "border", "width", "height"],

        /**
         * Extracts the filename from the wiki-markup destination.
         *
         * E.g. extracts "starryNight.png"/*tpa=http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/starryNight.png*/ from TST:Test Page^starryNight.png"
         */
        getImageFileNameFromDestination = function (destination) {
            var caretIndex = destination.indexOf("^");
            return destination.substring(caretIndex + 1);
        },


        createFromMarkup = function (markup) {
            var markupParts = markup.split("|"),
                attributes = (markupParts[1] && markupParts[1].split(",")) || [];

            var imageProperties = {
                destination: markupParts[0]
            };

            if (tinymce.confluence.ImageUtils.isRemoteImg(imageProperties.destination)) {
                imageProperties.url = imageProperties.destination;
            } else {
                imageProperties.imageFileName = getImageFileNameFromDestination(imageProperties.destination);
            }

            for (var i = 0, ii = attributes.length; i < ii; i++) {
                var parts = attributes[i].split("=");
                imageProperties[parts[0]] = parts[1] || true;
            }

            return imageProperties;
        },

        /**
         * The pageId for the content owning the image attachment is not
         * stored against the image element directly, so we extract it from the
         * image element's src attribute.
         *
         * e.g. /confluence/download/attachments/2129935/ca5.gif extracts "2129935"
         *      /confluence/download/thumbnails/2129935/ca5.gif ALSO extracts "2129935"
         */
        getPageIdFromImageElement = function (imgEl) {
            var src = $(imgEl).attr("src"),
                matches = src.match(/\/download\/(thumbnails|attachments)\/([0-9]+)\//);
            if (matches.length == 3) {
                return matches[2];
            }
            AJS.log("ERROR: could not parse page id from image url " + src);
            return "0";
        },

        /**
         * Creates the string to store in the src attribute of the img element.
         *
         * e.g. /confluence/download/attachments/884738/hedgehog.jpg
         */
        getSrc = function (imgProps) {
            var destination = imgProps.destination;
            if (tinymce.confluence.ImageUtils.isRemoteImg(destination)) {
                return destination;
            }

            var location = imgProps.thumbnail ? 'thumbnails' : 'attachments';
            return AJS.params.contextPath + '/download/' + location + '/' +
                  imgProps.pageId + '/' + imgProps.imageFileName;
        },

        /**
         * Returns the wiki markup string that these properties define.
         *
         * e.g. spaceKey:pageTitle^image.gif|thumbnail,align=right,border
         */
        getMarkup = function (imgProps) {

            var imagetext = imgProps.destination || imgProps.imageFileName,
                props = [];

            for (var i = 0, ii = imagetextKeys.length; i < ii; i++) {
                var key = imagetextKeys[i], val = imgProps[key];
                if (!val) continue;

                var prop = key;
                if (val !== true) {
                    // not a boolean property like "thumbnail" - add the value
                    prop += "=" + val;
                }
                props.push(prop);
            }
            if (props.length) {
                imagetext += "|" + props.join(",");
            }
            return imagetext;
        },

        /**
         * For width and height attributes, don't use $el.attr("width") or el.getAttribute("width") alone as it
         * returns the calculated value even if the attribute isn't present.
         *
         * See http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273 for more detail.
         */
        getSpecifiedAttributeValue = function (el, name) {
            var attr = el.getAttributeNode(name);
            return attr && attr.specified && attr.nodeValue;
        },

        /**
         * Returns true iff this is a Confluence image tag with a wiki-markup "imagetext" attribute.
         */
        isOurImage = function(imgEl) {
            return imgEl && imgEl.tagName && (imgEl.tagName.toLowerCase() == "img") && imgEl.getAttribute("imagetext");
        },

        newImageCounter = 0;

    /**
     * ImageProperties class represents all of the attributes of an image in the
     * RTE:
     *      imageFileName
     *      align
     *      thumbnail
     *      border
     *      width
     *      height
     *      url (optional) the full url of the image for an external image
     *      pageId (optional if url exists) the id of the page owning the image attachment
     *      destination (optional) the full "wiki" path to the image, eg "TST:Foo^bar.jpg"
     *
     *  It can return calculated values, such as:
     *      src
     *      imagetext
     */
    tinymce.confluence.ImageProperties = function (props) {
        if (isOurImage(props)) {
            // props is an img element
            var $el = $(props),
                el = $el[0],
                markup = $el.attr("imagetext");

            props = createFromMarkup(markup);
            props.width = getSpecifiedAttributeValue(el, "width") || props.width;
            props.height = getSpecifiedAttributeValue(el, "height") || props.height;

            if (!tinymce.confluence.ImageUtils.isRemoteImg(props.destination))
                props.pageId = getPageIdFromImageElement($el);

            return $.extend({}, props);

        } else if (props.destination) {
            // props is a map of ImageProperties values
            props.imageFileName = props.imageFileName || getImageFileNameFromDestination(props.destination);
            props.align = props.align || "";

            return $.extend({}, props);
        }
        // not an image element and not a valid properties object - return nothing
        return null;
    };

    tinymce.confluence.ImageUtils = {

        /**
         * Loads the image properties into the passed img element.
         * @param img an HtmlImageElement or a jQuery wrapping one.
         * @param imgProps the image properties to update the element with.
         */
        updateImageElement: function (img, imgProps) {

            var $img = $(img);

            imgProps.imagetext = getMarkup(imgProps);
            imgProps.src = getSrc(imgProps);

            // Renderer & TinyMCE both add style tags to show borders - these both need updating, if present, or they'll
            // override any border attribute set.
            var newBorderStyle = "1px solid " + (imgProps.border ? "black" : "transparent");
            $img.css("border", newBorderStyle);
            $img.attr("mce_style", $img.attr("style"));

            for (var i = 0, ii = imageElementAttributeKeys.length; i < ii; i++) {
                var key = imageElementAttributeKeys[i], val = imgProps[key];
                if (val !== false && val != null) {
                    $img.attr(key, val);
                } else {
                    $img.removeAttr(key);
                }
            }

            // Update the image element's parent's alignment if necessary.
            var parent = img.parentNode;
            var isCentred = parent && (parent.tagName && parent.tagName.toLowerCase() == "div") && parent.getAttribute("align") == "center";
            var shouldBeCentred = (imgProps.align == "center");

            if (!isCentred && shouldBeCentred) {
                // If the image is not centered already...
                // Set the alignment in the parent node
                parent.setAttribute("align", "center");
            } else if (isCentred && !shouldBeCentred) {
                // If the image is currently centered, but should not be...
                // Remove the align attribute
                parent.removeAttribute("align");
            }
        },
    
        /**
         * Inserts a new IMG element at the current selection in the RTE.
         * @return a reference to the inserted IMG element.
         */
        insertImageElement : function () {
             // Regardless of how the image is being aligned, wrap it in a div, so the image has a parent node
            var ed = tinyMCE.activeEditor,
                doc = ed.getDoc(),
                div = ed.dom.create("DIV"),
                oImg = ed.dom.create("IMG"),
                thisImageId = "new-rte-image-" + newImageCounter++;

            oImg.setAttribute("id", thisImageId);  // for retrieving IMG element after DOM insertion via node or HTML paste
            div.appendChild(oImg);

            AJS.Editor.Adapter.setNodeAtCursor(div);

            var foundEl = $("#" + thisImageId, doc);
            foundEl.attr("id", ""); // TODO - delete some nice way
            
            return foundEl[0];
        },

        /**
         * Given a map of ImageProperties properties, insert a new Image element
         * at the current selection in the RTE and populate it.
         * @param propertyMap
         */
        insertFromProperties: function (propertyMap) {
            var imageProperties = tinymce.confluence.ImageProperties(propertyMap),
                imgEl = this.insertImageElement();
            this.updateImageElement(imgEl, imageProperties);
            return imgEl;
        },

        /**
         * Creates ImageProperties from the passed map and either updates the
         * passed img element if passed, or inserts a new img element.
         * @param propertyMap
         * @param imgEl
         */
        updateOrInsertImageElement: function (propertyMap, imgEl) {

            var imageProperties = tinymce.confluence.ImageProperties(propertyMap);

            if (!isOurImage(imgEl)) {
                imgEl = this.insertImageElement();
            }
            this.updateImageElement(imgEl, imageProperties);
            return imgEl;
        },

        /**
         * Checks if an image has a url as its destination instead of a wiki link.
         * @return true if image text starts with http or https protocol
         */
        isRemoteImg: function (destination) {
            return destination.indexOf("http://") == 0 || destination.indexOf("https://") == 0;
        }
    };
})(AJS.$);

function PageItem() {}

// this method is passed the event
PageItem.prototype.OnClick = function (e) {
    var target;

    //alert(DWRUtil.toDescriptiveString(e,2,1));
    if (!e.target) {
        // IE event model
        target = e.srcElement;
    }
    else {
        target = e.target;
    }
    this.selectNode(target);
};


// this method is passed the tag which has been clicked on
PageItem.prototype.OnDoubleClick = function (e) {
    this.selectNode(e);
};

PageItem.prototype.findTarget = function (t) {
    if (t == null) {
        return null;
    }
    if (this.isOurNode(t)) {
        return t;
    }
    return this.findTarget(t.parentNode);
};

PageItem.prototype.selectNode = function (target) {
    var a = this.findTarget(target);
    if (a) {
        this.SelectedNode = a;
    }
    else {
        this.SelectedNode = undefined;
    }
    return this.SelectedNode;
};

ConfLink.prototype = new PageItem();

function ConfLink() { }

// Add a new element at the actual selection.
ConfLink.prototype.Add = function (link, show, destination, alias, tooltip, pageId, spaceKey ) {

    var oSpan = tinyMCE.activeEditor.dom.create('A');
    ConfLink.range = tinyMCE.activeEditor.selection.getRng();
    this.SetupSpan(oSpan, link, show, destination, alias, tooltip, pageId, spaceKey);

    // Since we can't insert a node into the DOM,
    // insert the html synchronously for IE.
    // See 'ConfLink.prototype.reply_setupspan'
    if (!tinymce.isIE) {
        ConfLink.range.insertNode(replySpan);
    }
};

var replySpan;

ConfLink.prototype.reply_setupspan = function (html) {
    if (html.indexOf('<p>') == 0) {
        html = html.substring(3);
    }
    if (html.lastIndexOf('</p>') == html.length - 4) {
        html = html.substring(0,html.length - 4);
    }
    // So that we do not need to always pad links with a thinsp or something,
    // pad it here with a regular space.  Not ideal at all.
    html += ' ';

    // setOuterHTML
    if (tinymce.isIE) {        
        ConfLink.range.pasteHTML(html);
    }
    else {
        tinyMCE.activeEditor.focus();

        //alert(DWRUtil.toDescriptiveString(replySpan));
        var r = replySpan.ownerDocument.createRange();
        r.setStartBefore(replySpan);
        var df = r.createContextualFragment(html);
        var parentNode = replySpan.parentNode;
        var cursorIndex = AJS.Editor.Adapter.getChildIndex(parentNode, replySpan) + 2;  // +1 for end of <a>, +1 for after trailing space
        parentNode.replaceChild(df, replySpan);

        // Put cursor at end of link
        var range = AJS.Editor.Adapter.createRange();
        range.setStart(parentNode, cursorIndex);
        range.setEnd(parentNode, cursorIndex);
        tinyMCE.activeEditor.selection.setRng(range);
    }
};

// decode HTML encoded text
ConfLink.prototype.DecodeURI = function (encoded) {
    return encoded;
};

// decode HTML encoded text
ConfLink.prototype.EncodeURI = function (unencoded) {
    return unencoded;
};

ConfLink.prototype.SetupSpan = function (span, link, show, destination, alias, tooltip, pageId, spaceKey) {
    replySpan = span;
    replySpan.innerHTML = show;
    span.setAttribute('href','#');
    span.setAttribute('linktype','raw');
    span.setAttribute('wikidestination', destination);
    if (alias.length > 0) {
        span.setAttribute('aliasspecified', 'true');
    }
    else {
        span.setAttribute('originalalias', destination);
    }
    if (tooltip.length > 0) {
        span.setAttribute('title', tooltip);
        span.setAttribute('wikititle', tooltip);
    }
    if (pageId) {
        dwrInProgress = true;
        AJS.safe.post(AJS.params.contextPath + "/json/convertwikimarkuptoxhtmlwithoutpagewithspacekey.action", 
            {pageId: pageId, spaceKey: spaceKey, wikiMarkup: '[' + link + ']'}, 
            function() {
            	this.reply_setupspan();
                dwrInProgress = false;
            }, "json");
    }
};

ConfLink.prototype.DWRComplete = function() {
    dwrInProgress = false;
};

ConfLink.prototype.isOurNode = function(t) {
    return t.tagName == 'A' && t.getAttribute('linktype') == "raw";
};

var textField;

function reply_loadselected(markup) {
    textField.value = markup;
}

ConfLink.prototype.LoadMarkup = function(xhtml, field, pageId) {
    textField = field;
    if (pageId) {
    	AJS.safe.post(AJS.params.contextPath + "/json/convertxhtmltowikimarkupwithoutpage.action", {pageId: pageId, xhtml: xhtml}, reply_loadselected, "json");
    }
};

ConfLink.prototype.Ok = function(destinationStr, aliasStr, tooltipStr, linkTextWikiMarkup, selection, pageId, spaceKey) {
    var ed = tinyMCE.activeEditor;
    if ( destinationStr.length == 0 ) {
        alert(ed.getLang("confluence.conflink_error_no_name"));
        return false;
    }

    // http://jira.atlassian.com/browse/CONF-13342
    if (tooltipStr.length > 0 && aliasStr.length == 0) {
        aliasStr = destinationStr;
    }
    var showtext = (aliasStr.length > 0 ? aliasStr : destinationStr);

    var eSelected = selection.getNode();
    if (eSelected && !this.isOurNode(eSelected)) {
        // we had a selection, but it wasn't an existing link
        // so delete the existing contents then add
        var rng = ed.selection.getRng();
        if (rng.deleteContents) rng.deleteContents();
        eSelected = null;
    }

    if (eSelected) {
        this.SetupSpan(eSelected, this.EncodeURI(linkTextWikiMarkup), showtext, destinationStr, aliasStr, tooltipStr, pageId, spaceKey);
    } else {
        this.Add(this.EncodeURI(linkTextWikiMarkup), showtext, destinationStr, aliasStr, tooltipStr, pageId, spaceKey);
    }
};

ConfImage.prototype = new PageItem();

function ConfImage() {
    window.ConfImage = this;
}

ConfImage.prototype.isOurNode = function (t) {
    return t.tagName == "IMG" && t.getAttribute("imagetext");
};

// Inserts or updates an image in the RTE and returns a reference to the inserted content.
// @deprecated Use tinymce.confluence.ImageUtils.updateOrInsertImageElement
ConfImage.prototype.Ok = function (imageFileName, thumbnail, border, align, imgEl, pageId) {

    var propertyMap = {
        imageFileName: imageFileName,
        thumbnail: thumbnail,
        border: border,
        align: align,
        pageId: pageId,
        width: imgEl && imgEl.getAttribute("width"),
        height: imgEl && imgEl.getAttribute("height")
    };
    return tinymce.confluence.ImageUtils.updateOrInsertImageElement(propertyMap, imgEl);
};

ConfImage.prototype.openDialog = function () {
    AJS.Editor.Adapter.storeCurrentSelectionState();
    var img = tinyMCE.activeEditor.selection.getNode();
    var imageProperties = tinymce.confluence.ImageProperties(img);
    AJS.Editor.openImageDialog({
        submitCallback: function (fileName, params, contentId) {
            AJS.Editor.Adapter.restoreSelectionState();

            var propertyMap = AJS.$.extend({
                destination: fileName,
                pageId: contentId
            }, params);
            var imgEl = tinyMCE.confImage.selectNode(tinyMCE.activeEditor.selection.getNode());

            tinymce.confluence.ImageUtils.updateOrInsertImageElement(propertyMap, imgEl);
        },
        cancelCallback: function () {
            AJS.Editor.Adapter.restoreSelectionState();
        },
        imageProperties: imageProperties
    });
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

tinyMCE.confLink = new ConfLink();
tinyMCE.confImage = new ConfImage();

(function($) {

    // Register commands and onclicks
    tinymce.create('tinymce.plugins.ConfluencePlugin', {
        init : function(ed, url) {

            ed.addCommand("mceConfimage", tinyMCE.confImage.openDialog);
            ed.addCommand("mceConfMacroBrowser", tinymce.confluence.macrobrowser.macroBrowserToolbarButtonClicked);

            ed.addCommand("mceConfUnlink", function (ui, val) {
                var ed = AJS.Editor.Adapter.getEditor(),
                    s = ed.selection,
                    n = val || s.getNode(),
                    $n = $(n);

                if (n.nodeName != 'A') {
                    var parent = $n.closest("a[href]");
                    if (!parent.length) {
                        return;
                    }
                    n = parent[0];
                    $n = parent;
                }
                // unlinking external links requires wrapping in the nolink macro
                var isExternal = $n.hasClass("external-link") ||
                    (!$n.attr("wikidestination") && AJS.Editor.Adapter.isExternalLink($n.attr("href"))); //manually pasted links
                if (isExternal && $n.attr("aliasspecified") != "true") {
                    AJS.safe.post(AJS.params.contextPath + "/json/convertwikimarkuptoxhtmlwithoutpagewithspacekey.action",
                        {
                            pageId: AJS.Editor.getContentId(),
                            spaceKey: AJS.params.spaceKey,
                            wikiMarkup: "{nolink:" + $n.text() + "}"
                        },
                        function (macroHtml) {
                            if (tinymce.isWebKit) {
                                // Safari has an interesting problem where selecting the link node only selects the
                                // text - we need to replace the link with dummy text and then set the new content.
                                var parent = n.parentNode,
                                nodePosition = AJS.Editor.Adapter.getChildIndex(parent, n),
                                nodeFromEnd = parent.childNodes.length - nodePosition,
                                rng = AJS.Editor.Adapter.replaceWithTextAndGetRange($n, "&nbsp;");

                                s.setContent(macroHtml);

                                // We then have to reset the cursor after Safari loses it, and refocus in the Editor.
                                // The new content might not have the same number of nodes as the removed content, so
                                // calculate the cursor position from the *end* of the parent node.
                                nodePosition = parent.childNodes.length - nodeFromEnd;
                                rng.setStart(parent, nodePosition);
                                rng.setEnd(parent, nodePosition);
                                s.setRng(rng);

                                ed.focus();
                            } else {
                                s.select(n);
                                ed.dom.remove(n);
                                s.setContent(macroHtml);
                            }
                        },
                    "json");
                }
                else {
                    s.select(n);
                    ed.execCommand("UnLink");
                }
            });

            // Register buttons
            ed.addButton("confimage", {title : "confluence.confimage_desc", cmd : "mceConfimage"});
            ed.addButton("conf_macro_browser", {title : "confluence.conf_macro_browser_desc", cmd : "mceConfMacroBrowser"});
        },

        getInfo : function () {
            return {
                longname : "Confluence TinyMCE Plugin",
                author : "Atlassian",
                authorurl : "http://www.atlassian.com/",
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        },

        /** Create the Insert Menu */
        createControl: function(n, cm) {

            switch (n) {

                case 'confinsert':
                    var c = cm.createMenuButton('rte-insert-menu-button', {
                        label : 'confluence.conf_insert_menu',
                        "class" : 'rte-insert-menu'
                    });

                    c.onRenderMenu.add(function(c, m) {

                        m.add({title : 'confluence.conf_image', cmd : "mceConfimage", "class" : "mce_menu_confimage"});
                        m.add({title : 'confluence.conf_link', cmd : "mceConflink", "class" : "mce_menu_conflink"});
                        m.add({title : 'confluence.conf_attachment', cmd: "mceConfAttachments", "class" : "mce_menu_confattachment"});

                        m.addSeparator();

                        m.add({title : 'confluence.conf_emoticon', cmd : "mceEmotion", "class" : "mce_menu_conf_emoticon"});
                        m.add({title : 'confluence.conf_symbol', cmd : "mceCharMap", "class" : "mce_menu_conf_symbol"});
                        m.add({title : 'confluence.conf_hr', cmd : "InsertHorizontalRule", "class" : "mce_menu_conf_hr"});

                        m.addSeparator();

                        var mbClickFn = tinymce.confluence.macrobrowser.macroBrowserToolbarButtonClicked;

                        $("#rte-featured-macros div").each(function() {
                            var item = $(this);
                            var macroName = item.text();
                            var className = "mce_menu_conf_macro_" + macroName;
                            m.add({
                                title : this.title,
                                "class" : className,
                                onclick : function() {
                                    mbClickFn({ presetMacroName: macroName });
                                }
                            });
                        });
                        m.add({title : 'confluence.conf_other_macros_desc', cmd : "mceConfMacroBrowser", "class" : "mce_conf_macro_browser"});

                        /**
                         * Close the menu on Escape key when focus is in or out of RTE.
                         */
                        var closeMenuOnEsc = function (e) {
                            if (e.keyCode == 27)  {
                                m.collapse();
                                return AJS.stopEvent(e);
                            }
                        };
                        var closeMenuOnEscInRTE = function (ed, e) {
                            closeMenuOnEsc(e);
                        };
                        m.onShowMenu.add(function() {
                            $(top.document).bind("keyup", closeMenuOnEsc);
                            AJS.Editor.Adapter.getEditor().onKeyUp.add(closeMenuOnEscInRTE);
                        });
                        m.onHideMenu.add(function() {
                            AJS.Editor.Adapter.getEditor().onKeyUp.remove(closeMenuOnEscInRTE);
                            $(top.document).unbind("keyup", closeMenuOnEsc);
                        });
                    });

                    // Return the new menu button instance
                    return c;
            }

            return null;
        }
    });

    // Register plugin
    tinymce.PluginManager.add("confluence", tinymce.plugins.ConfluencePlugin);
})(AJS.$);

/**
 * Implement the methods required by the com.atlassian.confluence.plugin.editor.Editor interface, adapting to a
 * TinyMCE editor implementation.
 *
 * Note that tinyMCE should not be used as it gets confused with the tinymce object. Use tinymce.EditorManager if that's
 * what you need.
 */
AJS.Editor.Adapter = (function($) { return {

    /**
     * Public interface methods on Editor.java
     */

    // called just after the DIV containing the editor is made visible
    onShowEditor : function () {},

    // called just before the DIV containing the editor is hidden
    onHideEditor : function () {},

    /**
     * Stores the currently selected range and scroll position of the editor so we can get back to to it later
     */
    storeCurrentSelectionState : function() {
        var selection = tinyMCE.activeEditor.selection,
            vp = tinyMCE.activeEditor.dom.getViewPort(tinyMCE.activeEditor.getWin()),
            rng = selection.getRng(),
            rngCopy;
        if (rng.cloneRange && typeof rng.cloneRange == "function") {
            rngCopy = rng.cloneRange();
        } else {
            // If an IE TextRange make a copy, else it will be an IE IHTMLControlRange so store it directly as it can't
            //  be copied.
            rngCopy = rng.duplicate && rng.duplicate() || rng;
        }

        AJS.Editor.Adapter.bookmark = {
            scrollX : vp.x,
            scrollY : vp.y,
            range : rngCopy
        };
    },

    /**
     * Moves the scroll position and selected range in the editor back to where it used to be.
     */
    restoreSelectionState : function() {
        var selection = tinyMCE.activeEditor.selection,
            win = tinyMCE.activeEditor.getWin(),
            bookmark = AJS.Editor.Adapter.bookmark;

        win.scrollTo(bookmark.scrollX, bookmark.scrollY);
        win.focus();
        selection.setRng(bookmark.range);
    },

    // put the text in newValue into the editor. This is called when the editor needs new
    // content -- it is *not* called to set the initial content. That should be done either by providing the
    // editor with the content as part of the initial HTML, or by calling javascript from editorOnLoad()
    setEditorValue : function (newValue) {
        AJS.log("AJS.Editor.Adapter.setEditorValue called with :" + newValue);
        if (newValue) {
            this.getEditor().setContent(newValue);
        }
    },

    /*
     *  If TinyMCE has not finished loading the page content, and the user switches tabs (from rich text to markup),
     *  block the switch, otherwise their content will be lost. (CONF-4824)
     */
    // return true if the editor is in a state where changes from rich text to markup and vice versa are allowed
    allowModeChange : function () {
        return this._tinyMceHasInit;
    },
    // called when editor mode is changed from wysiwyg to another e.g. markup
    onChangeMode : function() {},

    // return the current HTML contents of the editor. This *must* return a JavaScript string,
    // not a JavaObject wrapping a java.lang.String
    getEditorHTML : function () {
        var tinyMCEContent = "" + this.getEditor().getContent();
        // Some cleanup is done here because we have tinyMCE's cleanup turned off
        return tinyMCEContent.replace('<br mce_bogus="1">', '');
    },

    // called in the page's onLoad handler, place any initialization needed at this point here
    editorOnLoad : function () {
        this._pageEditorHasInit = true;
    },

    // return true if the contents of the editor has been modified by the user since
    // the last time editorResetContentChanged()
    editorHasContentChanged : function () {
        return this.getEditor().isDirty();
    },

    // called to reset the contents change indicator
    editorResetContentChanged : function () {
        this.getEditor().setDirty(false);
    },

    /**
     * Adds a callback that will be executed after this editor instance has been initialised.
     * @param callback
     */
    addOnInitCallback: function(callback) {
        if ($.isFunction(callback)) {
            if (this._tinyMceHasInit) {
                callback();
            }
            else {
                AJS.bind("tinymce.oninit", callback);
            }
        } else {
            throw new Error('Attempt made to register an oninit callback that is not a function. Received: ' + callback);
        }
    },

    /**
     * Binds a namespaced callback to the RTE window scroll event.
     * @param namespace used for unbinding e.g. property-panel
     * @param callback the function to run when the event occurs
     */
    bindScroll: function(namespace, callback) {
        var ed = this.getEditor();
        AJS.log("bind scroll for ed");
        AJS.log(ed);
        AJS.$(ed.getDoc()).add(ed.getWin()).bind("scroll." + namespace, callback);
    },

    /**
     * Unbinds a namespace bound to the RTE window scroll event
     * @param namespace
     */
    unbindScroll: function(namespace) {
        var ed = this.getEditor();
        AJS.$(ed.getDoc()).add(ed.getWin()).unbind("scroll." + namespace);
    },

    /**
     * Non interface methods & variables
     */
    _pageEditorHasInit: false,
    _tinyMceHasInit : false,
    _tinymcePluginInits : [],

    _tinymceOnInitCallbacksComplete : false,

    /**
     * Provides a plugin point to allow plugins to hook into the point at which the full screen editor is initialised.
     */
    fullscreenEditorOnInitCallbacks : [],

    /**
     * Returns a reference to the main editor instance.
     */
    getMainEditor: function () {
        var e = tinymce.EditorManager.editors[AJS.Editor.Adapter.settings.editor_id];
        if (!e) {
            throw new Error("Main editor has not been initialised yet and is therefore not accessible via tinymce.EditorManager.editors");
        }
        return e;
    },

    /**
     * Returns a reference to the full screen editor instance.
     */
    getFullScreenEditor: function () {
        var e = tinymce.EditorManager.editors[AJS.Editor.Adapter.settings.full_screen_editor_id];
        if (!e) {
            throw new Error("Full screen editor has not been initialised yet and is therefore not accessible via tinymce.EditorManager.editors");
        }
        return e;
    },

    getTinyMceHasInit: function () {
        return this._tinyMceHasInit && this._tinymceOnInitCallbacksComplete;
    },
    /**
     * Returns the current active editor
     */
    getEditor : function () {
        return tinyMCE.activeEditor;
    },
    /**
     * Returns the iframe containing the current active editor
     */
    getEditorFrame: function() {
        return $("#" + this.getEditor().id + "_ifr")[0];
    },

    _editorHintKeys: [
        "hints.insert_link",
        "hints.insert_image",
        "hints.insert_macro",
        "hints.insert_bullet_list",
        "hints.insert_numbered_list",
        "hints.insert_heading",
        "hints.insert_table",
        "hints.table_rows_copy",
        "hints.table_rows_cut",

        //autocomplete hints
        "hints.insert_link_recently_viewed",
        "hints.insert_link_search",
        "hints.insert_link_end",
        "hints.insert_image_on_page",
        "hints.insert_image_search",
        "hints.insert_image_end"
    ],

    setStatusbarText: function(text) {
        var span = $("http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/td.mceStatusbar span.hint");
        if (!span.length) {
            span = $("<span class='hint'></span>");
            $("td.mceStatusbar").append(span);
        }
        span.html(text);
    },

    tinyMceOnInit : function() {
        AJS.log("Adapter:tinyMceOnInit oninit callback");
        this._tinyMceHasInit = true;

        // display a random hint in the status bar
        var random = Math.floor(Math.random()*this._editorHintKeys.length);
        var hint = this._editorHintKeys[random];
        var ed = this.getEditor();
        var ie7detected = $.browser.msie && (parseInt($.browser.version) == 7);
        var editingComment = AJS.params.contentType == "comment" && AJS.params.editorMode == "richtext";
        this.setStatusbarText(ed.getLang(hint));

        AJS.bind("tinymce.oninit", function(){
            AJS.Editor.Adapter._tinymceOnInitCallbacksComplete = true;
        });

        // page editor javascript runs on dom ready and it might not have finished at this point
        // as tinymce is initialised immediately, on script load
        var counter = 0;
        (function () {
            if (AJS.Editor.Adapter._pageEditorHasInit) {
                AJS.trigger("tinymce.oninit",{editor: AJS.Editor.Adapter.getEditor()});
            }
            else {
                if (counter++ < 100) {
                    setTimeout(arguments.callee, 500);
                }
                else {
                    AJS.log("ERROR: Timed out for executing tinymce oninit callback functions");
                }
            }
        })();

        // Initial IE range -> W3C DOM Range handler
        this.IERange && this.IERange.setupSelection(ed.getDoc());

        // For some reason we need to set the focus after the rest of the stack has executed, or the cursor
        // will not be rendered in Firefox. Note: We tried setting the focus to the title for create page,
        // however this caused problems in Safari, see CONFDEV-868.
        if (!(ie7detected && editingComment)) {
            setTimeout(function() {
               ed.focus();
            }, 0);
        }
    },

    /**
     * Returns the text currently selected in the RTE
     */
    getSelectedText : function(){
        var selection = tinyMCE.activeEditor.selection;
        var selectedElement = selection.getNode();
        return selection.getRng().text || (selection.getSel() && selection.getSel().toString && selection.getSel().toString()) || "";
    },

    /**
     * Called after TinyMCE sets the content of the RTE. Any customization of the HTML can occur here.
     */
    onSetContent : function(node) {
    },

    /**
     * Called before TinyMCE gets the content of the RTE. Any un-customization of the HTML can occur here.
     */
    onBeforeGetContent : function(node) {
    },

    offset: function (element) {

        // patch for jQuery offset problem with iframes
        if ("getBoundingClientRect" in document.documentElement) {
            var offst = function (elem) {
                var box        = elem.getBoundingClientRect(),
                    doc        = elem.ownerDocument,
                    body       = doc.body,
                    docElem    = doc.documentElement,
                    clientTop  = docElem.clientTop || body.clientTop || 0,
                    clientLeft = docElem.clientLeft || body.clientLeft || 0,
                    top        = box.top  + (jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop) - clientTop,
                    left       = box.left + (jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
                return { top: top, left: left };
            };
        } else {
            offst = function (elem) {
                return jQuery(elem).offset();
            };
        }


        var $node = AJS.$(element),
            offset = offst($node[0]),
            frame = $(this.getEditorFrame()),
            frameOffset = frame.offset(),
            frameDoc = frame[0].contentWindow.document,
            frameScroll = (jQuery.support.boxModel && frameDoc.documentElement.scrollTop  || frameDoc.body.scrollTop);
        return {
            top: frameOffset.top + offset.top - frameScroll,
            left: frameOffset.left + offset.left
        };
    },

    /**
     * Returns the current range in DOM-style for any browser.
     */
    getRange : function () {
        if (this.IERange)
            return this.IERange.getSelection().getRangeAt(0);

        return tinyMCE.activeEditor.selection.getRng();
    },

    /**
     * Returns a new DOM-style range for any browser.
     */
    createRange : function () {
        var doc = tinyMCE.activeEditor.getDoc();

        if (this.IERange && this.IERange.createRange)
            return this.IERange.createRange(doc);

        return doc.createRange();
    },

    // Used to ensure that a TextNode exists under the search-text span when the ranges are set.
    HIDDEN_CHAR: "\ufeff",

    /**
     * Replaces the element with the given text, which may be empty.
     * If the collapse parameter is true, the range will be collapsed at the end of the text.
     * If the given text IS empty, it will always be collapsed.
     * @param element  jQuery-wrapped element to replace
     * @param text  string to replace autocomplete with, if undefined a blank string is used
     * @param collapseToEnd if true, collapse range to end of text, else select text
     */
    replaceWithTextAndGetRange: function(element, text, collapseToEnd) {
        text = text || "";
        collapseToEnd = collapseToEnd || !text;

        var ed = this.getEditor(), rng;
        if (tinymce.isIE) {
            element.before(text);

            rng = ed.getDoc().body.createTextRange();
            rng.moveToElementText(element[0]);
            if (collapseToEnd) {
                rng.collapse(false);
            }
            !collapseToEnd && rng.moveStart("character", -text.length) && rng.moveEnd("character", -text.length - 1);
            rng.select();
            element.remove();
        } else {
            var parent = element[0].parentNode,
                cursorPosition = this.getChildIndex(parent, element[0]),
                offset = collapseToEnd ? 1 : 0; // +!!collapse

            rng = this.createRange();
            rng.setStart(parent, cursorPosition + offset);
            rng.setEnd(parent, cursorPosition + 1);

            element.before(text || this.HIDDEN_CHAR).remove();
            ed.selection.setRng(rng);
        }

        return rng;
    },

    tinyMceEventHandler : function(e) {
        // handle tabbing in tables and lists
        if (e.keyCode == 9) {
            var ed = this.getEditor();
            var selectionNode = ed.selection.getNode();
            var inTable = ed.dom.getParent(selectionNode, 'TABLE');
            var inList = ed.dom.getParent(selectionNode, 'UL') || ed.dom.getParent(selectionNode, 'OL');

            if (inList || inTable) {
                // stop firefox's default tab behaviour
                if (tinymce.isGecko && e.type == "keypress") {
                    return AJS.stopEvent(e);
                }

                // lists have precedence over tables
                if (e.type == "keydown") {
                    var command;
                    if (inList) {
                        command = e.shiftKey ? "Outdent" : "Indent";
                    }
                    else {    // inTable
                        command = e.shiftKey ? "mceTableMoveToPrevRow" : "mceTableMoveToNextRow";
                    }
                    ed.execCommand(command);
                    return false;
                }
            }
        }

        return true; // otherwise continue with default handling
    },

    addTinyMcePluginInit: function(func) {
        this._tinymcePluginInits.push(func);
    },

    webResourcePath : "/download/resources/com.atlassian.confluence.tinymceplugin%3Atinymceeditor/",

    // gets the base url from the current location,
    getCurrentBaseUrl : function() {
        if (!this.currentBaseUrl) {
            var l = document.location;
            this.currentBaseUrl = l.protocol + "//" + l.hostname + (l.port ? ":" + l.port : "");
        }
        return this.currentBaseUrl;
    },

    // gets the static resource url prefix, which will include the caching headers
    getResourceUrlPrefix : function() {
        if (!this.resourceUrlPrefix) {
            this.resourceUrlPrefix = this.getCurrentBaseUrl() + this.getElementValue("editorPluginResourcePrefix");
        }
        return this.resourceUrlPrefix;
    },

    // gets the absolute url path to the tinymce web resources, which will include the caching headers
    getTinyMceBaseUrl : function() {
        if (!this.absoluteUrl) {
            this.absoluteUrl =  this.getResourceUrlPrefix() + this.webResourcePath + "tinymcesource/";
        }
        return this.absoluteUrl;
    },

    // For Selenium tests.
    putCursorAtPostionInElement : function (selector, position, node) {
        var ed = tinyMCE.activeEditor, doc = ed.getDoc();

        // need the #text node inside the selected element, so filter the child nodes of the selector
        var el = $(selector, node || doc);
        el = el.contents().filter(function(){ return this.nodeType == 3; })[0];
        var range = this.createRange();
        range.setStart(el, position);
        range.setEnd(el, position);
        ed.selection.setRng(range);
    },

    // Doesn't rely on AJS.params on PURPOSE as it requires DOM ready - used for quickly generating settings below
    getElementValue: function (id) {
        var e = document.getElementById(id);
        if (e) return e.value;
        return "";
    },

    /**
     * Finds the index of the supplied childNode in the parentNode
     */
    getChildIndex: function(parentNode, childNode) {
        var children = parentNode.childNodes;
        for (var i = 0, len = children.length; i < len; i++) {
            if (children[i] == childNode)
                return i;
        }
        return -1;
    },

    /**
     * Inserts a link at the position of the current range.
     * @param linkDetails, containing
     *  - href : the relative URL
     *  - destination : the part to the right of the |
     *  - alias : the part to the left of the |, may be blank
     *  - tooltip : the tooltip (optional)
     *  - aliasspecified : This should be true if the supplied alias was set by the user, false if it's the default one for the wiki link.
     *                     This is necessary because this method renders the link without going through the wiki renderer on the server.
     *                     It's impossible to know the rendered text of some wiki links without making a server call.
     * @param nodeToReplace (optional) the node to replace with the new link
     */
    insertLink: function (linkDetails, nodeToReplace) {
        var t = AJS.Editor.Adapter,
            link = t.makeLink(linkDetails);

        return t.setNodeAtCursor(link[0], nodeToReplace);
    },

    /**
     * Sets the node at the cursor to be the new element and places the cursor
     * after the element. If a nodeToReplace is passed, the cursor is assumed to
     * be at the element and it is replaced.
     * @param newElement element to put into the editor
     * @param nodeToReplace (optional) element to replace with the new one
     */
    setNodeAtCursor: function (newElement, nodeToReplace) {
        var ed = AJS.Editor.Adapter.getEditor();

        if (nodeToReplace) {
            ed.selection.select(nodeToReplace);
            ed.dom.replace(newElement, nodeToReplace, false);
        } else {
            var range = tinyMCE.activeEditor.selection.getRng();

            if (tinymce.isIE) {
                range.pasteHTML(newElement.outerHTML);
            } else {
                range.deleteContents();
                range.insertNode(newElement);
                range.setStartAfter(newElement);
                range.setEndAfter(newElement);
                ed.selection.select(newElement, false);
                ed.selection.collapse();
            }
        }
        return newElement;
    },

    makeLink: function (linkDetails) {
        var link = $(AJS.Editor.Adapter.getEditor().getDoc().createElement("a")).attr({
                href: linkDetails.href,
                linktype: "raw",
                wikidestination: linkDetails.destination

            });
        if (!linkDetails.alias) {
            linkDetails.alias = linkDetails.destination;
        }
        if (linkDetails.aliasspecified){
            link.attr({
                aliasspecified: "true"
            });
        }
        if (AJS.Editor.Adapter.isExternalLink(linkDetails.destination)) {
            link.addClass("external-link");
        }
        // originalalias needs to be specified or the RTE->wiki converter puts an alias in.
        link.attr({
            originalalias: linkDetails.alias
        });

        link.text(linkDetails.alias || linkDetails.destination);
        linkDetails.tooltip && link.attr({
            title: linkDetails.tooltip,
            wikititle: linkDetails.tooltip
        });
        return link;
    },

    isExternalLink: function(destination) { //Same check as ConfluenceLinkResolver
        return destination.match(/^(\/\/|mailto:|file:|http:|https:)/) || destination.indexOf("\\") == 0;

    },
    // Initialises the TinyMCE editor. This can be run without waiting for DOM ready if the language pack variable
    // TinyMCELang is available before calling this function.
    initTinyMce: function() {
        var t = AJS.Editor.Adapter;
        t.settings = {

            // general
            width: "100%",
            height: t.getElementValue("paramsHeight"),
            document_base_url: t.getTinyMceBaseUrl(),
            language: t.getElementValue("actionLocale"),
            button_tile_map: true,
            auto_reset_designmode: true, // recommended for tabs and hidding editors
            plugins: "table,paste,emotions,fullscreen,confluence,contextmenu,autocomplete,safari,propertypanel,keyboardshortcuts",
            gecko_spellcheck : true,

            // advanced theme params
            theme: "advanced",
            theme_advanced_buttons1: "formatselect,bold,italic,underline,strikethrough,forecolor,separator," +
                                     "table,row_before,row_after,delete_row,col_before,col_after,delete_col,delete_table,separator," +
                                     "bullist,numlist,outdent,indent,separator," +
                                     "undo,redo,separator," +
                                     "confinsert,conflink,confimage,conf_macro_browser,separator," +
                                     "search,fullscreen,contextmenu,confshortcutdialog",
            theme_advanced_buttons2: "",
            theme_advanced_buttons3: "",
            theme_advanced_toolbar_location: "top",
            theme_advanced_toolbar_align: "left",
            theme_advanced_resizing: true,
            theme_advanced_resize_horizontal: false,
            theme_advanced_statusbar_location: "bottom",
            theme_advanced_path: false,
            theme_advanced_blockformats: "h1,h2,h3,h4,h5,h6,macro_quote,macro_panel,macro_code,macro_noformat",

            // selectors for tinymce editors
            mode: "textareas",
            editor_selector: "tinymce-editor",

            // callbacks
            oninit: "AJS.Editor.Adapter.tinyMceOnInit",
            handle_event_callback: "AJS.Editor.Adapter.tinyMceEventHandler",

            // table settings
            visual: false,
            confluence_table_style: "confluenceTable",
            confluence_table_cell_style: "confluenceTd",
            confluence_table_header_style: "confluenceTh",
            confluence_table_default_rows: 4,
            confluence_table_default_cols: 3,
            confluence_table_default_heading: true,

            // output settings
            cleanup: false, // don't clean up cause we have special macro attributes which need to be added to "valid_elements"
                             // editor.selection.getContent still calls cleanup so we still should set valid_elements as
                             // well as possible.
            valid_elements : // Theoretically, most elements are allowed to have a wysiwyg parameter set.  See ExternallyDefinedConverter
                             '@[id|class|style|title|wysiwyg|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],' +
                             // We add extra link attributes to help conversion to wiki markup
                             'a[linktype|wikititle|aliasspecified|originalalias|wikidestination|rel|rev|charset|hreflang|tabindex|accesskey|type|name|href|target|title|class|onfocus|onblur],' +
                             'strong/b,em/i,strike,u,' +
                             // User paragraphs indicate a blank line.  See DefaultWysiwygConverter.isUserNewline
                             '#p[align|user],' +
                             '-ol[type|compact],-ul[type|compact],-li,br,' +
                             // The ImageConverter uses an imagetext attribute
                             'img[imagetext|longdesc|usemap|src|border|alt=|title|hspace|vspace|width|height|align],' +
                             '-sub,-sup,'+
                             // the markup tag is used to distinguish bq. markup from {quote}s.  See BlockQuoteConverter.java
                             '-blockquote[cite|markup],' +
                             '-table[border=0|cellspacing|cellpadding|width|frame|rules|height|align|summary|bgcolor|background|bordercolor],' +
                             '-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,' +
                             '#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],' +
                             '#th[colspan|rowspan|width|height|align|valign|scope],caption,' +
                             // Extra Div elements are added to macro divs to help conversion to wiki markup
                             '-div[macroname|macrostarttag|macrohasbody|wikihasnewlinebeforebody|wikihasnewlineafterbody|wikihasprecedingnewline|wikihastrailingnewline],' +
                             '-span,-code,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],' +
                             '-font[face|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],object[classid|width|height|codebase|*],param[name|value],' +
                             'embed[type|width|height|src|*],script[src|type],map[name],area[shape|coords|href|alt|target],bdo,button,col[align|char|charoff|span|valign|width],' +
                             'colgroup[align|char|charoff|span|valign|width],dfn,fieldset,form[action|accept|accept-charset|enctype|method],' +
                             'input[accept|alt|checked|disabled|maxlength|name|readonly|size|src|type|value],kbd,label[for],legend,noscript,' +
                             'optgroup[label|disabled],option[disabled|label|selected|value],q[cite],samp,select[disabled|multiple|name|size],small,' +
                             'textarea[cols|rows|disabled|name|readonly],tt,var,big',
            force_p_newlines: true, // default
            force_br_newlines: false, // default

            // layout settings
            body_class: "wiki-content",
            content_css: t.getResourceUrlPrefix() + "/styles/combined.css?forWysiwyg=true&spaceKey=" + encodeURI(t.getElementValue("spaceKey")),
            popup_css: t.getResourceUrlPrefix() + "/styles/combined.css?spaceKey=" + encodeURI(t.getElementValue("spaceKey")),

            resource_prefix: t.getResourceUrlPrefix(),

            // confluence-specific settings
            context_path: t.getElementValue("contextPath"),
            plugin_action_base_path: t.getElementValue("contextPath") + "/plugins/tinymce",
            page_id: t.getElementValue("pageId"),
            draft_type: null,
            form_name: t.getElementValue("formName"),
            space_key: encodeURI(t.getElementValue("spaceKey")),
            confluence_popup_width: 620,
            confluence_popup_height: 550,
            elements: "wysiwygTextarea",
            editor_id: "wysiwygTextarea",
            full_screen_editor_id: "mce_fullscreen"
        };

        // alter settings for drafts
        if (t.settings.page_id == 0) {
            t.settings.page_id = null;
            t.settings.draft_type = t.getElementValue("draftType");
        }

        // load the i18n keys for tinymce
        if (typeof TinyMCELang != "undefined") {
            var ctrlTrans = TinyMCELang[t.settings.language].ctrl_key + "\\+";
            var shiftTrans = TinyMCELang[t.settings.language].shift_key + "\\+";
            for (var key in TinyMCELang) {
                // make tool-tips mac friendly
                var langGroup = TinyMCELang[key];
                for (var strKey  in langGroup) {
                    if(tinymce.isMac) {
                        langGroup[strKey] = langGroup[strKey].replace(RegExp(ctrlTrans, 'g'), "\u2318");
                        langGroup[strKey] = langGroup[strKey].replace(RegExp(shiftTrans, 'g'), "\u21E7");
                    }
                }

                tinymce.EditorManager.addI18n(key, TinyMCELang[key]);
            }
        }
        else {
            AJS.log("ERROR: could not find the TinyMCE language pack");
        }

        // plugin point for tinymce plugins to configure settings
        for (var i = 0, ii = t._tinymcePluginInits.length; i < ii; i++) {
            if (typeof t._tinymcePluginInits[i] == "function") {
                t._tinymcePluginInits[i](t.settings);
            }
        }

        tinyMCE.init(t.settings);

        AJS.log("Adapter:after editor manager init");
        tinyMCE.onBeforeUnload.addToTop(AJS.Editor.handleUnload);
        tinymce.confluence.macrobrowser.onTinyMceInitialised(t.getEditor());
        t.editorResetContentChanged(); // so we don't trigger drafts due to macro manipulation
    }


};})(AJS.$);

// if there is a body, we can assume that the scripts are at the bottom
// and init TinyMCE without waiting for DOM ready
if (document.getElementsByTagName("body").length) {
    AJS.Editor.Adapter.initTinyMce();
}
else {
    AJS.toInit(AJS.Editor.Adapter.initTinyMce);
}


/**
 * Confluence property panels for images and links.
 */
(function($) {
    var handlers = new Array();
    AJS.bind("add-handler.property-panel", function (e, data) {
        handlers.push(data);
    });


    tinymce.create('tinymce.plugins.PropertyPanel', {
        init : function(ed) {
            /*
              A single selection event might have several contexts:
              - No current property panel
              -- Selected element that DOESN'T fire a panel
              -- Selected element that DOES fire a panel
              - Current property panel
              -- Selected element that DOESN'T fire a panel
              -- Selected element that DOES fire a panel
              --- Selected the anchor of the CURRENT property panel
              --- Selected a different element that DOES fire a panel
              ---- Selected a different element that DOES fire a panel of the SAME type
              ---- Selected a different element that DOES fire a panel of a DIFFERENT type

              To begin with it will be the responsibility of the element-specific code (img/a/etc) to determine the context;
              if enough overlap between IMG and A is found it can be centralized here.
             */
            AJS.log("init property panel plugin");
            var boundElement,
            isRightClick = function (e) {
                if (e.type != "click") return false;
                if (e.which)  return (e.which == 3);
                if (e.button) return (e.button == 2);
            },
            getClosestAnchor = function($element) {
                if ($element.is("img")) {
                    return $element[0];
                }

                var closest = $element.closest("a,table");
                if (closest.length) {
                    return closest[0];
                }

                return "";
            },
            handler = function (ed, e, focusedEl) {
                var data = {
                        focusedEl: focusedEl,
                        focusedNodeName: focusedEl.nodeName && focusedEl.nodeName.toLowerCase(),
                        ed: ed,
                        e: e
                    };
                var containerEl = getClosestAnchor($(focusedEl));
                data.containerEl = containerEl;

                AJS.trigger("user-blurred-rte-element", data);
                if (containerEl && !isRightClick(e) && !isPanelShowing()) {
                    for (var i = 0, len = handlers.length; i < len; i++) {
                        if (handlers[i].canHandleElement($(containerEl))) {
                            AJS.log("PropertyPanel.create: Creating a panel for: " + handlers[i].name);
                            return handlers[i].handle(data);
                        }
                    }
                }
            },
            isPanelShowing = function () {
                return !!AJS.Confluence.PropertyPanel.current;
            };
            //this gets around an ie bug, ie does not seem to fire the onclick event if a selection has been added to an element.
            if(tinymce.isIE) {
                ed.onMouseDown.add(function(ed, e) {
                //avoid memory leaks kill any previous bound events
                //using jquery to hopefully avoid interacting with any editor eve
                AJS.$(boundElement).unbind('mouseup');
                    boundElement = e.target;
                    if(boundElement.nodeName == "IMG") {
                        AJS.$(boundElement).bind('mouseup',function() {
                            handler(ed, e, e.target);
                        });
                    }
                });
            }

            ed.onClick.add(function(ed, e) {
                handler(ed, e, e.target);
            });
            ed.onKeyUp.addToTop(function (ed,e,o) {
                if (e.keyCode === 27) return; // ignore esc, it's handled by keydown listener
                handler(ed, e, ed.selection.getNode());
            });

            AJS.bind("user-blurred-rte-element", function (e, data) {
                if (isPanelShowing()) {
                    if (!AJS.Confluence.PropertyPanel.current.hasAnchorChanged(data.containerEl)) {
                        AJS.Confluence.PropertyPanel.destroy();
                    }
                }
            });
            AJS.bind("created.property-panel", function (e, data) {
                AJS.Editor.Adapter.bindScroll("property-panel", function (e) {
                    AJS.Confluence.PropertyPanel.destroy();
                });
                AJS.$(ed.getDoc()).bind("keydown.property-panel.escape", function (e) {
                    if (e.keyCode === 27 && isPanelShowing()) { // esc key
                        AJS.Confluence.PropertyPanel.destroy();
                    }
                });
            });
            AJS.bind("destroyed.property-panel", function (e, data) {
                AJS.Editor.Adapter.unbindScroll("property-panel");
                AJS.$(ed.getDoc()).unbind("keydown.property-panel.escape");
            });
        },

        getInfo : function() {
            return {
                longname : 'Image and Link Property Panels',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com/',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('propertypanel', tinymce.plugins.PropertyPanel);
})(AJS.$);

(function($) {
    // Keep a count of the number of panels opened, so the "Goto location" button always opens the link location in a
    // new named window
    var linkPanelCounter = 0;

    AJS.Confluence.PropertyPanel.Link = {
        name : "link",

        canHandleElement : function ($element) {
            return $element.is("a");
        },

        handle : function(data) {
            var link = data.containerEl;

            var ed = data.ed,
                getLang = function(key) { return AJS.Editor.Adapter.getEditor().getLang(key); },
                buttons = [{
                    className: "link-property-panel-goto-button",
                    text: getLang("propertypanel.links_goto"),
                    tooltip: link.href,
                    href: link.href,
                    click: function () {
                        AJS.Confluence.PropertyPanel.destroy();

                        // Give the window a name to help testing, but make sure the name is unique.
                        // Note: IE doesn't allow named windows; just open an unnamed one.
                        var windowName = tinymce.isIE ? "_blank" : "confluence-goto-link-" + AJS.params.pageId + "-" + linkPanelCounter;

                        // mailto links in IE can return null sometimes for window.open
                        // see http://msdn.microsoft.com/en-us/library/ms536651(VS.85).aspx
                        var win = window.open(link.href, windowName);
                        if (win) win.focus();

                    }
                }, {
                    className: "link-property-panel-edit-button",
                    text: getLang("propertypanel.links_edit"),
                    tooltip: getLang("propertypanel.links_edit_tooltip"),
                    click: function () {
                        AJS.Confluence.PropertyPanel.destroy();
                        ed.selection.select(link);
                        AJS.Editor.LinkBrowser.open();
                    }
                }, {
                    className: "link-property-panel-unlink-button",
                    text: getLang("propertypanel.links_unlink"),
                    tooltip: getLang("propertypanel.links_unlink_tooltip"),
                    click: function () {
                        AJS.Confluence.PropertyPanel.destroy();
                        ed.execCommand("mceConfUnlink", false, link);
                        ed.focus();
                    }
                }];

            AJS.Confluence.PropertyPanel.createFromButtonModel(this.name, link, buttons);

            linkPanelCounter++;

            // Don't follow the link
            data.e.preventDefault();
        }
    };
    AJS.trigger("add-handler.property-panel", AJS.Confluence.PropertyPanel.Link);
})(AJS.$);

(function($) {

    /**
     * Update the image element to match the ImageProperties passed in, relocate the property panel to match the
     * resized image, and cleanup any image-selection handles.
     */
    var updateImageElement = function (imageProps) {
        var ppanel = AJS.Confluence.PropertyPanel.current,
            $img = $(ppanel.anchor),
            oldSrc = $img.attr("src"),
            oldHeight = $img.height();

        // Turn off scroll binding, in case an img resize causes a scroll event, and rebind after the resize.
        ppanel.updating = true;
        var rebindAndSnap = function () {
            ppanel.updating = false;
            ppanel.snapToElement({
                animate: true,
                animateDuration: 100
            });
        };

        tinymce.confluence.ImageUtils.updateImageElement($img, imageProps);
        if (tinymce.isGecko) {
            // Repaint to clear the image handles from their old positions.
            AJS.Editor.Adapter.getEditor().execCommand('mceRepaint', false);
        }

        if (imageProps.src != oldSrc) {
            // Image source changed - may have to wait for height to change to snapToElement
            var snapInterval = setInterval(function() {
                var newHeight = $img.height();
                if (newHeight != oldHeight) {
                    AJS.log("updateImageElement : height changed after image src change - " + oldHeight + " to " + newHeight);
                    clearTimeout(snapInterval);
                    snapInterval = null;
                    rebindAndSnap();
                }
            }, 10);
            setTimeout(function() {
                if (snapInterval) {
                    clearTimeout(snapInterval);
                    snapInterval = null;
                    rebindAndSnap();
                }
            }, 1000);
        } else {
            rebindAndSnap();
        }
    },

    /**
     * Unselects other size-related buttons and unflags thumbnail if anything but the thumbnail button was pressed.
     */
    clearOtherImageSizeButtons = function (selectedButton) {
        selectedButton = $(selectedButton);
        var buttons = selectedButton.parent().find(".image-size-small, .image-size-medium, .image-size-large, .image-size-original");
        buttons.removeClass("selected");
        selectedButton.addClass("selected");
    },

    /**
     * Pixel sizes for image resize buttons.
     */
    sizes = {
        small : 100,
        medium : 200,
        large : 300
    };

    AJS.Confluence.PropertyPanel.Image = {
        name : "image",

        canHandleElement : function ($element) {
           return ($element.is("img") && !$element.hasClass("editor-bodyless-macro"));
        },

        handle : function (data) {
            var img = data.containerEl,
                $img = $(img),
                imageProps = tinymce.confluence.ImageProperties(img);
            if (!imageProps) {
                return;         // not a "proper" image, e.g. an emoticon
            }

            var getLang = function(key) { return AJS.Editor.Adapter.getEditor().getLang(key); },
                isThumbnailable = !tinymce.confluence.ImageUtils.isRemoteImg(imageProps.destination),
                maxDimension = ($img.width() >= $img.height()) ? "width" : "height",
                minDimension = (maxDimension == "height") ? "width" : "height",
                imageSizeButton = function (size) {
                    return {
                        className: "image-size-" + size,
                        text: getLang("propertypanel.images_" + size),
                        tooltip: getLang("propertypanel.images_" + size + "_tooltip"),
                        click : function (a) {
                            delete imageProps[minDimension];
                            imageProps[maxDimension] = sizes[size];

                            imageProps.thumbnail = (size != "large") ? isThumbnailable : false;
                            clearOtherImageSizeButtons(a);
                            updateImageElement(imageProps);
                        },
                        selected: imageProps[maxDimension] == sizes[size]
                    };
                },
                buttons = [
                    imageSizeButton("small"),
                    imageSizeButton("medium"),
                    imageSizeButton("large"),
                    {
                        className: "image-size-original",
                        text: getLang("propertypanel.images_original"),
                        tooltip: getLang("propertypanel.images_original_tooltip"),
                        click: function (a) {
                            delete imageProps.width;
                            delete imageProps.height;
                            imageProps.thumbnail = false;
                            clearOtherImageSizeButtons(a);
                            updateImageElement(imageProps);
                        },
                        selected: !imageProps.width && !imageProps.height && !imageProps.thumbnail
                    },
                    null,   // separator
                    {
                        className: "image-border-toggle",
                        text: getLang("propertypanel.images_border"),
                        tooltip: getLang("propertypanel.images_border_tooltip"),
                        click: function (a) {
                            imageProps.border = +!imageProps.border || false;   // either 1 or false
                            $(a).toggleClass("selected", imageProps.border);

                            updateImageElement(imageProps);
                        },
                        selected: (imageProps.border || imageProps.border == 0)
                    }
                ];
            AJS.Confluence.PropertyPanel.createFromButtonModel(this.name, img, buttons, { anchorIframe: AJS.Editor.Adapter.getEditorFrame() });

            // Store the state of the image so it can be updated later
            AJS.Confluence.PropertyPanel.current.imageProps = imageProps;
        }
    };
    AJS.trigger("add-handler.property-panel", AJS.Confluence.PropertyPanel.Image);
})(AJS.$);
/*
 * Confluence Keyboard shortcuts for the editor
 */
tinymce.confluence.keyboardshortcuts = (function($) { return {
    savePage: function () {
        this.settings.save_onsavecallback && this.settings.save_onsavecallback(); //CONF-21128
        $(".submit-buttons input[name='confirm']").eq(0).click();
    },

    openShortcutDialog: function () {
        $("#keyboard-shortcuts-link").click();
    }
};})(AJS.$);

(function($) {
	tinymce.create('tinymce.plugins.KeyboardShortcutsPlugin', {
        init : function(ed) {
            AJS.log("Init Keyboard shortcuts plugin");
            ed.addCommand("mceConfSavePage", tinymce.confluence.keyboardshortcuts.savePage);
            ed.addCommand("mceConfShortcutDialog", tinymce.confluence.keyboardshortcuts.openShortcutDialog);

            ed.addButton("confshortcutdialog", {title : "confluence.conf_shortcuts_help_desc", cmd : "mceConfShortcutDialog", "class" : "mce_conf_keyboard_shortcut"});

            // Shortcut keys
            ed.addShortcut("ctrl+m", ed.getLang("confluence.confimage_desc"), "mceConfimage");
            ed.addShortcut("ctrl+shift+a", ed.getLang("confluence.conf_macro_browser_desc"), "mceConfMacroBrowser");
            ed.addShortcut("ctrl+shift+i", ed.getLang("http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/table.desc"), function() {
                return ed.execCommand("mceInsertTable", true); // need to pass in true to open the popup
            });

            ed.addShortcut("ctrl+shift+f", ed.getLang("http://10.20.160.198/wiki/s/en/2166/34/3.5.9/_/download/batch/com.atlassian.confluence.tinymceplugin:editor-resources/fullscreen.desc"), "mceFullScreen");
            ed.addShortcut("ctrl+shift+b", ed.getLang("advanced.bullist_desc"), "InsertUnorderedList");
            ed.addShortcut("ctrl+shift+n", ed.getLang("advanced.numlist_desc"), "InsertOrderedList");
            ed.addShortcut("ctrl+shift+s", ed.getLang("advanced.striketrough_desc"), "Strikethrough");

            ed.addShortcut("ctrl+shift+c", ed.getLang("table.copy_row_desc"), "mceTableCopyRow");
            ed.addShortcut("ctrl+shift+x", ed.getLang("table.cut_row_desc"), "mceTableCutRow");
            ed.addShortcut("ctrl+shift+v", ed.getLang("table.paste_row_before_desc"), "mceTablePasteRowBefore");
            ed.addShortcut('ctrl+s', '', 'mceConfSavePage');
            ed.addShortcut('ctrl+alt+q', '', ['FormatBlock', false, 'macro_quote']);
        },

        getInfo : function () {
            return {
                longname : "Confluence Keyboard Shortcuts Plugin",
                author : "Atlassian",
                authorurl : "http://www.atlassian.com/",
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add("keyboardshortcuts", tinymce.plugins.KeyboardShortcutsPlugin);
})();

/*
  DOM Ranges for Internet Explorer (m2)

  Copyright (c) 2009 Tim Cameron Ryan
  Released under the MIT/X License
 */

/*
  Range reference:
    http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html
    http://mxr.mozilla.org/mozilla-central/source/content/base/src/nsRange.cpp
    https://developer.mozilla.org/En/DOM:Range
  Selection reference:
    http://trac.webkit.org/browser/trunk/WebCore/page/DOMSelection.cpp
  TextRange reference:
    http://msdn.microsoft.com/en-us/library/ms535872.aspx
  Other links:
    http://jorgenhorstink.nl/test/javascript/range/range.js
    http://jorgenhorstink.nl/2006/07/05/dom-range-implementation-in-ecmascript-completed/
    http://dylanschiemann.com/articles/dom2Range/dom2RangeExamples.html
*/

//[TODO] better exception support

(function () {	// sandbox

/*
  DOM functions
 */

var DOMUtils = {
	findChildPosition: function (node) {
		for (var i = 0; node = node.previousSibling; i++)
			continue;
		return i;
	},
	isDataNode: function (node) {
		return node && node.nodeValue !== null && node.data !== null;
	},
	isAncestorOf: function (parent, node) {
		return !DOMUtils.isDataNode(parent) &&
		    (parent.contains(DOMUtils.isDataNode(node) ? node.parentNode : node) ||
		    node.parentNode == parent);
	},
	isAncestorOrSelf: function (root, node) {
		return DOMUtils.isAncestorOf(root, node) || root == node;
	},
	findClosestAncestor: function (root, node) {
		if (DOMUtils.isAncestorOf(root, node))
			while (node && node.parentNode != root)
				node = node.parentNode;
		return node;
	},
	getNodeLength: function (node) {
		return DOMUtils.isDataNode(node) ? node.length : node.childNodes.length;
	},
	splitDataNode: function (node, offset) {
		if (!DOMUtils.isDataNode(node))
			return false;
		var newNode = node.cloneNode(false);
		node.deleteData(offset, node.length);
		newNode.deleteData(0, offset);
		node.parentNode.insertBefore(newNode, node.nextSibling);
	}
};

/*
  Text Range utilities
  functions to simplify text range manipulation in ie
 */

var TextRangeUtils = {
	convertToDOMRange: function (textRange, document) {
		function adoptBoundary(domRange, textRange, bStart) {
			// iterate backwards through parent element to find anchor location
			var cursorNode = document.createElement('a'), cursor = textRange.duplicate();
			cursor.collapse(bStart);
			var parent = cursor.parentElement();
			do {
				parent.insertBefore(cursorNode, cursorNode.previousSibling);
				cursor.moveToElementText(cursorNode);
			} while (cursor.compareEndPoints(bStart ? 'StartToStart' : 'StartToEnd', textRange) > 0 && cursorNode.previousSibling);

			// when we exceed or meet the cursor, we've found the node
			if (cursor.compareEndPoints(bStart ? 'StartToStart' : 'StartToEnd', textRange) == -1 && cursorNode.nextSibling) {
				// data node
				cursor.setEndPoint(bStart ? 'EndToStart' : 'EndToEnd', textRange);
				domRange[bStart ? 'setStart' : 'setEnd'](cursorNode.nextSibling, cursor.text.length);
			} else {
				// element
				domRange[bStart ? 'setStartBefore' : 'setEndBefore'](cursorNode);
			}
			cursorNode.parentNode.removeChild(cursorNode);
		}
		// return a DOM range
		var domRange = new DOMRange(document);
		adoptBoundary(domRange, textRange, true);
		adoptBoundary(domRange, textRange, false);
		return domRange;
	},

	convertFromDOMRange: function (domRange) {
		function adoptEndPoint(textRange, domRange, bStart) {
			// find anchor node and offset
			var container = domRange[bStart ? 'startContainer' : 'endContainer'];
			var offset = domRange[bStart ? 'startOffset' : 'endOffset'], textOffset = 0;
			var anchorNode = DOMUtils.isDataNode(container) ? container : container.childNodes[offset];
			var anchorParent = DOMUtils.isDataNode(container) ? container.parentNode : container;
			// visible data nodes need a text offset
			if (container.nodeType == 3 || container.nodeType == 4)
				textOffset = offset;

			// create a cursor element node to position range (since we can't select text nodes)
			var cursorNode = domRange._document.createElement('a');
			anchorParent.insertBefore(cursorNode, anchorNode);
			var cursor = domRange._document.body.createTextRange();
			cursor.moveToElementText(cursorNode);
			cursorNode.parentNode.removeChild(cursorNode);
			// move range
			textRange.setEndPoint(bStart ? 'StartToStart' : 'EndToStart', cursor);
			textRange[bStart ? 'moveStart' : 'moveEnd']('character', textOffset);
		}

		// return an IE text range
		var textRange = domRange._document.body.createTextRange();
		adoptEndPoint(textRange, domRange, true);
		adoptEndPoint(textRange, domRange, false);
		return textRange;
	}
};

/*
  DOM Range
 */

function DOMRange(document) {
	// save document parameter
	this._document = document;

	// initialize range
//[TODO] this should be located at document[0], document[0]
	this.startContainer = this.endContainer = document.body;
	this.endOffset = DOMUtils.getNodeLength(document.body);
}
DOMRange.START_TO_START = 0;
DOMRange.START_TO_END = 1;
DOMRange.END_TO_END = 2;
DOMRange.END_TO_START = 3;

DOMRange.prototype = {
	// public properties
	startContainer: null,
	startOffset: 0,
	endContainer: null,
	endOffset: 0,
	commonAncestorContainer: null,
	collapsed: false,
	// private properties
	_document: null,

	// private methods
	_refreshProperties: function () {
		// collapsed attribute
		this.collapsed = (this.startContainer == this.endContainer && this.startOffset == this.endOffset);
		// find common ancestor
		var node = this.startContainer;
		while (node && node != this.endContainer && !DOMUtils.isAncestorOf(node, this.endContainer))
			node = node.parentNode;
		this.commonAncestorContainer = node;
	},

	// range methods
//[TODO] collapse if start is after end, end is before start
	setStart: function(container, offset) {
		this.startContainer = container;
		this.startOffset = offset;
		this._refreshProperties();
	},
	setEnd: function(container, offset) {
		this.endContainer = container;
		this.endOffset = offset;
		this._refreshProperties();
	},
	setStartBefore: function (refNode) {
		// set start to beore this node
		this.setStart(refNode.parentNode, DOMUtils.findChildPosition(refNode));
	},
	setStartAfter: function (refNode) {
		// select next sibling
		this.setStart(refNode.parentNode, DOMUtils.findChildPosition(refNode) + 1);
	},
	setEndBefore: function (refNode) {
		// set end to beore this node
		this.setEnd(refNode.parentNode, DOMUtils.findChildPosition(refNode));
	},
	setEndAfter: function (refNode) {
		// select next sibling
		this.setEnd(refNode.parentNode, DOMUtils.findChildPosition(refNode) + 1);
	},
	selectNode: function (refNode) {
		this.setStartBefore(refNode);
		this.setEndAfter(refNode);
	},
	selectNodeContents: function (refNode) {
		this.setStart(refNode, 0);
		this.setEnd(refNode, DOMUtils.getNodeLength(refNode));
	},
	collapse: function (toStart) {
		if (toStart)
			this.setEnd(this.startContainer, this.startOffset);
		else
			this.setStart(this.endContainer, this.endOffset);
	},

	// editing methods
	cloneContents: function () {
		// clone subtree
		return (function cloneSubtree(iterator) {
			for (var node, frag = document.createDocumentFragment(); node = iterator.next(); ) {
				node = node.cloneNode(!iterator.hasPartialSubtree());
				if (iterator.hasPartialSubtree())
					node.appendChild(cloneSubtree(iterator.getSubtreeIterator()));
				frag.appendChild(node);
			}
			return frag;
		})(new RangeIterator(this));
	},
	extractContents: function () {
		// cache range and move anchor points
		var range = this.cloneRange();
		if (this.startContainer != this.commonAncestorContainer)
			this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
		this.collapse(true);
		// extract range
		return (function extractSubtree(iterator) {
			for (var node, frag = document.createDocumentFragment(); node = iterator.next(); ) {
				iterator.hasPartialSubtree() ? node = node.cloneNode(false) : iterator.remove();
				if (iterator.hasPartialSubtree())
					node.appendChild(extractSubtree(iterator.getSubtreeIterator()));
				frag.appendChild(node);
			}
			return frag;
		})(new RangeIterator(range));
	},
	deleteContents: function () {
		// cache range and move anchor points
		var range = this.cloneRange();
		if (this.startContainer != this.commonAncestorContainer)
			this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
		this.collapse(true);
		// delete range
		(function deleteSubtree(iterator) {
			while (iterator.next())
				iterator.hasPartialSubtree() ? deleteSubtree(iterator.getSubtreeIterator()) : iterator.remove();
		})(new RangeIterator(range));
	},
	insertNode: function (newNode) {
		// set original anchor and insert node
		if (DOMUtils.isDataNode(this.startContainer)) {
			DOMUtils.splitDataNode(this.startContainer, this.startOffset);
			this.startContainer.parentNode.insertBefore(newNode, this.startContainer.nextSibling);
		} else {
			this.startContainer.insertBefore(newNode, this.startContainer.childNodes[this.startOffset]);
		}
		// resync start anchor
		this.setStart(this.startContainer, this.startOffset);
	},
	surroundContents: function (newNode) {
		// extract and surround contents
		var content = this.extractContents();
		this.insertNode(newNode);
		newNode.appendChild(content);
		this.selectNode(newNode);
	},

	// other methods
	compareBoundaryPoints: function (how, sourceRange) {
		// get anchors
		var containerA, offsetA, containerB, offsetB;
		switch (how) {
		    case DOMRange.START_TO_START:
		    case DOMRange.START_TO_END:
			containerA = this.startContainer;
			offsetA = this.startOffset;
			break;
		    case DOMRange.END_TO_END:
		    case DOMRange.END_TO_START:
			containerA = this.endContainer;
			offsetA = this.endOffset;
			break;
		}
		switch (how) {
		    case DOMRange.START_TO_START:
		    case DOMRange.END_TO_START:
			containerB = sourceRange.startContainer;
			offsetB = sourceRange.startOffset;
			break;
		    case DOMRange.START_TO_END:
		    case DOMRange.END_TO_END:
			containerB = sourceRange.endContainer;
			offsetB = sourceRange.endOffset;
			break;
		}

		// compare
		return containerA.sourceIndex < containerB.sourceIndex ? -1 :
		    containerA.sourceIndex == containerB.sourceIndex ?
		        offsetA < offsetB ? -1 : offsetA == offsetB ? 0 : 1
		        : 1;
	},
	cloneRange: function () {
		// return cloned range
		var range = new DOMRange(this._document);
		range.setStart(this.startContainer, this.startOffset);
		range.setEnd(this.endContainer, this.endOffset);
		return range;
	},
	detach: function () {
//[TODO] Releases Range from use to improve performance.
	},
	toString: function () {
//        return "Have a string, muggles!";
		return TextRangeUtils.convertFromDOMRange(this).text;
	},
	createContextualFragment: function (tagString) {
		// parse the tag string in a context node
		var content = (DOMUtils.isDataNode(this.startContainer) ? this.startContainer.parentNode : this.startContainer).cloneNode(false);
		content.innerHTML = tagString;
		// return a document fragment from the created node
		for (var fragment = this._document.createDocumentFragment(); content.firstChild; )
			fragment.appendChild(content.firstChild);
		return fragment;
	}
};

/*
  Range iterator
 */

function RangeIterator(range) {
	this.range = range;
	if (range.collapsed)
		return;

//[TODO] ensure this works
	// get anchors
	var root = range.commonAncestorContainer;
	this._next = range.startContainer == root && !DOMUtils.isDataNode(range.startContainer) ?
	    range.startContainer.childNodes[range.startOffset] :
	    DOMUtils.findClosestAncestor(root, range.startContainer);
	this._end = range.endContainer == root && !DOMUtils.isDataNode(range.endContainer) ?
	    range.endContainer.childNodes[range.endOffset] :
	    DOMUtils.findClosestAncestor(root, range.endContainer).nextSibling;
}

RangeIterator.prototype = {
	// public properties
	range: null,
	// private properties
	_current: null,
	_next: null,
	_end: null,

	// public methods
	hasNext: function () {
		return !!this._next;
	},
	next: function () {
		// move to next node
		var current = this._current = this._next;
		this._next = this._current && this._current.nextSibling != this._end ?
		    this._current.nextSibling : null;

		// check for partial text nodes
		if (DOMUtils.isDataNode(this._current)) {
			if (this.range.endContainer == this._current)
				(current = current.cloneNode(true)).deleteData(this.range.endOffset, current.length - this.range.endOffset);
			if (this.range.startContainer == this._current)
				(current = current.cloneNode(true)).deleteData(0, this.range.startOffset);
		}
		return current;
	},
	remove: function () {
		// check for partial text nodes
		if (DOMUtils.isDataNode(this._current) &&
		    (this.range.startContainer == this._current || this.range.endContainer == this._current)) {
			var start = this.range.startContainer == this._current ? this.range.startOffset : 0;
			var end = this.range.endContainer == this._current ? this.range.endOffset : this._current.length;
			this._current.deleteData(start, end - start);
		} else
			this._current.parentNode.removeChild(this._current);
	},
	hasPartialSubtree: function () {
		// check if this node be partially selected
		return !DOMUtils.isDataNode(this._current) &&
		    (DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer) ||
		        DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer));
	},
	getSubtreeIterator: function () {
		// create a new range
		var subRange = new DOMRange(this.range._document);
		subRange.selectNodeContents(this._current);
		// handle anchor points
		if (DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer))
			subRange.setStart(this.range.startContainer, this.range.startOffset);
		if (DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer))
			subRange.setEnd(this.range.endContainer, this.range.endOffset);
		// return iterator
		return new RangeIterator(subRange);
	}
};

/*
  DOM Selection
 */

//[NOTE] This is a very shallow implementation of the Selection object, based on Webkit's
// implementation and without redundant features. Complete selection manipulation is still
// possible with just removeAllRanges/addRange/getRangeAt.

function DOMSelection(document) {
	// save document parameter
	this._document = document;

	// add DOM selection handler
	var selection = this;
	document.attachEvent('onselectionchange', function () { selection._selectionChangeHandler(); });
}

DOMSelection.prototype = {
	// public properties
	rangeCount: 0,
	// private properties
	_document: null,

	// private methods
	_selectionChangeHandler: function () {
		// check if there exists a range
	
		this.rangeCount = this._selectionExists(this._document.selection.createRange()) ? 1 : 0;
	},
	_selectionExists: function (textRange) {
        //ATLASSIAN: issue with selectiona round images, xhtml branch has removed references to this.
    	//looked over it, does not seem to be fully tested yet.
    	//so hopefully we can just be done with this file soon
	    if(!textRange.compareEndPoints)    {
	        return false;
	    }
		// checks if a created text range exists or is an editable cursor
		return textRange.compareEndPoints('StartToEnd', textRange) != 0 ||
		    textRange.parentElement().isContentEditable;
	},

	// public methods
	addRange: function (range) {
		// add range or combine with existing range
		var selection = this._document.selection.createRange(), textRange = TextRangeUtils.convertFromDOMRange(range);
		if (!this._selectionExists(selection))
		{
			// select range
			textRange.select();
		}
		else
		{
			// only modify range if it intersects with current range
			if (textRange.compareEndPoints('StartToStart', selection) == -1)
				if (textRange.compareEndPoints('StartToEnd', selection) > -1 &&
				    textRange.compareEndPoints('EndToEnd', selection) == -1)
					selection.setEndPoint('StartToStart', textRange);
			else
				if (textRange.compareEndPoints('EndToStart', selection) < 1 &&
				    textRange.compareEndPoints('EndToEnd', selection) > -1)
					selection.setEndPoint('EndToEnd', textRange);
			selection.select();
		}
	},
	removeAllRanges: function () {
		// remove all ranges
		this._document.selection.empty();
	},
	getRangeAt: function (index) {
		// return any existing selection, or a cursor position in content editable mode
		var textRange = this._document.selection.createRange();
		if (this._selectionExists(textRange)) {
			return TextRangeUtils.convertToDOMRange(textRange, this._document);
        }
		return null;
	},
	toString: function () {
		// get selection text
		return this._document.selection.createRange().text;
	}
};

/*
  Scripting hooks - changed from window-level functions for Confluence safety.

  createRange, setupSelection and getSelection replace the existing IERange hooks, while textRangeUtils exposes this
  library's helper for converting between DOM and Text Ranges.
 */
if (!window.getSelection) {
    AJS.log("Adding IERange to AJS.Editor.Adapter");

    AJS.Editor.Adapter.IERange = {
        createRange : function (document) {
            return new DOMRange(document);
        },
        setupSelection : function(document) {
            this.selection = new DOMSelection(document);
        },
        getSelection : function () {
            return this.selection;
        },
        textRangeUtils : TextRangeUtils
    };
}
//[TODO] expose DOMRange/DOMSelection to window.?

})();

