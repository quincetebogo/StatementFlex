import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';

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
			documentsOptionsSelected: { type: String }
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
					
						<div class="transact-section">
							<capitec-label id="label" label="Transact" type="strong"></capitec-label>
						</div>
						<capitec-group class="transact-group">
							<capitec-button-bar>
								<horizon-option-button icon="system/debi-check-action" iconSize="default" label="DebiCheck">
								</horizon-option-button>
							</capitec-button-bar>
						</capitec-group>
					
						<div class="cards-section">
							<capitec-label id="label" label="Cards" type="strong"></capitec-label>
						</div>
						<capitec-group class="cards-group">
							<capitec-button-bar>
								<horizon-option-button label="Stop Card" icon="system/stop-card-action" iconSize="default"></horizon-option-button>
								<horizon-option-button label="Update Card Limits" icon="system/cards-action" iconSize="default"></horizon-option-button>
								<horizon-option-button label="Tap to Pay" icon="system/contactless-action" iconSize="default"></horizon-option-button>
							</capitec-button-bar>
						</capitec-group>
					
						<div class="documents-section">
							<capitec-label id="label" label="Documents"></capitec-label>
						</div>
						<capitec-group class="documents-group" class="documents">
							<capitec-button-bar>
								<horizon-option-button label="Statements" icon="system/documents-action" iconSize="default"></horizon-option-button>
								<horizon-option-button label="Tax Certificate" icon="system/sars-action" iconSize="default"></horizon-option-button>
								<horizon-option-button label="Proof of Account" icon="system/documents-action" iconSize="default"></horizon-option-button>
							</capitec-button-bar>
						</capitec-group>
					</capitec-card>
						`;
	}
}

customElements.define(`horizon-favourites-transations`, TransactionFavourites);