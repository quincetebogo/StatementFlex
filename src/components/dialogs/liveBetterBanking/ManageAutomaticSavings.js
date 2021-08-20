import { Component, css, html } from 'platform/elements';
import 'app/components/common/RadioButtonGroup';

/**
 * The Horizon Value Added Services dialog is used to seek permission to access client data.
 * 
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class ValueAddedServices
 * @extends {Component}
 */
export class ManageAutomaticSavings extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.roundUpActive=true;
		this.checked = false;
		this.alertBannerMessage = ``;
		this.roundUpCheck=false;
		this.roundupAccountActive=false;

	}

	// -----------
	// PROPERTIES
	// -----------

	/**
	 * @property {Object} statusVAS - Information about the client's current value added services
	 * @property {String} capitecEntityId - value of the capitecEntityId received from statusVAS
	 * @property {String} optOutInsights - value of the optOutInsights received from statusVAS
	 * @property {String} optOutBehaviouralMarketing - value of the optOutBehaviouralMarketing received from statusVAS
	 * @property {String} optOutPreAssessments - value of the optOutPreAssessments received from statusVAS
	 * @property {String} optOutAnalysis - value of the optOutAnalysis received from statusVAS
	 * @property {String} optOutThirdParties - value of the optOutThirdParties received from statusVAS
	 *
	 * @readonly
	 * @static
	 * @memberof AddCallerDetails
	 */
	static get properties() {
		return {
			roundUpActive : {type:Boolean},
			checked : { type: Boolean },
			alertBannerMessage : { type: String },
			roundUpActive : {type: Boolean, attribute: false},
			roundupAccountActive : {type: Boolean, attribute: false}
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.radioButtonsAvailable = [
			{ "key": `0`, "value": `R2.00` },
			{ "key": `1`, "value": `R5.00` },
			{ "key": `2`, "value": `R10.00` }
		];

	}

	disconnectedCallback() {
		super.disconnectedCallback();

	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_onValueChanged() {
		this.checked = !this.checked;
		if (this.checked) {
			this.alertBannerMessage = ``;
		}
	}


	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					--theme-modal-header-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-left: 16px;
				}

				capitec-alert-banner[type="info"] {
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-alert-banner-height: 91px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 12px;
				}

				capitec-alert-banner[type="warning"] {
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 9px;
					--theme-alert-banner-warning-font-color: #3A3A3A;
					--theme-alert-banner-height: 63px;
				}

				capitec-alert-banner[type="unsuccessful-red"] {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					--theme-layout-gap-spacing: 16px;
					--theme-alert-banner-font-weight: 600;
				}

				capitec-label[type="title"] {
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
					--theme-layout-gap-spacing: 6px;
				}

				.main-container {
					height: 754px;
					width: auto;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-top: 15px;
					--theme-container-padding-right: 17px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					--theme-layout-gap-spacing: 16px;
				}

				.alert-message {
					margin: 0px;
					width: 696px;
				}

				.permission-alert {
					width: 712px;
				}

				.header-label {
					margin-top: 16px;
					font-size: 18px;
					font-weight: 600;
				}
				
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<capitec-title-bar>
					<capitec-icon size="medium" icon=""></capitec-icon>
					<capitec-label class="header-label" label="Manage Automatic Savings"></capitec-label>
					
				</capitec-title-bar>
				<div slot="body">
					<capitec-content-box class="main-container">
					${this._renderAlertBanner()}
					<capitec-card>
						${this._renderRoundUpSaveToggle()}
						${this._renderSetRoundUpAmount()}
						${this._renderActiveRoundUpAccounts()}
					</capitec-card>
					<capitec-group>
						${this._renderInterestSweep()}
					</capitec-group>	
					</capitec-content-box>
				</div>
				<div slot="footer" class="footer-class">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderAlertBanner() {
		return html`
			<capitec-alert-banner type="info">
				<strong>Notify client:</strong>
				<p class="alert-message">Your Round-up and Interest Sweep values will always be transferred from your main savings account</p>
			</capitec-alert-banner>
		`;
	}

	_renderRoundUpSaveToggle(){
		return html`
		<capitec-group gap="clear" H-Align="left" V-Align="center" layout="horizontal">
		<capitec-image src="/images/liveBetter/AccountDetails.svg"></capitec-image>
			<capitec-label class="header-label" type="title" label="Round-up. Save a little every time you spend"></capitec-label>
			<capitec-spacer></capitec-spacer>
					<capitec-label
						style="font-weight: 600"
						label="${this.roundUpActive ? 'On': 'Off'}"
						type="default">
					</capitec-label>
			<capitec-toggle id="thirdParty">
				</capitec-toggle>
			</capitec-group>

			</capitec-group>
		`;
	}

	_renderSetRoundUpAmount(){
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">
			<capitec-label class="header-label" label="Set Round-up amount"></capitec-label>
			
			<horizon-radio-button-group
					class="radio-button"
					.radioButtonsAvailable="${this.radioButtonsAvailable}"
					@value-change="${() => this._onValueChanged()}">
			</horizon-radio-button-group>

			</capitec-group>
		`;
	}

	_renderActiveRoundUpAccounts(){
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">
			<capitec-label class="header-label" label="Active Round-up on these accounts"></capitec-label>
			<capitec-check-group>
				<capitec-check label="Main Savings Account"></capitec-check>
				<capitec-check label="My New Car"></capitec-check>
				<capitec-check label="Credit Card"></capitec-check>
			</capitec-check-group>

			</capitec-group>
		`;
	}

	_renderInterestSweep(){
		return html`
		<capitec-group gap="clear" H-Align="left" V-Align="center" layout="horizontal">
		<capitec-image src="/images/liveBetter/AccountDetails.svg"></capitec-image>
			<capitec-label class="header-label" type="title" label="Intrest Sweep. SuperCharge your interest"></capitec-label>
			<capitec-spacer></capitec-spacer>
					<capitec-label
						style="font-weight: 600"
						label="${this.roundUpActive ? 'On': 'Off'}"
						type="default">
					</capitec-label>
				<capitec-toggle id="thirdParty">
				</capitec-toggle>
		</capitec-group>
		`;
	}

	_renderRoundUpAndAccountAlert(){
		return this.roundupAccountActive
		? html`
			<capitec-alert-banner 
						data-automation-id="manage-automatic-savings-round-up-account-alert"
						type="warning">
						<strong>Notify:</strong>
				<p class="alert-message">You must choose a Round-up amount and account</p>
			</capitec-alert-banner>`
		: html``;
	}

	_renderRoundUpAlert(){
		return this.roundUpCheck
		? html`
			<capitec-alert-banner 
						data-automation-id="manage-automatic-savings-round-up-alert"
						type="warning">
						<strong>Notify:</strong>
				<p class="alert-message">You must choose an option to switch Round-up on.</p>
			</capitec-alert-banner>`
		: html``;
	}


	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">

				<capitec-button
					data-automation-id="manage-automatic-savings-cancel"
					label="Cancel"
					@click="${() => this._cancel()}">
				</capitec-button>

				<capitec-button
					data-automation-id="manage-automatic-savings-update"
					type="primary" 
					label="Update">
				</capitec-button>

			</capitec-group>
		`;
	}

}

window.customElements.define(`horizon-manage-automatic-savings`, ManageAutomaticSavings);