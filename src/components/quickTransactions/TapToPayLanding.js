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
				height: 100%;
				width: var(--horizon-center-panel-width, 1064px);
				--theme-card-border-radius: 5px;
				--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
			}

			.content-body {
				width: 100%;
				height: 100%;
			}

			.alert-banner {
				--theme-alert-banner-height: 48px;
				width: 1032px;
				--theme-alert-banner-font-weight: 600;
				--theme-alert-banner-info-background-color: #DAF2F4;
				--theme-layout-gap-spacing: 18px;

			}

			capitec-alert-banner > label {
				height: 20px;
				width: 81px;
				color: #08A6B5;
				font-family: "Hind Vadodara";
				--theme-alert-banner-font-size: 14px;
				--theme-alert-banner-font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
			  
			}

			.title-label{
				margin: 0px 0px 8px 8px;
				height: 32px;
				--theme-layout-gap-spacing: 8px;
				--theme-label-title-font-size: 24px;
				--theme-label-title-font-family: "Hind Vadodara";
				--theme-label-height: 32px;
				--theme-label-width: 200px;
				--theme-label-font-color: #3E4547;
				--theme-label-title-font-weight: 600;
				--theme-label-letter-spacing: 0;
				--theme-label-line-height: 32px;
				
			}

			.alert-banner-paragraph{
				display: inline-block;
				font-weight: 500;
			}

			.primary-card-label{
				height: fit-content;
				width: 300px;
				--theme-label-title-font-size: 18px;
				--theme-label-font-color: #3E4547;
				--theme-label-title-font-family: "Hind Vadodara";
				--theme-label-title-font-weight: 600;
				--theme-label-letter-spacing: 40;
				--theme-label-line-height: 24px;
				--theme-layout-gap-spacing: 18px;
				padding-left: 8px;
			}

			.supplementary-card-label{
				height: fit-content;
				font-size: 18px;
				width: 300px;
				--theme-label-font-color: #3E4547;
				--theme-label-title-font-family: "Hind Vadodara";
				--theme-label-title-font-weight: 600;
				--theme-label-letter-spacing: 0;
				--theme-label-line-height: 24px;
				--theme-layout-gap-spacing: 18px;
				padding-left: 8px;
			}

			capitec-title-bar {
				display: -webkit-inline-box;
			}

			horizon-card-art {
				--horizon-card-art-box-shadow:none!important;
			}

			.primary-cards {
				--theme-layout-gap-spacing: 24px;
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
						icon="system/back-action"
						@click="${() => this._back()}">
					</capitec-icon>
					<capitec-label class="title-label" label="Tap to Pay" type="title"></capitec-label>
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
				<p class="alert-banner-paragraph">After you switch tap to pay on, you first have to insert your card and PIN at a card machine or ATM to make it active on your card.</p>
			</capitec-alert-banner>

			${this._renderPrimaryCards()}

			${this._renderSupplementaryCards()}
		`;
	}

	_renderPrimaryCards() {
		return html`
			<capitec-label class="primary-card-label" type="title" label="Primary cards"></capitec-label>

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
			context="tap-to-pay"
		></horizon-card-art>
		`);
	}

	_renderSupplementaryCards() {
		return html`
			<capitec-label class="supplementary-card-label" type="title" label="Supplementary cards"></capitec-label>

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