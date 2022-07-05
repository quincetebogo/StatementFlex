import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatDate } from 'app/utils/channelServiceUtilities';


/**
 * the SMS History page displays the SMS History for the chosen policy
 *  
 * @export
 * @class SMSHistory
 * @extends {Component}
 */
class SMSHistory extends Component {

	//#region INITIALIZE

constructor() {
	super();


}

//#endregion

//#region PROPERTIES

	/**
	 * @property {String} contractReference contains the policy number
	 * @property {String} contactNumber contains the callers verified contact number
	 * @property {Object} commsHistory contains the communication history of the client for the policy selected
	 * 
	 * @readonly
	 * @static
	 */
	 static get properties() {
		return {
			contractReference: {type: String, state: true},
			contactNumber: {type: String, state: true},
			commsHistory: {type: Object, state: true}
		};
	}

//#endregion

//#region PRIVATE FUNCTIONS


//#endregion

//#region EVENT HANDLERS

/**
 * Navigate to Landing
 */
_backToSummaryPage() {
	this.dispatchEvent(new CustomEvent(`navigate-back`, {detail: {}}));
}

//#endregion


//#region RENDERING

/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
 static get styles() {
	return [
		super.styles,
		css`

		.insure-title-bar{
			margin-bottom: 0px; 
			border-top-left-radius: 5px; 
			border-top-right-radius: 5px;
		}

		.card{
			min-height: 50vh;
			padding: 20px;
		}

		.label{
			padding-bottom: 10px;
		}

		horizon-expander {
			margin-bottom: 16px;
			--theme-expander-height: auto;
			--theme-layout-gap-spacing: 0px;
			--theme-expander-header-height: 64px;
			--theme-expander-header-padding: 0 6px 0 0;
			--theme-expander-indicator-width: 16px;
		}
		horizon-expander[expanded] {
			box-shadow: 0 6px 10px 0.25px rgb(0 0 0 / 7%);
			display: block;
			--theme-overflow-menu-width: 200px !important;
		}
		.expander-header > capitec-icon {
			--theme-icon-size-default: 20px;
			--theme-layout-gap-spacing: 0px;
			margin-left: 10px;
		}
		.expander-header > capitec-button {
			width: 128px;
		}
		.expander-content {
			border-left: 1px solid #E1E1E1;
			border-bottom: 1px solid #E1E1E1;
			border-right: 1px solid #E1E1E1;
			border-radius: 0px 0px 4px 4px
		}
		.expander-content > capitec-title-bar {
			border-top: 0px;
		}
		.expander-header > horizon-label[label="Status"] {
			--horizon-label-value-color: #70AF00;
			width: 200px;
			text-overflow: ellipsis;
		}
		horizon-label {
			width: 189px;
			padding-left: 16px;
			--theme-layout-gap-spacing: 0px;
			--horizon-label-text-height: 20px;
			--horizon-label-text-color: #3A3A3A;
			--horizon-label-text-line-height: 20px;
			
			--horizon-label-value-height: 20px;
			--horizon-label-value-color: #3A3A3A;
			--horizon-label-value-font-size: 16px;
			--horizon-label-value-line-height: 20px;
		}
		.label-policy-number {
			--theme-label-cursor: pointer;
			--horizon-label-value-color: #3A3A3A;
		}
		.fixed-label {
			width: 22%;
			--horizon-label-max-overflow-width: 170px;
		}
		.vertical-line {
			height: 40px;
			width: 1px;
			background-color: #E1E1E1;
		}
		capitec-group > capitec-title-bar {
			--theme-titlebar-min-height: 32px;
			--theme-titlebar-padding: 0px 16px 0px 16px;
			--theme-type-default-background: rgb(244, 244, 244);
			--theme-label-title-font-size: 15px;
			--theme-label-title-font-weight: 600;
			--theme-type-default-font-color: #3A3A3A;
			--theme-label-title-font-size: 14px;
			--theme-titlebar-shadow: 0px;
			--theme-titlebar-item-gap: 0px;

			border-top: 1px solid #E1E1E1;
			border-bottom: 1px solid #E1E1E1;
		}

		`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			${this._renderContent()}
			
		`}

	/**
	 * Render the content HTML for the component
	 * @returns {html}
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
			<capitec-label  label="SMS History" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
		</capitec-title-bar>
		
		<capitec-card class="card" >
			<capitec-label class="label" type="subtitle" label="SMS History"></capitec-label>
			${ this.commsHistory.communications.map((comms) => this._renderExpander(comms) )
				}
		</capitec-card>
		
		`}

/**
 * renders each expander
 * 
 * @param {Object} comms 
 * @returns {html} the html content for the expanders
 */
	_renderExpander(comms){
		return html`
			
			${console.log(comms.sentAt)}
			${console.log(formatDate(comms.sentAt, 'dd mmm yyyy'))}

			<horizon-expander>
				<capitec-group 
					class="expander-header"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
						<horizon-label
							class="label-policy-number fixed-label"
							label="Policy Number"
							textOverflow="ellipsis"
							value="${this.contractReference}">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							label="Contact Details"
							value="${comms.contactNumber}">
						</horizon-label>
						<horizon-label
							label="Sent at"
							value="${formatDate(comms.sentAt, 'dd mmm yyyy')}, ${new Date(comms.sentAt).toLocaleTimeString('en', { timeStyle: 'short', hour12: true, timeZone: 'UTC' })}">
						</horizon-label>
						<horizon-label
							label="Received at"
							value="${formatDate(comms.sentAt, 'dd mmm yyyy')}, ${new Date(comms.sentAt).toLocaleTimeString('en', { timeStyle: 'short', hour12: true, timeZone: 'UTC' })}">
						</horizon-label>
						<horizon-label
							label="Status"
							value="${comms.status}">
						</horizon-label>
				</capitec-group>
				<div slot="content" class="slot-content">
					<capitec-group 
						class="expander-content" 
						layout="vertical"
						gap="none"
						halign="left"
						valign="center">
							${this._renderMessages(comms)}
					</capitec-group>
				</div>
			</horizon-expander>

			
		`
	}

	/**
	 * Render Messages options
	 * @param {Object} comms - each Communication history item
	 * @returns {html} The html content of each of the messages
	 */
	 _renderMessages(comms) {
		return html`
			<capitec-title-bar type="default" label="Message"></capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<capitec-content-box style="height: auto;" >
					<capitec-label label="${comms.messageContent}">
					</capitec-label>
				</capitec-content-box>
			
			</capitec-group>
		`;
	}

	//#endregion



}

window.customElements.define(`horizon-sms-history-page`, SMSHistory);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-pay-premium-success-page ... @navigate-back="${this._handler}"></horizon-pay-premium-success-page>
 *
 * @event PayPremiumSuccess#navigate-back
 * @type {Object} - N/A
 */
