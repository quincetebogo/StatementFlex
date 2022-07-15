import { Component, css, html } from 'platform/elements';
import { INSURE_CALLER_PAGE } from 'app/constants/InsureCommon';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Success page after action (update plan, accept policy, etc...) has been done.
 * 
 *  
 * @export
 * @class SuccessPage
 * @extends {Component}
 */
class SuccessPage extends Component {

	//#region INITIALISATION

	constructor() {
		super();
	
		this.successMessage = ``;
		this.callerPage = ``;
		this.showEmailPlanDialog = false;
	}

	//#endregion INITIALISATION

	//#region PROPERTIES

	/**
	 * @property {String} successMessage - Success message after action is done.
	 * @property {String} callerPage - caller Page from which success page is invoked.
	 * @property {String} showEmailPlanDialog - Show flag for email address & send dialog
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			successMessage: { type: String },
			showEmailPlanDialog: { type: Boolean },
			callerPage: { type: String }
		};
	}
	//#endregion PROPERTIES

	//#region EVENTS

	/**
	 * Navigate back to Landing Page
	 */
	_onDoneClick() {
		if(this.callerPage === INSURE_CALLER_PAGE.REINSTATE_POLICY)
			this.dispatchEvent(new CustomEvent(`navigate-back`, { detail: { navigateBackTo: INSURE_RENDER_MODE.CLIENT_POLICIES } }));
		else if(this.callerPage === INSURE_CALLER_PAGE.UPDATE_PLAN)
			this.dispatchEvent(new CustomEvent(`navigate-back`, { detail: { navigateBackTo: INSURE_CALLER_PAGE.UPDATE_PLAN } }));
	}

	//#endregion EVENTS

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
			
				${INSURE_CSS}

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
				capitec-label[type="subtitle"] {
					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
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
			<div id="message-row">
				<capitec-icon size="medium" icon="status/success-trans">
				</capitec-icon>
				<capitec-label type ="subtitle" label = "${ this.successMessage }"></capitec-label>
			</div>
			<div id="button-row">
				<capitec-button label="Email" @click="${() => this.showEmailPlanDialog = true}">
				</capitec-button>
				<capitec-button type="primary" label="Done" @click="${() => this._onDoneClick()}">
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

	//#endregion RENDERING
}

window.customElements.define(`horizon-insure-success-page`, SuccessPage);


/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-success-page ... @navigate-back="${this._handler}"></horizon-insure-success-page>
 *
 * @event SuccessPage#navigate-back
 * @type {Object} - N/A
 */