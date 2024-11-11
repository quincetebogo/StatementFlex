import { Component, css, html } from '../../elements/index.js';
import { Configuration, ExecutionContext, Logger, Platform, SecurityContext } from 'ocwp-core';
import queryString from 'query-string';
import { v4 } from 'uuid';

/**
 * Component that hosts a widget.
 * 
 * ```js
 * import 'platform/components/core/WidgetWrapper'
 * ```
 * 
 * ```html
 * <capitec-widget></capitec-widget>
 * ```
 */
export class WidgetWrapper extends Component {

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

		// Set the default property values.
		this.src = ``;

		// Create unique identifier for widget with which to track widget specific events/messages		
		this.identifier = v4();
		this.widget = null;

		// Listen for messages on the application window. Used for communication with the child widget.
		window.addEventListener(`message`, (event) => {

			// Check if received message is a widget message from this wrapper's hosted widget
			if ((typeof event.data === `object`) && event.data.bridgeEvent && event.data.identifier === this.identifier && event.data.fromApplication !== true) {

				this._widgetMessageReceived(event);
			}
		});

		// For keyboard orchestration, certain events originate from shell and need to be passed on to the widget
		window.addEventListener(`platform-keyboard-close`, (e) => {
			if (this.identifier === e.detail.widgetId) {
				this.messageWidget(`platform-keyboard-close`, e.detail.shouldRefocus);
			}
		});
		window.addEventListener(`platform-keyboard-defer-focus`, (e) => {
			if (e.detail === this.identifier) {
				this.messageWidget(`platform-keyboard-defer-focus`, e.detail);
			}
		});
		window.addEventListener(`platform-keyboard-keypress`, (e) => {
			if (e.detail.widgetId === this.identifier) {
				this.messageWidget(`platform-keyboard-keypress`, e.detail.keyPressInfo);
			}
		});
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} src - The URI path to the widget.
	 */
	static get properties() {

		return {
			id: { type: String },
			src: { type: String }
		};
	}

	get config() {
		return Configuration.getInstance().config;
	}

	get security() {
		return SecurityContext.getInstance();
	}

	get executionContext() {
		return ExecutionContext.getInstance();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	async _loaded(e) {
		this.widget = e.srcElement;

		// Setup initial path for widget based on application query string
		let pathAndQuery = `/`;
		if (window.location.search && this.id) {
			const currentQuery = queryString.parse(window.location.search);
			const queryId = `platform-${this.id}`;
			if (Object.prototype.hasOwnProperty.call(currentQuery, queryId)) {
				pathAndQuery = currentQuery[queryId];
			}
		}

		// Populate and send bridge context with application and security information for widget to consume
		const bridgeContext = {
			type: this.config.platform.type,
			identifier: this.identifier,
			security: {
				fullName: this.security.fullName,
				userName: this.security.username,
				email: this.security.email
			},
			platformVersion: await this.executionContext.platformVersion,
			appName: await this.executionContext.applicationName,
			pathAndQuery: pathAndQuery
		};
		this.messageWidget(`platform-bridge-context`, bridgeContext);
	}

	_widgetMessageReceived(event) {

		if (event.data.bridgeEvent.startsWith(`platform-`)) {
			if (event.data.bridgeEvent === `platform-widget-manifest`) {
				this._setWidgetManifest(event);
			}

			if (event.data.bridgeEvent === `platform-widget-navigated-${this.identifier}`) {
				// Only update route with widget sub-route if this component has an id with which to track the widget
				if (this.id) {
					this._updateNavigation(event);
				}
			}

			if (event.data.bridgeEvent === `platform-show-toast-message`) {
				const toast = event.data.detail;

				if (toast.body) {
					console.warn(`Toasts created from Widgets do not support custom body template`);
				}

				if (window.showToast && toast.widgetId === this.identifier) {
					const tempToast = window.showToast(toast.type, toast.location, toast.title, toast.message, toast.closable, () => {
						this.messageWidget(`platform-toast-closed`, toast);
					}, toast.layout);
					tempToast.widgetId = toast.widgetId;
				}
			}

			if (event.data.bridgeEvent === `platform-hide-toast-message`) {
				const tempToast = event.data.detail;

				if (window.hideToast &&
					event.data.detail.widgetId === this.identifier &&
					window.toastController &&
					event.data.detail.widgetId === tempToast.widgetId) {
					window.hideToast(tempToast);
				}
			}

			if (event.data.bridgeEvent === `platform-permission-request`) {
				this._handlePermissionRequest(event.data);
				return;
			}
		} else {
			// Not a platform event, ensure only events in manifest are allowed
			if (!this.widgetManifest || !this.widgetManifest.events || this.widgetManifest.events.length === 0) {
				console.warn(`Message '${event.data.bridgeEvent}' received from widget, but manifest or events in manifest are not available to validate. Ignoring event.`);
				return;
			}

			if (this.widgetManifest.events.filter(e => e.eventName === event.data.bridgeEvent).length === 0) {
				console.warn(`Message '${event.data.bridgeEvent}' received from widget, but not specified in manifest events. Ignoring event.`);
				return;
			}
		}

		// Build up platform widget event
		this._sendWidgetEvent(event);
	}

	async _handlePermissionRequest(data) {
		const matchedPermissions = this.config.runtime.permissions.filter(x => data.detail.name === x.name);
		if (matchedPermissions.length === 0) {
			this.messageWidget(data.callbackId, {
				declineMessage: `Permission '${data.detail.name}' not supported,`
			});
		} else {
			const permission = matchedPermissions[0];
			const authorization = await this._authorizePermission(permission);
			if (!authorization.approved) {
				this.messageWidget(data.callbackId, authorization);
			} else {

				// Build up platform widget event
				const evt = {
					detail: {
						content: data.detail.detail
					},
					bubbles: true,
					composed: true
				};
				if (permission.responseType && permission.responseType !== `void`) {
					evt.detail.callback = (detail) => {
						authorization.detail = detail;
						this.messageWidget(data.callbackId, authorization);
					};
				} else {
					this.messageWidget(data.callbackId, authorization);
				}
				this.dispatchEvent(new CustomEvent(data.detail.name, evt));
			}
		}

	}

	_authorizePermission(permission) {
		return new Promise((resolve, reject) => {
			try {
				if (permission.grantLevel === `app` && window.sessionStorage.getItem(permission.name)) {
					resolve({
						approved: true
					});
				} else {
					if (!window.requestAppPermission) {
						resolve({
							declineMessage: `Unable to request application permissions`
						});
						return;
					}

					window.requestAppPermission(permission, () => {
						if (permission.grantLevel === `app`) {
							window.sessionStorage.setItem(permission.name, `grant`);
						}
						resolve({
							approved: true
						});
					}, (reason) => {
						resolve({
							declineMessage: reason
						});
					});
				}
			} catch (error) {
				resolve({
					declineMessage: error.message
				});
			}
		});
	}

	_sendWidgetEvent(event) {
		const evt = {
			detail: {
				content: event.data.detail
			},
			bubbles: true,
			composed: true
		};
		// Check whether a temporary callback event has been provided, and if so, setup function to return the callback response.
		if (event.data.callbackId) {
			evt.detail.callback = (detail) => {
				this.messageWidget(event.data.callbackId, detail);
			};
		}
		this.dispatchEvent(new CustomEvent(event.data.bridgeEvent, evt));
	}

	_updateNavigation(event) {

		// Only update navigation if widget has a specific id
		if (!this.id) {
			return;
		}

		const query = `${event.data.detail.path}${event.data.detail.query || ``}`;
		const queryEncoded = encodeURIComponent(query);
		const queryId = `platform-${this.id}`;

		let noChange = false;
		let newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
		let newQuery = `${queryId}=${queryEncoded}`;

		if (window.location.search) {

			// Current window has an existing query, the query must be updated. not replaced
			const currentQuery = queryString.parse(window.location.search);

			if (Object.prototype.hasOwnProperty.call(currentQuery, queryId)) {
				if (currentQuery[queryId] !== queryEncoded && currentQuery[queryId] !== query) {

					// Widget query id already exists and must be updated
					currentQuery[queryId] = query;
					newQuery = ``;
					for (const queryParam in currentQuery) {
						if (Object.prototype.hasOwnProperty.call(currentQuery, queryParam)) {
							newQuery += `&${queryParam}=${encodeURIComponent(currentQuery[queryParam])}`;
						}
					}
					newQuery = newQuery.substring(1);
					newUrl += `?${newQuery}`;
				} else {

					// Widget query id already exists but remains unchanged
					noChange = true;
				}
			} else {

				// Widget query id does not already exist, append to the existing query
				newUrl += `${window.location.search}&${newQuery}`;
			}
		} else {

			// Current window has no existing query, setup the new query
			newUrl += `?${newQuery}`;
		}

		// Update the window.history.state if there was any change to the previous state
		if (noChange === false) {
			window.history.pushState({ ur: newUrl }, document.title, newUrl);
		}
	}

	_setWidgetManifest(event) {
		this.widgetManifest = event.data.detail;
		this.requestUpdate();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	messageWidget(eventName, detail) {

		const frameWindow = this.widget.contentWindow;
		const platformEvent = {
			bridgeEvent: eventName,
			detail: detail,
			fromApplication: true
		};
		frameWindow.postMessage(platformEvent, `*`);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

	static get styles() {

		return [
			super.styles,

			/* ---------- LAYOUT POLICY ---------- */
			css`
				.body {
					border: none;
				}

				:host {
					position: relative;
				}

				.overlay {
					position: absolute;
					top: 0;
					left: 0;
					bottom: 0;
					right: 0;
					
					z-index: var(--theme-widget-wrapper-overlay-z-index, 1100);

					display: flex;
					justify-content: center;
					align-items: center;

					background-color: rgba(244, 244, 244, 0.3);
				}
			`
		];
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this.widgetManifest ? `` : html`<div class="overlay"><img src="platform/icons/loader.svg"></div>`}
			<iframe class="body" id="${this.id}" src="${this.src}"
				style="visibility: ${this.widgetManifest ? `visible` : `hidden`};height: 100%;width: 100%"
				@load="${this._loaded}"></iframe>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}
}

window.customElements.define(`capitec-widget`, WidgetWrapper);