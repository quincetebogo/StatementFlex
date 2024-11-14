import { Configuration, Router } from 'ocwp-core';
import { Element, css, html } from './index.js';
import { v4 } from 'uuid';

/**
 * Base class for all platform widgets.
 */
export class Widget extends Element {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();
		this.router = Router.getInstance();

		// Listen for messages on the widget window. Used for communication with the parent application
		window.addEventListener(`message`, (event) => {

			// Check if received message is a parent application message
			if ((typeof event.data === `object`) && event.data.bridgeEvent && event.data.fromApplication === true) {

				if (event.data.bridgeEvent === `platform-bridge-context`) {
					this._bridgeContextReceived(event);
				}

				this.dispatchEvent(new CustomEvent(event.data.bridgeEvent, {
					detail: event.data.detail,
					bubbles: true,
					composed: true
				}));
			}

		});

		// Listen for events from router to update parent navigation with widget route
		window.addEventListener(`platform-navigation-change`, (event) => {
			this.messageApplication(`platform-widget-navigated-${this.parentContext.identifier}`, event.detail);
		});

		// Listen for configuration load in order to notify parent application of widget manifest
		window.addEventListener(`platform-configuration-load`, (cfgEvent) => {
			if (this.config.widgetManifest && this.parentContext) {
				this.messageApplication(`platform-widget-manifest`, this.config.widgetManifest);
			}
		});

		// Listen for app router load in order to navigate to path specified by parent	
		window.addEventListener(`platform-approuter-load`, (routeEvent) => {
			if (this.parentContext) {
				this.router.navigateByPath(this.parentContext.pathAndQuery);
			}
		});

		// Listen for toast close in order to invoke the callback if available
		window.addEventListener(`platform-toast-closed`, (closeEvent) => {
			const tempToast = window.toastController?.toasts[closeEvent?.detail?.uiId];

			if (tempToast) {
				tempToast.visible = false;
				if (tempToast.closeCallback && tempToast.closeCallback instanceof Function) {
					tempToast.closeCallback();
				}
				delete window.toastController.toast;
			}
		});

		// For keyboard orchestration
		this.addEventListener(`keyboard-input-focus`, this._shellKeyboardInputFocus.bind(this));
		this.addEventListener(`keyboard-request-close`, this._requestKeyboardClose.bind(this));
		this.addEventListener(`platform-keyboard-close`, (e) => this._keyboardClose(e.detail));
		this.addEventListener(`platform-keyboard-defer-focus`, this._deferFocus.bind(this));
		this.addEventListener(`platform-keyboard-keypress`, (e) => this._shellKeyboardPress(e));

		this.currentInput = null;

		// Used to store reference to one or more toasts
		this.toasts = {};

