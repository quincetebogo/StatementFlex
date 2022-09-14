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
		this.optOutPreAssessments = false;
		this.optOutAnalysis = false;
		this.optOutThirdParties = false;
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

			alertBannerMessage: { state: true },
			optOutInsights: { state: true },
			optOutBehaviouralMarketing: { state: true },
			optOutPreAssessments: { state: true },
			optOutAnalysis: { state: true },
			optOutThirdParties: { state: true }
		};
	}
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.capitecEntityId = this.statusVAS.capitecEntityId;
		this.optOutInsights = this.statusVAS.optOutInsights;
		this.optOutBehaviouralMarketing = this.statusVAS.optOutBehaviouralMarketing;
		this.optOutPreAssessments = this.statusVAS.optOutPreAssessments;
		this.optOutAnalysis = this.statusVAS.optOutAnalysis;
		this.optOutThirdParties = this.statusVAS.optOutThirdParties;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleValue(e) {
		this.alertBannerMessage = ``;

		const insights = () => this._insightsStatusChanged();
		const behavioural = () => this._behavioralStatusChanged();
		const preAssessment = () => this._preAssessmentStatusChanged();
		const analysis = () => this._analysisStatusChanged();
		const thirdParty = () => this._thirdPartyStatusChanged();

		const toggleSwitched = {
			'insights': insights,
			'behavioural': behavioural,
			'preAssessment': preAssessment,
			'analysis': analysis,
			'thirdParty': thirdParty
		};

		toggleSwitched[e.currentTarget.id]();
	}

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	async _accept() {
		const valueAddedServices = {
			capitecEntityId: this.capitecEntityId,
			optOutInsights: this.optOutInsights,
			optOutBehaviouralMarketing: this.optOutBehaviouralMarketing,
			optOutPreAssessments: this.optOutPreAssessments,
			optOutAnalysis: this.optOutAnalysis,
			optOutThirdParties: this.optOutThirdParties
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

	_insightsStatusChanged() {
		this.optOutInsights = !this.optOutInsights;
	}

	_behavioralStatusChanged() {
		this.optOutBehaviouralMarketing = !this.optOutBehaviouralMarketing;
	}

	_preAssessmentStatusChanged() {
		this.optOutPreAssessments = !this.optOutPreAssessments;
	}

	_analysisStatusChanged() {
		this.optOutAnalysis = !this.optOutAnalysis;
	}

	_thirdPartyStatusChanged() {
		this.optOutThirdParties = !this.optOutThirdParties;
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
					--theme-toast-detail-font-weight: 600;
					--theme-toast-width: 777px;
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

				.communication-message {
					margin: 0px 0px 12px 0px;
					line-height: 20px;
					font-size: 15px;
					width: 756px;
				}

				.permission-group {
					height: 64px;
					width: 776px;
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
					width: 689px;
					font-size: 15px;
				}
			`
		];
	}

	
	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Value Added Services">
				<div slot="body">
					<capitec-content-box class="main-container">
						${this._renderErrorAlertBanner()}
						${this._renderAlertBanner()}
						${this._renderPermissions()}
						${this._renderThirdParty()}
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
					<strong>Notify:</strong>
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
			${this._renderPreAssessment()}
			${this._renderAnalysis()}
		`;
	}

	_renderInsights() {
		return html`
			<capitec-group layout="vertical">
				<capitec-group class="permission-group" layout="horizontal">
					<p class="permission-message">We may analyse the type of transactions you perform to give you benefit in using your account to your best interest <strong>(Insights and Next Best Actions)</strong></p>

					<capitec-toggle
							id="insights"
							data-automation-id="value-added-services-insights-toggle"
							@value-change=${(e) => this._toggleValue(e)}
							?checked="${!this.optOutInsights}">
					</capitec-toggle>
				</capitec-group>
				${this._renderInsightsAlert()}
			</capitec-group>
		`;
	}

	_renderInsightsAlert() {
		return this.optOutInsights
		? html`
			<horizon-alert-banner 
				data-automation-id="value-added-services-insights-alert-banner"
				type="warning"
				label="Notify client: We will no longer give you personalised insights to bank better by paying less in fees and earning more in interest.">
			</horizon-alert-banner>`
		: html``;
	}

	_renderBehavioral() {
		return html`
			<capitec-group layout="vertical">
				<capitec-group class="permission-group" layout="horizontal">
					<p class="permission-message">We may analyse your information to provide you with personalised information relating to products and services that will benefit your needs based on how you use your account. <strong>(Behavioural/Marketing)</strong> </p>

					<capitec-toggle 
							data-automation-id="value-added-services-behavioral-toggle"
							id="behavioural"
							@value-change=${(e) => this._toggleValue(e)}
							?checked="${!this.optOutBehaviouralMarketing}">
					</capitec-toggle>
				</capitec-group>
				${this._renderBehavioralAlert()}
			</capitec-group>
		`;
	}

	_renderBehavioralAlert() {
		return this.optOutBehaviouralMarketing
		? html`
			<horizon-alert-banner 
				data-automation-id="value-added-services-behavioral-alert-banner"
				type="warning"
				label="Notify client: We will no longer give you personalised information on products and services that may help you to improve your financial life.">
			</horizon-alert-banner>`
		: html``;
	}

	_renderPreAssessment() {
		return html`
			<capitec-group layout="vertical">
				<capitec-group class="permission-group" layout="horizontal">
					<p class="permission-message">We may pre-assess you in order to give you further access to products and services, limit changes, discounts and incentives <strong>(Pre-assessments)</strong> </p>

					<capitec-toggle 
							data-automation-id="value-added-services-pre-assessment-toggle"
							id="preAssessment"
							@value-change=${(e) => this._toggleValue(e)}
							?checked="${!this.optOutPreAssessments}">
					</capitec-toggle>
				</capitec-group>
				${this._renderPreAssessmentAlert()}
			</capitec-group>
		`;
	}

	_renderPreAssessmentAlert() {
		return this.optOutPreAssessments
		? html`
			<horizon-alert-banner 
				data-automation-id="value-added-services-insights-alert-banner"
				type="warning"
				label="Notify client: We will no longer give you personalised information on increased credit offers, discounts and incentives that may save you money in order to live better.">
			</horizon-alert-banner>`
		: html``;
	}

	_renderAnalysis() {
		return html`
			<capitec-group layout="vertical">
				<capitec-group class="permission-group" layout="horizontal">
					<p class="permission-message">We may do statistical and other analysis to evaluate and improve existing and new personalised products and services to your benefit. <strong>(Analysis)</strong></p>

					<capitec-toggle 
							data-automation-id="value-added-services-analysis-toggle"
							id="analysis"
							@value-change=${(e) => this._toggleValue(e)}
							?checked="${!this.optOutAnalysis}">
					</capitec-toggle>
				</capitec-group>
				${this._renderAnalysisAlert()}
			</capitec-group>
		`;
	}

	_renderAnalysisAlert() {
		return this.optOutAnalysis
		? html`
			<horizon-alert-banner 
				data-automation-id="value-added-services-analysis-alert-banner"
				type="warning"
				label="Notify client: We will no longer use your personalised information to improve our products to suit your needs and to help you to improve your financial life.">
			</horizon-alert-banner>`
		: html``;
	}

	_renderThirdParty() {
		return html`
		<capitec-group layout="vertical">
			<capitec-label class="header-label" label="Collection and/or Sharing with Third-Parties"></capitec-label>

			<capitec-group class="final-permission-group" layout="horizontal">
				<p class="permission-message">We may process your personal information collected from or shared with our approved Third-Parties, locally and outside the country, as well as within the Capitec Group to provide you with new/improved products and services, and/or personalised offers to your benefit. Approved Third-Parties must comply with our privacy policies and applicable law.</p>

				<capitec-toggle
						data-automation-id="value-added-services-third-party-toggle"
						id="thirdParty"
						@value-change=${(e) => this._toggleValue(e)}
						?checked="${!this.optOutThirdParties}">
				</capitec-toggle>
			</capitec-group>
			${this._renderThirdPartyAlert()}
			</capitec-group>
		`;
	}

	_renderThirdPartyAlert() {
		return this.optOutThirdParties
		? html`
			<horizon-alert-banner 
				data-automation-id="value-added-services-third-party-alert-banner"
				type="warning"
				label="Notify client: We will no longer share your information with Third Parties or within the Capitec Group to provide you with new/improved products and services, and/or personalised offers that may help you to improve your financial life">
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