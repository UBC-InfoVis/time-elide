
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /*! UIkit 3.6.16 | https://www.getuikit.com | (c) 2014 - 2021 YOOtheme | MIT License */

    createCommonjsModule(function (module, exports) {
    !function(t,e){module.exports=e();}(commonjsGlobal,function(){var t=Object.prototype,n=t.hasOwnProperty;function c(t,e){return n.call(t,e)}var e=/\B([A-Z])/g,d=rt(function(t){return t.replace(e,"-$1").toLowerCase()}),i=/-(\w)/g,f=rt(function(t){return t.replace(i,r)}),p=rt(function(t){return t.length?r(0,t.charAt(0))+t.slice(1):""});function r(t,e){return e?e.toUpperCase():""}var o=String.prototype,s=o.startsWith||function(t){return 0===this.lastIndexOf(t,0)};function g(t,e){return s.call(t,e)}var a=o.endsWith||function(t){return this.substr(-t.length)===t};function u(t,e){return a.call(t,e)}var h=Array.prototype,l=function(t,e){return !!~this.indexOf(t,e)},m=o.includes||l,v=h.includes||l;function w(t,e){return t&&(z(t)?m:v).call(t,e)}var b=h.findIndex||function(t){for(var e=arguments,n=0;n<this.length;n++)if(t.call(e[1],this[n],n,this))return n;return -1};function x(t,e){return b.call(t,e)}var y=Array.isArray;function k(t){return "function"==typeof t}function $(t){return null!==t&&"object"==typeof t}var S=t.toString;function I(t){return "[object Object]"===S.call(t)}function T(t){return $(t)&&t===t.window}function E(t){return 9===A(t)}function C(t){return 1<=A(t)}function _(t){return 1===A(t)}function A(t){return !T(t)&&$(t)&&t.nodeType}function M(t){return "boolean"==typeof t}function z(t){return "string"==typeof t}function N(t){return "number"==typeof t}function B(t){return N(t)||z(t)&&!isNaN(t-parseFloat(t))}function D(t){return !(y(t)?t.length:$(t)&&Object.keys(t).length)}function O(t){return void 0===t}function P(t){return M(t)?t:"true"===t||"1"===t||""===t||"false"!==t&&"0"!==t&&t}function H(t){t=Number(t);return !isNaN(t)&&t}function L(t){return parseFloat(t)||0}var j=Array.from||function(t){return h.slice.call(t)};function F(t){return W(t)[0]}function W(t){return t&&(C(t)?[t]:j(t).filter(C))||[]}function V(t){return T(t)?t:(t=F(t))?(E(t)?t:t.ownerDocument).defaultView:window}function R(t){return t?u(t,"ms")?L(t):1e3*L(t):0}function q(t,n){return t===n||$(t)&&$(n)&&Object.keys(t).length===Object.keys(n).length&&G(t,function(t,e){return t===n[e]})}function U(t,e,n){return t.replace(new RegExp(e+"|"+n,"g"),function(t){return t===e?n:e})}var Y=Object.assign||function(t){for(var e=[],n=arguments.length-1;0<n--;)e[n]=arguments[n+1];t=Object(t);for(var i=0;i<e.length;i++){var r=e[i];if(null!==r)for(var o in r)c(r,o)&&(t[o]=r[o]);}return t};function X(t){return t[t.length-1]}function G(t,e){for(var n in t)if(!1===e(t[n],n))return !1;return !0}function K(t,n){return t.slice().sort(function(t,e){t=t[n];void 0===t&&(t=0);e=e[n];return (e=void 0===e?0:e)<t?1:t<e?-1:0})}function J(t,e){var n=new Set;return t.filter(function(t){t=t[e];return !n.has(t)&&(n.add(t)||!0)})}function Z(t,e,n){return void 0===e&&(e=0),void 0===n&&(n=1),Math.min(Math.max(H(t)||0,e),n)}function Q(){}function tt(){for(var i=[],t=arguments.length;t--;)i[t]=arguments[t];return [["bottom","top"],["right","left"]].every(function(t){var e=t[0],n=t[1];return 0<Math.min.apply(Math,i.map(function(t){return t[e]}))-Math.max.apply(Math,i.map(function(t){return t[n]}))})}function et(t,e){return t.x<=e.right&&t.x>=e.left&&t.y<=e.bottom&&t.y>=e.top}var nt={ratio:function(t,e,n){var i="width"===e?"height":"width",r={};return r[i]=t[e]?Math.round(n*t[i]/t[e]):t[i],r[e]=n,r},contain:function(n,i){var r=this;return G(n=Y({},n),function(t,e){return n=n[e]>i[e]?r.ratio(n,e,i[e]):n}),n},cover:function(n,i){var r=this;return G(n=this.contain(n,i),function(t,e){return n=n[e]<i[e]?r.ratio(n,e,i[e]):n}),n}};function it(t,e,n,i){void 0===n&&(n=0),void 0===i&&(i=!1);var r=(e=W(e)).length;return t=B(t)?H(t):"next"===t?n+1:"previous"===t?n-1:e.indexOf(F(t)),i?Z(t,0,r-1):(t%=r)<0?t+r:t}function rt(e){var n=Object.create(null);return function(t){return n[t]||(n[t]=e(t))}}function ot(t,e,n){if($(e))for(var i in e)ot(t,i,e[i]);else {if(O(n))return (t=F(t))&&t.getAttribute(e);W(t).forEach(function(t){null===(n=k(n)?n.call(t,ot(t,e)):n)?at(t,e):t.setAttribute(e,n);});}}function st(t,e){return W(t).some(function(t){return t.hasAttribute(e)})}function at(t,e){t=W(t),e.split(" ").forEach(function(e){return t.forEach(function(t){return t.hasAttribute(e)&&t.removeAttribute(e)})});}function ut(t,e){for(var n=0,i=[e,"data-"+e];n<i.length;n++)if(st(t,i[n]))return ot(t,i[n])}var ct="undefined"!=typeof window,ht=ct&&/msie|trident/i.test(window.navigator.userAgent),lt=ct&&"rtl"===ot(document.documentElement,"dir"),dt=ct&&"ontouchstart"in window,ft=ct&&window.PointerEvent,pt=ct&&(dt||window.DocumentTouch&&document instanceof DocumentTouch||navigator.maxTouchPoints),mt=ft?"pointerdown":dt?"touchstart":"mousedown",gt=ft?"pointermove":dt?"touchmove":"mousemove",vt=ft?"pointerup":dt?"touchend":"mouseup",wt=ft?"pointerenter":dt?"":"mouseenter",bt=ft?"pointerleave":dt?"":"mouseleave",xt=ft?"pointercancel":"touchcancel",yt={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,menuitem:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0};function kt(t){return W(t).some(function(t){return yt[t.tagName.toLowerCase()]})}function $t(t){return W(t).some(function(t){return t.offsetWidth||t.offsetHeight||t.getClientRects().length})}var St="input,select,textarea,button";function It(t){return W(t).some(function(t){return At(t,St)})}function Tt(t){return (t=F(t))&&_(t.parentNode)&&t.parentNode}function Et(t,e){return W(t).filter(function(t){return At(t,e)})}var Ct=ct?Element.prototype:{},_t=Ct.matches||Ct.webkitMatchesSelector||Ct.msMatchesSelector||Q;function At(t,e){return W(t).some(function(t){return _t.call(t,e)})}var Mt=Ct.closest||function(t){var e=this;do{if(At(e,t))return e}while(e=Tt(e))};function zt(t,e){return g(e,">")&&(e=e.slice(1)),_(t)?Mt.call(t,e):W(t).map(function(t){return zt(t,e)}).filter(Boolean)}function Nt(t,e){return z(e)?At(t,e)||!!zt(t,e):t===e||(E(e)?e.documentElement:F(e)).contains(F(t))}function Bt(t,e){for(var n=[];t=Tt(t);)e&&!At(t,e)||n.push(t);return n}function Dt(t,e){t=(t=F(t))?W(t.children):[];return e?Et(t,e):t}function Ot(t,e){return e?W(t).indexOf(F(e)):Dt(Tt(t)).indexOf(t)}function Pt(t,e){return F(t)||jt(t,Lt(t,e))}function Ht(t,e){var n=W(t);return n.length&&n||Ft(t,Lt(t,e))}function Lt(t,e){return void 0===e&&(e=document),z(t)&&qt(t)||E(e)?e:e.ownerDocument}function jt(t,e){return F(Wt(t,e,"querySelector"))}function Ft(t,e){return W(Wt(t,e,"querySelectorAll"))}function Wt(t,o,e){if(void 0===o&&(o=document),!t||!z(t))return null;t=t.replace(Rt,"$1 *"),qt(t)&&(t=Yt(t).map(function(t,e){var n,i,r=o;return "!"===t[0]&&(i=t.substr(1).trim().split(" "),r=zt(Tt(o),i[0]),t=i.slice(1).join(" ").trim()),"-"===t[0]&&(n=t.substr(1).trim().split(" "),r=At(i=(r||o).previousElementSibling,t.substr(1))?i:null,t=n.slice(1).join(" ")),r?function(t){var e=[];for(;t.parentNode;){if(t.id){e.unshift("#"+Gt(t.id));break}var n=t.tagName;"HTML"!==n&&(n+=":nth-child("+(Ot(t)+1)+")"),e.unshift(n),t=t.parentNode;}return e.join(" > ")}(r)+" "+t:null}).filter(Boolean).join(","),o=document);try{return o[e](t)}catch(t){return null}}var Vt=/(^|[^\\],)\s*[!>+~-]/,Rt=/([!>+~-])(?=\s+[!>+~-]|\s*$)/g,qt=rt(function(t){return t.match(Vt)}),Ut=/.*?[^\\](?:,|$)/g,Yt=rt(function(t){return t.match(Ut).map(function(t){return t.replace(/,$/,"").trim()})});var Xt=ct&&window.CSS&&CSS.escape||function(t){return t.replace(/([^\x7f-\uFFFF\w-])/g,function(t){return "\\"+t})};function Gt(t){return z(t)?Xt.call(null,t):""}function Kt(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n,i,r=ee(t),o=r[0],s=r[1],a=r[2],u=r[3],c=r[4],o=oe(o);return 1<u.length&&(n=u,u=function(t){return y(t.detail)?n.apply(void 0,[t].concat(t.detail)):n(t)}),c&&c.self&&(i=u,u=function(t){if(t.target===t.currentTarget||t.target===t.current)return i.call(null,t)}),a&&(u=function(n,i){var r=this;return function(e){var t=">"===n[0]?Ft(n,e.currentTarget).reverse().filter(function(t){return Nt(e.target,t)})[0]:zt(e.target,n);t&&(e.current=t,i.call(r,e));}}(a,u)),c=ne(c),s.split(" ").forEach(function(e){return o.forEach(function(t){return t.addEventListener(e,u,c)})}),function(){return Jt(o,s,u,c)}}function Jt(t,e,n,i){i=ne(i=void 0===i?!1:i),t=oe(t),e.split(" ").forEach(function(e){return t.forEach(function(t){return t.removeEventListener(e,n,i)})});}function Zt(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=ee(t),i=n[0],r=n[1],o=n[2],s=n[3],a=n[4],u=n[5],c=Kt(i,r,o,function(t){var e=!u||u(t);e&&(c(),s(t,e));},a);return c}function Qt(t,n,i){return oe(t).reduce(function(t,e){return t&&e.dispatchEvent(te(n,!0,!0,i))},!0)}function te(t,e,n,i){var r;return void 0===e&&(e=!0),void 0===n&&(n=!1),z(t)&&((r=document.createEvent("CustomEvent")).initCustomEvent(t,e,n,i),t=r),t}function ee(t){return k(t[2])&&t.splice(2,0,!1),t}function ne(t){return t&&ht&&!M(t)?!!t.capture:t}function ie(t){return t&&"addEventListener"in t}function re(t){return ie(t)?t:F(t)}function oe(t){return y(t)?t.map(re).filter(Boolean):z(t)?Ft(t):ie(t)?[t]:W(t)}function se(t){return "touch"===t.pointerType||!!t.touches}function ae(t){var e=t.touches,n=t.changedTouches,t=e&&e[0]||n&&n[0]||t;return {x:t.clientX,y:t.clientY}}function ue(){var n=this;this.promise=new ce(function(t,e){n.reject=e,n.resolve=t;});}var ce=ct&&window.Promise||de,he=2,le=ct&&window.setImmediate||setTimeout;function de(t){this.state=he,this.value=void 0,this.deferred=[];var e=this;try{t(function(t){e.resolve(t);},function(t){e.reject(t);});}catch(t){e.reject(t);}}de.reject=function(n){return new de(function(t,e){e(n);})},de.resolve=function(n){return new de(function(t,e){t(n);})},de.all=function(o){return new de(function(n,t){var i=[],r=0;0===o.length&&n(i);for(var e=0;e<o.length;e+=1)de.resolve(o[e]).then(function(e){return function(t){i[e]=t,(r+=1)===o.length&&n(i);}}(e),t);})},de.race=function(i){return new de(function(t,e){for(var n=0;n<i.length;n+=1)de.resolve(i[n]).then(t,e);})};var fe=de.prototype;function pe(t,e){var n=Y({data:null,method:"GET",headers:{},xhr:new XMLHttpRequest,beforeSend:Q,responseType:""},e);return ce.resolve().then(function(){return n.beforeSend(n)}).then(function(){return o=t,s=n,new ce(function(t,e){var n,i,r=s.xhr;for(n in s)if(n in r)try{r[n]=s[n];}catch(t){}for(i in r.open(s.method.toUpperCase(),o),s.headers)r.setRequestHeader(i,s.headers[i]);Kt(r,"load",function(){0===r.status||200<=r.status&&r.status<300||304===r.status?("json"===s.responseType&&z(r.response)&&(r=Y(function(t){var e,n={};for(e in t)n[e]=t[e];return n}(r),{response:JSON.parse(r.response)})),t(r)):e(Y(Error(r.statusText),{xhr:r,status:r.status}));}),Kt(r,"error",function(){return e(Y(Error("Network Error"),{xhr:r}))}),Kt(r,"timeout",function(){return e(Y(Error("Network Timeout"),{xhr:r}))}),r.send(s.data);});var o,s;})}function me(i,r,o){return new ce(function(t,e){var n=new Image;n.onerror=function(t){return e(t)},n.onload=function(){return t(n)},o&&(n.sizes=o),r&&(n.srcset=r),n.src=i;})}function ge(t){return (t=Ae(t)).innerHTML="",t}function ve(t,e){return t=Ae(t),O(e)?t.innerHTML:we(t.hasChildNodes()?ge(t):t,e)}function we(e,t){return e=Ae(e),ye(t,function(t){return e.appendChild(t)})}function be(e,t){return e=Ae(e),ye(t,function(t){return e.parentNode.insertBefore(t,e)})}function xe(e,t){return e=Ae(e),ye(t,function(t){return e.nextSibling?be(e.nextSibling,t):we(e.parentNode,t)})}function ye(t,e){return (t=z(t)?Ce(t):t)?"length"in t?W(t).map(e):e(t):null}function ke(t){W(t).forEach(function(t){return t.parentNode&&t.parentNode.removeChild(t)});}function $e(t,e){for(e=F(be(t,e));e.firstChild;)e=e.firstChild;return we(e,t),e}function Se(t,e){return W(W(t).map(function(t){return t.hasChildNodes?$e(W(t.childNodes),e):we(t,e)}))}function Ie(t){W(t).map(Tt).filter(function(t,e,n){return n.indexOf(t)===e}).forEach(function(t){be(t,t.childNodes),ke(t);});}fe.resolve=function(t){var e=this;if(e.state===he){if(t===e)throw new TypeError("Promise settled with itself.");var n=!1;try{var i=t&&t.then;if(null!==t&&$(t)&&k(i))return void i.call(t,function(t){n||e.resolve(t),n=!0;},function(t){n||e.reject(t),n=!0;})}catch(t){return void(n||e.reject(t))}e.state=0,e.value=t,e.notify();}},fe.reject=function(t){var e=this;if(e.state===he){if(t===e)throw new TypeError("Promise settled with itself.");e.state=1,e.value=t,e.notify();}},fe.notify=function(){var o=this;le(function(){if(o.state!==he)for(;o.deferred.length;){var t=o.deferred.shift(),e=t[0],n=t[1],i=t[2],r=t[3];try{0===o.state?k(e)?i(e.call(void 0,o.value)):i(o.value):1===o.state&&(k(n)?i(n.call(void 0,o.value)):r(o.value));}catch(t){r(t);}}});},fe.then=function(n,i){var r=this;return new de(function(t,e){r.deferred.push([n,i,t,e]),r.notify();})},fe.catch=function(t){return this.then(void 0,t)};var Te=/^\s*<(\w+|!)[^>]*>/,Ee=/^<(\w+)\s*\/?>(?:<\/\1>)?$/;function Ce(t){var e=Ee.exec(t);if(e)return document.createElement(e[1]);e=document.createElement("div");return Te.test(t)?e.insertAdjacentHTML("beforeend",t.trim()):e.textContent=t,1<e.childNodes.length?W(e.childNodes):e.firstChild}function _e(t,e){if(_(t))for(e(t),t=t.firstElementChild;t;){var n=t.nextElementSibling;_e(t,e),t=n;}}function Ae(t,e){return z(t)?ze(t)?F(Ce(t)):jt(t,e):F(t)}function Me(t,e){return z(t)?ze(t)?W(Ce(t)):Ft(t,e):W(t)}function ze(t){return "<"===t[0]||t.match(/^\s*</)}function Ne(t){for(var e=[],n=arguments.length-1;0<n--;)e[n]=arguments[n+1];Le(t,e,"add");}function Be(t){for(var e=[],n=arguments.length-1;0<n--;)e[n]=arguments[n+1];Le(t,e,"remove");}function De(t,e){ot(t,"class",function(t){return (t||"").replace(new RegExp("\\b"+e+"\\b","g"),"")});}function Oe(t){for(var e=[],n=arguments.length-1;0<n--;)e[n]=arguments[n+1];e[0]&&Be(t,e[0]),e[1]&&Ne(t,e[1]);}function Pe(t,e){e=je(e)[0];for(var n=W(t),i=0;i<n.length;i++)if(e&&n[i].classList.contains(e))return !0;return !1}function He(t,e,n){e=je(e);for(var i=W(t),r=0;r<i.length;r++)for(var o=i[r].classList,s=0;s<e.length;s++)O(n)?o.toggle(e[s]):Fe.Force?o.toggle(e[s],!!n):o[n?"add":"remove"](e[s]);}function Le(t,n,i){var r;n=n.reduce(function(t,e){return t.concat(je(e))},[]);for(var o=W(t),e=0;e<o.length;e++)!function(e){Fe.Multiple?(r=o[e].classList)[i].apply(r,n):n.forEach(function(t){return o[e].classList[i](t)});}(e);}function je(t){return (~(t=String(t)).indexOf(" ")?t.split(" "):[t]).filter(Boolean)}var Fe={get Multiple(){return this.get("Multiple")},get Force(){return this.get("Force")},get:function(t){var e=document.createElement("_").classList;return e.add("a","b"),e.toggle("c",!1),(Fe={Multiple:e.contains("b"),Force:!e.contains("c")})[t]}},We={"animation-iteration-count":!0,"column-count":!0,"fill-opacity":!0,"flex-grow":!0,"flex-shrink":!0,"font-weight":!0,"line-height":!0,opacity:!0,order:!0,orphans:!0,"stroke-dasharray":!0,"stroke-dashoffset":!0,widows:!0,"z-index":!0,zoom:!0};function Ve(t,e,r,o){return void 0===o&&(o=""),W(t).map(function(n){if(z(e)){if(e=Xe(e),O(r))return qe(n,e);r||N(r)?n.style.setProperty(e,B(r)&&!We[e]?r+"px":r,o):n.style.removeProperty(e);}else {if(y(e)){var i=Re(n);return e.reduce(function(t,e){return t[e]=i[Xe(e)],t},{})}$(e)&&(o=r,G(e,function(t,e){return Ve(n,e,t,o)}));}return n})[0]}function Re(t,e){return V(t).getComputedStyle(t,e)}function qe(t,e,n){return Re(t,n)[e]}var Ue=rt(function(t){var e=we(document.documentElement,document.createElement("div"));return Ne(e,"uk-"+t),t=qe(e,"content",":before").replace(/^["'](.*)["']$/,"$1"),ke(e),t});function Ye(t){return ht?Ue(t):Re(document.documentElement).getPropertyValue("--uk-"+t)}var Xe=rt(function(t){t=d(t);var e=document.documentElement.style;if(t in e)return t;var n,i=Ge.length;for(;i--;)if((n="-"+Ge[i]+"-"+t)in e)return n}),Ge=["webkit","moz","ms"];function Ke(t,s,a,u){return void 0===a&&(a=400),void 0===u&&(u="linear"),ce.all(W(t).map(function(o){return new ce(function(e,n){for(var t in s){var i=Ve(o,t);""===i&&Ve(o,t,i);}var r=setTimeout(function(){return Qt(o,"transitionend")},a);Zt(o,"transitionend transitioncanceled",function(t){t=t.type;clearTimeout(r),Be(o,"uk-transition"),Ve(o,{transitionProperty:"",transitionDuration:"",transitionTimingFunction:""}),"transitioncanceled"===t?n():e(o);},{self:!0}),Ne(o,"uk-transition"),Ve(o,Y({transitionProperty:Object.keys(s).map(Xe).join(","),transitionDuration:a+"ms",transitionTimingFunction:u},s));})}))}var Je={start:Ke,stop:function(t){return Qt(t,"transitionend"),ce.resolve()},cancel:function(t){Qt(t,"transitioncanceled");},inProgress:function(t){return Pe(t,"uk-transition")}},Ze="uk-animation-";function Qe(t,o,s,a,u){return void 0===s&&(s=200),ce.all(W(t).map(function(r){return new ce(function(e,n){Qt(r,"animationcanceled");var i=setTimeout(function(){return Qt(r,"animationend")},s);Zt(r,"animationend animationcanceled",function(t){t=t.type;clearTimeout(i),"animationcanceled"===t?n():e(r),Ve(r,"animationDuration",""),De(r,Ze+"\\S*");},{self:!0}),Ve(r,"animationDuration",s+"ms"),Ne(r,o,Ze+(u?"leave":"enter")),g(o,Ze)&&(a&&Ne(r,"uk-transform-origin-"+a),u&&Ne(r,Ze+"reverse"));})}))}var tn=new RegExp(Ze+"(enter|leave)"),en={in:Qe,out:function(t,e,n,i){return Qe(t,e,n,i,!0)},inProgress:function(t){return tn.test(ot(t,"class"))},cancel:function(t){Qt(t,"animationcanceled");}},nn={width:["left","right"],height:["top","bottom"]};function rn(t){t=_(t)?F(t).getBoundingClientRect():{height:un(t),width:cn(t),top:0,left:0};return {height:t.height,width:t.width,top:t.top,left:t.left,bottom:t.top+t.height,right:t.left+t.width}}function on(n,i){var t,r=rn(n),e=V(n),o={height:e.pageYOffset,width:e.pageXOffset};for(t in nn)for(var s in nn[t])r[nn[t][s]]+=o[t];if(!i)return r;var a=Ve(n,"position");G(Ve(n,["left","top"]),function(t,e){return Ve(n,e,i[e]-r[e]+L("absolute"===a&&"auto"===t?sn(n)[e]:t))});}function sn(t){for(var e=on(t),n=e.top,i=e.left,r=F(t),e=r.ownerDocument,o=e.body,s=e.documentElement,a=r.offsetParent||s;a&&(a===o||a===s)&&"static"===Ve(a,"position");)a=a.parentNode;return _(a)&&(n-=(r=on(a)).top+L(Ve(a,"borderTopWidth")),i-=r.left+L(Ve(a,"borderLeftWidth"))),{top:n-L(Ve(t,"marginTop")),left:i-L(Ve(t,"marginLeft"))}}function an(t){var e=[0,0];t=F(t);do{if(e[0]+=t.offsetTop,e[1]+=t.offsetLeft,"fixed"===Ve(t,"position")){var n=V(t);return e[0]+=n.pageYOffset,e[1]+=n.pageXOffset,e}}while(t=t.offsetParent);return e}var un=hn("height"),cn=hn("width");function hn(i){var r=p(i);return function(t,e){if(O(e)){if(T(t))return t["inner"+r];if(E(t)){var n=t.documentElement;return Math.max(n["offset"+r],n["scroll"+r])}return (e="auto"===(e=Ve(t=F(t),i))?t["offset"+r]:L(e)||0)-ln(t,i)}return Ve(t,i,e||0===e?+e+ln(t,i)+"px":"")}}function ln(n,t,e){return void 0===e&&(e="border-box"),Ve(n,"boxSizing")===e?nn[t].map(p).reduce(function(t,e){return t+L(Ve(n,"padding"+e))+L(Ve(n,"border"+e+"Width"))},0):0}function dn(t){for(var e in nn)for(var n in nn[e])if(nn[e][n]===t)return nn[e][1-n];return t}function fn(t,e,n){return void 0===e&&(e="width"),void 0===n&&(n=window),B(t)?+t:u(t,"vh")?pn(un(V(n)),t):u(t,"vw")?pn(cn(V(n)),t):u(t,"%")?pn(rn(n)[e],t):L(t)}function pn(t,e){return t*L(e)/100}var mn={reads:[],writes:[],read:function(t){return this.reads.push(t),wn(),t},write:function(t){return this.writes.push(t),wn(),t},clear:function(t){xn(this.reads,t),xn(this.writes,t);},flush:gn};function gn(t){void 0===t&&(t=1),bn(mn.reads),bn(mn.writes.splice(0)),mn.scheduled=!1,(mn.reads.length||mn.writes.length)&&wn(t+1);}var vn=4;function wn(t){mn.scheduled||(mn.scheduled=!0,t&&t<vn?ce.resolve().then(function(){return gn(t)}):requestAnimationFrame(function(){return gn()}));}function bn(t){for(var e;e=t.shift();)try{e();}catch(t){console.error(t);}}function xn(t,e){e=t.indexOf(e);return ~e&&t.splice(e,1)}function yn(){}yn.prototype={positions:[],init:function(){var e,t=this;this.positions=[],this.unbind=Kt(document,"mousemove",function(t){return e=ae(t)}),this.interval=setInterval(function(){e&&(t.positions.push(e),5<t.positions.length&&t.positions.shift());},50);},cancel:function(){this.unbind&&this.unbind(),this.interval&&clearInterval(this.interval);},movesTo:function(t){if(this.positions.length<2)return !1;var e=t.getBoundingClientRect(),n=e.left,i=e.right,r=e.top,o=e.bottom,s=this.positions[0],t=X(this.positions),a=[s,t];return !et(t,e)&&[[{x:n,y:r},{x:i,y:o}],[{x:n,y:o},{x:i,y:r}]].some(function(t){t=function(t,e){var n=t[0],i=n.x,r=n.y,o=t[1],s=o.x,a=o.y,u=e[0],n=u.x,t=u.y,o=e[1],u=o.x,e=o.y,o=(e-t)*(s-i)-(u-n)*(a-r);if(0==o)return !1;o=((u-n)*(r-t)-(e-t)*(i-n))/o;if(o<0)return !1;return {x:i+o*(s-i),y:r+o*(a-r)}}(a,t);return t&&et(t,e)})}};var kn={};function $n(t,e,n){return kn.computed(k(t)?t.call(n,n):t,k(e)?e.call(n,n):e)}function Sn(t,e){return t=t&&!y(t)?[t]:t,e?t?t.concat(e):y(e)?e:[e]:t}function In(e,n,i){var t,r,o={};if((n=k(n)?n.options:n).extends&&(e=In(e,n.extends,i)),n.mixins)for(var s=0,a=n.mixins.length;s<a;s++)e=In(e,n.mixins[s],i);for(t in e)u(t);for(r in n)c(e,r)||u(r);function u(t){o[t]=(kn[t]||function(t,e){return O(e)?t:e})(e[t],n[t],i);}return o}function Tn(t,e){var n;void 0===e&&(e=[]);try{return t?g(t,"{")?JSON.parse(t):e.length&&!w(t,":")?((n={})[e[0]]=t,n):t.split(";").reduce(function(t,e){var n=e.split(/:(.*)/),e=n[0],n=n[1];return e&&!O(n)&&(t[e.trim()]=n.trim()),t},{}):{}}catch(t){return {}}}function En(t){if(Mn(t)&&Bn(t,{func:"playVideo",method:"play"}),An(t))try{t.play().catch(Q);}catch(t){}}function Cn(t){Mn(t)&&Bn(t,{func:"pauseVideo",method:"pause"}),An(t)&&t.pause();}function _n(t){Mn(t)&&Bn(t,{func:"mute",method:"setVolume",value:0}),An(t)&&(t.muted=!0);}function An(t){return t&&"VIDEO"===t.tagName}function Mn(t){return t&&"IFRAME"===t.tagName&&(zn(t)||Nn(t))}function zn(t){return !!t.src.match(/\/\/.*?youtube(-nocookie)?\.[a-z]+\/(watch\?v=[^&\s]+|embed)|youtu\.be\/.*/)}function Nn(t){return !!t.src.match(/vimeo\.com\/video\/.*/)}function Bn(t,e){(function(e){if(e[On])return e[On];var n,i=zn(e),r=Nn(e),o=++Pn;return e[On]=new ce(function(t){i&&Zt(e,"load",function(){function t(){return Dn(e,{event:"listening",id:o})}n=setInterval(t,100),t();}),Zt(window,"message",t,!1,function(t){var e=t.data;try{return (e=JSON.parse(e))&&(i&&e.id===o&&"onReady"===e.event||r&&Number(e.player_id)===o)}catch(t){}}),e.src=e.src+(w(e.src,"?")?"&":"?")+(i?"enablejsapi=1":"api=1&player_id="+o);}).then(function(){return clearInterval(n)})})(t).then(function(){return Dn(t,e)});}function Dn(t,e){try{t.contentWindow.postMessage(JSON.stringify(Y({event:"command"},e)),"*");}catch(t){}}kn.events=kn.created=kn.beforeConnect=kn.connected=kn.beforeDisconnect=kn.disconnected=kn.destroy=Sn,kn.args=function(t,e){return !1!==e&&Sn(e||t)},kn.update=function(t,e){return K(Sn(t,k(e)?{read:e}:e),"order")},kn.props=function(t,e){return y(e)&&(e=e.reduce(function(t,e){return t[e]=String,t},{})),kn.methods(t,e)},kn.computed=kn.methods=function(t,e){return e?t?Y({},t,e):e:t},kn.data=function(e,n,t){return t?$n(e,n,t):n?e?function(t){return $n(e,n,t)}:n:e};var On="_ukPlayer",Pn=0;function Hn(t,r,o){return void 0===r&&(r=0),void 0===o&&(o=0),!!$t(t)&&tt.apply(void 0,Wn(t).map(function(t){var e=on(Vn(t)),n=e.top,i=e.left,t=e.bottom,e=e.right;return {top:n-r,left:i-o,bottom:t+r,right:e+o}}).concat(on(t)))}function Ln(t,e){(t=(T(t)||E(t)?Rn:F)(t)).scrollTop=e;}function jn(s,t){var a=(t=void 0===t?{}:t).offset;if(void 0===a&&(a=0),$t(s)){var u=Wn(s),c=0;return u.reduce(function(t,e,n){var i=e.scrollTop,r=e.scrollHeight-e.clientHeight,o=Math.ceil(on(u[n-1]||s).top-on(Vn(e)).top-a+c+i);return r<o?(c=o-r,o=r):c=0,function(){return s=e,a=o-i,new ce(function(n){var t,i=s.scrollTop,r=(t=Math.abs(a),40*Math.pow(t,.375)),o=Date.now();!function t(){var e,e=(e=Z((Date.now()-o)/r),.5*(1-Math.cos(Math.PI*e)));Ln(s,i+a*e),1!=e?requestAnimationFrame(t):n();}();}).then(t);var s,a;}},function(){return ce.resolve()})()}}function Fn(t,e){if(void 0===e&&(e=0),!$t(t))return 0;var n=Wn(t,/auto|scroll/,!0)[0],i=n.clientHeight,r=n.scrollHeight,o=n.scrollTop,s=an(t)[0]-o-an(n)[0],n=Math.min(i,s+o);return Z(-1*(s-n)/Math.min(t.offsetHeight+e+n,r-(s+o),r-i))}function Wn(t,e,n){void 0===e&&(e=/auto|scroll|hidden/),void 0===n&&(n=!1);var i=Rn(t),r=Bt(t).reverse(),t=x(r=r.slice(r.indexOf(i)+1),function(t){return "fixed"===Ve(t,"position")});return ~t&&(r=r.slice(t)),[i].concat(r.filter(function(t){return e.test(Ve(t,"overflow"))&&(!n||t.scrollHeight>t.clientHeight)})).reverse()}function Vn(t){return t===Rn(t)?window:t}function Rn(t){t=V(t).document;return t.scrollingElement||t.documentElement}var qn={width:["x","left","right"],height:["y","top","bottom"]};function Un(t,e,h,l,d,n,i,r){h=Xn(h),l=Xn(l);var f={element:h,target:l};if(!t||!e)return f;var o,p=on(t),m=on(e),g=m;return Yn(g,h,p,-1),Yn(g,l,m,1),d=Gn(d,p.width,p.height),n=Gn(n,m.width,m.height),d.x+=n.x,d.y+=n.y,g.left+=d.x,g.top+=d.y,i&&(o=Wn(t).map(Vn),r&&w(o,r)&&o.unshift(r),o=o.map(function(t){return on(t)}),G(qn,function(t,s){var a=t[0],u=t[1],c=t[2];!0!==i&&!w(i,a)||o.some(function(n){var t=h[a]===u?-p[s]:h[a]===c?p[s]:0,e=l[a]===u?m[s]:l[a]===c?-m[s]:0;if(g[u]<n[u]||g[u]+p[s]>n[c]){var i=p[s]/2,r="center"===l[a]?-m[s]/2:0;return "center"===h[a]&&(o(i,r)||o(-i,-r))||o(t,e)}function o(e,t){t=L((g[u]+e+t-2*d[a]).toFixed(4));if(t>=n[u]&&t+p[s]<=n[c])return g[u]=t,["element","target"].forEach(function(t){f[t][a]=e?f[t][a]===qn[s][1]?qn[s][2]:qn[s][1]:f[t][a];}),!0}});})),on(t,g),f}function Yn(r,o,s,a){G(qn,function(t,e){var n=t[0],i=t[1],t=t[2];o[n]===t?r[i]+=s[e]*a:"center"===o[n]&&(r[i]+=s[e]*a/2);});}function Xn(t){var e=/left|center|right/,n=/top|center|bottom/;return 1===(t=(t||"").split(" ")).length&&(t=e.test(t[0])?t.concat("center"):n.test(t[0])?["center"].concat(t):["center","center"]),{x:e.test(t[0])?t[0]:"center",y:n.test(t[1])?t[1]:"center"}}function Gn(t,e,n){var i=(t||"").split(" "),t=i[0],i=i[1];return {x:t?L(t)*(u(t,"%")?e/100:1):0,y:i?L(i)*(u(i,"%")?n/100:1):0}}var Kn=Object.freeze({__proto__:null,ajax:pe,getImage:me,transition:Ke,Transition:Je,animate:Qe,Animation:en,attr:ot,hasAttr:st,removeAttr:at,data:ut,addClass:Ne,removeClass:Be,removeClasses:De,replaceClass:Oe,hasClass:Pe,toggleClass:He,dimensions:rn,offset:on,position:sn,offsetPosition:an,height:un,width:cn,boxModelAdjust:ln,flipPosition:dn,toPx:fn,ready:function(t){var e;"loading"===document.readyState?e=Kt(document,"DOMContentLoaded",function(){e(),t();}):t();},empty:ge,html:ve,prepend:function(e,t){return (e=Ae(e)).hasChildNodes()?ye(t,function(t){return e.insertBefore(t,e.firstChild)}):we(e,t)},append:we,before:be,after:xe,remove:ke,wrapAll:$e,wrapInner:Se,unwrap:Ie,fragment:Ce,apply:_e,$:Ae,$$:Me,inBrowser:ct,isIE:ht,isRtl:lt,hasTouch:pt,pointerDown:mt,pointerMove:gt,pointerUp:vt,pointerEnter:wt,pointerLeave:bt,pointerCancel:xt,on:Kt,off:Jt,once:Zt,trigger:Qt,createEvent:te,toEventTargets:oe,isTouch:se,getEventPos:ae,fastdom:mn,isVoidElement:kt,isVisible:$t,selInput:St,isInput:It,parent:Tt,filter:Et,matches:At,closest:zt,within:Nt,parents:Bt,children:Dt,index:Ot,hasOwn:c,hyphenate:d,camelize:f,ucfirst:p,startsWith:g,endsWith:u,includes:w,findIndex:x,isArray:y,isFunction:k,isObject:$,isPlainObject:I,isWindow:T,isDocument:E,isNode:C,isElement:_,isBoolean:M,isString:z,isNumber:N,isNumeric:B,isEmpty:D,isUndefined:O,toBoolean:P,toNumber:H,toFloat:L,toArray:j,toNode:F,toNodes:W,toWindow:V,toMs:R,isEqual:q,swap:U,assign:Y,last:X,each:G,sortBy:K,uniqueBy:J,clamp:Z,noop:Q,intersectRect:tt,pointInRect:et,Dimensions:nt,getIndex:it,cacheFunction:rt,MouseTracker:yn,mergeOptions:In,parseOptions:Tn,play:En,pause:Cn,mute:_n,positionAt:Un,Promise:ce,Deferred:ue,query:Pt,queryAll:Ht,find:jt,findAll:Ft,escape:Gt,css:Ve,getCssVar:Ye,propName:Xe,isInView:Hn,scrollTop:Ln,scrollIntoView:jn,scrolledOver:Fn,scrollParents:Wn,getViewport:Vn});function Jn(t){this._init(t);}var Zn,Qn,ti,ei,ni,ii,ri,oi,si,ai=rt(function(t){return !(!g(t,"uk-")&&!g(t,"data-uk-"))&&f(t.replace("data-uk-","").replace("uk-",""))});function ui(t,e){if(t)for(var n in t)t[n]._connected&&t[n]._callUpdate(e);}function ci(t,e){var n={},i=t.args;void 0===i&&(i=[]);var r=t.props;void 0===r&&(r={});var o,s=t.el;if(!r)return n;for(o in r){var a=d(o),u=ut(s,a);O(u)||(u=r[o]===Boolean&&""===u||li(r[o],u),("target"!==a||u&&!g(u,"_"))&&(n[o]=u));}var c,h=Tn(ut(s,e),i);for(c in h){var l=f(c);void 0!==r[l]&&(n[l]=li(r[l],h[c]));}return n}function hi(e,n,i){var t=(n=!I(n)?{name:i,handler:n}:n).name,r=n.el,o=n.handler,s=n.capture,a=n.passive,u=n.delegate,c=n.filter,h=n.self,r=k(r)?r.call(e):r||e.$el;y(r)?r.forEach(function(t){return hi(e,Y({},n,{el:t}),i)}):!r||c&&!c.call(e)||e._events.push(Kt(r,t,u?z(u)?u:u.call(e):null,z(o)?e[o]:o.bind(e),{passive:a,capture:s,self:h}));}function li(t,e){return t===Boolean?P(e):t===Number?H(e):"list"===t?y(n=e)?n:z(n)?n.split(/,(?![^(]*\))/).map(function(t){return B(t)?H(t):P(t.trim())}):[n]:t?t(e):e;var n;}Jn.util=Kn,Jn.data="__uikit__",Jn.prefix="uk-",Jn.options={},Jn.version="3.6.16",ti=(Zn=Jn).data,Zn.use=function(t){if(!t.installed)return t.call(null,this),t.installed=!0,this},Zn.mixin=function(t,e){(e=(z(e)?Zn.component(e):e)||this).options=In(e.options,t);},Zn.extend=function(t){t=t||{};function e(t){this._init(t);}return ((e.prototype=Object.create(this.prototype)).constructor=e).options=In(this.options,t),e.super=this,e.extend=this.extend,e},Zn.update=function(t,e){Bt(t=t?F(t):document.body).reverse().forEach(function(t){return ui(t[ti],e)}),_e(t,function(t){return ui(t[ti],e)});},Object.defineProperty(Zn,"container",{get:function(){return Qn||document.body},set:function(t){Qn=Ae(t);}}),(ei=Jn).prototype._callHook=function(t){var e=this,t=this.$options[t];t&&t.forEach(function(t){return t.call(e)});},ei.prototype._callConnected=function(){this._connected||(this._data={},this._computeds={},this._initProps(),this._callHook("beforeConnect"),this._connected=!0,this._initEvents(),this._initObservers(),this._callHook("connected"),this._callUpdate());},ei.prototype._callDisconnected=function(){this._connected&&(this._callHook("beforeDisconnect"),this._disconnectObservers(),this._unbindEvents(),this._callHook("disconnected"),this._connected=!1,delete this._watch);},ei.prototype._callUpdate=function(t){var e=this;void 0===t&&(t="update"),this._connected&&("update"!==t&&"resize"!==t||this._callWatches(),this.$options.update&&(this._updates||(this._updates=new Set,mn.read(function(){(function(i){for(var r=this,o=this.$options.update,t=0;t<o.length;t++)!function(t){var t=(n=o[t]).read,e=n.write,n=n.events;(i.has("update")||n&&n.some(function(t){return i.has(t)}))&&(n=void 0,t&&(n=t.call(r,r._data,i))&&I(n)&&Y(r._data,n),e&&!1!==n&&mn.write(function(){return e.call(r,r._data,i)}));}(t);}).call(e,e._updates),delete e._updates;})),this._updates.add(t.type||t)));},ei.prototype._callWatches=function(){var a,u=this;this._watch||(a=!c(this,"_watch"),this._watch=mn.read(function(){var t,e=u.$options.computed,n=u._computeds;for(t in e){var i=c(n,t),r=n[t];delete n[t];var o=e[t],s=o.watch,o=o.immediate;s&&(a&&o||i&&!q(r,u[t]))&&s.call(u,u[t],r);}u._watch=null;}));},ii=0,(ni=Jn).prototype._init=function(t){(t=t||{}).data=function(t,e){var n=t.data,i=e.args,r=e.props;void 0===r&&(r={});if(n=y(n)?D(i)?void 0:n.slice(0,i.length).reduce(function(t,e,n){return I(e)?Y(t,e):t[i[n]]=e,t},{}):n)for(var o in n)O(n[o])?delete n[o]:n[o]=r[o]?li(r[o],n[o]):n[o];return n}(t,this.constructor.options),this.$options=In(this.constructor.options,t,this),this.$el=null,this.$props={},this._uid=ii++,this._initData(),this._initMethods(),this._initComputeds(),this._callHook("created"),t.el&&this.$mount(t.el);},ni.prototype._initData=function(){var t,e=this.$options.data;for(t in e=void 0===e?{}:e)this.$props[t]=this[t]=e[t];},ni.prototype._initMethods=function(){var t=this.$options.methods;if(t)for(var e in t)this[e]=t[e].bind(this);},ni.prototype._initComputeds=function(){var t=this.$options.computed;if(this._computeds={},t)for(var e in t)!function(i,r,o){Object.defineProperty(i,r,{enumerable:!0,get:function(){var t=i._computeds,e=i.$props,n=i.$el;return c(t,r)||(t[r]=(o.get||o).call(i,e,n)),t[r]},set:function(t){var e=i._computeds;e[r]=o.set?o.set.call(i,t):t,O(e[r])&&delete e[r];}});}(this,e,t[e]);},ni.prototype._initProps=function(t){for(var e in t=t||ci(this.$options,this.$name))O(t[e])||(this.$props[e]=t[e]);var n=[this.$options.computed,this.$options.methods];for(e in this.$props)e in t&&function(t,e){return t.every(function(t){return !t||!c(t,e)})}(n,e)&&(this[e]=this.$props[e]);},ni.prototype._initEvents=function(){var n=this;this._events=[];var t=this.$options.events;t&&t.forEach(function(t){if(c(t,"handler"))hi(n,t);else for(var e in t)hi(n,t[e],e);});},ni.prototype._unbindEvents=function(){this._events.forEach(function(t){return t()}),delete this._events;},ni.prototype._initObservers=function(){var t,e,n;this._observers=[(e=(t=this).$options.el,(n=new MutationObserver(function(){return t.$emit()})).observe(e,{childList:!0,subtree:!0}),n),function(e){var i=e.$name,r=e.$options,o=e.$props,t=r.attrs,n=r.props,s=r.el;if(!n||!1===t)return;var a=y(t)?t:Object.keys(n),t=a.map(function(t){return d(t)}).concat(i),n=new MutationObserver(function(t){var n=ci(r,i);t.some(function(t){var e=t.attributeName,t=e.replace("data-","");return (t===i?a:[f(t),f(e)]).some(function(t){return !O(n[t])&&n[t]!==o[t]})})&&e.$reset();});return n.observe(s,{attributes:!0,attributeFilter:t.concat(t.map(function(t){return "data-"+t}))}),n}(this)];},ni.prototype._disconnectObservers=function(){this._observers.forEach(function(t){return t&&t.disconnect()});},oi=(ri=Jn).data,si={},ri.component=function(s,t){var e=d(s);if(s=f(e),!t)return I(si[s])&&(si[s]=ri.extend(si[s])),si[s];ri[s]=function(t,n){for(var e=arguments.length,i=Array(e);e--;)i[e]=arguments[e];var r=ri.component(s);return r.options.functional?new r({data:I(t)?t:[].concat(i)}):t?Me(t).map(o)[0]:o(t);function o(t){var e=ri.getComponent(t,s);if(e){if(!n)return e;e.$destroy();}return new r({el:t,data:n})}};var n=I(t)?Y({},t):t.options;return n.name=s,n.install&&n.install(ri,n,s),ri._initialized&&!n.functional&&mn.read(function(){return ri[s]("[uk-"+e+"],[data-uk-"+e+"]")}),si[s]=I(t)?n:t},ri.getComponents=function(t){return t&&t[oi]||{}},ri.getComponent=function(t,e){return ri.getComponents(t)[e]},ri.connect=function(t){if(t[oi])for(var e in t[oi])t[oi][e]._callConnected();for(var n=0;n<t.attributes.length;n++){var i=ai(t.attributes[n].name);i&&i in si&&ri[i](t);}},ri.disconnect=function(t){for(var e in t[oi])t[oi][e]._callDisconnected();},function(i){var r=i.data;i.prototype.$create=function(t,e,n){return i[t](e,n)},i.prototype.$mount=function(t){var e=this.$options.name;t[r]||(t[r]={}),t[r][e]||((t[r][e]=this).$el=this.$options.el=this.$options.el||t,Nt(t,document)&&this._callConnected());},i.prototype.$reset=function(){this._callDisconnected(),this._callConnected();},i.prototype.$destroy=function(t){void 0===t&&(t=!1);var e=this.$options,n=e.el,e=e.name;n&&this._callDisconnected(),this._callHook("destroy"),n&&n[r]&&(delete n[r][e],D(n[r])||delete n[r],t&&ke(this.$el));},i.prototype.$emit=function(t){this._callUpdate(t);},i.prototype.$update=function(t,e){void 0===t&&(t=this.$el),i.update(t,e);},i.prototype.$getComponent=i.getComponent;var t=rt(function(t){return i.prefix+d(t)});Object.defineProperties(i.prototype,{$container:Object.getOwnPropertyDescriptor(i,"container"),$name:{get:function(){return t(this.$options.name)}}});}(Jn);var di={connected:function(){Pe(this.$el,this.$name)||Ne(this.$el,this.$name);}},fi={props:{cls:Boolean,animation:"list",duration:Number,origin:String,transition:String},data:{cls:!1,animation:[!1],duration:200,origin:!1,transition:"linear",clsEnter:"uk-togglabe-enter",clsLeave:"uk-togglabe-leave",initProps:{overflow:"",height:"",paddingTop:"",paddingBottom:"",marginTop:"",marginBottom:""},hideProps:{overflow:"hidden",height:0,paddingTop:0,paddingBottom:0,marginTop:0,marginBottom:0}},computed:{hasAnimation:function(t){return !!t.animation[0]},hasTransition:function(t){t=t.animation;return this.hasAnimation&&!0===t[0]}},methods:{toggleElement:function(e,s,a){var u=this;return new ce(function(t){return ce.all(W(e).map(function(t){var e=M(s)?s:!u.isToggled(t);if(!Qt(t,"before"+(e?"show":"hide"),[u]))return ce.reject();var o,n=(k(a)?a:!1!==a&&u.hasAnimation?u.hasTransition?pi(u):(o=u,function(t,e){en.cancel(t);var n=o.animation,i=o.duration,r=o._toggle;return e?(r(t,!0),en.in(t,n[0],i,o.origin)):en.out(t,n[1]||n[0],i,o.origin).then(function(){return r(t,!1)})}):u._toggle)(t,e),i=e?u.clsEnter:u.clsLeave;Ne(t,i),Qt(t,e?"show":"hide",[u]);function r(){Be(t,i),Qt(t,e?"shown":"hidden",[u]),u.$update(t);}return n?n.then(r,function(){return Be(t,i),ce.reject()}):r()})).then(t,Q)})},isToggled:function(t){return !!Pe(t=void 0===t?this.$el:t,this.clsEnter)||!Pe(t,this.clsLeave)&&(this.cls?Pe(t,this.cls.split(" ")[0]):!st(t,"hidden"))},_toggle:function(t,e){var n;t&&(e=Boolean(e),this.cls?(n=w(this.cls," ")||e!==Pe(t,this.cls))&&He(t,this.cls,w(this.cls," ")?void 0:e):(n=e===t.hidden)&&(t.hidden=!e),Me("[autofocus]",t).some(function(t){return $t(t)?t.focus()||!0:t.blur()}),n&&(Qt(t,"toggled",[e,this]),this.$update(t)));}}};function pi(t){var o=t.isToggled,s=t.duration,a=t.initProps,u=t.hideProps,c=t.transition,h=t._toggle;return function(t,e){var n=Je.inProgress(t),i=t.hasChildNodes?L(Ve(t.firstElementChild,"marginTop"))+L(Ve(t.lastElementChild,"marginBottom")):0,r=$t(t)?un(t)+(n?0:i):0;Je.cancel(t),o(t)||h(t,!0),un(t,""),mn.flush();i=un(t)+(n?0:i);return un(t,r),(e?Je.start(t,Y({},a,{overflow:"hidden",height:i}),Math.round(s*(1-r/i)),c):Je.start(t,u,Math.round(s*(r/i)),c).then(function(){return h(t,!1)})).then(function(){return Ve(t,a)})}}var mi={mixins:[di,fi],props:{targets:String,active:null,collapsible:Boolean,multiple:Boolean,toggle:String,content:String,transition:String,offset:Number},data:{targets:"> *",active:!1,animation:[!0],collapsible:!0,multiple:!1,clsOpen:"uk-open",toggle:"> .uk-accordion-title",content:"> .uk-accordion-content",transition:"ease",offset:0},computed:{items:{get:function(t,e){return Me(t.targets,e)},watch:function(t,e){var n=this;t.forEach(function(t){return gi(Ae(n.content,t),!Pe(t,n.clsOpen))}),e||Pe(t,this.clsOpen)||(t=!1!==this.active&&t[Number(this.active)]||!this.collapsible&&t[0])&&this.toggle(t,!1);},immediate:!0},toggles:function(t){var e=t.toggle;return this.items.map(function(t){return Ae(e,t)})}},events:[{name:"click",delegate:function(){return this.targets+" "+this.$props.toggle},handler:function(t){t.preventDefault(),this.toggle(Ot(this.toggles,t.current));}}],methods:{toggle:function(t,r){var o=this,e=[this.items[it(t,this.items)]],t=Et(this.items,"."+this.clsOpen);this.multiple||w(t,e[0])||(e=e.concat(t)),!this.collapsible&&t.length<2&&!Et(e,":not(."+this.clsOpen+")").length||e.forEach(function(t){return o.toggleElement(t,!Pe(t,o.clsOpen),function(e,n){He(e,o.clsOpen,n),ot(Ae(o.$props.toggle,e),"aria-expanded",n);var i=Ae((e._wrapper?"> * ":"")+o.content,e);if(!1!==r&&o.hasTransition)return e._wrapper||(e._wrapper=$e(i,"<div"+(n?" hidden":"")+">")),gi(i,!1),pi(o)(e._wrapper,n).then(function(){var t;gi(i,!n),delete e._wrapper,Ie(i),n&&(Hn(t=Ae(o.$props.toggle,e))||jn(t,{offset:o.offset}));});gi(i,!n);})});}}};function gi(t,e){t&&(t.hidden=e);}var vi={mixins:[di,fi],args:"animation",props:{close:String},data:{animation:[!0],selClose:".uk-alert-close",duration:150,hideProps:Y({opacity:0},fi.data.hideProps)},events:[{name:"click",delegate:function(){return this.selClose},handler:function(t){t.preventDefault(),this.close();}}],methods:{close:function(){var t=this;this.toggleElement(this.$el).then(function(){return t.$destroy(!0)});}}},wi={args:"autoplay",props:{automute:Boolean,autoplay:Boolean},data:{automute:!1,autoplay:!0},computed:{inView:function(t){return "inview"===t.autoplay}},connected:function(){this.inView&&!st(this.$el,"preload")&&(this.$el.preload="none"),this.automute&&_n(this.$el);},update:{read:function(){return {visible:$t(this.$el)&&"hidden"!==Ve(this.$el,"visibility"),inView:this.inView&&Hn(this.$el)}},write:function(t){var e=t.visible,t=t.inView;!e||this.inView&&!t?Cn(this.$el):(!0===this.autoplay||this.inView&&t)&&En(this.$el);},events:["resize","scroll"]}},bi={mixins:[di,wi],props:{width:Number,height:Number},data:{automute:!0},update:{read:function(){var t=this.$el,e=function(t){for(;t=Tt(t);)if("static"!==Ve(t,"position"))return t}(t)||Tt(t),n=e.offsetHeight,e=e.offsetWidth,n=nt.cover({width:this.width||t.naturalWidth||t.videoWidth||t.clientWidth,height:this.height||t.naturalHeight||t.videoHeight||t.clientHeight},{width:e+(e%2?1:0),height:n+(n%2?1:0)});return !(!n.width||!n.height)&&n},write:function(t){var e=t.height,t=t.width;Ve(this.$el,{height:e,width:t});},events:["resize"]}};var xi,yi={props:{pos:String,offset:null,flip:Boolean,clsPos:String},data:{pos:"bottom-"+(lt?"right":"left"),flip:!0,offset:!1,clsPos:""},computed:{pos:function(t){t=t.pos;return (t+(w(t,"-")?"":"-center")).split("-")},dir:function(){return this.pos[0]},align:function(){return this.pos[1]}},methods:{positionAt:function(t,e,n){De(t,this.clsPos+"-(top|bottom|left|right)(-[a-z]+)?");var i,r=this.offset,o=this.getAxis();B(r)||(r=(i=Ae(r))?on(i)["x"===o?"left":"top"]-on(e)["x"===o?"right":"bottom"]:0);r=Un(t,e,"x"===o?dn(this.dir)+" "+this.align:this.align+" "+dn(this.dir),"x"===o?this.dir+" "+this.align:this.align+" "+this.dir,"x"===o?""+("left"===this.dir?-r:r):" "+("top"===this.dir?-r:r),null,this.flip,n).target,n=r.x,r=r.y;this.dir="x"===o?n:r,this.align="x"===o?r:n,He(t,this.clsPos+"-"+this.dir+"-"+this.align,!1===this.offset);},getAxis:function(){return "top"===this.dir||"bottom"===this.dir?"y":"x"}}},ki={mixins:[yi,fi],args:"pos",props:{mode:"list",toggle:Boolean,boundary:Boolean,boundaryAlign:Boolean,delayShow:Number,delayHide:Number,clsDrop:String},data:{mode:["click","hover"],toggle:"- *",boundary:!0,boundaryAlign:!1,delayShow:0,delayHide:800,clsDrop:!1,animation:["uk-animation-fade"],cls:"uk-open"},computed:{boundary:function(t,e){t=t.boundary;return !0===t?window:Pt(t,e)},clsDrop:function(t){return t.clsDrop||"uk-"+this.$options.name},clsPos:function(){return this.clsDrop}},created:function(){this.tracker=new yn;},connected:function(){Ne(this.$el,this.clsDrop);var t=this.$props.toggle;this.toggle=t&&this.$create("toggle",Pt(t,this.$el),{target:this.$el,mode:this.mode});},disconnected:function(){this.isActive()&&(xi=null);},events:[{name:"click",delegate:function(){return "."+this.clsDrop+"-close"},handler:function(t){t.preventDefault(),this.hide(!1);}},{name:"click",delegate:function(){return 'a[href^="#"]'},handler:function(t){var e=t.defaultPrevented,t=t.current.hash;e||!t||Nt(t,this.$el)||this.hide(!1);}},{name:"beforescroll",handler:function(){this.hide(!1);}},{name:"toggle",self:!0,handler:function(t,e){t.preventDefault(),this.isToggled()?this.hide(!1):this.show(e,!1);}},{name:"toggleshow",self:!0,handler:function(t,e){t.preventDefault(),this.show(e);}},{name:"togglehide",self:!0,handler:function(t){t.preventDefault(),this.hide();}},{name:wt,filter:function(){return w(this.mode,"hover")},handler:function(t){se(t)||this.clearTimers();}},{name:bt,filter:function(){return w(this.mode,"hover")},handler:function(t){!se(t)&&t.relatedTarget&&this.hide();}},{name:"toggled",self:!0,handler:function(t,e){e&&(this.clearTimers(),this.position());}},{name:"show",self:!0,handler:function(){var r=this;(xi=this).tracker.init(),Zt(this.$el,"hide",Kt(document,mt,function(t){var i=t.target;return !Nt(i,r.$el)&&Zt(document,vt+" "+xt+" scroll",function(t){var e=t.defaultPrevented,n=t.type,t=t.target;e||n!==vt||i!==t||r.toggle&&Nt(i,r.toggle.$el)||r.hide(!1);},!0)}),{self:!0}),Zt(this.$el,"hide",Kt(document,"keydown",function(t){27===t.keyCode&&r.hide(!1);}),{self:!0});}},{name:"beforehide",self:!0,handler:function(){this.clearTimers();}},{name:"hide",handler:function(t){t=t.target;this.$el===t?(xi=this.isActive()?null:xi,this.tracker.cancel()):xi=null===xi&&Nt(t,this.$el)&&this.isToggled()?this:xi;}}],update:{write:function(){this.isToggled()&&!Pe(this.$el,this.clsEnter)&&this.position();},events:["resize"]},methods:{show:function(t,e){var n,i=this;if(void 0===t&&(t=this.toggle),void 0===e&&(e=!0),this.isToggled()&&t&&this.toggle&&t.$el!==this.toggle.$el&&this.hide(!1),this.toggle=t,this.clearTimers(),!this.isActive()){if(xi){if(e&&xi.isDelaying)return void(this.showTimer=setTimeout(this.show,10));for(;xi&&n!==xi&&!Nt(this.$el,xi.$el);)(n=xi).hide(!1);}this.showTimer=setTimeout(function(){return !i.isToggled()&&i.toggleElement(i.$el,!0)},e&&this.delayShow||0);}},hide:function(t){var e=this;void 0===t&&(t=!0);function n(){return e.toggleElement(e.$el,!1,!1)}var i,r;this.clearTimers(),this.isDelaying=(i=this.$el,r=[],_e(i,function(t){return "static"!==Ve(t,"position")&&r.push(t)}),r.some(function(t){return e.tracker.movesTo(t)})),t&&this.isDelaying?this.hideTimer=setTimeout(this.hide,50):t&&this.delayHide?this.hideTimer=setTimeout(n,this.delayHide):n();},clearTimers:function(){clearTimeout(this.showTimer),clearTimeout(this.hideTimer),this.showTimer=null,this.hideTimer=null,this.isDelaying=!1;},isActive:function(){return xi===this},position:function(){Be(this.$el,this.clsDrop+"-stack"),He(this.$el,this.clsDrop+"-boundary",this.boundaryAlign);var t,e=on(this.boundary),n=this.boundaryAlign?e:on(this.toggle.$el);"justify"===this.align?(t="y"===this.getAxis()?"width":"height",Ve(this.$el,t,n[t])):this.boundary&&this.$el.offsetWidth>Math.max(e.right-n.left,n.right-e.left)&&Ne(this.$el,this.clsDrop+"-stack"),this.positionAt(this.$el,this.boundaryAlign?this.boundary:this.toggle.$el,this.boundary);}}};var $i={mixins:[di],args:"target",props:{target:Boolean},data:{target:!1},computed:{input:function(t,e){return Ae(St,e)},state:function(){return this.input.nextElementSibling},target:function(t,e){t=t.target;return t&&(!0===t&&Tt(this.input)===e&&this.input.nextElementSibling||Pt(t,e))}},update:function(){var t,e,n=this.target,i=this.input;!n||n[e=It(n)?"value":"textContent"]!==(i=i.files&&i.files[0]?i.files[0].name:At(i,"select")&&(t=Me("option",i).filter(function(t){return t.selected})[0])?t.textContent:i.value)&&(n[e]=i);},events:[{name:"change",handler:function(){this.$update();}},{name:"reset",el:function(){return zt(this.$el,"form")},handler:function(){this.$update();}}]},Si={update:{read:function(t){var e=Hn(this.$el);if(!e||t.isInView===e)return !1;t.isInView=e;},write:function(){this.$el.src=""+this.$el.src;},events:["scroll","resize"]}},Ii={props:{margin:String,firstColumn:Boolean},data:{margin:"uk-margin-small-top",firstColumn:"uk-first-column"},update:{read:function(){var t=Ti(this.$el.children);return {rows:t,columns:function(t){for(var e=[],n=0;n<t.length;n++)for(var i=Ei(t[n],"left","right"),r=0;r<i.length;r++)e[r]=e[r]?e[r].concat(i[r]):i[r];return lt?e.reverse():e}(t)}},write:function(t){for(var e=t.columns,n=t.rows,i=0;i<n.length;i++)for(var r=0;r<n[i].length;r++)He(n[i][r],this.margin,0!==i),He(n[i][r],this.firstColumn,!!~e[0].indexOf(n[i][r]));},events:["resize"]}};function Ti(t){return Ei(t,"top","bottom")}function Ei(t,e,n){for(var i=[[]],r=0;r<t.length;r++){var o=t[r];if($t(o))for(var s=Ci(o),a=i.length-1;0<=a;a--){var u=i[a];if(!u[0]){u.push(o);break}var c=void 0,c=u[0].offsetParent===o.offsetParent?Ci(u[0]):(s=Ci(o,!0),Ci(u[0],!0));if(s[e]>=c[n]-1&&s[e]!==c[e]){i.push([o]);break}if(s[n]-1>c[e]||s[e]===c[e]){u.push(o);break}if(0===a){i.unshift([o]);break}}}return i}function Ci(t,e){void 0===e&&(e=!1);var n=t.offsetTop,i=t.offsetLeft,r=t.offsetHeight,o=t.offsetWidth;return e&&(n=(t=an(t))[0],i=t[1]),{top:n,left:i,bottom:n+r,right:i+o}}var _i={extends:Ii,mixins:[di],name:"grid",props:{masonry:Boolean,parallax:Number},data:{margin:"uk-grid-margin",clsStack:"uk-grid-stack",masonry:!1,parallax:0},connected:function(){this.masonry&&Ne(this.$el,"uk-flex-top uk-flex-wrap-top");},update:[{write:function(t){t=t.columns;He(this.$el,this.clsStack,t.length<2);},events:["resize"]},{read:function(t){var e=t.columns,n=t.rows;if(!e.length||!this.masonry&&!this.parallax||Ai(this.$el))return t.translates=!1;var i,r,o=!1,s=Dt(this.$el),a=e.map(function(t){return t.reduce(function(t,e){return t+e.offsetHeight},0)}),u=(t=s,i=this.margin,L((s=t.filter(function(t){return Pe(t,i)})[0])?Ve(s,"marginTop"):Ve(t[0],"paddingLeft"))*(n.length-1)),c=Math.max.apply(Math,a)+u;this.masonry&&(e=e.map(function(t){return K(t,"offsetTop")}),t=e,r=n.map(function(t){return Math.max.apply(Math,t.map(function(t){return t.offsetHeight}))}),o=t.map(function(n){var i=0;return n.map(function(t,e){return i+=e?r[e-1]-n[e-1].offsetHeight:0})}));var h=Math.abs(this.parallax);return {padding:h=h&&a.reduce(function(t,e,n){return Math.max(t,e+u+(n%2?h:h/8)-c)},0),columns:e,translates:o,height:o?c:""}},write:function(t){var e=t.height,t=t.padding;Ve(this.$el,"paddingBottom",t||""),!1!==e&&Ve(this.$el,"height",e);},events:["resize"]},{read:function(t){t=t.height;return !Ai(this.$el)&&{scrolled:!!this.parallax&&Fn(this.$el,t?t-un(this.$el):0)*Math.abs(this.parallax)}},write:function(t){var e=t.columns,i=t.scrolled,r=t.translates;!1===i&&!r||e.forEach(function(t,n){return t.forEach(function(t,e){return Ve(t,"transform",i||r?"translateY("+((r&&-r[n][e])+(i?n%2?i:i/8:0))+"px)":"")})});},events:["scroll","resize"]}]};function Ai(t){return Dt(t).some(function(t){return "absolute"===Ve(t,"position")})}var Mi=ht?{props:{selMinHeight:String},data:{selMinHeight:!1,forceHeight:!1},computed:{elements:function(t,e){t=t.selMinHeight;return t?Me(t,e):[e]}},update:[{read:function(){Ve(this.elements,"height","");},order:-5,events:["resize"]},{write:function(){var n=this;this.elements.forEach(function(t){var e=L(Ve(t,"minHeight"));e&&(n.forceHeight||Math.round(e+ln(t,"height","content-box"))>=t.offsetHeight)&&Ve(t,"height",e);});},order:5,events:["resize"]}]}:{},zi={mixins:[Mi],args:"target",props:{target:String,row:Boolean},data:{target:"> *",row:!0,forceHeight:!0},computed:{elements:function(t,e){return Me(t.target,e)}},update:{read:function(){return {rows:(this.row?Ti(this.elements):[this.elements]).map(Ni)}},write:function(t){t.rows.forEach(function(t){var n=t.heights;return t.elements.forEach(function(t,e){return Ve(t,"minHeight",n[e])})});},events:["resize"]}};function Ni(t){if(t.length<2)return {heights:[""],elements:t};var n=t.map(Bi),i=Math.max.apply(Math,n),e=t.some(function(t){return t.style.minHeight}),r=t.some(function(t,e){return !t.style.minHeight&&n[e]<i});return e&&r&&(Ve(t,"minHeight",""),n=t.map(Bi),i=Math.max.apply(Math,n)),{heights:n=t.map(function(t,e){return n[e]===i&&L(t.style.minHeight).toFixed(2)!==i.toFixed(2)?"":i}),elements:t}}function Bi(t){var e=!1;$t(t)||(e=t.style.display,Ve(t,"display","block","important"));var n=rn(t).height-ln(t,"height","content-box");return !1!==e&&Ve(t,"display",e),n}var Di={mixins:[Mi],props:{expand:Boolean,offsetTop:Boolean,offsetBottom:Boolean,minHeight:Number},data:{expand:!1,offsetTop:!1,offsetBottom:!1,minHeight:0},update:{read:function(t){var e=t.minHeight;if(!$t(this.$el))return !1;var n="",i=ln(this.$el,"height","content-box");return this.expand?n=un(window)-(rn(document.documentElement).height-rn(this.$el).height)-i||"":(n="calc(100vh",this.offsetTop&&(n+=0<(t=on(this.$el).top)&&t<un(window)/2?" - "+t+"px":""),!0===this.offsetBottom?n+=" - "+rn(this.$el.nextElementSibling).height+"px":B(this.offsetBottom)?n+=" - "+this.offsetBottom+"vh":this.offsetBottom&&u(this.offsetBottom,"px")?n+=" - "+L(this.offsetBottom)+"px":z(this.offsetBottom)&&(n+=" - "+rn(Pt(this.offsetBottom,this.$el)).height+"px"),n+=(i?" - "+i+"px":"")+")"),{minHeight:n,prev:e}},write:function(t){var e=t.minHeight,t=t.prev;Ve(this.$el,{minHeight:e}),e!==t&&this.$update(this.$el,"resize"),this.minHeight&&L(Ve(this.$el,"minHeight"))<this.minHeight&&Ve(this.$el,"minHeight",this.minHeight);},events:["resize"]}},Oi={args:"src",props:{id:Boolean,icon:String,src:String,style:String,width:Number,height:Number,ratio:Number,class:String,strokeAnimation:Boolean,focusable:Boolean,attributes:"list"},data:{ratio:1,include:["style","class","focusable"],class:"",strokeAnimation:!1},beforeConnect:function(){this.class+=" uk-svg";},connected:function(){var t,n=this;!this.icon&&w(this.src,"#")&&(t=this.src.split("#"),this.src=t[0],this.icon=t[1]),this.svg=this.getSvg().then(function(t){if(n._connected){var e=function(t,e){if(kt(e)||"CANVAS"===e.tagName){e.hidden=!0;var n=e.nextElementSibling;return Fi(t,n)?n:xe(e,t)}n=e.lastElementChild;return Fi(t,n)?n:we(e,t)}(t,n.$el);return n.svgEl&&e!==n.svgEl&&ke(n.svgEl),n.applyAttributes(e,t),n.$emit(),n.svgEl=e}},Q);},disconnected:function(){var e=this;this.svg.then(function(t){e._connected||(kt(e.$el)&&(e.$el.hidden=!1),ke(t),e.svgEl=null);}),this.svg=null;},update:{read:function(){return !!(this.strokeAnimation&&this.svgEl&&$t(this.svgEl))},write:function(){var t,e;t=this.svgEl,(e=ji(t))&&t.style.setProperty("--uk-animation-stroke",e);},type:["resize"]},methods:{getSvg:function(){var e=this;return Pi(this.src).then(function(t){return function(t,e){e&&w(t,"<symbol")&&(t=function(t,e){if(!Li[t]){var n;for(Li[t]={},Hi.lastIndex=0;n=Hi.exec(t);)Li[t][n[3]]='<svg xmlns="http://www.w3.org/2000/svg"'+n[1]+"svg>";}return Li[t][e]}(t,e)||t);return (t=Ae(t.substr(t.indexOf("<svg"))))&&t.hasChildNodes()&&t}(t,e.icon)||ce.reject("SVG not found.")})},applyAttributes:function(n,e){var t,i,r=this;for(t in this.$options.props)w(this.include,t)&&t in this&&ot(n,t,this[t]);for(i in this.attributes){var o=this.attributes[i].split(":",2),s=o[0],o=o[1];ot(n,s,o);}this.id||at(n,"id");var a=["width","height"],u=a.map(function(t){return r[t]});u.some(function(t){return t})||(u=a.map(function(t){return ot(e,t)}));var c=ot(e,"viewBox");(u=c&&!u.some(function(t){return t})?c.split(" ").slice(2):u).forEach(function(t,e){return ot(n,a[e],L(t)*r.ratio||null)});}}},Pi=rt(function(n){return new ce(function(e,t){n?g(n,"data:")?e(decodeURIComponent(n.split(",")[1])):pe(n).then(function(t){return e(t.response)},function(){return t("SVG not found.")}):t();})});var Hi=/<symbol([^]*?id=(['"])(.+?)\2[^]*?<\/)symbol>/g,Li={};function ji(t){return Math.ceil(Math.max.apply(Math,[0].concat(Me("[stroke]",t).map(function(t){try{return t.getTotalLength()}catch(t){return 0}}))))}function Fi(t,e){return Wi(t)&&Wi(e)&&Vi(t)===Vi(e)}function Wi(t){return t&&"svg"===t.tagName}function Vi(t){return (t.innerHTML||(new XMLSerializer).serializeToString(t).replace(/<svg.*?>(.*?)<\/svg>/g,"$1")).replace(/\s/g,"")}var Ri={spinner:'<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" cx="15" cy="15" r="14"/></svg>',totop:'<svg width="18" height="10" viewBox="0 0 18 10" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.2" points="1 9 9 1 17 9 "/></svg>',marker:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="4" width="1" height="11"/><rect x="4" y="9" width="11" height="1"/></svg>',"close-icon":'<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" stroke-width="1.1" x1="1" y1="1" x2="13" y2="13"/><line fill="none" stroke="#000" stroke-width="1.1" x1="13" y1="1" x2="1" y2="13"/></svg>',"close-large":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" stroke-width="1.4" x1="1" y1="1" x2="19" y2="19"/><line fill="none" stroke="#000" stroke-width="1.4" x1="19" y1="1" x2="1" y2="19"/></svg>',"navbar-toggle-icon":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect y="9" width="20" height="2"/><rect y="3" width="20" height="2"/><rect y="15" width="20" height="2"/></svg>',"overlay-icon":'<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="19" y="0" width="1" height="40"/><rect x="0" y="19" width="40" height="1"/></svg>',"pagination-next":'<svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.2" points="1 1 6 6 1 11"/></svg>',"pagination-previous":'<svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.2" points="6 1 1 6 6 11"/></svg>',"search-icon":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="9" cy="9" r="7"/><path fill="none" stroke="#000" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z"/></svg>',"search-large":'<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.8" cx="17.5" cy="17.5" r="16.5"/><line fill="none" stroke="#000" stroke-width="1.8" x1="38" y1="39" x2="29" y2="30"/></svg>',"search-navbar":'<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="10.5" cy="10.5" r="9.5"/><line fill="none" stroke="#000" stroke-width="1.1" x1="23" y1="23" x2="17" y2="17"/></svg>',"slidenav-next":'<svg width="14" height="24" viewBox="0 0 14 24" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.4" points="1.225,23 12.775,12 1.225,1 "/></svg>',"slidenav-next-large":'<svg width="25" height="40" viewBox="0 0 25 40" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="2" points="4.002,38.547 22.527,20.024 4,1.5 "/></svg>',"slidenav-previous":'<svg width="14" height="24" viewBox="0 0 14 24" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.4" points="12.775,1 1.225,12 12.775,23 "/></svg>',"slidenav-previous-large":'<svg width="25" height="40" viewBox="0 0 25 40" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="2" points="20.527,1.5 2,20.024 20.525,38.547 "/></svg>'},qi={install:function(r){r.icon.add=function(t,e){var n,i=z(t)?((n={})[t]=e,n):t;G(i,function(t,e){Ri[e]=t,delete Ji[e];}),r._initialized&&_e(document.body,function(t){return G(r.getComponents(t),function(t){t.$options.isIcon&&t.icon in i&&t.$reset();})});};},extends:Oi,args:"icon",props:["icon"],data:{include:["focusable"]},isIcon:!0,beforeConnect:function(){Ne(this.$el,"uk-icon");},methods:{getSvg:function(){var t=function(t){if(!Ri[t])return null;Ji[t]||(Ji[t]=Ae((Ri[function(t){return lt?U(U(t,"left","right"),"previous","next"):t}(t)]||Ri[t]).trim()));return Ji[t].cloneNode(!0)}(this.icon);return t?ce.resolve(t):ce.reject("Icon not found.")}}},Ui={args:!1,extends:qi,data:function(t){return {icon:d(t.constructor.options.name)}},beforeConnect:function(){Ne(this.$el,this.$name);}},Yi={extends:Ui,beforeConnect:function(){Ne(this.$el,"uk-slidenav");},computed:{icon:function(t,e){t=t.icon;return Pe(e,"uk-slidenav-large")?t+"-large":t}}},Xi={extends:Ui,computed:{icon:function(t,e){t=t.icon;return Pe(e,"uk-search-icon")&&Bt(e,".uk-search-large").length?"search-large":Bt(e,".uk-search-navbar").length?"search-navbar":t}}},Gi={extends:Ui,computed:{icon:function(){return "close-"+(Pe(this.$el,"uk-close-large")?"large":"icon")}}},Ki={extends:Ui,connected:function(){var e=this;this.svg.then(function(t){return t&&1!==e.ratio&&Ve(Ae("circle",t),"strokeWidth",1/e.ratio)});}},Ji={};var Zi={args:"dataSrc",props:{dataSrc:String,dataSrcset:Boolean,sizes:String,width:Number,height:Number,offsetTop:String,offsetLeft:String,target:String},data:{dataSrc:"",dataSrcset:!1,sizes:!1,width:!1,height:!1,offsetTop:"50vh",offsetLeft:"50vw",target:!1},computed:{cacheKey:function(t){t=t.dataSrc;return this.$name+"."+t},width:function(t){var e=t.width,t=t.dataWidth;return e||t},height:function(t){var e=t.height,t=t.dataHeight;return e||t},sizes:function(t){var e=t.sizes,t=t.dataSizes;return e||t},isImg:function(t,e){return or(e)},target:{get:function(t){t=t.target;return [this.$el].concat(Ht(t,this.$el))},watch:function(){this.observe();}},offsetTop:function(t){return fn(t.offsetTop,"height")},offsetLeft:function(t){return fn(t.offsetLeft,"width")}},connected:function(){window.IntersectionObserver?(ar[this.cacheKey]?Qi(this.$el,ar[this.cacheKey],this.dataSrcset,this.sizes):this.isImg&&this.width&&this.height&&Qi(this.$el,function(t,e,n){n&&(n=nt.ratio({width:t,height:e},"width",fn(er(n))),t=n.width,e=n.height);return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="'+t+'" height="'+e+'"></svg>'}(this.width,this.height,this.sizes)),this.observer=new IntersectionObserver(this.load,{rootMargin:this.offsetTop+"px "+this.offsetLeft+"px"}),requestAnimationFrame(this.observe)):Qi(this.$el,this.dataSrc,this.dataSrcset,this.sizes);},disconnected:function(){this.observer&&this.observer.disconnect();},update:{read:function(t){var e=this,t=t.image;return !!this.observer&&(t||"complete"!==document.readyState||this.load(this.observer.takeRecords()),!this.isImg&&void(t&&t.then(function(t){return t&&""!==t.currentSrc&&Qi(e.$el,sr(t))})))},write:function(t){var e,n,i;this.dataSrcset&&1!==window.devicePixelRatio&&(!(n=Ve(this.$el,"backgroundSize")).match(/^(auto\s?)+$/)&&L(n)!==t.bgSize||(t.bgSize=(e=this.dataSrcset,n=this.sizes,i=fn(er(n)),(e=(e.match(rr)||[]).map(L).sort(function(t,e){return t-e})).filter(function(t){return i<=t})[0]||e.pop()||""),Ve(this.$el,"backgroundSize",t.bgSize+"px")));},events:["resize"]},methods:{load:function(t){var e=this;t.some(function(t){return O(t.isIntersecting)||t.isIntersecting})&&(this._data.image=me(this.dataSrc,this.dataSrcset,this.sizes).then(function(t){return Qi(e.$el,sr(t),t.srcset,t.sizes),ar[e.cacheKey]=sr(t),t},function(t){return Qt(e.$el,new t.constructor(t.type,t))}),this.observer.disconnect());},observe:function(){var e=this;this._connected&&!this._data.image&&this.target.forEach(function(t){return e.observer.observe(t)});}}};function Qi(t,e,n,i){or(t)?(i&&(t.sizes=i),n&&(t.srcset=n),e&&(t.src=e)):e&&!w(t.style.backgroundImage,e)&&(Ve(t,"backgroundImage","url("+Gt(e)+")"),Qt(t,te("load",!1)));}var tr=/\s*(.*?)\s*(\w+|calc\(.*?\))\s*(?:,|$)/g;function er(t){var e,n;for(tr.lastIndex=0;e=tr.exec(t);)if(!e[1]||window.matchMedia(e[1]).matches){e=g(n=e[2],"calc")?n.slice(5,-1).replace(nr,function(t){return fn(t)}).replace(/ /g,"").match(ir).reduce(function(t,e){return t+ +e},0):n;break}return e||"100vw"}var nr=/\d+(?:\w+|%)/g,ir=/[+-]?(\d+)/g;var rr=/\s+\d+w\s*(?:,|$)/g;function or(t){return "IMG"===t.tagName}function sr(t){return t.currentSrc||t.src}var ar,ur="__test__";try{(ar=window.sessionStorage||{})[ur]=1,delete ar[ur];}catch(t){ar={};}var cr={props:{media:Boolean},data:{media:!1},computed:{matchMedia:function(){var t=function(t){if(z(t))if("@"===t[0])t=L(Ye("breakpoint-"+t.substr(1)));else if(isNaN(t))return t;return !(!t||isNaN(t))&&"(min-width: "+t+"px)"}(this.media);return !t||window.matchMedia(t).matches}}};var hr={mixins:[di,cr],props:{fill:String},data:{fill:"",clsWrapper:"uk-leader-fill",clsHide:"uk-leader-hide",attrFill:"data-fill"},computed:{fill:function(t){return t.fill||Ye("leader-fill-content")}},connected:function(){var t=Se(this.$el,'<span class="'+this.clsWrapper+'">');this.wrapper=t[0];},disconnected:function(){Ie(this.wrapper.childNodes);},update:{read:function(t){var e=t.changed,n=t.width,t=n;return {width:n=Math.floor(this.$el.offsetWidth/2),fill:this.fill,changed:e||t!==n,hide:!this.matchMedia}},write:function(t){He(this.wrapper,this.clsHide,t.hide),t.changed&&(t.changed=!1,ot(this.wrapper,this.attrFill,new Array(t.width).join(t.fill)));},events:["resize"]}},lr={props:{container:Boolean},data:{container:!0},computed:{container:function(t){t=t.container;return !0===t&&this.$container||t&&Ae(t)}}},dr=[],fr={mixins:[di,lr,fi],props:{selPanel:String,selClose:String,escClose:Boolean,bgClose:Boolean,stack:Boolean},data:{cls:"uk-open",escClose:!0,bgClose:!0,overlay:!0,stack:!1},computed:{panel:function(t,e){return Ae(t.selPanel,e)},transitionElement:function(){return this.panel},bgClose:function(t){return t.bgClose&&this.panel}},beforeDisconnect:function(){this.isToggled()&&this.toggleElement(this.$el,!1,!1);},events:[{name:"click",delegate:function(){return this.selClose},handler:function(t){t.preventDefault(),this.hide();}},{name:"toggle",self:!0,handler:function(t){t.defaultPrevented||(t.preventDefault(),this.isToggled()===w(dr,this)&&this.toggle());}},{name:"beforeshow",self:!0,handler:function(t){if(w(dr,this))return !1;!this.stack&&dr.length?(ce.all(dr.map(function(t){return t.hide()})).then(this.show),t.preventDefault()):dr.push(this);}},{name:"show",self:!0,handler:function(){var r=this;cn(window)-cn(document)&&this.overlay&&Ve(document.body,"overflowY","scroll"),this.stack&&Ve(this.$el,"zIndex",L(Ve(this.$el,"zIndex"))+dr.length),Ne(document.documentElement,this.clsPage),this.bgClose&&Zt(this.$el,"hide",Kt(document,mt,function(t){var i=t.target;X(dr)!==r||r.overlay&&!Nt(i,r.$el)||Nt(i,r.panel)||Zt(document,vt+" "+xt+" scroll",function(t){var e=t.defaultPrevented,n=t.type,t=t.target;e||n!==vt||i!==t||r.hide();},!0);}),{self:!0}),this.escClose&&Zt(this.$el,"hide",Kt(document,"keydown",function(t){27===t.keyCode&&X(dr)===r&&r.hide();}),{self:!0});}},{name:"hidden",self:!0,handler:function(){var e=this;w(dr,this)&&dr.splice(dr.indexOf(this),1),dr.length||Ve(document.body,"overflowY",""),Ve(this.$el,"zIndex",""),dr.some(function(t){return t.clsPage===e.clsPage})||Be(document.documentElement,this.clsPage);}}],methods:{toggle:function(){return this.isToggled()?this.hide():this.show()},show:function(){var e=this;return this.container&&Tt(this.$el)!==this.container?(we(this.container,this.$el),new ce(function(t){return requestAnimationFrame(function(){return e.show().then(t)})})):this.toggleElement(this.$el,!0,pr(this))},hide:function(){return this.toggleElement(this.$el,!1,pr(this))}}};function pr(t){var s=t.transitionElement,a=t._toggle;return function(r,o){return new ce(function(n,i){return Zt(r,"show hide",function(){r._reject&&r._reject(),r._reject=i,a(r,o);var t=Zt(s,"transitionstart",function(){Zt(s,"transitionend transitioncancel",n,{self:!0}),clearTimeout(e);},{self:!0}),e=setTimeout(function(){t(),n();},R(Ve(s,"transitionDuration")));})}).then(function(){return delete r._reject})}}var mr={install:function(t){var a=t.modal;function i(t,e,n,i){e=Y({bgClose:!1,escClose:!0,labels:a.labels},e);var r=a.dialog(t(e),e),o=new ue,s=!1;return Kt(r.$el,"submit","form",function(t){t.preventDefault(),o.resolve(i&&i(r)),s=!0,r.hide();}),Kt(r.$el,"hide",function(){return !s&&n(o)}),o.promise.dialog=r,o.promise}a.dialog=function(t,e){var n=a('<div class="uk-modal"> <div class="uk-modal-dialog">'+t+"</div> </div>",e);return n.show(),Kt(n.$el,"hidden",function(){return ce.resolve().then(function(){return n.$destroy(!0)})},{self:!0}),n},a.alert=function(e,t){return i(function(t){t=t.labels;return '<div class="uk-modal-body">'+(z(e)?e:ve(e))+'</div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-primary uk-modal-close" autofocus>'+t.ok+"</button> </div>"},t,function(t){return t.resolve()})},a.confirm=function(e,t){return i(function(t){t=t.labels;return '<form> <div class="uk-modal-body">'+(z(e)?e:ve(e))+'</div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-default uk-modal-close" type="button">'+t.cancel+'</button> <button class="uk-button uk-button-primary" autofocus>'+t.ok+"</button> </div> </form>"},t,function(t){return t.reject()})},a.prompt=function(e,n,t){return i(function(t){t=t.labels;return '<form class="uk-form-stacked"> <div class="uk-modal-body"> <label>'+(z(e)?e:ve(e))+'</label> <input class="uk-input" value="'+(n||"")+'" autofocus> </div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-default uk-modal-close" type="button">'+t.cancel+'</button> <button class="uk-button uk-button-primary">'+t.ok+"</button> </div> </form>"},t,function(t){return t.resolve(null)},function(t){return Ae("input",t.$el).value})},a.labels={ok:"Ok",cancel:"Cancel"};},mixins:[fr],data:{clsPage:"uk-modal-page",selPanel:".uk-modal-dialog",selClose:".uk-modal-close, .uk-modal-close-default, .uk-modal-close-outside, .uk-modal-close-full"},events:[{name:"show",self:!0,handler:function(){Pe(this.panel,"uk-margin-auto-vertical")?Ne(this.$el,"uk-flex"):Ve(this.$el,"display","block"),un(this.$el);}},{name:"hidden",self:!0,handler:function(){Ve(this.$el,"display",""),Be(this.$el,"uk-flex");}}]};var gr={extends:mi,data:{targets:"> .uk-parent",toggle:"> a",content:"> ul"}},vr={mixins:[di,Mi],props:{dropdown:String,mode:"list",align:String,offset:Number,boundary:Boolean,boundaryAlign:Boolean,clsDrop:String,delayShow:Number,delayHide:Number,dropbar:Boolean,dropbarMode:String,dropbarAnchor:Boolean,duration:Number},data:{dropdown:".uk-navbar-nav > li",align:lt?"right":"left",clsDrop:"uk-navbar-dropdown",mode:void 0,offset:void 0,delayShow:void 0,delayHide:void 0,boundaryAlign:void 0,flip:"x",boundary:!0,dropbar:!1,dropbarMode:"slide",dropbarAnchor:!1,duration:200,forceHeight:!0,selMinHeight:".uk-navbar-nav > li > a, .uk-navbar-item, .uk-navbar-toggle"},computed:{boundary:function(t,e){var n=t.boundary,t=t.boundaryAlign;return !0===n||t?e:n},dropbarAnchor:function(t,e){return Pt(t.dropbarAnchor,e)},pos:function(t){return "bottom-"+t.align},dropbar:{get:function(t){t=t.dropbar;return t?(t=this._dropbar||Pt(t,this.$el)||Ae("+ .uk-navbar-dropbar",this.$el))||(this._dropbar=Ae("<div></div>")):null},watch:function(t){Ne(t,"uk-navbar-dropbar");},immediate:!0},dropdowns:{get:function(t,e){return Me(t.dropdown+" ."+t.clsDrop,e)},watch:function(t){var e=this;this.$create("drop",t.filter(function(t){return !e.getDropdown(t)}),Y({},this.$props,{boundary:this.boundary,pos:this.pos,offset:this.dropbar||this.offset}));},immediate:!0}},disconnected:function(){this.dropbar&&ke(this.dropbar),delete this._dropbar;},events:[{name:"mouseover",delegate:function(){return this.dropdown},handler:function(t){var e=t.current,t=this.getActive();t&&t.toggle&&!Nt(t.toggle.$el,e)&&!t.tracker.movesTo(t.$el)&&t.hide(!1);}},{name:"mouseleave",el:function(){return this.dropbar},handler:function(){var t=this.getActive();t&&!this.dropdowns.some(function(t){return At(t,":hover")})&&t.hide();}},{name:"beforeshow",capture:!0,filter:function(){return this.dropbar},handler:function(){Tt(this.dropbar)||xe(this.dropbarAnchor||this.$el,this.dropbar);}},{name:"show",filter:function(){return this.dropbar},handler:function(t,e){var n=e.$el,e=e.dir;Pe(n,this.clsDrop)&&("slide"===this.dropbarMode&&Ne(this.dropbar,"uk-navbar-dropbar-slide"),this.clsDrop&&Ne(n,this.clsDrop+"-dropbar"),"bottom"===e&&this.transitionTo(n.offsetHeight+L(Ve(n,"marginTop"))+L(Ve(n,"marginBottom")),n));}},{name:"beforehide",filter:function(){return this.dropbar},handler:function(t,e){var n=e.$el,e=this.getActive();At(this.dropbar,":hover")&&e&&e.$el===n&&t.preventDefault();}},{name:"hide",filter:function(){return this.dropbar},handler:function(t,e){var n=e.$el;!Pe(n,this.clsDrop)||(!(e=this.getActive())||e&&e.$el===n)&&this.transitionTo(0);}}],methods:{getActive:function(){var t=this.dropdowns.map(this.getDropdown).filter(function(t){return t&&t.isActive()})[0];return t&&w(t.mode,"hover")&&Nt(t.toggle.$el,this.$el)&&t},transitionTo:function(t,e){var n=this,i=this.dropbar,r=$t(i)?un(i):0;return Ve(e=r<t&&e,"clip","rect(0,"+e.offsetWidth+"px,"+r+"px,0)"),un(i,r),Je.cancel([e,i]),ce.all([Je.start(i,{height:t},this.duration),Je.start(e,{clip:"rect(0,"+e.offsetWidth+"px,"+t+"px,0)"},this.duration)]).catch(Q).then(function(){Ve(e,{clip:""}),n.$update(i);})},getDropdown:function(t){return this.$getComponent(t,"drop")||this.$getComponent(t,"dropdown")}}},wr={mixins:[fr],args:"mode",props:{mode:String,flip:Boolean,overlay:Boolean},data:{mode:"slide",flip:!1,overlay:!1,clsPage:"uk-offcanvas-page",clsContainer:"uk-offcanvas-container",selPanel:".uk-offcanvas-bar",clsFlip:"uk-offcanvas-flip",clsContainerAnimation:"uk-offcanvas-container-animation",clsSidebarAnimation:"uk-offcanvas-bar-animation",clsMode:"uk-offcanvas",clsOverlay:"uk-offcanvas-overlay",selClose:".uk-offcanvas-close",container:!1},computed:{clsFlip:function(t){var e=t.flip,t=t.clsFlip;return e?t:""},clsOverlay:function(t){var e=t.overlay,t=t.clsOverlay;return e?t:""},clsMode:function(t){var e=t.mode;return t.clsMode+"-"+e},clsSidebarAnimation:function(t){var e=t.mode,t=t.clsSidebarAnimation;return "none"===e||"reveal"===e?"":t},clsContainerAnimation:function(t){var e=t.mode,t=t.clsContainerAnimation;return "push"!==e&&"reveal"!==e?"":t},transitionElement:function(t){return "reveal"===t.mode?Tt(this.panel):this.panel}},update:{read:function(){this.isToggled()&&!$t(this.$el)&&this.hide();},events:["resize"]},events:[{name:"click",delegate:function(){return 'a[href^="#"]'},handler:function(t){var e=t.current.hash;!t.defaultPrevented&&e&&Ae(e,document.body)&&this.hide();}},{name:"touchstart",passive:!0,el:function(){return this.panel},handler:function(t){t=t.targetTouches;1===t.length&&(this.clientY=t[0].clientY);}},{name:"touchmove",self:!0,passive:!1,filter:function(){return this.overlay},handler:function(t){t.cancelable&&t.preventDefault();}},{name:"touchmove",passive:!1,el:function(){return this.panel},handler:function(t){var e,n,i,r;1===t.targetTouches.length&&(e=event.targetTouches[0].clientY-this.clientY,n=(r=this.panel).scrollTop,((i=r.scrollHeight)<=(r=r.clientHeight)||0===n&&0<e||i-n<=r&&e<0)&&t.cancelable&&t.preventDefault());}},{name:"show",self:!0,handler:function(){"reveal"!==this.mode||Pe(Tt(this.panel),this.clsMode)||($e(this.panel,"<div>"),Ne(Tt(this.panel),this.clsMode)),Ve(document.documentElement,"overflowY",this.overlay?"hidden":""),Ne(document.body,this.clsContainer,this.clsFlip),Ve(document.body,"touch-action","pan-y pinch-zoom"),Ve(this.$el,"display","block"),Ne(this.$el,this.clsOverlay),Ne(this.panel,this.clsSidebarAnimation,"reveal"!==this.mode?this.clsMode:""),un(document.body),Ne(document.body,this.clsContainerAnimation),this.clsContainerAnimation&&(br().content+=",user-scalable=0");}},{name:"hide",self:!0,handler:function(){Be(document.body,this.clsContainerAnimation),Ve(document.body,"touch-action","");}},{name:"hidden",self:!0,handler:function(){var t;this.clsContainerAnimation&&((t=br()).content=t.content.replace(/,user-scalable=0$/,"")),"reveal"===this.mode&&Ie(this.panel),Be(this.panel,this.clsSidebarAnimation,this.clsMode),Be(this.$el,this.clsOverlay),Ve(this.$el,"display",""),Be(document.body,this.clsContainer,this.clsFlip),Ve(document.documentElement,"overflowY","");}},{name:"swipeLeft swipeRight",handler:function(t){this.isToggled()&&u(t.type,"Left")^this.flip&&this.hide();}}]};function br(){return Ae('meta[name="viewport"]',document.head)||we(document.head,'<meta name="viewport">')}var o={mixins:[di],props:{selContainer:String,selContent:String},data:{selContainer:".uk-modal",selContent:".uk-modal-dialog"},computed:{container:function(t,e){return zt(e,t.selContainer)},content:function(t,e){return zt(e,t.selContent)}},connected:function(){Ve(this.$el,"minHeight",150);},update:{read:function(){return !!(this.content&&this.container&&$t(this.$el))&&{current:L(Ve(this.$el,"maxHeight")),max:Math.max(150,un(this.container)-(rn(this.content).height-un(this.$el)))}},write:function(t){var e=t.current,t=t.max;Ve(this.$el,"maxHeight",t),Math.round(e)!==Math.round(t)&&Qt(this.$el,"resize");},events:["resize"]}},l={props:["width","height"],connected:function(){Ne(this.$el,"uk-responsive-width");},update:{read:function(){return !!($t(this.$el)&&this.width&&this.height)&&{width:cn(Tt(this.$el)),height:this.height}},write:function(t){un(this.$el,nt.contain({height:this.height,width:this.width},t).height);},events:["resize"]}},t={props:{offset:Number},data:{offset:0},methods:{scrollTo:function(t){var e=this;t=t&&Ae(t)||document.body,Qt(this.$el,"beforescroll",[this,t])&&jn(t,{offset:this.offset}).then(function(){return Qt(e.$el,"scrolled",[e,t])});}},events:{click:function(t){t.defaultPrevented||(t.preventDefault(),this.scrollTo("#"+Gt(decodeURIComponent((this.$el.hash||"").substr(1)))));}}},xr="_ukScrollspy",dt={args:"cls",props:{cls:String,target:String,hidden:Boolean,offsetTop:Number,offsetLeft:Number,repeat:Boolean,delay:Number},data:function(){return {cls:!1,target:!1,hidden:!0,offsetTop:0,offsetLeft:0,repeat:!1,delay:0,inViewClass:"uk-scrollspy-inview"}},computed:{elements:{get:function(t,e){t=t.target;return t?Me(t,e):[e]},watch:function(t){this.hidden&&Ve(Et(t,":not(."+this.inViewClass+")"),"visibility","hidden");},immediate:!0}},disconnected:function(){var e=this;this.elements.forEach(function(t){Be(t,e.inViewClass,t[xr]?t[xr].cls:""),delete t[xr];});},update:[{read:function(t){var e=this;t.update&&this.elements.forEach(function(t){t[xr]||(t[xr]={cls:ut(t,"uk-scrollspy-class")||e.cls}),t[xr].show=Hn(t,e.offsetTop,e.offsetLeft);});},write:function(i){var r=this;if(!i.update)return this.$emit(),i.update=!0;this.elements.forEach(function(e){function t(t){Ve(e,"visibility",!t&&r.hidden?"hidden":""),He(e,r.inViewClass,t),He(e,n.cls),Qt(e,t?"inview":"outview"),n.inview=t,r.$update(e);}var n=e[xr];!n.show||n.inview||n.queued?!n.show&&n.inview&&!n.queued&&r.repeat&&t(!1):(n.queued=!0,i.promise=(i.promise||ce.resolve()).then(function(){return new ce(function(t){return setTimeout(t,r.delay)})}).then(function(){t(!0),setTimeout(function(){n.queued=!1,r.$emit();},300);}));});},events:["scroll","resize"]}]},ft={props:{cls:String,closest:String,scroll:Boolean,overflow:Boolean,offset:Number},data:{cls:"uk-active",closest:!1,scroll:!1,overflow:!0,offset:0},computed:{links:{get:function(t,e){return Me('a[href^="#"]',e).filter(function(t){return t.hash})},watch:function(t){this.scroll&&this.$create("scroll",t,{offset:this.offset||0});},immediate:!0},targets:function(){return Me(this.links.map(function(t){return Gt(t.hash).substr(1)}).join(","))},elements:function(t){t=t.closest;return zt(this.links,t||"*")}},update:[{read:function(){var n=this,t=this.targets.length;if(!t||!$t(this.$el))return !1;var i=Wn(this.targets,/auto|scroll/,!0)[0],e=i.clientHeight,r=i.scrollTop,o=i.scrollHeight,s=!1;return r===o-e?s=t-1:(this.targets.every(function(t,e){if(on(t).top-on(Vn(i)).top-n.offset<=0)return s=e,!0}),!1===s&&this.overflow&&(s=0)),{active:s}},write:function(t){t=t.active;this.links.forEach(function(t){return t.blur()}),Be(this.elements,this.cls),!1!==t&&Qt(this.$el,"active",[t,Ne(this.elements[t],this.cls)]);},events:["scroll","resize"]}]},Ct={mixins:[di,cr],props:{top:null,bottom:Boolean,offset:String,animation:String,clsActive:String,clsInactive:String,clsFixed:String,clsBelow:String,selTarget:String,widthElement:Boolean,showOnUp:Boolean,targetOffset:Number},data:{top:0,bottom:!1,offset:0,animation:"",clsActive:"uk-active",clsInactive:"",clsFixed:"uk-sticky-fixed",clsBelow:"uk-sticky-below",selTarget:"",widthElement:!1,showOnUp:!1,targetOffset:!1},computed:{offset:function(t){return fn(t.offset)},selTarget:function(t,e){t=t.selTarget;return t&&Ae(t,e)||e},widthElement:function(t,e){return Pt(t.widthElement,e)||this.placeholder},isActive:{get:function(){return Pe(this.selTarget,this.clsActive)},set:function(t){t&&!this.isActive?(Oe(this.selTarget,this.clsInactive,this.clsActive),Qt(this.$el,"active")):t||Pe(this.selTarget,this.clsInactive)||(Oe(this.selTarget,this.clsActive,this.clsInactive),Qt(this.$el,"inactive"));}}},connected:function(){this.placeholder=Ae("+ .uk-sticky-placeholder",this.$el)||Ae('<div class="uk-sticky-placeholder"></div>'),this.isFixed=!1,this.isActive=!1;},disconnected:function(){this.isFixed&&(this.hide(),Be(this.selTarget,this.clsInactive)),ke(this.placeholder),this.placeholder=null,this.widthElement=null;},events:[{name:"load hashchange popstate",el:function(){return window},handler:function(){var i,r=this;!1!==this.targetOffset&&location.hash&&0<window.pageYOffset&&((i=Ae(location.hash))&&mn.read(function(){var t=on(i).top,e=on(r.$el).top,n=r.$el.offsetHeight;r.isFixed&&t<=e+n&&e<=t+i.offsetHeight&&Ln(window,t-n-(B(r.targetOffset)?r.targetOffset:0)-r.offset);}));}}],update:[{read:function(t,e){t=t.height;if(this.inactive=!this.matchMedia||!$t(this.$el),this.inactive)return !1;this.isActive&&e.has("resize")&&(this.hide(),t=this.$el.offsetHeight,this.show()),t=this.isActive?t:this.$el.offsetHeight,this.topOffset=on(this.isFixed?this.placeholder:this.$el).top,this.bottomOffset=this.topOffset+t;e=yr("bottom",this);return this.top=Math.max(L(yr("top",this)),this.topOffset)-this.offset,this.bottom=e&&e-this.$el.offsetHeight,this.width=rn($t(this.widthElement)?this.widthElement:this.$el).width,{height:t,top:an(this.placeholder)[0],margins:Ve(this.$el,["marginTop","marginBottom","marginLeft","marginRight"])}},write:function(t){var e=t.height,n=t.margins,t=this.placeholder;Ve(t,Y({height:e},n)),Nt(t,document)||(xe(this.$el,t),t.hidden=!0),this.isActive=!!this.isActive;},events:["resize"]},{read:function(t){t=t.scroll;return void 0===t&&(t=0),this.scroll=window.pageYOffset,{dir:t<=this.scroll?"down":"up",scroll:this.scroll}},write:function(t,e){var n=this,i=Date.now(),r=e.has("scroll"),o=t.initTimestamp;void 0===o&&(o=0);var s=t.dir,a=t.lastDir,u=t.lastScroll,c=t.scroll,e=t.top;(t.lastScroll=c)<0||c===u&&r||this.showOnUp&&!r&&!this.isFixed||((300<i-o||s!==a)&&(t.initScroll=c,t.initTimestamp=i),t.lastDir=s,this.showOnUp&&!this.isFixed&&Math.abs(t.initScroll-c)<=30&&Math.abs(u-c)<=10||(this.inactive||c<this.top||this.showOnUp&&(c<=this.top||"down"===s&&r||"up"===s&&!this.isFixed&&c<=this.bottomOffset)?this.isFixed?(this.isFixed=!1,this.animation&&c>this.topOffset?(en.cancel(this.$el),en.out(this.$el,this.animation).then(function(){return n.hide()},Q)):this.hide()):en.inProgress(this.$el)&&c<e&&(en.cancel(this.$el),this.hide()):this.isFixed?this.update():this.animation?(en.cancel(this.$el),this.show(),en.in(this.$el,this.animation).catch(Q)):this.show()));},events:["resize","scroll"]}],methods:{show:function(){this.isFixed=!0,this.update(),this.placeholder.hidden=!1;},hide:function(){this.isActive=!1,Be(this.$el,this.clsFixed,this.clsBelow),Ve(this.$el,{position:"",top:"",width:""}),this.placeholder.hidden=!0;},update:function(){var t=0!==this.top||this.scroll>this.top,e=Math.max(0,this.offset);B(this.bottom)&&this.scroll>this.bottom-this.offset&&(e=this.bottom-this.scroll),Ve(this.$el,{position:"fixed",top:e+"px",width:this.width}),this.isActive=t,He(this.$el,this.clsBelow,this.scroll>this.bottomOffset),Ne(this.$el,this.clsFixed);}}};function yr(t,e){var n=e.$props,i=e.$el,e=e[t+"Offset"],t=n[t];if(t)return z(t)&&t.match(/^-?\d/)?e+fn(t):on(!0===t?Tt(i):Pt(t,i)).bottom}var kr,$r,Sr,fe={mixins:[fi],args:"connect",props:{connect:String,toggle:String,active:Number,swiping:Boolean},data:{connect:"~.uk-switcher",toggle:"> * > :first-child",active:0,swiping:!0,cls:"uk-active",attrItem:"uk-switcher-item"},computed:{connects:{get:function(t,e){return Ht(t.connect,e)},watch:function(t){var n=this;this.swiping&&Ve(t,"touch-action","pan-y pinch-zoom");var i=this.index();this.connects.forEach(function(t){return Dt(t).forEach(function(t,e){return He(t,n.cls,e===i)})});},immediate:!0},toggles:{get:function(t,e){return Me(t.toggle,e).filter(function(t){return !At(t,".uk-disabled *, .uk-disabled, [disabled]")})},watch:function(t){var e=this.index();this.show(~e?e:t[this.active]||t[0]);},immediate:!0},children:function(){var t=this;return Dt(this.$el).filter(function(e){return t.toggles.some(function(t){return Nt(t,e)})})}},events:[{name:"click",delegate:function(){return this.toggle},handler:function(t){t.preventDefault(),this.show(t.current);}},{name:"click",el:function(){return this.connects},delegate:function(){return "["+this.attrItem+"],[data-"+this.attrItem+"]"},handler:function(t){t.preventDefault(),this.show(ut(t.current,this.attrItem));}},{name:"swipeRight swipeLeft",filter:function(){return this.swiping},el:function(){return this.connects},handler:function(t){t=t.type;this.show(u(t,"Left")?"next":"previous");}}],methods:{index:function(){var e=this;return x(this.children,function(t){return Pe(t,e.cls)})},show:function(t){var n=this,i=this.index(),r=it(this.children[it(t,this.toggles,i)],Dt(this.$el));i!==r&&(this.children.forEach(function(t,e){He(t,n.cls,r===e),ot(n.toggles[e],"aria-expanded",r===e);}),this.connects.forEach(function(t){var e=t.children;return n.toggleElement(W(e).filter(function(t){return Pe(t,n.cls)}),!1,0<=i).then(function(){return n.toggleElement(e[r],!0,0<=i)})}));}}},Kn={mixins:[di],extends:fe,props:{media:Boolean},data:{media:960,attrItem:"uk-tab-item"},connected:function(){var t=Pe(this.$el,"uk-tab-left")?"uk-tab-left":!!Pe(this.$el,"uk-tab-right")&&"uk-tab-right";t&&this.$create("toggle",this.$el,{cls:t,mode:"media",media:this.media});}},Mi={mixins:[cr,fi],args:"target",props:{href:String,target:null,mode:"list",queued:Boolean},data:{href:!1,target:!1,mode:"click",queued:!0},computed:{target:{get:function(t,e){var n=t.href,t=t.target;return (t=Ht(t||n,e)).length&&t||[e]},watch:function(){this.updateAria();},immediate:!0}},events:[{name:wt+" "+bt,filter:function(){return w(this.mode,"hover")},handler:function(t){se(t)||this.toggle("toggle"+(t.type===wt?"show":"hide"));}},{name:"click",filter:function(){return w(this.mode,"click")||pt&&w(this.mode,"hover")},handler:function(t){var e;(zt(t.target,'a[href="#"], a[href=""]')||(e=zt(t.target,"a[href]"))&&(!Ir(this.target,this.cls)||e.hash&&At(this.target,e.hash)))&&t.preventDefault(),this.toggle();}},{name:"toggled",self:!0,el:function(){return this.target},handler:function(t,e){this.updateAria(e);}}],update:{read:function(){return !(!w(this.mode,"media")||!this.media)&&{match:this.matchMedia}},write:function(t){var e=t.match,t=this.isToggled(this.target);(e?!t:t)&&this.toggle();},events:["resize"]},methods:{toggle:function(t){var n=this;if(Qt(this.target,t||"toggle",[this])){if(!this.queued)return this.toggleElement(this.target);var e,i=this.target.filter(function(t){return Pe(t,n.clsLeave)});i.length?this.target.forEach(function(t){var e=w(i,t);n.toggleElement(t,e,e);}):(e=this.target.filter(this.isToggled),this.toggleElement(e,!1).then(function(){return n.toggleElement(n.target.filter(function(t){return !w(e,t)}),!0)}));}},updateAria:function(t){ot(this.$el,"aria-expanded",M(t)?t:Ir(this.target,this.cls));}}};function Ir(t,e){return e?Pe(t,e.split(" ")[0]):$t(t)}function Tr(t){for(var e=t.addedNodes,n=t.removedNodes,i=0;i<e.length;i++)_e(e[i],$r);for(var r=0;r<n.length;r++)_e(n[r],Sr);}function Er(t){var e=t.target,n=t.attributeName,t=ai(n);t&&t in kr&&(st(e,n)?kr[t](e):(t=kr.getComponent(e,t))&&t.$destroy());}G(Object.freeze({__proto__:null,Accordion:mi,Alert:vi,Cover:bi,Drop:ki,Dropdown:ki,FormCustom:$i,Gif:Si,Grid:_i,HeightMatch:zi,HeightViewport:Di,Icon:qi,Img:Zi,Leader:hr,Margin:Ii,Modal:mr,Nav:gr,Navbar:vr,Offcanvas:wr,OverflowAuto:o,Responsive:l,Scroll:t,Scrollspy:dt,ScrollspyNav:ft,Sticky:Ct,Svg:Oi,Switcher:fe,Tab:Kn,Toggle:Mi,Video:wi,Close:Gi,Spinner:Ki,SlidenavNext:Yi,SlidenavPrevious:Yi,SearchIcon:Xi,Marker:Ui,NavbarToggleIcon:Ui,OverlayIcon:Ui,PaginationNext:Ui,PaginationPrevious:Ui,Totop:Ui}),function(t,e){return Jn.component(e,t)}),Jn.use(function(e){var t,n,i,r;ct&&(n=function(){t||(t=!0,mn.write(function(){return t=!1}),e.update(null,"resize"));},Kt(window,"load resize",n),Kt(document,"loadedmetadata load",n,!0),"ResizeObserver"in window&&new ResizeObserver(n).observe(document.documentElement),Kt(window,"scroll",function(t){i||(i=!0,mn.write(function(){return i=!1}),e.update(null,t.type));},{passive:!0,capture:!0}),r=0,Kt(document,"animationstart",function(t){t=t.target;(Ve(t,"animationName")||"").match(/^uk-.*(left|right)/)&&(r++,Ve(document.documentElement,"overflowX","hidden"),setTimeout(function(){--r||Ve(document.documentElement,"overflowX","");},R(Ve(t,"animationDuration"))+100));},!0),Kt(document,mt,function(t){var s,a;se(t)&&(s=ae(t),a="tagName"in t.target?t.target:Tt(t.target),Zt(document,vt+" "+xt+" scroll",function(t){var e=ae(t),r=e.x,o=e.y;("scroll"!==t.type&&a&&r&&100<Math.abs(s.x-r)||o&&100<Math.abs(s.y-o))&&setTimeout(function(){var t,e,n,i;Qt(a,"swipe"),Qt(a,"swipe"+(t=s.x,e=s.y,n=r,i=o,Math.abs(t-n)>=Math.abs(e-i)?0<t-n?"Left":"Right":0<e-i?"Up":"Down"));});}));},{passive:!0}));}),$r=(kr=Jn).connect,Sr=kr.disconnect,ct&&window.MutationObserver&&mn.read(function(){document.body&&_e(document.body,$r),new MutationObserver(function(t){return t.forEach(Tr)}).observe(document,{childList:!0,subtree:!0}),new MutationObserver(function(t){return t.forEach(Er)}).observe(document,{attributes:!0,subtree:!0}),kr._initialized=!0;});fe={mixins:[di],props:{date:String,clsWrapper:String},data:{date:"",clsWrapper:".uk-countdown-%unit%"},computed:{date:function(t){t=t.date;return Date.parse(t)},days:function(t,e){return Ae(t.clsWrapper.replace("%unit%","days"),e)},hours:function(t,e){return Ae(t.clsWrapper.replace("%unit%","hours"),e)},minutes:function(t,e){return Ae(t.clsWrapper.replace("%unit%","minutes"),e)},seconds:function(t,e){return Ae(t.clsWrapper.replace("%unit%","seconds"),e)},units:function(){var e=this;return ["days","hours","minutes","seconds"].filter(function(t){return e[t]})}},connected:function(){this.start();},disconnected:function(){var e=this;this.stop(),this.units.forEach(function(t){return ge(e[t])});},events:[{name:"visibilitychange",el:function(){return document},handler:function(){document.hidden?this.stop():this.start();}}],update:{write:function(){var i=this,r=function(t){t-=Date.now();return {total:t,seconds:t/1e3%60,minutes:t/1e3/60%60,hours:t/1e3/60/60%24,days:t/1e3/60/60/24}}(this.date);r.total<=0&&(this.stop(),r.days=r.hours=r.minutes=r.seconds=0),this.units.forEach(function(t){var e=(e=String(Math.floor(r[t]))).length<2?"0"+e:e,n=i[t];n.textContent!==e&&((e=e.split("")).length!==n.children.length&&ve(n,e.map(function(){return "<span></span>"}).join("")),e.forEach(function(t,e){return n.children[e].textContent=t}));});}},methods:{start:function(){this.stop(),this.date&&this.units.length&&(this.$update(),this.timer=setInterval(this.$update,1e3));},stop:function(){this.timer&&(clearInterval(this.timer),this.timer=null);}}};var Cr="uk-transition-leave",_r="uk-transition-enter";function Ar(t,s,a,u){void 0===u&&(u=0);var c=Mr(s,!0),h={opacity:1},l={opacity:0},e=function(t){return function(){return c===Mr(s)?t():ce.reject()}},n=e(function(){return Ne(s,Cr),ce.all(Nr(s).map(function(e,n){return new ce(function(t){return setTimeout(function(){return Je.start(e,l,a/2,"ease").then(t)},n*u)})})).then(function(){return Be(s,Cr)})}),e=e(function(){var o=un(s);return Ne(s,_r),t(),Ve(Dt(s),{opacity:0}),new ce(function(r){return requestAnimationFrame(function(){var t=Dt(s),e=un(s);un(s,o);var n=Nr(s);Ve(t,l);var i=n.map(function(e,n){return new ce(function(t){return setTimeout(function(){return Je.start(e,h,a/2,"ease").then(t)},n*u)})});o!==e&&i.push(Je.start(s,{height:e},a/2+n.length*u,"ease")),ce.all(i).then(function(){Be(s,_r),c===Mr(s)&&(Ve(s,"height",""),Ve(t,{opacity:""}),delete s.dataset.transition),r();});})})});return (Pe(s,Cr)?zr(s):Pe(s,_r)?zr(s).then(n):n()).then(e)}function Mr(t,e){return e&&(t.dataset.transition=1+Mr(t)),H(t.dataset.transition)||0}function zr(t){return ce.all(Dt(t).filter(Je.inProgress).map(function(e){return new ce(function(t){return Zt(e,"transitionend transitioncanceled",t)})}))}function Nr(t){return Ti(Dt(t)).reduce(function(t,e){return t.concat(K(e.filter(function(t){return Hn(t)}),"offsetLeft"))},[])}function Br(t,d,f){return new ce(function(l){return requestAnimationFrame(function(){var u=Dt(d),c=u.map(function(t){return Dr(t,!0)}),h=Ve(d,["height","padding"]);Je.cancel(d),u.forEach(Je.cancel),Or(d),t(),u=u.concat(Dt(d).filter(function(t){return !w(u,t)})),ce.resolve().then(function(){mn.flush();var n,i,r,t,e,o=Ve(d,["height","padding"]),e=(n=d,r=c,t=(i=u).map(function(t,e){return !!(Tt(t)&&e in r)&&(r[e]?$t(t)?Pr(t):{opacity:0}:{opacity:$t(t)?1:0})}),e=t.map(function(t,e){e=Tt(i[e])===n&&(r[e]||Dr(i[e]));return !!e&&(t?"opacity"in t||(e.opacity%1?t.opacity=1:delete e.opacity):delete e.opacity,e)}),[t,e]),s=e[0],a=e[1];u.forEach(function(t,e){return a[e]&&Ve(t,a[e])}),Ve(d,Y({display:"block"},h)),requestAnimationFrame(function(){var t=u.map(function(t,e){return Tt(t)===d&&Je.start(t,s[e],f,"ease")}).concat(Je.start(d,o,f,"ease"));ce.all(t).then(function(){u.forEach(function(t,e){return Tt(t)===d&&Ve(t,"display",0===s[e].opacity?"none":"")}),Or(d);},Q).then(l);});});})})}function Dr(t,e){var n=Ve(t,"zIndex");return !!$t(t)&&Y({display:"",opacity:e?Ve(t,"opacity"):"0",pointerEvents:"none",position:"absolute",zIndex:"auto"===n?Ot(t):n},Pr(t))}function Or(t){Ve(t.children,{height:"",left:"",opacity:"",pointerEvents:"",position:"",top:"",marginTop:"",marginLeft:"",transform:"",width:"",zIndex:""}),Ve(t,{height:"",display:"",padding:""});}function Pr(t){var e=on(t),n=e.height,i=e.width,r=sn(t),e=r.top,r=r.left,t=Ve(t,["marginTop","marginLeft"]);return {top:e,left:r,height:n,width:i,marginLeft:t.marginLeft,marginTop:t.marginTop,transform:""}}Kn={props:{duration:Number,animation:String},data:{duration:150,animation:"slide"},methods:{animate:function(t,e){var n=this;void 0===e&&(e=this.$el);var i=this.animation;return ("fade"===i?Ar:"delayed-fade"===i?function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return Ar.apply(void 0,t.concat([40]))}:Br)(t,e,this.duration).then(function(){return n.$update(e,"resize")},Q)}}},Mi={mixins:[Kn],args:"target",props:{target:Boolean,selActive:Boolean},data:{target:null,selActive:!1,attrItem:"uk-filter-control",cls:"uk-active",duration:250},computed:{toggles:{get:function(t,e){t=t.attrItem;return Me("["+t+"],[data-"+t+"]",e)},watch:function(){var e,n=this;this.updateState(),!1!==this.selActive&&(e=Me(this.selActive,this.$el),this.toggles.forEach(function(t){return He(t,n.cls,w(e,t))}));},immediate:!0},children:{get:function(t,e){return Me(t.target+" > *",e)},watch:function(t,e){var n;n=e,(t=t).length===n.length&&t.every(function(t){return ~n.indexOf(t)})||this.updateState();}}},events:[{name:"click",delegate:function(){return "["+this.attrItem+"],[data-"+this.attrItem+"]"},handler:function(t){t.preventDefault(),this.apply(t.current);}}],methods:{apply:function(t){var e,n,i=this.getState(),t=Lr(t,this.attrItem,this.getState());e=i,n=t,["filter","sort"].every(function(t){return q(e[t],n[t])})||this.setState(t);},getState:function(){var n=this;return this.toggles.filter(function(t){return Pe(t,n.cls)}).reduce(function(t,e){return Lr(e,n.attrItem,t)},{filter:{"":""},sort:[]})},setState:function(n,i){var r=this;void 0===i&&(i=!0),n=Y({filter:{"":""},sort:[]},n),Qt(this.$el,"beforeFilter",[this,n]),this.toggles.forEach(function(t){return He(t,r.cls,!!function(t,e,n){var i=n.filter;void 0===i&&(i={"":""});var r=n.sort,o=r[0],s=r[1],n=Hr(t,e),r=n.filter;void 0===r&&(r="");t=n.group;void 0===t&&(t="");e=n.sort,n=n.order;void 0===n&&(n="asc");return O(e)?t in i&&r===i[t]||!r&&t&&!(t in i)&&!i[""]:o===e&&s===n}(t,r.attrItem,n))}),ce.all(Me(this.target,this.$el).map(function(t){function e(){!function(t,e,n){var i=function(t){var t=t.filter,e="";return G(t,function(t){return e+=t||""}),e}(t);n.forEach(function(t){return Ve(t,"display",i&&!At(t,i)?"none":"")});var t=(r=t.sort)[0],r=r[1];t&&(q(r=function(t,n,i){return Y([],t).sort(function(t,e){return ut(t,n).localeCompare(ut(e,n),void 0,{numeric:!0})*("asc"===i||-1)})}(n,t,r),n)||we(e,r));}(n,t,Dt(t)),r.$update(r.$el);}return i?r.animate(e,t):e()})).then(function(){return Qt(r.$el,"afterFilter",[r])});},updateState:function(){var t=this;mn.write(function(){return t.setState(t.getState(),!1)});}}};function Hr(t,e){return Tn(ut(t,e),["filter"])}function Lr(t,e,n){var i=Hr(t,e),r=i.filter,t=i.group,e=i.sort,i=i.order;return void 0===i&&(i="asc"),(r||O(e))&&(t?r?(delete n.filter[""],n.filter[t]=r):(delete n.filter[t],(D(n.filter)||""in n.filter)&&(n.filter={"":r||""})):n.filter={"":r||""}),O(e)||(n.sort=[e,i]),n}wi={slide:{show:function(t){return [{transform:Fr(-100*t)},{transform:Fr()}]},percent:jr,translate:function(t,e){return [{transform:Fr(-100*e*t)},{transform:Fr(100*e*(1-t))}]}}};function jr(t){return Math.abs(Ve(t,"transform").split(",")[4]/t.offsetWidth)||0}function Fr(t,e){return void 0===t&&(t=0),void 0===e&&(e="%"),t+=t?e:"",ht?"translateX("+t+")":"translate3d("+t+", 0, 0)"}function Wr(t){return "scale3d("+t+", "+t+", 1)"}var Vr=Y({},wi,{fade:{show:function(){return [{opacity:0},{opacity:1}]},percent:function(t){return 1-Ve(t,"opacity")},translate:function(t){return [{opacity:1-t},{opacity:t}]}},scale:{show:function(){return [{opacity:0,transform:Wr(.8)},{opacity:1,transform:Wr(1)}]},percent:function(t){return 1-Ve(t,"opacity")},translate:function(t){return [{opacity:1-t,transform:Wr(1-.2*t)},{opacity:t,transform:Wr(.8+.2*t)}]}}});function Rr(t,e,n){Qt(t,te(e,!1,!1,n));}Gi={mixins:[{props:{autoplay:Boolean,autoplayInterval:Number,pauseOnHover:Boolean},data:{autoplay:!1,autoplayInterval:7e3,pauseOnHover:!0},connected:function(){this.autoplay&&this.startAutoplay();},disconnected:function(){this.stopAutoplay();},update:function(){ot(this.slides,"tabindex","-1");},events:[{name:"visibilitychange",el:function(){return document},filter:function(){return this.autoplay},handler:function(){document.hidden?this.stopAutoplay():this.startAutoplay();}}],methods:{startAutoplay:function(){var t=this;this.stopAutoplay(),this.interval=setInterval(function(){return (!t.draggable||!Ae(":focus",t.$el))&&(!t.pauseOnHover||!At(t.$el,":hover"))&&!t.stack.length&&t.show("next")},this.autoplayInterval);},stopAutoplay:function(){this.interval&&clearInterval(this.interval);}}},{props:{draggable:Boolean},data:{draggable:!0,threshold:10},created:function(){var i=this;["start","move","end"].forEach(function(t){var n=i[t];i[t]=function(t){var e=ae(t).x*(lt?-1:1);i.prevPos=e!==i.pos?i.pos:i.prevPos,i.pos=e,n(t);};});},events:[{name:mt,delegate:function(){return this.selSlides},handler:function(t){var e;!this.draggable||!se(t)&&(!(e=t.target).children.length&&e.childNodes.length)||zt(t.target,St)||0<t.button||this.length<2||this.start(t);}},{name:"dragstart",handler:function(t){t.preventDefault();}}],methods:{start:function(){this.drag=this.pos,this._transitioner?(this.percent=this._transitioner.percent(),this.drag+=this._transitioner.getDistance()*this.percent*this.dir,this._transitioner.cancel(),this._transitioner.translate(this.percent),this.dragging=!0,this.stack=[]):this.prevIndex=this.index,Kt(document,gt,this.move,{passive:!1}),Kt(document,vt+" "+xt,this.end,!0),Ve(this.list,"userSelect","none");},move:function(t){var e=this,n=this.pos-this.drag;if(!(0==n||this.prevPos===this.pos||!this.dragging&&Math.abs(n)<this.threshold)){Ve(this.list,"pointerEvents","none"),t.cancelable&&t.preventDefault(),this.dragging=!0,this.dir=n<0?1:-1;for(var i=this.slides,r=this.prevIndex,o=Math.abs(n),s=this.getIndex(r+this.dir,r),a=this._getDistance(r,s)||i[r].offsetWidth;s!==r&&a<o;)this.drag-=a*this.dir,r=s,o-=a,s=this.getIndex(r+this.dir,r),a=this._getDistance(r,s)||i[r].offsetWidth;this.percent=o/a;var u,c=i[r],t=i[s],n=this.index!==s,h=r===s;[this.index,this.prevIndex].filter(function(t){return !w([s,r],t)}).forEach(function(t){Qt(i[t],"itemhidden",[e]),h&&(u=!0,e.prevIndex=r);}),(this.index===r&&this.prevIndex!==r||u)&&Qt(i[this.index],"itemshown",[this]),n&&(this.prevIndex=r,this.index=s,h||Qt(c,"beforeitemhide",[this]),Qt(t,"beforeitemshow",[this])),this._transitioner=this._translate(Math.abs(this.percent),c,!h&&t),n&&(h||Qt(c,"itemhide",[this]),Qt(t,"itemshow",[this]));}},end:function(){var t;Jt(document,gt,this.move,{passive:!1}),Jt(document,vt+" "+xt,this.end,!0),this.dragging&&(this.dragging=null,this.index===this.prevIndex?(this.percent=1-this.percent,this.dir*=-1,this._show(!1,this.index,!0),this._transitioner=null):(t=(lt?this.dir*(lt?1:-1):this.dir)<0==this.prevPos>this.pos,this.index=t?this.index:this.prevIndex,t&&(this.percent=1-this.percent),this.show(0<this.dir&&!t||this.dir<0&&t?"next":"previous",!0))),Ve(this.list,{userSelect:"",pointerEvents:""}),this.drag=this.percent=null;}}},{data:{selNav:!1},computed:{nav:function(t,e){return Ae(t.selNav,e)},selNavItem:function(t){t=t.attrItem;return "["+t+"],[data-"+t+"]"},navItems:function(t,e){return Me(this.selNavItem,e)}},update:{write:function(){var n=this;this.nav&&this.length!==this.nav.children.length&&ve(this.nav,this.slides.map(function(t,e){return "<li "+n.attrItem+'="'+e+'"><a href></a></li>'}).join("")),this.navItems.concat(this.nav).forEach(function(t){return t&&(t.hidden=!n.maxIndex)}),this.updateNav();},events:["resize"]},events:[{name:"click",delegate:function(){return this.selNavItem},handler:function(t){t.preventDefault(),this.show(ut(t.current,this.attrItem));}},{name:"itemshow",handler:"updateNav"}],methods:{updateNav:function(){var n=this,i=this.getValidIndex();this.navItems.forEach(function(t){var e=ut(t,n.attrItem);He(t,n.clsActive,H(e)===i),He(t,"uk-invisible",n.finite&&("previous"===e&&0===i||"next"===e&&i>=n.maxIndex));});}}}],props:{clsActivated:Boolean,easing:String,index:Number,finite:Boolean,velocity:Number,selSlides:String},data:function(){return {easing:"ease",finite:!1,velocity:1,index:0,prevIndex:-1,stack:[],percent:0,clsActive:"uk-active",clsActivated:!1,Transitioner:!1,transitionOptions:{}}},connected:function(){this.prevIndex=-1,this.index=this.getValidIndex(this.$props.index),this.stack=[];},disconnected:function(){Be(this.slides,this.clsActive);},computed:{duration:function(t,e){t=t.velocity;return qr(e.offsetWidth/t)},list:function(t,e){return Ae(t.selList,e)},maxIndex:function(){return this.length-1},selSlides:function(t){return t.selList+" "+(t.selSlides||"> *")},slides:{get:function(){return Me(this.selSlides,this.$el)},watch:function(){this.$reset();}},length:function(){return this.slides.length}},events:{itemshown:function(){this.$update(this.list);}},methods:{show:function(t,e){var n=this;if(void 0===e&&(e=!1),!this.dragging&&this.length){var i=this.stack,r=e?0:i.length,o=function(){i.splice(r,1),i.length&&n.show(i.shift(),!0);};if(i[e?"unshift":"push"](t),!e&&1<i.length)2===i.length&&this._transitioner.forward(Math.min(this.duration,200));else {var s,a=this.getIndex(this.index),u=Pe(this.slides,this.clsActive)&&this.slides[a],c=this.getIndex(t,this.index),h=this.slides[c];if(u!==h){if(this.dir=(s=a,"next"!==(t=t)&&("previous"===t||t<s)?-1:1),this.prevIndex=a,this.index=c,u&&!Qt(u,"beforeitemhide",[this])||!Qt(h,"beforeitemshow",[this,u]))return this.index=this.prevIndex,void o();e=this._show(u,h,e).then(function(){return u&&Qt(u,"itemhidden",[n]),Qt(h,"itemshown",[n]),new ce(function(t){mn.write(function(){i.shift(),i.length?n.show(i.shift(),!0):n._transitioner=null,t();});})});return u&&Qt(u,"itemhide",[this]),Qt(h,"itemshow",[this]),e}o();}}},getIndex:function(t,e){return void 0===t&&(t=this.index),void 0===e&&(e=this.index),Z(it(t,this.slides,e,this.finite),0,this.maxIndex)},getValidIndex:function(t,e){return void 0===t&&(t=this.index),void 0===e&&(e=this.prevIndex),this.getIndex(t,e)},_show:function(t,e,n){if(this._transitioner=this._getTransitioner(t,e,this.dir,Y({easing:n?e.offsetWidth<600?"cubic-bezier(0.25, 0.46, 0.45, 0.94)":"cubic-bezier(0.165, 0.84, 0.44, 1)":this.easing},this.transitionOptions)),!n&&!t)return this._translate(1),ce.resolve();t=this.stack.length;return this._transitioner[1<t?"forward":"show"](1<t?Math.min(this.duration,75+75/(t-1)):this.duration,this.percent)},_getDistance:function(t,e){return this._getTransitioner(t,t!==e&&e).getDistance()},_translate:function(t,e,n){void 0===e&&(e=this.prevIndex),void 0===n&&(n=this.index);n=this._getTransitioner(e!==n&&e,n);return n.translate(t),n},_getTransitioner:function(t,e,n,i){return void 0===t&&(t=this.prevIndex),void 0===e&&(e=this.index),void 0===n&&(n=this.dir||1),void 0===i&&(i=this.transitionOptions),new this.Transitioner(N(t)?this.slides[t]:t,N(e)?this.slides[e]:e,n*(lt?-1:1),i)}}};function qr(t){return .5*t+300}var Ki={mixins:[Gi],props:{animation:String},data:{animation:"slide",clsActivated:"uk-transition-active",Animations:wi,Transitioner:function(r,o,s,t){var e=t.animation,a=t.easing,n=e.percent,i=e.translate,u=(e=void 0===(e=e.show)?Q:e)(s),c=new ue;return {dir:s,show:function(t,e,n){var i=this;void 0===e&&(e=0);n=n?"linear":a;return t-=Math.round(t*Z(e,-1,1)),this.translate(e),Rr(o,"itemin",{percent:e,duration:t,timing:n,dir:s}),Rr(r,"itemout",{percent:1-e,duration:t,timing:n,dir:s}),ce.all([Je.start(o,u[1],t,n),Je.start(r,u[0],t,n)]).then(function(){i.reset(),c.resolve();},Q),c.promise},cancel:function(){Je.cancel([o,r]);},reset:function(){for(var t in u[0])Ve([o,r],t,"");},forward:function(t,e){return void 0===e&&(e=this.percent()),Je.cancel([o,r]),this.show(t,e,!0)},translate:function(t){this.reset();var e=i(t,s);Ve(o,e[1]),Ve(r,e[0]),Rr(o,"itemtranslatein",{percent:t,dir:s}),Rr(r,"itemtranslateout",{percent:1-t,dir:s});},percent:function(){return n(r||o,o,s)},getDistance:function(){return r&&r.offsetWidth}}}},computed:{animation:function(t){var e=t.animation,t=t.Animations;return Y(t[e]||t.slide,{name:e})},transitionOptions:function(){return {animation:this.animation}}},events:{"itemshow itemhide itemshown itemhidden":function(t){t=t.target;this.$update(t);},beforeitemshow:function(t){Ne(t.target,this.clsActive);},itemshown:function(t){Ne(t.target,this.clsActivated);},itemhidden:function(t){Be(t.target,this.clsActive,this.clsActivated);}}},Ur={mixins:[lr,fr,fi,Ki],functional:!0,props:{delayControls:Number,preload:Number,videoAutoplay:Boolean,template:String},data:function(){return {preload:1,videoAutoplay:!1,delayControls:3e3,items:[],cls:"uk-open",clsPage:"uk-lightbox-page",selList:".uk-lightbox-items",attrItem:"uk-lightbox-item",selClose:".uk-close-large",selCaption:".uk-lightbox-caption",pauseOnHover:!1,velocity:2,Animations:Vr,template:'<div class="uk-lightbox uk-overflow-hidden"> <ul class="uk-lightbox-items"></ul> <div class="uk-lightbox-toolbar uk-position-top uk-text-right uk-transition-slide-top uk-transition-opaque"> <button class="uk-lightbox-toolbar-icon uk-close-large" type="button" uk-close></button> </div> <a class="uk-lightbox-button uk-position-center-left uk-position-medium uk-transition-fade" href uk-slidenav-previous uk-lightbox-item="previous"></a> <a class="uk-lightbox-button uk-position-center-right uk-position-medium uk-transition-fade" href uk-slidenav-next uk-lightbox-item="next"></a> <div class="uk-lightbox-toolbar uk-lightbox-caption uk-position-bottom uk-text-center uk-transition-slide-bottom uk-transition-opaque"></div> </div>'}},created:function(){var t=Ae(this.template),e=Ae(this.selList,t);this.items.forEach(function(){return we(e,"<li>")}),this.$mount(we(this.container,t));},computed:{caption:function(t,e){return Ae(t.selCaption,e)}},events:[{name:gt+" "+mt+" keydown",handler:"showControls"},{name:"click",self:!0,delegate:function(){return this.selSlides},handler:function(t){t.defaultPrevented||this.hide();}},{name:"shown",self:!0,handler:function(){this.showControls();}},{name:"hide",self:!0,handler:function(){this.hideControls(),Be(this.slides,this.clsActive),Je.stop(this.slides);}},{name:"hidden",self:!0,handler:function(){this.$destroy(!0);}},{name:"keyup",el:function(){return document},handler:function(t){if(this.isToggled(this.$el)&&this.draggable)switch(t.keyCode){case 37:this.show("previous");break;case 39:this.show("next");}}},{name:"beforeitemshow",handler:function(t){this.isToggled()||(this.draggable=!1,t.preventDefault(),this.toggleElement(this.$el,!0,!1),this.animation=Vr.scale,Be(t.target,this.clsActive),this.stack.splice(1,0,this.index));}},{name:"itemshow",handler:function(){ve(this.caption,this.getItem().caption||"");for(var t=-this.preload;t<=this.preload;t++)this.loadItem(this.index+t);}},{name:"itemshown",handler:function(){this.draggable=this.$props.draggable;}},{name:"itemload",handler:function(t,n){var i=this,r=n.source,e=n.type,o=n.alt;void 0===o&&(o="");var s,a,u,c=n.poster,h=n.attrs;void 0===h&&(h={}),this.setItem(n,"<span uk-spinner></span>"),r&&(a={frameborder:"0",allow:"autoplay",allowfullscreen:"",style:"max-width: 100%; box-sizing: border-box;","uk-responsive":"","uk-video":""+this.videoAutoplay},"image"===e||r.match(/\.(avif|jpe?g|a?png|gif|svg|webp)($|\?)/i)?me(r,h.srcset,h.size).then(function(t){var e=t.width,t=t.height;return i.setItem(n,Yr("img",Y({src:r,width:e,height:t,alt:o},h)))},function(){return i.setError(n)}):"video"===e||r.match(/\.(mp4|webm|ogv)($|\?)/i)?(Kt(u=Yr("video",Y({src:r,poster:c,controls:"",playsinline:"","uk-video":""+this.videoAutoplay},h)),"loadedmetadata",function(){ot(u,{width:u.videoWidth,height:u.videoHeight}),i.setItem(n,u);}),Kt(u,"error",function(){return i.setError(n)})):"iframe"===e||r.match(/\.(html|php)($|\?)/i)?this.setItem(n,Yr("iframe",Y({src:r,frameborder:"0",allowfullscreen:"",class:"uk-lightbox-iframe"},h))):(s=r.match(/\/\/(?:.*?youtube(-nocookie)?\..*?[?&]v=|youtu\.be\/)([\w-]{11})[&?]?(.*)?/))?this.setItem(n,Yr("iframe",Y({src:"https://www.youtube"+(s[1]||"")+".com/embed/"+s[2]+(s[3]?"?"+s[3]:""),width:1920,height:1080},a,h))):(s=r.match(/\/\/.*?vimeo\.[a-z]+\/(\d+)[&?]?(.*)?/))&&pe("https://vimeo.com/api/oembed.json?maxwidth=1920&url="+encodeURI(r),{responseType:"json",withCredentials:!1}).then(function(t){var e=t.response,t=e.height,e=e.width;return i.setItem(n,Yr("iframe",Y({src:"https://player.vimeo.com/video/"+s[1]+(s[2]?"?"+s[2]:""),width:e,height:t},a,h)))},function(){return i.setError(n)}));}}],methods:{loadItem:function(t){void 0===t&&(t=this.index);t=this.getItem(t);this.getSlide(t).childElementCount||Qt(this.$el,"itemload",[t]);},getItem:function(t){return void 0===t&&(t=this.index),this.items[it(t,this.slides)]},setItem:function(t,e){Qt(this.$el,"itemloaded",[this,ve(this.getSlide(t),e)]);},getSlide:function(t){return this.slides[this.items.indexOf(t)]},setError:function(t){this.setItem(t,'<span uk-icon="icon: bolt; ratio: 2"></span>');},showControls:function(){clearTimeout(this.controlsTimer),this.controlsTimer=setTimeout(this.hideControls,this.delayControls),Ne(this.$el,"uk-active","uk-transition-active");},hideControls:function(){Be(this.$el,"uk-active","uk-transition-active");}}};function Yr(t,e){t=Ce("<"+t+">");return ot(t,e),t}Yi={install:function(t,e){t.lightboxPanel||t.component("lightboxPanel",Ur);Y(e.props,t.component("lightboxPanel").options.props);},props:{toggle:String},data:{toggle:"a"},computed:{toggles:{get:function(t,e){return Me(t.toggle,e)},watch:function(){this.hide();}}},disconnected:function(){this.hide();},events:[{name:"click",delegate:function(){return this.toggle+":not(.uk-disabled)"},handler:function(t){t.preventDefault(),this.show(t.current);}}],methods:{show:function(t){var e,n=this,i=J(this.toggles.map(Xr),"source");return _(t)&&(e=Xr(t).source,t=x(i,function(t){t=t.source;return e===t})),this.panel=this.panel||this.$create("lightboxPanel",Y({},this.$props,{items:i})),Kt(this.panel.$el,"hidden",function(){return n.panel=!1}),this.panel.show(t)},hide:function(){return this.panel&&this.panel.hide()}}};function Xr(e){var n={};return ["href","caption","type","poster","alt","attrs"].forEach(function(t){n["href"===t?"source":t]=ut(e,t);}),n.attrs=Tn(n.attrs),n}Ui={mixins:[lr],functional:!0,args:["message","status"],data:{message:"",status:"",timeout:5e3,group:null,pos:"top-center",clsContainer:"uk-notification",clsClose:"uk-notification-close",clsMsg:"uk-notification-message"},install:function(i){i.notification.closeAll=function(e,n){_e(document.body,function(t){t=i.getComponent(t,"notification");!t||e&&e!==t.group||t.close(n);});};},computed:{marginProp:function(t){return "margin"+(g(t.pos,"top")?"Top":"Bottom")},startProps:function(){var t={opacity:0};return t[this.marginProp]=-this.$el.offsetHeight,t}},created:function(){var t=Ae("."+this.clsContainer+"-"+this.pos,this.container)||we(this.container,'<div class="'+this.clsContainer+" "+this.clsContainer+"-"+this.pos+'" style="display: block"></div>');this.$mount(we(t,'<div class="'+this.clsMsg+(this.status?" "+this.clsMsg+"-"+this.status:"")+'"> <a href class="'+this.clsClose+'" data-uk-close></a> <div>'+this.message+"</div> </div>"));},connected:function(){var t,e=this,n=L(Ve(this.$el,this.marginProp));Je.start(Ve(this.$el,this.startProps),((t={opacity:1})[this.marginProp]=n,t)).then(function(){e.timeout&&(e.timer=setTimeout(e.close,e.timeout));});},events:((Xi={click:function(t){zt(t.target,'a[href="#"],a[href=""]')&&t.preventDefault(),this.close();}})[wt]=function(){this.timer&&clearTimeout(this.timer);},Xi[bt]=function(){this.timeout&&(this.timer=setTimeout(this.close,this.timeout));},Xi),methods:{close:function(t){function e(t){var e=Tt(t);Qt(t,"close",[n]),ke(t),e&&!e.hasChildNodes()&&ke(e);}var n=this;this.timer&&clearTimeout(this.timer),t?e(this.$el):Je.start(this.$el,this.startProps).then(e);}}};var Gr=["x","y","bgx","bgy","rotate","scale","color","backgroundColor","borderColor","opacity","blur","hue","grayscale","invert","saturate","sepia","fopacity","stroke"],fr={mixins:[cr],props:Gr.reduce(function(t,e){return t[e]="list",t},{}),data:Gr.reduce(function(t,e){return t[e]=void 0,t},{}),computed:{props:function(f,p){var m=this;return Gr.reduce(function(t,e){if(O(f[e]))return t;var n,i,r=e.match(/color/i),o=r||"opacity"===e,s=f[e].slice();o&&Ve(p,e,""),s.length<2&&s.unshift(("scale"===e?1:o?Ve(p,e):0)||0);var a,u,c,h,l,o=s.reduce(function(t,e){return z(e)&&e.replace(/-|\d/g,"").trim()||t},"");if(r?(r=p.style.color,s=s.map(function(t){return Ve(Ve(p,"color",t),"color").split(/[(),]/g).slice(1,-1).concat(1).slice(0,4).map(L)}),p.style.color=r):g(e,"bg")?(a="bgy"===e?"height":"width",s=s.map(function(t){return fn(t,a,m.$el)}),Ve(p,"background-position-"+e[2],""),i=Ve(p,"backgroundPosition").split(" ")["x"===e[2]?0:1],n=m.covers?(u=Math.min.apply(Math,s),c=Math.max.apply(Math,s),h=s.indexOf(u)<s.indexOf(c),l=c-u,s=s.map(function(t){return t-(h?u:c)}),(h?-l:0)+"px"):i):s=s.map(L),"stroke"===e){if(!s.some(function(t){return t}))return t;var d=ji(m.$el);Ve(p,"strokeDasharray",d),s=(s="%"===o?s.map(function(t){return t*d/100}):s).reverse(),e="strokeDashoffset";}return t[e]={steps:s,unit:o,pos:n,bgPos:i,diff:l},t},{})},bgProps:function(){var e=this;return ["bgx","bgy"].filter(function(t){return t in e.props})},covers:function(t,e){return i=(n=e).style.backgroundSize,e="cover"===Ve(Ve(n,"backgroundSize",""),"backgroundSize"),n.style.backgroundSize=i,e;var n,i;}},disconnected:function(){delete this._image;},update:{read:function(t){var e,n,a,u,c,h=this;this.matchMedia&&(t.image||!this.covers||!this.bgProps.length||(e=Ve(this.$el,"backgroundImage").replace(/^none|url\(["']?(.+?)["']?\)$/,"$1"))&&((n=new Image).src=e,(t.image=n).naturalWidth||(n.onload=function(){return h.$update()})),(n=t.image)&&n.naturalWidth&&(a={width:this.$el.offsetWidth,height:this.$el.offsetHeight},u={width:n.naturalWidth,height:n.naturalHeight},c=nt.cover(u,a),this.bgProps.forEach(function(t){var e,n=h.props[t],i=n.diff,r=n.bgPos,o=n.steps,n="bgy"===t?"height":"width",s=c[n]-a[n];s<i?a[n]=c[n]+i-s:i<s&&((e=a[n]/fn(r,n,h.$el))&&(h.props[t].steps=o.map(function(t){return t-(s-i)/e}))),c=nt.cover(u,a);}),t.dim=c));},write:function(t){t=t.dim;this.matchMedia?t&&Ve(this.$el,{backgroundSize:t.width+"px "+t.height+"px",backgroundRepeat:"no-repeat"}):Ve(this.$el,{backgroundSize:"",backgroundRepeat:""});},events:["resize"]},methods:{reset:function(){var n=this;G(this.getCss(0),function(t,e){return Ve(n.$el,e,"")});},getCss:function(l){var d=this.props;return Object.keys(d).reduce(function(t,e){var n=d[e],i=n.steps,r=n.unit,o=n.pos,s=function(t,e,n){void 0===n&&(n=2);var i=Kr(t,e),t=i[0],e=i[1],i=i[2];return (N(t)?t+Math.abs(t-e)*i*(t<e?1:-1):+e).toFixed(n)}(i,l);switch(e){case"x":case"y":r=r||"px",t.transform+=" translate"+p(e)+"("+L(s).toFixed("px"===r?0:2)+r+")";break;case"rotate":r=r||"deg",t.transform+=" rotate("+(s+r)+")";break;case"scale":t.transform+=" scale("+s+")";break;case"bgy":case"bgx":t["background-position-"+e[2]]="calc("+o+" + "+s+"px)";break;case"color":case"backgroundColor":case"borderColor":var a=Kr(i,l),u=a[0],c=a[1],h=a[2];t[e]="rgba("+u.map(function(t,e){return t+=h*(c[e]-t),3===e?L(t):parseInt(t,10)}).join(",")+")";break;case"blur":r=r||"px",t.filter+=" blur("+(s+r)+")";break;case"hue":r=r||"deg",t.filter+=" hue-rotate("+(s+r)+")";break;case"fopacity":r=r||"%",t.filter+=" opacity("+(s+r)+")";break;case"grayscale":case"invert":case"saturate":case"sepia":r=r||"%",t.filter+=" "+e+"("+(s+r)+")";break;default:t[e]=s;}return t},{transform:"",filter:""})}}};function Kr(t,e){var n=t.length-1,i=Math.min(Math.floor(n*e),n-1),i=t.slice(i,i+2);return i.push(1===e?1:e%(1/n)*n),i}Xi={mixins:[fr],props:{target:String,viewport:Number,easing:Number},data:{target:!1,viewport:1,easing:1},computed:{target:function(t,e){t=t.target;return function t(e){return e?"offsetTop"in e?e:t(Tt(e)):document.body}(t&&Pt(t,e)||e)}},update:{read:function(t,e){var n=t.percent;if(e.has("scroll")||(n=!1),this.matchMedia){var i=n;return t=Fn(this.target)/(this.viewport||1),e=this.easing,{percent:n=Z(t*(1-(e-e*t))),style:i!==n&&this.getCss(n)}}},write:function(t){t=t.style;this.matchMedia?t&&Ve(this.$el,t):this.reset();},events:["scroll","resize"]}};cr={update:{write:function(){var t;this.stack.length||this.dragging||(t=this.getValidIndex(this.index),~this.prevIndex&&this.index===t||this.show(t));},events:["resize"]}};function Jr(t,e,n){var i=to(t,e);return n?i-(t=t,rn(e).width/2-rn(t).width/2):Math.min(i,Zr(e))}function Zr(t){return Math.max(0,Qr(t)-rn(t).width)}function Qr(t){return Dt(t).reduce(function(t,e){return rn(e).width+t},0)}function to(t,e){return t&&(sn(t).left+(lt?rn(t).width-rn(e).width:0))*(lt?-1:1)||0}function eo(t,e,n){Qt(t,te(e,!1,!1,n));}Gi={mixins:[di,Gi,cr],props:{center:Boolean,sets:Boolean},data:{center:!1,sets:!1,attrItem:"uk-slider-item",selList:".uk-slider-items",selNav:".uk-slider-nav",clsContainer:"uk-slider-container",Transitioner:function(i,r,o,t){var e=t.center,s=t.easing,a=t.list,u=new ue,n=i?Jr(i,a,e):Jr(r,a,e)+rn(r).width*o,c=r?Jr(r,a,e):n+rn(i).width*o*(lt?-1:1);return {dir:o,show:function(t,e,n){void 0===e&&(e=0);n=n?"linear":s;return t-=Math.round(t*Z(e,-1,1)),this.translate(e),i&&this.updateTranslates(),e=i?e:Z(e,0,1),eo(this.getItemIn(),"itemin",{percent:e,duration:t,timing:n,dir:o}),i&&eo(this.getItemIn(!0),"itemout",{percent:1-e,duration:t,timing:n,dir:o}),Je.start(a,{transform:Fr(-c*(lt?-1:1),"px")},t,n).then(u.resolve,Q),u.promise},cancel:function(){Je.cancel(a);},reset:function(){Ve(a,"transform","");},forward:function(t,e){return void 0===e&&(e=this.percent()),Je.cancel(a),this.show(t,e,!0)},translate:function(t){var e=this.getDistance()*o*(lt?-1:1);Ve(a,"transform",Fr(Z(e-e*t-c,-Qr(a),rn(a).width)*(lt?-1:1),"px")),this.updateTranslates(),i&&(t=Z(t,-1,1),eo(this.getItemIn(),"itemtranslatein",{percent:t,dir:o}),eo(this.getItemIn(!0),"itemtranslateout",{percent:1-t,dir:o}));},percent:function(){return Math.abs((Ve(a,"transform").split(",")[4]*(lt?-1:1)+n)/(c-n))},getDistance:function(){return Math.abs(c-n)},getItemIn:function(t){void 0===t&&(t=!1);var e=K(this.getActives(),"offsetLeft"),n=K(Dt(a),"offsetLeft"),e=Ot(n,e[0<o*(t?-1:1)?e.length-1:0]);return ~e&&n[e+(i&&!t?o:0)]},getActives:function(){return [i||r].concat(Dt(a).filter(function(t){var e=to(t,a);return n<e&&e+rn(t).width<=rn(a).width+n}))},updateTranslates:function(){var n=this.getActives();Dt(a).forEach(function(t){var e=w(n,t);eo(t,"itemtranslate"+(e?"in":"out"),{percent:e?1:0,dir:t.offsetLeft<=r.offsetLeft?1:-1});});}}}},computed:{avgWidth:function(){return Qr(this.list)/this.length},finite:function(t){return t.finite||Math.ceil(Qr(this.list))<rn(this.list).width+(t=this.list,Math.max.apply(Math,[0].concat(Dt(t).map(function(t){return rn(t).width}))))+this.center},maxIndex:function(){if(!this.finite||this.center&&!this.sets)return this.length-1;if(this.center)return X(this.sets);var e=0,n=Zr(this.list),t=x(this.slides,function(t){return n<=e||void(e+=rn(t).width)});return ~t?t:this.length-1},sets:function(t){var r=this;if(t=t.sets){var o=rn(this.list).width/(this.center?2:1),s=0,a=o,u=0;return !D(t=K(this.slides,"offsetLeft").reduce(function(t,e,n){var i=rn(e).width;return s<u+i&&(w(t,n=!r.center&&n>r.maxIndex?r.maxIndex:n)||(e=r.slides[n+1],r.center&&e&&i<a-rn(e).width/2?a-=i:(a=o,t.push(n),s=u+o+(r.center?i/2:0)))),u+=i,t},[]))&&t}},transitionOptions:function(){return {center:this.center,list:this.list}}},connected:function(){He(this.$el,this.clsContainer,!Ae("."+this.clsContainer,this.$el));},update:{write:function(){var n=this;this.navItems.forEach(function(t){var e=H(ut(t,n.attrItem));!1!==e&&(t.hidden=!n.maxIndex||e>n.maxIndex||n.sets&&!w(n.sets,e));}),!this.length||this.dragging||this.stack.length||(this.reorder(),this._translate(1));var e=this._getTransitioner(this.index).getActives();this.slides.forEach(function(t){return He(t,n.clsActive,w(e,t))}),!this.clsActivated||this.sets&&!w(this.sets,L(this.index))||this.slides.forEach(function(t){return He(t,n.clsActivated||"",w(e,t))});},events:["resize"]},events:{beforeitemshow:function(t){!this.dragging&&this.sets&&this.stack.length<2&&!w(this.sets,this.index)&&(this.index=this.getValidIndex());var e=Math.abs(this.index-this.prevIndex+(0<this.dir&&this.index<this.prevIndex||this.dir<0&&this.index>this.prevIndex?(this.maxIndex+1)*this.dir:0));if(!this.dragging&&1<e){for(var n=0;n<e;n++)this.stack.splice(1,0,0<this.dir?"next":"previous");t.preventDefault();}else {t=this.dir<0||!this.slides[this.prevIndex]?this.index:this.prevIndex;this.duration=qr(this.avgWidth/this.velocity)*(rn(this.slides[t]).width/this.avgWidth),this.reorder();}},itemshow:function(){~this.prevIndex&&Ne(this._getTransitioner().getItemIn(),this.clsActive);}},methods:{reorder:function(){var n=this;if(this.finite)Ve(this.slides,"order","");else {var i=0<this.dir&&this.slides[this.prevIndex]?this.prevIndex:this.index;if(this.slides.forEach(function(t,e){return Ve(t,"order",0<n.dir&&e<i?1:n.dir<0&&e>=n.index?-1:"")}),this.center)for(var t=this.slides[i],e=rn(this.list).width/2-rn(t).width/2,r=0;0<e;){var o=this.getIndex(--r+i,i),s=this.slides[o];Ve(s,"order",i<o?-2:-1),e-=rn(s).width;}}},getValidIndex:function(t,e){if(void 0===t&&(t=this.index),void 0===e&&(e=this.prevIndex),t=this.getIndex(t,e),!this.sets)return t;var n;do{if(w(this.sets,t))return t}while(n=t,(t=this.getIndex(t+this.dir,e))!==n);return t}}};fr={mixins:[fr],data:{selItem:"!li"},computed:{item:function(t,e){return Pt(t.selItem,e)}},events:[{name:"itemin itemout",self:!0,el:function(){return this.item},handler:function(t){var n=this,i=t.type,t=t.detail,r=t.percent,o=t.duration,s=t.timing,a=t.dir;mn.read(function(){var t=n.getCss(io(i,a,r)),e=n.getCss(no(i)?.5:0<a?1:0);mn.write(function(){Ve(n.$el,t),Je.start(n.$el,e,o,s).catch(Q);});});}},{name:"transitioncanceled transitionend",self:!0,el:function(){return this.item},handler:function(){Je.cancel(this.$el);}},{name:"itemtranslatein itemtranslateout",self:!0,el:function(){return this.item},handler:function(t){var e=this,n=t.type,t=t.detail,i=t.percent,r=t.dir;mn.read(function(){var t=e.getCss(io(n,r,i));mn.write(function(){return Ve(e.$el,t)});});}}]};function no(t){return u(t,"in")}function io(t,e,n){return n/=2,no(t)?e<0?1-n:n:e<0?n:1-n}var ro,wi=Y({},wi,{fade:{show:function(){return [{opacity:0,zIndex:0},{zIndex:-1}]},percent:function(t){return 1-Ve(t,"opacity")},translate:function(t){return [{opacity:1-t,zIndex:0},{zIndex:-1}]}},scale:{show:function(){return [{opacity:0,transform:Wr(1.5),zIndex:0},{zIndex:-1}]},percent:function(t){return 1-Ve(t,"opacity")},translate:function(t){return [{opacity:1-t,transform:Wr(1+.5*t),zIndex:0},{zIndex:-1}]}},pull:{show:function(t){return t<0?[{transform:Fr(30),zIndex:-1},{transform:Fr(),zIndex:0}]:[{transform:Fr(-100),zIndex:0},{transform:Fr(),zIndex:-1}]},percent:function(t,e,n){return n<0?1-jr(e):jr(t)},translate:function(t,e){return e<0?[{transform:Fr(30*t),zIndex:-1},{transform:Fr(-100*(1-t)),zIndex:0}]:[{transform:Fr(100*-t),zIndex:0},{transform:Fr(30*(1-t)),zIndex:-1}]}},push:{show:function(t){return t<0?[{transform:Fr(100),zIndex:0},{transform:Fr(),zIndex:-1}]:[{transform:Fr(-30),zIndex:-1},{transform:Fr(),zIndex:0}]},percent:function(t,e,n){return 0<n?1-jr(e):jr(t)},translate:function(t,e){return e<0?[{transform:Fr(100*t),zIndex:0},{transform:Fr(-30*(1-t)),zIndex:-1}]:[{transform:Fr(-30*t),zIndex:-1},{transform:Fr(100*(1-t)),zIndex:0}]}}}),wi={mixins:[di,Ki,cr],props:{ratio:String,minHeight:Number,maxHeight:Number},data:{ratio:"16:9",minHeight:!1,maxHeight:!1,selList:".uk-slideshow-items",attrItem:"uk-slideshow-item",selNav:".uk-slideshow-nav",Animations:wi},update:{read:function(){var t=this.ratio.split(":").map(Number),e=t[0],t=(t=t[1])*this.list.offsetWidth/e||0;return this.minHeight&&(t=Math.max(this.minHeight,t)),{height:(t=this.maxHeight?Math.min(this.maxHeight,t):t)-ln(this.list,"height","content-box")}},write:function(t){t=t.height;0<t&&Ve(this.list,"minHeight",t);},events:["resize"]}},Kn={mixins:[di,Kn],props:{group:String,threshold:Number,clsItem:String,clsPlaceholder:String,clsDrag:String,clsDragState:String,clsBase:String,clsNoDrag:String,clsEmpty:String,clsCustom:String,handle:String},data:{group:!1,threshold:5,clsItem:"uk-sortable-item",clsPlaceholder:"uk-sortable-placeholder",clsDrag:"uk-sortable-drag",clsDragState:"uk-drag",clsBase:"uk-sortable",clsNoDrag:"uk-sortable-nodrag",clsEmpty:"uk-sortable-empty",clsCustom:"",handle:!1,pos:{}},created:function(){var n=this;["init","start","move","end"].forEach(function(t){var e=n[t];n[t]=function(t){Y(n.pos,ae(t)),e(t);};});},events:{name:mt,passive:!1,handler:"init"},computed:{target:function(){return (this.$el.tBodies||[this.$el])[0]},items:function(){return Dt(this.target)},isEmpty:{get:function(){return D(this.items)},watch:function(t){He(this.target,this.clsEmpty,t);},immediate:!0},handles:{get:function(t,e){t=t.handle;return t?Me(t,e):this.items},watch:function(t,e){Ve(e,{touchAction:"",userSelect:""}),Ve(t,{touchAction:pt?"none":"",userSelect:"none"});},immediate:!0}},update:{write:function(t){var e,n,i,r,o,s,a;this.drag&&Tt(this.placeholder)&&(e=(n=this.pos).x,a=n.y,s=(i=this.origin).offsetTop,r=i.offsetLeft,n=this.placeholder,Ve(this.drag,{top:a-s,left:e-r}),(i=this.getSortable(document.elementFromPoint(e,a)))&&((s=i.items).some(Je.inProgress)||(o={x:e,y:a},r=(r=s)[x(r,function(t){return et(o,t.getBoundingClientRect())})],(!s.length||r&&r!==n)&&(s=this.getSortable(n),!1!==(a=function(t,e,n,i,r,o){if(!Dt(t).length)return;var s=e.getBoundingClientRect();if(!o)return function(t,e){var n=1===Dt(t).length;n&&we(t,e);var i=Dt(t),t=i.some(function(t,e){var n=t.getBoundingClientRect();return i.slice(e+1).some(function(t){t=t.getBoundingClientRect();return !oo([n.left,n.right],[t.left,t.right])})});n&&ke(e);return t}(t,n)||r<s.top+s.height/2?e:e.nextElementSibling;o=n.getBoundingClientRect(),t=oo([s.top,s.bottom],[o.top,o.bottom]),n=t?i:r,i=t?"width":"height",r=t?"left":"top",t=t?"right":"bottom",i=o[i]<s[i]?s[i]-o[i]:0;if(o[r]<s[r])return !(i&&n<s[r]+i)&&e.nextElementSibling;if(i&&n>s[t]-i)return !1;return e}(i.target,r,n,e,a,i===s&&t.moved!==r))&&(a&&n===a||(i!==s?(s.remove(n),t.moved=r):delete t.moved,i.insert(n,a),this.touched.add(i)))))));},events:["move"]},methods:{init:function(t){var e=t.target,n=t.button,i=t.defaultPrevented,r=this.items.filter(function(t){return Nt(e,t)})[0];!r||i||0<n||It(e)||Nt(e,"."+this.clsNoDrag)||this.handle&&!Nt(e,this.handle)||(t.preventDefault(),this.touched=new Set([this]),this.placeholder=r,this.origin=Y({target:e,index:Ot(r)},this.pos),Kt(document,gt,this.move),Kt(document,vt,this.end),this.threshold||this.start(t));},start:function(t){this.drag=function(t,e){t=we(t,e.outerHTML.replace(/(^<)(?:li|tr)|(?:li|tr)(\/>$)/g,"$1div$2"));return Ve(t,"margin","0","important"),Ve(t,Y({boxSizing:"border-box",width:e.offsetWidth,height:e.offsetHeight},Ve(e,["paddingLeft","paddingRight","paddingTop","paddingBottom"]))),un(t.firstElementChild,un(e.firstElementChild)),t}(this.$container,this.placeholder);var e,n,i=this.placeholder.getBoundingClientRect(),r=i.left,i=i.top;Y(this.origin,{offsetLeft:this.pos.x-r,offsetTop:this.pos.y-i}),Ne(this.drag,this.clsDrag,this.clsCustom),Ne(this.placeholder,this.clsPlaceholder),Ne(this.items,this.clsItem),Ne(document.documentElement,this.clsDragState),Qt(this.$el,"start",[this,this.placeholder]),e=this.pos,n=Date.now(),ro=setInterval(function(){var t=e.x,s=e.y;s+=window.pageYOffset;var a=.3*(Date.now()-n);n=Date.now(),Wn(document.elementFromPoint(t,e.y)).reverse().some(function(t){var e=t.scrollTop,n=t.scrollHeight,i=on(Vn(t)),r=i.top,o=i.bottom,i=i.height;if(r<s&&s<r+35)e-=a;else {if(!(s<o&&o-35<s))return;e+=a;}if(0<e&&e<n-i)return Ln(t,e),!0});},15),this.move(t);},move:function(t){this.drag?this.$emit("move"):(Math.abs(this.pos.x-this.origin.x)>this.threshold||Math.abs(this.pos.y-this.origin.y)>this.threshold)&&this.start(t);},end:function(){var t,i=this;Jt(document,gt,this.move),Jt(document,vt,this.end),Jt(window,"scroll",this.scroll),this.drag&&(clearInterval(ro),t=this.getSortable(this.placeholder),this===t?this.origin.index!==Ot(this.placeholder)&&Qt(this.$el,"moved",[this,this.placeholder]):(Qt(t.$el,"added",[t,this.placeholder]),Qt(this.$el,"removed",[this,this.placeholder])),Qt(this.$el,"stop",[this,this.placeholder]),ke(this.drag),this.drag=null,this.touched.forEach(function(t){var e=t.clsPlaceholder,n=t.clsItem;return i.touched.forEach(function(t){return Be(t.items,e,n)})}),this.touched=null,Be(document.documentElement,this.clsDragState));},insert:function(t,e){var n=this;Ne(this.items,this.clsItem);function i(){return e?be(e,t):we(n.target,t)}this.animation?this.animate(i):i();},remove:function(t){Nt(t,this.target)&&(this.animation?this.animate(function(){return ke(t)}):ke(t));},getSortable:function(t){do{var e=this.$getComponent(t,"sortable");if(e&&(e===this||!1!==this.group&&e.group===this.group))return e}while(t=Tt(t))}}};function oo(t,e){return t[1]>e[0]&&e[1]>t[0]}bt={mixins:[lr,fi,yi],args:"title",props:{delay:Number,title:String},data:{pos:"top",title:"",delay:0,animation:["uk-animation-scale-up"],duration:100,cls:"uk-active",clsPos:"uk-tooltip"},beforeConnect:function(){var t;this._hasTitle=st(this.$el,"title"),ot(this.$el,"title",""),this.updateAria(!1),function(t){return It(t)||At(t,"a,button")||st(t,"tabindex")}(t=this.$el)||ot(t,"tabindex","0");},disconnected:function(){this.hide(),ot(this.$el,"title",this._hasTitle?this.title:null);},methods:{show:function(){var e=this;!this.isToggled(this.tooltip)&&this.title&&(this._unbind=Zt(document,"show keydown "+mt,this.hide,!1,function(t){return t.type===mt&&!Nt(t.target,e.$el)||"keydown"===t.type&&27===t.keyCode||"show"===t.type&&t.detail[0]!==e&&t.detail[0].$name===e.$name}),clearTimeout(this.showTimer),this.showTimer=setTimeout(this._show,this.delay));},hide:function(){var t=this;At(this.$el,"input:focus")||(clearTimeout(this.showTimer),this.isToggled(this.tooltip)&&this.toggleElement(this.tooltip,!1,!1).then(function(){t.tooltip=ke(t.tooltip),t._unbind();}));},_show:function(){var n=this;this.tooltip=we(this.container,'<div class="'+this.clsPos+'"> <div class="'+this.clsPos+'-inner">'+this.title+"</div> </div>"),Kt(this.tooltip,"toggled",function(t,e){n.updateAria(e),e&&(n.positionAt(n.tooltip,n.$el),n.origin="y"===n.getAxis()?dn(n.dir)+"-"+n.align:n.align+"-"+dn(n.dir));}),this.toggleElement(this.tooltip,!0);},updateAria:function(t){ot(this.$el,"aria-expanded",t);}},events:((yi={focus:"show",blur:"hide"})[wt+" "+bt]=function(t){se(t)||this[t.type===wt?"show":"hide"]();},yi[mt]=function(t){se(t)&&this.show();},yi)};yi={props:{allow:String,clsDragover:String,concurrent:Number,maxSize:Number,method:String,mime:String,msgInvalidMime:String,msgInvalidName:String,msgInvalidSize:String,multiple:Boolean,name:String,params:Object,type:String,url:String},data:{allow:!1,clsDragover:"uk-dragover",concurrent:1,maxSize:0,method:"POST",mime:!1,msgInvalidMime:"Invalid File Type: %s",msgInvalidName:"Invalid File Name: %s",msgInvalidSize:"Invalid File Size: %s Kilobytes Max",multiple:!1,name:"files[]",params:{},type:"",url:"",abort:Q,beforeAll:Q,beforeSend:Q,complete:Q,completeAll:Q,error:Q,fail:Q,load:Q,loadEnd:Q,loadStart:Q,progress:Q},events:{change:function(t){At(t.target,'input[type="file"]')&&(t.preventDefault(),t.target.files&&this.upload(t.target.files),t.target.value="");},drop:function(t){ao(t);t=t.dataTransfer;t&&t.files&&(Be(this.$el,this.clsDragover),this.upload(t.files));},dragenter:function(t){ao(t);},dragover:function(t){ao(t),Ne(this.$el,this.clsDragover);},dragleave:function(t){ao(t),Be(this.$el,this.clsDragover);}},methods:{upload:function(t){var i=this;if(t.length){Qt(this.$el,"upload",[t]);for(var e=0;e<t.length;e++){if(this.maxSize&&1e3*this.maxSize<t[e].size)return void this.fail(this.msgInvalidSize.replace("%s",this.maxSize));if(this.allow&&!so(this.allow,t[e].name))return void this.fail(this.msgInvalidName.replace("%s",this.allow));if(this.mime&&!so(this.mime,t[e].type))return void this.fail(this.msgInvalidMime.replace("%s",this.mime))}this.multiple||(t=[t[0]]),this.beforeAll(this,t);var r=function(t,e){for(var n=[],i=0;i<t.length;i+=e){for(var r=[],o=0;o<e;o++)r.push(t[i+o]);n.push(r);}return n}(t,this.concurrent),o=function(t){var e,n=new FormData;for(e in t.forEach(function(t){return n.append(i.name,t)}),i.params)n.append(e,i.params[e]);pe(i.url,{data:n,method:i.method,responseType:i.type,beforeSend:function(t){var e=t.xhr;return e.upload&&Kt(e.upload,"progress",i.progress),["loadStart","load","loadEnd","abort"].forEach(function(t){return Kt(e,t.toLowerCase(),i[t])}),i.beforeSend(t)}}).then(function(t){i.complete(t),r.length?o(r.shift()):i.completeAll(t);},function(t){return i.error(t)});};o(r.shift());}}}};function so(t,e){return e.match(new RegExp("^"+t.replace(/\//g,"\\/").replace(/\*\*/g,"(\\/[^\\/]+)*").replace(/\*/g,"[^\\/]+").replace(/((?!\\))\?/g,"$1.")+"$","i"))}function ao(t){t.preventDefault(),t.stopPropagation();}return G(Object.freeze({__proto__:null,Countdown:fe,Filter:Mi,Lightbox:Yi,LightboxPanel:Ur,Notification:Ui,Parallax:Xi,Slider:Gi,SliderParallax:fr,Slideshow:wi,SlideshowParallax:fr,Sortable:Kn,Tooltip:bt,Upload:yi}),function(t,e){return Jn.component(e,t)}),Jn});
    });

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsvFormat(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsvFormat(",");

    var csvParse = csv.parse;

    function responseText(response) {
      if (!response.ok) throw new Error(response.status + " " + response.statusText);
      return response.text();
    }

    function text$1(input, init) {
      return fetch(input, init).then(responseText);
    }

    function dsvParse(parse) {
      return function(input, init, row) {
        if (arguments.length === 2 && typeof init === "function") row = init, init = undefined;
        return text$1(input, init).then(function(response) {
          return parse(response, row);
        });
      };
    }

    var csv$1 = dsvParse(csvParse);

    /* src/DataSlicingSelector.svelte generated by Svelte v3.32.3 */

    const file = "src/DataSlicingSelector.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let p;
    	let t1;
    	let div0;
    	let t2;
    	let h30;
    	let t4;
    	let div1;
    	let t5;
    	let h31;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "Select slicing method";
    			t1 = space();
    			div0 = element("div");
    			t2 = text("Option 1\n    ");
    			h30 = element("h3");
    			h30.textContent = "Select periods manually";
    			t4 = space();
    			div1 = element("div");
    			t5 = text("Option 2\n    ");
    			h31 = element("h3");
    			h31.textContent = "Detect periods automatically";
    			add_location(p, file, 5, 2, 66);
    			add_location(h30, file, 8, 4, 150);
    			attr_dev(div0, "class", "option svelte-eyvuxi");
    			toggle_class(div0, "disabled", /*disabled*/ ctx[0]);
    			add_location(div0, file, 6, 2, 97);
    			add_location(h31, file, 12, 4, 247);
    			attr_dev(div1, "class", "option svelte-eyvuxi");
    			toggle_class(div1, "disabled", /*disabled*/ ctx[0]);
    			add_location(div1, file, 10, 2, 194);
    			attr_dev(div2, "class", "svelte-eyvuxi");
    			toggle_class(div2, "disabled", /*disabled*/ ctx[0]);
    			add_location(div2, file, 4, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, p);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, t2);
    			append_dev(div0, h30);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, t5);
    			append_dev(div1, h31);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*disabled*/ 1) {
    				toggle_class(div0, "disabled", /*disabled*/ ctx[0]);
    			}

    			if (dirty & /*disabled*/ 1) {
    				toggle_class(div1, "disabled", /*disabled*/ ctx[0]);
    			}

    			if (dirty & /*disabled*/ 1) {
    				toggle_class(div2, "disabled", /*disabled*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DataSlicingSelector", slots, []);
    	let { disabled } = $$props;
    	const writable_props = ["disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DataSlicingSelector> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ disabled });

    	$$self.$inject_state = $$props => {
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [disabled];
    }

    class DataSlicingSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { disabled: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataSlicingSelector",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*disabled*/ ctx[0] === undefined && !("disabled" in props)) {
    			console.warn("<DataSlicingSelector> was created without expected prop 'disabled'");
    		}
    	}

    	get disabled() {
    		throw new Error("<DataSlicingSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<DataSlicingSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/VisThumbnail.svelte generated by Svelte v3.32.3 */

    const file$1 = "src/VisThumbnail.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Image here";
    			add_location(p, file$1, 6, 2, 91);
    			attr_dev(div, "class", "thumbnail svelte-1pgnjc9");
    			add_location(div, file$1, 5, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VisThumbnail", slots, []);
    	let { visType } = $$props;
    	let { disabled } = $$props;
    	const writable_props = ["visType", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VisThumbnail> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("visType" in $$props) $$invalidate(0, visType = $$props.visType);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ visType, disabled });

    	$$self.$inject_state = $$props => {
    		if ("visType" in $$props) $$invalidate(0, visType = $$props.visType);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visType, disabled];
    }

    class VisThumbnail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { visType: 0, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VisThumbnail",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*visType*/ ctx[0] === undefined && !("visType" in props)) {
    			console.warn("<VisThumbnail> was created without expected prop 'visType'");
    		}

    		if (/*disabled*/ ctx[1] === undefined && !("disabled" in props)) {
    			console.warn("<VisThumbnail> was created without expected prop 'disabled'");
    		}
    	}

    	get visType() {
    		throw new Error("<VisThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visType(value) {
    		throw new Error("<VisThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<VisThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<VisThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/VisTypeSelector.svelte generated by Svelte v3.32.3 */
    const file$2 = "src/VisTypeSelector.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h3;
    	let t1;
    	let visthumbnail0;
    	let t2;
    	let visthumbnail1;
    	let t3;
    	let visthumbnail2;
    	let t4;
    	let visthumbnail3;
    	let current;
    	visthumbnail0 = new VisThumbnail({ $$inline: true });
    	visthumbnail1 = new VisThumbnail({ $$inline: true });
    	visthumbnail2 = new VisThumbnail({ $$inline: true });
    	visthumbnail3 = new VisThumbnail({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Select visualization type";
    			t1 = space();
    			create_component(visthumbnail0.$$.fragment);
    			t2 = space();
    			create_component(visthumbnail1.$$.fragment);
    			t3 = space();
    			create_component(visthumbnail2.$$.fragment);
    			t4 = space();
    			create_component(visthumbnail3.$$.fragment);
    			add_location(h3, file$2, 7, 2, 137);
    			attr_dev(div, "class", "container svelte-k9xab1");
    			toggle_class(div, "disabled", /*disabled*/ ctx[0]);
    			add_location(div, file$2, 6, 0, 96);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);
    			mount_component(visthumbnail0, div, null);
    			append_dev(div, t2);
    			mount_component(visthumbnail1, div, null);
    			append_dev(div, t3);
    			mount_component(visthumbnail2, div, null);
    			append_dev(div, t4);
    			mount_component(visthumbnail3, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*disabled*/ 1) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(visthumbnail0.$$.fragment, local);
    			transition_in(visthumbnail1.$$.fragment, local);
    			transition_in(visthumbnail2.$$.fragment, local);
    			transition_in(visthumbnail3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(visthumbnail0.$$.fragment, local);
    			transition_out(visthumbnail1.$$.fragment, local);
    			transition_out(visthumbnail2.$$.fragment, local);
    			transition_out(visthumbnail3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(visthumbnail0);
    			destroy_component(visthumbnail1);
    			destroy_component(visthumbnail2);
    			destroy_component(visthumbnail3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VisTypeSelector", slots, []);
    	let { disabled } = $$props;
    	const writable_props = ["disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VisTypeSelector> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ VisThumbnail, disabled });

    	$$self.$inject_state = $$props => {
    		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [disabled];
    }

    class VisTypeSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { disabled: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VisTypeSelector",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*disabled*/ ctx[0] === undefined && !("disabled" in props)) {
    			console.warn("<VisTypeSelector> was created without expected prop 'disabled'");
    		}
    	}

    	get disabled() {
    		throw new Error("<VisTypeSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<VisTypeSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Sidebar.svelte generated by Svelte v3.32.3 */
    const file$3 = "src/Sidebar.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t1;
    	let dataslicingselector;
    	let t2;
    	let vistypeselector;
    	let current;

    	dataslicingselector = new DataSlicingSelector({
    			props: {
    				disabled: /*dataSlicingSelectorDisabled*/ ctx[0]
    			},
    			$$inline: true
    		});

    	vistypeselector = new VisTypeSelector({
    			props: {
    				disabled: /*visTypeSelectorDisabled*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Time Slices App";
    			t1 = space();
    			create_component(dataslicingselector.$$.fragment);
    			t2 = space();
    			create_component(vistypeselector.$$.fragment);
    			add_location(div0, file$3, 19, 2, 381);
    			attr_dev(div1, "id", "sidebar");
    			attr_dev(div1, "class", "svelte-1k0yy4k");
    			add_location(div1, file$3, 17, 0, 355);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			mount_component(dataslicingselector, div1, null);
    			append_dev(div1, t2);
    			mount_component(vistypeselector, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dataslicingselector_changes = {};
    			if (dirty & /*dataSlicingSelectorDisabled*/ 1) dataslicingselector_changes.disabled = /*dataSlicingSelectorDisabled*/ ctx[0];
    			dataslicingselector.$set(dataslicingselector_changes);
    			const vistypeselector_changes = {};
    			if (dirty & /*visTypeSelectorDisabled*/ 2) vistypeselector_changes.disabled = /*visTypeSelectorDisabled*/ ctx[1];
    			vistypeselector.$set(vistypeselector_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dataslicingselector.$$.fragment, local);
    			transition_in(vistypeselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dataslicingselector.$$.fragment, local);
    			transition_out(vistypeselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(dataslicingselector);
    			destroy_component(vistypeselector);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sidebar", slots, []);
    	let { dataSlicingSelectorDisabled = true } = $$props;
    	let { visTypeSelectorDisabled = true } = $$props;
    	const writable_props = ["dataSlicingSelectorDisabled", "visTypeSelectorDisabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("dataSlicingSelectorDisabled" in $$props) $$invalidate(0, dataSlicingSelectorDisabled = $$props.dataSlicingSelectorDisabled);
    		if ("visTypeSelectorDisabled" in $$props) $$invalidate(1, visTypeSelectorDisabled = $$props.visTypeSelectorDisabled);
    	};

    	$$self.$capture_state = () => ({
    		DataSlicingSelector,
    		VisTypeSelector,
    		dataSlicingSelectorDisabled,
    		visTypeSelectorDisabled
    	});

    	$$self.$inject_state = $$props => {
    		if ("dataSlicingSelectorDisabled" in $$props) $$invalidate(0, dataSlicingSelectorDisabled = $$props.dataSlicingSelectorDisabled);
    		if ("visTypeSelectorDisabled" in $$props) $$invalidate(1, visTypeSelectorDisabled = $$props.visTypeSelectorDisabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dataSlicingSelectorDisabled, visTypeSelectorDisabled];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			dataSlicingSelectorDisabled: 0,
    			visTypeSelectorDisabled: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get dataSlicingSelectorDisabled() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dataSlicingSelectorDisabled(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visTypeSelectorDisabled() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visTypeSelectorDisabled(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/DataSourcePage.svelte generated by Svelte v3.32.3 */

    const file$4 = "src/DataSourcePage.svelte";

    function create_fragment$4(ctx) {
    	let div3;
    	let div2;
    	let h2;
    	let t1;
    	let div1;
    	let span0;
    	let t2;
    	let span1;
    	let t4;
    	let div0;
    	let input;
    	let t5;
    	let span2;
    	let t7;
    	let button0;
    	let t9;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Load data";
    			t1 = space();
    			div1 = element("div");
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "Drag CSV file here or";
    			t4 = space();
    			div0 = element("div");
    			input = element("input");
    			t5 = space();
    			span2 = element("span");
    			span2.textContent = "select one";
    			t7 = space();
    			button0 = element("button");
    			button0.textContent = "US GDP";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "test";
    			add_location(h2, file$4, 79, 4, 1690);
    			attr_dev(span0, "uk-icon", "icon: cloud-upload");
    			add_location(span0, file$4, 82, 6, 1774);
    			attr_dev(span1, "class", "uk-text-middle");
    			add_location(span1, file$4, 83, 6, 1823);
    			attr_dev(input, "type", "file");
    			add_location(input, file$4, 85, 8, 1916);
    			attr_dev(span2, "class", "uk-link");
    			add_location(span2, file$4, 86, 8, 1944);
    			attr_dev(div0, "uk-form-custom", "");
    			add_location(div0, file$4, 84, 6, 1887);
    			attr_dev(div1, "class", "js-upload uk-placeholder uk-text-center");
    			add_location(div1, file$4, 81, 4, 1714);
    			add_location(button0, file$4, 90, 4, 2013);
    			add_location(button1, file$4, 93, 4, 2118);
    			add_location(div2, file$4, 77, 2, 1677);
    			attr_dev(div3, "class", "uk-padding-small uk-width-expand");
    			add_location(div3, file$4, 76, 0, 1628);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h2);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t2);
    			append_dev(div1, span1);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			append_dev(div0, t5);
    			append_dev(div0, span2);
    			append_dev(div2, t7);
    			append_dev(div2, button0);
    			append_dev(div2, t9);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DataSourcePage", slots, []);

    	let dataSamples = [
    		{
    			id: 1,
    			url: "data/us_gdp_sliced_data.csv"
    		},
    		{
    			id: 2,
    			url: "data/us_gdp_sliced_data.csv"
    		}
    	];

    	let { dataSourceUrl } = $$props;
    	const writable_props = ["dataSourceUrl"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DataSourcePage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, dataSourceUrl = "data/us_gdp_sliced_data.csv");
    	const click_handler_1 = () => $$invalidate(0, dataSourceUrl = "data/test.csv");

    	$$self.$$set = $$props => {
    		if ("dataSourceUrl" in $$props) $$invalidate(0, dataSourceUrl = $$props.dataSourceUrl);
    	};

    	$$self.$capture_state = () => ({ dataSamples, dataSourceUrl });

    	$$self.$inject_state = $$props => {
    		if ("dataSamples" in $$props) dataSamples = $$props.dataSamples;
    		if ("dataSourceUrl" in $$props) $$invalidate(0, dataSourceUrl = $$props.dataSourceUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dataSourceUrl, click_handler, click_handler_1];
    }

    class DataSourcePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { dataSourceUrl: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataSourcePage",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*dataSourceUrl*/ ctx[0] === undefined && !("dataSourceUrl" in props)) {
    			console.warn("<DataSourcePage> was created without expected prop 'dataSourceUrl'");
    		}
    	}

    	get dataSourceUrl() {
    		throw new Error("<DataSourcePage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dataSourceUrl(value) {
    		throw new Error("<DataSourcePage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/VisPage.svelte generated by Svelte v3.32.3 */

    const file$5 = "src/VisPage.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Other data source";
    			add_location(button, file$5, 12, 2, 122);
    			attr_dev(div, "class", "uk-padding-small");
    			add_location(div, file$5, 10, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VisPage", slots, []);
    	let { showDataSourcePage = false } = $$props;
    	const writable_props = ["showDataSourcePage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VisPage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showDataSourcePage = true);

    	$$self.$$set = $$props => {
    		if ("showDataSourcePage" in $$props) $$invalidate(0, showDataSourcePage = $$props.showDataSourcePage);
    	};

    	$$self.$capture_state = () => ({ showDataSourcePage });

    	$$self.$inject_state = $$props => {
    		if ("showDataSourcePage" in $$props) $$invalidate(0, showDataSourcePage = $$props.showDataSourcePage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showDataSourcePage, click_handler];
    }

    class VisPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { showDataSourcePage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VisPage",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get showDataSourcePage() {
    		throw new Error("<VisPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showDataSourcePage(value) {
    		throw new Error("<VisPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */

    const { console: console_1 } = globals;
    const file$6 = "src/App.svelte";

    // (58:4) {:else}
    function create_else_block(ctx) {
    	let vispage;
    	let updating_showDataSourcePage;
    	let current;

    	function vispage_showDataSourcePage_binding(value) {
    		/*vispage_showDataSourcePage_binding*/ ctx[5](value);
    	}

    	let vispage_props = {};

    	if (/*showDataSourcePage*/ ctx[0] !== void 0) {
    		vispage_props.showDataSourcePage = /*showDataSourcePage*/ ctx[0];
    	}

    	vispage = new VisPage({ props: vispage_props, $$inline: true });
    	binding_callbacks.push(() => bind(vispage, "showDataSourcePage", vispage_showDataSourcePage_binding));

    	const block = {
    		c: function create() {
    			create_component(vispage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(vispage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const vispage_changes = {};

    			if (!updating_showDataSourcePage && dirty & /*showDataSourcePage*/ 1) {
    				updating_showDataSourcePage = true;
    				vispage_changes.showDataSourcePage = /*showDataSourcePage*/ ctx[0];
    				add_flush_callback(() => updating_showDataSourcePage = false);
    			}

    			vispage.$set(vispage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(vispage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(vispage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(vispage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(58:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:4) {#if showDataSourcePage}
    function create_if_block(ctx) {
    	let datasourcepage;
    	let updating_dataSourceUrl;
    	let current;

    	function datasourcepage_dataSourceUrl_binding(value) {
    		/*datasourcepage_dataSourceUrl_binding*/ ctx[4](value);
    	}

    	let datasourcepage_props = {};

    	if (/*dataSourceUrl*/ ctx[1] !== void 0) {
    		datasourcepage_props.dataSourceUrl = /*dataSourceUrl*/ ctx[1];
    	}

    	datasourcepage = new DataSourcePage({
    			props: datasourcepage_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(datasourcepage, "dataSourceUrl", datasourcepage_dataSourceUrl_binding));

    	const block = {
    		c: function create() {
    			create_component(datasourcepage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(datasourcepage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const datasourcepage_changes = {};

    			if (!updating_dataSourceUrl && dirty & /*dataSourceUrl*/ 2) {
    				updating_dataSourceUrl = true;
    				datasourcepage_changes.dataSourceUrl = /*dataSourceUrl*/ ctx[1];
    				add_flush_callback(() => updating_dataSourceUrl = false);
    			}

    			datasourcepage.$set(datasourcepage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datasourcepage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datasourcepage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(datasourcepage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(56:4) {#if showDataSourcePage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let div;
    	let sidebar;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const sidebar_spread_levels = [/*sidebarConfig*/ ctx[2]];
    	let sidebar_props = {};

    	for (let i = 0; i < sidebar_spread_levels.length; i += 1) {
    		sidebar_props = assign(sidebar_props, sidebar_spread_levels[i]);
    	}

    	sidebar = new Sidebar({ props: sidebar_props, $$inline: true });
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*showDataSourcePage*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(sidebar.$$.fragment);
    			t = space();
    			if_block.c();
    			attr_dev(div, "uk-height-viewport", "");
    			attr_dev(div, "class", "uk-grid-match uk-grid-collapse");
    			attr_dev(div, "uk-grid", "");
    			add_location(div, file$6, 53, 2, 1139);
    			add_location(main, file$6, 51, 0, 1125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(sidebar, div, null);
    			append_dev(div, t);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidebar_changes = (dirty & /*sidebarConfig*/ 4)
    			? get_spread_update(sidebar_spread_levels, [get_spread_object(/*sidebarConfig*/ ctx[2])])
    			: {};

    			sidebar.$set(sidebar_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(sidebar);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let showDataSourcePage = true;
    	let rawData;
    	let dataSourceUrl;

    	const sidebarConfig = {
    		dataSlicingSelectorDisabled: true,
    		visTypeSelectorDisabled: true
    	};

    	function loadData() {
    		csv$1(dataSourceUrl).then(data => {
    			data.forEach(d => {
    				d.value = +d.value;
    			});

    			rawData = data;
    			console.log(rawData);
    			$$invalidate(0, showDataSourcePage = false);
    			$$invalidate(2, sidebarConfig.dataSlicingSelectorDisabled = false, sidebarConfig);
    		});
    	}

    	let { name } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function datasourcepage_dataSourceUrl_binding(value) {
    		dataSourceUrl = value;
    		$$invalidate(1, dataSourceUrl);
    	}

    	function vispage_showDataSourcePage_binding(value) {
    		showDataSourcePage = value;
    		$$invalidate(0, showDataSourcePage);
    	}

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		csv: csv$1,
    		Sidebar,
    		DataSourcePage,
    		VisPage,
    		showDataSourcePage,
    		rawData,
    		dataSourceUrl,
    		sidebarConfig,
    		loadData,
    		name
    	});

    	$$self.$inject_state = $$props => {
    		if ("showDataSourcePage" in $$props) $$invalidate(0, showDataSourcePage = $$props.showDataSourcePage);
    		if ("rawData" in $$props) rawData = $$props.rawData;
    		if ("dataSourceUrl" in $$props) $$invalidate(1, dataSourceUrl = $$props.dataSourceUrl);
    		if ("name" in $$props) $$invalidate(3, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dataSourceUrl*/ 2) {
    			// When data source url changes
    			if (dataSourceUrl) {
    				loadData();
    			}
    		}

    		if ($$self.$$.dirty & /*showDataSourcePage*/ 1) {
    			if (showDataSourcePage) {
    				$$invalidate(2, sidebarConfig.dataSlicingSelectorDisabled = true, sidebarConfig);
    				$$invalidate(2, sidebarConfig.visTypeSelectorDisabled = true, sidebarConfig);
    			}
    		}
    	};

    	return [
    		showDataSourcePage,
    		dataSourceUrl,
    		sidebarConfig,
    		name,
    		datasourcepage_dataSourceUrl_binding,
    		vispage_showDataSourcePage_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { name: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[3] === undefined && !("name" in props)) {
    			console_1.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
