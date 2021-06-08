import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/utils/channelServiceUtilities';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/CardArt';

const RENDER_MODE = {
	LIMITS: 1,
	AGGREMENT: 2
};

const UPDATE_LIMIT_STEPS = [
	{
		title: `Update Limits`
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
 * cancel
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
				permanentCashAmountLimit: ``,
				permanentPurchaseAmountLimit: ``,
				permanentCnpAmountLimit: ``
			},
			debit: {
				permanentCashAmountLimit: ``,
				permanentPurchaseAmountLimit: ``,
				permanentCnpAmountLimit: ``
			}
		};
		this.maxValue = ``;

		this.primaryPermanentLimits;
		this.primaryTemporaryLimits;

		this.supplementaryPermanentLimits;
		this.supplemtaryTemporaryLimits;

		this.totalPermanentLimits;
		this.totalTemporaryLimits;

		this.limitLabel = ``;
		this.limitsAgreementExpanded = true;
		this.tapToPayAgreementExpanded = false;
		
		this.horizonStore = HorizonStore.getInstance();
		
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
			cardLimits: { type: Object },
			updateType: { type: String },

			primaryPermanentLimits: { type: Number },
			primaryTemporaryLimits: { type: Number },

			supplementaryPermanentLimits: { type: Number },
			supplemtaryTemporaryLimits: { type: Number },

			totalPermanentLimits: { type: Number },
			totalTemporaryLimits: { stype: Number },

			limitLabel: { type: String },
			limitsAgreementExpanded: { type: Boolean },
			tapToPayAgreementExpanded: { type: Boolean },

			renderMode: { attribute: false },
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_limitChanged(e, transactionType, maxLimit) {

		if (e.detail.new) {
			this.cardLimits[e.currentTarget.id] = this._formatAmount(e.detail.new);

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
		if (e.detail.new && this.cardlimitsInfo.tapToPayEnabled) {
			this.limitsAgreementExpanded = !this.limitsAgreementExpanded;
			this.tapToPayAgreementExpanded = !this.tapToPayAgreementExpanded;
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
		this.cardlimitsInfo = {
			tapToPayEnabled: false,
			acceptedLimitsAgreement: false,
			acceptedTapToPayAgreement: false
		};

		// TO DO : limitLabel to be loaded dynamically depending on update type once we get proper value in Update type
		this.limitLabel = this.updateType === "Credit card" ? "Credit Limits" : "Debit limits" ;

		let limitObj = this.cardLimits;

		this.primaryPermanentLimits = limitObj.permanentCashAmountLimit + limitObj.permanentCnpAmountLimit + limitObj.permanentPurchaseAmountLimit;
		this.supplementaryPermanentLimits = limitObj.permanentCashAmountLimit + limitObj.permanentCnpAmountLimit + limitObj.permanentPurchaseAmountLimit;
		this.totalPermanentLimits = this.primaryPermanentLimits + this.supplementaryPermanentLimits;

		this.primaryTemporaryLimits = limitObj.tempCashAmountLimit + limitObj.tempCnpAmountLimit + limitObj.tempPurchaseAmountLimit;
		this.supplementaryTemporaryLimits = limitObj.tempCashAmountLimit + limitObj.tempCnpAmountLimit + limitObj.tempPurchaseAmountLimit;
		this.totalTemporaryLimits = this.primaryTemporaryLimits + this.supplementaryTemporaryLimits;

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
				Maximum limit for cash withdrawl is <strong>${formatCurrency(this.maxValue)}</strong>
			</div>
		`;
	}

	_getFieldError(value) {
		return !value ? `` : `Max limit - ${formatCurrency(value)}`;
	}

	_formatAmount(value) {
		const amount = parseFloat(value).toFixed(2);
		return `${amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
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
			.cardArt {
				width: var(--horizon-card-art-width, 328px);
				height: var(--horizon-card-art-height, 304px);
				box-sizing: border-box;
				--theme-card-box-shadow: none;
				--theme-card-border: 1px solid #E1E1E1;
				--theme-card-border-radius: 4px;
			}
			.dailyLimitsEx {
				--theme-titlebar-padding: 0px;
				height: 99px;
			}
			.dailyExTitle {
				--theme-label-font-color: #3A3A3A;
				margin-left: 12px;
				margin-top: 12px;
				--theme-label-font-size: 16px;
				line-height: 20px;
			}
			.limitTitle {
				--theme-label-font-color: #3A3A3A;
				--theme-label-font-size: 14px;
				height: 20px;
			}
			.limitSubtitle {
				--theme-label-font-color: #3A3A3A;
				--theme-label-subtitle-font-size: 12px;
				height: 12px;
			}
			.dailyLimits {
				height: 34px; 
				width: 755px; 
				margin-left: 12px; 
				margin-top: 12px; 
				margin-bottom: 16px;
			}
			.tapToPaySub {
				--theme-label-subtitle-line-height: 12px;
				--theme-label-subtitle-font-size: 12px;
				width: 150px;
				margin-bottom: 14px;
			}
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
				width: 780px;
				--theme-layout-gap-spacing: 24px;
			}
			.limits-cb {
				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 32px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 0px;
				--theme-layout-gap-spacing: 8px;
				width: 380px;
				float: right;
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
				padding-bottom: 16px;
				--theme-label-title-line-height: 24px;
				margin-bottom: 0px;
			}
			capitec-label[type="default"] {
				--theme-label-default-font-size: 15px;
				--theme-label-default-font-weight: 600;
				--theme-label-font-color: #3A3A3A;
			}
			.main-cb > capitec-card {
				--theme-layout-gap-spacing: 0px;
				--theme-card-min-height: 80px;
			}
			capitec-card > capitec-group {
				width: 100%;
				padding: 0px 16px 0px 16px;
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
				--theme-label-font-color: #3A3A3A;
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
			.card-img {
				height: 202px;
				width: 126px;
				margin-left: 110px;
			}
			.card-img-cb {
				width: 356px;
				padding-top: 31px;
			}
			.tapToPayTitle {
				height: 24px;
				width: 85px;
				font-size: 18px;
				margin: 0px;
			}
			.toggleText {
				height: 48px;
			}
			.toggleText > capitec-label {
				height: 20px;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 500;
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
			<capitec-label type="title" label="${this.limitLabel}"></capitec-label>
				<capitec-group class="renderLimits" layout="horizontal" halign="left" valign="top" gap="clear">
					${this.updateType === "Credit card" ?
					this._renderCreditLimits() :
					this._renderDebitLimits()}
				</capitec-group>
				${this._renderTapToPay()}
			`;
		}
		return html``;
	}

	_renderCard() {
		return html`
		<capitec-content-box class="card-img-cb">
		    <img class= "card-img" src="/images/cardArt/black_front_debit_40px height.svg"/>
		</capitec-content-box>
		`;
	}

	_renderCreditLimits() {
		return html`
			<capitec-card style="display: inline">
			<capitec-group layout="horizontal" halign="center" valign="top" gap="none">
				${this._renderCard()}
				<capitec-content-box class="limits-cb">
					${this._renderLimits(`credit`)}
				</capitec-content-box>
			</capitec-group>

				${this._renderAllLimits()}
			</capitec-card>
		`;
	}

	_renderDebitLimits() {
		return html`
			<capitec-card style="display: inline">
				<capitec-group layout="horizontal" halign="center" valign="top" gap="none">
					${this._renderCard()}
					<capitec-content-box class="limits-cb">
						${this._renderLimits(`debit`)}
					</capitec-content-box>
				</capitec-group>
				
				${this._renderAllLimits()}
			</capitec-card>
		`;
	}

	_renderAllLimits () {
		return html`
				<capitec-title-bar type="clear" label="" class="dailyLimitsEx">
					<capitec-label
						label="Total daily limit exposure"
						class="dailyExTitle">
					</capitec-label>
					<div class="dailyLimits">
						<div style="display: inline-block; width: 245px; height: 32px">
							<capitec-label label="Primary card limits" class="limitTitle"></capitec-label>
							<capitec-label type="subtitle" label="Permanent ${formatCurrency(this.primaryPermanentLimits)}/Temporary ${formatCurrency(this.primaryTemporaryLimits)}" class="limitSubtitle"></capitec-label>
						</div>
						<div style="display: inline-block; width: 245px; height: 32px">
							<capitec-label label="Supplementary card limits" class="limitTitle"></capitec-label>
							<capitec-label type="subtitle" label="Permanent ${formatCurrency(this.supplementaryPermanentLimits)}/Temporary ${formatCurrency(this.supplementaryTemporaryLimits)}" class="limitSubtitle"></capitec-label>
						</div>
						<div style="display: inline-block; width: 245px; height: 32px">
							<capitec-label label="Total limits" class="limitTitle"></capitec-label>
							<capitec-label type="subtitle" label="Permanent ${formatCurrency(this.totalPermanentLimits)}/Temporary ${formatCurrency(this.totalTemporaryLimits)}" class="limitSubtitle"></capitec-label>
						</div>
					</div>
				</capitec-title-bar>
		`;
	}

	_renderLimits(transactionType) {
		return html`
			<capitec-text-field
				id="permanentCashAmountLimit"
				label="Cash withdrawal (max ${formatCurrency(this.cardLimits.maxPermanentCashAmountLimit)})"
				keyboardMode="numeric"
				type="currency"
				value="${this.cardLimits.permanentCashAmountLimit}"
				error="${this._getFieldError(this.error[transactionType].permanentCashAmountLimit)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, this.cardLimits.maxPermanentCashAmountLimit)}">
			</capitec-text-field>
			<capitec-text-field
				id="permanentPurchaseAmountLimit"
				label="Card machine purchases (max ${formatCurrency(this.cardLimits.maxPermanentPurchaseAmountLimit)})"
				keyboardMode="numeric"
				type="currency"
				value="${this.cardLimits.permanentPurchaseAmountLimit}"
				error="${this._getFieldError(this.error[transactionType].permanentPurchaseAmountLimit)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, this.cardLimits.maxPermanentPurchaseAmountLimit)}">
			</capitec-text-field>
			<capitec-text-field
				id="permanentCnpAmountLimit"
				label="Online/telephone/mail purchases (max ${formatCurrency(this.cardLimits.maxPermanentCnpAmountLimit)})"
				keyboardMode="numeric"
				type="currency"
				value="${this.cardLimits.permanentCnpAmountLimit}"
				error="${this._getFieldError(this.error[transactionType].permanentCnpAmountLimit)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, this.cardLimits.maxPermanentCnpAmountLimit)}">
			</capitec-text-field>
		`;
	}

	_renderTapToPay() {
		return html`
			<capitec-label
				label="Tap to Pay"
				class="tapToPayTitle">
			</capitec-label>
			<capitec-label
				label="Total daily No-PIN limit R500"
				type="subtitle"
				class="tapToPaySub">
			</capitec-label>

			<capitec-card>
				<capitec-group layout="horizontal" class="toggleText" halign="left" valign="center" gap="none">
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
						type="strong"
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
								<capitec-label 
									label="Placeholder for agreement">
								</capitec-label>
							</capitec-content-box>
					</capitec-expander>

					<capitec-expander
						expandbuttonalignment="left"
						label="Update Card Limits"
						.expanded="${this.limitsAgreementExpanded}">
							${this._renderTermsAndConditions(`LimitsAgreement`)}
					</capitec-expander>

					${this.cardlimitsInfo.tapToPayEnabled ? html`
						<capitec-expander
							expandbuttonalignment="left"
							label="Tap To Pay"
							.expanded="${this.tapToPayAgreementExpanded}">
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