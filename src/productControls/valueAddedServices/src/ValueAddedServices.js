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
	{ key: 'REWARDS', label: 'Rewards and benefits', description: 'Get discounts, special offers and Live Better rewards.' },
	{ key: 'SAVE', label: 'Money tips', description: 'Learn simple ways to manage and grow your money.' },
	{ key: 'AIRTIME', label: 'Affordable data and devices', description: 'Deals on data, airtime and devices to help you stay connected.' },
	{ key: 'CREDIT', label: 'Finance when you need it', description: 'Financial flexibility to act on what matters.' },
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
		this.consentState = {}; // Tracks explicit vs inferred/enforced/defaulted
		this.consentTimestamps = {}; // Tracks when explicit choices were made
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
			statusInterestConsent: { type: Object },
			updateValueAddedServicesCallback: { type: Object },
			updateClientInterestConsentCallback: { type: Object },
			cifnumber: { type: String },
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
		// Get the marketing consent data (it's already in object format from the API)
		const marketingData = this.statusVAS.newStatusInterestConsent?.marketing;

		// Initialize consent state and timestamps
		this.consentState = {};
		this.consentTimestamps = {};

		// If the API returns an array, convert it to object format
		if (Array.isArray(marketingData)) {
			this.marketingInterestConsent = marketingData.reduce((acc, item) => {
				acc[item.interestType] = item.optInPreference;
				// Mark API values as explicit (they came from an explicit action)
				this.consentState[item.interestType] = 'explicit';
				this.consentTimestamps[item.interestType] = item.timestamp || Date.now();
				return acc;
			}, {});
		} else {
			// If it's already an object, use it directly
			this.marketingInterestConsent = marketingData || {};
			// Mark existing values as explicit
			Object.keys(this.marketingInterestConsent).forEach(key => {
				this.consentState[key] = 'explicit';
				this.consentTimestamps[key] = Date.now();
			});
		}

		// Initialize behavioral consent state (parent)
		this.consentState.behavioral = 'explicit';
		this.consentTimestamps.behavioral = Date.now();

		// Apply inference rules
		this._applyConsentRules();

		// Update selectAllConsent based on displayed values
		const consentValues = Object.values(this.marketingInterestConsent);
		this.selectAllConsent = consentValues.length > 0 && consentValues.every(val => val === true);

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
		console.log('Accept button clicked. Marketing consent: ', this.marketingInterestConsent);

		const clientInterestConsent = {
			cifNumber: this.cifnumber,
			optInConsentInterestPreferences: {
				marketing: this.marketingInterestConsent
			}
		};

		try {
			const result = await this.updateClientInterestConsentCallback(clientInterestConsent);

			// Show success toast notification
			this.dispatchEvent(new CustomEvent('show-toast', {
				detail: {
					message: 'Your consent preferences have been updated successfully.',
					type: 'success'
				},
				bubbles: true,
				composed: true
			}));

			// Close dialog
			this.dispatchEvent(new CustomEvent('accept', {
				detail: { clientInterestConsent: clientInterestConsent }
			}));
			return;
		} catch (error) {
			console.error('Error updating consent: ', error);
			this.alertBannerMessage = `System error. Please try again.`;
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_behavioralStatusChanged(value) {
		this.optOutBehaviouralMarketing = value;

		// Rule 1: Update timestamp for this explicit action
		this.consentTimestamps.behavioral = Date.now();
		this.consentState.behavioral = 'explicit';

		// Rule 4: Downward Enforcement - if parent is opted-out, enforce interests to opted-out
		if (value === false) { // false means opted-out
			CONSENT_CATEGORIES.forEach(cat => {
				this.marketingInterestConsent[cat.key] = false;
				this.consentState[cat.key] = 'enforced';
				this.consentTimestamps[cat.key] = Date.now();
			});
		} else {
			// Parent is opted-in, apply inference for inferred interests
			this._applyUpwardInference();
		}

		this.requestUpdate();
	}

	/**
	 * Rule 1 - Most Recent Explicit Action Wins
	 * Rule 2 - Parent-Child Hierarchy (hard constraint)
	 * Rule 3 - Upward Inference
	 * Rule 4 - Downward Enforcement
	 * Rule 5 - Defaulting
	 */
	_applyConsentRules() {
		// Rule 3: Upward Inference - check if any interest is explicitly opted-in
		this._applyUpwardInference();

		// Rule 4: Downward Enforcement - enforce parent's opted-out status to children
		if (this.optOutBehaviouralMarketing === false) { // false = opted-out
			CONSENT_CATEGORIES.forEach(cat => {
				if (this.consentState[cat.key] !== 'explicit') {
					this.marketingInterestConsent[cat.key] = false;
					this.consentState[cat.key] = 'enforced';
				}
			});
		}
	}

	/**
	 * Rule 3 - Upward Inference: if any Interest is explicitly opted-in,
	 * the parent Consent is inferred opted-in. If all Interests are explicitly opted-out,
	 * the parent is inferred opted-out.
	 */
	_applyUpwardInference() {
		const explicitInterests = CONSENT_CATEGORIES.filter(cat =>
			this.consentState[cat.key] === 'explicit'
		);

		if (explicitInterests.length === 0) {
			return; // No explicit interests to infer from
		}

		const hasExplicitOptIn = explicitInterests.some(cat =>
			this.marketingInterestConsent[cat.key] === true
		);

		const allExplicitOptOut = explicitInterests.every(cat =>
			this.marketingInterestConsent[cat.key] === false
		);

		// Only apply upward inference if behavioral consent isn't explicitly set more recently
		const behavioralTimestamp = this.consentTimestamps.behavioral || 0;
		const latestInterestTimestamp = Math.max(
			...explicitInterests.map(cat => this.consentTimestamps[cat.key] || 0),
			0
		);

		// Rule 1: Only infer if no recent explicit behavioral action
		if (latestInterestTimestamp > behavioralTimestamp) {
			if (hasExplicitOptIn) {
				this.optOutBehaviouralMarketing = true; // Inferred opted-in
				this.consentState.behavioral = 'inferred';
			} else if (allExplicitOptOut) {
				this.optOutBehaviouralMarketing = false; // Inferred opted-out
				this.consentState.behavioral = 'inferred';
			}
		}
	}

	/**
	 * Rule 2 - Parent-Child Hierarchy: an Interest cannot be opted-in
	 * while its parent Consent is opted-out. This is a hard constraint.
	 */
	_isValidInterestChange(newValue) {
		// If trying to opt-in an interest while parent is opted-out, block it
		if (newValue === true && this.optOutBehaviouralMarketing === false) {
			this.alertBannerMessage = 'Cannot opt-in to marketing interests while parent consent is opted-out.';
			return false;
		}
		return true;
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
			.select-all-group capitec-toggle {
				margin: 0px 0px 0px 8px;
				width: 32px;
			}

			.select-all-group capitec-label {
				margin: 0px 0px 0px 8px;
				font-size: 13px;
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

		// Rule 2: Determine if this interest can be opted-in (parent must be opted-in)
		const isParentOptedOut = this.optOutBehaviouralMarketing === false;
		const isDisabled = isParentOptedOut;
		const enforceNote = isParentOptedOut ? ' (Parent consent required)' : '';

		return html`
        <capitec-group gap="none">
			<capitec-title-bar>
            <capitec-group layout="horizontal">
                <p class="permission-message">
                    <strong>${label}${enforceNote}</strong><br>
                    <span class="description">${description}</span>
                </p>
                <capitec-radio-group layout="horizontal" ?disabled="${isDisabled}">
                    <capitec-radio
                        name="${categoryKey}"
                        label="Yes"
                        .checked="${isChecked}"
                        ?disabled="${isDisabled}"
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
			// Rule 2: Hard constraint - cannot opt-in interest if parent is opted-out
			if (!this._isValidInterestChange(newValue)) {
				this.requestUpdate();
				return;
			}

			this.alertBannerMessage = ``; // Clear any previous messages

			// Rule 1: Mark this as an explicit action with current timestamp
			this.marketingInterestConsent = {
				...this.marketingInterestConsent,
				[categoryKey]: newValue
			};
			this.consentState[categoryKey] = 'explicit';
			this.consentTimestamps[categoryKey] = Date.now();

			// Rule 3: Apply upward inference based on new interest state
			this._applyUpwardInference();

			// Update selectAllConsent based on new values
			const allCategories = CONSENT_CATEGORIES.map(cat => cat.key);
			const allOptedIn = allCategories.every(key => this.marketingInterestConsent[key] === true);
			this.selectAllConsent = allOptedIn;
		}
		// This tells the component to re-render with the new "Yes/No" selection
		this.requestUpdate();
	}

	_toggleSelectAll(value) {
		// Rule 2: Hard constraint - cannot opt-in all if parent is opted-out
		if (!this._isValidInterestChange(value)) {
			this.requestUpdate();
			return;
		}

		this.alertBannerMessage = ``;
		this.selectAllConsent = value;

		// Rule 1: Mark this as an explicit action with current timestamp
		const currentTime = Date.now();
		const updatedConsent = {};
		CONSENT_CATEGORIES.forEach(cat => {
			updatedConsent[cat.key] = value;
			this.consentState[cat.key] = 'explicit';
			this.consentTimestamps[cat.key] = currentTime;
		});

		this.marketingInterestConsent = updatedConsent;

		// Rule 3: Apply upward inference
		this._applyUpwardInference();

		this.requestUpdate();
	}

	_renderSelectAll() {
		// Rule 2: Disable Select All when parent is opted-out
		const isParentOptedOut = this.optOutBehaviouralMarketing === false;
		const isDisabled = isParentOptedOut;

		return html`
			<capitec-group gap="none" class="select-all-group">
				<capitec-group layout="horizontal" halign="left" valign="center">
					<p class="permission-message"><strong>Select All / Deselect All</strong></p>
					<capitec-toggle
						size="small"
						?disabled="${isDisabled}"
						@value-changed="${(event) => this._toggleSelectAll(event.detail.new)}"
						?checked="${this.selectAllConsent}">
					</capitec-toggle>
				</capitec-group>
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
