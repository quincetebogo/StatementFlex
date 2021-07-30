import { Component, css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
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

export class EmailComponent extends Component {
	// --------------
    // INITIALISATION
    // --------------

	constructor() {
		super();

		this.email = ``;
		this.confirmEmail = ``;
		this.mailClientError = {
			email: ``,
			confirmEmail: ``
		};

		this.horizonStore = HorizonStore.getInstance();
		this.logger = Logger.getInstance();
		this._telemetry = HorizonTelemetry.instance;

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
			confirmEmail: { type: String }
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

	async _cancel() {

		this.dispatchEvent(new CustomEvent(`cancel`, {}));

	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_confirmEmailMatch() {

		if (!isNullorEmpty(this.email) && !isNullorEmpty(this.confirmEmail)) {
			return this.email === this.confirmEmail;
		}
		return true;
	}

	_inputEmail(e) {
		this.mailClientError[e.currentTarget.id] = ``;
		this.mailClientError.email = ``;
		this.mailClientError.confirmEmail = ``;
		this.errorMessage = ``;
	}

	_validateEmailAddress() {
		this.mailClientError.email = isNullorEmpty(this.email) ? `Please enter email` : ``;
		this.mailClientError.confirmEmail = isNullorEmpty(this.confirmEmail) ? `Please enter email` : ``;

		const errorMessage = this.mailClientError.email || this.mailClientError.confirmEmail ? `Complete all fields.` : ``;
		return errorMessage === ``;
	}

	_updateScreenDetails() {
		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.emailAddress = this.email;
		
		this.horizonStore.setScreenDetails(screenDetails);
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
		this.requestUpdate();
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
				data-automation-id="email-component-dialog-email-address"
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
				data-automation-id="email-component-dialog-confirm-email-address"
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

window.customElements.define(`horizon-email-component`, EmailComponent);