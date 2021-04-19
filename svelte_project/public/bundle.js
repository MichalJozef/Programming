var MyApp = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
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
    function empty() {
        return text('');
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
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
        const prop_values = options.props || {};
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    /* src/Product.svelte generated by Svelte v3.22.2 */

    function create_fragment(ctx) {
    	let p0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let t6;
    	let button0;
    	let t8;
    	let button1;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	return {
    		c() {
    			p0 = element("p");
    			t0 = text("I'm a product ");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = space();
    			if (default_slot) default_slot.c();
    			t3 = space();
    			p1 = element("p");
    			t4 = text("My age is ");
    			t5 = text(/*age*/ ctx[1]);
    			t6 = space();
    			button0 = element("button");
    			button0.textContent = "Delete name";
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "Default name";
    		},
    		m(target, anchor, remount) {
    			insert(target, p0, anchor);
    			append(p0, t0);
    			append(p0, t1);
    			insert(target, t2, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert(target, t3, anchor);
    			insert(target, p1, anchor);
    			append(p1, t4);
    			append(p1, t5);
    			insert(target, t6, anchor);
    			insert(target, button0, anchor);
    			insert(target, t8, anchor);
    			insert(target, button1, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen(button0, "click", /*click_handler*/ ctx[5]),
    				listen(button1, "click", /*click_handler_1*/ ctx[6])
    			];
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data(t1, /*name*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    				}
    			}

    			if (!current || dirty & /*age*/ 2) set_data(t5, /*age*/ ctx[1]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(p0);
    			if (detaching) detach(t2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach(t3);
    			if (detaching) detach(p1);
    			if (detaching) detach(t6);
    			if (detaching) detach(button0);
    			if (detaching) detach(t8);
    			if (detaching) detach(button1);
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { name = "..." } = $$props;
    	let { age = "..." } = $$props;
    	let { $$slots = {}, $$scope } = $$props;
    	const click_handler = () => dispatch("deleteName", "test");
    	const click_handler_1 = () => dispatch("setDefault");

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("age" in $$props) $$invalidate(1, age = $$props.age);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	return [name, age, dispatch, $$scope, $$slots, click_handler, click_handler_1];
    }

    class Product extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0, age: 1 });
    	}
    }

    /* src/View.svelte generated by Svelte v3.22.2 */

    function create_fragment$1(ctx) {
    	let h3;
    	let t0;
    	let t1;

    	return {
    		c() {
    			h3 = element("h3");
    			t0 = text("Your name is ");
    			t1 = text(/*item*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, h3, anchor);
    			append(h3, t0);
    			append(h3, t1);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*item*/ 1) set_data(t1, /*item*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(h3);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { item = "" } = $$props;

    	$$self.$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	return [item];
    }

    class View extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { item: 0 });
    	}
    }

    /* src/Modal.svelte generated by Svelte v3.22.2 */

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-1yn8uu5-style";
    	style.textContent = ".modal.svelte-1yn8uu5{position:fixed;top:0;left:0;width:100%;height:100vh;z-index:3;background:rgba(0, 0, 0, 0.8)}@media screen and (max-width: 600px){.pop.svelte-1yn8uu5{position:absolute;border-radius:0.5em;width:60% !important;height:5em;max-height:10em;z-index:4;top:25% !important;left:20% !important}}.pop.svelte-1yn8uu5{position:absolute;border-radius:0.5em;width:25%;height:5em;max-height:10em;background:beige;z-index:4;top:25%;left:37.5%;overflow:auto}button.svelte-1yn8uu5{position:absolute;left:0;right:0;bottom:0.5em;margin:auto}button#close.svelte-1yn8uu5{bottom:2.3em}";
    	append(document.head, style);
    }

    const get_dismiss_slot_changes = dirty => ({ didAgreed: dirty & /*enabled*/ 1 });
    const get_dismiss_slot_context = ctx => ({ didAgreed: /*enabled*/ ctx[0] });

    // (69:47)          
    function fallback_block(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			t = text("Close");
    			attr(button, "id", "close");
    			button.disabled = button_disabled_value = !/*enabled*/ ctx[0];
    			attr(button, "class", "svelte-1yn8uu5");
    		},
    		m(target, anchor, remount) {
    			insert(target, button, anchor);
    			append(button, t);
    			if (remount) dispose();
    			dispose = listen(button, "click", /*click_handler_1*/ ctx[5]);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*enabled*/ 1 && button_disabled_value !== (button_disabled_value = !/*enabled*/ ctx[0])) {
    				button.disabled = button_disabled_value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			dispose();
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let p0;
    	let t2;
    	let p1;
    	let p2;
    	let t5;
    	let button;
    	let t7;
    	let current;
    	let dispose;
    	const dismiss_slot_template = /*$$slots*/ ctx[3].dismiss;
    	const dismiss_slot = create_slot(dismiss_slot_template, ctx, /*$$scope*/ ctx[2], get_dismiss_slot_context);
    	const dismiss_slot_or_fallback = dismiss_slot || fallback_block(ctx);

    	return {
    		c() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Click on disclaimer";
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "There is some action needed!";
    			p2 = element("p");
    			p2.textContent = "There is some action needed!";
    			t5 = space();
    			button = element("button");
    			button.textContent = "Disclaimer";
    			t7 = space();
    			if (dismiss_slot_or_fallback) dismiss_slot_or_fallback.c();
    			attr(div0, "class", "modal svelte-1yn8uu5");
    			set_style(p0, "text-align", "center");
    			attr(button, "class", "svelte-1yn8uu5");
    			attr(div1, "class", "pop svelte-1yn8uu5");
    		},
    		m(target, anchor, remount) {
    			insert(target, div0, anchor);
    			insert(target, t0, anchor);
    			insert(target, div1, anchor);
    			append(div1, p0);
    			append(div1, t2);
    			append(div1, p1);
    			append(div1, p2);
    			append(div1, t5);
    			append(div1, button);
    			append(div1, t7);

    			if (dismiss_slot_or_fallback) {
    				dismiss_slot_or_fallback.m(div1, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen(button, "click", /*click_handler*/ ctx[4]);
    		},
    		p(ctx, [dirty]) {
    			if (dismiss_slot) {
    				if (dismiss_slot.p && dirty & /*$$scope, enabled*/ 5) {
    					dismiss_slot.p(get_slot_context(dismiss_slot_template, ctx, /*$$scope*/ ctx[2], get_dismiss_slot_context), get_slot_changes(dismiss_slot_template, /*$$scope*/ ctx[2], dirty, get_dismiss_slot_changes));
    				}
    			} else {
    				if (dismiss_slot_or_fallback && dismiss_slot_or_fallback.p && dirty & /*enabled*/ 1) {
    					dismiss_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(dismiss_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(dismiss_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching) detach(t0);
    			if (detaching) detach(div1);
    			if (dismiss_slot_or_fallback) dismiss_slot_or_fallback.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let enabled = false;
    	console.log("Script ran Modal!");

    	onMount(() => {
    		console.log("On mount!");
    	});

    	onDestroy(() => console.log("On destroy!"));

    	afterUpdate(() => {
    		console.log("After update");
    	});

    	beforeUpdate(() => {
    		console.log("Before update");
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	const click_handler = () => $$invalidate(0, enabled = true);
    	const click_handler_1 = () => dispatch("modal");

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	return [enabled, dispatch, $$scope, $$slots, click_handler, click_handler_1];
    }

    class Modal extends SvelteComponent {
    	constructor(options) {
    		super();
    		if (!document.getElementById("svelte-1yn8uu5-style")) add_css();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
    	}
    }

    /* src/App.svelte generated by Svelte v3.22.2 */

    function create_default_slot_1(ctx) {
    	let p;

    	return {
    		c() {
    			p = element("p");
    			p.textContent = "Test SLOT";
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (21:0) {#if modal}
    function create_if_block(ctx) {
    	let current;
    	const modal_1 = new Modal({});
    	modal_1.$on("modal", /*modal_handler*/ ctx[7]);

    	return {
    		c() {
    			create_component(modal_1.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(modal_1, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const modal_1_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				modal_1_changes.$$scope = { dirty, ctx };
    			}

    			modal_1.$set(modal_1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(modal_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(modal_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(modal_1, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let t0;
    	let t1;
    	let button;
    	let t3;
    	let if_block_anchor;
    	let current;
    	let dispose;
    	const product_spread_levels = [/*products*/ ctx[2]];

    	let product_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < product_spread_levels.length; i += 1) {
    		product_props = assign(product_props, product_spread_levels[i]);
    	}

    	const product = new Product({ props: product_props });
    	product.$on("deleteName", /*deleteName_handler*/ ctx[4]);
    	product.$on("setDefault", /*setDefault_handler*/ ctx[5]);
    	const view = new View({ props: { item: /*name*/ ctx[1] } });
    	let if_block = /*modal*/ ctx[0] && create_if_block(ctx);

    	return {
    		c() {
    			create_component(product.$$.fragment);
    			t0 = space();
    			create_component(view.$$.fragment);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Modal";
    			t3 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor, remount) {
    			mount_component(product, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(view, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, button, anchor);
    			insert(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen(button, "click", /*click_handler*/ ctx[6]);
    		},
    		p(ctx, [dirty]) {
    			const product_changes = (dirty & /*products*/ 4)
    			? get_spread_update(product_spread_levels, [get_spread_object(/*products*/ ctx[2])])
    			: {};

    			if (dirty & /*$$scope*/ 256) {
    				product_changes.$$scope = { dirty, ctx };
    			}

    			product.$set(product_changes);
    			const view_changes = {};
    			if (dirty & /*name*/ 2) view_changes.item = /*name*/ ctx[1];
    			view.$set(view_changes);

    			if (/*modal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*modal*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(product.$$.fragment, local);
    			transition_in(view.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(product.$$.fragment, local);
    			transition_out(view.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(product, detaching);
    			if (detaching) detach(t0);
    			destroy_component(view, detaching);
    			if (detaching) detach(t1);
    			if (detaching) detach(button);
    			if (detaching) detach(t3);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    			dispose();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let modal = false;
    	let allowed;
    	let name = "Hershell";
    	let products = { id: "hdks", name: "Hershell", age: 13 };
    	console.log("Script ran App!");
    	const deleteName_handler = () => $$invalidate(1, name = "Abulafia");
    	const setDefault_handler = () => alert("Hello");
    	const click_handler = () => $$invalidate(0, modal = true);
    	const modal_handler = () => $$invalidate(0, modal = false);

    	return [
    		modal,
    		name,
    		products,
    		allowed,
    		deleteName_handler,
    		setDefault_handler,
    		click_handler,
    		modal_handler
    	];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
