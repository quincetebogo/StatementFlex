import { Component, css, html } from 'platform/elements';
import { stringify } from 'uuid';

const RENDER_MODE = {
	LIMITS: 1,
	AGGREMENT: 2
};

/**
 * This component implements the modal for update card limits
 *
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class UpdateCardLimits
 * @extends {Component}
 */
export class UpdateCardLimits extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// private properites
		this.renderMode = RENDER_MODE.LIMITS;
		this.tapToPayStatus = false;
		this.updateLimitSteps = [
			{
				title: `Set Limits`
			},
			{
				title: `Agreement`
			}
		];
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 *
	 * @property {string} updateType Type of update, permament/temporary
	 *
	 * @readonly
	 * @static
	 * @memberof UpdateCardLimits
	 */
	static get properties() {
		return {
			updateType: { type: String },

			renderMode: { attribute: false },
			tapToPayStatus: { attribute: false }
		};
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

	_back() {
		this.renderMode = RENDER_MODE.LIMITS;
	}

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_next() {
		this.renderMode = RENDER_MODE.AGGREMENT;
	}

	_toggleTapToPay(e) {
		this.tapToPayStatus = e.detail.new;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_getStrongLabel(label) {
		return html`
			<strong>${label}</strong>
		`;
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
				capitec-modal {
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 15px 15px 16px 24px;
				}
				capitec-stepper {
					--theme-stepper-step-title-font-color: #3A3A3A;
					--theme-font-weight: 600;
				}
				.main-cb {
					height: 657px;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}
				.main-cb > capitec-group {
					--theme-layout-gap-spacing: 32px;
				}
				capitec-group > capitec-card {
					width: 376px;
					--theme-layout-gap-spacing: 24px;
				}
				.limits-cb {
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
					--theme-layout-gap-spacing: 8px;
				}
				.limits-cb > capitec-label {
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
					--theme-label-strong-font-color: #3A3A3A;
					--theme-layout-gap-spacing: 16px;
				}
				.limits-cb > capitec-text-field {
					height: 72px;

					--theme-input-hint-font-color: #3A3A3A;
				}
				capitec-label[type="title"] {
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
					--theme-label-strong-font-color: #3A3A3A;
					--theme-layout-gap-spacing: 16px;
				}
				.main-cb > capitec-card {
					--theme-layout-gap-spacing: 0px;
					--theme-card-min-height: 80px;
				}
				capitec-card > capitec-group {
					height: 48px;
					width: 100%;
					padding: 0px 16px 0px 16px;
				}
				capitec-label[type="default"] {
					--theme-label-default-font-size: 15px;
					--theme-label-default-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				capitec-toggle {
					margin-left: 8px;
				}
				capitec-title-bar {
					height: 32px;
					order: 5;
					border-top: 1px solid #E1E1E1;
					margin-bottom: 0px;

					--theme-type-clear-background: #F7F7F7;
					--theme-titlebar-min-height: 32px;
					--theme-label-font-color: #08A6B5;
					--theme-titlebar-padding: 10px;
					--theme-titlebar-item-gap: 0px;
					--theme-titlebar-shadow: none;
				}
				capitec-title-bar > capitec-icon {
					margin-right: 7.5px;

					--theme-icon-size-default: 14px;
				}
				capitec-title-bar > capitec-label[type="subtitle"] {
					--theme-label-subtitle-font-size: 12px;
					--theme-label-subtitle-font-weight: normal;
				}
				.label-bold {
					--theme-label-subtitle-font-weight: 600;
				}
				div[slot="footer"] > capitec-group {
					--theme-layout-gap-spacing: 7px;
				}
				.back-btn {
					width: 65px;
				}
				.cancel-btn {
					width: 80px;
				}
				.next-btn {
					width: 90px;
				}
				capitec-expander-group {
					width: 776px;
					
					--theme-expander-border: none;
					--theme-expander-group-container-margin-bottom: 8px;
					--theme-expander-header-height: 48px;
					/*--theme-expander-background-color: #F7F7F7;*/
				}
				capitec-expander-group > capitec-expander {
					border: 1px solid #E1E1E1;
					border-radius: 4px;

					--theme-expander-indicator-width: 12px;
					--theme-expander-indicator-height: 7px;
					--theme-expander-header-font-size: 16px;
					--theme-expander-header-font-weight: 600;
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-expander-height: 525px;
				}
				capitec-expander-group > capitec-expander:last-child {
					margin-bottom: 0px;
				}
				.expander-cb {
					background-color: #FFFFFF;
					border-top: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 9px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-layout-gap-spacing: 18px;
				}
				.agreement-lb {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
				}
				.agreement-lb > ol {
					margin: 0px;
					padding-left: 20px;
				}
				.agreement-lb > ol > li {
					padding-left: 10px;
				}
				.agreement-terms {
					justify-content: center;
					margin-top: 17px;

					--theme-card-min-height: 48px;
				}
				capitec-check {
					padding-left: 16px;

					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Update ${this.updateType} Limits">
				<div slot="body">
					<capitec-stepper
						layout="horizontal"
						.steps="${this.updateLimitSteps}"
						active-step-number="${this.renderMode}">
 					</capitec-stepper>
					 ${this._renderSetLimits()}
					 ${this._renderAgreement()}
				</div>

				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderSetLimits() {
		if (this.renderMode === RENDER_MODE.LIMITS) {
			return html`
				<capitec-content-box class="main-cb">
					<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
						${this._renderCreditLimits()}
						${this._renderDebitLimits()}
					</capitec-group>
					${this._renderTapToPay()}
				</capitec-content-box>
			`;
		}
		return html``;
	}

	_renderCreditLimits() {
		return html`
			<capitec-card>
				<capitec-content-box class="limits-cb">
					<capitec-label
						type="strong"
						label="Set credit limits">
					</capitec-label>
					${this._renderLimits()}
				</capitec-content-box>
			</capitec-card>
		`;
	}

	_renderDebitLimits() {
		return html`
			<capitec-card>
				<capitec-content-box class="limits-cb">
					<capitec-label
						type="strong"
						label="Set debit limits">
					</capitec-label>
					${this._renderLimits()}
				</capitec-content-box>
			</capitec-card>
		`;
	}

	_renderLimits() {
		return html`
			<capitec-text-field
				label="Cash withdrawal"
				hint="Max limit - R5 000">
			</capitec-text-field>
			<capitec-text-field
				label="Card machine purchases"
				hint="Max limit - R250 000">
			</capitec-text-field>
			<capitec-text-field
				label="Online/telephone/mail purchases"
				hint="Max limit - R250 000">
			</capitec-text-field>
		`;
	}

	_renderTapToPay() {
		return html`
			<capitec-label
				label="Tap to Pay"
				type="title">
			</capitec-label>

			<capitec-card>
				<capitec-group layout="horizontal" halign="left" valign="center" gap="none">
					<capitec-label
						label="Would you like to activate your Tap to Pay"
						type="default">
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label
						label="${this.tapToPayStatus ? `On: Pending` : `Off`}"
						type="default">
					</capitec-label>
					<capitec-toggle 
						label=""
						@value-change="${(e) => this._toggleTapToPay(e)}"
						?checked="${this.tapToPayStatus}">
					</capitec-toggle>
				</capitec-group>

				<capitec-title-bar type="clear" label="">
					<capitec-icon icon="status/info"></capitec-icon>
					<capitec-label
						label="Notify client: "
						type="subtitle"
						class="label-bold">
					</capitec-label>
					<capitec-label
						label="Upon activating tap to pay you will need to place the physical card inside a card machine or atm."
						type="subtitle">
					</capitec-label>
				</capitec-title-bar>
			</capitec-card>
		`;
	}

	_renderAgreement() {
		if (this.renderMode === RENDER_MODE.AGGREMENT) {
			return html`
				<capitec-content-box class="main-cb">
					<capitec-expander-group modeset="single">

						<capitec-expander
							expandbuttonalignment="left"
							label="View Agreement">
								<capitec-label type 
									label="Your content comes here.">
								</capitec-label>
						</capitec-expander>

						<capitec-expander
							expandbuttonalignment="left"
							label="Update Card Limits">
								${this._renderTermsAndConditions()}
						</capitec-expander>

						${this.tapToPayStatus ? html`
							<capitec-expander
								expandbuttonalignment="left"
								label="Tap To Pay">
									${this._renderTermsAndConditions()}
							</capitec-expander>` : html``}
					</capitec-expander-group>
				</capitec-content-box>
			`;
		}
		return html``;
	}

	_renderTermsAndConditions() {
		return html`
			<capitec-content-box class="expander-cb">
				<div class="agreement-lb">
					You acknowledge and agree that you understand and accept the terms and conditions of updating your <strong>Credit Card</strong> and/or Card-Not-Present Functionality limits, as well as your rights as a client as confirmed on this call with you.
				</div>
				<div class="agreement-lb">
					<ol>
						<li>This call recording forms the agreement between us and you as to the amendment of your original <strong>Credit Card</strong> agreement in relation to your card limits and is effective at the date of concluding this call.</li>
						<li>You are aware that it's safer to transfer funds electrically than using your card or cash, and that the card remains your liability in the event of it being[Virtual Card: compromised][Plastic Card: lost, stolen or misused].</li>
						<li>You agree that you shall have no claim or right of action arising fromany undertaking, representation or warranty not included, and agreed during this call.</li>
						<li>You declare that all the information you've given us on this call is true and correct, and that way we may, in any legal proceedings, rely on this call recording as rebuttable evidence of your acceptance of all terms and stipulations during this call. You acknowledge that a copy of the full agreement can be emailed to you on request.</li>
					</ol>
				</div>
				<capitec-card class="agreement-terms">
					<capitec-check 
						label="Please confirm that you agree to these terms and conditions and that your are bound by them?">
					</capitec-check>
				</capitec-card>
			</capitec-content-box>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" style="width: 776px;">
				<capitec-button
					class="back-btn"
					type="clear" 
					label="Back"
					@click="${() => this._back()}"
					?hidden=${this.renderMode === RENDER_MODE.LIMITS}>
				</capitec-button>

				<capitec-spacer></capitec-spacer>
				
				<capitec-button
					class="cancel-btn"
					type="clear"
					label="Cancel"
					@click="${() => this._cancel()}">
				</capitec-button>
			
				<capitec-button
					class="next-btn"
					type="primary" 
					label="Next"
					@click="${() => this._next()}"
					?hidden=${this.renderMode === RENDER_MODE.AGGREMENT}>
				</capitec-button>

				<capitec-button
					class="next-btn"
					type="primary" 
					label="Agree"
					@click="${() => this._agree()}"
					?hidden=${this.renderMode === RENDER_MODE.LIMITS}>
				</capitec-button>
			</capitec-group>
		`;
	}
}

customElements.define(`horizon-update-card-limits`, UpdateCardLimits);