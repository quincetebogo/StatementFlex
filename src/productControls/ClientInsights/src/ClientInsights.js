import { Component, css, html } from 'platform/elements';

import 'platform/components';

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
};

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

		// TODO: Placeholders in this file to be removed once the images are signed off.
		// TODO: Hardcoded values to be removed when CS is implemented

		this.displayDetails = [];
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {String} scenario - holds the value of which client insight needs to be displayed (cards, recallRequest, didYourKnow)
	*/
	static get properties() {
		return {
			clientInsightsDetails: { type: Object },
			selectedResponse: { state: true }
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

	_settingsIconClick() {
		this.dispatchEvent(new CustomEvent(`settings-click`, {}));
	}

	_selectResponse(replyReference) {
		this.selectedResponse = replyReference;
		
		this.dispatchEvent(new CustomEvent(`response-selected`, { detail: { replyReference: this.selectedResponse } }));
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------


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
				.box-image {
					margin-top: 100px;
				}
				.insights-group {
					height: 364px;
				}

				capitec-label {
					--theme-label-subtitle-font-weight: 600;
					--theme-label-subtitle-font-size: 18px;
					--theme-layout-gap-spacing: 7px;
					margin-top: 18px;
				}

				p {
					width: 288px;
					margin: 0px;
					padding: 12px;
					font-size: 14px;
					background-color: #F5F5F5;
					border-radius: 4px;
				}

				capitec-chip {
					--theme-chip-background-color: #FFFFFF;
					--theme-avatar-size-extra-small: 16px;
					--theme-chip-label-padding-left: 7px;
					--theme-chip-padding: 8px;
					--theme-chip-label-padding-right: 8px;
				}

				capitec-chip:hover {
					--theme-chip-hover-border: 1px solid rgba(0,157,224,0.1);
				}

				capitec-placeholder {
					height: 152px;
				}

				.selected-chip {
					--theme-chip-background-color: #009de0;
					--theme-chip-hover-border: 1px solid #009de0;
					--theme-chip-label-color: #FFFFFF;
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
		return html`${this._renderClientInsights()}`;
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
							@click = "${() => this._settingsIconClick()}">
						</capitec-icon>
				</capitec-title-bar>

				<capitec-group 
						data-automation-id="client-insights-${this.scenario}"
						layout="vertical" 
						halign="center" 
						valign="top" 
						gap="clear" 
						class="insights-group">
					${this._renderContent()}
				</capitec-group>

			</capitec-card>

		`;
	}

	_renderContent() {
		return this.clientInsightsDetails 
		? html`
			<capitec-label
				type="subtitle"
				label="${this.clientInsightsDetails.header}">
			</capitec-label>

			<capitec-group layout="vertical" halign="center" valign="center" gap="none" class="info">
				<capitec-image src="platform/illustrations/processing.svg"></capitec-image>
				<p>
					Reference number: <strong>${this.clientInsightsDetails.details[`Reference number`]}</strong><br>
					Logged: <strong>${this.clientInsightsDetails.details.Logged}</strong><br>
					Assigned to: <strong>${this.clientInsightsDetails.details[`Assigned to`]}</strong><br>
				</p>
				
				<!-- ${this._renderCardExpiry()}
				${this._renderRecallRequest()}
				${this._renderDidYouKnow()} -->
			</capitec-group>

			<capitec-group layout="horizontal" halign="center" valign="center" gap="clear">

				<capitec-chip
						data-automation-id="client-insights-left-chip"
						class="${this.selectedResponse === this.clientInsightsDetails.actions[0].replyReference ? `selected-chip` : ``}"
						label="${this.clientInsightsDetails.actions[0].displayName}"
						avatar-image="src/productControls/ClientInsights/src/images/${this.selectedResponse === this.clientInsightsDetails.actions[0].replyReference ? `thumbsUp-white` : `thumbsUp`}.svg"
						@click="${() => this._selectResponse(this.clientInsightsDetails.actions[0].replyReference)}">
				</capitec-chip>

				<capitec-chip
						data-automation-id="client-insights-left-chip"
						class="${this.selectedResponse === this.clientInsightsDetails.actions[1].replyReference ? `selected-chip` : ``}"
						label="${this.clientInsightsDetails.actions[1].displayName}" 
						avatar-image="src/productControls/ClientInsights/src/images/${this.selectedResponse === this.clientInsightsDetails.actions[1].replyReference ? `thumbsDown-white` : `thumbsDown`}.svg"
						@click="${() => this._selectResponse(this.clientInsightsDetails.actions[1].replyReference)}">
				</capitec-chip>

			</capitec-group>`
		: html`
			<img
				class="box-image"
				src="images/landingPageImages/marketing.svg"/>
			<capitec-label
				type="subtitle"
				label="Client insights coming soon...">
			</capitec-label>`;
	}


	_renderCardExpiry() {
		return this.scenario === `cards` 
			? html`
				<p>
					Your credit card expires on <strong>30th April 2021.</strong><br>
					Order your new card via the App <br>
					or visit a branch.
				</p>`
			: html``;
	}

	_renderRecallRequest() {
		return this.scenario === `recallRequest` 
			? html`
				<capitec-image src="platform/illustrations/processing.svg"></capitec-image>
				<p class="recallRequest-info">
					Reference number: <strong>${this.referenceNumber}</strong><br>
					Logged: <strong>${this.logged}</strong><br>
					Assigned to: <strong>${this.assigned}</strong><br>
				</p>`
			: html``;
	}

	_renderDidYouKnow() {
		return this.scenario === `didYouKnow` 
			? html`
				<p>
					Use your card instead of cash and you could<br>
					<strong>save R40.00 per month</strong> on average.
				</p>
				`
			: html``;
	}
}

customElements.define(`capitec-pc-client-insights`, ClientInsights);