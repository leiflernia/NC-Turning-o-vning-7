
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(document);
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
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
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
    function createEventDispatcher() {
        const component = current_component;
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
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
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
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
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
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
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
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Modal.svelte generated by Svelte v3.12.1 */

    const file = "src/Modal.svelte";

    function create_fragment(ctx) {
    	var div0, t0, div1, t1, br, t2, button, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");

    			if (default_slot) default_slot.c();
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Stäng";
    			attr_dev(div0, "class", "modal-background svelte-1k3utew");
    			add_location(div0, file, 35, 0, 544);

    			add_location(br, file, 41, 4, 702);
    			attr_dev(button, "class", "svelte-1k3utew");
    			add_location(button, file, 43, 1, 709);
    			attr_dev(div1, "class", "modal svelte-1k3utew");
    			add_location(div1, file, 37, 0, 619);

    			dispose = [
    				listen_dev(div0, "click", ctx.click_handler),
    				listen_dev(button, "click", ctx.click_handler_1)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div1_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, br);
    			append_dev(div1, t2);
    			append_dev(div1, button);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div0);
    				detach_dev(t0);
    				detach_dev(div1);
    			}

    			if (default_slot) default_slot.d(detaching);
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

    	let { $$slots = {}, $$scope } = $$props;

    	const click_handler = () => dispatch("close");

    	const click_handler_1 = () => dispatch("close");

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return {
    		dispatch,
    		click_handler,
    		click_handler_1,
    		$$slots,
    		$$scope
    	};
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Modal", options, id: create_fragment.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/App.svelte";

    // (289:0) {#if first}
    function create_if_block_32(ctx) {
    	var div3, div0, img, t0, div1, p, t2, div2, form, input, t3, button, t5, current_block_type_index, if_block, current, dispose;

    	var if_block_creators = [
    		create_if_block_33,
    		create_if_block_34
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.showModal1Wrong) return 0;
    		if (ctx.showModal1Tip) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Programmera dig från punkt till punkt. Observera att både X & Z måste\n          anges för varje block. Grönt streck = G1, G2 eller G3. Rött streck =\n          G0 Använd snabbmatning (G0) vid körning till konturen. Följ den blå\n          punkten runt konturen. Avsluta med kod för programslut. Varje ruta\n          motsvarar 10mm och tänk på att X är diametral";
    			t2 = space();
    			div2 = element("div");
    			form = element("form");
    			input = element("input");
    			t3 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t5 = space();
    			if (if_block) if_block.c();
    			attr_dev(img, "width", "100%");
    			attr_dev(img, "src", "bild-01.jpg");
    			attr_dev(img, "alt", "Bild 1");
    			add_location(img, file$1, 295, 6, 6801);
    			add_location(div0, file$1, 294, 4, 6789);
    			add_location(p, file$1, 298, 6, 6880);
    			add_location(div1, file$1, 297, 4, 6868);
    			input.autofocus = true;
    			attr_dev(input, "type", "text");
    			set_style(input, "text-transform", "uppercase");
    			add_location(input, file$1, 309, 8, 7349);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 315, 8, 7531);
    			add_location(form, file$1, 308, 6, 7334);
    			add_location(div2, file$1, 306, 4, 7278);
    			attr_dev(div3, "class", "canvas svelte-1di7duj");
    			add_location(div3, file$1, 289, 2, 6581);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.startRotation), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, p);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.startRotationValue);

    			append_dev(form, t3);
    			append_dev(form, button);
    			append_dev(div3, t5);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(div3, null);
    			current = true;
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.startRotationValue && (input.value !== ctx.startRotationValue)) set_input_value(input, ctx.startRotationValue);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(div3, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_32.name, type: "if", source: "(289:0) {#if first}", ctx });
    	return block;
    }

    // (330:28) 
    function create_if_block_34(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_17] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_1);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_34.name, type: "if", source: "(330:28) ", ctx });
    	return block;
    }

    // (322:4) {#if showModal1Wrong}
    function create_if_block_33(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_16] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_33.name, type: "if", source: "(322:4) {#if showModal1Wrong}", ctx });
    	return block;
    }

    // (331:6) <Modal on:close={() => (showModal1Tip = false)}>
    function create_default_slot_17(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Skriv in G0X20Z5 tryck på Kör";
    			add_location(p, file$1, 331, 8, 8019);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_17.name, type: "slot", source: "(331:6) <Modal on:close={() => (showModal1Tip = false)}>", ctx });
    	return block;
    }

    // (323:6) <Modal on:close={() => (showModal1Wrong = false)}>
    function create_default_slot_16(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tyvärr så var det inte rätt, försök igen och tänk på ordningsföljden.";
    			add_location(p, file$1, 325, 8, 7815);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_16.name, type: "slot", source: "(323:6) <Modal on:close={() => (showModal1Wrong = false)}>", ctx });
    	return block;
    }

    // (337:0) {#if second}
    function create_if_block_29(ctx) {
    	var div2, video0, source0, t0, t1, div1, div0, p, t3, form, input, t4, button, t6, current_block_type_index, if_block, t7, video1, source1, t8, current, dispose;

    	var if_block_creators = [
    		create_if_block_30,
    		create_if_block_31
    	];

    	var if_blocks = [];

    	function select_block_type_1(changed, ctx) {
    		if (ctx.showModal2Wrong) return 0;
    		if (ctx.showModal2Tip) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			video0 = element("video");
    			source0 = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			video1 = element("video");
    			source1 = element("source");
    			t8 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			attr_dev(source0, "src", "clip-1.mp4");
    			attr_dev(source0, "type", "video/mp4");
    			add_location(source0, file$1, 339, 6, 8175);
    			video0.autoplay = true;
    			attr_dev(video0, "width", "700px");
    			add_location(video0, file$1, 338, 4, 8138);
    			add_location(p, file$1, 344, 8, 8337);
    			add_location(div0, file$1, 343, 6, 8323);
    			input.autofocus = true;
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 350, 8, 8507);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 356, 8, 8682);
    			add_location(form, file$1, 349, 6, 8492);
    			add_location(div1, file$1, 342, 4, 8311);
    			attr_dev(div2, "class", "canvas svelte-1di7duj");
    			add_location(div2, file$1, 337, 2, 8113);
    			attr_dev(source1, "src", "clip-2.mp4");
    			attr_dev(source1, "type", "video/mp4");
    			add_location(source1, file$1, 374, 6, 9198);
    			attr_dev(video1, "width", "0px");
    			add_location(video1, file$1, 373, 2, 9172);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_1),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point1), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, video0);
    			append_dev(video0, source0);
    			append_dev(video0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(div1, t3);
    			append_dev(div1, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point1Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div2, t6);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(div2, null);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, video1, anchor);
    			append_dev(video1, source1);
    			append_dev(video1, t8);
    			current = true;
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.point1Value && (input.value !== ctx.point1Value)) set_input_value(input, ctx.point1Value);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();

    			if (detaching) {
    				detach_dev(t7);
    				detach_dev(video1);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_29.name, type: "if", source: "(337:0) {#if second}", ctx });
    	return block;
    }

    // (368:28) 
    function create_if_block_31(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_15] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_3);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_31.name, type: "if", source: "(368:28) ", ctx });
    	return block;
    }

    // (360:4) {#if showModal2Wrong}
    function create_if_block_30(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_14] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_2);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_30.name, type: "if", source: "(360:4) {#if showModal2Wrong}", ctx });
    	return block;
    }

    // (369:6) <Modal on:close={() => (showModal2Tip = false)}>
    function create_default_slot_15(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "G1X40Z-5";
    			add_location(p, file$1, 369, 8, 9120);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_15.name, type: "slot", source: "(369:6) <Modal on:close={() => (showModal2Tip = false)}>", ctx });
    	return block;
    }

    // (361:6) <Modal on:close={() => (showModal2Wrong = false)}>
    function create_default_slot_14(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tyvärr så var det inte rätt, försök igen och tänk på ordningsföljden.";
    			add_location(p, file$1, 363, 8, 8916);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_14.name, type: "slot", source: "(361:6) <Modal on:close={() => (showModal2Wrong = false)}>", ctx });
    	return block;
    }

    // (380:0) {#if third}
    function create_if_block_28(ctx) {
    	var div1, video0, source0, t0, t1, div0, p, t3, form, input, t4, button, t6, video1, source1, t7, dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			video0 = element("video");
    			source0 = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			video1 = element("video");
    			source1 = element("source");
    			t7 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			attr_dev(source0, "src", "clip-2.mp4");
    			attr_dev(source0, "type", "video/mp4");
    			add_location(source0, file$1, 382, 6, 9434);
    			video0.autoplay = true;
    			attr_dev(video0, "width", "700px");
    			add_location(video0, file$1, 381, 4, 9397);
    			add_location(p, file$1, 386, 6, 9582);
    			add_location(div0, file$1, 385, 4, 9570);
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 391, 8, 9704);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 396, 8, 9859);
    			add_location(form, file$1, 390, 4, 9689);
    			attr_dev(div1, "class", "canvas svelte-1di7duj");
    			add_location(div1, file$1, 380, 2, 9372);
    			attr_dev(source1, "src", "clip-3.mp4");
    			attr_dev(source1, "type", "video/mp4");
    			add_location(source1, file$1, 400, 6, 9978);
    			attr_dev(video1, "width", "0px");
    			add_location(video1, file$1, 399, 2, 9952);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_2),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point1), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, video0);
    			append_dev(video0, source0);
    			append_dev(video0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(div1, t3);
    			append_dev(div1, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point1Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, video1, anchor);
    			append_dev(video1, source1);
    			append_dev(video1, t7);
    		},

    		p: function update(changed, ctx) {
    			if (changed.point1Value && (input.value !== ctx.point1Value)) set_input_value(input, ctx.point1Value);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    				detach_dev(t6);
    				detach_dev(video1);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_28.name, type: "if", source: "(380:0) {#if third}", ctx });
    	return block;
    }

    // (406:0) {#if fourth}
    function create_if_block_25(ctx) {
    	var div3, video, source, t0, t1, div0, p, t3, div1, form, input, t4, button, t6, current_block_type_index, if_block, t7, div2, current, dispose;

    	var if_block_creators = [
    		create_if_block_26,
    		create_if_block_27
    	];

    	var if_blocks = [];

    	function select_block_type_2(changed, ctx) {
    		if (ctx.showModal3Wrong) return 0;
    		if (ctx.showModal3Tip) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_2(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			video = element("video");
    			source = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			div1 = element("div");
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			div2 = element("div");
    			attr_dev(source, "src", "clip-2.mp4");
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$1, 408, 6, 10215);
    			video.autoplay = true;
    			attr_dev(video, "width", "700px");
    			add_location(video, file$1, 407, 4, 10178);
    			add_location(p, file$1, 412, 6, 10363);
    			add_location(div0, file$1, 411, 4, 10351);
    			input.autofocus = true;
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 419, 8, 10537);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 425, 8, 10712);
    			add_location(form, file$1, 418, 6, 10522);
    			add_location(div1, file$1, 416, 4, 10466);
    			add_location(div2, file$1, 441, 4, 11196);
    			attr_dev(div3, "class", "canvas svelte-1di7duj");
    			add_location(div3, file$1, 406, 2, 10153);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_3),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point2), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, video);
    			append_dev(video, source);
    			append_dev(video, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, p);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point2Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div3, t6);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			current = true;
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.point2Value && (input.value !== ctx.point2Value)) set_input_value(input, ctx.point2Value);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(div3, t7);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_25.name, type: "if", source: "(406:0) {#if fourth}", ctx });
    	return block;
    }

    // (437:28) 
    function create_if_block_27(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_13] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_5);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_27.name, type: "if", source: "(437:28) ", ctx });
    	return block;
    }

    // (429:4) {#if showModal3Wrong}
    function create_if_block_26(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_12] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_4);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_26.name, type: "if", source: "(429:4) {#if showModal3Wrong}", ctx });
    	return block;
    }

    // (438:6) <Modal on:close={() => (showModal3Tip = false)}>
    function create_default_slot_13(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "G1X40Z-30";
    			add_location(p, file$1, 438, 8, 11150);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_13.name, type: "slot", source: "(438:6) <Modal on:close={() => (showModal3Tip = false)}>", ctx });
    	return block;
    }

    // (430:6) <Modal on:close={() => (showModal3Wrong = false)}>
    function create_default_slot_12(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tyvärr så var det inte rätt, försök igen och tänk på ordningsföljden.";
    			add_location(p, file$1, 432, 8, 10946);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_12.name, type: "slot", source: "(430:6) <Modal on:close={() => (showModal3Wrong = false)}>", ctx });
    	return block;
    }

    // (446:0) {#if fift}
    function create_if_block_24(ctx) {
    	var div2, video0, source0, t0, t1, div0, p, t3, form, input, t4, button, t6, div1, t7, video1, source1, t8, dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			video0 = element("video");
    			source0 = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			video1 = element("video");
    			source1 = element("source");
    			t8 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			attr_dev(source0, "src", "clip-3.mp4");
    			attr_dev(source0, "type", "video/mp4");
    			add_location(source0, file$1, 448, 6, 11316);
    			video0.autoplay = true;
    			attr_dev(video0, "width", "700px");
    			add_location(video0, file$1, 447, 4, 11279);
    			add_location(p, file$1, 452, 6, 11464);
    			add_location(div0, file$1, 451, 4, 11452);
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 455, 8, 11566);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 460, 8, 11721);
    			add_location(form, file$1, 454, 4, 11551);
    			add_location(div1, file$1, 462, 4, 11807);
    			attr_dev(div2, "class", "canvas svelte-1di7duj");
    			add_location(div2, file$1, 446, 2, 11254);
    			attr_dev(source1, "src", "clip-4.mp4");
    			attr_dev(source1, "type", "video/mp4");
    			add_location(source1, file$1, 465, 6, 11852);
    			attr_dev(video1, "width", "0px");
    			add_location(video1, file$1, 464, 2, 11826);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_4),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point2), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, video0);
    			append_dev(video0, source0);
    			append_dev(video0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point2Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, video1, anchor);
    			append_dev(video1, source1);
    			append_dev(video1, t8);
    		},

    		p: function update(changed, ctx) {
    			if (changed.point2Value && (input.value !== ctx.point2Value)) set_input_value(input, ctx.point2Value);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    				detach_dev(t7);
    				detach_dev(video1);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_24.name, type: "if", source: "(446:0) {#if fift}", ctx });
    	return block;
    }

    // (471:0) {#if sixt}
    function create_if_block_21(ctx) {
    	var div4, video, source, t0, t1, div2, div0, p, t3, div1, form, input, t4, button, t6, current_block_type_index, if_block, t7, div3, current, dispose;

    	var if_block_creators = [
    		create_if_block_22,
    		create_if_block_23
    	];

    	var if_blocks = [];

    	function select_block_type_3(changed, ctx) {
    		if (ctx.showModal4Wrong) return 0;
    		if (ctx.showModal4Tip) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_3(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			video = element("video");
    			source = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			div1 = element("div");
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			div3 = element("div");
    			attr_dev(source, "src", "clip-3.mp4");
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$1, 473, 6, 12087);
    			video.autoplay = true;
    			attr_dev(video, "width", "700px");
    			add_location(video, file$1, 472, 4, 12050);
    			add_location(p, file$1, 478, 8, 12249);
    			add_location(div0, file$1, 477, 6, 12235);
    			input.autofocus = true;
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 483, 10, 12417);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 489, 10, 12604);
    			add_location(form, file$1, 482, 8, 12400);
    			add_location(div1, file$1, 480, 6, 12340);
    			add_location(div2, file$1, 476, 4, 12223);
    			add_location(div3, file$1, 507, 4, 13139);
    			attr_dev(div4, "class", "canvas svelte-1di7duj");
    			add_location(div4, file$1, 471, 2, 12025);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_5),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point3), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, video);
    			append_dev(video, source);
    			append_dev(video, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point3Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div2, t6);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(div2, null);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			current = true;
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.point3Value && (input.value !== ctx.point3Value)) set_input_value(input, ctx.point3Value);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_3(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div4);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_21.name, type: "if", source: "(471:0) {#if sixt}", ctx });
    	return block;
    }

    // (502:30) 
    function create_if_block_23(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_11] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_7);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_23.name, type: "if", source: "(502:30) ", ctx });
    	return block;
    }

    // (493:6) {#if showModal4Wrong}
    function create_if_block_22(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_10] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_6);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_22.name, type: "if", source: "(493:6) {#if showModal4Wrong}", ctx });
    	return block;
    }

    // (503:8) <Modal on:close={() => (showModal4Tip = false)}>
    function create_default_slot_11(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "G1X60Z-40";
    			add_location(p, file$1, 503, 10, 13078);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_11.name, type: "slot", source: "(503:8) <Modal on:close={() => (showModal4Tip = false)}>", ctx });
    	return block;
    }

    // (494:8) <Modal on:close={() => (showModal4Wrong = false)}>
    function create_default_slot_10(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tyvärr så var det inte rätt, försök igen och tänk på\n            ordningsföljden.";
    			add_location(p, file$1, 496, 10, 12850);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_10.name, type: "slot", source: "(494:8) <Modal on:close={() => (showModal4Wrong = false)}>", ctx });
    	return block;
    }

    // (512:0) {#if seventh}
    function create_if_block_20(ctx) {
    	var div2, video0, source0, t0, t1, div0, p, t3, form, input, t4, button, t6, div1, t7, video1, source1, t8, dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			video0 = element("video");
    			source0 = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			video1 = element("video");
    			source1 = element("source");
    			t8 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			attr_dev(source0, "src", "clip-4.mp4");
    			attr_dev(source0, "type", "video/mp4");
    			add_location(source0, file$1, 514, 6, 13262);
    			video0.autoplay = true;
    			attr_dev(video0, "width", "700px");
    			add_location(video0, file$1, 513, 4, 13225);
    			add_location(p, file$1, 518, 6, 13410);
    			add_location(div0, file$1, 517, 4, 13398);
    			input.autofocus = true;
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 522, 10, 13562);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 528, 10, 13749);
    			add_location(form, file$1, 520, 4, 13497);
    			add_location(div1, file$1, 530, 4, 13837);
    			attr_dev(div2, "class", "canvas svelte-1di7duj");
    			add_location(div2, file$1, 512, 2, 13200);
    			attr_dev(source1, "src", "clip-5.mp4");
    			attr_dev(source1, "type", "video/mp4");
    			add_location(source1, file$1, 533, 6, 13882);
    			attr_dev(video1, "width", "0px");
    			add_location(video1, file$1, 532, 2, 13856);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_6),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point3), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, video0);
    			append_dev(video0, source0);
    			append_dev(video0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point3Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, video1, anchor);
    			append_dev(video1, source1);
    			append_dev(video1, t8);
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.point3Value && (input.value !== ctx.point3Value)) set_input_value(input, ctx.point3Value);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    				detach_dev(t7);
    				detach_dev(video1);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_20.name, type: "if", source: "(512:0) {#if seventh}", ctx });
    	return block;
    }

    // (539:0) {#if eight}
    function create_if_block_17(ctx) {
    	var div4, video, source, t0, t1, div2, div0, p, t3, div1, form, input, t4, button, t6, current_block_type_index, if_block, t7, div3, current, dispose;

    	var if_block_creators = [
    		create_if_block_18,
    		create_if_block_19
    	];

    	var if_blocks = [];

    	function select_block_type_4(changed, ctx) {
    		if (ctx.showModal5Wrong) return 0;
    		if (ctx.showModal5Tip) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_4(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			video = element("video");
    			source = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			div1 = element("div");
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			div3 = element("div");
    			attr_dev(source, "src", "clip-4.mp4");
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$1, 541, 6, 14122);
    			video.autoplay = true;
    			attr_dev(video, "width", "700px");
    			add_location(video, file$1, 540, 4, 14085);
    			add_location(p, file$1, 546, 8, 14284);
    			add_location(div0, file$1, 545, 6, 14270);
    			input.autofocus = true;
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 551, 10, 14452);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 557, 10, 14639);
    			add_location(form, file$1, 550, 8, 14435);
    			add_location(div1, file$1, 548, 6, 14375);
    			add_location(div2, file$1, 544, 4, 14258);
    			add_location(div3, file$1, 575, 4, 15174);
    			attr_dev(div4, "class", "canvas svelte-1di7duj");
    			add_location(div4, file$1, 539, 2, 14060);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_7),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point4), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, video);
    			append_dev(video, source);
    			append_dev(video, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point4Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div2, t6);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(div2, null);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			current = true;
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.point4Value && (input.value !== ctx.point4Value)) set_input_value(input, ctx.point4Value);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_4(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div4);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_17.name, type: "if", source: "(539:0) {#if eight}", ctx });
    	return block;
    }

    // (570:30) 
    function create_if_block_19(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_9] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_9);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_19.name, type: "if", source: "(570:30) ", ctx });
    	return block;
    }

    // (561:6) {#if showModal5Wrong}
    function create_if_block_18(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_8] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_8);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_18.name, type: "if", source: "(561:6) {#if showModal5Wrong}", ctx });
    	return block;
    }

    // (571:8) <Modal on:close={() => (showModal5Tip = false)}>
    function create_default_slot_9(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "G1X80Z-40";
    			add_location(p, file$1, 571, 10, 15113);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_9.name, type: "slot", source: "(571:8) <Modal on:close={() => (showModal5Tip = false)}>", ctx });
    	return block;
    }

    // (562:8) <Modal on:close={() => (showModal5Wrong = false)}>
    function create_default_slot_8(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tyvärr så var det inte rätt, försök igen och tänk på\n            ordningsföljden.";
    			add_location(p, file$1, 564, 10, 14885);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_8.name, type: "slot", source: "(562:8) <Modal on:close={() => (showModal5Wrong = false)}>", ctx });
    	return block;
    }

    // (580:0) {#if ninth}
    function create_if_block_16(ctx) {
    	var div2, video0, source0, t0, t1, div0, p, t3, form, input, t4, button, t6, div1, t7, video1, source1, t8, dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			video0 = element("video");
    			source0 = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			video1 = element("video");
    			source1 = element("source");
    			t8 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			attr_dev(source0, "src", "clip-5.mp4");
    			attr_dev(source0, "type", "video/mp4");
    			add_location(source0, file$1, 582, 6, 15295);
    			video0.autoplay = true;
    			attr_dev(video0, "width", "700px");
    			add_location(video0, file$1, 581, 4, 15258);
    			add_location(p, file$1, 586, 6, 15443);
    			add_location(div0, file$1, 585, 4, 15431);
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 589, 10, 15547);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 594, 10, 15712);
    			add_location(form, file$1, 588, 4, 15530);
    			add_location(div1, file$1, 596, 4, 15800);
    			attr_dev(div2, "class", "canvas svelte-1di7duj");
    			add_location(div2, file$1, 580, 2, 15233);
    			attr_dev(source1, "src", "clip-6.mp4");
    			attr_dev(source1, "type", "video/mp4");
    			add_location(source1, file$1, 599, 6, 15845);
    			attr_dev(video1, "width", "0px");
    			add_location(video1, file$1, 598, 2, 15819);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_8),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point4), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, video0);
    			append_dev(video0, source0);
    			append_dev(video0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point4Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, video1, anchor);
    			append_dev(video1, source1);
    			append_dev(video1, t8);
    		},

    		p: function update(changed, ctx) {
    			if (changed.point4Value && (input.value !== ctx.point4Value)) set_input_value(input, ctx.point4Value);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    				detach_dev(t7);
    				detach_dev(video1);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_16.name, type: "if", source: "(580:0) {#if ninth}", ctx });
    	return block;
    }

    // (605:0) {#if tenth}
    function create_if_block_13(ctx) {
    	var div3, video, source, t0, t1, div0, p, t3, div1, form, input, t4, button, t6, current_block_type_index, if_block, t7, div2, current, dispose;

    	var if_block_creators = [
    		create_if_block_14,
    		create_if_block_15
    	];

    	var if_blocks = [];

    	function select_block_type_5(changed, ctx) {
    		if (ctx.showModal6Wrong) return 0;
    		if (ctx.showModal6Tip) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_5(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			video = element("video");
    			source = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			div1 = element("div");
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			div2 = element("div");
    			attr_dev(source, "src", "clip-5.mp4");
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$1, 607, 6, 16085);
    			video.autoplay = true;
    			attr_dev(video, "width", "700px");
    			add_location(video, file$1, 606, 4, 16048);
    			add_location(p, file$1, 611, 6, 16233);
    			add_location(div0, file$1, 610, 4, 16221);
    			input.autofocus = true;
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 616, 8, 16391);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 622, 8, 16566);
    			add_location(form, file$1, 615, 6, 16376);
    			add_location(div1, file$1, 613, 4, 16320);
    			add_location(div2, file$1, 638, 4, 17050);
    			attr_dev(div3, "class", "canvas svelte-1di7duj");
    			add_location(div3, file$1, 605, 2, 16023);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_9),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point5), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, video);
    			append_dev(video, source);
    			append_dev(video, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, p);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point5Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div3, t6);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			current = true;
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.point5Value && (input.value !== ctx.point5Value)) set_input_value(input, ctx.point5Value);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_5(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(div3, t7);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_13.name, type: "if", source: "(605:0) {#if tenth}", ctx });
    	return block;
    }

    // (634:28) 
    function create_if_block_15(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_11);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_15.name, type: "if", source: "(634:28) ", ctx });
    	return block;
    }

    // (626:4) {#if showModal6Wrong}
    function create_if_block_14(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_10);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_14.name, type: "if", source: "(626:4) {#if showModal6Wrong}", ctx });
    	return block;
    }

    // (635:6) <Modal on:close={() => (showModal6Tip = false)}>
    function create_default_slot_7(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "G1X80Z-80";
    			add_location(p, file$1, 635, 8, 17004);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_7.name, type: "slot", source: "(635:6) <Modal on:close={() => (showModal6Tip = false)}>", ctx });
    	return block;
    }

    // (627:6) <Modal on:close={() => (showModal6Wrong = false)}>
    function create_default_slot_6(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tyvärr så var det inte rätt, försök igen och tänk på ordningsföljden.";
    			add_location(p, file$1, 629, 8, 16800);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_6.name, type: "slot", source: "(627:6) <Modal on:close={() => (showModal6Wrong = false)}>", ctx });
    	return block;
    }

    // (643:0) {#if eleventh}
    function create_if_block_12(ctx) {
    	var div2, video0, source0, t0, t1, div0, p, t3, form, input, t4, button, t6, div1, t7, video1, source1, t8, dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			video0 = element("video");
    			source0 = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			video1 = element("video");
    			source1 = element("source");
    			t8 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			attr_dev(source0, "src", "clip-6.mp4");
    			attr_dev(source0, "type", "video/mp4");
    			add_location(source0, file$1, 645, 6, 17179);
    			video0.autoplay = true;
    			attr_dev(video0, "width", "700px");
    			add_location(video0, file$1, 644, 4, 17142);
    			add_location(p, file$1, 649, 6, 17327);
    			add_location(div0, file$1, 648, 4, 17315);
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 652, 8, 17429);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 657, 8, 17584);
    			add_location(form, file$1, 651, 4, 17414);
    			add_location(div1, file$1, 659, 4, 17670);
    			attr_dev(div2, "class", "canvas svelte-1di7duj");
    			add_location(div2, file$1, 643, 2, 17117);
    			attr_dev(source1, "src", "clip-7.mp4");
    			attr_dev(source1, "type", "video/mp4");
    			add_location(source1, file$1, 662, 6, 17715);
    			attr_dev(video1, "width", "0px");
    			add_location(video1, file$1, 661, 2, 17689);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_10),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point5), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, video0);
    			append_dev(video0, source0);
    			append_dev(video0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point5Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, video1, anchor);
    			append_dev(video1, source1);
    			append_dev(video1, t8);
    		},

    		p: function update(changed, ctx) {
    			if (changed.point5Value && (input.value !== ctx.point5Value)) set_input_value(input, ctx.point5Value);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    				detach_dev(t7);
    				detach_dev(video1);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_12.name, type: "if", source: "(643:0) {#if eleventh}", ctx });
    	return block;
    }

    // (668:0) {#if twelfth}
    function create_if_block_9(ctx) {
    	var div3, video, source, t0, t1, div0, p, t3, div1, form, input, t4, button, t6, current_block_type_index, if_block, t7, div2, current, dispose;

    	var if_block_creators = [
    		create_if_block_10,
    		create_if_block_11
    	];

    	var if_blocks = [];

    	function select_block_type_6(changed, ctx) {
    		if (ctx.showModal7Wrong) return 0;
    		if (ctx.showModal7Tip) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_6(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			video = element("video");
    			source = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			div1 = element("div");
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			div2 = element("div");
    			attr_dev(source, "src", "clip-6.mp4");
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$1, 670, 6, 17958);
    			video.autoplay = true;
    			attr_dev(video, "width", "700px");
    			add_location(video, file$1, 669, 4, 17921);
    			add_location(p, file$1, 674, 6, 18106);
    			add_location(div0, file$1, 673, 4, 18094);
    			input.autofocus = true;
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 679, 8, 18264);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 685, 8, 18439);
    			add_location(form, file$1, 678, 6, 18249);
    			add_location(div1, file$1, 676, 4, 18193);
    			add_location(div2, file$1, 701, 4, 18923);
    			attr_dev(div3, "class", "canvas svelte-1di7duj");
    			add_location(div3, file$1, 668, 2, 17896);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_11),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point6), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, video);
    			append_dev(video, source);
    			append_dev(video, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, p);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point6Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div3, t6);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			current = true;
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.point6Value && (input.value !== ctx.point6Value)) set_input_value(input, ctx.point6Value);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_6(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(div3, t7);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_9.name, type: "if", source: "(668:0) {#if twelfth}", ctx });
    	return block;
    }

    // (697:28) 
    function create_if_block_11(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_13);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_11.name, type: "if", source: "(697:28) ", ctx });
    	return block;
    }

    // (689:4) {#if showModal7Wrong}
    function create_if_block_10(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_12);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_10.name, type: "if", source: "(689:4) {#if showModal7Wrong}", ctx });
    	return block;
    }

    // (698:6) <Modal on:close={() => (showModal7Tip = false)}>
    function create_default_slot_5(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "G1X80Z-80";
    			add_location(p, file$1, 698, 8, 18877);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_5.name, type: "slot", source: "(698:6) <Modal on:close={() => (showModal7Tip = false)}>", ctx });
    	return block;
    }

    // (690:6) <Modal on:close={() => (showModal7Wrong = false)}>
    function create_default_slot_4(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tyvärr så var det inte rätt, försök igen och tänk på ordningsföljden.";
    			add_location(p, file$1, 692, 8, 18673);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_4.name, type: "slot", source: "(690:6) <Modal on:close={() => (showModal7Wrong = false)}>", ctx });
    	return block;
    }

    // (706:0) {#if thirteen}
    function create_if_block_8(ctx) {
    	var div2, video0, source0, t0, t1, div0, p, t3, form, input, t4, button, t6, div1, t7, video1, source1, t8, dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			video0 = element("video");
    			source0 = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			video1 = element("video");
    			source1 = element("source");
    			t8 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			attr_dev(source0, "src", "clip-7.mp4");
    			attr_dev(source0, "type", "video/mp4");
    			add_location(source0, file$1, 708, 6, 19052);
    			video0.autoplay = true;
    			attr_dev(video0, "width", "700px");
    			add_location(video0, file$1, 707, 4, 19015);
    			add_location(p, file$1, 712, 6, 19200);
    			add_location(div0, file$1, 711, 4, 19188);
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 715, 8, 19302);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 720, 8, 19457);
    			add_location(form, file$1, 714, 4, 19287);
    			add_location(div1, file$1, 722, 4, 19543);
    			attr_dev(div2, "class", "canvas svelte-1di7duj");
    			add_location(div2, file$1, 706, 2, 18990);
    			attr_dev(source1, "src", "clip-7.mp4");
    			attr_dev(source1, "type", "video/mp4");
    			add_location(source1, file$1, 725, 6, 19588);
    			attr_dev(video1, "width", "0px");
    			add_location(video1, file$1, 724, 2, 19562);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_12),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point6), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, video0);
    			append_dev(video0, source0);
    			append_dev(video0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point6Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, video1, anchor);
    			append_dev(video1, source1);
    			append_dev(video1, t8);
    		},

    		p: function update(changed, ctx) {
    			if (changed.point6Value && (input.value !== ctx.point6Value)) set_input_value(input, ctx.point6Value);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    				detach_dev(t7);
    				detach_dev(video1);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_8.name, type: "if", source: "(706:0) {#if thirteen}", ctx });
    	return block;
    }

    // (731:0) {#if fourteen}
    function create_if_block_5(ctx) {
    	var div3, video, source, t0, t1, div0, p, t3, div1, form, input, t4, button, t6, current_block_type_index, if_block, t7, div2, current, dispose;

    	var if_block_creators = [
    		create_if_block_6,
    		create_if_block_7
    	];

    	var if_blocks = [];

    	function select_block_type_7(changed, ctx) {
    		if (ctx.showModal8Wrong) return 0;
    		if (ctx.showModal8Tip) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_7(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			video = element("video");
    			source = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			div1 = element("div");
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			div2 = element("div");
    			attr_dev(source, "src", "clip-7.mp4");
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$1, 733, 6, 19832);
    			video.autoplay = true;
    			attr_dev(video, "width", "700px");
    			add_location(video, file$1, 732, 4, 19795);
    			add_location(p, file$1, 737, 6, 19980);
    			add_location(div0, file$1, 736, 4, 19968);
    			input.autofocus = true;
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 742, 8, 20138);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 748, 8, 20313);
    			add_location(form, file$1, 741, 6, 20123);
    			add_location(div1, file$1, 739, 4, 20067);
    			add_location(div2, file$1, 764, 4, 20797);
    			attr_dev(div3, "class", "canvas svelte-1di7duj");
    			add_location(div3, file$1, 731, 2, 19770);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_13),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point7), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, video);
    			append_dev(video, source);
    			append_dev(video, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, p);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point7Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div3, t6);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			current = true;
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.point7Value && (input.value !== ctx.point7Value)) set_input_value(input, ctx.point7Value);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_7(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(div3, t7);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_5.name, type: "if", source: "(731:0) {#if fourteen}", ctx });
    	return block;
    }

    // (760:28) 
    function create_if_block_7(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_15);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_7.name, type: "if", source: "(760:28) ", ctx });
    	return block;
    }

    // (752:4) {#if showModal8Wrong}
    function create_if_block_6(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_14);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_6.name, type: "if", source: "(752:4) {#if showModal8Wrong}", ctx });
    	return block;
    }

    // (761:6) <Modal on:close={() => (showModal8Tip = false)}>
    function create_default_slot_3(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "G1X80Z-50";
    			add_location(p, file$1, 761, 8, 20751);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3.name, type: "slot", source: "(761:6) <Modal on:close={() => (showModal8Tip = false)}>", ctx });
    	return block;
    }

    // (753:6) <Modal on:close={() => (showModal8Wrong = false)}>
    function create_default_slot_2(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tyvärr så var det inte rätt, försök igen och tänk på ordningsföljden.";
    			add_location(p, file$1, 755, 8, 20547);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2.name, type: "slot", source: "(753:6) <Modal on:close={() => (showModal8Wrong = false)}>", ctx });
    	return block;
    }

    // (769:0) {#if fifteen}
    function create_if_block_4(ctx) {
    	var div2, video0, source0, t0, t1, div0, p, t3, form, input, t4, button, t6, div1, t7, video1, source1, t8, dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			video0 = element("video");
    			source0 = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.";
    			t3 = space();
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			video1 = element("video");
    			source1 = element("source");
    			t8 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			attr_dev(source0, "src", "clip-8.mp4");
    			attr_dev(source0, "type", "video/mp4");
    			add_location(source0, file$1, 771, 6, 20925);
    			video0.autoplay = true;
    			attr_dev(video0, "width", "700px");
    			add_location(video0, file$1, 770, 4, 20888);
    			add_location(p, file$1, 775, 6, 21073);
    			add_location(div0, file$1, 774, 4, 21061);
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 778, 8, 21175);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 783, 8, 21330);
    			add_location(form, file$1, 777, 4, 21160);
    			add_location(div1, file$1, 785, 4, 21416);
    			attr_dev(div2, "class", "canvas svelte-1di7duj");
    			add_location(div2, file$1, 769, 2, 20863);
    			attr_dev(source1, "src", "clip-9.mp4");
    			attr_dev(source1, "type", "video/mp4");
    			add_location(source1, file$1, 788, 6, 21461);
    			attr_dev(video1, "width", "0px");
    			add_location(video1, file$1, 787, 2, 21435);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_14),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.point7), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, video0);
    			append_dev(video0, source0);
    			append_dev(video0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t3);
    			append_dev(div2, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point7Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, video1, anchor);
    			append_dev(video1, source1);
    			append_dev(video1, t8);
    		},

    		p: function update(changed, ctx) {
    			if (changed.point7Value && (input.value !== ctx.point7Value)) set_input_value(input, ctx.point7Value);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    				detach_dev(t7);
    				detach_dev(video1);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4.name, type: "if", source: "(769:0) {#if fifteen}", ctx });
    	return block;
    }

    // (794:0) {#if sixteen}
    function create_if_block_1(ctx) {
    	var div3, video, source, t0, t1, div0, p, t3, div1, form, input, t4, button, t6, current_block_type_index, if_block, t7, div2, current, dispose;

    	var if_block_creators = [
    		create_if_block_2,
    		create_if_block_3
    	];

    	var if_blocks = [];

    	function select_block_type_8(changed, ctx) {
    		if (ctx.showModal9Wrong) return 0;
    		if (ctx.showModal9Tip) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_8(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			video = element("video");
    			source = element("source");
    			t0 = text("\n      Du måste använda en annan webbläsare för att kunna spela upp video.");
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Nu är övningen slut, avsluta med koden för programslut";
    			t3 = space();
    			div1 = element("div");
    			form = element("form");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Kör";
    			t6 = space();
    			if (if_block) if_block.c();
    			t7 = space();
    			div2 = element("div");
    			attr_dev(source, "src", "clip-6.mp4");
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$1, 796, 6, 21704);
    			video.autoplay = true;
    			attr_dev(video, "width", "700px");
    			add_location(video, file$1, 795, 4, 21667);
    			add_location(p, file$1, 800, 6, 21852);
    			add_location(div0, file$1, 799, 4, 21840);
    			input.autofocus = true;
    			set_style(input, "text-transform", "uppercase");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 805, 8, 22000);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 811, 8, 22175);
    			add_location(form, file$1, 804, 6, 21985);
    			add_location(div1, file$1, 802, 4, 21929);
    			add_location(div2, file$1, 833, 4, 22780);
    			attr_dev(div3, "class", "canvas svelte-1di7duj");
    			add_location(div3, file$1, 794, 2, 21642);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler_15),
    				listen_dev(input, "input", make_uppercase),
    				listen_dev(button, "click", prevent_default(ctx.end), false, true),
    				listen_dev(button, "focus", deleteVideo)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, video);
    			append_dev(video, source);
    			append_dev(video, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, p);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, form);
    			append_dev(form, input);

    			set_input_value(input, ctx.point8Value);

    			append_dev(form, t4);
    			append_dev(form, button);
    			append_dev(div1, t6);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(div1, null);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			current = true;
    			input.focus();
    		},

    		p: function update(changed, ctx) {
    			if (changed.point8Value && (input.value !== ctx.point8Value)) set_input_value(input, ctx.point8Value);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_8(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(794:0) {#if sixteen}", ctx });
    	return block;
    }

    // (828:30) 
    function create_if_block_3(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_17);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(828:30) ", ctx });
    	return block;
    }

    // (819:6) {#if showModal9Wrong}
    function create_if_block_2(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	modal.$on("close", ctx.close_handler_16);

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(819:6) {#if showModal9Wrong}", ctx });
    	return block;
    }

    // (829:8) <Modal on:close={() => (showModal9Tip = false)}>
    function create_default_slot_1(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "För att avsluta ange M30";
    			add_location(p, file$1, 829, 10, 22704);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1.name, type: "slot", source: "(829:8) <Modal on:close={() => (showModal9Tip = false)}>", ctx });
    	return block;
    }

    // (820:8) <Modal on:close={() => (showModal9Wrong = false)}>
    function create_default_slot(ctx) {
    	var p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Tyvärr så var det inte rätt, försök igen och tänk på\n            ordningsföljden.";
    			add_location(p, file$1, 822, 10, 22476);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(820:8) <Modal on:close={() => (showModal9Wrong = false)}>", ctx });
    	return block;
    }

    // (838:0) {#if seventeen}
    function create_if_block(ctx) {
    	var div0, video, source, t0, div1, h1, t2, p;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			video = element("video");
    			source = element("source");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Det är allt!";
    			t2 = space();
    			p = element("p");
    			p.textContent = "Du är nu klar med övningen. Bra jobbat!";
    			attr_dev(source, "src", "clip-7.mp4");
    			attr_dev(source, "type", "video/mp4");
    			add_location(source, file$1, 840, 6, 22906);
    			video.autoplay = true;
    			attr_dev(video, "width", "700px");
    			add_location(video, file$1, 839, 4, 22869);
    			attr_dev(div0, "class", "canvas svelte-1di7duj");
    			add_location(div0, file$1, 838, 2, 22844);
    			add_location(h1, file$1, 844, 4, 22985);
    			add_location(p, file$1, 845, 4, 23011);
    			add_location(div1, file$1, 843, 2, 22975);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, video);
    			append_dev(video, source);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div0);
    				detach_dev(t0);
    				detach_dev(div1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(838:0) {#if seventeen}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, if_block16_anchor, current;

    	var if_block0 = (ctx.first) && create_if_block_32(ctx);

    	var if_block1 = (ctx.second) && create_if_block_29(ctx);

    	var if_block2 = (third) && create_if_block_28(ctx);

    	var if_block3 = (ctx.fourth) && create_if_block_25(ctx);

    	var if_block4 = (fift) && create_if_block_24(ctx);

    	var if_block5 = (ctx.sixt) && create_if_block_21(ctx);

    	var if_block6 = (seventh) && create_if_block_20(ctx);

    	var if_block7 = (ctx.eight) && create_if_block_17(ctx);

    	var if_block8 = (ninth) && create_if_block_16(ctx);

    	var if_block9 = (ctx.tenth) && create_if_block_13(ctx);

    	var if_block10 = (eleventh) && create_if_block_12(ctx);

    	var if_block11 = (ctx.twelfth) && create_if_block_9(ctx);

    	var if_block12 = (thirteen) && create_if_block_8(ctx);

    	var if_block13 = (ctx.fourteen) && create_if_block_5(ctx);

    	var if_block14 = (ctx.fifteen) && create_if_block_4(ctx);

    	var if_block15 = (ctx.sixteen) && create_if_block_1(ctx);

    	var if_block16 = (ctx.seventeen) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			if (if_block5) if_block5.c();
    			t5 = space();
    			if (if_block6) if_block6.c();
    			t6 = space();
    			if (if_block7) if_block7.c();
    			t7 = space();
    			if (if_block8) if_block8.c();
    			t8 = space();
    			if (if_block9) if_block9.c();
    			t9 = space();
    			if (if_block10) if_block10.c();
    			t10 = space();
    			if (if_block11) if_block11.c();
    			t11 = space();
    			if (if_block12) if_block12.c();
    			t12 = space();
    			if (if_block13) if_block13.c();
    			t13 = space();
    			if (if_block14) if_block14.c();
    			t14 = space();
    			if (if_block15) if_block15.c();
    			t15 = space();
    			if (if_block16) if_block16.c();
    			if_block16_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block5) if_block5.m(target, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block6) if_block6.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			if (if_block7) if_block7.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block8) if_block8.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block9) if_block9.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block10) if_block10.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block11) if_block11.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block12) if_block12.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			if (if_block13) if_block13.m(target, anchor);
    			insert_dev(target, t13, anchor);
    			if (if_block14) if_block14.m(target, anchor);
    			insert_dev(target, t14, anchor);
    			if (if_block15) if_block15.m(target, anchor);
    			insert_dev(target, t15, anchor);
    			if (if_block16) if_block16.m(target, anchor);
    			insert_dev(target, if_block16_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.first) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_32(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			if (ctx.second) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_29(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (third) if_block2.p(changed, ctx);

    			if (ctx.fourth) {
    				if (if_block3) {
    					if_block3.p(changed, ctx);
    					transition_in(if_block3, 1);
    				} else {
    					if_block3 = create_if_block_25(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t3.parentNode, t3);
    				}
    			} else if (if_block3) {
    				group_outros();
    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});
    				check_outros();
    			}

    			if (fift) if_block4.p(changed, ctx);

    			if (ctx.sixt) {
    				if (if_block5) {
    					if_block5.p(changed, ctx);
    					transition_in(if_block5, 1);
    				} else {
    					if_block5 = create_if_block_21(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(t5.parentNode, t5);
    				}
    			} else if (if_block5) {
    				group_outros();
    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});
    				check_outros();
    			}

    			if (seventh) if_block6.p(changed, ctx);

    			if (ctx.eight) {
    				if (if_block7) {
    					if_block7.p(changed, ctx);
    					transition_in(if_block7, 1);
    				} else {
    					if_block7 = create_if_block_17(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(t7.parentNode, t7);
    				}
    			} else if (if_block7) {
    				group_outros();
    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});
    				check_outros();
    			}

    			if (ninth) if_block8.p(changed, ctx);

    			if (ctx.tenth) {
    				if (if_block9) {
    					if_block9.p(changed, ctx);
    					transition_in(if_block9, 1);
    				} else {
    					if_block9 = create_if_block_13(ctx);
    					if_block9.c();
    					transition_in(if_block9, 1);
    					if_block9.m(t9.parentNode, t9);
    				}
    			} else if (if_block9) {
    				group_outros();
    				transition_out(if_block9, 1, 1, () => {
    					if_block9 = null;
    				});
    				check_outros();
    			}

    			if (eleventh) if_block10.p(changed, ctx);

    			if (ctx.twelfth) {
    				if (if_block11) {
    					if_block11.p(changed, ctx);
    					transition_in(if_block11, 1);
    				} else {
    					if_block11 = create_if_block_9(ctx);
    					if_block11.c();
    					transition_in(if_block11, 1);
    					if_block11.m(t11.parentNode, t11);
    				}
    			} else if (if_block11) {
    				group_outros();
    				transition_out(if_block11, 1, 1, () => {
    					if_block11 = null;
    				});
    				check_outros();
    			}

    			if (thirteen) if_block12.p(changed, ctx);

    			if (ctx.fourteen) {
    				if (if_block13) {
    					if_block13.p(changed, ctx);
    					transition_in(if_block13, 1);
    				} else {
    					if_block13 = create_if_block_5(ctx);
    					if_block13.c();
    					transition_in(if_block13, 1);
    					if_block13.m(t13.parentNode, t13);
    				}
    			} else if (if_block13) {
    				group_outros();
    				transition_out(if_block13, 1, 1, () => {
    					if_block13 = null;
    				});
    				check_outros();
    			}

    			if (ctx.fifteen) {
    				if (if_block14) {
    					if_block14.p(changed, ctx);
    				} else {
    					if_block14 = create_if_block_4(ctx);
    					if_block14.c();
    					if_block14.m(t14.parentNode, t14);
    				}
    			} else if (if_block14) {
    				if_block14.d(1);
    				if_block14 = null;
    			}

    			if (ctx.sixteen) {
    				if (if_block15) {
    					if_block15.p(changed, ctx);
    					transition_in(if_block15, 1);
    				} else {
    					if_block15 = create_if_block_1(ctx);
    					if_block15.c();
    					transition_in(if_block15, 1);
    					if_block15.m(t15.parentNode, t15);
    				}
    			} else if (if_block15) {
    				group_outros();
    				transition_out(if_block15, 1, 1, () => {
    					if_block15 = null;
    				});
    				check_outros();
    			}

    			if (ctx.seventeen) {
    				if (!if_block16) {
    					if_block16 = create_if_block(ctx);
    					if_block16.c();
    					if_block16.m(if_block16_anchor.parentNode, if_block16_anchor);
    				}
    			} else if (if_block16) {
    				if_block16.d(1);
    				if_block16 = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block3);
    			transition_in(if_block5);
    			transition_in(if_block7);
    			transition_in(if_block9);
    			transition_in(if_block11);
    			transition_in(if_block13);
    			transition_in(if_block15);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block3);
    			transition_out(if_block5);
    			transition_out(if_block7);
    			transition_out(if_block9);
    			transition_out(if_block11);
    			transition_out(if_block13);
    			transition_out(if_block15);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			if (if_block2) if_block2.d(detaching);

    			if (detaching) {
    				detach_dev(t2);
    			}

    			if (if_block3) if_block3.d(detaching);

    			if (detaching) {
    				detach_dev(t3);
    			}

    			if (if_block4) if_block4.d(detaching);

    			if (detaching) {
    				detach_dev(t4);
    			}

    			if (if_block5) if_block5.d(detaching);

    			if (detaching) {
    				detach_dev(t5);
    			}

    			if (if_block6) if_block6.d(detaching);

    			if (detaching) {
    				detach_dev(t6);
    			}

    			if (if_block7) if_block7.d(detaching);

    			if (detaching) {
    				detach_dev(t7);
    			}

    			if (if_block8) if_block8.d(detaching);

    			if (detaching) {
    				detach_dev(t8);
    			}

    			if (if_block9) if_block9.d(detaching);

    			if (detaching) {
    				detach_dev(t9);
    			}

    			if (if_block10) if_block10.d(detaching);

    			if (detaching) {
    				detach_dev(t10);
    			}

    			if (if_block11) if_block11.d(detaching);

    			if (detaching) {
    				detach_dev(t11);
    			}

    			if (if_block12) if_block12.d(detaching);

    			if (detaching) {
    				detach_dev(t12);
    			}

    			if (if_block13) if_block13.d(detaching);

    			if (detaching) {
    				detach_dev(t13);
    			}

    			if (if_block14) if_block14.d(detaching);

    			if (detaching) {
    				detach_dev(t14);
    			}

    			if (if_block15) if_block15.d(detaching);

    			if (detaching) {
    				detach_dev(t15);
    			}

    			if (if_block16) if_block16.d(detaching);

    			if (detaching) {
    				detach_dev(if_block16_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    let tip9 = 1;

    let third = false;

    let fift = false;

    let seventh = false;

    let ninth = false;

    let point9Value = "";

    let eleventh = false;

    let thirteen = false;

    function deleteVideo() {
      caches.delete("video");
    }

    function fetchAndCache(videoFileUrls, cache) {
      // Check first if video is in the cache.
      return cache.match(videoFileUrls).then(cacheResponse => {
        // Let's return cached response if video is already in the cache.
        if (cacheResponse) {
          return cacheResponse;
        }
        // Otherwise, fetch the video from the network.
        return fetch(videoFileUrls).then(networkResponse => {
          // Add the response to the cache and return network response in parallel.
          cache.put(videoFileUrls, networkResponse.clone());
          return networkResponse;
        });
      });
    }

    function make_uppercase() {
      this.value = this.value.toLocaleUpperCase();
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const videoFileUrls = [
        "clip-1.mp4",
        "clip-2.mp4",
        "clip-3.mp4",
        "clip-4.mp4",
        "clip-5.mp4",
        "clip-6.mp4",
        "clip-7.mp4",
        "clip-8.mp4",
        "clip-9.mp4",
        "clip-10.mp4",
        "clip-11.mp4",
      ];

      window.caches
        .open("video")
        .then(cache =>
          Promise.all(
            videoFileUrls.map(videoFileUrl => fetchAndCache(videoFileUrl, cache))
          )
        );

      let showModal1Wrong = false;
      let showModal1Tip = false;
      let tip1 = 1;

      let showModal2Wrong = false;
      let showModal2Tip = false;
      let tip2 = 1;

      let showModal3Wrong = false;
      let showModal3Tip = false;
      let tip3 = 1;

      let showModal4Wrong = false;
      let showModal4Tip = false;
      let tip4 = 1;

      let showModal5Wrong = false;
      let showModal5Tip = false;
      let tip5 = 1;

      let showModal6Wrong = false;
      let showModal6Tip = false;
      let tip6 = 1;

      let showModal7Wrong = false;
      let showModal7Tip = false;
      let tip7 = 1;

      let showModal8Wrong = false;
      let showModal8Tip = false;
      let tip8 = 1;

      let showModal9Wrong = false;
      let showModal9Tip = false;

      let first = true;
      let startRotationValue = "";
      let second = false;
      let point1Value = "";
      let point2Value = "";
      let fourth = false;
      let point3Value = "";
      let point4Value = "";
      let sixt = false;
      let point5Value = "";
      let point6Value = "";
      let eight = false;
      let point7Value = "";
      let point8Value = "";
      let tenth = false;
      let twelfth = false;
      let fourteen = false;
      let fifteen = false;
      let sixteen = false;
      let seventeen = false;


      function startRotation() {
        if (
          startRotationValue.toLocaleUpperCase().replace(/\s/g, "") == "G0X20Z5" ||
          startRotationValue.toLocaleUpperCase().replace(/\s/g, "") == "G00X20Z5"
        ) {
          $$invalidate('second', second = true);
          $$invalidate('first', first = false);
        } else if (tip1 == 1) {
          $$invalidate('showModal1Wrong', showModal1Wrong = true);
          tip1 = 2;
        } else if (tip1 == 2) {
          $$invalidate('showModal1Wrong', showModal1Wrong = true);
          tip1 = 3;
        } else {
          $$invalidate('showModal1Tip', showModal1Tip = true);
        }
      }
      function point1() {
        if (
          point1Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X40Z-5" ||
          point1Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X40Z-5"
        ) {
          $$invalidate('fourth', fourth = true);
          $$invalidate('second', second = false);
        } else if (tip2 == 1) {
          $$invalidate('showModal2Wrong', showModal2Wrong = true);
          tip2 = 2;
        } else if (tip2 == 2) {
          $$invalidate('showModal2Wrong', showModal2Wrong = true);
          tip2 = 3;
        } else {
          $$invalidate('showModal2Tip', showModal2Tip = true);
        }
      }

      function point2() {
        if (
          point2Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X40Z-30" ||
          point2Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X40Z-30"
        ) {
          $$invalidate('sixt', sixt = true);
          $$invalidate('fourth', fourth = false);
        } else if (tip3 == 1) {
          $$invalidate('showModal3Wrong', showModal3Wrong = true);
          tip3 = 2;
        } else if (tip3 == 2) {
          $$invalidate('showModal3Wrong', showModal3Wrong = true);
          tip3 = 3;
        } else {
          $$invalidate('showModal3Tip', showModal3Tip = true);
        }
      }

      function point3() {
        if (
          point3Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X60Z-40" ||
          point3Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X60Z-40"
        ) {
          $$invalidate('eight', eight = true);
          $$invalidate('sixt', sixt = false);
        } else if (tip4 == 1) {
          $$invalidate('showModal4Wrong', showModal4Wrong = true);
          tip4 = 2;
        } else if (tip4 == 2) {
          $$invalidate('showModal4Wrong', showModal4Wrong = true);
          tip4 = 3;
        } else {
          $$invalidate('showModal4Tip', showModal4Tip = true);
        }
      }

      function point4() {
        if (
          point4Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X80Z-40" ||
          point4Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X80Z-40"
        ) {
          $$invalidate('eight', eight = false);
          $$invalidate('tenth', tenth = true);
        } else if (tip5 == 1) {
          $$invalidate('showModal5Wrong', showModal5Wrong = true);
          tip5 = 2;
        } else if (tip5 == 2) {
          $$invalidate('showModal5Wrong', showModal5Wrong = true);
          tip5 = 3;
        } else {
          $$invalidate('showModal5Tip', showModal5Tip = true);
        }
      }

      function point5() {
        if (
          point5Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X80Z-80" ||
          point5Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X80Z-80"
        ) {
          $$invalidate('tenth', tenth = false);
          $$invalidate('sixteen', sixteen = true);
        } else if (tip6 == 1) {
          $$invalidate('showModal6Wrong', showModal6Wrong = true);
          tip6 = 2;
        } else if (tip6 == 2) {
          $$invalidate('showModal6Wrong', showModal6Wrong = true);
          tip6 = 3;
        } else {
          $$invalidate('showModal6Tip', showModal6Tip = true);
        }
      }

      function point6() {
        if (
          point6Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X80Z-80" ||
          point6Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X80Z-80"
        ) {
          $$invalidate('twelfth', twelfth = false);
          $$invalidate('fourteen', fourteen = true);
          setTimeout(function() {
            $$invalidate('sixteen', sixteen = true);
            $$invalidate('fourteen', fourteen = false);
          }, 2000);
        } else if (tip7 == 1) {
          $$invalidate('showModal7Wrong', showModal7Wrong = true);
          tip7 = 2;
        } else if (tip7 == 2) {
          $$invalidate('showModal7Wrong', showModal7Wrong = true);
          tip7 = 3;
        } else {
          $$invalidate('showModal7Tip', showModal7Tip = true);
        }
      }

      function point7() {
        if (
          point7Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X80Z-80" ||
          point7Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X80Z-80"
        ) {
          $$invalidate('fourteen', fourteen = false);
          $$invalidate('sixteen', sixteen = true);
          setTimeout(function() {
            $$invalidate('sixteen', sixteen = true);
            $$invalidate('fifteen', fifteen = false);
          }, 2000);
        } else if (tip8 == 1) {
          $$invalidate('showModal6Wrong', showModal6Wrong = true);
          tip8 = 2;
        } else if (tip8 == 2) {
          $$invalidate('showModal8Wrong', showModal8Wrong = true);
          tip8 = 3;
        } else {
          $$invalidate('showModal8Tip', showModal8Tip = true);
        }
      }

      function end() {
        if (point8Value.toLocaleUpperCase().replace(/\s/g, "") == "M30") {
          $$invalidate('sixteen', sixteen = false);
          $$invalidate('seventeen', seventeen = true);
        } else if (tip7 == 1) {
          $$invalidate('showModal7Wrong', showModal7Wrong = true);
          tip7 = 2;
        } else if (tip7 == 2) {
          $$invalidate('showModal6Wrong', showModal6Wrong = true);
          tip7 = 3;
        } else {
          $$invalidate('showModal7Tip', showModal7Tip = true);
        }
      }

    	function input_input_handler() {
    		startRotationValue = this.value;
    		$$invalidate('startRotationValue', startRotationValue);
    	}

    	const close_handler = () => ($$invalidate('showModal1Wrong', showModal1Wrong = false));

    	const close_handler_1 = () => ($$invalidate('showModal1Tip', showModal1Tip = false));

    	function input_input_handler_1() {
    		point1Value = this.value;
    		$$invalidate('point1Value', point1Value);
    	}

    	const close_handler_2 = () => ($$invalidate('showModal2Wrong', showModal2Wrong = false));

    	const close_handler_3 = () => ($$invalidate('showModal2Tip', showModal2Tip = false));

    	function input_input_handler_2() {
    		point1Value = this.value;
    		$$invalidate('point1Value', point1Value);
    	}

    	function input_input_handler_3() {
    		point2Value = this.value;
    		$$invalidate('point2Value', point2Value);
    	}

    	const close_handler_4 = () => ($$invalidate('showModal3Wrong', showModal3Wrong = false));

    	const close_handler_5 = () => ($$invalidate('showModal3Tip', showModal3Tip = false));

    	function input_input_handler_4() {
    		point2Value = this.value;
    		$$invalidate('point2Value', point2Value);
    	}

    	function input_input_handler_5() {
    		point3Value = this.value;
    		$$invalidate('point3Value', point3Value);
    	}

    	const close_handler_6 = () => ($$invalidate('showModal4Wrong', showModal4Wrong = false));

    	const close_handler_7 = () => ($$invalidate('showModal4Tip', showModal4Tip = false));

    	function input_input_handler_6() {
    		point3Value = this.value;
    		$$invalidate('point3Value', point3Value);
    	}

    	function input_input_handler_7() {
    		point4Value = this.value;
    		$$invalidate('point4Value', point4Value);
    	}

    	const close_handler_8 = () => ($$invalidate('showModal5Wrong', showModal5Wrong = false));

    	const close_handler_9 = () => ($$invalidate('showModal5Tip', showModal5Tip = false));

    	function input_input_handler_8() {
    		point4Value = this.value;
    		$$invalidate('point4Value', point4Value);
    	}

    	function input_input_handler_9() {
    		point5Value = this.value;
    		$$invalidate('point5Value', point5Value);
    	}

    	const close_handler_10 = () => ($$invalidate('showModal6Wrong', showModal6Wrong = false));

    	const close_handler_11 = () => ($$invalidate('showModal6Tip', showModal6Tip = false));

    	function input_input_handler_10() {
    		point5Value = this.value;
    		$$invalidate('point5Value', point5Value);
    	}

    	function input_input_handler_11() {
    		point6Value = this.value;
    		$$invalidate('point6Value', point6Value);
    	}

    	const close_handler_12 = () => ($$invalidate('showModal7Wrong', showModal7Wrong = false));

    	const close_handler_13 = () => ($$invalidate('showModal7Tip', showModal7Tip = false));

    	function input_input_handler_12() {
    		point6Value = this.value;
    		$$invalidate('point6Value', point6Value);
    	}

    	function input_input_handler_13() {
    		point7Value = this.value;
    		$$invalidate('point7Value', point7Value);
    	}

    	const close_handler_14 = () => ($$invalidate('showModal8Wrong', showModal8Wrong = false));

    	const close_handler_15 = () => ($$invalidate('showModal8Tip', showModal8Tip = false));

    	function input_input_handler_14() {
    		point7Value = this.value;
    		$$invalidate('point7Value', point7Value);
    	}

    	function input_input_handler_15() {
    		point8Value = this.value;
    		$$invalidate('point8Value', point8Value);
    	}

    	const close_handler_16 = () => ($$invalidate('showModal9Wrong', showModal9Wrong = false));

    	const close_handler_17 = () => ($$invalidate('showModal9Tip', showModal9Tip = false));

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('showModal1Wrong' in $$props) $$invalidate('showModal1Wrong', showModal1Wrong = $$props.showModal1Wrong);
    		if ('showModal1Tip' in $$props) $$invalidate('showModal1Tip', showModal1Tip = $$props.showModal1Tip);
    		if ('tip1' in $$props) tip1 = $$props.tip1;
    		if ('showModal2Wrong' in $$props) $$invalidate('showModal2Wrong', showModal2Wrong = $$props.showModal2Wrong);
    		if ('showModal2Tip' in $$props) $$invalidate('showModal2Tip', showModal2Tip = $$props.showModal2Tip);
    		if ('tip2' in $$props) tip2 = $$props.tip2;
    		if ('showModal3Wrong' in $$props) $$invalidate('showModal3Wrong', showModal3Wrong = $$props.showModal3Wrong);
    		if ('showModal3Tip' in $$props) $$invalidate('showModal3Tip', showModal3Tip = $$props.showModal3Tip);
    		if ('tip3' in $$props) tip3 = $$props.tip3;
    		if ('showModal4Wrong' in $$props) $$invalidate('showModal4Wrong', showModal4Wrong = $$props.showModal4Wrong);
    		if ('showModal4Tip' in $$props) $$invalidate('showModal4Tip', showModal4Tip = $$props.showModal4Tip);
    		if ('tip4' in $$props) tip4 = $$props.tip4;
    		if ('showModal5Wrong' in $$props) $$invalidate('showModal5Wrong', showModal5Wrong = $$props.showModal5Wrong);
    		if ('showModal5Tip' in $$props) $$invalidate('showModal5Tip', showModal5Tip = $$props.showModal5Tip);
    		if ('tip5' in $$props) tip5 = $$props.tip5;
    		if ('showModal6Wrong' in $$props) $$invalidate('showModal6Wrong', showModal6Wrong = $$props.showModal6Wrong);
    		if ('showModal6Tip' in $$props) $$invalidate('showModal6Tip', showModal6Tip = $$props.showModal6Tip);
    		if ('tip6' in $$props) tip6 = $$props.tip6;
    		if ('showModal7Wrong' in $$props) $$invalidate('showModal7Wrong', showModal7Wrong = $$props.showModal7Wrong);
    		if ('showModal7Tip' in $$props) $$invalidate('showModal7Tip', showModal7Tip = $$props.showModal7Tip);
    		if ('tip7' in $$props) tip7 = $$props.tip7;
    		if ('showModal8Wrong' in $$props) $$invalidate('showModal8Wrong', showModal8Wrong = $$props.showModal8Wrong);
    		if ('showModal8Tip' in $$props) $$invalidate('showModal8Tip', showModal8Tip = $$props.showModal8Tip);
    		if ('tip8' in $$props) tip8 = $$props.tip8;
    		if ('showModal9Wrong' in $$props) $$invalidate('showModal9Wrong', showModal9Wrong = $$props.showModal9Wrong);
    		if ('showModal9Tip' in $$props) $$invalidate('showModal9Tip', showModal9Tip = $$props.showModal9Tip);
    		if ('tip9' in $$props) tip9 = $$props.tip9;
    		if ('first' in $$props) $$invalidate('first', first = $$props.first);
    		if ('startRotationValue' in $$props) $$invalidate('startRotationValue', startRotationValue = $$props.startRotationValue);
    		if ('second' in $$props) $$invalidate('second', second = $$props.second);
    		if ('point1Value' in $$props) $$invalidate('point1Value', point1Value = $$props.point1Value);
    		if ('third' in $$props) $$invalidate('third', third = $$props.third);
    		if ('point2Value' in $$props) $$invalidate('point2Value', point2Value = $$props.point2Value);
    		if ('fourth' in $$props) $$invalidate('fourth', fourth = $$props.fourth);
    		if ('point3Value' in $$props) $$invalidate('point3Value', point3Value = $$props.point3Value);
    		if ('fift' in $$props) $$invalidate('fift', fift = $$props.fift);
    		if ('point4Value' in $$props) $$invalidate('point4Value', point4Value = $$props.point4Value);
    		if ('sixt' in $$props) $$invalidate('sixt', sixt = $$props.sixt);
    		if ('point5Value' in $$props) $$invalidate('point5Value', point5Value = $$props.point5Value);
    		if ('seventh' in $$props) $$invalidate('seventh', seventh = $$props.seventh);
    		if ('point6Value' in $$props) $$invalidate('point6Value', point6Value = $$props.point6Value);
    		if ('eight' in $$props) $$invalidate('eight', eight = $$props.eight);
    		if ('point7Value' in $$props) $$invalidate('point7Value', point7Value = $$props.point7Value);
    		if ('ninth' in $$props) $$invalidate('ninth', ninth = $$props.ninth);
    		if ('point8Value' in $$props) $$invalidate('point8Value', point8Value = $$props.point8Value);
    		if ('tenth' in $$props) $$invalidate('tenth', tenth = $$props.tenth);
    		if ('point9Value' in $$props) point9Value = $$props.point9Value;
    		if ('eleventh' in $$props) $$invalidate('eleventh', eleventh = $$props.eleventh);
    		if ('twelfth' in $$props) $$invalidate('twelfth', twelfth = $$props.twelfth);
    		if ('thirteen' in $$props) $$invalidate('thirteen', thirteen = $$props.thirteen);
    		if ('fourteen' in $$props) $$invalidate('fourteen', fourteen = $$props.fourteen);
    		if ('fifteen' in $$props) $$invalidate('fifteen', fifteen = $$props.fifteen);
    		if ('sixteen' in $$props) $$invalidate('sixteen', sixteen = $$props.sixteen);
    		if ('seventeen' in $$props) $$invalidate('seventeen', seventeen = $$props.seventeen);
    	};

    	return {
    		showModal1Wrong,
    		showModal1Tip,
    		showModal2Wrong,
    		showModal2Tip,
    		showModal3Wrong,
    		showModal3Tip,
    		showModal4Wrong,
    		showModal4Tip,
    		showModal5Wrong,
    		showModal5Tip,
    		showModal6Wrong,
    		showModal6Tip,
    		showModal7Wrong,
    		showModal7Tip,
    		showModal8Wrong,
    		showModal8Tip,
    		showModal9Wrong,
    		showModal9Tip,
    		first,
    		startRotationValue,
    		second,
    		point1Value,
    		point2Value,
    		fourth,
    		point3Value,
    		point4Value,
    		sixt,
    		point5Value,
    		point6Value,
    		eight,
    		point7Value,
    		point8Value,
    		tenth,
    		twelfth,
    		fourteen,
    		fifteen,
    		sixteen,
    		seventeen,
    		startRotation,
    		point1,
    		point2,
    		point3,
    		point4,
    		point5,
    		point6,
    		point7,
    		end,
    		input_input_handler,
    		close_handler,
    		close_handler_1,
    		input_input_handler_1,
    		close_handler_2,
    		close_handler_3,
    		input_input_handler_2,
    		input_input_handler_3,
    		close_handler_4,
    		close_handler_5,
    		input_input_handler_4,
    		input_input_handler_5,
    		close_handler_6,
    		close_handler_7,
    		input_input_handler_6,
    		input_input_handler_7,
    		close_handler_8,
    		close_handler_9,
    		input_input_handler_8,
    		input_input_handler_9,
    		close_handler_10,
    		close_handler_11,
    		input_input_handler_10,
    		input_input_handler_11,
    		close_handler_12,
    		close_handler_13,
    		input_input_handler_12,
    		input_input_handler_13,
    		close_handler_14,
    		close_handler_15,
    		input_input_handler_14,
    		input_input_handler_15,
    		close_handler_16,
    		close_handler_17
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$1.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
