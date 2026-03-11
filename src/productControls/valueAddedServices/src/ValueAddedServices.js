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
const CONSENT_CATEGORIES = [
  { key: 'REWARDS',label: 'Rewards and benefits',description: 'Get discounts, special offers and Live Better rewards.'},
  { key: 'SAVE', label: 'Money tips', description: 'Learn simple ways to manage and grow your money.'},
  { key: 'AIRTIME', label: 'Affordable data and devices', description: 'Deals on data, airtime and devices to help you stay connected.'},
  { key: 'CREDIT', label: 'Credit when I need it', description: 'Personalised credit offers for your needs.' },
  { key: 'SPENDING', label: 'Hassle-free payments and renewals', description: 'Send money, buy airtime, pay bills and renew license discs.' },
  { key: 'INSURE', label: 'Cover and protection', description: 'Cover options for your personal and business needs.' },
  { key: 'LOTTO', label: 'LOTTO and Powerball', description: 'How-to-play tips and reminders so you never miss a draw.' },
  { key: 'MONEY', label: 'Smarter ways to get things done', description: 'New features and tools that make everyday banking easier.' },
  { key: 'BUSINESS', label: 'Support for business goals', description: 'Solutions to help you start, grow and run your business.' },
  { key: 'NEWS', label: 'Our performance and news', description: 'Updates on results, leadership and how we’re evolving.' }
];

export class ValueAddedServices extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();
		this.optOutBehaviouralMarketing = false;
		this.statusVAS = {};
		this.alertBannerMessage = ``;
		this.updateValueAddedServicesCallback = null;
		this.updateClientInterestConsentCallback = null;
		this.marketingInterestConsent = {};
		this.selectAllConsent = false;
	}

	
	// --------------
	// PROPERTIES
	// -----------

	/**
	 * @property {String} statusVAS - value of the statusVAS
	 * @property {String} statusInterestConsent
	 * @readonly
	 * @static
	 * @memberof AddCallerDetails
	 */
	 static get properties() {
		return {
			statusVAS: { type: Object },
			statusInterestConsent: {type: Object},
			updateValueAddedServicesCallback: { type: Object },
			updateClientInterestConsentCallback: {type: Object },
			cifnumber: {type : String },
			alertBannerMessage: { state: true },
			optOutBehaviouralMarketing: { state: true },
			marketingInterestConsent: { state: true },
			selectAllConsent: { state: true },
		};
	}
	
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.capitecEntityId = this.statusVAS.capitecEntityId;
		this.optOutBehaviouralMarketing = this.statusVAS.marketing;
		this.cifnumber = this.statusVAS.cifNumber;
	}

	updated(changedProperties) {
		// Only run this if the data actually changed and isn't null
		if (changedProperties.has('statusVAS')) {
			this._initializeInterests();
		}
	}

	_initializeInterests() {
		// This helper looks at your JSON and creates a simple true/false map
		const flatten = (arr) => (arr || []).reduce((acc, item) => {
			// key = "REWARDS", value = true
			acc[item.interestType] = item.optInPreference;
			return acc;
		}, {});

		this.marketingInterestConsent = flatten(this.statusVAS.optInConsentInterestPreferences?.marketing);

		// This forces the radio buttons to re-render with the new "checked" values
		this.requestUpdate();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleValue(e, value) {
		this.alertBannerMessage = ``;
		
		const behavioural = () => this._behavioralStatusChanged(value);

		const toggleSwitched = {
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
			optOutBehaviouralMarketing: this.optOutBehaviouralMarketing
		};

		console.log('this is accept button: ', this.marketingInterestConsent);

		const clientInterestConsent = {
			cifNumber: this.cifnumber,
			optInConsentInterestPreferences : {
				marketing: this.marketingInterestConsent
			}
		};

		if(await this.updateClientInterestConsentCallback(clientInterestConsent)){
			this.dispatchEvent(new CustomEvent('accept', {detail: {clientInterestConsent: clientInterestConsent}}));
		}

		if (await this.updateValueAddedServicesCallback(valueAddedServices)) {
			this.dispatchEvent(new CustomEvent(`accept`, { detail: { valueAddedServices: valueAddedServices } }));
			return;
		}

		this.alertBannerMessage = `System error. Please try again.`;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

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

				.select-all-group {
					background-color: #F7F7F7;
					padding: 12px 16px;
					border-radius: 4px;
					margin: 12px 0px;
					border: 1px solid #E1E1E1;
				}

				.section-divider {
					border: none;
					border-top: 1px solid #E1E1E1;
					margin: 16px 0px;
				}

				.interests-container {
					margin-top: 16px;
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
			${this._renderBehavioral()}

			<div class="interests-container">
				<capitec-label type="title" label="Direct Marketing Categories"></capitec-label>
				${this._renderSelectAll()}
				<hr class="section-divider">
				${CONSENT_CATEGORIES.map(cat => this._renderConsentOption('marketing', cat.key, cat.label, cat.description))}
			</div>
		`;
	}

_renderConsentOption(type, categoryKey, label, description) {
    const consentSource = this.marketingInterestConsent;

    const isChecked = consentSource[categoryKey] === true;

    return html`
        <capitec-group gap="none">
			<capitec-title-bar>
            <capitec-group layout="horizontal">
                <p class="permission-message">
                    <strong>${label}</strong><br>
                    <span class="description">${description}</span>
                </p>
                <capitec-radio-group layout="horizontal">
                    <capitec-radio
                        name="${categoryKey}"
                        label="Yes"
                        .checked="${isChecked}" 
                        @click="${() => this._updateConsent(type, categoryKey, true)}">
                    </capitec-radio>
                    <capitec-radio
                        name="${categoryKey}"
                        label="No"
                        .checked="${!isChecked}"
                        @click="${() => this._updateConsent(type, categoryKey, false)}">
                    </capitec-radio>
                </capitec-radio-group>
            </capitec-group>
        </capitec-group>
    `;
}

	_updateConsent(type, categoryKey, newValue) {
			if (type === 'marketing') {
				// Create a new object to ensure Lit detects the change
				this.marketingInterestConsent = {
					...this.marketingInterestConsent,
					[categoryKey]: newValue
				};
			}
			// This tells the component to re-render with the new "Yes/No" selection
			this.requestUpdate();
	}

	_toggleSelectAll(value) {
		this.alertBannerMessage = ``;
		this.selectAllConsent = value;

		// Set all consent categories to the selected value
		const updatedConsent = {};
		CONSENT_CATEGORIES.forEach(cat => {
			updatedConsent[cat.key] = value;
		});

		this.marketingInterestConsent = updatedConsent;
		this.requestUpdate();
	}

	_renderSelectAll() {
		return html`
			<capitec-group gap="none" class="select-all-group">
				<capitec-title-bar>
					<capitec-group layout="horizontal">
						<p class="permission-message"><strong>Select All / Deselect All</strong></p>
						<capitec-radio-group layout="horizontal">
							<capitec-radio
								id="selectAll"
								label="Select All"
								@value-change="${() => this._toggleSelectAll(true)}"
								?checked="${this.selectAllConsent}">
							</capitec-radio>
							<capitec-radio
								id="selectAll"
								label="Deselect All"
								@value-change="${() => this._toggleSelectAll(false)}"
								?checked="${!this.selectAllConsent}">
							</capitec-radio>
						</capitec-radio-group>
					</capitec-group>
				</capitec-title-bar>
			</capitec-group>
		`;
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
