import { Component, css, html } from 'platform/elements';

class CancelPolicySuccess extends Component {

//#region INITIALIZE

	constructor() {
		super();
	}

//#endregion

//#region PROPERTIES

	static get properties() {
		return {
			
		};
	}

//#endregion

//#region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	 connectedCallback() {
		super.connectedCallback();
	}

	//#endregion

//#region PRIVATE METHODS

//#endregion

//#region EVENT HANDLERS

/**
 * Navigate to Landing
 */
 _onIssuePolicyClick() {
	this.dispatchEvent(new CustomEvent(`navigate-back`, {
		detail: {
		}
	}));
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

			#temp-container{
				min-height: 650px;
				text-align: center;
				padding-top: 100px;
			}

			#temp-container-label{
				font-weight: bold;
				font-size: 24px;
			}
			
			.spacing { 
				margin-bottom: 30px;
				margin-top: 20px;
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
		`
	}

	/**
	 * Render the content HTML for the component
	 * @returns {html}
	 */
	 _renderContent() {
		return html`
			
			

			<capitec-card id="temp-container">
				<div>
					<capitec-image src="platform/illustrations/application.svg"
						style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
					<label id="temp-container-label">The policy has been Cancelled</label>
					<capitec-label class="spacing" type="subtitle" label="You currently have 2 active policies"></capitec-label>
					<capitec-button label="Isssue Policy" type="primary" @click="${() => this._onIssuePolicyClick()}"></capitec-button>
				</div>
			</capitec-card>
		`
	}

	//#endregion



}
window.customElements.define(`horizon-insure-cancel-policy-success`, CancelPolicySuccess);
