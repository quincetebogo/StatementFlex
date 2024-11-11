import { Element, css, html } from './index.js';
import { Configuration } from 'ocwp-core';

/**
 * Base class for all platform shells.
 */
export class Shell extends Element {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		this.addEventListener(`keyboard-input-focus`, this._shellKeyboardInputFocus);
		this.addEventListener(`keyboard-request-close`, this._keyboardClose);

		window.addEventListener(`platform-open-keyboard`, (e) => {
			if (e.detail.content.widgetId) {
				if (this.currentInput) {
					if (this.currentInput.widgetId || e.detail.content.widgetId) {
						if (this.currentInput.widgetId !== e.detail.content.widgetId) {
							this.dispatchEvent(new CustomEvent(`platform-keyboard-close`, {
								detail: {
									widgetId: this.currentInput.widgetId,
									shouldRefocus: false
								},
								bubbles: true,
								composed: true
							}));
						}
					} else if (this.currentInput.getElement() !== e.detail.getElement()) {
						this.currentInput.valueChangedCallback();
					}
				}

				this.currentInput = e.detail.content;
				this.currentInput.getCurrentValue = () => this.currentInput.lastValue;
				if (this.isKeyboardOpen !== true) {
					this._toggleKeyboard();
				} else {
					this.requestUpdate();
				}
			}
		});
		window.addEventListener(`platform-close-keyboard`, (e) => {

			this._keyboardClose(e.detail.content);
		});
		window.addEventListener(`platform-keyboard-input-value`, (e) => {
			if (this.currentInput && this.currentInput.widgetId) {
				this.currentInput.lastValue = e.detail.content.lastValue;
				this.requestUpdate();
			}
		});
		this.addEventListener(`application-busy-indicator`, (e) => {
			this.busyIndicatorRequest = e.detail.content;
			this.requestUpdate();
			if (e.detail.callback) {
				e.detail.callback(e.detail.content);
			}
		});

		this.currentInput = null;
		this.isKeyboardOpen = false;

		window.requestAppPermission = this.requestAppPermission.bind(this);
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

	_shellKeyboardInputFocus(e) {

		if (this.currentInput) {
			if (this.currentInput.widgetId || e.detail.widgetId) {
				if (this.currentInput.widgetId !== e.detail.widgetId) {
					this.dispatchEvent(new CustomEvent(`platform-keyboard-close`, {
						detail: {
							widgetId: this.currentInput.widgetId,
							shouldRefocus: false
						},
						bubbles: true,
						composed: true
					}));
				}
			} else if (this.currentInput.getElement() !== e.detail.getElement()) {
				this.currentInput.valueChangedCallback();
			}
		}


		this.currentInput = e.detail;

		if (this.isKeyboardOpen !== true) {
			this._toggleKeyboard();
		}
		this.requestUpdate();
	}

	_keyboardClose(shouldRefocus) {
		if (this.isKeyboardOpen) {
			this._toggleKeyboard();
		}
		if (this.currentInput) {

			if (this.currentInput.widgetId) {
				this.dispatchEvent(new CustomEvent(`platform-keyboard-close`, {
					detail: {
						widgetId: this.currentInput.widgetId,
						shouldRefocus: shouldRefocus === true
					},
					bubbles: true,
					composed: true
				}));
				return;
			}

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

			if (this.currentInput.widgetId) {
				this.dispatchEvent(new CustomEvent(`platform-keyboard-defer-focus`, {
					detail: this.currentInput.widgetId,
					bubbles: true,
					composed: true
				}));
				return;
			}
			this.currentInput.focusCallback();
		}
	}

