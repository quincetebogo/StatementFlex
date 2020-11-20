import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyCaller';
import 'app/components/dialogs/common/ClientNotVerified';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	END_CALL: 1,
	SELECT_ASSIGN_REASON: 2,
	ASSIGN: 3,
	VERIFY_NOW: 4,
	ALERT_MODAL: 5
};

/**
 * This component implements the Favourites Landing Page for Quick Transactions
 *
 * @export
 * @class TransactionFavourites
 * @extends {Component}
 */
export class FavouriteTransactions extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.verificationStatus = ``;
		this.disableButtons = false;
		this.displayToast = false;
		this.isReassigned = false;
		this.renderMode = RENDER_MODE.MAIN_PAGE;

		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.state = this.horizonStore.recoverState();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 *
	 * @readonly
	 * @static
	 * @memberof FavouriteTransactions
	 */
	static get properties() {
		return {
			verificationStatus: { type: String },
			clientType: { type: String },
			displayToast: { type: Boolean },
			renderMode: { type: Number }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.incomingCallDetails = this.state.incomingCallDetails;
		this.callerInformation = this.state.callerInformation;
		this.verificationStatus = this.state.callerInformation.verificationStatus;

		switch (this.verificationStatus) {
			case `verified`:
				this.displayToast = true;
				this.disableButtons = false;
				window.setTimeout(() => this._onToggleToastDisplay(), 3000);
				this._configureForVerifiedExisting();
				break;
			case `unverified`:
				this.disableButtons = true;
				this._configureForUnverifiedClient();
				break;
			case `failed`:
				this._configureForVerificationFailed();
				this.disableButtons = true;
				break;
			default:
		}

		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._onAssignIncident());
		this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._onVerifyNowClick());

		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			}
		);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_configureForVerifiedExisting() {
		const state = {
			miniProfile: {
				name: this.callerInformation.name,
				idNumber: this.callerInformation.southAfricanIDNumber,
				phoneNumber: this.callerInformation.verifiedTelephoneNumber,
				livesIn: this.callerInformation.livesIn,
				languagePreference: this.callerInformation.languagePreference,
				birthday: this.callerInformation.birthdate,
				showButtons: true,
				isConfirmed: true,
				isVerified: true,
				verificationFailed: false,
				is3rdParty: false,
				isNonClient: false
			},
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
	}

	_configureForUnverifiedClient() {
		const state = {
			miniProfile: {
				name: this.callerInformation.name,
				idNumber: this.callerInformation.southAfricanIDNumber,
				phoneNumber: this.callerInformation.verifiedTelephoneNumber,
				livesIn: this.callerInformation.livesIn,
				languagePreference: this.callerInformation.languagePreference,
				birthday: this.callerInformation.birthdate,
				showButtons: true,
				isConfirmed: true,
				isVerified: false,
				verificationFailed: false,
				is3rdParty: false,
				isNonClient: false
			},
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
	}

	_configureForVerificationFailed() {
		const state = {
			miniProfile: {
				name: this.callerInformation.name,
				idNumber: this.callerInformation.southAfricanIDNumber,
				phoneNumber: this.callerInformation.verifiedTelephoneNumber,
				livesIn: this.callerInformation.livesIn,
				languagePreference: this.callerInformation.languagePreference,
				birthday: this.callerInformation.birthdate,
				showButtons: true,
				isConfirmed: true,
				isVerified: false,
				verificationFailed: true,
				is3rdParty: false,
				isNonClient: false
			},
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
	}

	_onToggleToastDisplay() {
		this.displayToast = false;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onAssignIncident() {
		this.renderMode = RENDER_MODE.SELECT_ASSIGN_REASON;
	}

	_onVerifyNowClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	_onSkipVerification() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_debiCheck() {
		if (this.disableButtons) {
			this.renderMode = RENDER_MODE.ALERT_MODAL;
		} else {

		}
	}

	_stopCard() {

	}

	_updateCardLimits() {
		if (this.disableButtons) {
			this.renderMode = RENDER_MODE.ALERT_MODAL;
		} else {

		}
	}

	_tapToPay() {
		if (this.disableButtons) {
			this.renderMode = RENDER_MODE.ALERT_MODAL;
		} else {

		}
	}

	_statements() {
		if (this.disableButtons) {
			this.renderMode = RENDER_MODE.ALERT_MODAL;
		} else {

		}
	}

	_taxCertificate() {
		if (this.disableButtons) {
			this.renderMode = RENDER_MODE.ALERT_MODAL;
		} else {

		}
	}

	_proofOfAccount() {
		if (this.disableButtons) {
			this.renderMode = RENDER_MODE.ALERT_MODAL;
		} else {

		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			.card{
				width:100%;
				height:100%;
			}

			.favourites {
				height: 32px;
				width: 111px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 24px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 32px;
			}

			capitec-group > capitec-title-bar {
				--theme-titlebar-min-height: 32px;
				--theme-titlebar-padding: 0px 0px 0px 16px;
				--theme-type-default-background: rgb(244, 244, 244);
				--theme-label-title-font-size: 14px;
				--theme-label-title-font-weight: 600;

				border-top: 1px solid #E1E1E1;
			}

			capitec-button-bar {
				height: 120px;
				width: 100%;
				--buttonbar-align: left;
				--theme-buttonbar-padding: 16px 0px 0px 16px;
				--theme-buttonbar-item-gap: 0px;
			}
		
			horizon-option-button {
				height: 80px;
				width: 188px;
				margin-right: 16px;
			}
			
			.toast {
				position: absolute;
				top : 70px;
				left: 790px;
				height: 64px;
				width: 428px;
				border-radius: 4px;
				color: #70AF00;
				z-index: 201;
				left: calc(50.8% - 200px);
				justify-content: center;
				align-items: center;
			}

			.banner {
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-icon-margin-left: 15px;
				--theme-alert-banner-icon-margin-right: 7px;
				--theme-alert-banner-warning-border: none;
				--theme-alert-banner-unsuccessful-red-border: none;
				width: 100%;
				padding: 16px;
			}

			#id-notify-banner-group {
				width: 962px;
			}

			#id-notify-client-warning {
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
				margin-right:3px;
			}

			#id-notify-client-warning-msg {
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				letter-spacing: 0;
				line-height: 20px;
			}
			
			#id-verify-now-warning-link {
				--theme-hyperlink-color: #D4781C;
				--theme-font-family: "Hind Vadodara";
				--theme-font-weight: 600;
				text-decoration: underline;
			}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			${this._renderVerifiedToast()}
			${this._renderFavourites()}
			${this._renderEndCallSessionDialog()}
			${this._renderVerifyNowModal()}
			${this._renderAlertModal()}
		`;
	}

	_renderVerifiedToast() {
		if (this.displayToast) {
			return html`
				<capitec-toast class="toast" type="success" header="Successful" detail="Thank you, you have been verified." closable>
				</capitec-toast>`;
		}
		return html``;
	}

	_renderFavourites() {
		return html`
				<capitec-card class="card">
					<capitec-title-bar type="clear">
						<img src="/src/images/transactions/fav_icon.svg">
						<capitec-label class="favourites" label="Favourites" type="title"></capitec-label>
					</capitec-title-bar>
					<capitec-group layout="vertical" halign="left" valign="top" gap="none">
						${this._renderUnverifiedAlertBanner()}
						${this._renderFailedVerificationAlertBanner()}
						${this._renderTransactSection()}
						${this._renderCardsSection()}
						${this._renderDocumentsSections()}
					</capitec-group>
				</capitec-card>
			`;
	}

	_renderUnverifiedAlertBanner() {
		if (this.verificationStatus === `unverified`) {
			return html`
				<capitec-alert-banner class="banner" type="warning">
					<capitec-group id="id-notify-banner-group" layout="horizontal">
						<capitec-label id="id-notify-client-warning" label="Notify client: "></capitec-label>
						<capitec-label id="id-notify-client-warning-msg"
							label="We need to verify your details before doing any transactions on your account."></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-hyperlink id="id-verify-now-warning-link" label="Verify Now"
							@click="${() => this._onVerifyNowClick()}"></capitec-hyperlink>
					</capitec-group>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderFailedVerificationAlertBanner() {
		if (this.verificationStatus === `failed`) {
			return html`
				<capitec-alert-banner class="banner" type="unsuccessful-red"
					label="Notify client: I'm not able to access your account since you couldn't be verified. If it's an urgent matter please visit a branch, or you can call again after 24 hours.">
				</capitec-alert-banner>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderTransactSection() {
		return html`
				<capitec-title-bar type="default" label="Transact"></capitec-title-bar>
				<capitec-button-bar>
					<horizon-option-button badgeText="1" icon="system/debi-check-action" iconSize="default" label="DebiCheck"
						@click="${() => this._debiCheck()}">
					</horizon-option-button>
				</capitec-button-bar>
		`;
	}

	_renderCardsSection() {
		return html`
				<capitec-title-bar type="default" label="Cards"></capitec-title-bar>
				<capitec-button-bar>
					<horizon-option-button label="Stop Card" icon="system/stop-card-action" iconSize="default"
						@click="${() => this._stopCard()}">
					</horizon-option-button>
					<horizon-option-button label="Update Card Limits" icon="system/cards-action" iconSize="default"
						@click="${() => this._updateCardLimits()}">
					</horizon-option-button>
					<horizon-option-button label="Tap to Pay" icon="system/contactless-action" iconSize="default"
						@click="${() => this._tapToPay()}">
					</horizon-option-button>
				</capitec-button-bar>
		`;
	}

	_renderDocumentsSections() {
		return html`
				<capitec-title-bar type="default" label="Document"></capitec-title-bar>
				<capitec-button-bar>
					<horizon-option-button label="Statements" icon="system/documents-action" iconSize="default"
						@click="${() => this._statements()}">
					</horizon-option-button>
					<horizon-option-button label="Tax Certificate" icon="system/sars-action" iconSize="default"
						@click="${() => this._taxCertificate()}">
					</horizon-option-button>
					<horizon-option-button label="Proof of Account" icon="system/documents-action" iconSize="default"
						@click="${() => this._proofOfAccount()}">
					</horizon-option-button>
				</capitec-button-bar>
		`;
	}

	_renderEndCallSessionDialog() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session @cancel="{${() => this._onCancelEndCall()}}"
					.incomingCallDetails="${this.incomingCallDetails}" .isReassigned="${this.isReassigned}">
				</horizon-end-call-session>`;
		}
		return html``;
	}

	_renderAlertModal() {
		if (this.renderMode === RENDER_MODE.ALERT_MODAL) {
			return html`
				<horizon-client-not-verified @cancel="${() => this.renderMode = 0}" @verify-now="${() => this._onVerifyNowClick()}">
				</horizon-client-not-verified>
			`;
		}
	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`
				<horizon-verify-caller .incomingCallDetails="${this.incomingCallDetails}" @skip="${(e) => this._onSkipVerification(e)}">
				</horizon-verify-caller>`;
		}
		return html``;
	}
}

customElements.define(`horizon-favourites-transactions`, FavouriteTransactions);