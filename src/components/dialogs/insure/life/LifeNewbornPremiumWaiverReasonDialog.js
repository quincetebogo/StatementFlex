import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { LIFE_BENEFIT_REASONS, LIFE_BENEFIT_TYPES, LIFE_CLIENT_SUMMARY_BENEFIT_TYPES, LIFE_POLICY_RULES } from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import 'app/components/dialogs/insure/AgreementDialog';

/**
 * 
 * 
 * Events Raised 
 * -------------
 * close-modal
 *  
 * @export
 * @class LifeNewbornPremiumWaiverReasonDialog
 * @extends {Component}
 */

class LifeNewbornPremiumWaiverReasonDialog extends Component {

	// #region INITIALIZE
	constructor() {
		super();

		this.benefitReasons = LIFE_BENEFIT_REASONS;
		this.policy = {};
		this.cancelBenefit = false;
		this.showAgreement = false;
		this.waiverSelected = false;
		this.checkConfirmed = false;
		this.selectedReason = ``;
		this.showLifeNewbornPremiumWaiverDialog = false;
	}
	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	* @param {Object} lifeNewbornWaiverAgreementDetails newborn waiver agreement details
	* @param {Object} policy details
	* @param {Object} executeActivateBenefit callback function to execute activate benefit
	* @param {Object} executeCancelBenefit callback function to execute cancel benefit
	* @readonly
 	* @static
	*/

	
	static get properties() {
		return {
			newbornWaiverAgreementDetails: { type: Object, state: true },
			policy: { type: Object, state: true },
			executeLifeActivateBenefit: { type: Object, state: true },
			executeLifeCancelBenefit: { type: Object, state: true },
			showAgreement: { type: Boolean, state: true },
			waiverSelected: { type: Boolean, state: true },
			checkConfirmed: { type: Boolean, state: true },
			fetchLifeBenefitDetails: { type: Object, state: true },
			lifeBenefitDetails: { type: Object, state: true },
			nbpwBenefit: { type: Object, state: true },
			showLifeNewbornPremiumWaiverDialog: { type: Boolean, state: true }

		};
	}
	// #endregion PROPERTIES
	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
		connectedCallback() {
			super.connectedCallback();
			this._initialise();
		}
	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS
	/**
/**
 * Initialize component when loaded 
 * Resets last selected relationship
 * @returns {void}
 */
async _initialise() {
    this.newbornWaiverAgreementDetails = {};
    this.cancelBenefit = false;
    this.showAgreement = false;
    this.waiverSelected = false;
    this.checkConfirmed = false;
    this.showLifeNewbornPremiumWaiverDialog = false;

    this.nbpwBenefit = this.policy?.benefit;
    if (this.nbpwBenefit?.benefitStatus === LIFE_CLIENT_SUMMARY_BENEFIT_TYPES.ACTIVE) {
        this.cancelBenefit = true;
        this.lifeBenefitDetails = await this.fetchLifeBenefitDetails(this.policy.contractReference);
    }
}

// #endregion PRIVATE METHODS
	// #endregion PRIVATE METHODS
	// #region EVENT HANDLERS
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, { detail: { successMessage: `` } }));
	}

	/**
	 * comfirm event from the dialog footer button
	 * @returns {void}
	 */
	async _confirmLifeClick() {
		let response = {};
		if (this.cancelBenefit === false) {
			response = await this.executeLifeCancelBenefit(this.selectedReason, LIFE_BENEFIT_TYPES.NEW_BORN_WAIVER, this.policy);
		} else {
			response = await this.executeLifeCancelBenefit(this.policy);
		}
		if (response.successful) {
			let benefitSuccessMessage = ``;
			if (this.cancelBenefit === false) {
				benefitSuccessMessage = `Newborn Premium Waiver has been successfully activated.`;
			} else {
				benefitSuccessMessage = `Newborn Premium Waiver has been successfully cancelled.`;
			}

			this.dispatchEvent(new CustomEvent(`close-modal`, { detail: { successMessage: benefitSuccessMessage } }));
		}
	}

	_checkChange(e, reason) {
		this.checkConfirmed = e.detail.new;
		this.selectedReason = reason;
		this.requestUpdate(); 
	}

	_closeLifeNewbornPremiumWaiverDialog(e) {
		// Reset state
		this.showLifeNewbornPremiumWaiverDialog = false;
		this.waiverSelected = false;
		this.selectedReason = '';
		this.checkConfirmed = false;
		this.docsValidated = false;
	}

	_handleContinueClick() {
			this.showLifeNewbornPremiumWaiverDialog = true;
			this.waiverSelected = true;
			this.requestUpdate(); // Ensure the component re-renders
	}

	// #endregion EVENT HANDLERS
	_webTemplate() {
		return html`
			<capitec-modal type="alert" header="${this.cancelBenefit ? `Cancel Newborn Premium Waiver` : `Activate Newborn Premium Waiver`}" style="--theme-modal-header-color: black; --theme-modal-alert-m-l-xl-width: 400px;">
				<div slot="body" class="${this.waiverSelected || this.cancelBenefit ? `body-box-confirm` : `body-box-validate`}">
					${this._renderDialogBody()}
				</div>
				<div slot="footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`;
	}

