import { Component, css, html } from 'platform/elements';
import { Logger } from 'platform/core';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';


const EMAIL_REGEX = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;

/**
 * Reusable email component to be used to send statements.
 * 
 * Events Raised 
 * -------------
 * cancel
 * send email
 *  
 * @export
 * @class StatementsDialog
 * @extends {Component}
 */

export class HorizonEmailInput extends Component {
	// --------------
    // INITIALISATION
    // --------------

	constructor() {
		super();

		this.email = ``;
		this.confirmEmail = ``;
		this.errorMessage = ``;
		this.mailClientError = {
			email: ``,
			confirmEmail: ``
		};

		this.logger = Logger.getInstance();

	}

    // ----------
    // PROPERTIES
    // ----------

	/**
	* Registry of all properties defined by the component.
	**/

	 static get properties() {
		 return {
			email: { type: String },
			confirmEmail: { type: String },
			labelOne: { type: String },
			labelTwo: { type: String }
		 };
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		// Ensure the component is setup correctly.
		super.connectedCallback();

		// Telemetry
	}

	disconnectedCallback() {
		// Ensure the component is cleaned up correctly.
		super.disconnectedCallback();
    }
	
	// --------------
	// EVENT HANDLERS
	// --------------
	
	/**
	 * Input of an email address
	 * @param {string} email - The clients email address
	 * @param {string} confirmEmail - The clients email address repeated
	 * @param {string} type - Used for error validations and messages
	 */

	_emailValueChange(email, confirm) {
		this.dispatchEvent(new CustomEvent(`value-changed`, {
			detail: {
				email: email,
				confirmEmail: confirm
			}
		}))
	}

	_validateEmailAddress() {

			this.dispatchEvent(new CustomEvent(`on-email-validation`, {
				detail: this.errorMessage
			}))
		
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------


	_confirmEmailMatch() {

		if (!isNullorEmpty(this.email) && !isNullorEmpty(this.confirmEmail)) {
			if (this.email === this.confirmEmail) {
				this._emailValueChange(this.email, this.confirmEmail);
				return true;
			}
		}
	}

	_inputEmail(e) {
		if (e.detail.new !== e.detail.old) {
			this.mailClientError.email = "";
			this.mailClientError.confirmEmail = "";
		}
	}


	_emailFormatCheck(e) {
		
		this[e.currentTarget.id] = e.detail.new;

		if (e.detail.new.length > 0) {
			if (!EMAIL_REGEX.test(e.detail.new)) {
				this.errorMessage = `Invalid email format`;
				this.mailClientError.email = `Invalid email format`;
				this.mailClientError.confirmEmail = `Invalid email format`;
			} else {
				this.errorMessage = ``;
				this.mailClientError[e.currentTarget.id] = ``;
			}
		}
		if (!this._confirmEmailMatch()) {
			this.errorMessage = `Emails don't match`;
			this.mailClientError.email = `Emails don't match`;
			this.mailClientError.confirmEmail = `Emails don't match`;
		}
		this._validateEmailAddress();
	}

	static get styles() {
		return[
			super.styles,
			css`
			.emailLabel[type="subtitle"] {
				line-height: 24px;

				--theme-label-subtitle-font-size: 18px;
				--theme-label-subtitle-font-weight: 600;
				--theme-layout-gap-spacing: 16px;
			}
			`
		]
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-group>
				${this._renderEmailGroup()}
			</capitec-group>
		`;
	}

	_renderEmailGroup() {
		return html`
			<capitec-label
				class="emailLabel"
				type="subtitle"
				label="Enter email address">
			</capitec-label>

			<capitec-text-field
				id="email"
				data-automation-id="email-input-email-address"
				label="Email address"
				oncopy="return false"
				onpaste="return false"
				oncut="return false"
				value="${this.email}"
				error="${this.mailClientError.email}"
				@value-changed="${(e) => this._emailFormatCheck(e)}"
				@input="${(e) => this._inputEmail(e)}">
			</capitec-text-field>

			<capitec-label
				style="padding-top:8px"
				class="emailLabel"
				type="subtitle"
				label="Confirm email address">
			</capitec-label>

			<capitec-text-field
				id="confirmEmail"
				data-automation-id="email-input-confirm-email-address"
				label="Email address"
				oncopy="return false" 
				onpaste="return false"
				oncut="return false"
				value="${this.confirmEmail}"
				error="${this.mailClientError.confirmEmail}"
				@value-changed="${(e) => this._emailFormatCheck(e)}"
				@input="${(e) => this._inputEmail(e)}">
			</capitec-text-field>

			<hr class="seperator">
		`;
	}

	
};

window.customElements.define(`horizon-email-input`, HorizonEmailInput);