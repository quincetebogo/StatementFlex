import { Component, css, html } from 'platform/elements';

/**
 * This component implements the card layout for stop card/ update card limits
 *
 * Events Raised 
 * -------------
 * n/a
 * 
 * @export
 * @class Card
 * @extends {Component}
 */
export class CardArt extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.type = ``;
		this.cardArtSVG = ``;

		this._initialise();
	}

	// ----------
	// PROPERTIES
	// ----------
	/**
	 *
	 * @property {Object} card Object contains card info
	 *
	 * @readonly
	 * @static
	 * @memberof UpdateCardLimits
	 */
	static get properties() {
		return {
			card: { type: Object },
			cardArtSVG: { type: String }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		//Loads the card art svg file dynamically
		let { frameCardArt } = await this.cardArtComponents[this.card.cardArt].load();
		this.type = this.cardArtComponents[this.card.cardArt].type;
		this.cardArtSVG = frameCardArt(this.card);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	// N/A

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		/**
		 * This needs a update, whenever the corresponding contract gets updated.
		 */
		this.cardArtComponents = {
			DEBIT_MASTERCARD_20190608: {
				load: () => import(`app/images/cardArt/New-DebitCard`),
				type: 'new'
			},
			DEBIT_MASTERCARD_20191118: {
				load: () => import(`app/images/cardArt/New-DebitCard`),
				type: 'new'
			},
			MASTERCARD_CREDIT_20181101: {
				load: () => import(`app/images/cardArt/New-CreditCard`),
				type: 'new'
			},
			MASTERCARD_CREDIT_20190605: {
				load: () => import(`app/images/cardArt/New-CreditCard`),
				type: 'new'
			},
			DEBIT_MASTERCARD_VIRTUAL_20200701: {
				load: () => import(`app/images/cardArt/VirtualCard`),
				type: 'new'
			},
			DEBIT_MASTERCARD_20150511: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: 'old'
			},
			DEBIT_MASTERCARD_20160406: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: 'old'
			},
			DEBIT_MASTERCARD_20170804: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: 'old'
			},
			DEBIT_MASTERCARD_20190102: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: 'old'
			},
			MASTERCARD_CREDIT_20181101: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: 'old'
			}
		};
	}

	// ---------
	// RENDERING
	// ---------	

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				/* Card Image & Info styles */
				.card{
					width: 328px;
					height: 304px;
					box-sizing: border-box;

					--theme-card-border: 1px solid #E1E1E1;
					--theme-card-border-radius: 5px;
				}
				.new-card-img-cb {
					width: inherit;
					height: 236px;
					margin-bottom: 0px;
					background-color: #F7F7F7;

					--theme-container-padding-top: 29px;
					--theme-container-padding-right: 107px;
					--theme-container-padding-bottom: 26px;
					--theme-container-padding-left: 107px;
				}
				.old-card-img-cb {
					width: inherit;
					height: 236px;
					margin-bottom: 0px;
					background-color: #F7F7F7;

					--theme-container-padding-top: 63px;
					--theme-container-padding-right: 75px;
					--theme-container-padding-bottom: 60px;
					--theme-container-padding-left: 75px;
				}
				.card-info-group {
					width: inherit;
					height: 68px;
				}
				.card-info-group > capitec-group:first-child {
					padding-left: 16px;
				}
				.card-info-group > capitec-group:last-child {
					padding-right: 16px;
				}
				.card-info-group > capitec-group > capitec-label:last-child {
					text-align: right;
				}
				capitec-label[type="default"] {
					line-height: 12px;

					--theme-layout-gap-spacing: 4px;
					--theme-label-default-font-size: 12px;
					--theme-label-default-font-weight: 500;
					--theme-label-font-color: #545D60;
				}
				capitec-label[type="strong"] {
					line-height: 20px;

					--theme-label-default-font-size: 15px;
					--theme-label-default-font-weight: 600;
					--theme-label-font-color: #3E4547;
				}

				/*UpdateLimits Button styles */
				.update-limits-btn-cb {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
					--theme-container-padding-left: 16px;

					display: none;
				}
				.update-limits-btn-group {
					--theme-layout-gap-spacing: 38px;
				}
				.update-limits-btn-group > .card-info {
					height: auto;
				}
				.update-limits-btn-group > capitec-button {
					margin-top: 8px;
					cursor: pointer;
				}
				.card-info > capitec-group > capitec-label:last-child {
					text-align: right;
				}
				.permanent-btn {
					margin: 0px;
				}
				capitec-alert-banner {
					--theme-alert-banner-font-size: 12px;
					--theme-alert-banner-height: 40px;
					--theme-alert-banner-info-border: none;
				}

				/* Hover 
				.card-img-group:hover {
					display: none;
				}

				.card-img-group:hover + .update-limits-btn-cb {
					display: block;
				}

				/* Hide / Show */
				.hide {
					display: none;
				}
				.show {
					display: block;
				}
			`
		]
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">
				${this._renderCard()}
			</capitec-card>	
		`;
	}

	_renderCard() {
		return html`
			<capitec-group layout="vertical"
							gap="line"
							halign="stretch"
							valign="top"
							class="card-img-group">
					${this._renderCardArt()}
					<capitec-group layout="horizontal"
									gap="none"
									halign="top"
									valign="center"
									class="card-info-group">
						${this._renderCardInfo()}
					</capitec-group>
			</capitec-group>
		`;
	}

	_renderCardArt() {
		return html`
				<capitec-content-box class="${this.type}-card-img-cb">
					${this.cardArtSVG}
				</capitec-content-box>
		`;
	}

	_renderCardInfo() {
		return html`
				<capitec-group layout="vertical" gap="clear" halign="left" valign="top">
					<capitec-label label="${this.card.cardDisplayName}"
								   type="default">
					</capitec-label>
					<capitec-label label="${this.card.maskedCardNumber}"
								   type="strong">
					</capitec-label>
				</capitec-group>
				
				<capitec-spacer></capitec-spacer>
				
				<capitec-group layout="vertical"
							   gap="clear"
							   halign="right"
							   valign="top"
							   class="${this.card.tapToPayStatus == null ? `hide` : `show`}">
					<capitec-label label="Tap to Pay"
								   type="default">
					</capitec-label>
					<capitec-label label="${this.card.tapToPayStatus}"
								   type="strong">
					</capitec-label>
				</capitec-group>
		`;
	}
}

customElements.define(`horizon-card-art`, CardArt);