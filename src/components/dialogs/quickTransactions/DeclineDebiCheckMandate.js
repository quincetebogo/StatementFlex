import { Component, css, html } from 'platform/elements';

import 'platform/components/popups/Modal';

/**
 * Decline DebiCheck Mandate is used to confirm the mandate ID before declining it.
 * This component is invoked from the DebiCheck main screen on click of Decline button.
 * 
 * Events Raised 
 * -------------
 * cancel
 *  
 * @export
 * @class DeclineDebiCheckMandate
 * @extends {Component}
 */
export class DeclineDebiCheckMandate extends Component {

	// --------------
	// INITIALISATION
	// --------------
	
	constructor() {
		super();
		this.mandateId = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {String} mandateId - ID to be used when referencing the mandate.
	 *
	 * @readonly
	 * @static
	 * @memberof DeclineDebiCheckMandate
	 */
	static get properties() {
		return {
			mandateId: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		ineum(`page`, `Decline DebiCheck Dialog`);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel`));
	}

	_declineClick() {
		this.dispatchEvent(new CustomEvent(`decline`, {
			detail: { mandateId: this.mandateId }
		}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					height: 326px;
					width: 375;
					border-radius: 5px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-header-background-color: #F9EBDD;
					--theme-modal-footer-padding: 0px 16px 17px 0px;
				}
			
				div[slot="header"] {
					width: 375px;
					--theme-modal-header-height: 64px;
					position: absolute;
					display: flex;
					align-items: center;
					left: -352px;
					top: -15px;
				}

				div[slot="header"] > span {
					height: 24px;
					width: 300px;
					color: #FFFFFF;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					padding-left: 15px;
				}

				div[slot="body"] {
					width: 376px;
					height: 198px;
				}

				.body-box {
					height: 198px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 17px;
					--theme-container-padding-right: 16px;
				}

				.header-text {
					padding-left: 16px;
					height: 24px;
					width: auto;
					color: #d4781c;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
				}

				.body-details{
					height: 166px;
					width: 343px;
					color: #545D60;
					margin: 0px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
				}

				capitec-icon {
					--theme-icon-size-small: 27px;
					width: 20.31px;
					margin-right: 0px;
				}

				#id-decline-button {
					width : 100px;
					--theme-button-primary-border-width: 0px;
					
				}

				#id-cancel-button {
					width : 79px;
					margin-right: 16px;
					--theme-button-clear-border-width: 0px;
					
				}
				capitec-button {
					height: 48px;
					border-radius: 5px;
					--theme-button-height: 20px;
					--theme-button-width: 41px;
					--theme-button-color: #FFFFFF;
					--theme-button-font-family: "Hind Vadodara";
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-letter-spacing: 0;
					--theme-button-line-height: 20px;
					--theme-button-text-align: center;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 22px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 22px;
				}`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					<span>
						<capitec-group layout="horizontal">
							<capitec-icon size="small" icon="status/warning-trans"></capitec-icon>
							<capitec-label class="header-text" label="Decline DebiCheck Mandate"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderDetails() {
		return html`
			<p class="body-details">Are you sure you want to decline the DebiCheck Mandate for <b>${this.mandateId}</b></p>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
							id="id-cancel-button"
							type="clear"
							label="Cancel"
							@click="${() => this._cancelClick()}">
				</capitec-button>
				<capitec-button
							id="id-decline-button"
							type="primary"
							label="Decline"
							@click="${() => this._declineClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

}

window.customElements.define(`horizon-decline-debicheck-mandate`, DeclineDebiCheckMandate);