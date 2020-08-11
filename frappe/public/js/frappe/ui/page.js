// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

/**
 * Make a standard page layout with a toolbar and title
 *
 * @param {Object} opts
 *
 * @param {string} opts.parent [HTMLElement] Parent element
 * @param {boolean} opts.single_column Whether to include sidebar
 * @param {string} [opts.title] Page title
 * @param {Object} [opts.make_page]
 *
 * @returns {frappe.ui.Page}
 */

/**
 * @typedef {Object} frappe.ui.Page
 */


frappe.ui.make_app_page = function(opts) {
	opts.parent.page = new frappe.ui.Page(opts);
	return opts.parent.page;
}

frappe.ui.pages = {};

frappe.ui.Page = Class.extend({
	init: function(opts) {
		$.extend(this, opts);

		this.set_document_title = true;
		this.buttons = {};
		this.fields_dict = {};
		this.views = {};

		this.make();
		frappe.ui.pages[frappe.get_route_str()] = this;
	},

	make: function() {
		this.wrapper = $(this.parent);
		this.add_main_section();
	},

	get_empty_state: function(tzitle, message, primary_action) {
		let $empty_state = $(`<div class="page-card-container">
			<div class="page-card">
				<div class="page-card-head">
					<span class="indicator blue">
						${title}</span>
				</div>
				<p>${message}</p>
				<div>
					<button class="btn btn-primary btn-sm">${primary_action}</button>
				</div>
			</div>
		</div>`);

		return $empty_state;
	},

	load_lib: function(callback) {
		frappe.require(this.required_libs, callback);
	},

	add_main_section: function() {
		$(frappe.render_template("page", {})).appendTo(this.wrapper);
		if(this.single_column) {
			// nesting under col-sm-12 for consistency
			this.add_view("main", '<div class="row layout-main">\
					<div class="col-md-12 layout-main-section-wrapper">\
						<div class="layout-main-section"></div>\
						<div class="layout-footer hide"></div>\
					</div>\
				</div>');
		} else {
			this.add_view("main", '<div class="row layout-main">\
				<div class="col-md-2 layout-side-section"></div>\
				<div class="col-md-10 layout-main-section-wrapper">\
					<div class="layout-main-section"></div>\
					<div class="desk-sidebar"></div>\
					<div class="layout-footer hide"></div>\
				</div>\
			</div>');
		}

		this.setup_page();
	},

	setup_page: function() {
		this.$title_area = this.wrapper.find("h1");

		this.$sub_title_area = this.wrapper.find("h6");

		if(this.set_document_title!==undefined)
			this.set_document_title = this.set_document_title;

		if(this.title)
			this.set_title(this.title);

		if(this.icon)
			this.get_main_icon(this.icon);

		this.body = this.main = this.wrapper.find(".layout-main-section");
		this.sidebar = this.wrapper.find(".layout-side-section");
		this.footer = this.wrapper.find(".layout-footer");
		this.indicator = this.wrapper.find(".indicator");

		this.page_actions = this.wrapper.find(".page-actions");

		this.btn_primary = this.page_actions.find(".primary-action");
		this.btn_secondary = this.page_actions.find(".btn-secondary");

		this.menu = this.page_actions.find(".menu-btn-group .dropdown-menu");
		this.menu_btn_group = this.page_actions.find(".menu-btn-group");

		this.actions = this.page_actions.find(".actions-btn-group .dropdown-menu");
		this.actions_btn_group = this.page_actions.find(".actions-btn-group");

		this.page_form = $('<div class="page-form row hide"></div>').prependTo(this.main);
		this.inner_toolbar = $('<div class="form-inner-toolbar hide"></div>').prependTo(this.main);
		this.icon_group = this.page_actions.find(".page-icon-group");

		if(this.make_page) {
			this.make_page();
		}

		// keyboard shortcuts
		let menu_btn = this.menu_btn_group.find('button');
		frappe.ui.keys
			.get_shortcut_group(this.page_actions[0])
			.add(menu_btn, menu_btn.find('.menu-btn-group-label'));

		let action_btn = this.actions_btn_group.find('button');
		frappe.ui.keys
			.get_shortcut_group(this.page_actions[0])
			.add(action_btn, action_btn.find('.actions-btn-group-label'));
	},

	set_indicator: function(label, color) {
		this.clear_indicator().removeClass("hide").html(`<span>${label}</span>`).addClass(color);
	},

	add_action_icon: function(icon, click) {
		return $('<a class="text-muted no-decoration"><i class="'+icon+'"></i></a>')
			.appendTo(this.icon_group.removeClass("hide"))
			.click(click);
	},

	clear_indicator: function() {
		return this.indicator.removeClass().addClass("indicator whitespace-nowrap hide");
	},

	get_icon_label: function(icon, label) {
		return '<i class="visible-xs ' + icon + '"></i><span class="hidden-xs">' + label + '</span>'
	},

	set_action: function(btn, opts) {
		let me = this;
		if (opts.icon) {
			opts.label = this.get_icon_label(opts.icon, opts.label);
		}

		this.clear_action_of(btn);

		btn.removeClass("hide")
			.prop("disabled", false)
			.html(opts.label)
			.on("click", function() {
				let response = opts.click.apply(this);
				me.btn_disable_enable(btn, response);
			});

		if (opts.working_label) {
			btn.attr("data-working-label", opts.working_label);
		}

		// alt shortcuts
		let text_span = btn.find('span');
		frappe.ui.keys
			.get_shortcut_group(this)
			.add(btn, text_span.length ? text_span : btn);
	},

	set_primary_action: function(label, click, icon, working_label) {
		this.set_action(this.btn_primary, {
			label: label,
			click: click,
			icon: icon,
			working_label: working_label
		});
		return this.btn_primary;

	},

	set_secondary_action: function(label, click, icon, working_label) {
		this.set_action(this.btn_secondary, {
			label: label,
			click: click,
			icon: icon,
			working_label: working_label
		});

		return this.btn_secondary;
	},


	clear_action_of: function(btn) {
		btn.addClass("hide").unbind("click").removeAttr("data-working-label");
	},

	clear_primary_action: function() {
		this.clear_action_of(this.btn_primary);
	},

	clear_secondary_action: function() {
		this.clear_action_of(this.btn_secondary);
	},

	clear_actions: function() {
		this.clear_primary_action();
		this.clear_secondary_action();
	},

	clear_icons: function() {
		this.icon_group.addClass("hide").empty();
	},

	//--- Menu --//

	add_menu_item: function(label, click, standard, shortcut) {
		return this.add_dropdown_item({
			label,
			click,
			standard,
			parent: this.menu,
			shortcut
		});
	},

	clear_menu: function() {
		this.clear_btn_group(this.menu);
	},

	show_menu: function() {
		this.menu_btn_group.removeClass("hide");
	},

	hide_menu: function() {
		this.menu_btn_group.addClass("hide");
	},

	show_icon_group: function() {
		this.icon_group.removeClass("hide");
	},

	hide_icon_group: function() {
		this.icon_group.addClass("hide");
	},

	//--- Actions Menu--//

	show_actions_menu: function() {
		this.actions_btn_group.removeClass("hide");
	},

	hide_actions_menu: function() {
		this.actions_btn_group.addClass("hide");
	},


	add_action_item: function(label, click, standard) {
		return this.add_dropdown_item({
			label,
			click,
			standard,
			parent: this.actions
		});
	},

	add_actions_menu_item: function(label, click, standard) {
		return this.add_dropdown_item({
			label,
			click,
			standard,
			parent: this.actions,
			show_parent: false
		});
	},

	clear_actions_menu: function() {
		this.clear_btn_group(this.actions);
	},


	//-- Generic --//

	/*
	* Add label to given drop down menu. If label, is already contained in the drop
	* down menu, it will be ignored.
	* @param {string} label - Text for the drop down menu
	* @param {function} click - function to be called when `label` is clicked
	* @param {Boolean} standard
	* @param {object} parent - DOM object representing the parent of the drop down item lists
	* @param {string} shortcut - Keyboard shortcut associated with the element
	* @param {Boolean} show_parent - Whether to show the dropdown button if dropdown item is added
	*/
	add_dropdown_item: function({label, click, standard, parent, shortcut, show_parent=true}) {
		if (show_parent) {
			parent.parent().removeClass("hide");
		}

		let $li;
		if (shortcut) {
			let shortcut_obj = this.prepare_shortcut_obj(shortcut, click, label);
			$li = $(`<li><a class="grey-link dropdown-item" href="#" onClick="return false;">
				<span class="menu-item-label">${label}</span>
				<span class="text-muted pull-right">${shortcut_obj.shortcut_label}</span>
			</a><li>`);
			frappe.ui.keys.add_shortcut(shortcut_obj);
		} else {
			$li = $(`<li><a class="grey-link dropdown-item" href="#" onClick="return false;">
				<span class="menu-item-label">${label}</span></a><li>`);
		}
		var $link = $li.find("a").on("click", click);

		if (this.is_in_group_button_dropdown(parent, 'li > a.grey-link', label)) return;

		if (standard) {
			$li.appendTo(parent);
		} else {
			this.divider = parent.find(".divider");
			if(!this.divider.length) {
				this.divider = $('<li class="divider user-action"></li>').prependTo(parent);
			}
			$li.addClass("user-action").insertBefore(this.divider);
		}

		// alt shortcut
		frappe.ui.keys
			.get_shortcut_group(parent.get(0))
			.add($link, $link.find('.menu-item-label'));

		return $link;
	},

	prepare_shortcut_obj(shortcut, click, label) {
		let shortcut_obj;
		// convert to object, if shortcut string passed
		if (typeof shortcut === 'string') {
			shortcut_obj = { shortcut };
		} else {
			shortcut_obj = shortcut;
		}
		// label
		if (frappe.utils.is_mac()) {
			shortcut_obj.shortcut_label = shortcut_obj.shortcut.replace('Ctrl', '⌘');
		} else {
			shortcut_obj.shortcut_label = shortcut_obj.shortcut;
		}
		// actual shortcut string
		shortcut_obj.shortcut = shortcut_obj.shortcut.toLowerCase();
		// action is button click
		if (!shortcut_obj.action) {
			shortcut_obj.action = click;
		}
		// shortcut description can be button label
		if (!shortcut_obj.description) {
			shortcut_obj.description = label;
		}
		// page
		shortcut_obj.page = this;
		return shortcut_obj;
	},

	/*
	* Check if there already exists a button with a specified label in a specified button group
	* @param {object} parent - This should be the `ul` of the button group.
	* @param {string} selector - CSS Selector of the button to be searched for. By default, it is `li`.
	* @param {string} label - Label of the button
	*/
	is_in_group_button_dropdown: function(parent, selector, label) {

		if (!selector) selector = 'li';

		if (!label || !parent) return false;

		const result = $(parent).find(`${selector}:contains('${label}')`)
			.filter(function() {
				let item = $(this).html();
				return $(item).attr('data-label') === label;
			});
		return result.length > 0;
	},

	clear_btn_group: function(parent) {
		parent.empty();
		parent.parent().addClass("hide");
	},

	add_divider: function() {
		return $('<li class="divider"></li>').appendTo(this.menu);
	},

	get_or_add_inner_group_button: function(label) {
		var $group = this.inner_toolbar.find('.btn-group[data-label="'+encodeURIComponent(label)+'"]');
		if(!$group.length) {
			$group = $('<div class="btn-group" data-label="'+encodeURIComponent(label)+'" style="margin-left: 10px;">\
				<button type="button" class="btn btn-default dropdown-toggle btn-xs" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
				'+label+' <span class="caret"></span></button>\
				<ul role="menu" class="dropdown-menu" style="margin-top: -8px;"></ul></div>').appendTo(this.inner_toolbar);
		}
		return $group;
	},

	get_inner_group_button: function(label) {
		return this.inner_toolbar.find('.btn-group[data-label="'+encodeURIComponent(label)+'"]');
	},

	set_inner_btn_group_as_primary: function(label) {
		this.get_or_add_inner_group_button(label).find("button").removeClass("btn-default").addClass("btn-primary");
	},

	btn_disable_enable: function(btn, response) {
		if (response && response.then) {
			btn.prop('disabled', true);
			response.then(() => {
				btn.prop('disabled', false);
			})
		} else if (response && response.always) {
			btn.prop('disabled', true);
			response.always(() => {
				btn.prop('disabled', false);
			});
		}
	},

	/*
	* Add button to button group. If there exists another button with the same label,
	* `add_inner_button` will not add the new button to the button group even if the callback
	* function is different.
	*
	* @param {string} label - Label of the button to be added to the group
	* @param {object} action - function to be called when button is clicked
	* @param {string} group - Label of the group button
	*/
	add_inner_button: function(label, action, group, type="default") {
		var me = this;
		let _action = function() {
			let btn = $(this);
			let response = action();
			me.btn_disable_enable(btn, response);
		};
		if(group) {
			var $group = this.get_or_add_inner_group_button(group);
			$(this.inner_toolbar).removeClass("hide");

			if (!this.is_in_group_button_dropdown($group.find(".dropdown-menu"), 'li', label)) {
				return $('<li><a href="#" onclick="return false;" data-label="'+encodeURIComponent(label)+'">'+label+'</a></li>')
					.on('click', _action)
					.appendTo($group.find(".dropdown-menu"));
			}

		} else {
			var button = this.inner_toolbar.find('button[data-label="'+encodeURIComponent(label)+'"]');
			if( button.length == 0 ) {
				return $('<button data-label="'+encodeURIComponent(label)+`" class="btn btn-${type} btn-xs" style="margin-left: 10px;">`+__(label)+'</btn>')
					.on("click", _action)
					.appendTo(this.inner_toolbar.removeClass("hide"));
			} else {
				return button;
			}
		}
	},

	remove_inner_button: function(label, group) {
		if (typeof label === 'string') {
			label = [label];
		}
		// translate
		label = label.map(l => __(l));

		if (group) {
			var $group = this.get_inner_group_button(__(group));
			if($group.length) {
				$group.find('.dropdown-menu li a[data-label="'+encodeURIComponent(label)+'"]').remove();
			}
			if ($group.find('.dropdown-menu li a').length === 0) $group.remove();
		} else {

			this.inner_toolbar.find('button[data-label="'+encodeURIComponent(label)+'"]').remove();
		}
	},

	add_inner_message: function(message) {
		let $message = $(`<span class='inner-page-message text-muted small'>${message}</div>`);
		this.inner_toolbar.find('.inner-page-message').remove();
		this.inner_toolbar.removeClass("hide").prepend($message);

		return $message;
	},

	clear_inner_toolbar: function() {
		this.inner_toolbar.empty().addClass("hide");
	},

	//-- Sidebar --//

	add_sidebar_item: function(label, action, insert_after, prepend) {
		var parent = this.sidebar.find(".sidebar-menu.standard-actions");
		var li = $('<li>');
		var link = $('<a>').html(label).on("click", action).appendTo(li);

		if (insert_after) {
			li.insertAfter(parent.find(insert_after));
		} else {
			if(prepend) {
				li.prependTo(parent);
			} else {
				li.appendTo(parent);
			}
		}
		return link;
	},

	//---//

	clear_user_actions: function() {
		this.menu.find(".user-action").remove();
	},

	// page::title
	get_title_area: function() {
		return this.$title_area;
	},

	set_title: function(txt, icon = '', stripHtml = true, tabTitle = '') {
		if(!txt) txt = "";

		if(stripHtml) {
			txt = strip_html(txt);
		}
		this.title = txt;

		frappe.utils.set_title(tabTitle || txt);
		if(icon) {
			txt = '<span class="'+ icon +' text-muted" style="font-size: inherit;"></span> ' + txt;
		}
		this.$title_area.find(".title-text").html(txt);
	},

	set_title_sub: function(txt) {
		// strip icon
		this.$sub_title_area.html(txt).toggleClass("hide", !!!txt);
	},

	get_main_icon: function(icon) {
		return this.$title_area.find(".title-icon")
			.html('<i class="'+icon+' fa-fw"></i> ')
			.toggle(true);
	},

	add_help_button: function(txt) {
		//
	},

	add_button: function(label, click, icon, is_title) {
		//
	},

	add_dropdown_button: function(parent, label, click, icon) {
		frappe.ui.toolbar.add_dropdown_button(parent, label, click, icon);
	},

	// page::form
	add_label: function(label) {
		this.show_form();
		return $("<label class='col-md-1 page-only-label'>"+label+" </label>")
			.appendTo(this.page_form);
	},
	add_select: function(label, options) {
		var field = this.add_field({label:label, fieldtype:"Select"});
		return field.$wrapper.find("select").empty().add_options(options);
	},
	add_data: function(label) {
		var field = this.add_field({label: label, fieldtype: "Data"});
		return field.$wrapper.find("input").attr("placeholder", label);
	},
	add_date: function(label, date) {
		var field = this.add_field({label: label, fieldtype: "Date", "default": date});
		return field.$wrapper.find("input").attr("placeholder", label);
	},
	add_check: function(label) {
		return $("<div class='checkbox'><label><input type='checkbox'>" + label + "</label></div>")
			.appendTo(this.page_form)
			.find("input");
	},
	add_break: function() {
		// add further fields in the next line
		this.page_form.append('<div class="clearfix invisible-xs"></div>');
	},
	add_field: function(df) {
		this.show_form();

		if (!df.placeholder) {
			df.placeholder = df.label;
		}

		var f = frappe.ui.form.make_control({
			df: df,
			parent: this.page_form,
			only_input: df.fieldtype=="Check" ? false : true,
		})
		f.refresh();
		$(f.wrapper)
			.addClass('col-md-2')
			.attr("title", __(df.label)).tooltip();

		// html fields in toolbar are only for display
		if (df.fieldtype=='HTML') {
			return;
		}

		// hidden fields dont have $input
		if (!f.$input) f.make_input();

		f.$input.addClass("input-sm").attr("placeholder", __(df.label));

		if(df.fieldtype==="Check") {
			$(f.wrapper).find(":first-child")
				.removeClass("col-md-offset-4 col-md-8");
		}

		if(df.fieldtype=="Button") {
			$(f.wrapper).find(".page-control-label").html("&nbsp;")
			f.$input.addClass("btn-sm").css({"width": "100%", "margin-top": "-1px"});
		}

		if(df["default"])
			f.set_input(df["default"])
		this.fields_dict[df.fieldname || df.label] = f;
		return f;
	},
	clear_fields: function() {
		this.page_form.empty();
	},
	show_form: function() {
		this.page_form.removeClass("hide");
	},
	hide_form: function() {
		this.page_form.addClass("hide");
	},
	get_form_values: function() {
		var values = {};
		this.page_form.fields_dict.forEach(function(field, key) {
			values[key] = field.get_value();
		});
		return values;
	},
	add_view: function(name, html) {
		let element = html;
		if(typeof (html) === "string") {
			element = $(html);
		}
		this.views[name] = element.appendTo($(this.wrapper).find(".page-content"));
		if(!this.current_view) {
			this.current_view = this.views[name];
		} else {
			this.views[name].toggle(false);
		}
		return this.views[name];
	},
	set_view: function(name) {
		if(this.current_view_name===name)
			return;
		this.current_view && this.current_view.toggle(false);
		this.current_view = this.views[name];

		this.previous_view_name = this.current_view_name;
		this.current_view_name = name;

		this.views[name].toggle(true);

		this.wrapper.trigger('view-change');
	},
});

export default class Desktop {
	constructor({ wrapper }) {
		this.wrapper = wrapper;
		this.pages = {};
		this.sidebar_items = {};
		this.mobile_sidebar_items = {};
		this.sidebar_categories = [
			"Modules",
			"Domains",
			"Places",
			"Administration"
		];
		this.make();
	}

	make() {
		this.make_container();
		this.fetch_desktop_settings().then(() => {
			this.route();
			this.make_sidebar();
		});
	}

	route() {
		let page = this.get_page_to_show();
		this.show_page(page);
	}

	make_container() {
		this.container = $(`
			<div class="desk-container row">
				<div class="desk-sidebar"></div>
				<div class="desk-body">
					<div class="page-switcher">
						<div class="current-title"></div>
						<i class="fa fa-chevron-down text-muted"></i>
					</div>
					<div class="mobile-list">
					</div>
				</div>
			</div>`);

		this.container.appendTo(this.wrapper);
		this.sidebar = this.container.find(".desk-sidebar");
		this.body = this.container.find(".desk-body");
		this.current_title = this.container.find(".current-title");
		this.mobile_list = this.container.find(".mobile-list");
		this.page_switcher = this.container.find(".page-switcher");
	}

	fetch_desktop_settings() {
		return frappe
			.call("frappe.desk.desktop.get_desk_sidebar_items")
			.then(response => {
				if (response.message) {
					this.sidebar_configuration = response.message;
				} else {
					frappe.throw({
						title: __("Couldn't Load Desk"),
						message:
							__("Something went wrong while loading Desk. <b>Please relaod the page</b>. If the problem persists, contact the Administrator"),
						indicator: "red",
						primary_action: {
							label: __("Reload"),
							action: () => location.reload()
						}
					});
				}
			});
	}

	make_sidebar() {
		const get_sidebar_item = function(item) {
			return $(`<a href="${"desk#workspace/" + item.name}"
					class="sidebar-item 
						${item.selected ? " selected" : ""}
						${item.hidden ? "hidden" : ""}
					">
					<span>${item.label || item.name}</span>
				</div>`);
		};

		const make_sidebar_category_item = item => {
			if (item.name == this.get_page_to_show()) {
				item.selected = true;
				this.current_page = item.name;
			}
			let $item = get_sidebar_item(item);
			let $mobile_item = $item.clone();
			
			$item.appendTo(this.sidebar);
			this.sidebar_items[item.name] = $item;

			$mobile_item.appendTo(this.mobile_list);
			this.mobile_sidebar_items[item.name] = $mobile_item;
		};

		const make_category_title = name => {
			// DO NOT REMOVE: Comment to load translation
			// __("Modules") __("Domains") __("Places") __("Administration")
			let $title = $(
				`<div class="sidebar-group-title h6 uppercase">${__(name)}</div>`
			);
			$title.appendTo(this.sidebar);
			$title.clone().appendTo(this.mobile_list);
		};

		this.sidebar_categories.forEach(category => {
			if (this.sidebar_configuration.hasOwnProperty(category)) {
				make_category_title(category);
				this.sidebar_configuration[category].forEach(item => {
					make_sidebar_category_item(item);
				});
			}
		});
		if (frappe.is_mobile) {
			this.page_switcher.on('click', () => {
				this.mobile_list.toggle();
			});
		}
	}

	show_page(page) {
		if (this.current_page && this.pages[this.current_page]) {
			this.pages[this.current_page].hide();
		}

		if (this.sidebar_items && this.sidebar_items[this.current_page]) {
			this.sidebar_items[this.current_page].removeClass("selected");
			this.mobile_sidebar_items[this.current_page].removeClass("selected");
			
			this.sidebar_items[page].addClass("selected");
			this.mobile_sidebar_items[page].addClass("selected");
		}
		this.current_page = page;
		this.mobile_list.hide();
		this.current_title.empty().append(this.current_page);
		localStorage.current_desk_page = page;
		this.pages[page] ? this.pages[page].show() : this.make_page(page);
	}

	get_page_to_show() {
		const default_page = this.sidebar_configuration
			? this.sidebar_configuration["Modules"][0].name
			: frappe.boot.allowed_workspaces[0].name;

		let page =
			frappe.get_route()[1] ||
			localStorage.current_desk_page ||
			default_page;

		return page;
	}

	make_page(page) {
		const $page = new DesktopPage({
			container: this.body,
			page_name: page
		});

		this.pages[page] = $page;
		return $page;
	}
}

class DesktopPage {
	constructor({ container, page_name }) {
		frappe.desk_page = this;
		this.container = container;
		this.page_name = page_name;
		this.sections = {};
		this.allow_customization = false;
		this.reload();
	}

	show() {
		frappe.desk_page = this;
		this.page.show();
		if (this.sections.shortcuts) {
			this.sections.shortcuts.widgets_list.forEach(wid => {
				wid.set_actions();
			});
		}
	}

	hide() {
		this.page.hide();
	}

	reload() {
		this.in_customize_mode = false;
		this.page && this.page.remove();
		this.make();
		this.setup_events();
	}

	make_customization_link() {
		this.customize_link = $(`<div class="small customize-options" style="cursor: pointer;">${__('Customize Workspace')}</div>`);
		this.customize_link.appendTo(this.page);
		this.customize_link.on('click', () => {
			this.customize();
		});

		this.save_or_discard_link = $(`<div class="small customize-options small-bounce">
			<span class="save-customization">${__('Save')}</span> / <span class="discard-customization">${__('Discard')}</span>
			</div>`).hide();

		this.save_or_discard_link.appendTo(this.page);
		this.save_or_discard_link.find(".save-customization").on("click", () => this.save_customization());
		this.save_or_discard_link.find(".discard-customization").on("click", () => this.reload());
		this.page.addClass('allow-customization');
	}

	make() {
		this.page = $(`<div class="desk-page" data-page-name=${this.page_name}></div>`);
		this.page.appendTo(this.container);

		this.get_data().then(res => {
			this.data = res.message;
			if (!this.data) {
				delete localStorage.current_desk_page;
				frappe.set_route("workspace");
				return;
			}

			this.refresh();
		});
	}

	refresh() {
		this.page.empty();
		this.allow_customization = this.data.allow_customization || false;

		if (frappe.is_mobile()) {
			this.allow_customization = false;
		}

		this.allow_customization && this.make_customization_link();
		this.data.onboarding && this.data.onboarding.items.length && this.make_onboarding();
		this.make_charts().then(() => {
			this.make_shortcuts();
			this.make_cards();

			if (this.allow_customization) {
				// Move the widget group up to align with labels if customization is allowed
				$('.desk-page .widget-group:visible:first').css('margin-top', '-25px');
			}
		});
	}

	get_data() {
		return frappe.call("frappe.desk.desktop.get_desktop_page", {
			page: this.page_name
		});
	}

	setup_events() {
		$(document.body).on('toggleFullWidth', () => this.refresh());
	}

	customize() {
		if (this.in_customize_mode) {
			return;
		}

		// It may be possible the chart area is hidden since it has no widgets
		// So the margin-top: -25px would be applied to the shortcut group
		// We need to remove this as the  chart group will be visible during customization
		$('.widget.onboarding-widget-box').hide();
		$('.desk-page .widget-group:visible:first').css('margin-top', '0px');

		this.customize_link.hide();
		this.save_or_discard_link.show();

		Object.keys(this.sections).forEach(section => {
			this.sections[section].customize();
		});
		this.in_customize_mode = true;

		// Move the widget group up to align with labels if customization is allowed
		$('.desk-page .widget-group:visible:first').css('margin-top', '-25px');
	}

	save_customization() {
		const config = {};

		if (this.sections.charts) config.charts = this.sections.charts.get_widget_config();
		if (this.sections.shortcuts) config.shortcuts = this.sections.shortcuts.get_widget_config();
		if (this.sections.cards) config.cards = this.sections.cards.get_widget_config();

		frappe.call('frappe.desk.desktop.save_customization', {
			page: this.page_name,
			config: config
		}).then(res => {
			if (res.message) {
				frappe.msgprint({ message: __("Customizations Saved Successfully"), title: __("Success")});
				this.reload();
			} else {
				frappe.throw({message: __("Something went wrong while saving customizations"), title: __("Failed")});
				this.reload();
			}
		});
	}

	make_onboarding() {
		this.onboarding_widget = frappe.widget.make_widget({
			label: this.data.onboarding.label || __(`Let's Get Started`),
			subtitle: this.data.onboarding.subtitle,
			steps: this.data.onboarding.items,
			success: this.data.onboarding.success,
			docs_url: this.data.onboarding.docs_url,
			widget_type: 'onboarding',
			container: this.page,
			options: {
				allow_sorting: false,
				allow_create: false,
				allow_delete: false,
				allow_hiding: false,
				allow_edit: false,
				max_widget_count: 2,
			}
		});
	}

	make_charts() {
		return frappe.dashboard_utils.get_dashboard_settings().then(settings => {
			let chart_config = settings.chart_config ? JSON.parse(settings.chart_config): {};
			if (this.data.charts.items) {
				this.data.charts.items.map(chart => {
					chart.chart_settings = chart_config[chart.chart_name] || {};
				});
			}

			this.sections["charts"] = new frappe.widget.WidgetGroup({
				title: this.data.charts.label || __('{} Dashboard', [__(this.page_name)]),
				container: this.page,
				type: "chart",
				columns: 1,
				hidden: Boolean(this.onboarding_widget),
				options: {
					allow_sorting: this.allow_customization,
					allow_create: this.allow_customization,
					allow_delete: this.allow_customization,
					allow_hiding: false,
					allow_edit: true,
					max_widget_count: 2,
				},
				widgets: this.data.charts.items
			});
		});
	}

	make_shortcuts() {
		this.sections["shortcuts"] = new frappe.widget.WidgetGroup({
			title: this.data.shortcuts.label || __('Your Shortcuts'),
			container: this.page,
			type: "shortcut",
			columns: 3,
			options: {
				allow_sorting: this.allow_customization,
				allow_create: this.allow_customization,
				allow_delete: this.allow_customization,
				allow_hiding: false,
				allow_edit: true,
			},
			widgets: this.data.shortcuts.items
		});
	}

	make_cards() {
		let cards = new frappe.widget.WidgetGroup({
			title: this.data.cards.label || __(`Reports & Masters`),
			container: this.page,
			type: "links",
			columns: 3,
			options: {
				allow_sorting: this.allow_customization,
				allow_create: false,
				allow_delete: false,
				allow_hiding: this.allow_customization,
				allow_edit: false,
			},
			widgets: this.data.cards.items
		});

		this.sections["cards"] = cards;

		const legend = [
			{
				color: "blue",
				description: __("Important")
			},
			{
				color: "orange",
				description: __("No Records Created")
			}
		].map(item => {
			return `<div class="legend-item small text-muted justify-flex-start">
				<span class="indicator ${item.color}"></span>
				<span class="link-content ellipsis" draggable="false">${item.description}</span>
			</div>`;
		});

		$(`<div class="legend">
			${legend.join("\n")}
		</div>`).insertAfter(cards.body);
	}
}

