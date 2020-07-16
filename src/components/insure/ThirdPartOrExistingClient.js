import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/core';

import '../Common/HorizonOptionButton';
import '../dialogs/insure/NonAdvisoryDisclaimer';
import '../dialogs/Insure/SolutionViewPlan';
import '../dialogs/Insure/SolutionPayArrears';
import '../dialogs/Insure/SolutionEmailPlan';

const SOLUTION_SET = {
	VIEW_PLAN: 'View Plan',
	UPDATE_PLAN: 'Update Plan',
	PAY_ARREARS: 'Pay Arrears',
	HOW_TO_CLAIM: 'How To Claim',
	EMAIL_PLAN: 'Email Plan',
	BENEFITS: 'Benefits',
	CANCEL_PLAN: 'Cancel Plan'
}

const RENDER_MODE = {
	MAIN_PAGE: 0,
	DISCLAIMER: 1
};

export class ThirdPartyOrExisingClient extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = -1;
		this.clientType = "";
		this.solutionsAvailable = [];
		this.solutionSelected = "";
		this.renderMode = RENDER_MODE.DISCLAIMER;

		this.eventAggregator = EventAggregator.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------
	static get properties() {
		return {
			renderMode: { type: String },
			solutionsAvailable: { type: Array },
			clientType: { type: String },
			solutionSelected: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.eventAggregator.publish('horizon-update-call_actionbar',
			{
				referenceNo: "73023022",
				phoneNumber: "0631152973",
				ivrOptionCode: "Insure"
			});
		this._showToast();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_showToast() {
		if (this.clientType === 'verified-existing-client') {
			this._renderVerifiedToast();
		}
		else if (this.clientType === 'unverified-existing-client') {
			this._renderUnverifiedToast();
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

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
					height: 876px;
				}

				capitec-card {
					height: inherit;
				}

				capitec-content-box {
					height: auto;
					width: 1064px;
				}
				.verified-existing-client-cb {
					--theme-container-padding-left: 24px;
					--theme-container-padding-top: 20px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
				}
				.third-party-client-cb {
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}

				capitec-content-box > capitec-label {
					color: #3E4547;

					--theme-layout-gap-spacing: 0px;
					--theme-label-default-font-size: 20px;
					--theme-label-default-font-weight: 600;
				}
				.third-party-client-label {
					margin-top: 24px;
				}
				
				capitec-alert-banner {
					--theme-layout-gap-spacing: 0px;
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-warning-border: none;
					--theme-alert-banner-warning-font-color: #C46D17;
				}
				
				horizon-option-button {
					height: 80px;
					width: 236px;
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					background-color: #FFFFFF;
					margin-top: 24px;

					--theme-layout-gap-spacing: 24px;
					--theme-button-default-border-width: 0px;
					--theme-button-padding-top: 14.5px;
					--theme-button-padding-bottom: 14.5px;

					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
					--horizon-option-btn-text-margin-top: 3px;
					--horizon-option-btn-text-line-height: 20px;
					--horizon-option-btn-text-font-weight: 500;
					--horizon-option-btn-text-color: #545D60;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">
				<capitec-title-bar class="title-bar" type="insure">
					<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
					<capitec-label label="Insure" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
				</capitec-title-bar>
				<capitec-content-box class="${this.clientType === 'verified-existing-client' ? 'verified-existing-client-cb' : 'third-party-client-cb'}">
					${this._render3rdPartyAlertBanner()}
					${this._renderUnverifiedExistingClientAlert()}
					<capitec-label type="default" 
								   label="Choose an Option"
								   class="${this.clientType === 'verified-existing-client' ? '' : 'third-party-client-label'}">
					</capitec-label>
					<capitec-group layout="horizontal" halign="left" valign="top" gap="clear" wrap>
						${this.solutionsAvailable.map((item) => this._renderOptionButtons(item))}
					</capitec-group>
				</capitec-content-box>
			</capitec-card>
			${this._renderDislaimer()}
			${this._renderSolutionDialog()}
		`;
	}

	_renderDislaimer() {
		if (this.renderMode == RENDER_MODE.DISCLAIMER) {
			return html`
					<horizon-non-advisory-disclaimer 
							@click="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
					</horizon-non-advisory-disclaimer>
			`;
		}
		return html``;
	}

	_renderVerifiedToast() {
		showToastTimed("success", "top", "Successful", "Client has been verified", 3000, true, null);
	}

	_renderUnverifiedToast() {
		showToastTimed("warning", "top", "Not Verified", "Only limited information will be displayed.", 3000, true, null);
	}

	_render3rdPartyAlertBanner() {
		if (this.clientType === 'third-party-client') {
			return html`
				<capitec-alert-banner type="warning" 
									label="Caller is a beneficiary or 3rd party - only limited information available." 
									closable>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderUnverifiedExistingClientAlert() {
		if (this.clientType === 'unverified-existing-client') {
			return html`
				<capitec-alert-banner type="warning" closable>
					Client has not been verified, so you are only able to see limited information.
					<capitec-hyperlink label="Verify Now"></capitec-hyperlink> 
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderOptionButtons(item) {
		return html`
				<horizon-option-button label="${item.label}"
										icon="${item.icon}"
										iconSize="${item.iconSize}"
										img-src="../../../images/insure/${item.imgSRC}"
										@click="${() => this.solutionSelected = item.label}">
				</horizon-option-button>
		`;
	}

	_renderSolutionDialog() {

		switch (this.solutionSelected) {
			case SOLUTION_SET.VIEW_PLAN:
				return html`<horizon-view-plan
								@solution-provided="${() => this.solutionSelected = ''}"
								@close-solution="${() => this.solutionSelected = ''}">
							</horizon-view-plan>`;

			case SOLUTION_SET.UPDATE_PLAN:
				return html``;

			case SOLUTION_SET.PAY_ARREARS:
				return html`<horizon-pay-arrears
								@solution-provided="${() => this.solutionSelected = ''}"
								@close-solution="${() => this.solutionSelected = ''}">
							</horizon-pay-arrears>`;

			case SOLUTION_SET.HOW_TO_CLAIM:
				return html``;

			case SOLUTION_SET.EMAIL_PLAN:
				return html`<horizon-email-plan 
								@solution-provided="${() => this.solutionSelected = ''}"
								@close-solution="${() => this.solutionSelected = ''}">
							</horizon-email-plan>`;

			case SOLUTION_SET.BENEFITS:
				return html``;

			case SOLUTION_SET.CANCEL_PLAN:
				return html``;

			default:
				return html``;
		}
	}
}

window.customElements.define(`insure-third-party-or-existing-client`, ThirdPartyOrExisingClient);