import { Component, css, html } from 'platform/elements';

/**
 * A generic error screen component. Most input is set via properties but there is a named slot (detail)
 * for the error message detail.
 *
 * @export
 * @class ServiceCallErrorScreen
 * @extends {Component}
 */
export class ServiceCallErrorScreen extends Component {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.header = ``;
		this.left = ``;
		this.right = ``;
		this.image = null;
		this.bannerDetail = ``;
		this.displayBanner = true;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	* @property {String} header The heading for the error screen
	* @property {String} left The text for the left hand buttoon
	* @property {String} right The text for the right hand button
	* @readonly
	* @static
	* @memberof ErrorScreen
	*/
	static get properties() {
		return {
			header: { type: String },
			left: { type: String },
			right: { type: String },
			image: { type: String },
			bannerDetail: { type: String },
			displayBanner: { type: Boolean }
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
					height: var(--horizon-service-call-error-screen-height, 918px);
					width: var(--horizon-center-panel-width, 1064px);
				}
				.card > capitec-group[layout="vertical"] {
					height: var(--horizon-service-call-error-screen-size, 750px);
				}
				#id-unsuccessful-img {
					width: var(--horizon-service-call-error-screen-img-width, auto);
					height: var(--horizon-service-call-error-screen-img-height, auto);
					margin-top: -50px;
				}
				#id-verify-unsuccessful {
					height: 32px;
					margin: 0px auto 0px auto;
					margin-top: var(--horizon-service-call-error-screen-header-margin-top, 51px);
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
				}
				#id-button-group {
					justify-content: center;
					margin-top: 70px;
				}
				.button{
					height: 48px;
					--theme-button-font-weight: 600;
					--theme-button-font-size: 16px;
					--theme-button-font-family: "Hind Vadodara";
					--theme-button-padding-top: 13px;
					--theme-button-padding-bottom: 13px;
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
				.banner-top {
					padding: 16px;
					--theme-alert-banner-unsuccessful-red-font-color: #3A3A3A;
				}
			`
		];
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
				
				${this._renderBanner()}

				<capitec-group
					layout="vertical"
					gap="clear"
					halign="center"
					valign="center">
					<img id="id-unsuccessful-img" src="${this.image}" />
					<capitec-label id="id-verify-unsuccessful" label="${this.header}"></capitec-label>
					<capitec-group id = "id-msg-group" layout="horizontal">
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
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderBanner() {
		return this.bannerDetail 
		? html`
			<horizon-alert-banner
				?hidden="${!this.displayBanner}"
				class="banner-top"
				type="error"
				header="Notify Client: "
				label="${this.bannerDetail}">
			</horizon-alert-banner>`
		: html``;
	}
}

customElements.define(`horizon-service-call-error-screen`, ServiceCallErrorScreen);