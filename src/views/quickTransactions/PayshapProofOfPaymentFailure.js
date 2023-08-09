import { css, html } from 'platform/elements';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { isNullorEmpty } from '../../utils/channelServiceUtilities';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';


/**
 * Display an error/failure screen indicating the proof of payment statement has been unsuccessfully sent.
 *
 * @export
 * @class ProofOfAccountFailure
 * @extends {ViewBase}
 */
export class PayshapProofOfPaymentFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.endCallContext = `QuickTransactionsUnSuccess`;
		this.verifiedCellphoneNumber = ``;
		this.paymentRef = ``;
		this.showFailureIcon = false;
		this.notificationType = [];
		this.displayToast = true;
	}


	// ----------
	// PROPERTIES
	// ----------
	static get properties() {
		return {
			showFailureIcon: { type: Boolean },
			displayToast: { state: false }
		};
	}

	get incidentDescription() {
		return `The proof of payment was not sent to the Recipient`;
	}
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.screenDetails = this.horizonStore.getScreenDetails();
		this.mailId = this.screenDetails && this.screenDetails.emailAddress;
		this.paymentRef = this.screenDetails && this.screenDetails.debtorReference;
		this.paymentUetr = this.screenDetails && this.screenDetails.uetr;
		this.verifiedCellphoneNumber = this.screenDetails && this.screenDetails.verifiedCellphoneNumber;
		this.outcome = this.screenDetails && this.screenDetails.outcome;
		this.notificationType = this.screenDetails && this.screenDetails.notificationType;

		window.setTimeout(() => this.displayToast = false, 3000);

		this._getOutcomeDetails();
		this._updateIncidentState();

		this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP_PROOF_OF_PAYMENT_FAILURE, {});
	}

	disconnectedCallback() {
		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_PROOF_OF_PAYMENT_FAILURE, {}, true, true, false);

		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;

		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_PROOF_OF_PAYMENT_FAILURE_DONE, {
			"screen": TelemetryScreen.PAY_SHAP_PROOF_OF_PAYMENT_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_PROOF_OF_PAYMENT_FAILURE, {}, true, true, false);

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
		this.horizonStore.clearScreenDetails();
	}

	_showFailureIcon() {
		this.showFailureIcon = !this.showFailureIcon;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
		this.horizonIncidentManager.setDescription(this.incidentDescription);
	}

	_getOutcomeDetails() {
		return this.secondaryToast = `Statement not sent`;
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
		${this._renderFailureIcon()}
		${this._failedMessage()}
		</capitec-group>

		<capitec-group id="id-button-group" layout="horizontal">
				${this._renderRightButton()}
			</capitec-group>
		</capitec-group>
		`;
	}

	_renderFailureToast() {
		return this.secondaryToast  
			? html`
				<capitec-toast 
					?hidden="${!this.displayToast}"
					class="${this.toast ? `secondary-toast` : ``}"
					type="error" 
					header="Failure" 
					detail="${this.secondaryToast}"
					closable 
					@click="${() => this.displayToast = false}">
				</capitec-toast>`
		: html``;
	}

	_renderFailureIcon() {
		return html`
		<capitec-icon icon="system/close-circle-error"></capitec-icon>`;
	}

	_failedMessage() {
		const notificationMethod = `The proof of payment was not sent to `;
		if (!isNullorEmpty(this.notificationType)) {
			if (this.notificationType.length === 1) {
				return notificationMethod + this._notificationTypeId(this.notificationType[0]);
			}
			if (this.notificationType.length === 2) {
				let newStr = notificationMethod + this._notificationTypeId(this.notificationType[0]);
				newStr += ` and `;
				return newStr + this._notificationTypeId(this.notificationType[1]);
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
	
	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="payshap-proof-of-payment-failure-related-options"
				context="Failure">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-payshap-proof-of-payment-failure`, PayshapProofOfPaymentFailure);