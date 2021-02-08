import { Component, css, html } from 'platform/elements';

/**
 * A generic error screen component. Most input is set via properties but there is a named slot (detail)
 * for the error message detail.
 *
 * @export
 * @class ErrorScreen
 * @extends {Component}
 */
export class ErrorScreen extends Component {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.header = ``;
		this.left = ``;
		this.right = ``;
		this.toast = ``;
		this.displayToast = true;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		window.setTimeout(() => this._closeToast(), 3000);
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	* @property {String} header The heading for the error screen
	* @property {String} left The text for the left hand buttoon
	* @property {String} right The text for the right hand button
	* @property {String} [toast] The text for the tost message
	* @property {String} [displayToast=true] Enables/Disables the toast message
	* @readonly
	* @static
	* @memberof ErrorScreen
	*/
	static get properties() {
		return {
			header: { type: String },
			left: { type: String },
			right: { type: String },
			toast: { type: String },
			displayToast: { type: Boolean }
		};
	}


	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host{
					width: 100%;
					height: 100%;
				}
				.card {
					height: var(--horizon-error-screen-height, 876px);
					width: 1064px;
				}
				#id-unsuccessful-img {
					margin-top: 174px;
				}
				#id-verify-unsuccessful {
					height: 32px;
					width: 312px;
					margin: 0px auto 0px auto;
					margin-top: 51px;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 32px;
					text-align: center;
				}
				#id-msg-group{
					margin-top: 16px;
					justify-content: center;
				}
				#id-visit-branch-msg{
					height: 24px;
					width: 543px;
					color: #545D60;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
				}
				#id-button-group {
					justify-content: center;
					margin-top: 64px;
				}
				.button{
					height: 48px;
					--theme-button-font-weight: 600;
					--theme-button-font-size: 16px;
					--theme-button-font-family: "Hind Vadodara";
					--theme-button-padding-top: 13px;
					--theme-button-padding-bottom: 13px;
					margin-bottom: 168px;
				}
				#button-left {
					margin-right: 16px;
				}

				.center-button {
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-padding-left: 22px;
					--theme-button-padding-top: 12.5px;
					--theme-button-padding-bottom: 12.5px;
					--theme-button-padding-right: 22px;
				}
				#id-error-toast {
						position: absolute;
						top : var(--toast-top, 56px);
						margin-left: var(--toast-margin-left, 382px);
				}
				
				slot[name=detail]::slotted(*){
					height: 24px;
					width: 543px;
					color: #545D60;
					font-family: "Hind Vadodara";
					font-weight: 600;
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
				}
			`
		];
	}


	_closeToast() {
		this.displayToast = false;
	}

	_leftClick() {
		this.dispatchEvent(new CustomEvent(`left-click`, {}));
	}

	_rightClick() {
		this.dispatchEvent(new CustomEvent(`right-click`, {}));
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">
				<capitec-toast 
					?hidden="${!this.displayToast}" 
					id="id-error-toast" 
					type="error" 
					header="Unsuccesful" 
					detail="${this.toast}" 
					closable 
					@click="${() => this.displayToast = false}">
				</capitec-toast>
				<img id="id-unsuccessful-img" src="/images/insure/assign-pay-arrears.svg"/>
				<capitec-label id="id-verify-unsuccessful" label="${this.header}"></capitec-label>
				<capitec-group id = "id-msg-group" layout="horizontal">
					<capitec-icon size="default" icon="status/error-trans"></capitec-icon>
					<slot name="detail"></slot>
				</capitec-group>
				<capitec-group id="id-button-group" layout="horizontal">
					${this.left
						? html`<capitec-button class="button" label="${this.left}" @click="${() => this._leftClick()}"></capitec-button>`
						: html``
					}
					${this.right
						? html`<capitec-button class="button" type="primary" label="${this.right}" @click="${() => this._rightClick()}"></capitec-button>`
						: html``
					}
				</capitec-group>
			</capitec-card>
		`;
	}
}

customElements.define(`horizon--error-screen`, ErrorScreen);