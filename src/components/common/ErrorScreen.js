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
		this.image = null;
		this.hasSubDetails = ``;
		this.secondaryToast = ``;
		this.disableLeftAction = false;
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
	* @property {String} [hasSubDetails=false] Indicates if the sub-detail line should be displayed
	* @property {String} [secondaryToast] Secondary toast details
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
			displayToast: { type: Boolean },
			image: { type: String },
			hasSubDetails: { type: Boolean },
			secondaryToast: { type: String },
			disableLeftAction: { type: Boolean, attribute: `disable-left-action` }
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
					height: var(--horizon-error-screen-height, 744px);
					width: var(--horizon-center-panel-width, 1064px);
				}
				.card > capitec-group[layout="vertical"] {
					height: var(--horizon-error-screen-size, 768px);
				}
				#id-unsuccessful-img {
					width: var(--horizon-error-screen-img-width, auto);
				}
				#id-verify-unsuccessful {
					width: 100%;
					height: 32px;
					margin-top: var(--horizon-error-screen-label-margin-top, 51px);
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 32px;
					text-align: center;
				}
				#id-msg-group{
					justify-content: center;
					margin-top: 16px;
				}
				#id-sub-detail {
					justify-content: center;
					margin-top: 13px;
				}
				#id-button-group {
					justify-content: center;
					margin-top: var(--horizon-error-screen-action-margin-top, 35px);
				}
				.button{
					height: 48px;
					--theme-button-font-size: 16px;
					--theme-button-font-family: "Hind Vadodara SemiBold";
					--theme-button-padding-top: 13px;
					--theme-button-padding-bottom: 13px;
				}
				#id-error-toast {
					--theme-toast-error-color: #3A3A3A;
					width: 432px;
					position: absolute;
					top : var(--toast-top, 56px);
					margin-left: var(--toast-margin-left, 382px);
					width : var(--toast-width, 365px)
				}
				.secondary-toast {
					--theme-toast-error-color: #3A3A3A;
					width: 432px;
					position: absolute;
					top : var(--toast-top, 130px);
					margin-left: var(--toast-margin-left, 382px);
				}
				slot[name=detail]::slotted(*){
					height: 26px;
					color: #545D60;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
				}
				slot[name=sub-detail] {
					height: 24px;
					width: 543px;
					color: #3E4547;
					font-family: "Hind Vadodara";
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
					header="Unsuccessful" 
					detail="${this.toast}" 
					closable 
					@click="${() => this.displayToast = false}">
				</capitec-toast>

				${this._renderSecondaryToast()}

				<capitec-group
					layout="vertical"
					gap="none"
					halign="center"
					valign="center">
					<img id="id-unsuccessful-img" src="${this.image}" />
					<capitec-label id="id-verify-unsuccessful" label="${this.header}"></capitec-label>
					<capitec-group id = "id-msg-group" layout="horizontal">
						<capitec-icon size="default" icon="status/error-trans"></capitec-icon>
						<slot name="detail"></slot>
					</capitec-group>

					${this._renderSubTitle()}

					<capitec-group id="id-button-group" layout="horizontal">
						${this.left
							? html`<capitec-button class="button" label="${this.left}" @click="${() => this._leftClick()}"
										?disabled="${this.disableLeftAction}">
									</capitec-button>`
							: html``
						}
						${this.right
							? html`<capitec-button class="button" type="primary" label="${this.right}" @click="${() => this._rightClick()}"></capitec-button>`
							: html``
						}
					</capitec-group>
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderSecondaryToast() {
		return this.secondaryToast
			? html`
				<capitec-toast 
					?hidden="${!this.displayToast}"
					class="secondary-toast"
					type="error" 
					header="Unsuccessful" 
					detail="${this.secondaryToast}"
					closable 
					@click="${() => this.displayToast = false}">
				</capitec-toast>`
		: html``;
	}

	_renderSubTitle() {
		return this.hasSubDetails
			? html`
				<capitec-group id = "id-sub-detail" layout="horizontal">
					<capitec-icon size="default" icon="status/error-trans"></capitec-icon>
					<slot name="sub-detail"></slot>
				</capitec-group>`
			: html``;
	}
}

customElements.define(`horizon-error-screen`, ErrorScreen);