import { Component, css, html, unsafeHTML } from '../../elements/index.js';
import { NavigationContext, Router } from 'ocwp-core';

/**
 * A routing + module loading component that is capable of supporting
 * cached views, see **{@link Router}** for more info.
 *
 * ```js 
 * import 'platform/components/navigation/AppRouter'; 
 * ```
 * 
 * ```html
 * <capitec-app-router></capitec-app-router>
 * ```
 * 
 */
export class AppRouter extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Initialises the component.
	 *
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Connect to the platform router and navigation context.
		this.router = Router.getInstance();
		this.navigationContext = NavigationContext.getInstance();

		// Listen for platform router navigation events.
		this.router.onNavigate = (context) => this._navigationChanged(context);

		this._onPopstate = this._onPopstate.bind(this);

		// Listen for direct browser URI navigation events.
		window.addEventListener(`popstate`, this._onPopstate);
		window.addEventListener(`platform-navigation-replace`, (e) => this._updateNavigation(e, true));
		window.addEventListener(`platform-navigation-update`, (e) => this._updateNavigation(e, false));

		// Initialise navigation context & state cache.
		this._cache = {};
		this._context = null;

		window.dispatchEvent(new CustomEvent(`platform-approuter-load`, {
			detail: {},
			bubbles: true,
			composed: true
		}));
	}

	// ----------
	// PROPERTIES
	// ----------

	// n/a

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	disconnectedCallback() {
		window.removeEventListener(`popstate`, this._onPopstate);
		super.disconnectedCallback();
	}

	/**
	 * @ignore
	 * @returns {void}
	 */
	updated() {

		// Start initial navigation to path provided by user.
		if (!this.router.currentRoute) {
			this.router.navigateByPath(`${document.location.pathname}${document.location.search}`);
		}

		if (!this._context) {
			return;
		}

		this._updateWindowTitle();

		// Attempt to access the element for the current route to call its navigatedCallback().
		let element = null;

		if (this.navigationContext.previous && this.navigationContext.previous.route.name === this.navigationContext.current.route.name) {
			element = this.shadowRoot.querySelector(this.navigationContext.current.route.name);
		} else if (this._cache[this._context.route.name]) {
			element = this._cache[this._context.route.name];
		}

		if (element && element.navigatedCallback) {
			element.navigatedCallback();
		}

		// Finally call the resolver created within _navigationChanged(...).
		// window.requestAnimationFrame(() => this.navigatedResolve());
		setTimeout(() => this.navigatedResolve(), 2);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_updateNavigation(e, isReplace) {

		if (!this._context || !e.detail) {
			return;
		}

		this._context = e.detail;

		// Rebuild URL from context.
		const url = `${this._context.path}${this._context.query ? this._context.query : ``}`;

		// Attempt to update browser's history (URL in address bar)
		if (isReplace) {
			history.replaceState({
				url: url
			}, this._context.route.name, url);
		} else {
			history.pushState({
				url: url
			}, this._context.route.name, url);
		}
	}

	/**
	 * Performs navigation via the router or updates the browser's navigation state.
	 *
	 * @param {PopStateEvent} event Event arg
	 * 
	 * @returns {void}
	 */
	_onPopstate(event) {
		if (event.state && event.state.url) {
			this.router.navigateByPath(event.state.url.replace(window.origin, ``));
		} else {
			this._updateWindowTitle();
		}
	}

	/**
	 * Navigate to the view as specified in the given navigation context.
	 * 
	 * @param {NavigationContext} context - The router navigation context.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_navigationChanged(context) {

		// Set property to force render of route being navigated to.
		this._context = context;

		// External resolver for Promise below.
		this.navigatedResolve = null;

		this.dispatchEvent(new CustomEvent(`platform-navigation-change`, {
			detail: JSON.parse(JSON.stringify(context)),
			bubbles: true,
			composed: true
		}));
		// Re-render the router display.
		this.requestUpdate();

		// Return a promise that cannot resolve itself, it is resolved in updated() callback below.
		return new Promise((resolve, reject) => {
			this.navigatedResolve = resolve;
		});
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateWindowTitle() {

		if (!this._context) {
			return;
		}

		// Rebuild URL from context.
		const url = `${window.location.origin}${this._context.path}${this._context.query ? this._context.query : ``}`;

		// Attempt to update browser's history (URL in address bar)
		if (!history.state || (history.state && history.state.url !== url)) {
			history.pushState({
				url: url
			}, this._context.route.name, url);
		}
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 * 
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				:host {
					width: 100%;
					height: 100%;
				}

				:host > * {
					width: 100%;
					height: 100%;
				}

				:host > *[hidden] {
					display: none;
				}
			`
		];
	}

	render() {

		if (!this._context) {
			return html``;
		}

		// Attempt to load (import) the current routing component, browser will ignore it if previously imported.
		this._context.route.load();

		// Attempt to cache the current element if setup in its config.
		if (this.shadowRoot.childNodes &&
			this.shadowRoot.childNodes.length > 0 &&
			this.navigationContext.current &&
			this.navigationContext.current.route.cache) {

			// Remove the element instance from the DOM and cache it.
			const elementToCache = this.shadowRoot.querySelector(this.navigationContext.current.route.module || this.navigationContext.current.route.name);
			this._cache[this.navigationContext.current.route.module || this.navigationContext.current.route.name] = elementToCache;
		}

		// Update navigation for downstream consumers.
		this.navigationContext.update(this._context);

		// Attempt to add cached element instance into DOM and avoid rendering anything else.
		if (this._cache[this._context.route.module || this._context.route.name]) {
			return html`${this._cache[this._context.route.module || this._context.route.name]}`;
		}

		if (this._context.route.customRender) {
			return this._context.route.customRender();
		}

		// Dynamically render element.
		return html`${unsafeHTML(`<${this._context.route.module || this._context.route.name}></${this._context.route.module || this._context.route.name}>`)}`;
	}
}

window.customElements.define(`capitec-app-router`, AppRouter);

/**
 * When navigation to a path occurs.
 *
 * @example
 * window.attachEventListener(`platform-navigation-change`, () => { ... })
 *
 * @event AppRouter#platform-navigation-change
 * @type {Object}
 * @property {NavigationContext} detail Navigation context info.
 */