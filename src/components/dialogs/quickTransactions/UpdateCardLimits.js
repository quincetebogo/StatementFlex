import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/utils/channelServiceUtilities';

const RENDER_MODE = {
	LIMITS: 1,
	AGGREMENT: 2
};

const UPDATE_LIMIT_STEPS = [
	{
		title: `Set Limits`
	},
	{
		title: `Agreement`
	}
];

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
		this.cardlimitsInfo = {};
		this.error = {
			credit: {
				cashLimit: ``,
				purchaseLimit: ``,
				cnpLimit: ``
			},
			debit: {
				cashLimit: ``,
				purchaseLimit: ``,
				cnpLimit: ``
			}
		};
		this.maxValue = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 *
	 * @property {string} cardLimits Object has the card limits information
	 * @property {string} updateType Type of update, permament/temporary
	 *
	 * @readonly
	 * @static
	 * @memberof UpdateCardLimits
	 */
	static get properties() {
		return {
			cardLimits:{ type: Object },
			updateType: { type: String },

			renderMode: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_limitChanged(e, transactionType, maxLimit) {

		if (e.detail.new) {
			this.cardlimitsInfo[transactionType][e.currentTarget.id] = e.detail.new;

			if (Number(e.detail.new) > Number(maxLimit)) {
				this.error[transactionType][e.currentTarget.id] = maxLimit;
			} else {
				this.error[transactionType][e.currentTarget.id] = ``;
			}
			this.requestUpdate();
		}
	}

	_back() {
		this.cardlimitsInfo.acceptedLimitsAgreement = false;
		this.cardlimitsInfo.acceptedTapToPayAgreement = false;
		this.renderMode = RENDER_MODE.LIMITS;
	}

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_next() {
		if (this._getErrorsCount() > 0) {
			return;
		}
		this.renderMode = RENDER_MODE.AGGREMENT;
	}

	_agree() {
		const accepedToAgreement = this.cardlimitsInfo.tapToPayEnabled 
									? this.cardlimitsInfo.acceptedLimitsAgreement && this.cardlimitsInfo.acceptedTapToPayAgreement 
									: this.cardlimitsInfo.acceptedLimitsAgreement;
		if (accepedToAgreement) {
			// TODO: Navigate to successful screen
			// Harwired to show landing page at the moment
			this.dispatchEvent(new CustomEvent(`cancel`, {}));
		}
	}

	_toggleTapToPay(e) {
		this.cardlimitsInfo.tapToPayEnabled = e.detail.new;
		this.requestUpdate();
	}

	_toggleAgreementsAccept(e) {
		this.cardlimitsInfo[e.currentTarget.id] = e.detail.new;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		this.cardlimitsInfo = {
			credit: {},
			debit: {},
			tapToPayEnabled: false,
			acceptedLimitsAgreement: false,
			acceptedTapToPayAgreement: false
		};

		const initUpdatePermanentLimit = (info) => {
			const obj = {
				cashLimit: info.permanentCashAmountLimit,
				maxCashLimit: info.maxPermanentCashAmountLimit,
				purchaseLimit: info.permanentPurchaseAmountLimit,
				maxPurchaseLimit: info.maxPermanentPurchaseAmountLimit,
				cnpLimit: info.permanentCnpAmountLimit,
				maxCnpLimit: info.maxPermanentCnpAmountLimit
			};

			Object.assign(this.cardlimitsInfo.credit, obj);
			Object.assign(this.cardlimitsInfo.debit, obj);
		};

		const initUpdateTemporaryLimit = (info) => {
			const obj = {
				cashLimit: info.tempCashAmountLimit,
				maxCashLimit: info.maxTemporaryCashAmountLimit,
				purchaseLimit: info.tempPurchaseAmountLimit,
				maxPurchaseLimit: info.maxTemporaryPurchaseAmountLimit,
				cnpLimit: info.tempCnpAmountLimit,
				maxCnpLimit: info.maxTemporaryCnpAmountLimit
			};

			Object.assign(this.cardlimitsInfo.credit, obj);
			Object.assign(this.cardlimitsInfo.debit, obj);
		};

		return {
			'Permanent': initUpdatePermanentLimit,
			'Temporary': initUpdateTemporaryLimit
		}[this.updateType](this.cardLimits);
	}

	_getHint(value) {
		return `Max limit - R${formatCurrency(value)}`;
	}

	_getErrorsCount() {
		const debitErrors = Object.values(this.error.debit).filter(item => item !== ``);
		const creditErrors = Object.values(this.error.credit).filter(item => item !== ``);
		
		if (debitErrors.length + creditErrors.length === 1) {
			this.maxValue = debitErrors[0] || creditErrors[0];
		}

		return debitErrors.length + creditErrors.length;
	}

	_getAlertMessage() {
		
		if (this._getErrorsCount() > 1) {
			return html`
				<capitec-label
					label="Maximum limits have been exceeded"
					type="strong">
				</capitec-label>`;
		} 
		return html`
			<div>
				Maximum limit for cash withdrawl is <strong>R${formatCurrency(this.maxValue)}</strong>
			</div>
		`;
	}

	_getFieldError(value) {
		return !value ? `` : `Max limit - R${formatCurrency(value)}`;
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
				capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-layout-gap-spacing: 16px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 8px;
				}
				.alert-banner > capitec-label {
					--theme-label-default-font-size: 14px;
					--theme-label-font-color: #AC282F;
				}
				.alert-banner > capitec-label[type="default"] {
					--theme-label-default-font-weight: 600;
					--theme-label-font-color: #AC282F;
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
					--theme-input-label-font-color: #7C7C7C;
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
						.steps="${UPDATE_LIMIT_STEPS}"
						active-step-number="${this.renderMode}">
 					</capitec-stepper>

					 <capitec-content-box class="main-cb">
						${this._renderAlertBanner()}
						${this._renderSetLimits()}
						${this._renderAgreement()}
					 </capitec-content-box>
				</div>

				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderAlertBanner() {
		if (this._getErrorsCount() === 0) {
			return html``;
		}
		return html`
			<capitec-alert-banner type="unsuccessful-red">
				<capitec-group layout="horizontal" halign="left" valign="top" gap="none" class="alert-banner">
					<capitec-label
						label="Notify client: "
						type="default">
					</capitec-label>
					${this._getAlertMessage()}
				</capitec-group>
			</capitec-alert-banner>
		`;
	}

	_renderSetLimits() {
		if (this.renderMode === RENDER_MODE.LIMITS) {
			return html`
				<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
					${this._renderCreditLimits()}
					${this._renderDebitLimits()}
				</capitec-group>
				${this._renderTapToPay()}
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
					${this._renderLimits(`credit`)}
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
					${this._renderLimits(`debit`)}
				</capitec-content-box>
			</capitec-card>
		`;
	}

	_renderLimits(transactionType) {
		return html`
			<capitec-text-field
				id="cashLimit"
				label="Cash withdrawal"
				keyboardMode="numeric"
				type="currency"
				value="${this.cardlimitsInfo[transactionType].cashLimit}"
				hint="${this._getHint(this.cardlimitsInfo[transactionType].maxCashLimit)}"
				error="${this._getFieldError(this.error[transactionType].cashLimit)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, this.cardlimitsInfo[transactionType].maxCashLimit)}">
			</capitec-text-field>
			<capitec-text-field
				id="purchaseLimit"
				label="Card machine purchases"
				keyboardMode="numeric"
				type="currency"
				value="${this.cardlimitsInfo[transactionType].purchaseLimit}"
				hint="${this._getHint(this.cardlimitsInfo[transactionType].maxPurchaseLimit)}"
				error="${this._getFieldError(this.error[transactionType].purchaseLimit)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, this.cardlimitsInfo[transactionType].maxPurchaseLimit)}">
			</capitec-text-field>
			<capitec-text-field
				id="cnpLimit"
				label="Online/telephone/mail purchases"
				keyboardMode="numeric"
				type="currency"
				value="${this.cardlimitsInfo[transactionType].cnpLimit}"
				hint="${this._getHint(this.cardlimitsInfo[transactionType].maxCnpLimit)}"
				error="${this._getFieldError(this.error[transactionType].cnpLimit)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, this.cardlimitsInfo[transactionType].maxCnpLimit)}">
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
						label="${this.cardlimitsInfo.tapToPayEnabled ? `On: Pending` : `Off`}"
						type="default">
					</capitec-label>
					<capitec-toggle 
						label=""
						@value-change="${(e) => this._toggleTapToPay(e)}"
						?checked="${this.cardlimitsInfo.tapToPayEnabled}">
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
				<capitec-expander-group modeset="single">

					<capitec-expander
						expandbuttonalignment="left"
						label="View Agreement">
							<capitec-content-box class="expander-cb" halign="center" valign="center" gap="none">
								<capitec-label type
									label="Placeholder for agreement">
								</capitec-label>
							</capitec-content-box>
					</capitec-expander>

					<capitec-expander
						expandbuttonalignment="left"
						label="Update Card Limits"
						.expanded="${true}">
							${this._renderTermsAndConditions(`LimitsAgreement`)}
					</capitec-expander>

					${this.cardlimitsInfo.tapToPayEnabled ? html`
						<capitec-expander
							expandbuttonalignment="left"
							label="Tap To Pay">
								${this._renderTermsAndConditions(`TapToPayAgreement`)}
						</capitec-expander>` : html``}
				</capitec-expander-group>
			`;
		}
		return html``;
	}

	_renderTermsAndConditions(type) {
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
						id="accepted${type}"
						label="Please confirm that you agree to these terms and conditions and that your are bound by them?"
						@value-change="${(e) => this._toggleAgreementsAccept(e)}">
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