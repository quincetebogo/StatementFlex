import { Component, css, html } from 'platform/elements'; 


/**
 * The Horizon Value Added Services dialog is used to seek permission to access client data.
 * 
 * Event Raised
 * -------------
 * cancel
 * accept
 * 
 * @export
 * @class ValueAddedServices
 * @extends {Component}
 */

export class ValueAddedServices extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();
		this.optOutInsights = false;
		this.optOutBehaviouralMarketing = false;
		this.statusVAS = {};
		this.alertBannerMessage = ``;
		this.updateValueAddedServicesCallback = null;
	}

	
	// --------------
	// PROPERTIES
	// -----------

	/**
	 * @property {String} statusVAS - value of the statusVAS
	 *
	 * @readonly
	 * @static
	 * @memberof AddCallerDetails
	 */
	 static get properties() {
		return {
			statusVAS: { type: Object },
			updateValueAddedServicesCallback: { type: Object },
			cifnumber: {type : String },
			alertBannerMessage: { state: true },
			optOutInsights: { state: true },
			optOutBehaviouralMarketing: { state: true }
		};
	}
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.capitecEntityId = this.statusVAS.capitecEntityId;
		this.optOutInsights = this.statusVAS.insights;
		this.optOutBehaviouralMarketing = this.statusVAS.marketing;
		this.cifnumber = this.statusVAS.cifNumber;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleValue(e, value) {
		this.alertBannerMessage = ``;
		
		const insights = () => this._insightsStatusChanged(value);
		const behavioural = () => this._behavioralStatusChanged(value);

		const toggleSwitched = {
			'insights': insights,
			'behavioural': behavioural
		};

		toggleSwitched[e.currentTarget.id]();
	}

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	async _accept() {
		const valueAddedServices = {
			capitecEntityId: this.capitecEntityId,
			cifnumber: this.cifnumber,
			optOutInsights: this.optOutInsights,
			optOutBehaviouralMarketing: this.optOutBehaviouralMarketing
			
		};

		if (await this.updateValueAddedServicesCallback(valueAddedServices)) {
			this.dispatchEvent(new CustomEvent(`accept`, { detail: { valueAddedServices: valueAddedServices } }));
			return;
		}

		this.alertBannerMessage = `System error. Please try again.`;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_insightsStatusChanged(value) {
		this.optOutInsights = value;
	}

	_behavioralStatusChanged(value) {
		this.optOutBehaviouralMarketing = value;
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// N/A

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-left: 16px;
				}

				horizon-alert-banner[type="info"] {
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-toast-padding: 14px 16px 14px 0px;
					--theme-toast-icon-margin: 16px 12px 0px 16px;
				}

				horizon-alert-banner[type="warning"] {
					--theme-toast-padding: 11px 16px 11px 0px;
					--theme-toast-icon-margin: 8px 9px 0px 15px;
					--theme-alert-banner-warning-font-color: #3A3A3A;
					--theme-toast-width: 850px;
				}

				capitec-label[type="title"] {
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
					--theme-layout-gap-spacing: 6px;
				}

				.main-container {
					height: 600px;
					width: 700px;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-top: 15px;
					--theme-container-padding-right: 17px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					--theme-layout-gap-spacing: 16px;
				}

				.alert-message {
					margin: 0px;
					width: 550px;
				}

				.permission-alert {
					width: 650px;
				}

				.header-label {
					margin-top: 16px;
					font-size: 18px;
					font-weight: 600;
				}

				.communication-message {
					margin: 0px 0px 12px 0px;
					line-height: 20px;
					font-size: 13px;
					width: 650px;
				}

				.permission-group {
					height: 64px;
					width: 500px;
					padding: 8px 16px;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					align-items: center;

					--theme-layout-gap-spacing: 0px;
				}

				.final-permission-group {
					margin-top: 10px;
					height: 112px;
					padding: 8px 16px;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					align-items: center;

					--theme-layout-gap-spacing: 0px;
				}

				.permission-message {
					margin: 0px 15px 0px 0px;
					width: 450px;
					font-size: 12px;
				}
			`
		];
	}

	
	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Data privacy consent management">
				<div slot="body">
					<capitec-content-box class="main-container">
						${this._renderErrorAlertBanner()}
						${this._renderAlertBanner()}
						${this._renderPermissions()}
					</capitec-content-box>
				</div>
				<div slot="footer" class="footer-class">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderErrorAlertBanner() {
		return this.alertBannerMessage
			? html`
				<horizon-alert-banner
						data-automation-id="value-added-services-alert-banner"
						type="error" 
						label="${this.alertBannerMessage}">
				</horizon-alert-banner>`
			: html``;
	}

	_renderAlertBanner() {
		return html`
			<horizon-alert-banner
				type="info"
				layout="vertical">
					<strong>Note:</strong>
					<section class="alert-message">If a client indicates they want to opt out of a specific service, the impact of their decision must be explained to them to ensure they make an informed decision.</section>
			</horizon-alert-banner>
		`;
	}

	_renderPermissions() {
		return html`
			<capitec-label type="title" label="Personalised automated communications"></capitec-label>

			<p class="communication-message">To assist you with protecting your personal information we take ownership in analysing your personal information and the usage of your account to improve your financial life. Please confirm if we may continue to process your personal information for the following reasons:</p>
			${this._renderPermissionList()}
		`;
	}

	_renderPermissionList() {
		return html`
			${this._renderInsights()}
			${this._renderBehavioral()}
		`;
	}


_renderInsights() {
	return html`
			<capitec-group gap="none">
			<capitec-title-bar>
			<capitec-group layout="horizontal">
			<p class="permission-message">May we analyse the type of transactions you perform to provide you with personalised offers to improve existing and create new products that could benefit you? <strong>(personalised offers)</strong></p>
			<capitec-radio-group layout="horizontal" >
			<capitec-radio 
							id="insights"
							label="Yes"
							@value-change="${(e) => this._toggleValue(e, true)}"
							?checked = "${this.optOutInsights}">
						</capitec-radio>
						<capitec-radio
						id="insights"
						label="No"
							@value-change="${(e) => this._toggleValue(e, false)}"
							?checked = "${!this.optOutInsights}">
						</capitec-radio>
						</capitec-radio-group>
						
						</capitec-group>
						</capitec-title-bar>
						${this._renderInsightsAlert()}
						</capitec-group>
	`;
}


	_renderInsightsAlert() {
		return !this.optOutInsights
		? html`
			<horizon-alert-banner 
				data-automation-id="value-added-services-insights-alert-banner"
				type="warning"
				label="Notify client: We will no longer give you personalised information on products and services that may help you to improve your financial life.">
			</horizon-alert-banner>`
		: html``;
	}

	_renderBehavioral() {
		return html`
				<capitec-group gap="none">
				<capitec-title-bar>
				<capitec-group layout="horizontal">
				<p class="permission-message">Receive the latest offers and products by means of electronic communication <br><strong>(direct marketing)</strong> </p>
				<capitec-radio-group layout="horizontal" >
				<capitec-radio 
								id="behavioural"
								label="Yes"
								@value-change="${(e) => this._toggleValue(e, true)}"
								?checked = "${this.optOutBehaviouralMarketing}">
							</capitec-radio>
							<capitec-radio
							id="behavioural"
							label="No"
								@value-change="${(e) => this._toggleValue(e, false)}"
								?checked = "${!this.optOutBehaviouralMarketing}">
							</capitec-radio>
							</capitec-radio-group>
							</capitec-group>
							</capitec-title-bar>
							${this._renderBehavioralAlert()}
							</capitec-group>
		`;
	}

	_renderBehavioralAlert() {
		return !this.optOutBehaviouralMarketing
		? html`
			<horizon-alert-banner 
				data-automation-id="value-added-services-behavioral-alert-banner"
				type="warning"
				label="Notify client: We will no longer give you personalised information on products and services that may help you to improve your financial life.">
			</horizon-alert-banner>`
		: html``;
	}
	
	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">

				<capitec-button
					data-automation-id="value-added-services-cancel"
					label="Cancel"
					@click="${() => this._cancel()}">
				</capitec-button>

				<capitec-button
					data-automation-id="value-added-services-accept"
					type="primary" 
					label="Accept"
					@click="${() => this._accept()}">
				</capitec-button>

			</capitec-group>
		`;
	}
}

customElements.define(`capitec-pc-value-added-services`, ValueAddedServices);