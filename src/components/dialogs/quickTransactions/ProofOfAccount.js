import { Component, css, html } from 'platform/elements';
import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { NavigationContext } from 'platform/core';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

const ACCOUNT_TYPE = `PRIMARY_SAVINGS`;

const ERROR_MESSAGE = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Enter the correct email address`
};

/**
 * Proof of Account dialog is used to send POA for a primary savings account.
 * This component is invoked from the Favourites landing screen
 * 
 * Events Raised 
 * -------------
 * cancel
 *
 * @export
 * @class ProofOfAccount
 * @extends {Component}
 */
export class ProofOfAccount extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.navigationContext = NavigationContext.getInstance();

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this._telemetry = HorizonTelemetry.instance;

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));

		// private properites
		this.isBusy = false;
		this.alertBannerMessage = ``;
		this.emailText = `Email address`;
		
		// private variables
		this.emailLabel = `Enter email address`;
		this.confirmEmailLabel = `Confirm email`;
		this.idEmailAddress = ``;
		this.idConfirmEmailAddress = ``;
		this.errMessage = {
			idEmailAddress: ``,
			idConfirmEmail: ``
		};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @param {Object} accountNumber Primary savings account number
	 * @param {Object} accountOpenedDate Primary savings account open date
	 * @property {string} cifNumber The client's CIF number
	 * @property {string} title client's title (Mr/ Mrs)
	 * @property {string} lastName client's last name
	 * @property {string} registeredEmailId Client's registered email ID
	 */
	static get properties() {
		return {
			accountNumber: { type: String },
			accountOpenedDate: { type: String },
			cifNumber: { type: String },
			lastName: { type: String },
			title: { 
				type: String,
				attribute: `client-title`
			},
			registeredEmailId: { type: String },
			isBusy: { attribute: false },
			alertBannerMessage: { attribute: false },
			emailText: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this._telemetry.startSpan(QuickTransactionEvents.PROOF_OF_ACCOUNT, {
			"screen": TelemetryScreen.PROOF_OF_ACCOUNT
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

    _errorHandler(ex) {
        return true;
    }

    _toggleBusyFlag() {
        this.isBusy = !this.isBusy;
    }

	async _sendClick(e) {
		if (this._validateEmailAddress(e)) {

			this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_SEND, {
				"screen": TelemetryScreen.PROOF_OF_ACCOUNT,
				"next-screen": TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME
			});

			// saving 'emailAddress' and 'accountNumber' in state.
			this._updateScreenDetails();

			const clientInfo = {
				"cifNumber": this.cifNumber,
				"accountNumber": this.accountNumber,
				"accountOpenedDate": this._formatDate(this.accountOpenedDate),
				"emailAddress": this.idEmailAddress,
				"accountType": ACCOUNT_TYPE,
				"title": this.title,
				"lastName": this.lastName
			};
			const returnValue = await this.quickTransactionService.sendProofOfAccount(clientInfo);

			this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_OUTCOME, {
				"screen": TelemetryScreen.PROOF_OF_ACCOUNT,
				"next-screen": returnValue.succeeded ? OutcomeScreen.SUCCESS : OutcomeScreen.FAIL
			}, true);
			this.horizonStore.setReturnScreen(this.navigationContext.current.route, `proof-of-account`);

			if (returnValue.succeeded) {
				this.horizonRouter.navigateToProofOfAccountSuccess();
			} else {
				this.horizonRouter.navigateToProofOfAccountFailed();
			}
		}
	}

	_formatDate(dateToFormat) {
        const stringToDate = new Date(dateToFormat);
        const tempdate = stringToDate.toISOString().slice(0, 10);
		return tempdate;
	}

	_cancelClick(e) {
		this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_CANCEL, {
			"screen": TelemetryScreen.PROOF_OF_ACCOUNT,
			"next-screen": TelemetryScreen.FAVOURITES
		});
		this._telemetry.endSpan(QuickTransactionEvents.PROOF_OF_ACCOUNT, { "screen": TelemetryScreen.PROOF_OF_ACCOUNT });

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_clearAlerts() {
		this.alertBannerMessage = ``;
	}

	_emailValueChanged(e) {
		this.idEmailAddress = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.alertBannerMessage = ERROR_MESSAGE.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_MISMATCH;
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_validateEmailAddress() {
		if (this._isNullorEmpty(this.idEmailAddress) || this._isNullorEmpty(this.confirmEmail)) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_REQUIRED;
		}

		return this._isNullorEmpty(this.alertBannerMessage);
	}

	_onKeyPress(e) {
		this._clearErrors(e);
	}

	_clearErrors(e) {
        this.errMessage.idEmailAddress = ``;
        this.errMessage.idConfirmEmail = ``;
		this.alertBannerMessage = ``;
		this.emailText = `Email address`;
	}

	_valueChanged(e) {
		this[e.currentTarget.id] = e.detail.new;
		this._clearErrors(e);
		this.emailText = `Email address`;
	}

	_isNullorEmpty(fieldValue) {
		return fieldValue === `` || fieldValue === null || fieldValue === undefined;
	}

	_updateScreenDetails() {
		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.emailAddress = this.idEmailAddress;
		screenDetails.accountNumber = this.accountNumber;
		
		this.horizonStore.setScreenDetails(screenDetails);
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// N/A

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles, 
			css`
				capitec-modal {
					width: 531px;
					height: 721px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 0px;
				}
				capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;

					margin: 16px 0px 0px 0px;
				
				}
				.label-err-message {
					--theme-label-font-color:#C83C37;
				}
				capitec-label {
					margin: 16px 0px 16px 0px;
					--theme-label-font-size: 18px;
					--theme-label-font-family: Hind Vadodara;
				}
				.body-class {
					width: 531px;
					height: 280px;
					margin: 16px 16px 0px 16px;
				}
				.err-body {
					width: 531px;
					height: 315px;
					margin: 16px 16px 0px 16px;
				}
				.search-label {
					height: 24px;
					width: 200px;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					margin-top: 16px;
					margin-bottom: 16px;
				}
				.confirm-search-label {
					height: 24px;
					width: 200px;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					margin-bottom: 16px;
				}
				horizon-email-input {
					--theme-layout-gap-spacing: 0px;
				}
				.footer {
					width: 563px;
					border-radius: 4px;
					--buttonbar-align: right;
					--theme-buttonbar-padding: 8px 16px;
				}
				#id-send-button {
					margin-left: 6px;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
		<capitec-modal type="free" header-align="left" data-automation-id="proof-of-account-header" header="Proof Of Account">
			<div slot="body" class="${this.alertBannerMessage ? `err-body` : `body-class`} ">
				${this._renderAlertBanner()}
				${this._renderEmailFields()}
				${this._renderLoadingIndicator()}
			</div>
			<div slot="footer">
				${this._renderFooter()}
			</div>
		</capitec-modal>
		`;
	}

	_renderAlertBanner() {
		if (!this._isNullorEmpty(this.alertBannerMessage)) {
			return html`
				<capitec-alert-banner type="unsuccessful-red">
					<capitec-group layout="horizontal">
						<capitec-label
							data-automation-id="proof-of-account-notify-alert-banner"
							type="subtitle"
							label="Notify: "
							class="label-err-message">
						</capitec-label>
						<capitec-label
							data-automation-id="proof-of-account-alert-banner"
							label="${this.alertBannerMessage}"
							class="label-err-message">
						</capitec-label>
					</capitec-group>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderEmailFields() {
		return html`
			<horizon-email-input
				labelOne="${this.emailLabel}"
				labelTwo="${this.confirmEmailLabel}"
				registeredEmailId="${this.registeredEmailId}"
				?showRequiredError="${this.alertBannerMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
				.callBack="${() => this._clearAlerts()}"
				@value-changed="${(e) => this._emailValueChanged(e)}">
			</horizon-email-input>
		`;
	}

	_renderFooter() {
		return html`
		<capitec-button-bar 
		class="footer"
		layout="horizontal"
		gap="clear">
			<capitec-button
				data-automation-id="proof-of-account-cancel"
				id="id-cancel-button" 
				type="secondary" 
				label="Cancel" 
				@click="${(e) => this._cancelClick(e)}">
			</capitec-button>
			<capitec-button
				data-automation-id="proof-of-account-send" 
				id="id-send-button" 
				type="primary" 
				label="Send" 
				@click="${(e) => this._sendClick(e)}">
			</capitec-button>
			</capitec-button-bar>
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="proof-of-account-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

}
customElements.define(`horizon-proof-of-account`, ProofOfAccount);