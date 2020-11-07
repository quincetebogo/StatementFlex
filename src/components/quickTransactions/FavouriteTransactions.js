import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyCaller';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	END_CALL: 1,
	SELECT_ASSIGN_REASON: 2,
	ASSIGN: 3,
	VERIFY_NOW: 4
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
		this.disabled = false;
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
		this.unverifiedCaller = this.state.unverifiedCaller;
		this.verifiedCaller = this.state.verifiedCaller;

		switch (this.verificationStatus) {
			case `verified`: 
				this.displayToast = true;
				this.disabled = false;
				window.setTimeout(() => this._onToggleToastDisplay(), 3000);
				this._configureForVerifiedExisting();
				break;
			case `unverified`:
				this.disabled = false;
				this._configureForUnverifiedClient();
				break;
			case `failed`:
				this._configureForVerificationFailed();
				this.disabled = true;
				breaak;
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
				name: this.verifiedCaller.fullName,
				idNumber: this.verifiedCaller.idNumber,
				phoneNumber: this.verifiedCaller.incomingTelephoneNumber,
				livesIn: this.verifiedCaller.livesIn,
				languagePreference: ``,
				birthday: this.verifiedCaller.birthdate,
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
				detail:``
			}
		};

		this.horizonStore.saveState(state);
	}

	_configureForUnverifiedClient() {
		const state = { 
			miniProfile: {
				name: this.verifiedCaller.fullName,
				idNumber: this.verifiedCaller.idNumber,
				phoneNumber: this.verifiedCaller.incomingTelephoneNumber,
				livesIn: this.verifiedCaller.livesIn,
				languagePreference: ``,
				birthday: this.verifiedCaller.birthdate,
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
				detail:``
			}
		};

		this.horizonStore.saveState(state);
	}

	_configureForVerificationFailed() {
		const state = { 
			miniProfile: {
				name: this.verifiedCaller.fullName,
				idNumber: this.verifiedCaller.idNumber,
				phoneNumber: this.verifiedCaller.incomingTelephoneNumber,
				livesIn: this.verifiedCaller.livesIn,
				languagePreference: ``,
				birthday: this.verifiedCaller.birthdate,
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
				detail:``
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

			.section-heading{
				width:100%;
				box-sizing: border-box;
				height: 32px;
				width: 100%;
				border: 1px solid #E1E1E1;
				border-bottom: 0px none;
				background-color: #F7F7F7;
			}

			capitec-button-bar {
				--buttonbar-align: left;
				margin-top: 0px;
				padding-top: 0px;
			}
		
			horizon-option-button {
				height: 80px;
				width: 188px;
				box-sizing: border-box;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
				background-color: #FFFFFF;
				margin-top: 16px;

				--theme-layout-gap-spacing: 24px;
				--theme-button-default-border-width: 0px;
				--theme-button-padding-top: 14.5px;
				--theme-button-padding-bottom: 14.5px;

				--horizon-option-btn-icon-height: 26px;
				--horizon-option-btn-icon-width: 26px;
				--horizon-option-btn-text-margin-top: 3px;
				--horizon-option-btn-text-line-height: 20px;
				--horizon-option-btn-text-font-weight: 500;
				--horizon-option-btn-text-color: #545D60;
			}
			.label {
				height: 20px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
				padding-left: 24px;
				margin-top: 4px;
			}
			.documents {
				align-items: flex-start;
				display: flex;
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
				margin: 16px 16px 16px 16px;
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
			}

			capitec-group {
				--theme-layout-gap-spacing: 16px;
				height: auto;
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
		`;
	}

	_renderFavourites() {
		return html`
					<capitec-card class="card">
						<capitec-title-bar type="clear">
							<img src="/src/images/transactions/fav_icon.svg">
							<capitec-label class="favourites" label="Favourites" type="title"></capitec-label>
						</capitec-title-bar>
						${this._renderUnverifiedAlertBanner()}
						${this._renderFailedVerificationAlertBanner()}
						<div class="section-heading">
							<capitec-label class="label" label="Transact" type="strong"></capitec-label>
						</div>
						<capitec-group class="transact-group">
							<capitec-button-bar>
								<horizon-option-button .disabled="${this.disabled}"
									icon="system/debi-check${this.disabled ? `` : `-action`}" iconSize="default" label="DebiCheck">
								</horizon-option-button>
							</capitec-button-bar>
						</capitec-group>					
						<div class="section-heading">
							<capitec-label class="label" label="Cards" type="strong"></capitec-label>
						</div>
						<capitec-group class="cards-group">
							<capitec-button-bar>
								<horizon-option-button label="Stop Card" icon="system/stop-card-action" iconSize="default">
								</horizon-option-button>
								<horizon-option-button .disabled="${this.disabled}" label="Update Card Limits"
									icon="system/cards${this.disabled ? `` : `-action`}" iconSize="default">
								</horizon-option-button>
								<horizon-option-button .disabled="${this.disabled}" label="Tap to Pay"
									icon="system/contactless${this.disabled ? `` : `-action`}" iconSize="default">
								</horizon-option-button>
							</capitec-button-bar>
						</capitec-group>					
						<div class="section-heading">
							<capitec-label class="label" label="Document"></capitec-label>
						</div>
						<capitec-group class="documents-group documents">
							<capitec-button-bar>
								<horizon-option-button .disabled="${this.disabled}" label="Statements"
									icon="system/documents${this.disabled ? `` : `-action`}" iconSize="default">
								</horizon-option-button>
								<horizon-option-button .disabled="${this.disabled}" label="Tax Certificate"
									icon="system/sars${this.disabled ? `` : `-action`}" iconSize="default">
								</horizon-option-button>
								<horizon-option-button .disabled="${this.disabled}" label="Proof of Account"
									icon="system/documents${this.disabled ? `` : `-action`}" iconSize="default">
								</horizon-option-button>
							</capitec-button-bar>
						</capitec-group>
					</capitec-card>
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

	_renderUnverifiedAlertBanner() {
		if (this.verificationStatus === `unverified`) {
			return html`
				<capitec-alert-banner 					
					class="banner" 
					type="warning">
					<capitec-group id="id-notify-banner-group" layout="horizontal">
						<capitec-label id="id-notify-client-warning" label="Notify client: "></capitec-label> 
						<capitec-label id = "id-notify-client-warning-msg" label="We need to verify your details before doing any transactions on your account."></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-hyperlink id="id-verify-now-warning-link" label="Verify Now" @click="${() => this._onVerifyNowClick()}"></capitec-hyperlink>
					</capitec-group>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderFailedVerificationAlertBanner() {
		if (this.verificationStatus === `failed`) {
			return html`
				<capitec-alert-banner 
					class="banner" 
					type="unsuccessful-red"
					label="Notify client: I'm not able to access your account since you couldn't be verified. If it's an urgent matter please visit a branch, or you can call again after 24 hours.">
				</capitec-alert-banner>
				</capitec-alert-banner>
			`;
		}
		return html``;
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