import { Component, css, html } from '../../elements/index.js';

import { TemplateResult } from 'lit';

/**
 * Component that orchestrates the show and hide of {@link Toast} components.
 * 
 * ```js
 * import 'platform/components/popups/ToastController';
 * ```
 * 
 * ```html
 * <capitec-toast-controller></capitec-toast-controller>
 * ```
 * @param {"info"|"success"|"warning"|"error"|String} type Toast type.
 * @param {"top"|"bottom"|String} location Toast location.
 */
export class ToastController extends Component {

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

		this.toastsTop = [];
		this.toastsBottom = [];
		this.allowMutiple = this.config.platform.design && this.config.platform.design.toast ? this.config.platform.design.toast.multiple : false;
		window.toastController = this;
		window.showToast = this.showToastMessage;
		window.showToastTimed = this.showToastMessageTimed;
		window.hideToast = this.hideToastMessage;
	}

	// ----------
	// PROPERTIES
	// ----------

	// n/a

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a	

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Schedules a toast message to show.
	 * 
	 * @param {String} type Toast type:
	 * - `info` Best suited for informational purposes.
	 * - `success` Best suited for successful outcomes.
	 * - `warning` Best suited for warning outcomes.
	 * - `error` Best suited for error outcomes.
	 * @param {String} location Toast location:
	 * - `top` Top of screen.
	 * - `bottom` Bottom of screen.
	 * - `top left` Top left of screen.
	 * - `top right` Top right of screen.
	 * - `bottom left` Bottom left of screen.
	 * - `bottom right` Bottom right of screen.
	 * @param {String} title Title to display on toast
	 * @param {String} message Message to display in toast
	 * @param {Boolean} closable Whether the toast can be closed by clicking close button
	 * @param {Function} closeCallback To be called when toast is closed
	 * @param {horizontal|vertical|String} layout HTML message content orientation
	 * @param {TemplateResult} body override for title and message
	 * @returns {Object} Shows toast message and return the toast message object
	 */
	showToastMessage(type, location, title, message, closable, closeCallback, layout, body) {
		const toast = {
			type: type,
			location: window.toastController._parseLocation(location),
			title: title,
			message: message,
			closable: closable,
			closeCallback: closeCallback,
			visible: true,
			layout: layout,
			body: body
		};

		if (!window.toastController.allowMutiple) {
			if (location.includes(`bottom`)) {
				window.toastController.toastsBottom[0] = toast;
			} else {
				window.toastController.toastsTop[0] = toast;
			}
		} else if (location.includes(`bottom`)) {
			window.toastController.toastsBottom.unshift(toast);
		} else {
			window.toastController.toastsTop.push(toast);
		}
		window.toastController.requestUpdate();
		return toast;
	}

	/**
	 * Schedules a toast message to show with timeout support.
	 * 
	 * @param {String} type Toast type:
	 * - `info` Best suited for informational purposes.
	 * - `success` Best suited for successful outcomes.
	 * - `warning` Best suited for warning outcomes.
	 * - `error` Best suited for error outcomes.
	 * @param {String} location Toast location:
	 * - `top` Top of screen.
	 * - `bottom` Bottom of screen.
	 * - `top left` Top left of screen.
	 * - `top right` Top right of screen.
	 * - `bottom left` Bottom left of screen.
	 * - `bottom right` Bottom right of screen.
	 * @param {String} title Title to display on toast
	 * @param {String} message Message to display in toast
	 * @param {Number} duration Duration to display in milliseconds
	 * @param {Boolean} closable Whether the toast can be closed by clicking close button
	 * @param {Function} closeCallback To be called when toast is closed
	 * @param {horizontal|vertical|String} layout HTML message content orientation
	 * @param {TemplateResult} body override for title and message
	 * @returns {Object} Shows toast message and return the toast message object
	 */
	showToastMessageTimed(type, location, title, message, duration, closable, closeCallback, layout, body) {
		const tempToast = window.toastController.showToastMessage(type, location, title, message, closable, closeCallback, layout, body);

		setTimeout(() => {
			if (tempToast && tempToast.visible) {
				window.toastController.hideToastMessage(tempToast);
			}
		}, duration);
		window.toastController.requestUpdate();
		return tempToast;
	}

	/**
	 * Schedules a toast message to hide.
	 * @param {Toast} toast - Toast object to hide
	 * @returns {void}
	 */
	hideToastMessage(toast) {
		if (toast) {
			toast.visible = false;
			if (toast.location.includes(`bottom`)) {
				const index = window.toastController.toastsBottom.findIndex((_toast) => _toast === toast ||
					(_toast.type === toast.type &&
						_toast.location === toast.location &&
						_toast.title === toast.title &&
						_toast.message === toast.message &&
						_toast.widgetId === toast.widgetId));
				if (index !== -1) {
					setTimeout(() => {
						window.toastController.toastsBottom.splice(index, 1);
						window.toastController.requestUpdate();
					}, 250);
				}
			} else {

				const index = window.toastController.toastsTop.findIndex((_toast) => _toast === toast ||
					(_toast.type === toast.type &&
						_toast.location === toast.location &&
						_toast.title === toast.title &&
						_toast.message === toast.message &&
						_toast.widgetId === toast.widgetId));
				if (index !== -1) {
					setTimeout(() => {
						window.toastController.toastsTop.splice(index, 1);
						window.toastController.requestUpdate();
					}, 250);
				}
			}
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * For mobile we can't show toasts on the left or right we se need to remove it from the location
	 * 
	 * @param  {String} location - Incoming toast location
	 * @returns {String} - The location the toast is shown
	 */
	_parseLocation(location) {

		if (window.isMobile) {
			if (location.includes(`top`)) {
				return `top`;
			} else if (location.includes(`bottom`)) {
				return `bottom`;
			}
		}
		return location;
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the controller stylesheet.
	 * 
	 * @ignore
	 * @returns {css} The css content of the controller.
	 */
	static get styles() {

		return css`
			:host {
				--theme-toast-controller-margin-left: 8px;
				--theme-toast-controller-margin-right: 8px;

				--theme-toast-width: var(--theme-toast-container-width, 400px);
				width: 100%;
				height: 100%;
				display: flex;
				flex: 1;
				flex-direction: column;

				overflow: hidden;
			}

			.toast-container {
				width: 100%;
				height: 100%;
				padding-top: var(--theme-toast-controller-margin-top, calc(var(--theme-pageheader-min-height) + 8px));
				padding-right: var(--theme-toast-controller-margin-right);
				padding-bottom: var(--theme-toast-controller-margin-bottom, 8px);
				padding-left: var(--theme-toast-controller-margin-left);
			}

			.toast-container.mobile {
				--theme-toast-width: calc(var(--theme-toast-container-width, 390px) - var(--theme-toast-controller-margin-left) - var(--theme-toast-controller-margin-right));
			}
		`;
	}

	_renderToast(toast) {
		if (toast && toast.visible) {
			return html`
				<capitec-toast type="${toast.type}" header="${toast.title}" detail="${toast.message}" layout="${toast.layout}"
					?closable=${toast.closable} @click-close=${(e) => {
					this.hideToastMessage(toast);

					if (typeof toast.closeCallback === `function`) {
						toast.closeCallback();
					}
				}
				}>
					${toast.body}
				</capitec-toast>
			`;
		}

		return null;
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return html`
			<capitec-group class="toast-container mobile" layout="grid" columns="uniform">
				<capitec-group layout="vertical" halign="center" valign="top" row="1" column="1">
					${this.toastsTop.filter((toast) => toast.location === `top`).map((toast) => this._renderToast(toast))}
				</capitec-group>
			
				<capitec-group layout="vertical" halign="center" valign="bottom" row="2" column="1">
					${this.toastsBottom.filter((toast) => toast.location === `bottom`).map((toast) => this._renderToast(toast))}
				</capitec-group>
			</capitec-group>
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			<capitec-group class="toast-container" layout="grid" columns="uniform">
				<capitec-group layout="vertical" halign="left" valign="top" row="1" column="1">
					${this.toastsTop.filter((toast) => toast.location === `top left`).map((toast) => this._renderToast(toast))}
				</capitec-group>
			
				<capitec-group layout="vertical" halign="center" valign="top" row="1" column="2">
					${this.toastsTop.filter((toast) => toast.location === `top`).map((toast) => this._renderToast(toast))}
				</capitec-group>
			
				<capitec-group layout="vertical" halign="right" valign="top" row="1" column="3">
					${this.toastsTop.filter((toast) => toast.location === `top right`).map((toast) => this._renderToast(toast))}
				</capitec-group>
			
				<capitec-group layout="vertical" halign="left" valign="bottom" row="2" column="1">
					${this.toastsBottom.filter((toast) => toast.location === `bottom left`).map((toast) => this._renderToast(toast))}
				</capitec-group>
			
				<capitec-group layout="vertical" halign="center" valign="bottom" row="2" column="2">
					${this.toastsBottom.filter((toast) => toast.location === `bottom`).map((toast) => this._renderToast(toast))}
				</capitec-group>
			
				<capitec-group layout="vertical" halign="right" valign="bottom" row="2" column="3">
					${this.toastsBottom.filter((toast) => toast.location === `bottom right`).map((toast) => this._renderToast(toast))}
				</capitec-group>
			</capitec-group>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}
}

window.customElements.define(`capitec-toast-controller`, ToastController);