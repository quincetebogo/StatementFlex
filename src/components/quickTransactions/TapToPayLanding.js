import { Component, css, html } from 'platform/elements';

import 'app/components/common/CardArt';

export class TapToPayLanding extends Component {

	// --------------
	// INITIALISATION
	// --------------
	
	constructor() {
		super();

		this.primaryCards = [];
		this.supplementaryCards = [];
	}

	// ---------------
	// PROPERTIES
	// ---------------

	static get properties() {
		return {
			cards: { type: Array }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.supplementaryCards = this.cards.filter(card => card.isSupplementaryCard !== true && card.isContactlessCard === false);
		this.primaryCards = this.cards.filter(card => card.isContactlessActivated === true && card.isContactlessCard === false);
		
	}

	// -------------
	// PRIVATE METHODS
	// -------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
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
			capitec-card {
				height: 888px;
				width: 1064px;
				--theme-card-border-radius: 5px;
				--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
			}

			.content-body {
				width: 100%;
				height: 100%;
			}

			.alert-banner {
				height: 48px;
				width: 1032px;
				background-color: #DAF2F4;
			}

			capitec-alert-banner > label {
				height: 20px;
				width: 81px;
				color: #08A6B5;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
			  
			}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
				${this._renderContainer()}
			`;
	}

	_renderContainer() {
		return html`
			<capitec-card class="tap-to-pay-container">
				<capitec-title-bar>
					<capitec-icon 
						size="small"
						icon="system/arrow-left-action"
						@click="${() => this._back()}">
					</capitec-icon>
					<capitec-label label="Tap To Pay" type="title"></capitec-label>
				</capitec-title-bar>

				<capitec-content-box class="content-body">
					${this._renderTapToPayBody()}
				</capitec-content-box>

			</capitec-card>
		`;
	}

	_renderTapToPayBody() {
		return html`
			<capitec-alert-banner class="alert-banner" type="info" label="Notify Client:">
				After you switch tap to pay on, you first have to insert your card and PIN at a card machine or ATM to make it active on your card.
			</capitec-alert-banner>

			${this._renderPrimaryCards()}

			${this._renderSupplementaryCards()}
		`;
	}

	_renderPrimaryCards() {
		return html`
			<capitec-label type="title" label="Primary Cards"></capitec-label>

			<capitec-group class="primary-cards" valign="top" halign="left" gap="clear" layout="horizontal" grow="horizontal">
				${this._renderPrimaryCardArt()}
			</capitec-group>
		`;
	}

	_renderPrimaryCardArt() {
		return this.primaryCards.map((card, index) => html`
		<horizon-card-art
			id="primaryCard-widget-${index}"
			.card="${card}"
			.disableHover="${true}"
		></horizon-card-art>
		`);
	}

	_renderSupplementaryCards() {
		return html`
			<capitec-label type="title" label="Supplementary Cards"></capitec-label>

			<capitec-group class="supplementary-cards" valign="top" halign="left" gap="clear" layout="horizontal" grow="horizontal">
				${this._renderSupplementaryCardsArt()}
			</capitec-group>
		`;
	}

	_renderSupplementaryCardsArt() {
		return this.primaryCards.map((card, index) => html`
		<horizon-card-art
			id="supplementaryCard-widget-${index}"
			.card="${card}"
			.disableHover="${true}"
			context="tap-to-pay"
		></horizon-card-art>
		`);
	}
}
window.customElements.define(`horizon-tap-to-pay-landing`, TapToPayLanding);