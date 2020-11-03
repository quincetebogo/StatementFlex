import { Component, css, html } from 'platform/elements';

//Unverified client screen
export class TransactionFavourites extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.clientType = ``;
		this.cardOptions = [];
		this.cardOptionSelected = ``;
		this.documentsOptions = [];
		this.documentsOptionsSelected = ``;
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
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

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
			}
			::slotted(capitec-label) {
				height: 20px;
				width: 69px;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 500;
				letter-spacing: 0;
				line-height: 20px;
				text-align: center;
			}
				
			#button {
				box-sizing: border-box;
				height: 80px;
				width: 188px;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
				background-color: #FFFFFF;
				--theme-button-clear-font-color: #545D60;
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

			.icon {
				display: inline-block;
				flex-direction: column;
				align-items: center;
			}
			.debi-check-button {
				display: inline-block;
				flex-direction: column;
				align-items: center;
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
								<capitec-button id="button" class="debi-check-button" label="DebiCheck" type="clear">
									<capitec-icon class="icon" size="small" icon="system/debi-check-action"></capitec-icon>
								</capitec-button>
							</capitec-button-bar>
						</capitec-group>
					
						<div class="cards-section">
							<capitec-label id="label" label="Cards" type="strong"></capitec-label>
						</div>
						<capitec-group class="cards-group">
							<capitec-button-bar>
								<capitec-button id="button" label="Stop Card" type="clear"></capitec-button>
								<capitec-button id="button" label="Update Card Limits" type="clear"></capitec-button>
								<capitec-button id="button" label="Tap to Pay" type="clear"></capitec-button>
							</capitec-button-bar>
						</capitec-group>
					
						<div class="documents-section">
							<capitec-label id="label" label="Documents"></capitec-label>
						</div>
						<capitec-group class="documents-group" class="documents">
							<capitec-button-bar>
								<capitec-button id="button" label="Statements" type="clear"></capitec-button>
								<capitec-button id="button" label="Tax Certificate" type="clear"></capitec-button>
								<capitec-button id="button" label="Proof of Account" type="clear"></capitec-button>
							</capitec-button-bar>
						</capitec-group>
					</capitec-card>
						`;
	}
}

customElements.define(`horizon-favourites-transations`, TransactionFavourites);