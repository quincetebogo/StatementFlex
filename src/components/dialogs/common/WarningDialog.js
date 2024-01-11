import { Component, css, html } from 'platform/elements';
import 'platform/components/popups/Modal';

/**
 * A warning dialog that prompts the agent to alert the status
 *
 * @export
 * @class WarningDialog
 * @extends {Component}
 */

export class WarningDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			content: { state: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		ineum(`page`, `Warning dialog`);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------


	_onOkayClick() {
		this.dispatchEvent(new CustomEvent(`on-okay`, {}));
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					height: 326px;
					width: 376px;
					border-radius: 4px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-header-background-color: #F9EBDD;
					--theme-modal-footer-padding: 8px 14px 8px 0px;
				}

				div[slot="header"] {
					width: 376px;
					height: auto;
					position: absolute;
					display: flex;
					align-items: center;
					left: -350px;
					top: -11px;
					--theme-modal-header-height: 64px;
					padding-left: 43px;
				}

				capitec-content-box {
					height: 198px;
					width: 345px;
					border-bottom: 1px solid #E1E1E1;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 21px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
				}

				capitec-label[type="subtitle"] {
					padding-left: 16px;
					height: 24px;
					width: auto;
					line-height: 24px;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
				}

				capitec-label{
					height: 160px;
					width: 300px;
					margin: 0px;
					color: #3A3A3A;

					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 500;
				}

				.status-icon {
					height: var(--theme-icon-size-default,24px);
					width: 24px;
					margin-right: 0px;
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
					--theme-button-padding-top: 10px;
					--theme-button-padding-right: 22px;
					--theme-button-padding-bottom: 10px;
					--theme-button-padding-left: 22px;
				}

				#id-okay-button {
					width: 103px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					<span>
						<capitec-group layout="horizontal">
							<img class="status-icon" src="/images/statusIcons/horizon-warning-trans.svg"/>
							<capitec-label type="subtitle" label="Warning!"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body">
					<capitec-content-box>
						<capitec-label label="${this.content}"></capitec-label>
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button 
						id="id-okay-button" 
						type="primary" 
						label="Okay" 
						@click="${() => this._onOkayClick()}">
				</capitec-button>
			</capitec-group>
		
			`;
	}
}
window.customElements.define(`horizon-warn-dialog`, WarningDialog);