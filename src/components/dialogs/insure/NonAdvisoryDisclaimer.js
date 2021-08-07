import { Component, css, html } from 'platform/elements';

import 'platform/components/popups/Modal';

export class NonAdvisoryDisclaimer extends Component {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	_onGotItClick() {
		this.dispatchEvent(new CustomEvent(`click`, {
			detail: {}
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
					--theme-modal-header-background-color: #DAF2F4;
					--theme-modal-footer-padding: 7px 27px 9px 0px;
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
					width: 375px;
					height: 198px;
				}

				.body-box {
					height: 198px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 17px;
				}

				.header-text {
					padding-left: 16px;
					height: 24px;
					width: auto;
					color: #05829B;
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
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
				}

				capitec-icon {
					--theme-icon-size-small: 27px;
					width: 20.31px;
					margin-right: 0px;
				}

				#id-done-button {
					height: 48px;
					width : 89px;
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
					--theme-button-primary-border-width: 0px;
					
				}`
		];

	}

	_webTemplate() {
		return html`
			<capitec-modal
				type="free" 
				header-align="left">
				<div slot="header">
					<span>
						<capitec-group layout="horizontal">
							<capitec-icon size="small" icon="status/info-trans"></capitec-icon>
							<capitec-label class="header-text" label="Non-advisory Disclaimer"></capitec-label>
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
			<capitec-label class="body-details" label="Capitec Bank is a licensed financial services provider. We will explain the features of our funeral plan to you and provide an estimated premium for your plan. We cannot provide advice to you.">
			</capitec-label>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-done-button"
					type="primary"
					label="Got It"
					@click="${() => this._onGotItClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

}

window.customElements.define(`horizon-non-advisory-disclaimer`, NonAdvisoryDisclaimer);