		window.messageApplication = this.messageApplication.bind(this);
		window.messageApplicationAsync = this.messageApplicationAsync.bind(this);
		window.messageApplicationWithPermission = this.messageApplicationWithPermission.bind(this);
		window.toastController = this;
		window.showToast = this.showToastMessage.bind(this);
		window.showToastTimed = this.showToastMessageTimed.bind(this);
		window.hideToast = this.hideToastMessage.bind(this);
	}

	// ----------
	// PROPERTIES
	// ----------

	get config() {
		return Configuration.getInstance().config;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	_bridgeContextReceived(event) {

		this.parentContext = event.data.detail;

		// Wait for the configuration to finish loading before setting up the widget.
		Configuration.getInstance().init().then(() => {

			// Ensure the widget renders in the same mode as the parent shell.
			Configuration.getInstance().changeRenderingMode(this.parentContext.type, false);

			// Navigate to path specified by parent
			if (this.router && this.router.onNavigate) {
				this.router.navigateByPath(this.parentContext.pathAndQuery);
			}

			// Notify parent application of widget manifest
			this.messageApplication(`platform-widget-manifest`, this.config.widgetManifest);

			// Re-render the widget.
			this.requestUpdate();
		});
	}

	_shellKeyboardInputFocus(e) {
		if (this.currentInput && this.currentInput.getElement() !== e.detail.getElement()) {
			this.currentInput.valueChangedCallback();
		}

		this.currentInput = e.detail;
		this.currentInput.widgetId = this.parentContext.identifier;
		this.currentInput.lastValue = this.currentInput.getCurrentValue();

		this.messageApplication(`platform-open-keyboard`, this.currentInput ? JSON.parse(JSON.stringify(this.currentInput)) : {});
	}

	_keyboardClose(shouldRefocus) {

		if (this.currentInput) {
			this.currentInput.valueChangedCallback();
			this.currentInput.defocusCallback();

			const prevInput = this.currentInput;
			this.currentInput = null;
			if (shouldRefocus === true) {
				this._focusNext(prevInput);
			}
		}
	}

	_deferFocus() {
		if (this.currentInput) {
			this.currentInput.focusCallback();
		}
	}

	_requestKeyboardClose(shouldRefocus) {
		this.messageApplication(`platform-close-keyboard`, shouldRefocus);
	}

	/**
	 * Called when any key is pressed on the on-screen keyboard.
	 *
	 * @ignore
	 * @param {KeyboardEvent} event Keyboard Event object.
	 * @returns {void}
	 */
	_shellKeyboardPress(event) {

		/* 
		// Example event detail
			detail: {
				keyboardMode: this.keyboardMode,
				valueChangedCallback: () => this.valueChanged(),
				returnMode: `change-value`, // As opposed to `multi-line`
				updateValueCallback: (e) => this.updateValue(e),
				getCurrentValue: () => this.currentInputValue,
				focusCallback: () => this.focus(),
				defocusCallback: () => this.defocus(),
				getSelection: () => this.currentSelection,
				setSelection: (selection) => this.currentSelection = selection,
				getElement: () => this
			}
		*/
		if (!this.currentInput) {
			return;
		}

		// Find the start and end of the current selection in order to determine which character position(s) of the value should be modified
		const selection = this.currentInput.getSelection();

		if (event.detail && this.currentInput) {

			if (event.detail.value === `return`) {
				// Enter/return key pressed
				if (this.currentInput.returnMode === `change-value`) {
					// If returnMode is `change-value`, the keyboard will close when enter is pressed
					this._requestKeyboardClose(true);
					this.requestUpdate();
					return;
				} else if (this.currentInput.returnMode === `multi-line`) {
					// If returnMode is `multi-line`, the keyboard insert a new line into the value when enter is pressed 
					event.detail.value = `\r\n`;
				}
			} else if (event.detail.value === `backspace`) {
				// Backspace key pressed
				const old = this.currentInput.getCurrentValue();

				if (selection.start === 0) {
					// Nothing to backspace
					return;
				}

				let newVal = old;
				if (selection.start === selection.end) {
					// Single caret position (no selection), so we only remove the character before the current position
					newVal = `${old.substring(0, selection.start - 1)}${old.substring(selection.start)}`;
				} else {
					// There is a selection of one or more characters, so we remove only the selected characters
					newVal = `${old.substring(0, selection.start)}${old.substring(selection.end)}`;
				}

				// Notify the input that its value is updated via a keyboard press (keyInput: true), which will then raise its key-input event
				this.currentInput.updateValueCallback({
					inputType: `deleteContentBackward`,
					newValue: newVal,
					oldValue: old,
					keyInput: true
				});

				this.currentInput.lastValue = this.currentInput.getCurrentValue();
				this.messageApplication(`platform-keyboard-input-value`, JSON.parse(JSON.stringify(this.currentInput)));
				// Set the caret position to its position relative to the new changes
				this.currentInput.setSelection({
					start: selection.start === selection.end ? selection.start - 1 : selection.start,
					end: selection.start === selection.end ? selection.start - 1 : selection.start
				});
				return;
			} else if (event.detail.value === `clear`) {
				// Clear button pressed 
				const old = this.currentInput.getCurrentValue();

				// Reset the whole value to be empty
				const newVal = ``;

				// Notify the input that its value is updated ('Clear' does not count as key input, hence keyInput: false), and invokes the input's valueChangedCallback to raise the necessary events
				this.currentInput.updateValueCallback({
					inputType: `clearText`,
					newValue: newVal,
					oldValue: old,
					keyInput: false
				});
				this.currentInput.valueChangedCallback();

				this.currentInput.lastValue = this.currentInput.getCurrentValue();
				this.messageApplication(`platform-keyboard-input-value`, JSON.parse(JSON.stringify(this.currentInput)));
				return;
			}

			// Character/Number key pressed
			const old = this.currentInput.getCurrentValue();

			let newVal = old;
			if (selection.start === selection.end) {
				// Single caret position (no selection), so we just insert the new value at that position in the existing value
				newVal = `${old.substring(0, selection.start)}${event.detail.value}${old.substring(selection.start)}`;
			} else {
				// There is a selection of one or more characters, so we replace the selected characters with the new value
				newVal = `${old.substring(0, selection.start)}${event.detail.value}${old.substring(selection.end)}`;
			}

			// Notify the input that its value is updated via a keyboard press (keyInput: true), which will then raise its key-input event
			this.currentInput.updateValueCallback({
				inputType: `insertText`,
				newValue: newVal,
				oldValue: old,
				keyInput: true
			});

			this.currentInput.lastValue = this.currentInput.getCurrentValue();
			this.messageApplication(`platform-keyboard-input-value`, JSON.parse(JSON.stringify(this.currentInput)));
			// Set the caret position to its position relative to the new changes
			this.currentInput.setSelection({
				start: selection.start + 1,
				end: selection.start + 1
			});
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Message application consuming widget to raise specified event and if callback is provided,
	 * invokes callback with a response if received within given timeout,
	 * otherwise invokes timeoutCallback.
	 * 
	 * @param {String} eventName Name of Event to send to application.
	 * @param {Object} detail Object with detail to send on event to application.
	 * @param {Function} [callback=null] Callback function to invoke with application response.
	 * @param {Number} [timeout] If provided, will reject the promise if no response is received within given timeout milliseconds.
	 * @param {Function} [timeoutCallback=null] Callback function to invoke when timeout is reached with no response. Required if timeout is provided.
	 * @returns {void} void
	 */
	messageApplication(eventName, detail, callback = null, timeout = null, timeoutCallback = null) {

		// Build up platform event with provided detail
		const platformEvent = {
			bridgeEvent: eventName,
			detail: detail,
			fromApplication: false,
			identifier: this.parentContext.identifier
		};

		if (callback) {
			let resolved = null;

			// If callback function is specified, setup temporary event for callback response	
			const callbackId = `platform-callback|${v4()}`;
			platformEvent.callbackId = callbackId;

			let callbackHandler = (e) => {
				if (resolved === null) {
					resolved = true;
					window.removeEventListener(callbackId, callbackHandler);
					// eslint-disable-next-line callback-return
					callback(e.detail);
				}
			};

			callbackHandler = callbackHandler.bind(this);
			if (timeout) {
				setTimeout(() => {
					if (resolved === null) {
						resolved = false;
						window.removeEventListener(callbackId, callbackHandler);
						if (timeoutCallback) {
							timeoutCallback();
						}
					}
				}, timeout);
			}
			window.addEventListener(callbackId, callbackHandler);
		}
		window.parent.postMessage(platformEvent, `*`);
	}

	/**
	 * Message application consuming widget to raise specified event and wait for a response within the timeout.
	 * 
	 * @param {String} eventName Name of Event to send to application.
	 * @param {Object} detail Object with detail to send on event to application.
	 * @param {Number} [timeout=3000] Will reject the promise if no response is received within given timeout milliseconds.
	 * @returns {Promise} Promise for response from application.
	 */
	messageApplicationAsync(eventName, detail, timeout = 3000) {
		return new Promise((resolve, reject) => {
			try {
				this.messageApplication(
					eventName,
					detail,
					resolve,
					timeout,
					() => reject(new Error(`No response received for '${eventName}' in the given timeout: ${timeout}ms`))
				);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Message application consuming widget to grant and invoke specified permission.
	 * 
	 * @param {String} name Name of permission to invoke on application.
	 * @param {Object} detail Detail to send to application.
	 * @param {Number} [timeout] If provided, will reject the promise if no response is received within given timeout milliseconds.
	 * 
	 * @returns {Promise} Requests invocation of permission and returns response.
	 */
	messageApplicationWithPermission(name, detail, timeout) {
		return new Promise((resolve, reject) => {
			try {
				this.messageApplication(
					`platform-permission-request`,
					{
						name,
						detail
					},
					(response) => {
						if (response.approved) {
							resolve(response.detail);
						} else {
							reject(new Error(response.declineMessage));
						}
					},
					timeout,
					() => reject(new Error(`No response received for '${name}' in the given timeout: ${timeout}ms`))
				);
			} catch (error) {
				reject(error);
			}
		});
	}


	/**
	 * Message application consuming widget to show toast message.
	 * 
	 * @param {String} type Toast type:
	 * - `info` Best suited for informational purposes.
	 * - `success` Best suited for successful outcomes.
	 * - `warning` Best suited for warning outcomes.
	 * - `error` Best suited for error outcomes.
	 * @param {String} location Toast location:
	 * - `top` Top of screen.
	 * - `bottom` Bottom of screen.
	 * @param {String} title Title to display on toast
	 * @param {String} message Message to display in toast
	 * @param {Boolean} closable Whether the toast can be closed by clicking close button
	 * @param {Function} closeCallback To be called when toast is closed
	 * @param {horizontal|vertical|String} layout HTML message content orientation
	 * @param {TemplateResult} body override for title and message
	 * 
	 * @returns {Object} Shows toast message and return the toast message object
	 */
	showToastMessage(type, location, title, message, closable, closeCallback, layout, body) {
		const toast = {
			widgetId: this.parentContext.identifier,
			type: type,
			location: location,
			title: title,
			message: message,
			closable: closable,
			closeCallback: closeCallback,
			visible: true,
			layout: layout,
			body: body,
			uiId: v4()
		};

		// Idetifier to keep track of the specifict toast
		window.toastController.toasts[toast.uiId] = toast;

		this.messageApplication(`platform-show-toast-message`, JSON.parse(JSON.stringify(toast)));
		return toast;
	}

	/**
	 * Message application consuming widget to show toast message and
	 * after specified time, message application consuming widget to hide toast message.
	 * 
	 * @param {String} type Toast type:
	 * - `info` Best suited for informational purposes.
	 * - `success` Best suited for successful outcomes.
	 * - `warning` Best suited for warning outcomes.
	 * - `error` Best suited for error outcomes.
	 * @param {String} location Toast location:
	 * - `top` Top of screen.
	 * - `bottom` Bottom of screen.
	 * @param {String} title Title to display on toast
	 * @param {String} message Message to display in toast
	 * @param {Number} duration Duration to display in milliseconds
	 * @param {Boolean} closable Whether the toast can be closed by clicking close button
	 * @param {Function} closeCallback To be called when toast is closed
	 * @param {horizontal|vertical|String} layout HTML message content orientation
	 * @param {TemplateResult} body override for title and message
	 * 
	 * @returns {Object} Shows toast message and return the toast message object
	 */
	showToastMessageTimed(type, location, title, message, duration, closable, closeCallback, layout, body) {
		const tempToast = window.toastController.showToastMessage(type, location, title, message, closable, closeCallback, layout, body);

		setTimeout(() => {
			if (tempToast && tempToast.visible) {
				window.toastController.hideToastMessage(tempToast);
			}
		}, duration);
		return tempToast;
	}

	/**
	 * Message application consuming widget to hide current toast message.
	 * @param {Object} toast object returned by the window.showToast or windows.showToastTimed method
	 * @returns {void}
	 */
	hideToastMessage(toast) {
		if (toast) {
			this.messageApplication(`platform-hide-toast-message`, JSON.parse(JSON.stringify(toast)));
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------


	_focusNext(fromInput) {
		const elem = fromInput.getElement();
		const tidx = Number(elem.getAttribute(`tabindex`));

		const nextFocus = this._findNextTabIndex(elem, elem, tidx, null);
		if (nextFocus) {
			nextFocus.element.focus();
		}
		return nextFocus;
	}

	_findNextTabIndex(elem, searchingElem, tidx, foundNext) {
		foundNext = this._findNextTabIndexInChildren(elem, searchingElem, tidx, foundNext);

		if (elem.parentElement) {
			foundNext = this._findNextTabIndex(elem.parentElement, elem, tidx, foundNext);
		} else if (elem.parentNode && elem.parentNode.host) {
			foundNext = this._findNextTabIndex(elem.parentNode.host, elem, tidx, foundNext);
		}
		return foundNext;
	}

	_findNextTabIndexInChildren(elem, searchingElem, tidx, foundNext) {

		const tidx1Attr = elem.getAttribute(`tabindex`);

		if (tidx1Attr) {

			const tidx1 = Number(tidx1Attr);

			if ((foundNext && tidx1 > tidx && tidx1 < foundNext.tabIndex) || (!foundNext && tidx1 > tidx)) {

				foundNext = {
					element: elem,
					tabIndex: tidx1
				};
			}
		}

		const children = elem.children;

		for (let i = 0; i < children.length; i++) {

			const element = children[i];

			if (element !== searchingElem) {
				foundNext = this._findNextTabIndexInChildren(element, element, tidx, foundNext);
			}
		}

		if (elem.shadowRoot) {

			const shadowRootChildren = elem.shadowRoot.children;

			for (let i = 0; i < shadowRootChildren.length; i++) {
				const element = shadowRootChildren[i];

				if (element !== searchingElem) {
					foundNext = this._findNextTabIndexInChildren(element, element, tidx, foundNext);
				}
			}
		}

		return foundNext;
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the shell stylesheet.
	 * 
	 * @ignore
	 * @returns {css} The css content of the shell.
	 */
	static get styles() {

		return css`
			* {
				box-sizing: border-box;
			}
		
			:host {
				display: flex;
				flex-direction: column;

				box-sizing: border-box;
		
				padding: 0px;
				margin: 0px;
			}
		
			:host([hidden]) {
				display: none;
			}
		`;
	}

	/**
	 * Ensure the platform has completely loaded before moving to the render stage of the component lifecycle.
	 * 
	 * See {@link https://lit-element.polymer-project.org/guide/lifecycle#performUpdate}
	 * 
	 * @returns {void}
	 * 
	 * @ignore
	 */
	async performUpdate() {

		// Wait for the platform configuration to load before allowing the first shell render to happen.
		if (Configuration.getInstance().config === null) {
			await Configuration.getInstance().init();
		}

		// Queue the render task to continue.
		super.performUpdate();
	}

	/**
	 * Generates the component template, automatically detecting the appropriate rendering mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	render() {

		if (window === window.parent) {
			return html`
				<capitec-label type="title" style="color: red;" label="Widgets cannot be rendered standalone."></capitec-label>
				<capitec-label type="subtitle" style="color: red;" label="This must be displayed in a separate application with the '&lt;capitec-widget&gt;' component."></capitec-label>
			`;
		}

		if (!this.parentContext) {
			return html`
				<capitec-loading-indicator></capitec-loading-indicator>
			`;
		}

		// Get the configured mode the platform should render in.
		const mode = this.parentContext.type;

		// Render the widget in the configured display mode.
		let template = null;

		switch (mode) {
			case `mobile`:
				template = this._mobileTemplate();
				break;

			case `desktop`:
				template = this._webTemplate();
				break;

			case `kiosk`:
				template = this._kioskTemplate();
				break;

			default:
				template = html`Widget: Unknown Browser Type Detected`;
				break;
		}

		if (!template) {
			return html`Widget: Rendering not supported in '${mode}' mode`;
		}

		return html`${super.render()}${template}`;
	}
}