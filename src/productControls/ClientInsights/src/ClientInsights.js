import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';

import 'platform/components';
import 'app/dialogs/valueAddedServices/ValueAddedServices';
import 'app/dialogs/valueAddedServices/ValueAddedServicesUnavailable';
import 'app/dialogs/valueAddedServices/VASNoClientData';

const SCENARIO_INFO = {
	cards: {
		subTitle: `Credit card expires in 3 days!`,
		leftChipLabel: `Order via App`,
		rightChipLabel: `Visit a Branch`,
		leftChipIcon: `cards.svg`,
		rightChipIcon: `location.svg`
	},
	recallRequest: {
		subTitle: `Recall request awaiting feedback`,
		leftChipLabel: `This was useful`,
		rightChipLabel: `This didn't help`,
		leftChipIcon: `thumbsUp.svg`,
		rightChipIcon: `thumbsDown.svg`
	},
	didYouKnow: {
		subTitle: `Use your card! Be safe.`,
		leftChipLabel: `This was useful`,
		rightChipLabel: `This didn't help`,
		leftChipIcon: `thumbsUp.svg`,
		rightChipIcon: `thumbsDown.svg`
	}
}

/**
 * Client Insights is used to display various information about the client.
 * This component is rendered on the access menu bar.
 * 
 * Event Raised
 * -------------
 * None
 * 
 * @export
 * @class ClientInsights
 * @extends {Component}
 */

export class ClientInsights extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();

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
	 *  @typedef {Object} valueAddedServiceResponse The VAS opted for by the client.
	 */

	/**
	 * @callback valueAddedServiceCallback
	 * @returns {valueAddedServiceResponse}
	 */

	/**
	 * @property {String} scenario - holds the value of which client insight needs to be displayed (cards, recallRequest, didYourKnow)
	 * @property {valueAddedServiceCallback} valueAddedService Callback function to load the VAS opted by the client.
	*/
	static get properties() {
		return {

			scenario: { type: String },
			statusVAS: { attribute: false },
			valueAddedService: {type: Object, attribute: false},
			showValueAddedServicesModal: { type: Boolean, attribute: false },
			showUnavailableVASModal: {type: Boolean, attribute: false },
			showVASNoClientDataModal: {type: Boolean, attribute: false }

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

				capitec-chip:hover {
					--theme-chip-background-color: rgba(0,157,224,0.1);
					--theme-chip-hover-border: none;
					}

				capitec-placeholder {
					height: 152px;
				}

				.info {
					--theme-layout-gap-spacing: 16px;
				}

				.recallRequest-info {
					width: 288px;
					height: 80px;
					background-color: #F5F5F5;
					text-align: left;
					padding: 8px 12px;
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
							data-automation-id="client-insights-show-vas-modal"
							size="small"
							icon="system/settings-action"
							@click = "${() => this._showVASModal()}">
						</capitec-icon>
				</capitec-title-bar>

				<capitec-group 
						data-automation-id="client-insights-${this.scenario}"
						layout="vertical" 
						halign="center" 
						valign="center" 
						gap="clear" 
						class="insights-group">
					${this._renderContent()}
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderContent() {
		return html`
			<capitec-label
				type="subtitle"
				label="${SCENARIO_INFO[this.scenario].subTitle}">
			</capitec-label>

			<capitec-placeholder type="insure" label="" size="4"></capitec-placeholder>

			<capitec-group layout="vertical" halign="center" valign="center" gap="none" class="info">
				${this._renderCardExpiry()}
				${this._renderRecallRequest()}
				${this._renderDidYouKnow()}
			</capitec-group>

			<capitec-group layout="horizontal" halign="center" valign="center" gap="clear">

				<capitec-chip 
						data-automation-id="client-insights-left-chip"
						label="${SCENARIO_INFO[this.scenario].leftChipLabel}" 
						avatar-image="src/productControls/ClientInsights/src/images/${SCENARIO_INFO[this.scenario].leftChipIcon}">
				</capitec-chip>

				<capitec-chip 
						data-automation-id="client-insights-left-chip"
						label="${SCENARIO_INFO[this.scenario].rightChipLabel}" 
						avatar-image="src/productControls/ClientInsights/src/images/${SCENARIO_INFO[this.scenario].rightChipIcon}">
				</capitec-chip>

			</capitec-group>`;
	}


	_renderCardExpiry() {
		return this.scenario === `cards` ?
			html`
				<p>
					Your credit card expires on <strong>30th April 2021.</strong><br>
					Order your new card via the App <br>
					or visit a branch.
				</p>`
			: html``;
	}

	_renderRecallRequest() {
		return this.scenario === `recallRequest` ?
			html`
				<p class="recallRequest-info">
					Reference number: <strong>${this.referenceNumber}</strong><br>
					Logged: <strong>${this.logged}</strong><br>
					Assigned to: <strong>${this.assigned}</strong><br>
				</p>`
			: html``;
	}

	_renderDidYouKnow() {
		return this.scenario === `didYouKnow` ?
			html`
				<p>
					Use your card instead of cash and you could<br>
					<strong>save R40.00 per month</strong> on average.
				</p>
				`
			: html``;
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