/**
 * WinBox.js v0.2.82 (Bundle)
 * Author and Copyright: Thomas Wilkerling
 * Licence: Apache-2.0
 * Hosted by Nextapps GmbH
 * https://github.com/nextapps-de/winbox
 */ (function() {
    "use strict";
    var e, aa = document.createElement("style");
    aa.innerHTML = "@keyframes wb-fade-in{0%{opacity:0}to{opacity:.85}}.winbox{position:fixed;left:0;top:0;background:#0050ff;box-shadow:0 14px 28px rgba(0,0,0,.25),0 10px 10px rgba(0,0,0,.22);transition:width .3s,height .3s,left .3s,top .3s;transition-timing-function:cubic-bezier(.3,1,.3,1);contain:layout size;text-align:left;touch-action:none}.wb-body,.wb-header{position:absolute;left:0}.wb-header{top:0;width:100%;height:35px;line-height:35px;color:#fff;overflow:hidden;z-index:1}.wb-body{top:35px;right:0;bottom:0;overflow:auto;-webkit-overflow-scrolling:touch;overflow-scrolling:touch;will-change:contents;background:#fff;margin-top:0!important;contain:strict;z-index:0}.wb-control *,.wb-icon{background-repeat:no-repeat}.wb-drag{height:100%;padding-left:10px;cursor:move}.wb-title{font-family:Arial,sans-serif;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wb-icon{display:none;width:20px;height:100%;margin:-1px 8px 0-3px;float:left;background-size:100%;background-position:center}.wb-e,.wb-w{width:10px;top:0}.wb-n,.wb-s{left:0;height:10px;position:absolute}.wb-n{top:-5px;right:0;cursor:n-resize;z-index:2}.wb-e{position:absolute;right:-5px;bottom:0;cursor:w-resize;z-index:2}.wb-s{bottom:-5px;right:0;cursor:n-resize;z-index:2}.wb-nw,.wb-sw,.wb-w{left:-5px}.wb-w{position:absolute;bottom:0;cursor:w-resize;z-index:2}.wb-ne,.wb-nw,.wb-sw{width:15px;height:15px;z-index:2;position:absolute}.wb-nw{top:-5px;cursor:nw-resize}.wb-ne,.wb-sw{cursor:ne-resize}.wb-ne{top:-5px;right:-5px}.wb-se,.wb-sw{bottom:-5px}.wb-se{position:absolute;right:-5px;width:15px;height:15px;cursor:nw-resize;z-index:2}.wb-control{float:right;height:100%;max-width:100%;text-align:center}.wb-control *{display:inline-block;width:30px;height:100%;max-width:100%;background-position:center;cursor:pointer}.no-close .wb-close,.no-full .wb-full,.no-header .wb-header,.no-max .wb-max,.no-min .wb-min,.no-resize .wb-body~div,.wb-body .wb-hide,.wb-show,.winbox.hide,.winbox.min .wb-body>*,.winbox.min .wb-full,.winbox.min .wb-min,.winbox.modal .wb-full,.winbox.modal .wb-max,.winbox.modal .wb-min{display:none}.winbox.max .wb-drag,.winbox.min .wb-drag{cursor:default}.wb-min{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAyIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNOCAwaDdhMSAxIDAgMCAxIDAgMkgxYTEgMSAwIDAgMSAwLTJoN3oiLz48L3N2Zz4=);background-size:14px auto;background-position:center calc(50% + 6px)}.wb-max{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9IiNmZmYiIHZpZXdCb3g9IjAgMCA5NiA5NiI+PHBhdGggZD0iTTIwIDcxLjMxMUMxNS4zNCA2OS42NyAxMiA2NS4yMyAxMiA2MFYyMGMwLTYuNjMgNS4zNy0xMiAxMi0xMmg0MGM1LjIzIDAgOS42NyAzLjM0IDExLjMxMSA4SDI0Yy0yLjIxIDAtNCAxLjc5LTQgNHY1MS4zMTF6Ii8+PHBhdGggZD0iTTkyIDc2VjM2YzAtNi42My01LjM3LTEyLTEyLTEySDQwYy02LjYzIDAtMTIgNS4zNy0xMiAxMnY0MGMwIDYuNjMgNS4zNyAxMiAxMiAxMmg0MGM2LjYzIDAgMTItNS4zNyAxMi0xMnptLTUyIDRjLTIuMjEgMC00LTEuNzktNC00VjM2YzAtMi4yMSAxLjc5LTQgNC00aDQwYzIuMjEgMCA0IDEuNzkgNCA0djQwYzAgMi4yMS0xLjc5IDQtNCA0SDQweiIvPjwvc3ZnPg==);background-size:17px auto}.wb-close{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xIC0xIDE4IDE4Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJtMS42MTMuMjEuMDk0LjA4M0w4IDYuNTg1IDE0LjI5My4yOTNsLjA5NC0uMDgzYTEgMSAwIDAgMSAxLjQwMyAxLjQwM2wtLjA4My4wOTRMOS40MTUgOGw2LjI5MiA2LjI5M2ExIDEgMCAwIDEtMS4zMiAxLjQ5N2wtLjA5NC0uMDgzTDggOS40MTVsLTYuMjkzIDYuMjkyLS4wOTQuMDgzQTEgMSAwIDAgMSAuMjEgMTQuMzg3bC4wODMtLjA5NEw2LjU4NSA4IC4yOTMgMS43MDdBMSAxIDAgMCAxIDEuNjEzLjIxeiIvPjwvc3ZnPg==);background-size:15px auto;background-position:5px center}.wb-full{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2Utd2lkdGg9IjIuNSIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNOCAzSDVhMiAyIDAgMCAwLTIgMnYzbTE4IDBWNWEyIDIgMCAwIDAtMi0yaC0zbTAgMThoM2EyIDIgMCAwIDAgMi0ydi0zTTMgMTZ2M2EyIDIgMCAwIDAgMiAyaDMiLz48L3N2Zz4=);background-size:16px auto}.winbox.max .wb-body~div,.winbox.min .wb-body~div,.winbox.modal .wb-body~div,.winbox.modal .wb-drag,body.wb-lock iframe{pointer-events:none}.winbox.max{box-shadow:none}.winbox.max .wb-body{margin:0!important}.winbox iframe{position:absolute;width:100%;height:100%;border:0}body.wb-lock .winbox{will-change:left,top,width,height;transition:none}.winbox.modal:before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background:inherit;border-radius:inherit}.winbox.modal:after{content:'';position:absolute;top:-50vh;left:-50vw;right:-50vw;bottom:-50vh;background:#0d1117;animation:wb-fade-in .2s ease-out forwards;z-index:-1}.no-animation{transition:none}.no-shadow{box-shadow:none}.no-header .wb-body{top:0}.no-move:not(.min) .wb-title{pointer-events:none}.wb-body .wb-show{display:revert}";
    var h = document.getElementsByTagName("head")[0];
    h.firstChild ? h.insertBefore(aa, h.firstChild) : h.appendChild(aa);
    var ba = document.createElement("div");
    ba.innerHTML = "<div class=wb-header><div class=wb-control><span class=wb-min></span><span class=wb-max></span><span class=wb-full></span><span class=wb-close></span></div><div class=wb-drag><div class=wb-icon></div><div class=wb-title></div></div></div><div class=wb-body></div><div class=wb-n></div><div class=wb-s></div><div class=wb-w></div><div class=wb-e></div><div class=wb-nw></div><div class=wb-ne></div><div class=wb-se></div><div class=wb-sw></div>";
    function k(a, b, c, f) {
        a && a.addEventListener(b, c, f || !1);
    }
    function l(a, b) {
        var c = window, f = m;
        c && c.removeEventListener(a, b, f || !1);
    }
    function t(a, b) {
        a.stopPropagation();
        b && a.preventDefault();
    }
    function u(a, b, c) {
        c = "" + c;
        a["_s_" + b] !== c && (a.style.setProperty(b, c), a["_s_" + b] = c);
    }
    var x = [], A = [], ca = {
        capture: !0,
        passive: !1
    }, m = {
        capture: !0,
        passive: !0
    }, B, da = 0, E = 10, F, J, ha, K, P, ia;
    function U(a, b) {
        if (!(this instanceof U)) return new U(a);
        B || ja();
        if (a) {
            if (b) {
                var c = a;
                a = b;
            }
            if ("string" === typeof a) c = a;
            else {
                var f = a.id;
                var d = a.index;
                var n = a.root;
                var p = a.template;
                c = c || a.title;
                var v = a.icon;
                var L = a.mount;
                var Q = a.html;
                var g = a.url;
                var q = a.width;
                var r = a.height;
                var w = a.minwidth;
                var C = a.minheight;
                var y = a.maxwidth;
                var z = a.maxheight;
                var ea = a.autosize;
                var D = a.overflow;
                var G = a.min;
                var H = a.max;
                var I = a.hidden;
                var fa = a.modal;
                var X = a.x || (fa ? "center" : 0);
                var Y = a.y || (fa ? "center" : 0);
                var M = a.top;
                var N = a.left;
                var R = a.bottom;
                var S = a.right;
                var la = a.background;
                var O = a.border;
                var T = a.header;
                var Z = a["class"];
                var ma = a.oncreate;
                var ra = a.onclose;
                var sa = a.onfocus;
                var ta = a.onblur;
                var ua = a.onmove;
                var va = a.onresize;
                var wa = a.onfullscreen;
                var xa = a.onmaximize;
                var ya = a.onminimize;
                var za = a.onrestore;
                var Aa = a.onhide;
                var Ba = a.onshow;
                var Ca = a.onload;
            }
        }
        this.g = (p || ba).cloneNode(!0);
        this.g.id = this.id = f || "winbox-" + ++da;
        this.g.className = "winbox" + (Z ? " " + ("string" === typeof Z ? Z : Z.join(" ")) : "") + (fa ? " modal" : "");
        this.g.winbox = this;
        this.window = this.g;
        this.body = this.g.getElementsByClassName("wb-body")[0];
        this.h = T || 35;
        A.push(this);
        la && this.setBackground(la);
        O ? u(this.body, "margin", O + (isNaN(O) ? "" : "px")) : O = 0;
        T && (b = this.g.getElementsByClassName("wb-header")[0], u(b, "height", T + "px"), u(b, "line-height", T + "px"), u(this.body, "top", T + "px"));
        c && this.setTitle(c);
        v && this.setIcon(v);
        L ? this.mount(L) : Q ? this.body.innerHTML = Q : g && this.setUrl(g, Ca);
        M = M ? V(M, P) : 0;
        R = R ? V(R, P) : 0;
        N = N ? V(N, K) : 0;
        S = S ? V(S, K) : 0;
        c = K - N - S;
        v = P - M - R;
        y = y ? V(y, c) : c;
        z = z ? V(z, v) : v;
        w = w ? V(w, y) : 150;
        C = C ? V(C, z) : this.h;
        ea ? ((n || B).appendChild(this.body), q = Math.max(Math.min(this.body.clientWidth + 2 * O + 1, y), w), r = Math.max(Math.min(this.body.clientHeight + this.h + O + 1, z), C), this.g.appendChild(this.body)) : (q = q ? V(q, y) : Math.max(y / 2, w) | 0, r = r ? V(r, z) : Math.max(z / 2, C) | 0);
        X = X ? V(X, c, q) : N;
        Y = Y ? V(Y, v, r) : M;
        this.x = X;
        this.y = Y;
        this.width = q;
        this.height = r;
        this.s = w;
        this.o = C;
        this.m = y;
        this.l = z;
        this.top = M;
        this.right = S;
        this.bottom = R;
        this.left = N;
        this.index = d;
        this.j = D;
        this.focused = this.hidden = this.full = this.max = this.min = !1;
        this.onclose = ra;
        this.onfocus = sa;
        this.onblur = ta;
        this.onmove = ua;
        this.onresize = va;
        this.onfullscreen = wa;
        this.onmaximize = xa;
        this.onminimize = ya;
        this.onrestore = za;
        this.onhide = Aa;
        this.onshow = Ba;
        I ? this.hide() : this.focus();
        if (d || 0 === d) this.index = d, u(this.g, "z-index", d), d > E && (E = d);
        H ? this.maximize() : G ? this.minimize() : this.resize().move();
        ka(this);
        (n || B).appendChild(this.g);
        ma && ma.call(this, a);
    }
    U["new"] = function(a) {
        return new U(a);
    };
    U.stack = function() {
        return A;
    };
    function V(a, b, c) {
        "string" === typeof a && ("center" === a ? a = (b - c) / 2 + .5 | 0 : "right" === a || "bottom" === a ? a = b - c : (c = parseFloat(a), a = "%" === ("" + c !== a && a.substring(("" + c).length)) ? b / 100 * c + .5 | 0 : c));
        return a;
    }
    function ja() {
        B = document.body;
        B[J = "requestFullscreen"] || B[J = "msRequestFullscreen"] || B[J = "webkitRequestFullscreen"] || B[J = "mozRequestFullscreen"] || (J = "");
        ha = J && J.replace("request", "exit").replace("mozRequest", "mozCancel").replace("Request", "Exit");
        k(window, "resize", function() {
            na();
            oa();
        });
        k(B, "mousedown", function() {
            ia = !1;
        }, !0);
        k(B, "mousedown", function() {
            if (!ia) {
                var a = A.length;
                if (a) for(--a; 0 <= a; a--){
                    var b = A[a];
                    if (b.focused) {
                        b.blur();
                        break;
                    }
                }
            }
        });
        na();
    }
    function ka(a) {
        W(a, "drag");
        W(a, "n");
        W(a, "s");
        W(a, "w");
        W(a, "e");
        W(a, "nw");
        W(a, "ne");
        W(a, "se");
        W(a, "sw");
        k(a.g.getElementsByClassName("wb-min")[0], "click", function(b) {
            t(b);
            a.min ? a.restore().focus() : a.minimize();
        });
        k(a.g.getElementsByClassName("wb-max")[0], "click", function(b) {
            t(b);
            a.max ? a.restore().focus() : a.maximize().focus();
        });
        J ? k(a.g.getElementsByClassName("wb-full")[0], "click", function(b) {
            t(b);
            a.fullscreen().focus();
        }) : a.addClass("no-full");
        k(a.g.getElementsByClassName("wb-close")[0], "click", function(b) {
            t(b);
            a.close() || (a = null);
        });
        k(a.g, "mousedown", function() {
            ia = !0;
        }, !0);
        k(a.body, "mousedown", function() {
            a.focus();
        }, !0);
    }
    function pa(a) {
        x.splice(x.indexOf(a), 1);
        oa();
        a.removeClass("min");
        a.min = !1;
        a.g.title = "";
    }
    function oa() {
        for(var a = x.length, b = {}, c = {}, f = 0, d; f < a; f++)d = x[f], d = d.left + ":" + d.top, c[d] ? c[d]++ : (b[d] = 0, c[d] = 1);
        f = 0;
        for(var n, p; f < a; f++)d = x[f], n = d.left + ":" + d.top, p = Math.min((K - d.left - d.right) / c[n], 250), d.resize(p + 1 | 0, d.h, !0).move(d.left + b[n] * p | 0, P - d.bottom - d.h, !0), b[n]++;
    }
    function W(a, b) {
        function c(g) {
            t(g, !0);
            a.focus();
            if ("drag" === b) {
                if (a.min) {
                    a.restore();
                    return;
                }
                if (!a.g.classList.contains("no-max")) {
                    var q = Date.now(), r = q - Q;
                    Q = q;
                    if (300 > r) {
                        a.max ? a.restore() : a.maximize();
                        return;
                    }
                }
            }
            a.min || (B.classList.add("wb-lock"), (p = g.touches) && (p = p[0]) ? (g = p, k(window, "touchmove", f, m), k(window, "touchend", d, m)) : (k(window, "mousemove", f, m), k(window, "mouseup", d, m)), v = g.pageX, L = g.pageY);
        }
        function f(g) {
            t(g);
            p && (g = g.touches[0]);
            var q = g.pageX;
            g = g.pageY;
            var r = q - v, w = g - L, C = a.width, y = a.height, z = a.x, ea = a.y, D;
            if ("drag" === b) {
                if (a.g.classList.contains("no-move")) return;
                a.x += r;
                a.y += w;
                var G = D = 1;
            } else {
                if ("e" === b || "se" === b || "ne" === b) {
                    a.width += r;
                    var H = 1;
                } else if ("w" === b || "sw" === b || "nw" === b) a.x += r, a.width -= r, G = H = 1;
                if ("s" === b || "se" === b || "sw" === b) {
                    a.height += w;
                    var I = 1;
                } else if ("n" === b || "ne" === b || "nw" === b) a.y += w, a.height -= w, D = I = 1;
            }
            H && (a.width = Math.max(Math.min(a.width, a.m, K - a.x - a.right), a.s), H = a.width !== C);
            I && (a.height = Math.max(Math.min(a.height, a.l, P - a.y - a.bottom), a.o), I = a.height !== y);
            (H || I) && a.resize();
            G && (a.max && (a.x = (q < K / 3 ? a.left : q > K / 3 * 2 ? K - a.width - a.right : K / 2 - a.width / 2) + r), a.x = Math.max(Math.min(a.x, a.j ? K - 30 : K - a.width - a.right), a.j ? 30 - a.width : a.left), G = a.x !== z);
            D && (a.max && (a.y = a.top + w), a.y = Math.max(Math.min(a.y, a.j ? P - a.h : P - a.height - a.bottom), a.top), D = a.y !== ea);
            if (G || D) a.max && a.restore(), a.move();
            if (H || G) v = q;
            if (I || D) L = g;
        }
        function d(g) {
            t(g);
            B.classList.remove("wb-lock");
            p ? (l("touchmove", f), l("touchend", d)) : (l("mousemove", f), l("mouseup", d));
        }
        var n = a.g.getElementsByClassName("wb-" + b)[0];
        if (n) {
            var p, v, L, Q = 0;
            k(n, "mousedown", c, ca);
            k(n, "touchstart", c, ca);
        }
    }
    function na() {
        var a = document.documentElement;
        K = a.clientWidth;
        P = a.clientHeight;
    }
    e = U.prototype;
    e.mount = function(a) {
        this.unmount();
        a.i || (a.i = a.parentNode);
        this.body.textContent = "";
        this.body.appendChild(a);
        return this;
    };
    e.unmount = function(a) {
        var b = this.body.firstChild;
        if (b) {
            var c = a || b.i;
            c && c.appendChild(b);
            b.i = a;
        }
        return this;
    };
    e.setTitle = function(a) {
        var b = this.g.getElementsByClassName("wb-title")[0];
        a = this.title = a;
        var c = b.firstChild;
        c ? c.nodeValue = a : b.textContent = a;
        return this;
    };
    e.setIcon = function(a) {
        var b = this.g.getElementsByClassName("wb-icon")[0];
        u(b, "background-image", "url(" + a + ")");
        u(b, "display", "inline-block");
        return this;
    };
    e.setBackground = function(a) {
        u(this.g, "background", a);
        return this;
    };
    e.setUrl = function(a, b) {
        var c = this.body.firstChild;
        c && "iframe" === c.tagName.toLowerCase() ? c.src = a : (this.body.innerHTML = '<iframe src="' + a + '"></iframe>', b && (this.body.firstChild.onload = b));
        return this;
    };
    e.focus = function(a) {
        if (!1 === a) return this.blur();
        if (!this.focused) {
            a = A.length;
            if (1 < a) for(var b = 1; b <= a; b++){
                var c = A[a - b];
                if (c.focused) {
                    c.blur();
                    A.push(A.splice(A.indexOf(this), 1)[0]);
                    break;
                }
            }
            u(this.g, "z-index", ++E);
            this.index = E;
            this.addClass("focus");
            this.focused = !0;
            this.onfocus && this.onfocus();
        }
        return this;
    };
    e.blur = function(a) {
        if (!1 === a) return this.focus();
        this.focused && (this.removeClass("focus"), this.focused = !1, this.onblur && this.onblur());
        return this;
    };
    e.hide = function(a) {
        if (!1 === a) return this.show();
        if (!this.hidden) return this.onhide && this.onhide(), this.hidden = !0, this.addClass("hide");
    };
    e.show = function(a) {
        if (!1 === a) return this.hide();
        if (this.hidden) return this.onshow && this.onshow(), this.hidden = !1, this.removeClass("hide");
    };
    e.minimize = function(a) {
        if (!1 === a) return this.restore();
        F && qa();
        this.max && (this.removeClass("max"), this.max = !1);
        this.min || (x.push(this), oa(), this.g.title = this.title, this.addClass("min"), this.min = !0, this.focused && (this.blur(), Da()), this.onminimize && this.onminimize());
        return this;
    };
    function Da() {
        var a = A.length;
        if (a) for(--a; 0 <= a; a--){
            var b = A[a];
            if (!b.min) {
                b.focus();
                break;
            }
        }
    }
    e.restore = function() {
        F && qa();
        this.min && (pa(this), this.resize().move(), this.onrestore && this.onrestore());
        this.max && (this.max = !1, this.removeClass("max").resize().move(), this.onrestore && this.onrestore());
        return this;
    };
    e.maximize = function(a) {
        if (!1 === a) return this.restore();
        F && qa();
        this.min && pa(this);
        this.max || (this.addClass("max").resize(K - this.left - this.right, P - this.top - this.bottom, !0).move(this.left, this.top, !0), this.max = !0, this.onmaximize && this.onmaximize());
        return this;
    };
    e.fullscreen = function(a) {
        this.min && (pa(this), this.resize().move());
        if (!F || !qa()) this.body[J](), F = this, this.full = !0, this.onfullscreen && this.onfullscreen();
        else if (!1 === a) return this.restore();
        return this;
    };
    function qa() {
        F.full = !1;
        if (document.fullscreen || document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) return document[ha](), !0;
    }
    e.close = function(a) {
        if (this.onclose && this.onclose(a)) return !0;
        this.min && pa(this);
        A.splice(A.indexOf(this), 1);
        this.unmount();
        this.g.remove();
        this.g.textContent = "";
        this.g = this.body = this.g.winbox = null;
        this.focused && Da();
    };
    e.move = function(a, b, c) {
        a || 0 === a ? c || (this.x = a ? a = V(a, K - this.left - this.right, this.width) : 0, this.y = b ? b = V(b, P - this.top - this.bottom, this.height) : 0) : (a = this.x, b = this.y);
        u(this.g, "left", a + "px");
        u(this.g, "top", b + "px");
        this.onmove && this.onmove(a, b);
        return this;
    };
    e.resize = function(a, b, c) {
        a || 0 === a ? c || (this.width = a ? a = V(a, this.m) : 0, this.height = b ? b = V(b, this.l) : 0, a = Math.max(a, this.s), b = Math.max(b, this.o)) : (a = this.width, b = this.height);
        u(this.g, "width", a + "px");
        u(this.g, "height", b + "px");
        this.onresize && this.onresize(a, b);
        return this;
    };
    e.addControl = function(a) {
        var b = a["class"], c = a.image, f = a.click;
        a = a.index;
        var d = document.createElement("span"), n = this.g.getElementsByClassName("wb-control")[0], p = this;
        b && (d.className = b);
        c && u(d, "background-image", "url(" + c + ")");
        f && (d.onclick = function(v) {
            f.call(this, v, p);
        });
        n.insertBefore(d, n.childNodes[a || 0]);
        return this;
    };
    e.removeControl = function(a) {
        (a = this.g.getElementsByClassName(a)[0]) && a.remove();
        return this;
    };
    e.addClass = function(a) {
        this.g.classList.add(a);
        return this;
    };
    e.removeClass = function(a) {
        this.g.classList.remove(a);
        return this;
    };
    e.toggleClass = function(a) {
        return this.g.classList.contains(a) ? this.removeClass(a) : this.addClass(a);
    };
    window.WinBox = U;
}).call(this);
