import { Component, css, html } from 'platform/elements';
// import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';

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
			disableHover: { 
				type: Boolean,
				attribute: `disable-hover`
			},
			context: { type: String },
			tapToPayStatus: { type: Boolean },
			cardArtSVG: { attribute: false }
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

			this._showCardAction();
		}
	}

	_mouseLeaveCardArt() {
		if (this.isFocused && !this.disableHover) {
			this.isFocused = false;

			this._hideCardAction();
		}
	}

	_toggleCheckbox(event) {
		this.card.selected = event.detail.new;

		if (this.card.selected) {
			this._showCardAction();
		} else {
			this._hideCardAction();
		}

		this.dispatchEvent(new CustomEvent(`value-change`, { 
			detail: {
				old: event.detail.old,
				new: event.detail.new,
				currentTarget: event.currentTarget
			}
		 }));
		this.requestUpdate();
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
				load: () => import(`app/images/common/cardArt/New-DebitCard`),
				type: `new`
			},
			DEBIT_MASTERCARD_20191118: {
				load: () => import(`app/images/common/cardArt/New-DebitCard`),
				type: `new`
			},
			MASTERCARD_CREDIT_20181101: {
				load: () => import(`app/images/common/cardArt/New-CreditCard`),
				type: `new`
			},
			MASTERCARD_CREDIT_20190605: {
				load: () => import(`app/images/common/cardArt/New-CreditCard`),
				type: `new`
			},
			DEBIT_MASTERCARD_VIRTUAL_20200701: {
				load: () => import(`app/images/common/cardArt/VirtualCard`),
				type: `new`
			},
			DEBIT_MASTERCARD_20150511: {
				load: () => import(`app/images/common/cardArt/Old-DebitCard`),
				type: `old`
			},
			DEBIT_MASTERCARD_20160406: {
				load: () => import(`app/images/common/cardArt/Old-DebitCard`),
				type: `old`
			},
			DEBIT_MASTERCARD_20170804: {
				load: () => import(`app/images/common/cardArt/Old-DebitCard`),
				type: `old`
			},
			DEBIT_MASTERCARD_20190102: {
				load: () => import(`app/images/common/cardArt/Old-DebitCard`),
				type: `old`
			},
			MASTERCARD_CREDIT_20181101: {
				load: () => import(`app/images/common/cardArt/Old-DebitCard`),
				type: `old`
			}
		};
	}

	_toggleChecked(event) {

		this.dispatchEvent(new CustomEvent(`toggle-agreement`, { 
			detail: {
				old: event.detail.old,
				new: event.detail.new,
				currentTarget: event.currentTarget
			}
		 }));

		event.stopPropagation();
	}

	_showCardAction() {
		const cardActionGroup = this.shadowRoot.getElementById(`cardAction`);
		cardActionGroup.style.setProperty(`display`, `block`);
	}

	_hideCardAction() {
		const cardActionGroup = this.shadowRoot.getElementById(`cardAction`);
		cardActionGroup.style.setProperty(`display`, `none`);
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
					position: relative;
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
				.card-info-group > *:first-child {
					padding-left: 16px;
				}
				.card-info-group > *:last-child {
					padding-right: 16px;
				}
				.card-info-group > capitec-group > capitec-label:last-child {
					text-align: right;
				}
				capitec-label[type="default"] {
					--theme-layout-gap-spacing: 4px;
					--theme-label-default-font-size: 12px;
					--theme-label-default-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
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
					bottom: 0;
				}

				.toggle-label {
					margin-right: 10px;
					height: 100%;
					width: 21px;
					font-size: 15px;
					color: #3A3A3A;
					font-weight: 501;
					--theme-label-line-height: 20px;
					--theme-label-default-font-family: "Hind Vadodara";
				}

				.toggle-group {
					display: -webkit-inline-box;
				}

				capitec-toggle {
					width: 48px;
				}

				.card-img-group {
					--theme-layout-gap-spacing: 0px;
				}
				.card-number {
					--horizon-label-value-font-size: 15px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-text-font-size: 12px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-align: left;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		switch (this.context) {
			case `cardArt`:
				return html`${this.cardArtSVG}`;
			default:
				return html`
					<capitec-card class="cardArt">
						${this._renderCard()}
						<slot id="cardAction" name="cardAction"></slot>
					</capitec-card>
				`;
		}
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
			return html`<capitec-check label="" @value-change="${(event) => this._toggleCheckbox(event)}"></capitec-check>`;
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
			${this._renderCardNumber()}
			<capitec-spacer></capitec-spacer>
	
			<capitec-group layout="vertical"
							gap="clear"
							halign="right"
							valign="top"
							class="${this.tapToPayStatus === null ? `hide` : `show`}">

							${this._renderLabelOrToggle()}
			</capitec-group>
		`;
	}

	_renderLabelOrToggle() {
		switch (this.context) {
			case `tap-to-pay`:
				return html`${this._renderTapToPayToggle()}`;
			case `stop-card`:
				return html``;
			default:
				return html`${this._renderTapToPayLabel()}`;
		}
	}

	_renderCardNumber() {
		return html`
			<horizon-label class="card-number"
				label="${this.card.cardDisplayName}"
				value="${this.card.maskedCardNumber}">
			</horizon-label>
		`;
	}

	_renderTapToPayToggle() {
		return html`
			<capitec-group
				layout="vertical"
				gap="clear"
				halign="right"
				valign="top"
				class="toggle-group">
					<capitec-label
						class="toggle-label ${this.tapToPayStatus ? `On` : `Off`}"
						label=${this.tapToPayStatus ? `On` : `Off`}
						type="default"
						data-automation-id="card-art-toggle-label">
					</capitec-label>
					
					<capitec-toggle
						class="${this.tapToPayStatus ? `On` : `Off`}"
						label=""
						@value-changed=${(event) => this._toggleChecked(event)}
						?checked="${this.tapToPayStatus}"
						data-automation-id="card-art-toggle-status">
					</capitec-toggle>
			</capitec-group>
		`;
	}

	_renderTapToPayLabel() {
		return html`
			<capitec-label
				label="Tap to Pay"
				type="default">
			</capitec-label>
			<capitec-label
				label="${this.tapToPayStatus ? `On` : `Off`}"
				type="strong">
			</capitec-label>
		`;
	}
}

window.customElements.define(`horizon-card-art`, CardArt);