import { Component, css, html } from 'platform/elements';

/**
 * Renders card art layout and corresponding card action for stopcard/update card limits
 * 
 * ```js 
 * import 'app/components/common/CardArt';
 * ```
 * 
 * ```html
 * <horizon-card-art .card="${this.card}">
 *   <capitec-content-box slot="cardAction">
 *       Card Action for your card art has to be coded here
 *   </capitec-content-box>
 * </horizon-card-art>
 * ```
 * @prop {"True"|"False"|Boolean} disableHover This will disable hover functionality
 * 
 * @export
 * @class CardArt
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
		this.isFocused = false;
		this.selectedItem = ``;
		this._initialise();
		this.addEventListener(`mouseenter`, this._mouseEnterCardArt.bind(this));
		this.addEventListener(`mouseleave`, this._mouseLeaveCardArt.bind(this));
	}

	// ----------
	// PROPERTIES
	// ----------
	/**
	 *
	 * @property {Object} card Object contains card info
	 * @property {Boolean} disableHover Boolean value to enable/disable hover functionality
	 *
	 * @readonly
	 * @static
	 * @memberof CardArt
	 */
	static get properties() {
		return {
			card: { type: Object },
			disableHover: { type: Boolean },
			cardArtSVG: { type: String },
			context: { type: String },
			selectedItem: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		// Loads the card art svg file dynamically
		const { frameCardArt } = await this.cardArtComponents[this.card.cardArt].load();
		this.type = this.cardArtComponents[this.card.cardArt].type;
		this.cardArtSVG = frameCardArt(this.card);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_mouseEnterCardArt() {
		if (!this.isFocused && !this.disableHover) {
			this.isFocused = true;

			const cardActionGroup = this.shadowRoot.getElementById(`cardAction`);
			cardActionGroup.style.setProperty(`display`, `block`);
		}
	}

	_mouseLeaveCardArt() {
		if (this.isFocused && !this.disableHover) {
			this.isFocused = false;

			const cardActionGroup = this.shadowRoot.getElementById(`cardAction`);
			cardActionGroup.style.setProperty(`display`, `none`);
		}
	}

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
				type: `new`
			},
			DEBIT_MASTERCARD_20191118: {
				load: () => import(`app/images/cardArt/New-DebitCard`),
				type: `new`
			},
			MASTERCARD_CREDIT_20181101: {
				load: () => import(`app/images/cardArt/New-CreditCard`),
				type: `new`
			},
			MASTERCARD_CREDIT_20190605: {
				load: () => import(`app/images/cardArt/New-CreditCard`),
				type: `new`
			},
			DEBIT_MASTERCARD_VIRTUAL_20200701: {
				load: () => import(`app/images/cardArt/VirtualCard`),
				type: `new`
			},
			DEBIT_MASTERCARD_20150511: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: `old`
			},
			DEBIT_MASTERCARD_20160406: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: `old`
			},
			DEBIT_MASTERCARD_20170804: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: `old`
			},
			DEBIT_MASTERCARD_20190102: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: `old`
			},
			MASTERCARD_CREDIT_20181101: {
				load: () => import(`app/images/cardArt/Old-DebitCard`),
				type: `old`
			}
		};
	}

	_toggleChecked(event) {
		this.selectedItem = event.detail.new;

		this.card.isContactlessActivated = this.selectedItem;
		if (this.selectedItem) {
			// Navigate to tap to pay aggreement 
			console.log(`Tap to pay activated`);
		} else {
			console.log(`Tap to pay deactivated`);
		}

		event.stopPropagation();

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
				.cardArt {
					width: var(--horizon-card-art-width, 328px);
					height: var(--horizon-card-art-height, 304px);
					box-sizing: border-box;
					--theme-card-box-shadow: none;
					--theme-card-border: 1px solid #E1E1E1;
					--theme-card-border-radius: 4px;
				}
				capitec-check {
					padding: 16px 0px 0px 16px;
					margin: 0px;
					border-bottom: none;
					position: absolute;

					--theme-check-width: 24px;
					--theme-check-height: 24px;
				}
				.new-card-img-cb {
					width: inherit;
					height: 236px;
					margin-bottom: 0px;
					padding: 0px;
					background-color: #F7F7F7;
					justify-content: center;
					align-items: center;
				}
				.old-card-img-cb {
					width: auto;
					height: 236px;
					margin-bottom: 0px;
					padding: 0px;
					background-color: #F7F7F7;
					justify-content: center;
					align-items: center;
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

					--theme-label-strong-font-size: 15px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}

				/* Hide / Show */
				.hide {
					display: none;
				}
				.show {
					display: block;
				}

				slot[name="cardAction"] {
					max-width: var(--horizon-card-art-width, 328px);
					max-height: var(--horizon-card-art-height, 304px);

					display: none;
					position: absolute;
					z-index: 100;
					background-color: #FFFFFF;
				}

				.toggle-label {
					height: 20px;
					width: 21px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 20px;
					text-align: right;
					padding-right: 12px;
				}

				.toggle-group {
					display: -webkit-inline-box;
				}

				.Off {
					margin-right: 10px;
					height: 20px;
					width: 21px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 20px;
					text-align: right;
				}

				.On {
					margin-right: 6px;
					height: 20px;
					width: 21px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 20px;
					text-align: right;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="cardArt">
				${this._renderCard()}
				<slot id="cardAction" name="cardAction"></slot>
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
					${this._renderCheckBox()}
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

	_renderCheckBox() {
		if (this.context === `stop-card`) {
		return html`<capitec-check label=""></capitec-check>`;
		}
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
							   class="${this.card.isContactlessActivated === null ? `hide` : `show`}">

							   ${this._renderLabelOrToggle()}
				</capitec-group>
		`;
	}

	_renderLabelOrToggle() {
		if (this.context === `tap-to-pay`) {
			return html`
				
				<capitec-group layout="vertical"
								gap="clear"
								halign="right"
								valign="top"
								class="toggle-group">
					<capitec-label class="toggle-lable ${this.card.isContactlessActivated ? `On` : `Off`}" 
									label=${this.card.isContactlessActivated ? `On` : `Off`}
							type="default"></capitec-label>
					<capitec-toggle
							class="${this.card.isContactlessActivated ? `On` : `Off`}"
							 label="" 
							@value-changed=${(event) => this._toggleChecked(event)}
							?checked="${this.card.isContactlessActivated}"></capitec-toggle>
				</capitec-group>`;
		}
			return html`
				<capitec-label label="Tap to Pay"
									type="default">
				</capitec-label>
				<capitec-label label="${this.card.isContactlessActivated ? `On` : `Off`}"
								   type="strong">
				</capitec-label>`;
	}
}

customElements.define(`horizon-card-art`, CardArt);