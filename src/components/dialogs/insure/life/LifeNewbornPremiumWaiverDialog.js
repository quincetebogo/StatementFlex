import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { LIFE_CLIENT_SUMMARY_BENEFIT_TYPES, LIFE_BENEFIT_REASONS, LIFE_BENEFIT_TYPES, LIFE_POLICY_RULES } from 'app/constants/InsureCommon';
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
 * @class LifeNewbornPremiumWaiverDialog
 * @extends {Component}
 */

class LifeNewbornPremiumWaiverDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.benefitReasons = LIFE_BENEFIT_REASONS;
		this.policy = {};
		this.cancelBenefit = false;
		this.showAgreement = false;
		this.docsValidated = false;
		this.checkConfirmed = false;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES
	/**
 * @param {Object} lifeNewbornWaiverAgreementDetails newborn waiver agreement details
 * @param {Object} policy details
 * @param {Object} executeActivateBenefit callback function to execute activate benefit
 * @param {Object} executeCancelBenefit callback function to execute cancel benefit
 * 
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
			docsValidated: { type: Boolean, state: true },
			checkConfirmed: { type: Boolean, state: true },
			fetchLifeBenefitDetails: { type: Object, state: true },
			lifeBenefitDetails: { type: Object, state: true },
			nbpwBenefit: { type: Object, state: true }

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
	 * Initialize component when loaded 
	 * Resets last selected relationship
	 * @returns {void}
	 */
	async _initialise() {

		this.nbpwBenefit = this.policy?.benefit;
		if (this.nbpwBenefit?.benefitStatus === LIFE_CLIENT_SUMMARY_BENEFIT_TYPES.ACTIVE) {
			this.cancelBenefit = true;
			this.lifeBenefitDetails = await this.fetchLifeBenefitDetails(this.policy.contractReference);

		}

	}
	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_cancelClick() {
		// Reset state
		this.docsValidated = false;
		this.waiverSelected = false;
		this.showLifeNewbornPremiumWaiverDialog = false;
		this.selectedReason = '';
		this.checkConfirmed = false;
	
		// Close modal
		this.dispatchEvent(new CustomEvent(`close-modal`, { detail: { successMessage: `` } }));
	}

	/**
	 * comfirm event from the dialog footer button
	 * @returns {void}
	 */
	async _confirmLifeClick() {
		let response = {};
		if (this.cancelBenefit === false) {
			response = await this.executeLifeActivateBenefit(`Birth`, LIFE_BENEFIT_TYPES.NEW_BORN_WAIVER, this.policy);
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

	_valueSelected(e) {
		this.activationReason = e.detail.new;
		this.requestUpdate();

	}

	_checkChange(e) {
		this.checkConfirmed = e.detail.new;
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

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */

	_webTemplate() {
		return html`
			<capitec-modal type="alert" header="${this.cancelBenefit ? `Cancel Newborn Premium Waiver` : `Activate Newborn Premium Waiver`}" style="--theme-modal-header-color: black; --theme-modal-alert-m-l-xl-width: 485px;">
				<div slot="body" class="${this.docsValidated || this.cancelBenefit ? `body-box-confirm` : `body-box-validate`}">
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
			
		${this.docsValidated === false && this.cancelBenefit === false ? html`
			
			<div>
				<capitec-label label="Please ensure that at least one of the following documents have been received and validated:" type="subtitle"></capitec-label>
			</div>

			<ul>
				<li>Unabridged birth certificate (from Department of Home Affairs)</li>
				<li>Hospital/clinic card (from hospital/clinic where baby was born)</li>
				<li>Adoption letter (from agency when adoption was finalised)</li>
			</ul>

			<capitec-check-group>
				<capitec-check label="I Confirm that one of the above documents have been received and validated"
					@value-change="${(e) => this._checkChange(e)}">
				</capitec-check>
			</capitec-check-group>

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
				${this.docsValidated === false && this.cancelBenefit === false ? html`
					<capitec-button slot="footer" type="primary" label="Continue" class="capitec-button-small" .disabled="${!this.checkConfirmed}"
						@click="${() => this.docsValidated = true}">
					</capitec-button>
				` : html`
					<capitec-button slot="footer" type="primary" label="Confirm" class="capitec-button-small"
						@click="${() => this._confirmLifeClick()}">
					</capitec-button>
				`}
				
		`;
	}
	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-life-newborn-premium-waiver-dialog`, LifeNewbornPremiumWaiverDialog);