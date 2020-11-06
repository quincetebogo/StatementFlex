import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';
import { isDisabled } from '../../utils/channelServiceUtilities';

// Unverified client screen
export class TransactionFavourites extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		console.log(`TransactionFavourites - constructor`);

		this.clientType = ``;
		this.cardOptions = [];
		this.cardOptionSelected = ``;
		this.documentsOptions = [];
		this.documentsOptionsSelected = ``;
		this.clientVerified = ``;
		this.displayMode = ``;
		this.disabled = false;

		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.state = this.horizonStore.recoverState();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			clientType: { type: String },
			cardOptions: { type: Array },
			cardOptionSelected: { type: String },
			documentsOptions: { type: Array },
			documentsOptionsSelected: { type: String },
			displayMode: { type: String },
			disabled: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		console.log(`TransactionFavourites - connectedCallback`);

		this.incomingCallDetails = this.state.incomingCallDetails;
		this.unverifiedCaller = this.state.unverifiedCaller;
		this.verifiedCaller = this.state.verifiedCaller;

		this.displayMode === `client-unverified` ? this.disabled = true : this.disabled = false;

		this._configureForVerifiedExisting();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_configureForVerifiedExisting() {
		this.state.miniProfile = {
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
		};

		this.state.leftBarButtonConfig = {
			hasFavourites: true,
			subtitle: {
				savingsAccount: ``,
				savingsPlan: ``,
				insure: ``,
				credit: ``
			},
			detail: {
				savingsAccount: ``,
				savingsPlan: ``,
				insure: ``,
				credit: ``
			}
		};

		this.horizonStore.saveState(this.state);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

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

			.transact-section{
				width:100%;
				box-sizing: border-box;
				height: 32px;
				width: 100%;
				border: 1px solid #E1E1E1;
				background-color: #F7F7F7;
			
			}

			.cards-section {
				width: 100%;
				box-sizing: border-box;
				height: 32px;
				width: 100%x;
				border: 1px solid #E1E1E1;
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
			#label {
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
			.documents-section {
				box-sizing: border-box;
				height: 32px;
				border: 1px solid #E1E1E1;
				background-color: #F7F7F7;
			}
			.documents {
				align-items: flex-start;
				display: flex;
			}
			capitec-group {
				--theme-layout-gap-spacing: 16px;
				height: auto;
			}
			capitec-alert-banner {
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-info-border: none;
				--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
				--theme-alert-banner-icon-margin-left: 15px;
				--theme-alert-banner-icon-margin-right: 7px;
				--theme-alert-banner-unsuccessful-red-border: none;
				margin: 16px;
				color: rgb(200, 59, 55);
				font-size: 14px;

				background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
			}

			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {

		return html`
					<capitec-card class="card">
						<capitec-title-bar class="title-bar" type="clear">
							<img src="../images/transactions/fav_icon.svg">
							<capitec-label label="Favourites" type="title"></capitec-label>
							<capitec-spacer></capitec-spacer>
						</capitec-title-bar>
						${this._renderAlertBanner()}
						<div class="transact-section">
							<capitec-label id="label" label="Transact" type="strong"></capitec-label>
						</div>
						<capitec-group class="transact-group">
							<capitec-button-bar>
								<horizon-option-button .disabled="${this.disabled}" icon="system/debi-check${this.disabled ? `` : `-action`}" iconSize="default" label="DebiCheck">
								</horizon-option-button>
							</capitec-button-bar>
						</capitec-group>
					
						<div class="cards-section">
							<capitec-label id="label" label="Cards" type="strong"></capitec-label>
						</div>
						<capitec-group class="cards-group">
							<capitec-button-bar>
								<horizon-option-button label="Stop Card" icon="system/stop-card-action" iconSize="default"></horizon-option-button>
								<horizon-option-button .disabled="${this.disabled}" label="Update Card Limits" icon="system/cards${this.disabled ? `` : `-action`}" iconSize="default"></horizon-option-button>
								<horizon-option-button .disabled="${this.disabled}" label="Tap to Pay" icon="system/contactless${this.disabled ? `` : `-action`}" iconSize="default"></horizon-option-button>
							</capitec-button-bar>
						</capitec-group>
					
						<div class="documents-section">
							<capitec-label id="label" label="Documents"></capitec-label>
						</div>
						<capitec-group class="documents-group" class="documents">
							<capitec-button-bar>
								<horizon-option-button .disabled="${this.disabled}" label="Statements" icon="system/documents${this.disabled ? `` : `-action`}" iconSize="default"></horizon-option-button>
								<horizon-option-button .disabled="${this.disabled}" label="Tax Certificate" icon="system/sars${this.disabled ? `` : `-action`}" iconSize="default"></horizon-option-button>
								<horizon-option-button .disabled="${this.disabled}" label="Proof of Account" icon="system/documents${this.disabled ? `` : `-action`}" iconSize="default"></horizon-option-button>
							</capitec-button-bar>
						</capitec-group>
					</capitec-card>
						`;
	}

	_renderAlertBanner() {
		if (this.disabled) {
			return html`
				<capitec-group layout="vertical" 
								halign="stretch" 
								valign="top"
								gap="clear">
					<capitec-alert-banner type="error-trans">
							Notify client: I’m not able to access your account since you couldn’t be verified. If it's an urgent matter please visit a branch, or you can call again after 24 hours.
					</capitec-alert-banner>
				</capitec-group>
			`;
		}
		else {
			return html``;
		}
	}
}

customElements.define(`horizon-favourites-transations`, TransactionFavourites);