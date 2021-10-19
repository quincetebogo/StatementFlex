import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';

import 'platform/components';
import 'app/components/dialogs/AccessChannelError';
import 'app/dialogs/valueAddedServices/ValueAddedServices';
import 'app/dialogs/valueAddedServices/ValueAddedServicesUnavailable';
import 'app/dialogs/valueAddedServices/VASNoClientData';


export class ClientInsights extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();
		
		this.showAlert = false;
		this.isBusy = false;
		this.showValueAddedServicesModal = false;
		this.showUnavailableVASModal = false;
		this.showVASNoClientDataModal = false;
		this.eventAggregator = EventAggregator.getInstance();
		this.logger = Logger.getInstance();

		// TODO: Placeholders in this file to be removed once the images are signed off.
		// TODO: Hardcoded values to be removed when CS is implemented
		this.referenceNumber = `838438439399`;
		this.logged = `1 April 2021`;
		this.assigned = `Thomas`;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * 
	 */

	static get properties() {
		return {
			showAlert: { type: Boolean, attribute: false },
			isBusy: {type: Boolean},
			status: { type: Object},
			statusVAS: { attribute: false },
			valueAddedService: {type: Object, attribute: false},
			showValueAddedServicesModal: { type: Boolean, attribute: false },
			showUnavailableVASModal: {type: Boolean, attribute: false },
			showVASNoClientDataModal: {type: Boolean, attribute: false },
			scenario: { type: String }
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
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _showVASModal() {
		const returnValue = await this.valueAddedService();

		if (returnValue.succeeded && returnValue.result !== ``) {
			this.statusVAS = returnValue.result;
			this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
		} else if (returnValue.succeeded) {
			this.showVASNoClientDataModal = !this.showVASNoClientDataModal;
		} else {
			this.logger.log(`error`, `Failed to load Value Added Services`, `_valueAddedService`, returnValue.correlationId);
			this.showUnavailableVASModal = !this.showUnavailableVASModal;
		}
	}

	_cancelVasClick() {
		this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
	}

	_acceptVasClick() {
		this.eventAggregator.publish(`horizon-accepted-vas`, {});
		this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
	}

	_acceptVASNoClientDataClick() {
		this.showVASNoClientDataModal = !this.showVASNoClientDataModal;
	}

	_acceptUnavailableVasClick() {
		this.showUnavailableVASModal = !this.showUnavailableVASModal;
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.insights-card {
					height: 428px;
					width: var(--horizon-right-panel-width, 320px);
				}

				capitec-title-bar {
					border-bottom: 1px solid #E1E1E1;

					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
					--theme-card-border-radius: 0px 4px 0 0;
					--theme-titlebar-shadow: 1px solid #E1E1E1;
				}

				capitec-icon[icon="system/settings-action"] {
					--theme-icon-size-small: 24px;
					cursor: pointer;
				}

				.insights-group {
					height: 364px;
				}

				capitec-label {
					--theme-label-subtitle-font-weight: 600;
					--theme-label-subtitle-font-size: 18px;
				}

				p {
					margin: 0px;
					text-align: center;
					font-size: 14px;
				}

				capitec-chip {
					--theme-chip-background-color: #FFFFFF;
				}

				capitec-placeholder {
					height: 152px;
				}

				.info {
					height: 80px;
					--theme-layout-gap-spacing: 16px;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<section>
				${this._renderClientInsights()}
			</section>
			${this._renderLoadingIndicator()}
			${this._renderValueAddedServicesModal()}
			${this._renderUnavailableVASModal()}
			${this._renderVASNoClientDataModal()}
		`;
	}

	_renderClientInsights() {
		return html`
			<capitec-card class="insights-card">
				<capitec-title-bar
					type="default"
					label="Client Insights">
						<capitec-spacer></capitec-spacer>
						<capitec-icon
							size="small"
							icon="system/settings-action"
							@click = "${() => this._showVASModal()}">
						</capitec-icon>
				</capitec-title-bar>

				<capitec-group layout="vertical" halign="center" valign="center" gap="clear" class="insights-group">

					${this._renderCardExpiry()}
					${this._renderRecallRequest()}
					${this._renderDidYouKnow()}

				</capitec-group>
			</capitec-card>
		`;
	}

	_renderCardExpiry() {
		return this.scenario === `cards` ?
			html`
				<capitec-label
					type="subtitle"
					label="Credit card expires in 3 days!">
				</capitec-label>

				<capitec-placeholder type="insure" label="" size="4"></capitec-placeholder>

				<capitec-group layout="vertical" halign="center" valign="center" gap="none" class="info">
					<p>
						Your credit card expires on <strong>30th April 2021.</strong><br>
						Order your new card via the App <br>
						or visit a branch.
					</p>
				</capitec-group>

				<capitec-group layout="horizontal" halign="center" valign="center" gap="clear">

					<capitec-chip label="Order via App" avatar-image="src/productControls/ClientInsights/src/images/cards.svg"></capitec-chip>
					<capitec-chip label="Visit a Branch" avatar-image="src/productControls/ClientInsights/src/images/location.svg"></capitec-chip>

				</capitec-group>`
			: html``;
	}

	_renderRecallRequest() {
		return this.scenario === `recallRequest` ?
			html`
				<capitec-label
					type="subtitle"
					label="Recall request awaiting feedback">
				</capitec-label>

				<capitec-placeholder type="insure" label="" size="4"></capitec-placeholder>

				<capitec-group layout="vertical" halign="center" valign="center" gap="none" class="info">

					<p>
						Reference number: <strong>${this.referenceNumber}</strong><br>
						Logged: <strong>${this.logged}</strong><br>
						Assigned to: <strong>${this.assigned}</strong><br>
					</p>

				</capitec-group>

				<capitec-group layout="horizontal" halign="center" valign="center" gap="clear">

					<capitec-chip label="This was useful" avatar-image="src/productControls/ClientInsights/src/images/thumbsUp.svg"></capitec-chip>
					<capitec-chip label="This didn't help" avatar-image="src/productControls/ClientInsights/src/images/thumbsDown.svg"></capitec-chip>

				</capitec-group>`
			: html``;
	}

	_renderDidYouKnow() {
		return this.scenario === `didYouKnow` ?
			html`
				<capitec-label
					type="subtitle"
					label="Use your card! Be safe.">
				</capitec-label>

				<capitec-placeholder type="insure" label="" size="4"></capitec-placeholder>

				<capitec-group layout="vertical" halign="center" valign="center" gap="none" class="info">
					<p>
						Use your card instead of cash and you could<br>
						<strong>save R40.00 per month</strong> on average.
					</p>
				</capitec-group>

				<capitec-group layout="horizontal" halign="center" valign="center" gap="clear">

					<capitec-chip label="This was useful" avatar-image="src/productControls/ClientInsights/src/images/thumbsUp.svg"></capitec-chip>
					<capitec-chip label="This didn't help" avatar-image="src/productControls/ClientInsights/src/images/thumbDown.svg"></capitec-chip>

				</capitec-group>`
			: html``;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}

	_renderValueAddedServicesModal() {
		return this.showValueAddedServicesModal
		? html`
			<horizon-value-added-services
				.statusVAS="${this.statusVAS}"
				@cancel="${() => this._cancelVasClick()}"
				@accept="${() => this._acceptVasClick()}">
			</horizon-value-added-services>`
		: html``;
	}

	_renderUnavailableVASModal() {
		return this.showUnavailableVASModal
		? html`
			<horizon-value-added-services-unavailable
				@vas-unavailable="${() => this._acceptUnavailableVasClick()}">
			</horizon-value-added-services-unavailable>
		`
		: html``;
	}

	_renderVASNoClientDataModal() {
		return this.showVASNoClientDataModal 
		? html`
			<horizon-value-added-services-no-client-data
				@okay-unavailable="${() => this._acceptVASNoClientDataClick()}">
			</horizon-value-added-services-no-client-data>
		`
		: html``;
	}

}

customElements.define(`capitec-pc-client-insights`, ClientInsights);