	/**
	 * Called when any key is pressed on the on-screen keyboard
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

		if (this.currentInput.widgetId) {
			this.dispatchEvent(new CustomEvent(`platform-keyboard-keypress`, {
				detail: {
					keyPressInfo: event.detail,
					widgetId: this.currentInput.widgetId
				},
				bubbles: true,
				composed: true
			}));
			return;
		}

		// Find the start and end of the current selection in order to determine which character position(s) of the value should be modified
		const selection = this.currentInput.getSelection();

		if (event.detail && this.currentInput) {

			if (event.detail.value === `return`) {
				// Enter/return key pressed
				if (this.currentInput.returnMode === `change-value`) {
					// If returnMode is `change-value`, the keyboard will close when enter is pressed and focus on the element with the next tabIndex, if any.
					this._keyboardClose(true);
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

				// Re-render for the changes to be visible, and set the caret position to its position relative to the new changes
				this.requestUpdate();
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

				// Re-render for the changes to be visible
				this.requestUpdate();
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

			// Re-render for the changes to be visible, and set the caret position to its position relative to the new changes
			this.requestUpdate();
			this.currentInput.setSelection({
				start: selection.start + 1,
				end: selection.start + 1
			});
		}
	}

	_approvePermission() {

		this.permissionRequest.authorizedCallback();
		delete this.permissionRequest;
		this.requestUpdate();
	}

	_rejectPermission() {

		this.permissionRequest.declinedCallback(this.permissionRequest.permission.declineMessage);
		delete this.permissionRequest;
		this.requestUpdate();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Requests authorization of permission and invokes relevant callback
	 * @param {String} permission Permission to authorize
	 * @param {Function} authorizedCallback Callback to invoke if authorized
	 * @param {Function} declinedCallback Callback to invoke with reason message if not authorized
	 * @ignore
	 * @returns {void} Requests authorization of permission
	 */
	requestAppPermission(permission, authorizedCallback, declinedCallback) {
		this.permissionRequest = {
			permission,
			authorizedCallback,
			declinedCallback
		};
		this.requestUpdate();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleKeyboard() {
		this.isKeyboardOpen = !this.isKeyboardOpen;
		this.requestUpdate();
	}

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

	render() {

		let foundBothRenderingFunctions = false;
		let templateFunction = null;

		if (this.renderShell) {

			if (this._webTemplate) {
				foundBothRenderingFunctions = true;
				templateFunction = `_webTemplate`;
			} else if (this._kioskTemplate) {
				foundBothRenderingFunctions = true;
				templateFunction = `_kioskTemplate`;
			} else if (this._mobileTemplate) {
				foundBothRenderingFunctions = true;
				templateFunction = `_mobileTemplate`;
			}
		}

		if (foundBothRenderingFunctions) {
			console.warn(`Detected renderShell() as well as '${templateFunction}()' rendering methods, please note that renderShell() takes precedence.`);
		}

		return html`
			${this._renderBusyIndicator()}
			${this._renderPermissionRequest()}
			${this.renderShell ? this.renderShell() : this._renderShell()}
			${this.isKeyboardOpen === true
				? html`<capitec-keyboard displayValue="${this.currentInput && this.currentInput.returnMode !== `multi-line` ? this.currentInput.mask === true ? `*`.repeat(this.currentInput.getCurrentValue().length) : this.currentInput.getCurrentValue() : ``}" @keyboard-focused="${this._deferFocus}" @keyboard-close="${this._keyboardClose}" @keyboard-key-press="${this._shellKeyboardPress}" mode=${this.currentInput ? this.currentInput.keyboardMode : `alpha-numeric`}></capitec-keyboard>`
				: html``}
			<capitec-toast-controller></capitec-toast-controller>
		`;
	}

	_renderBusyIndicator() {
		if (!this.busyIndicatorRequest || this.busyIndicatorRequest.state === `hide`) {
			return ``;
		}

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	_renderPermissionRequest() {
		if (!this.permissionRequest) {
			return ``;
		}

		// TODO: Align with CX team on permission requests
		return html`
			<capitec-modal type="result" result="warn" header="Permission Request">
				<capitec-label slot="body" label="${this.permissionRequest.permission.requestMessage}" ></capitec-label>
				<capitec-button slot="footer" type="primary" label="Approve" @click="${() => this._approvePermission()}"></capitec-button>
				<capitec-button slot="footer" type="clear" label="Decline" @click="${() => this._rejectPermission()}"></capitec-button>
			</capitec-modal>
		`;
	}

	_renderShell() {

		// Ensure the platform configuration is initialised.
		if (!this.config || !this.config.platform || !this.config.platform.type) {
			throw new Error(`Shell: Platform configuration not initialised yet.`);
		}

		// Render the shell in the configured display mode.
		let template = null;

		switch (this.config.platform.type) {
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
				template = html`Shell: Unknown Browser Type Detected`;
				break;
		}

		if (!template) {
			return html`Shell: Rendering not supported in '${this.config.platform.type}' mode`;
		}

		return html`${super.render()}${template}`;
	}
}