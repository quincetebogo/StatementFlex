import { Component, css, html } from 'platform/elements';
import { getAgeFromDob, livesPerPolicy, refreshRelationshipCoverDetails } from 'app/utils/insureUtils';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';


/**
 * policy history details dialog
 * 
 * Events Raised 
 * -------------
 * close-modal
 * agree
 *  
 * @export
 * @class PolicyHistoryDetailsDialog
 * @extends {Component}
 */
class PolicyHistoryDetailsDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * 
	 */
	static get properties() {
		return {
			policyHistoryDetails: { type: Array, state: true},
			transactionName: { type: String, state: true},
		};
	}

	//  #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	/**
	 *
	 * @returns {void}
	 */
	_initialise() {

	}

	//  #endregion LIFECYCLE OVERRIDES

	//  #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void}
	 */
	_backClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	//  #endregion EVENT HANDLERS

	//  #region PRIVATE METHODS

	//  #endregion PRIVATE METHODS

	//  #region RENDERING

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
				
				${INSURE_CSS}

				.modal-body-label{
					padding: 10px 10px 10px 10px;
					font-weight: bold;
					z-index: 3000;
					max-height: fit-content;
				}
				
				#dialog-body{
					height: 370px;
				}

				
				.add-beneficiary{
					border: 1px solid #e1e1e1; 
					border-radius: 5px; 
					padding: 10px; 
					width: 100%;
				}
				.title{
					padding: 10px; 
				}

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
				}

				.policy-transaction-card{
				min-height: auto;
				height: 65px;
				padding-top: 10px;
				padding-bottom: 10px;
				padding-left: 10px;
				padding-right: 10px;
				background-color: #ffffff;
				border-radius: 4px;
				border-width: 1px;
				border-style: solid;
				border-color: rgb(225, 225, 225);
				
				}

				.transaction-container{
					display: flex;
				}
					
				horizon-label {
				
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

				.expander-options{
				display: flex; 
				width: 100%;
				flex-flow: column;
				justify-content: space-between; 
				padding: 20px 15px 15px 15px; 
				gap: 10px;
			}

			.details-content-box{
				max-height: 450px;
				height: fit-content;
			}

			.details-label{
				width: 50%;
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
			<capitec-modal type="form" class="modal-body-label" header="${`Activity Details | ${this.transactionName}` }" header-align="left" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: 900px;">
				<div slot="body" class="modal-body">
					<capitec-content-box class="details-content-box" layout="vertical" halign="stretch" valign="top" gap="clear">
						${this._renderDialogBody()}
					</capitec-content-box>
				</div>
				<div slot="footer" >
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {

		if(this.policyHistoryDetails?.length === 0){
			return html`
			<div style="text-align: center;">
				<capitec-image style="width: 200px; margin-left: auto; margin-right: auto;" src="platform/illustrations/history.svg"></capitec-image>
				<capitec-label type="subtitle" label="No details available"></capitec-label>
			</div>`;
		}else{
			return html`<div class="expander-options">
			${this.policyHistoryDetails?.map((item) => html`
				<capitec-card class="policy-transaction-card" halign="center" valign="center" layout="vertical">
					<div class="transaction-container">
						<div class="details-label">
							<horizon-label
								label="Field"
								textOverflow="ellipsis"
								value="${item.fieldName.replace(/([a-z])([A-Z])/g, '$1 $2')}">
							</horizon-label>
						</div>
						<div class="details-label">
							<horizon-label 
								label="Value"
								textOverflow="ellipsis"
								value="${item.fieldValue}">
							</horizon-label>
						</div>
					</div>	
				</capitec-card>
			`)}
		</div>`
		}
		

		
		
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button label="Back" type="primary" @click="${() => this._backClick()}">
				</capitec-button>
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-policy-history-details-dialog`, PolicyHistoryDetailsDialog);

/**
 * send close modal event to the consuming componant when 'back' is clicked
 *
 * @example
 * <horizon-insure-policy-history-details-dialog ... @close-modal="${this._handler}"></horizon-insure-policy-history-details-dialog>
 *
 * @event PolicyHistoryDetailsDialog#close-modal
 * @type {Object} - N/A
 */