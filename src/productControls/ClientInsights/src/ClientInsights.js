import { Component, css, html } from 'platform/elements';

import 'platform/components';

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
	}

	// --------------
	// PROPERTIES
	// --------------
	/**
	 *  @typedef {Object} updateInsights update selected Insights action and get back the result.
	 */

	/**
	 * @callback updateInsightsCallback
	 * @returns {updateInsights}
	 */

	/**
	* @property {Object} insightDetails Client insight details
	* @property {updateInsightsCallback} updateInsights Callback function to update selected Insights action and get back the result.
	* 
	* @readonly
	* @static
	* @memberof ClientInsights
	*/
	static get properties() {
		return {
			insightDetails: { type: Object },
			selectedResponse: { state: true },

			updateInsights: { type: Object, attribute: false }
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

	async _selectResponse(replyReference) {
		this.selectedResponse = replyReference;
		
		const updateInsightsAction = await this.updateInsights(replyReference);

		if (updateInsightsAction) {
			this.selectedResponse = ``;
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// N/A

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
				.sub-details {
					width: 288px;
					max-height: 100px;
					margin: 0px;
					padding: 12px;
					font-size: 14px;
					background-color: #F5F5F5;
					border-radius: 4px;
				}
				.sub-text {
					max-height: 100px;
					padding: 16px;
					margin-top: 0px;
					font-size: 14px;
					text-align: center;
					overflow: auto;
				}
				.chips-group {
					margin-bottom: 16px;
				}
				capitec-chip {
					width: 140px;
					--theme-chip-background-color: #FFFFFF;
					--theme-avatar-size-extra-small: 16px;
					--theme-chip-label-padding-left: 7px;
					--theme-chip-padding: 8px;
					--theme-chip-label-padding-right: 8px;
				}
				capitec-chip:hover {
					--theme-chip-hover-border: 1px solid rgba(0,157,224,0.1);
				}
				.selected-chip {
					--theme-chip-background-color: #009de0;
					--theme-chip-hover-border: 1px solid #009de0;
					--theme-chip-label-color: #FFFFFF;
					--theme-avatar-size-extra-small: 14px;
				}
				.info {
					--theme-layout-gap-spacing: auto;
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
		return this.insightDetails 
		? html`
			<capitec-label
				type="subtitle"
				label="${this.insightDetails.header}">
			</capitec-label>

			<capitec-group layout="vertical" halign="center" valign="center" gap="none" class="info">
				<capitec-image src="platform/illustrations/processing.svg"></capitec-image>
				${this._renderDetails()}
			</capitec-group>

			<capitec-group class="chips-group" layout="horizontal" halign="center" valign="center" gap="clear">

				<capitec-chip
						data-automation-id="client-insights-left-chip"
						class="${this.selectedResponse === this.insightDetails.actions[0].replyReference ? `selected-chip` : ``}"
						label="${this.insightDetails.actions[0].displayName}"
						avatar-image="src/productControls/ClientInsights/src/images/${this.selectedResponse === this.insightDetails.actions[0].replyReference ? `thumbsUp-white` : `thumbsUp`}.svg"
						@click="${() => this._selectResponse(this.insightDetails.actions[0].replyReference)}">
				</capitec-chip>

				<capitec-chip
						data-automation-id="client-insights-left-chip"
						class="${this.selectedResponse === this.insightDetails.actions[1].replyReference ? `selected-chip` : ``}"
						label="${this.insightDetails.actions[1].displayName}" 
						avatar-image="src/productControls/ClientInsights/src/images/${this.selectedResponse === this.insightDetails.actions[1].replyReference ? `thumbsDown-white` : `thumbsDown`}.svg"
						@click="${() => this._selectResponse(this.insightDetails.actions[1].replyReference)}">
				</capitec-chip>

			</capitec-group>`
		: html`
			<capitec-image
				class="box-image"
				src="images/landingPageImages/marketing.svg">
			</capitec-image>`;
	}

	_renderDetails() {
		return !this.insightDetails.subText 
			? html`
				<p class="sub-details">
					Reference number: <strong>${this.insightDetails[`Ref #`]}</strong><br>
					Logged: <strong>${this.insightDetails[`Date Logged`]}</strong><br>
					Assigned to: <strong>${this.insightDetails.Owner}</strong><br>
				</p>`
			: html`
				<capitec-label class="sub-text" label="${this.insightDetails.subText}"></capitec-label>`;
	}

}

customElements.define(`capitec-pc-client-insights`, ClientInsights);