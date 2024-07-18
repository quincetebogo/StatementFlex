import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { FUN_POLICY_RULES, FUN_BENEFIT_TYPES, FUN_BENEFIT_DOT_TYPES, POLICY_PAUSE_REASONS } from 'app/constants/InsureCommon';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import {formatDateToInsure} from "app/utils/insureUtils"
import 'app/components/dialogs/insure/AgreementDialog';


/**
 * 
 * 
 * Events Raised 
 * -------------
 * close-modal
 * go-to-confirm
 *  
 * @export
 * @class RequestCallback
 * @extends {Component}
 */
class FuneralPolicyPauseDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		
		this.policy = {};
		this.policyPauseReasons = POLICY_PAUSE_REASONS;
		this.selectedReason = null;
		this.showPolicyPauseAgreement = false;
		this.policyPauseDocumentDetails = {};
		this.errorMessage = ``;
		this.policyEligible = false;
		this.policyPauseInfo = {}
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} policy - contains selected policy information
	 * @property {String} selectedOption - Pause policy or cancel pause on policy
	 * @property {Function} activatePolicyPause - callback function to activate policy pause
	 * @property {Function} cancelPolicyPause - callback function to cancel policy pause
	 * @property {String} selectedReason - selected reason for activating policy pause
	 * @property {Boolean} showPolicyPauseAgreement - show policy pause agreement dialog
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			selectedOption: { type: String, state: true },
			activatePolicyPause: { type: Object, state: true },
			cancelPolicyPause: { type: Object, state: true },
			selectedReason: { type: String, state: true },
			errorMessage: { type: String, state: true },
			showPolicyPauseAgreement: { type: Boolean, state: true },
			policyEligible: { type: Boolean, state: true },
			policyPauseDocumentDetails: { type: Object, state: true },
			policyPauseInfo: { type: Object, state: true },
			fetchPolicyPauseAgreementDetails: { type: Object, state: true }
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

	disconnectedCallback() {
		super.disconnectedCallback();
	}


	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	async _initialise() {
		if (this.policy.policyRule === FUN_POLICY_RULES.POLICY_PAUSE) {
			this.policyPauseDocumentDetails = await this.fetchPolicyPauseAgreementDetails();			
		}

		const policyPauseBenefit = this.policy.benefits.find(benefits => benefits.type === FUN_BENEFIT_DOT_TYPES.POLICY_PAUSE);
		if (policyPauseBenefit?.available) {
			this.policyEligible = true;
		}
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * dispatch confirmation click event
	 * @returns {void}
	 */
	async _confirmPolicyPauseClick() {
		if (this.policy.policyRule === FUN_POLICY_RULES.POLICY_PAUSE) { //for Cancel pause 
			const resp = await this.cancelPolicyPause(FUN_BENEFIT_TYPES.POLICY_PAUSE, this.policy);

			if (resp.successful) {
				this.dispatchEvent(new CustomEvent(`close-modal`, { detail: { successMessage: `Your Policy Pause benefit has been successfully cancelled` }}));
			}

		} else { // for activate pause
			if (isNullorEmpty(this.selectedReason)) {
				this.errorMessage = `A reason needs to be selected`;
				return;
			}
			this.errorMessage = ``;
			this.dispatchEvent(new CustomEvent(`go-to-confirm`, {}))
		}

		
	}

	/**
	 * dispatch cancel click event
	 * @returns {void}
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, { detail: { successMessage: ``} }));
	}

	async _reasonSelected(e) {
		this.selectedReason = e.detail.new.code;
		this.errorMessage = ``;
		this.policyPauseDocumentDetails = await this.fetchPolicyPauseAgreementDetails();

	}

	 _showAgreement() {
		this.showPolicyPauseAgreement = true;
		
	}

	
	// #endregion EVENT HANDLERS

	// #region RENDERING

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
					--theme-modal-header-background-color: #f7f7f7;
				}

				horizon-product-tile {
					width: 100%;
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-heading-margin-left: 6px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-radio-disabled-border-color: #E1E1E1;
					--theme-radio-disabled-background-color: #F7F7F7;
				}

				.view-document {
					padding-top: 30px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-detail-top: 20px;
					--theme-product-tile-detail-right: 16px;
				}
				.view-document > capitec-label[type="strong"] {
					line-height: 20px;
					cursor: pointer;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			${this._renderAgreementDialog()}
			<capitec-modal header= "${this.policy.policyRule === FUN_POLICY_RULES.POLICY_PAUSE ? `Cancel Voluntary Policy Pause` : `Activate Voluntary Policy Pause`}" style="--theme-modal-alert-m-l-xl-width: 500px; --theme-modal-header-color: black;"> 
				<div slot="body" style="padding-bottom: 0px" >
					${this._renderDialogBody()}
				</div>
				<div slot="footer" >
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
			${this.policyEligible === false ? html`
				<div style="padding-bottom: 10px; height: 50px;">
					<p>Policy <b>${this.policy.contractReference}</b> is not eligible for this benefit</p>
				</div>
			` 
			: html`
				${this.policy.policyRule === FUN_POLICY_RULES.POLICY_PAUSE 
				? html`
					<div style="padding-bottom: 10px; height: 200px;">
						<p>Your Voluntary policy pause will be <b>deactivated</b> and your next collection date will be on the <b>${formatDateToInsure(new Date())}</b>.</p>
						<div>
							<horizon-product-tile class="view-document" type="default" label="Policy Pause Agreement" subtitle="Funeral plan" detail="" icon="" @click="${() => this._showAgreement()}">
								<capitec-label slot="detail" type="strong" label="View Document" >
								</capitec-label>
							</horizon-product-tile>
						</div>
					</div>

				`
				: html`
					<div style="padding-bottom: 10px; ${this.selectedReason ? `height: 230px;` : `height: 220px;`} ">
						
						<p>Select a reason for activating pause on policy <b>${this.policy.contractReference}</b>?</p>
						<div>
							<capitec-select style="padding-top: 20px;"
								label="Select Reason" 
								.items="${this.policyPauseReasons}" 
								display-field="text"
								id-field="code"
								.error="${this.errorMessage}"
								@value-change = "${(e) => this._reasonSelected(e)}">
							</capitec-select>
						</div>

						${!isNullorEmpty(this.selectedReason) ? html`
							<div>
								<horizon-product-tile class="view-document" type="default" label="Policy Pause Agreement" subtitle="Funeral plan" detail="" icon="" @click="${() => this._showAgreement()}">
									<capitec-label slot="detail" type="strong" label="View Document" >
									</capitec-label>
								</horizon-product-tile>
							</div>
						` : html``}
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
			<capitec-button slot="footer" type="${this.policyEligible ? `secondary` : `primary`}" label="Cancel" class="capitec-button-small"
				@click="${() => this._cancelClick()}">
			</capitec-button>

			${this.policyEligible ? html`
			<capitec-button slot="footer" type="primary" label="Confirm" class="capitec-button-small"
				@click="${() => this._confirmPolicyPauseClick()}">
			</capitec-button>`
			: html``}
			
			
		`;
	}

	/**
	 * render agreement dialog
	 * @returns {html} html
	 */
	_renderAgreementDialog() {
		return this.showPolicyPauseAgreement === false ? html``
			: html`
			<horizon-insure-agreement-dialog
			.agreementContent="${this.policyPauseDocumentDetails.documentContent.value}"
			@back-click="${() => this.showPolicyPauseAgreement = false}">
			</horizon-insure-agreement-dialog>
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-funeral-policy-pause-dialog`, FuneralPolicyPauseDialog);
