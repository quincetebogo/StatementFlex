import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';

/**
 * This component shows the payshap landing page.
 *
 * Events Raised 
 * -------------
 * back
 * 
 * @export
 * @class PayShapLanding
 * @extends {Component}
 */

export class PayShapLanding extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.payShapLandingDetails = {};
		this.institutionsList = [];
		this.filteredInstitutions = [];
		this.showUpdateModal = false;
		this.optInInsights = false;
		this.defaultInstitute = false;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			payShapLandingDetails: { type: Object },
			verifiedCellphoneNumber: { type: String },
			getInstitutions: { type: Object },

			institutionsList: { state: true },
			optInInsights: { state: true },
			defaultInstitute: { state: true },

			filteredInstitutions: { state: true },

			showUpdateModal: { state: true, attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._unloading();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _selectedTab(e) {
		if (e.detail.selectedIndex === 1) {
			this.institutionsList = await this.getInstitutions();
			this.filteredInstitutions = this.institutionsList;
		}
	}

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_searchTextChange(event) {
		this.filteredInstitutions = this.institutionsList;

		if (event.detail.new) {
			const searchText = event.detail.new.split(` `);

			const searchTextResult = searchText.map(key => {
				if (key !== ``) {
					return this.filteredInstitutions.filter(item => item.participantName.toLowerCase().toString().startsWith(key.toLowerCase()) ||
																	item.domains.filter(domain => domain.name.toString().toLowerCase().startsWith(key.toLowerCase())).length >= 1);
				}
				return [];
			});
			this.filteredInstitutions = Array.from(new Set([...searchTextResult.flat()]));
		}
	}

	_onUpdateClick() {
		this.dispatchEvent(new CustomEvent(`on-update`, {
			detail: {
				isCapitecBankDefault: this.payShapLandingDetails.capitecProxy.domain === `Capitec Bank`,
				defaultInstitution: this.payShapLandingDetails.capitecProxy.domain,
				verifiedCellphoneNumber: this.verifiedCellphoneNumber
			}
		}));
	}

	_acceptAgreement() {
		this.agreementAccepted = !this.agreementAccepted;
	}

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
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
				.main-title {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-shadow: none;
					border: none;
				}
				.main-title > capitec-icon {
					cursor: pointer;
				}
				capitec-tab {
					border-top: 1px solid #E1E1E1;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 0px;
				}
				capitec-tab > capitec-card {
					--theme-card-min-width: 1029px;
				}
				.main {
					height: var(--horizon-panel-height, 888px);
					width: var(--horizon-center-panel-width, 1064px);
					--theme-card-border-radius: 5px;
					--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				.details-tab {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 6px;
					--theme-container-padding-left: 16px;
					height: 688px;
				}
				.institutions-tab {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					height: 750px;
				}
				.payshap-info {
					--theme-card-min-height: 80px;
					padding: 22px 16px;
				}
				.payment-fees {
					--theme-card-min-height: 112px;
					padding: 16px;
				}
				.payment-limits {
					--theme-card-min-height: 112px;
					padding: 16px;
				}
				.payshap-info > capitec-group {
					--theme-layout-gap-spacing: 20px;
				}
				horizon-label {
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}
				horizon-label[value="Active"] {
					--horizon-label-value-color: #70AF00;
				}
				.horizon-label-payshap-info {
					width: 234px;
				}
				.horizon-label-payshap-name {
					width: 234px;
					--horizon-label-value-color: #009DE0;
				}
				.horizon-label-payment {
					width: 200px;
				}
				capitec-button-bar {
					padding: 10px 16px;
				}
				capitec-label[type="subtitle"] {
					padding-bottom: 14px;
					--theme-label-subtitle-font-weight: 600;
				}
				capitec-text-field {
					height: 48px;
					width: 383px;
					--theme-input-label-font-size: 12px;
					--theme-label-font-color: #3A3A3A;
					--theme-input-label-font-size: 14px;
					--theme-layout-gap-spacing: 5px;
					--theme-input-clear-icon-height: 0px;
					--theme-input-clear-icon-width: 0px;
				}
				.institutions-title {
					--theme-titlebar-min-height: 48px;
					--theme-label-title-font-size: 14px;
					background: #E1E1E1;
				}
				.institutions-content {
					height: auto;
					padding: 16px 16px 0px 16px;
				}
				.domain-name {
					width: 145px;
					padding-bottom: 16px;
				}
				.no-result-group {
					width: 1029px;
					margin-top: 130px;
				}
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
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
			<capitec-card class="main">
				${this._renderTitleBar()}
				<capitec-content-box noPadding>
					${this._renderPayShapContent()}
				</capitec-content-box>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="main-title">
				<capitec-icon
					data-automation-id="payshap-landing-back"
					size="medium"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="PayShap" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderPayShapContent() {
		return html`
			<capitec-tab-group @tab-select=${(e) => this._selectedTab(e)}>
				<capitec-tab label="Details" layout="vertical" halign="left">
					<capitec-content-box class="details-tab">
						${this._renderPayShapDetails()}
					</capitec-content-box>
					${this._renderPayShapDetailsFooter()}
				</capitec-tab>
				<capitec-tab label="PayShap Institutions" layout="vertical" halign="left">
					<capitec-content-box class="institutions-tab">
						${this._renderPayShapInstitutions()}
					</capitec-content-box>
				</capitec-tab>
			</capitec-tab-group>
		`;
	}

	_renderPayShapDetails() {
		return html`
			${this._renderInfo()}
			${this._renderPaymentFees()}
			${this._renderPaymentLimits()}
		`;
	}

	_renderInfo() {
		return html`
			<capitec-card class="payshap-info">
				<capitec-group layout="horizontal">
					<horizon-label class="horizon-label-payshap-name"
							label="Shap ID/Name"
							value="${this.payShapLandingDetails.capitecProxy.knownAsName}">
					</horizon-label>
					<horizon-label class="horizon-label-payshap-info"
							label="Registered Cell Number"
							value="0764575577">
					</horizon-label>
					<horizon-label class="horizon-label-payshap-info"
							label="Default Institution"
							value="${this.payShapLandingDetails.capitecProxy.domain}">
					</horizon-label>
					<horizon-label class="horizon-label-payshap-info"
							label="Status"
							value="${this.payShapLandingDetails.capitecProxy.fullProxyStatus}">
					</horizon-label>
			</capitec-card>
		`;
	}

	_renderPaymentFees() {
		return html`
			<capitec-card class="payment-fees">
				<capitec-label type="subtitle" label="Payshap Payment Fees"></capitec-label>
				<capitec-group layout="horizontal">
					${this._renderFeeDetails()}
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderFeeDetails() {
		return this.payShapLandingDetails.fees.map(item => html`
			<horizon-label class="horizon-label-payment"
					label="${formatCurrency(item.lowerBound)} - ${formatCurrency(item.upperBound)}"
					value="${formatCurrency(item.amount)}">
			</horizon-label>
		`);
	}

	_renderPaymentLimits() {
		return html`
			<capitec-card class="payment-limits">
				<capitec-label type="subtitle" label="Payment Limits"></capitec-label>
				<capitec-group layout="horizontal">
					<horizon-label class="horizon-label-payment"
							label="Daily Limit"
							value="R5 000.00">
					</horizon-label>
					<horizon-label class="horizon-label-payment"
							label="Transaction limit"
							value="R3 000.00">
					</horizon-label>
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderPayShapDetailsFooter() {
		return html`
			<capitec-button-bar align="right">
				<capitec-button 
						label="Report Fraud">
				</capitec-button>

				<capitec-button 
						type="primary"
						label="Update"
						@click="${() => this._onUpdateClick()}">
				</capitec-button>
			</capitec-button-bar>
		`;
	}

	_renderPayShapInstitutions() {
		return html`
			${this._renderSearchBar()}
			${this._renderInstitutions()}
		`;
	}

	_renderSearchBar() {
		return html`
			<capitec-text-field
					id="text-filter"
					label="Search for institution or registered domain"
					type="search"
					keyboardMode="alpha-numeric"
					@key-input="${(e) => this._searchTextChange(e)}"
					@value-change="${(e) => this._searchTextChange(e)}">
			</capitec-text-field>
		`;
	}

	_renderInstitutions() {
		return this.filteredInstitutions.length > 0
		? html`${this._renderInsitutionsList()}`
		: html`${this._renderNoResults()}`;
	}

	_renderInsitutionsList() {
		return this.filteredInstitutions.map((item) => html`
			<capitec-card>
				<capitec-title-bar label="${item.participantName}" class="institutions-title"></capitec-title-bar>
				<capitec-group 
						class="institutions-content"
						layout="horizontal"
						gap="clear"
						halign="left"
						valign="top"
						wrap>
							${this._renderDomainList(item.domains)}
				</capitec-group>
			</capitec-card>
		`);
	}

	_renderDomainList(item) {
		const domains = item;
		return domains.map((domain) => html`
			<capitec-label class="domain-name" label="${domain.name}"></capitec-label>
		`);
	}

	_renderNoResults() {
		return html`
			<capitec-group
				class="no-result-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<img
						src="platform/illustrations/history.svg"
						class="document-icon"/>
					<capitec-label
						class="no-results"
						label="No results found"
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}

}

customElements.define(`horizon-payshap-landing`, PayShapLanding);