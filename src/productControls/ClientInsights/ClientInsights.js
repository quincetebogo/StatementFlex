import { Component, css, html } from 'platform/elements';

import 'platform/components';

/**
 * Client Insights is used to display various information about the client.
 * This component is rendered on the access menu bar.
 * As phase-I release, insights belonging to Live better are only displayed and allowed to capture clients action.
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

	async _selectResponse(replyReference, action) {
		this.selectedResponse = replyReference;
		
		const updateInsightsAction = await this.updateInsights(replyReference, action);

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
				.insights-group {
					height: 364px;
					--theme-layout-gap-spacing: 0px;
				}
				capitec-label[type="title"] {
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
				}
				.insights-header {
					padding: 23px 16px;
				}
				.insights-image {
					height: 152px;
					width: 288px;
				}
				.no-insights-image {
					margin-top: 82px;
				}
				.no-insights-text {
					padding: 8px 0px;
				}
				capitec-label[type="default"] {
					--theme-label-default-font-size: 14px;
					padding: 0px 16px;
					text-align: center;
					line-height: 20px;
					margin: auto;
				}
				.chips-group {
					margin-bottom: 10px;
					--theme-layout-gap-spacing: 10px;
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
						data-automation-id="client-insights-details"
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
				class="insights-header" 
				type="title"
				label="${this.insightDetails.header}">
			</capitec-label>
			
			<capitec-image
				class="insights-image"
				src="${this.insightDetails.image}"
				data-automation-id="client-insights-image">
			</capitec-image>
			
			<capitec-label 
				label="${this.insightDetails.message}">
			</capitec-label>

			<capitec-group class="chips-group" layout="horizontal" halign="center" valign="center" gap="clear">

				<capitec-chip
					data-automation-id="client-insights-left-chip"
					class="${this.selectedResponse === this.insightDetails.actions[0].replyReference ? `selected-chip` : ``}"
					label="This was useful"
					avatar-image="/images/insights/${this.selectedResponse === this.insightDetails.actions[0].replyReference ? `thumbs-up-white` : `thumbs-up`}.svg"
					@click="${() => this._selectResponse(this.insightDetails.actions[0].replyReference, `Thumbs up`)}">
				</capitec-chip>

				<capitec-chip
					data-automation-id="client-insights-left-chip"
					class="${this.selectedResponse === this.insightDetails.actions[1].replyReference ? `selected-chip` : ``}"
					label="This didn't help"
					avatar-image="/images/insights/${this.selectedResponse === this.insightDetails.actions[1].replyReference ? `thumbs-down-white` : `thumbs-down`}.svg"
					@click="${() => this._selectResponse(this.insightDetails.actions[1].replyReference, `Thumbs down`)}">
				</capitec-chip>

			</capitec-group>`
		: html`
			<capitec-image
				class="no-insights-image"
				src="images/landingPageImages/marketing.svg">
			</capitec-image>
			
			<capitec-label
				class="no-insights-text"
				type="title"
				label="No insights">
			</capitec-label>
		`;
	}

}

customElements.define(`capitec-pc-client-insights`, ClientInsights);