import { Component, css, html } from 'platform/elements';

/**
 * Success page after plan has been updated
 * 
 *  
 * @export
 * @class UpdatePlanSuccess
 * @extends {Component}
 */
class UpdatePlanSuccess extends Component {

	//#region INITIALISATION

	constructor() {
		super();
		this.showEmailPlanDialog = false;
	}

	//#endregion

	//#region PROPERTIES

	/**
	 * @property {String} policyNumber Contract reference of policy that got updated
	 * @property {String} showEmailPlanDialog Show flag for email address & send dialog
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			policyDetails: { type: Object, state: true },
			showEmailPlanDialog: { type: Boolean, state: true },
		};
	}
	//#endregion

	//#region EVENTS

	/**
	 * Navigate to Client Landing
	 */
	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, { detail: {} }));
	}

	//#endregion

	//#region RENDERING

	/**
	 * Generates the view stylesheet.
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			#success-container{
				min-height: 650px;
				text-align: center;
				padding-top: 100px;
			}
	
			#title{
				font-weight: bold;
				font-size: 24px;
			}

			#mainIcon{
				width: 300px; 
				margin-left: auto; 
				margin-right: auto;
			}

			#message-row{
				display: flex;
				justify-content: center;
			}

			#message-row > capitec-icon{
				margin-right: 10px;
			}
	
			#button-row{
				display: flex; 
				justify-content: center;
				padding: 10px 15px 15px 15px; 
				gap: 10px;
			}
			`
		];
	}

	/**
	 * Generates the component template for kiosk mode.
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for mobile mode.
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderDialogs()}
		`
	}

	/**
	 * Render the content HTML for the component
	 */
	_renderContent() {
		return html`
		<capitec-card id="success-container">
			<capitec-image src="platform/illustrations/send-documents.svg" id="mainIcon">
			</capitec-image>
			<label id="title">Funeral Plan Updated</label>
			<div id="message-row">
				<capitec-icon size="medium" icon="status/success-trans">
				</capitec-icon>
				<p>
					Your funeral plan document for policy number <b>${this.policyDetails?.contractReference}</b> has been
					updated
				</p>
			</div>
			<div id="button-row">
				<capitec-button label="Email" @click="${() => this.showEmailPlanDialog = true}">
				</capitec-button>
				<capitec-button type="primary" label="Done" @click="${() => this._backToSummaryPage()}">
				</capitec-button>
			</div>
		</capitec-card>
		`
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_renderDialogs() {
		return html`
			${this._renderInsureEmailDialog()}
		`
	}

	/** 
	 * Render dialog for confirming email address then sending
	 */
	_renderInsureEmailDialog() {
		return this.showEmailPlanDialog == false ? `` :
			html`
				GENERIC EMAIL POPUP HERE @Kishore
			`
	}


	//#endregion

}

window.customElements.define(`horizon-insure-update-plan-success`, UpdatePlanSuccess);


/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-update-plan-success ... @navigate-back="${this._handler}"></horizon-insure-update-plan>
 *
 * @event UpdatePlan#navigate-back
 * @type {Object} - N/A
 */