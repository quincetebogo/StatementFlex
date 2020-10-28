import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/HorizonOptionButton';

import 'app/components/insure/InsureHowToClaim';

import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/dialogs/common/VerifyCaller';
import 'app/components/dialogs/common/EndCallSession';

import 'app/components/dialogs/insure/CalculatePremium';
import 'app/components/dialogs/insure/NonAdvisoryDisclaimer';
import 'app/components/dialogs/insure/SolutionViewPlan';
import 'app/components/dialogs/insure/ChooseAnUpdateOption';
import 'app/components/dialogs/insure/SolutionPayArrears';
import 'app/components/dialogs/insure/SolutionCancelPlan';
import 'app/components/dialogs/insure/SolutionEmailPlan';
import 'app/components/dialogs/insure/AssignReasonDialog';
import 'app/components/dialogs/insure/AssignReasonSelected';

const SOLUTION_SET = {
	VIEW_PLAN: `View Plan`,
	UPDATE_PLAN: `Update Plan`,
	PAY_ARREARS: `Pay Arrears`,
	HOW_TO_CLAIM: `How to Claim`,
	EMAIL_PLAN: `Email Plan`,
	BENEFITS: `Benefits`,
	CANCEL_PLAN: `Cancel Plan`,
	VIEW_STATUS: `View Status`
};

const RENDER_MODE = {
	MAIN_PAGE: 0,
	DISCLAIMER: 1,
	ASSIGN: 2,
	END_CALL: 3,
	VERIFY_NOW: 4,
	CALCULATE_PREMIUM: 5
};

/**
 * The Insure ThirdPartyOrExistingClient component is used to implement the views for the 
 * third party, unverified existing client and verified existing client insure landing pages. 
 *
 * @export
 * @class ThirdPartyOrExisingClient
 * @extends {Component}
 */
