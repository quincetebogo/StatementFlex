import { Component, css, html } from 'platform/elements';

/**
 * A generic success screen component. Most input is set via properties but there is a named slot (detail)
 * for the success message detail.
 *
 * @export
 * @class SuccessScreen
 * @extends {Component}
 */
export class SuccessScreen extends Component {

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
		this.secondaryImage = ``;
		this.secondaryToast = ``;
		this.hasSubDetails = false;
		this.subContent = false;
		this.toastHeader = `Successful`;
		this.toastType = `success`;
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
	* @property {String} image The image to be displayed on center of the page
	* @property {String} secondaryToast Secondary toast details
	* @property {String} [hasSubDetails=false] Set to true if the screen should renter sub-details
	* @property {String} [subContent=false] Set to true if the screen should renter sub-content
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
			secondaryImage: { type: String }, 
			secondaryToast: { type: String },
			hasSubDetails: { type: Boolean },
			subContent: { type: Boolean },
			toastHeader: { type: String },
			toastType: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		window.setTimeout(() => this._closeToast(), 3000);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_closeToast() {
		this.displayToast = false;
	}

	_leftClick() {
		this.dispatchEvent(new CustomEvent(`left-click`, {}));
	}

	_rightClick() {
		this.dispatchEvent(new CustomEvent(`right-click`, {}));
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
				:host{
					width: 100%;
					height: 100%;
				}

				.card {
					width: 100%;
				}
				
				.card > capitec-group[layout="vertical"] {
					height: var(--horizon-success-screen-size, 744px);
				}

				#id-successful-img {
					width: auto;
				}
				#id-successful-header {
					margin-top: var(--horizon-success-screen-header-margin-top, 33px);
					margin-bottom: var(--horizon-success-screen-header-margin-bottom, 23px);
					height: 32px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 36px;
					text-align: center;
				}

				#id-msg-group{
					justify-content: center;
				}

				#id-sub-detail {
					justify-content: center;
				}

				#id-sub-content {
					margin-top: 24px;
					justify-content: center;
				}

				#id-button-group {
					justify-content: center;
					margin-top: var(--horizon-button-group-margin-top, 64px);
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
				.options-group{
					height: 80px; 
					margin:17px 0px 15px 16px;
				}

				#id-success-toast {
					width: 406px;
					position: absolute;
					top : var(--toast-top, 56px);
					margin-left: var(--toast-margin-left, 382px);
				}
				.secondary-toast {
					width: 406px;
					position: absolute;
					top : var(--toast-top, 130px);
					margin-left: var(--toast-margin-left, 382px);
				}
				
				slot[name=detail]::slotted(*){
					height: 24px;
					width: var(--theme-slot-detail-width , 543px);
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: var(--horizon-success-screen-detail-text-align, center);
					margin-bottom: 13px;
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
				.successIcon {
					display: var(--horizon-success-icon-display, block);
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">
				${this._renderToast()}
				${this._renderSecondaryToast()}

				<capitec-group
					layout="vertical"
					gap="none"
					halign="center"
					valign="center">
						${this._renderContent()}
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderToast() {
		return html`
			<capitec-toast 
				?hidden="${!this.displayToast}" 
				id="id-success-toast"
				type="${this.toastType}"
				header="${this.toastHeader}"
				detail="${this.toast}" 
				closable
				@click="${() => this.displayToast = false}">
			</capitec-toast>
		`;
	}

	_renderSecondaryToast() {
		return this.secondaryToast
			? html`
				<capitec-toast 
					?hidden="${!this.displayToast}"
					class="secondary-toast"
					type="success" 
					header="Successful" 
					detail="${this.secondaryToast}"
					closable 
					@click="${() => this.displayToast = false}">
				</capitec-toast>`
		: html``;
	}

	_renderContent() {
		return html`
			<img
				id="id-successful-img"
				src="${this.image}"/>
			<img
				id="id-secondary-img"
				src="${this.secondaryImage}"/>

			<capitec-label
				id="id-successful-header"
				label="${this.header}">
			</capitec-label>

			<capitec-group id="id-msg-group" layout="horizontal">
				<capitec-icon
					class="successIcon"
					size="default"
					icon="status/success-trans">
				</capitec-icon>
				<slot name="detail"></slot>
			</capitec-group>
			
			<capitec-group layout="horizontal">
				${this._renderSubDetail()}
			</capitec-group>

			<capitec-group layout="horizontal">
				${this._renderSubContent()}
			</capitec-group>

			<capitec-group id="id-button-group" layout="horizontal">
				${this._renderLeftButton()}
				${this._renderRightButton()}
			</capitec-group>
		`;
	}

	_renderSubDetail() {
		return this.hasSubDetails
		? html`
			<capitec-group 
				id="id-sub-detail" 
				layout="horizontal">
				<capitec-icon
					size="default"
					icon="status/success-trans">
				</capitec-icon>
					<slot name="sub-detail"></slot>
			</capitec-group>`
		: html``;
	}

	_renderSubContent() {
		return this.subContent
		? html`
			<capitec-group 
					id="id-sub-content" 
					layout="horizontal">
				<slot name="sub-content"></slot>
	 		</capitec-group>`
		: html``;
	}

	_renderLeftButton() {
		return this.left
		? html`
			<capitec-button
				id="button-left"
				class="center-button"
				label="${this.left}"
				@click="${() => this._leftClick()}">
			</capitec-button>`
		: html``;
	}

	_renderRightButton() {
		return this.right
		? html`
			<capitec-button
				class="center-button"
				type="primary"
				label="${this.right}"
				@click="${() => this._rightClick()}">
			</capitec-button>`
		: html``;
	}
}

customElements.define(`horizon-success-screen`, SuccessScreen);