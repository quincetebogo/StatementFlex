import { Component, css, html } from 'platform/elements';
import { EMAIL_DOMAINS } from 'app/constants/Common';
import { HorizonStore } from 'app/store/HorizonStore';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

const EMAIL_REGEX = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;
const ERROR_MESSAGE = {
	FORMAT: `Enter a valid email address`,
	MISMATCH: `Emails don't match`,
	REQUIRED: `Enter a valid email address i.e.email@gmail.com`
};

/**
 * An email component, with two fields to capture email and confrim email values.
 * This is coded to do format check and comparison validations itself.
 * 
 * Events Raised 
 * -------------
 * value-changed
 *  
 * @export
 * @class HorizonEmailInput
 * @extends {Component}
 */

export class HorizonEmailInput extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.email = ``;
		this.emailError = ``;
		this.emailSuggestion = ``;

		this.confirmEmail = ``;
		this.confirmEmailError = ``;
		this.confirmEmailSuggestion = ``;

		this.horizonStore = HorizonStore.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	* @param {string} labelOne - First text field label value
	* @param {string} labelTwo - Second text field label value
	* @param {Boolean} showRequiredError - Flag to let this component show required field error
	* @param {Object} callBack - Callback function to parent component, can be used for any purpose
	**/
	 static get properties() {
		 return {
			labelOne: { type: String },
			labelTwo: { type: String },
			showRequiredError: { type: Boolean },
			callBack: { type: Object },
			email: { type: String },
			confirmEmail: { type: String },

			emailError: { state: true },
			emailSuggestion: { state: true },

			confirmEmailError: { state: true },
			confirmEmailSuggestion: { state: true }
		 };
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		const callerInformation = this.horizonStore.getCallerInformation();
		this.emailId = this.email = callerInformation.emailId;

		if (!isNullorEmpty(this.emailId)) {
			if (!this._validateInput(callerInformation.emailId)) {
				this.emailError = ERROR_MESSAGE.FORMAT; 
			}

			this._valueChanged(this.email, this.emailId, true);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	async updated(changedProperties) {
		await this.updateComplete;

		const emailChange = Boolean(changedProperties.get(`email`));
		const confirmEmailChange = Boolean(changedProperties.get(`confirmEmail`));
		const requiredError = this.showRequiredError;

		if (emailChange) {
			this._showDomainSuggestion(this.email, `email`);
		} else if (confirmEmailChange) {
			this._showDomainSuggestion(this.confirmEmail, `confirmEmail`);
		} else if (requiredError) {
			this._showRequiredErrors();
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_keyDownTab(evt) {
		if (evt.keyCode === 9) {
			this.email = `${this.email}${this.emailSuggestion}`;
			this.confirmEmail = `${this.confirmEmail}${this.confirmEmailSuggestion}`;

			this.emailSuggestion = ``;
			this.confirmEmailSuggestion = ``;
			this.requestUpdate();
		}
	}

	_inputEmail(event) {
		if (event.detail.action === `clear`) {
			this.email = this.emailId;
			this.confirmEmail = ``;
			
			this._clearErrors();
			this.callBack();

			this._valueChanged(this.email, this.emailId, true);
			
			return;
		}

		if (event.detail) {
			this.emailError = ``;
			this.confirmEmailError = this.confirmEmailError === ERROR_MESSAGE.MISMATCH ? `` : this.confirmEmailError;
			this.email = event.detail.new;
			this.callBack();
		}
	}

	_inputConfirmEmail(event) {
		if (event.detail) {
			this.confirmEmailError = ``;
			this.emailError = this.emailError === ERROR_MESSAGE.MISMATCH ? `` : this.emailError;
			this.confirmEmail = event.detail.new;
			this.callBack();
		}
	}

	/**
	 * On focusing out from an input, following operations are carried out
	 * 1. Empty the suggestion
	 * 2. If value is empty, don't do any further checks/ dispatch event
	 * 3. If value is not empty, do regex email format check
	 * 4. When regex check is passed, do compare check
	 * 5. When all the above are passed, dispatch event
	 * 
	 * @param {Object} event - focus out event object
	 * @returns {void}
	 */
	_focusOutInput(event) {
		this[`${event.currentTarget.id}Suggestion`] = ``;

		const value = this[`${event.currentTarget.id}`]; // Fetching current target value
		if (!value) {
			// When value is empty, don't do any further checks
			return true;
		}

		const isValid = this._validateInput(value);
		if (!isValid) {
			this[`${event.currentTarget.id}Error`] = ERROR_MESSAGE.FORMAT; // invalid email error
		}

		const isMatched = this._compareEmails();
		if (!isMatched) {
			this.emailError = ERROR_MESSAGE.MISMATCH; // not matched error
			this.confirmEmailError = ERROR_MESSAGE.MISMATCH; // not matched error
		}

		this._valueChanged(this.email, this.confirmEmail, isMatched);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * Suggests email domain value for the input string.
	 * This starts peforming only when the input has @ and there after any character
	 * 
	 * @param {string} value - Textfield value (from email/ confirm email)
	 * @param {string} id - Current target id
	 * @return {void}
	 */
	_showDomainSuggestion(value, id) {
		if (value.indexOf(`@`) > -1) {
		
			const change = value.split(`@`);
			const suggestFor = change[1];

			if (suggestFor) {
				// Retrieving input replica label elem
				const inputReplica = this.shadowRoot.getElementById(`${id}-replica`);
				// Retrieving text field computed styles
				const textField = this.shadowRoot.getElementById(id);
				const textFieldStyles = getComputedStyle(textField);
				const paddingLeft = textFieldStyles?.getPropertyValue(`--theme-input-padding-left`);
				const bufferSpace = 4; // 2px;

				const suggestionElem = this.shadowRoot.getElementById(`${id}-suggestion`);
				suggestionElem.style.setProperty(`left`, `calc(${inputReplica.offsetWidth + 3}px + ${paddingLeft})`);

				const suggestionValue = EMAIL_DOMAINS.find(item => item.startsWith(suggestFor.toLowerCase()));
				this[`${id}Suggestion`] = suggestionValue?.substring(suggestFor.length) ?? ``;
			} else {
				this[`${id}Suggestion`] = ``;
			}
		} else {
			this[`${id}Suggestion`] = ``;
		}
	}

	_validateInput(val) {
		return EMAIL_REGEX.test(val);
	}

	_compareEmails() {
		const hasFormatError = this.emailError === ERROR_MESSAGE.FORMAT || this.confirmEmailError === ERROR_MESSAGE.FORMAT;
		const hasValues = Boolean(this.email) && Boolean(this.confirmEmail);

		if (!hasValues || hasFormatError) {
			// One of email values is empty, cannot compare at this moment
			return true;
		}

		const isMatching = this.email === this.confirmEmail;
		if (isMatching) {
			this._clearErrors();
		}

		return isMatching;
	}

	_clearErrors() {
		this.emailError = ``;
		this.confirmEmailError = ``;
	}

	_showRequiredErrors() {
		this.emailError = !this.email ? ERROR_MESSAGE.REQUIRED : this.emailError;
		this.confirmEmailError = !this.confirmEmailError ? ERROR_MESSAGE.REQUIRED : this.confirmEmailError;
	}

	_valueChanged(email, confirmEmail, isMatched) {
		
		this.dispatchEvent(new CustomEvent(`value-changed`, {
			detail: {
				email: email,
				confirmEmail: this.emailId === email ? email : confirmEmail,
				invalidFormat: this.emailError === ERROR_MESSAGE.FORMAT || this.confirmEmailError === ERROR_MESSAGE.FORMAT,
				mismatched: !isMatched
			}
		}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.header-label {
					--theme-layout-gap-spacing: 16px;
				}
				.emailLabel[type="subtitle"] {
					line-height: 24px;
					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
				}
				.replica {
					--theme-label-default-font-size: val(--theme-input-font-size);
				}
				.hide-visibility {
					visibility: hidden;
				}
				.domain-suggestion {
					display: block;
					box-sizing: content-box;
					font-family: var(--theme-input-font-family);
					font-size: var(--theme-input-font-size);
    				font-weight: var(--theme-input-font-weight);
					line-height: normal;
					letter-spacing: 0px;
					top: -36px;
					position: relative;
					color: #a9a9a9;
					width: 100px;
					height: 12px;
				}
				.search-text-field {
					--theme-icon-size-default: 0px;
					--theme-input-search-icon-margin-left: 0px;
					--theme-input-search-field-text-indent: 0px;
					--theme-input-search-label-idle-margin-left: 0px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-content-box noPadding>
				${this._renderEmailGroup()}
			</capitec-content-box>
		`;
	}

	_renderEmailGroup() {
		return html`
			${this._renderEmail()}
			${this._renderConfirmEmail()}
		`;
	}

	_renderEmail() {
		return html`
			<capitec-group class="header-label" layout="horizontal" halign="left" valign="center" gap="none">
				<capitec-label
					class="emailLabel"
					type="subtitle"
					label="${this.labelOne}">
				</capitec-label>

				<capitec-label
					id="email-replica"
					class="replica hide-visibility"
					label="${this.email}">
				</capitec-label>
			</capitec-group>

			<capitec-text-field
				id="email"
				class="search-text-field"
				data-automation-id="email-input-email-address"
				label="Email address"
				oncopy="return false"
				onpaste="return false"
				oncut="return false"
				type="${this.emailId === this.email ? `` : `search`}"
				value="${this.email}"
				error="${this.emailError}"
				@input="${(e) => this._inputEmail(e)}"
				@keydown="${(e) => this._keyDownTab(e)}"
				@focusout="${(e) => this._focusOutInput(e)}">
			</capitec-text-field>
			<span id="email-suggestion" class="domain-suggestion">${this.emailSuggestion}</span>`;
	}

	_renderConfirmEmail() {
		return html`
			<capitec-group class="header-label" layout="horizontal" halign="left" valign="center" gap="none">
				<capitec-label
					class="emailLabel ${this.emailId === this.email && !isNullorEmpty(this.emailId) ? `hide-visibility` : ``}"
					type="subtitle"
					label="${this.labelTwo}">
				</capitec-label>

				<capitec-label
					id="confirmEmail-replica"
					class="replica hide-visibility"
					label="${this.confirmEmail}">
				</capitec-label>
			</capitec-group>

			<capitec-text-field
				id="confirmEmail"
				data-automation-id="email-input-confirm-email-address"
				label="Email address"
				oncopy="return false" 
				onpaste="return false"
				oncut="return false"
				value="${this.confirmEmail}"
				error="${this.confirmEmailError}"
				@input="${(e) => this._inputConfirmEmail(e)}"
				@keydown="${(e) => this._keyDownTab(e)}"
				@focusout="${(e) => this._focusOutInput(e)}"
				?hidden="${this.emailId === this.email && !isNullorEmpty(this.emailId)}">
			</capitec-text-field>
			<span id="confirmEmail-suggestion" class="domain-suggestion">${this.confirmEmailSuggestion}</span>`;
	}
};

window.customElements.define(`horizon-email-input`, HorizonEmailInput);