export class ThirdPartyOrExistingClient extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.clientType = ``;
		this.solutionsAvailable = [];
		this.solutionSelected = ``;
		this.renderMode = RENDER_MODE.DISCLAIMER;
		this.displayToast = false;
		this.selectedAssignReason = ``;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------
	/**
	 * @property {string} clientType - Must be 'unverified-existing-client', 'verified-existing-client' or 'third-party-client. 
	 *
	 * @readonly
	 * @static
	 * @memberof ThirdPartyOrExistingClient
	 */
	static get properties() {
		return {
			clientType: { type: String },
			renderMode: { type: String },
			solutionsAvailable: { type: Array },
			solutionSelected: { type: String },
			displayToast: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = this.horizonStore.recoverState();

		this.incomingCallDetails = state.incomingCallDetails;
		this.unverifiedCaller = state.unverifiedCaller;

		this.eventAggregator.publish(
			`mini-client-profile`,
			{
				name: this.unverifiedCaller.fullName,
				idNumber: this.unverifiedCaller.idNumber,
				phoneNumber: this.unverifiedCaller.incomingTelephoneNumber,
				livesIn: this.unverifiedCaller.livesIn,
				languagePreference: ``,
				birthday: this.unverifiedCaller.birthdate,
				isConfirmed: true
			}
		);
		
		if (this.clientType === `unverified-existing-client`) {
			this.eventAggregator.publish(
				`horizon-update-left-hand-bar`,
				{
					clientType: this.clientType,
					isProfileButtonVisible: false,
					isDocumentsButtonVisible: false,
					subtitle: {
						savingsAccount: `Active`,
						savingsPlan: `Active`,
						insure: `Active`,
						credit: `Rethink credit, realise dreams`
					},
					detail: {
						savingsAccount: ``,
						savingsPlan: ``,
						insure: ``,
						credit: ``
					}
				}
			);
		} else if (this.clientType === `verified-existing-client`) {
			this.eventAggregator.publish(
				`horizon-update-left-hand-bar`,
				{
					clientType: this.clientType,
					isProfileButtonVisible: true,
					isDocumentsButtonVisible: true,
					subtitle: {
						savingsAccount: `Active`,
						savingsPlan: `Active`,
						insure: `2 Funeral Plans`,
						credit: `Rethink credit, realise dreams`
					},
					detail: {
						savingsAccount: ``,
						savingsPlan: ``,
						insure: ``,
						credit: ``
					}
				}
			);
		};

		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			}
		);

		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._onAssignIncident());
		this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._onVerifyNowClick());
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_onToggleToastDisplay() {
		this.displayToast = false;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onCancelEndCall() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onAssignIncident() {
		this.renderMode = RENDER_MODE.SELECT_ASSIGN_REASON;
	}

	_onAssignReasonSelected(e) {
		this.selectedAssignReason = e.detail.reason;
		this.renderMode = RENDER_MODE.ASSIGN;
	}

	_onCancelSelectAssignReason() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onCancelAssign() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onAssign() {
		this.isReassigned = true;
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onVerifyNowClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	_onSkipVerification(e) {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.solutionSelected = ``;
	}

	_onCalculatePremium() {
		this.renderMode = RENDER_MODE.CALCULATE_PREMIUM;
	}

	_onCalculatedPremium(e) {
		if (e.detail.assign) {
			this.selectedAssignReason = e.detail.assignReason;
			this.renderMode = RENDER_MODE.ASSIGN;
		} else {
			this.renderMode = RENDER_MODE.MAIN_PAGE;
		}
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

				.toast{
					position: absolute;
					top : 170px;
					left: 790px;
					width : 323px;
					height: 64px;
					z-index: 201;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		switch (this.solutionSelected) {
			case SOLUTION_SET.HOW_TO_CLAIM:
                return html`<horizon-how-to-claim
                                @close-solution="${() => this.solutionSelected = ``}">
                            </horizon-how-to-claim>`;
			default:
				return html`
						<capitec-card class="card">
							<capitec-title-bar class="title-bar" type="insure">
								<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
								<capitec-label label="Insure" type="title"></capitec-label>
								<capitec-spacer></capitec-spacer>
								<capitec-button class="calculate-button" type="white" label="Calculate Premium"
									@click="${() => this._onCalculatePremium()}">
								</capitec-button>
							</capitec-title-bar>
							<capitec-content-box class="${this.clientType === `verified-existing-client` ? `verified-existing-client-cb` : `third-party-client-cb`}">
								${this._render3rdPartyAlertBanner()}
								${this._renderUnverifiedExistingClientAlert()}
								<capitec-label type="default"
                                            label="Choose an Option"
									        class="${this.clientType === `verified-existing-client` ? `` : `third-party-client-label`}">
								</capitec-label>
								<capitec-group layout="horizontal" halign="left" valign="top" gap="clear" wrap>
									${this.solutionsAvailable.map((item) => this._renderOptionButtons(item))}
								</capitec-group>
							</capitec-content-box>
						</capitec-card>
						${this._renderVerifiedToast()}
						${this._renderUnverifiedToast()}
						${this._renderCalculatePremium()}
						${this._renderDislaimer()}
						${this._renderSolutionDialog()}
						${this._renderEndCallSessionDialog()}
						${this._renderSelectAssignReason()}
						${this._renderAssign()}
						${this._renderVerifyNowModal()}
				`;
		}
	}

	_renderDislaimer() {
		if (this.renderMode === RENDER_MODE.DISCLAIMER) {
			return html`
					<horizon-non-advisory-disclaimer
							@click="${() => { 
								this.renderMode = RENDER_MODE.MAIN_PAGE;
								this.displayToast = true;
								window.setTimeout(() => this._onToggleToastDisplay(), 3000);
							 }}">
					</horizon-non-advisory-disclaimer>
			`;
		}
		return html``;
	}

	_renderVerifiedToast() {
		if (this.clientType === `verified-existing-client` && this.displayToast) {
            return html`<capitec-toast class="toast"
                                        type="success" 
                                        header="Successfull" 
                                        detail="Client has been verified">
                        </capitec-toast>`;
		}
	}

	_renderUnverifiedToast() {
		if (this.clientType === `unverified-existing-client` && this.displayToast) {
            return html`<capitec-toast class="toast" 
                                        type="warning" 
                                        header="Not Verified" 
                                        detail="Only limited information will be displayed.">
                        </capitec-toast>`;
		}
	}

	_render3rdPartyAlertBanner() {
		if (this.clientType === `third-party-client`) {
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
		if (this.clientType === `unverified-existing-client`) {
			return html`
				<capitec-alert-banner type="warning">
					Client has not been verified, so you are only able to see limited information.
					<capitec-hyperlink 
						label="Verify Now"
						@click="${() => this._onVerifyNowClick()}">
					</capitec-hyperlink>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderOptionButtons(item) {
		return html`
			<horizon-option-button 
				label="${item.label}" 
                icon="${item.icon}"
                iconSize="${item.iconSize}"
				img-src="/images/insure/${item.imgSRC}" 
                @click="${() => this.solutionSelected = item.label}">
			</horizon-option-button>
		`;
	}

    _renderSolutionDialog() {

		if (this.clientType === `unverified-existing-client` && this.solutionSelected) {
			return html`
				<horizon-client-not-verified 
					@cancel="${() => this.solutionSelected = ``}"
					@verify-now="${() => this._onVerifyNowClick()}">
				</horizon-client-not-verified>
			`;
		}
		
			switch (this.solutionSelected) {
				case SOLUTION_SET.VIEW_PLAN:
				case SOLUTION_SET.VIEW_STATUS:
                    return html`<horizon-view-plan
                                    @solution-provided="${() => this.solutionSelected = ``}"
	                                @close-solution="${() => this.solutionSelected = ``}"
                                    clientType = "${this.clientType}">
                                </horizon-view-plan>`;

				case SOLUTION_SET.UPDATE_PLAN:
                    return html`<horizon-choose-update-option
                                    @solution-provided="${() => this.solutionSelected = ``}"
	                                @close-solution="${() => this.solutionSelected = ``}">
                                </horizon-choose-update-option>`;

				case SOLUTION_SET.PAY_ARREARS:
                    return html`<horizon-pay-arrears
                                    @solution-provided="${() => this.solutionSelected = ``}"
	                                @close-solution="${() => this.solutionSelected = ``}">
                                </horizon-pay-arrears>`;

				case SOLUTION_SET.EMAIL_PLAN:
                    return html`<horizon-email-plan
                                    @solution-provided="${() => this.solutionSelected = ``}"
	                                @close-solution="${() => this.solutionSelected = ``}">
                                </horizon-email-plan>`;

				case SOLUTION_SET.BENEFITS:
					return html``;

				case SOLUTION_SET.CANCEL_PLAN:
                    return html`<horizon-cancel-plan
                                    @solution-provided="${() => this.solutionSelected = ``}"
	                                @close-solution="${() => this.solutionSelected = ``}">
                                </horizon-cancel-plan>`;

				default:
					return html``;
			}
		
	}

	_renderEndCallSessionDialog() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session
                    @cancel="{${() => this._onCancelEndCall()}}"
	                .incomingCallDetails = "${this.incomingCallDetails}">
                </horizon-end-call-session>`;
		}
		return html``;
	}

	_renderSelectAssignReason() {
		if (this.renderMode === RENDER_MODE.SELECT_ASSIGN_REASON) {
			return html`
				<horizon-insure-assign-reason
                    @on-assign-reason=${(e) => this._onAssignReasonSelected(e)}
	                @on-cancel=${() => this._onCancelSelectAssignReason()}>
                </horizon-insure-assign-reason>`;
		}
		return html``;
	}

	_renderAssign() {
		if (this.renderMode === RENDER_MODE.ASSIGN) {
			return html`
				<horizon-assign-reason-selected
                    .selectedReason = "${this.selectedAssignReason}"
                    @on-cancel=${() => this._onCancelAssign()}
					@on-assign=${() => this._onAssign()}>
				</horizon-assign-reason-selected>`;
		}
		return html``;
	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`
				<horizon-verify-caller 
					.incomingCallDetails="${this.incomingCallDetails}"
					@skip="${(e) => this._onSkipVerification(e)}">
				</horizon-verify-caller>`;
		}
		return html``;
	}

	_renderCalculatePremium() {
		if (this.renderMode === RENDER_MODE.CALCULATE_PREMIUM) {
			return html`
				<horizon-calculate-premium 
					.incomingCallDetails="${this.incomingCallDetails}"
					@cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"
					@done="${(e) => this._onCalculatedPremium(e)}">
				</horizon-calculate-premium>`;
		}
		return html``;
	}


}

window.customElements.define(`horizon-third-party-or-existing-client`, ThirdPartyOrExistingClient);