/**
 * Render modal body section
 * 
 * @returns {html} The html content of the component.
 */
_renderDialogBody() {
    return html`
        ${this.showLifeNewbornPremiumWaiverDialog ? html`
            <horizon-insure-life-newborn-premium-waiver-dialog
                .policy="${this.policy}"
                .selectedReason="${this.selectedReason}"
                .executeLifeActivateBenefit="${(activationReason, benefitType, policy) => this.executeLifeActivateBenefit(activationReason, benefitType, policy)}"
                @close-modal="${(e) => this._closeLifeNewbornPremiumWaiverDialog(e)}">
            </horizon-insure-life-newborn-premium-waiver-dialog>
        ` : html`
            ${this.waiverSelected === false && this.cancelBenefit === false ? html`
                <div>
                    <capitec-label label="You are about to activate Newborn waiver benefit, please select waiver reason:" type="subtitle"></capitec-label>
                </div>
                <ul></ul><ul></ul><ul></ul><ul></ul>
                <capitec-radio-group>
                    <capitec-group layout="grid" rows="auto" columns="auto" gap="100px">
                        <capitec-radio 
                            id="Adoption" 
                            name="waiverReason"
                            label="Adoption"
                            ?checked="${this.selectedReason === `Adoption`}"
                            @value-change="${(e) => this._checkChange(e, `Adoption`)}"
                            row="1" column="1">
                        </capitec-radio>
                        <ul></ul>
                        <capitec-radio 
                            id="Birth" 
                            name="waiverReason"
                            label="Birth"
                            ?checked="${this.selectedReason === `Birth`}"
                            @value-change="${(e) => this._checkChange(e, `Birth`)}"
                            row="2" column="1">
                        </capitec-radio>
                    </capitec-group>
                </capitec-radio-group>
            ` : html`
                ${this.cancelBenefit === false ? html`
                    <div>
                        <capitec-label label="Are you sure you would like to activate this Benefit?" type="subtitle"></capitec-label>
                    </div>
                ` : html`
                    <div>
                        <capitec-label label="Your Newborn Premium Waiver benefit will be cancelled and your next collection date will be on ${formatDate(this.policy.nextCollectionDate, `dd mmm yyyy`)}" type="strong"></capitec-label>
                    </div>
                `}
            `}
        `}
    `;
}

		
	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button slot="footer" type="secondary" label="Cancel" class="capitec-button-small"
					@click="${() => this._cancelClick()}">
				</capitec-button>
				${this.waiverSelected === false && this.cancelBenefit === false ? html`
					<capitec-button slot="footer" type="primary" label="Continue" class="capitec-button-small" .disabled="${!this.checkConfirmed}"
						@click="${() => this._handleContinueClick()}">
					</capitec-button>
				` : html`
					<capitec-button slot="footer" type="primary" label="Confirm" class="capitec-button-small"
						@click="${() => this._confirmLifeClick()}">
					</capitec-button>
				`}
				
		`;
	}

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
					${INSURE_CSS}
	
					capitec-modal {
						height: 326px;
						border-radius: 5px;
						--theme-modal-header-padding-top: 32px;
						--theme-modal-header-padding-bottom: 32px;
						--theme-modal-header-padding-right: 31px;
						--theme-modal-header-padding-left: 31px;
						--theme-modal-header-background-color: #f7f7f7;
						--theme-modal-footer-padding: 0px 16px 17px 0px;
					}
	
					.body-box-validate {
						width: 100%; 
						height: 280px;
					}
	
					.body-box-confirm {
						width: 100%; 
						height: 50px;
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
					}
	
					.select-box {
						padding-top: 16px;
					}
					
					.
					
				`
			];
		}
	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-newborn-premium-waiver-reason-dialog`, LifeNewbornPremiumWaiverReasonDialog);