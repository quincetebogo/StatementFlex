import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import { isNullorEmpty } from '../../utils/channelServiceUtilities';

import 'app/components/common/RelatedOptions';


/**
 * Display an confirmation/success screen indicating the proof of payment statement has been successfully sent.
 *
 * @export
 * @class ProofOfAccountSuccess
 * @extends {ViewBase}
 */
export class PayshapProofOfPaymentOutcome extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.endCallContext = `QuickTransactionSuccess`;
		this.verifiedCellphoneNumber = ``;
		this.tranCode = ``;
		this.showSuccessIcon = false;
		this.showFailureIcon = false;
		this.notificationType = [];
		this.succeededNotification = [];
		this.failedNotification = [];
		this.displayToast = true;
	}


	// ----------
	// PROPERTIES
	// ----------
	static get properties() {
		return {
			showSuccessIcon: { type: Boolean },
			showFailureIcon: { type: Boolean },
			displayToast: { state: false }
		};
	}

	get incidentDescription() {
		return `Recipient EmailID: ${this.screenDetails.emailAddress}`;
	}
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.screenDetails = this.horizonStore.getScreenDetails();
		this.mailId = this.screenDetails && this.screenDetails.emailAddress;
		this.tranCode = this.screenDetails && this.screenDetails.tranCode;
		this.verifiedCellphoneNumber = this.screenDetails && this.screenDetails.verifiedCellphoneNumber;
		this.outcome = this.screenDetails && this.screenDetails.outcome;
		this.succeededNotification = this.outcome.resendSucess;
		this.failedNotification = this.outcome.resendFailed;
		
	
		this._getOutcomeDetails();
		this._updateIncidentState();

		window.setTimeout(() => this.displayToast = false, 3000);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_sendAnotherClick() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
		this.horizonRouter.navigateToReturnPage();
	}

	_showSuccessIcon() {
		this.showSuccessIcon = !this.showSuccessIcon;
	}

	_showFailureIcon() {
		this.showFailureIcon = !this.showFailureIcon;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonIncidentManager.setDescription(this.incidentDescription);
	}

	_getOutcomeDetails() {
		if (this.outcome.resendSuccess.length > 0) {
			this.toast = `Proof of payment was sent`;
		}
		if (this.outcome.resendFailed.length > 0) {
			this.secondaryToast = `Proof of payment was not sent`;
		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

			.card {
				width: 100%;
			}
			
			.card > capitec-group[layout="vertical"] {
				height: var(--horizon-success-screen-size, 744px);
			}

			#id-successful-img {
				width: 212px;
				height: 154px;
			}
			#id-successful-header {
				margin-top:33px;
				margin-bottom:23px;
				height: 32px;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 24px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 36px;
				text-align: center;
			}

			#id-msg-group{
				justify-content: center;
			}
				#id-error-msg {
					width: auto;
				}

				#id-sub-detail {
					justify-content: center;
				}

				#id-sub-content {
					margin-top: 24px;
					justify-content: center;
				}

				#id-button-group {
					justify-content: center;
					margin-top: var(--horizon-button-group-margin-top, 64px);
				}

				#button-left {
					margin-right: 16px;
				}

				.center-button {
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-padding-left: 22px;
					--theme-button-padding-top: 12.5px;
					--theme-button-padding-bottom: 12.5px;
					--theme-button-padding-right: 22px;
				}
				.options-group{
					height: 80px; 
					margin:17px 0px 15px 16px;
				}

				capitec-toast {
					width: 406px;
					position: absolute;
					top : 56px;
					margin-left: 382px;
				}
				.secondary-toast {
					top : 130px;
				}
				
				slot[name=detail]::slotted(*){
					height: 24px;
					width: var(--theme-slot-detail-width , 543px);
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
					margin-bottom: 13px;
				}

				slot[name=sub-detail] {
					height: 24px;
					width: 543px;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">
			${this._renderSuccessToast()}
			${this._renderFailureToast()}
			${this._renderOutcomeScreen()}
			</capitec-card>
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderOutcomeScreen() {
		return html`
			<capitec-group layout="vertical" halign="center" valign="center">
		<capitec-image id="id-successful-img" src="platform/illustrations/send-documents.svg"></capitec-image>
		<capitec-label id="id-successful-header" type="title" label="Proof of Payment"></capitec-label>
		
		<capitec-group layout="horizontal">
		${this._renderSuccessIcon()}
	    ${this._successMessage()}
		</capitec-group>

		<capitec-group layout="horizontal">
		${this._renderFailureIcon()}
		${this._failedMessage()}
		</capitec-group>

		<capitec-group id="id-button-group" layout="horizontal">
				${this._renderLeftButton()}
				${this._renderRightButton()}
			</capitec-group>
		</capitec-group>
		`;
	}

	_renderSuccessToast() {
		return this.toast
		? html`
			<capitec-toast 
				?hidden="${!this.displayToast}"
				type="success"
				header="Successful"
				detail="${this.toast}" 
				closable
				@click="${() => this.displayToast = false}">
			</capitec-toast>`
		: html``;
	}

	_renderFailureToast() {
		return this.secondaryToast  
			? html`
				<capitec-toast 
					?hidden="${!this.displayToast}"
					class="${this.toast ? `secondary-toast` : ``}"
					type="error" 
					header="Unsuccessful" 
					detail="${this.secondaryToast}"
					closable 
					@click="${() => this.displayToast = false}">
				</capitec-toast>`
		: html``;
	}

	_renderSuccessIcon() {
		return this.outcome.resendSuccess.length >= 1
		? html`
			<capitec-icon icon="status/success-trans"></capitec-icon>` 
		: html``;
	}

	_renderFailureIcon() {
		return this.outcome.resendFailed.length >= 1
		? html`
			<capitec-icon icon="status/unsuccessful-trans"></capitec-icon>`
		: html``;
	}

	_renderLeftButton() {
		return html`
			<capitec-button
				id="button-left"
				class="center-button"
				label="Send Another"
				@click="${() => this._sendAnotherClick()}">
			</capitec-button>`;
	}

	_renderRightButton() {
		return html`
			<capitec-button
				class="center-button"
				type="primary"
				label="Done"
				@click="${() => this._doneClick()}">
			</capitec-button>`;
	}
	
	_successMessage() {
		const notificatioMethod = `The proof of payment for transaction ${this.tranCode} was sent to `;
		if (!isNullorEmpty(this.outcome.resendSuccess)) {
			if (this.outcome.resendSuccess.length === 1) {
				return notificatioMethod + this._notificationTypeId(this.outcome.resendSuccess[0]);
			}
			if (this.outcome.resendSuccess.length === 2) {
				let newStr = notificatioMethod + this._notificationTypeId(this.outcome.resendSuccess[0]);
				newStr += ` and `;
				return newStr + this._notificationTypeId(this.outcome.resendSuccess[1]);
			}
			if (this.outcome.resendSuccess.length === 3) {
				let newStr = notificatioMethod + this._notificationTypeId(this.outcome.resendSuccess[0]);
				newStr += ` ,`;
				newStr += this._notificationTypeId(this.outcome.resendSuccess[1]);
				newStr += ` and `;
				return newStr + this._notificationTypeId(this.outcome.resendSuccess[2]);
			}
		}
	}

	_failedMessage() {
		const notificatioMethod = `The proof of payment was not sent to `;
		if (!isNullorEmpty(this.failedNotification)) {
			if (this.failedNotification.length === 1) {
				return notificatioMethod + this._notificationTypeId(this.failedNotification[0]);
			}
			if (this.failedNotification.length === 2) {
				let newStr = notificatioMethod + this._notificationTypeId(this.failedNotification[0]);
				newStr += ` and `;
				return newStr + this._notificationTypeId(this.failedNotification[1]);
			}
			if (this.failedNotification.length === 3) {
				let newStr = notificatioMethod + this._notificationTypeId(this.failedNotification[0]);
				newStr += ` ,`;
				newStr += this._notificationTypeId(this.failedNotification[1]);
				newStr += ` and `;
				return newStr + this._notificationTypeId(this.failedNotification[2]);
			}
		}
	}

	_notificationTypeId(notificationType) {
		if (notificationType === `SMS`) {
			return this.verifiedCellphoneNumber;
		}
		if (notificationType === `EMAIL`) {
			return this.mailId;
		}
		if (notificationType === `APP`) {
			return `APP`;
		}
	}
	

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-payshap-proof-of-payment-outcome`, PayshapProofOfPaymentOutcome);