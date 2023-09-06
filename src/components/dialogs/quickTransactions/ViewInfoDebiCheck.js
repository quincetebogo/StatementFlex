import { Component, css, html } from 'platform/elements';
import { convertCentsToRand, formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';


import 'platform/components/popups/Modal';

/**
 * The View Info Dialog invoked from the Debi-Checks display. This dialog displays details on
 * the selected debi-check mandate
 */
export class ViewInfoDebiCheck extends Component {

	// --------------
	// INITIALISATION
	// --------------
	
	constructor() {
		super();
		this.debiCheckDetails = {};
		this.callerInformation = {};
		this.isPending = false;

		this.mandateDetails = {};
		this.installmentDetails = {};
		this.dateDetails = {};
		this.creditorDetails = {};
		this.payerDetails = {};
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {object} debiCheckDetails The full details of the debi-check mandate
	 *
	 * @readonly
	 * @static
	 * @memberof ViewInfoDebiCheck
	 */
	static get properties() {
		return {
			debiCheckDetails: { type: Object },
			callerInformation: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		ineum(`page`, `View Info DebiCheck Dialog`);
		this.isPending = this.debiCheckDetails.mandateStatus === `PENDING` && this.debiCheckDetails.canBeAuthenticated;

		this._initialise();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`));
	}

	_formartDate(collectionDate) {

		const date = collectionDate instanceof Date ? collectionDate : new Date(collectionDate);

		const months = [
						`January`, `February`, `March`, `April`, `May`, `June`,
						`July`, `August`, `September`, `October`, `November`, `December`
						];
	
		return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
	}

	_decline() {
		this.dispatchEvent(new CustomEvent(`decline`, { detail: { mandateInfo: this.debiCheckDetails } }));
	}

	_approve() {
		this.dispatchEvent(new CustomEvent(`approve`, { detail: { mandateInfo: this.debiCheckDetails } }));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	_initialise() {
		this.mandateDetails = {
			"First collection date": this._formartDate(this.debiCheckDetails.firstCollectionDate),
			"Contract reference number": this.debiCheckDetails.contractReference,
			"Mandate reference": this.debiCheckDetails.mandateReference,
			"Tracking allowed": this.debiCheckDetails.tracking ? `Yes` : `No`,
			"Collector contact number": this.debiCheckDetails.collectorContact,
			"Collector email address": this.debiCheckDetails.collectorEmail,
			"Secondary status": formatStringAsPascalCase(this.debiCheckDetails.secondaryStatus),
			"Adjustment amount": formatCurrency(convertCentsToRand(this.debiCheckDetails.adjustmentAmount)),
			"Mandate request transaction identifier (MRTI)": this.debiCheckDetails.mrti
		};
		
		this.installmentDetails = {
			"Installment amount": formatCurrency(convertCentsToRand(this.debiCheckDetails.amount)),
			"Adjustment amount": formatCurrency(convertCentsToRand(this.debiCheckDetails.adjustmentAmount)),
			"Tracking allowed": this.debiCheckDetails.tracking ? `Yes` : `No`,
			"Max collection amount": formatCurrency(convertCentsToRand(this.debiCheckDetails.maxCollectionAmount))
		};

		this.dateDetails = {
			"Collection day": this.debiCheckDetails.collectionDate.day,
			"Initiation date": this._formartDate(this.debiCheckDetails.initiationDate),
			"Date amended": this._formartDate(this.debiCheckDetails.dateAmended),
			"Frequency": this.debiCheckDetails.frequency,
			"First collection date": this._formartDate(this.debiCheckDetails.firstCollectionDate)
		};

		this.creditorDetails = {
			"Creditor name": this.debiCheckDetails.creditorName,
			"Mandate status": formatStringAsPascalCase(this.debiCheckDetails.mandateStatus),
			"Contract reference": this.debiCheckDetails.contractReference,
			"Creditor telephone number": this.debiCheckDetails.collectorContact,
			"Creditor short name": this.debiCheckDetails.creditorShortName,
			"Mandate reference": this.debiCheckDetails.mandateReference,
			"Ultimate creditor name": this.debiCheckDetails.ultimateCreditorName,
			"Creditor email": this.debiCheckDetails.collectorEmail,
			"Secondary status": formatStringAsPascalCase(this.debiCheckDetails.secondaryStatus),
			"Mandate request transaction identifier (MRTI)": this.debiCheckDetails.mrti
		};

		this.payerDetails = {
			"Payer ID": this.callerInformation.southAfricanIDNumber,
			"Debtor telephone number": this.callerInformation.verifiedTelephoneNumber,
			"Payer account": this.debiCheckDetails.debtorAccountNumber,
			"Debtor email": this.callerInformation.emailId, 
			"CIF number": this.callerInformation.cifNumber
		};
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

			.card {
				width: 100%;
				height: 888px;
			}
			/* Title Bar styles */
			capitec-title-bar {
				--theme-titlebar-padding: 12px 16px;
				margin-bottom: 0px;
				border-bottom-width: 0px;
			}
			capitec-title-bar > capitec-label {
				--theme-label-title-font-size: 22px;
				--theme-label-title-font-weight: 600;
			}
			capitec-title-bar > capitec-icon {
				--theme-icon-size-medium: 24px;
				cursor: pointer;
			}
			capitec-tab-group {
				--theme-tab-min-width: 168px;
				--theme-container-padding-top: 4px;
				--theme-tab-border-bottom: 1px solid #E1E1E1;
			}
			horizon-label[value ="Pending"], [value = "Notapplicable"] {
				--horizon-label-value-color: #D4781C;
			}
			horizon-label[value ="Active"], [value="Accepted"]{
				--horizon-label-value-color: #70AF00;
			}
			horizon-label[value ="Inactive"], [value="Updated"], [value="Cancelled"], [value="Rejected"], [value="Expired"], [value="Duplicate"] {
				--horizon-label-value-color: #A5132A;
			}
			horizon-label {
				height: 64px;
				width: 341px;
				padding: 12px 24px 12px 0px;

				--horizon-label-text-height: 20px;
				--horizon-label-text-line-height: 12px;
				--horizon-label-text-font-size: 14px;
				--horizon-label-text-color: #3A3A3A;

				--horizon-label-value-height: 20px;
				--horizon-label-value-line-height: 20px;
				--horizon-label-value-font-size: 16px;
				--horizon-label-value-color: #3A3A3A;
			}
			
			horizon-alert-banner{
				margin-left: -5px;
				--theme-alert-banner-font-size: 13.7px;
			}

			.image {
				align-items: left;
				width: 128px;
				margin-top: 16px;
				margin-bottom: 18px;
			}
			capitec-button-bar {
			--theme-buttonbar-padding: 8px 16px;
			--theme-buttonbar-item-gap: 16px;
			}
			capitec-button {
				height: 48px;
				width: 156px;
				border-radius: 5px;
				--theme-button-height: 20px;
				--theme-button-color: #FFFFFF;
				--theme-button-font-family: "Hind Vadodara";
				--theme-button-font-size: 16px;
				--theme-button-font-weight: 600;
				--theme-button-letter-spacing: 0;
				--theme-button-line-height: 20px;
				--theme-button-text-align: center;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 22px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 22px;
				}
				capitec-label {
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-weight: 500;
					--theme-label-default-font-size: 16px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-letter-spacing: 0;
					--theme-label-line-height: 20px;
				}
				`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card 
				data-automation-id="viewinfo-debicheck-screen"
				class="card">
					<capitec-title-bar 
						data-automation-id="viewinfo-debicheck-title">
							<capitec-icon size="medium" 
								icon="system/back-action" 
								@click="${() => this._back()}">
							</capitec-icon>
							<capitec-label label="${this.debiCheckDetails.mandateName}" type="Title"></capitec-label>
							<capitec-spacer></capitec-spacer>
							<img class="image" src="/images/debi-check/debi-check-logo-banner-1024x256.svg"/>
					</capitec-title-bar>
				${this._renderDebiCheckDetails()}
				${this._renderFooter()}
			</capitec-card>`;
	}

	_renderDebiCheckDetails() {
		return html`
			<capitec-tab-group>
				<capitec-tab label="Mandate" layout="vertical" type="Dafault" halign="left">
				${this._renderTabContent(this.mandateDetails)}
				</capitec-tab>

				<capitec-tab label="Installment value" layout="vertical" halign="left">
				${this._renderTabContent(this.installmentDetails)}
				</capitec-tab>
	
				<capitec-tab label="Date details" layout="vertical" halign="left">
				${this._renderTabContent(this.dateDetails)}
				</capitec-tab>

				<capitec-tab label="Creditor details" layout="vertical" halign="left">
				${this._renderTabContent(this.creditorDetails)}
				</capitec-tab>
	
				<capitec-tab label="Payer details" layout="vertical" halign="left">
				${this._renderTabContent(this.payerDetails)}
				</capitec-tab>
			</capitec-tab-group>
		`;
	}

	_renderTabContent(details) {
		return html`
			<capitec-group 
				class="details-horizontal"
				layout="horizontal"
				gap="none"
				halign="left"
				valign="top"
				wrap>
					${Object.entries(details).map(item => {
						const [key, value] = item;
						return html`
							<horizon-label
								label="${key}"
								value="${isNullorEmpty(value) ? `-` : value}"
								data-automation-id="viewinfo-debicheck-${key.toLowerCase().split(` `).join(`-`)}">
							</horizon-label>
						`;
					})}
			</capitec-group>`;
	}

	_renderError() {
		return this.isPending
			? html`
				<horizon-alert-banner
					type="warning"
					header="Notify client: "
					label="The DebiCheck can only be approved/declined by contacting the bank you selected for this payment">
				</horizon-alert-banner>`
			: html``;
	}

	_renderFooter() {
		return this.isPending
		? html`
			<capitec-button-bar
				?hidden="${this.showNoActiveAccounts}">
					<capitec-spacer></capitec-spacer>
					<capitec-button
						label="Decline"
						@click="${() => this._decline()}">
					</capitec-button>
					<capitec-button 
						type="primary"
						label="Approve"
						@click="${() => this._approve()}">
					</capitec-button>
			</capitec-button-bar>`
		: html``;
	}

}

window.customElements.define(`horizon-viewinfo-debicheck`, ViewInfoDebiCheck);