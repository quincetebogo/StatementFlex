import { Component, css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

const ALERT_BANNER_MESSAGE = `You have no Tax Certificates yet`;

export class TaxCertificateLanding extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isLeapYear = false;

		this._telemetry = HorizonTelemetry.instance;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isLeapYear: { state: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		this._checkForLeapYear();

		await this._telemetry.startSpan(QuickTransactionEvents.TAX_CERTIFICATE_NOT_AVAILABLE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE
		});
	}

	async disconnectedCallback() {
		await this._telemetry.endSpan(QuickTransactionEvents.TAX_CERTIFICATE_NOT_AVAILABLE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	_checkForLeapYear() {
		const year = new Date().getFullYear();
		this.isLeapYear = ((year % 4 === 0 ) && (year % 100 != 0)) || (year % 400 === 0);
		return;
	}

	_getYear(currentYear) {
		const year = new Date().getFullYear();
		return currentYear ? year : year+1;
	}

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
				capitec-card {
					height: var(--horizon-panel-height, 888px);
					width: var(--horizon-center-panel-width, 1064px);
					--theme-card-border-radius: 5px;
					--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				capitec-title-bar {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-shadow: none;
					--theme-titlebar-border: 1px solid #E1E1E1;
				}
				capitec-title-bar > capitec-icon {
					cursor: pointer;
					margin-right: 15px;
					--theme-icon-size-medium: 26px;
				}
				capitec-image {
					margin: 109px 386px 0px 386px;
					width: 252px;
					height: 182px;
				}
				capitec-group {
					align-items: center;
				}
				capitec-group[layout="vertical"] > capitec-label[type="title"] {
					margin: 15px 0px 16px;
					text-align: center;

					--theme-label-font-color: #3A3A3A;
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
				}
				capitec-group[layout="horizontal"] > capitec-label[type="strong"] {
					--theme-label-strong-font-weight: 600;
				}
				capitec-alert-banner[type="unsuccessful-red"] {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					--theme-layout-gap-spacing: 16px;
					--theme-alert-banner-font-weight: 600;
				}
				p {
					margin: 0px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-weight: 500;
					font-size: 15px;
					letter-spacing: 0;
				}
			`
		]
	}

	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card>
				${this._renderTitleBar()}
				<capitec-content-box>
					${this._renderAlertBanner()}
					${this._renderNoTaxCertificateAvailable()}
				</capitec-content-box>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="title-bar">
				<capitec-icon 
					data-automation-id="tax-certificate-landing-back"
					size="medium"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Tax Certificate" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderAlertBanner() {
		return html`
			<capitec-alert-banner type="unsuccessful-red" data-automation-id="tax-certificate-landing-unsuccessful-banner">
				<capitec-group layout="horizontal" halign="left" valign="top" gap="none" class="alert-banner">
					<capitec-label
						label="Notify client: "
						type="strong">
					</capitec-label>
					<capitec-label
						label="${ALERT_BANNER_MESSAGE}">
					</capitec-label>
				</capitec-group>
			</capitec-alert-banner>
		`;
	}

	_renderNoTaxCertificateAvailable() {
		return html`
			<capitec-group layout="vertical" halign="left" valign="top" gap="none">
				<capitec-image src="/images/tax-certificate/send-tax-certificate.svg"></capitec-image>
				<capitec-label type="title" label="You have no Tax Certificates yet"></capitec-label>
				<p>
					Your account was opened after <strong>${this.isLeapYear ? `29` : `28`} February ${this._getYear(true)}</strong>. Tax details will be available after <strong>1 March ${this._getYear(false)}</strong>.
				</p>
			</capitec-group>
		`;
	}

}
customElements.define(`horizon-tax-certificate-landing`, TaxCertificateLanding);