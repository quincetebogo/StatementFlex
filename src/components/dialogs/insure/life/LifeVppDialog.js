import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { LIFE_POLICY_STATUSES, POLICY_PAUSE_REASONS } from 'app/constants/InsureCommon';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { formatDateToInsure } from "app/utils/insureUtils"
import 'app/components/dialogs/insure/AgreementDialog';


/**
 * 
 * 
 *  
 * @export
 * @class RequestCallback
 * @extends {Component}
 */

const ACTION_TYPE = {
	ACTIVATE: 'ACTIVATE',
	CANCEL: 'CANCEL'
}
class LifeVppDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.policy = {};
		this.isActivate = true;
		this.reasons = POLICY_PAUSE_REASONS;
		this.selectedReason = ``;
		this.policyPauseDocumentDetails = {};
		this.errorMessage = ``;
		this.showPolicyPauseAgreement = false;


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
	 * @property {Object} vppBenefit - contains vpp benefit object from the summary response
	 * @property {Object} fetchBenefitDetails - callback function to fetch benefit details
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			isActivate: { type: Boolean, state: true },
			reasons: { type: Array, state: true },
			selectedReason: { type: String, stat: true },
			errorMessage: { type: String, stat: true },
			policyPauseDocumentDetails: { type: Object, state: true },
			fetchLifePolicyPauseAgreementDetails: { type: Object, state: true },
			lifeCancelPolicyPause: { type: Object, state: true },
			showPolicyPauseAgreement: { type: Boolean, state: true }
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

		if (this.policy.policyStatusEnum === LIFE_POLICY_STATUSES.VOLUNTARY_PAUSE) {
			this.isActivate = false
		}

		if (this.isActivate) {
			//TODO do the benefit info call here to get dates
		}

		if (!this.isActivate) {
			this.policyPauseDocumentDetails = await this.fetchLifePolicyPauseAgreementDetails(false, this.policy, ACTION_TYPE.CANCEL)
		}

	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * dispatch confirmation click event
	 * @returns {void}
	 */
	async _confirmPolicyPauseClick() {
		if (!this.isActivate) { //for Cancel pause 
			const resp = await this.lifeCancelPolicyPause(this.policy);

			if (resp.successful) {
				this.dispatchEvent(new CustomEvent(`action-success`, { detail: { successMessage: `Your Policy Pause benefit has been successfully cancelled` } }));
			}

		} else { // for activate pause
			if (isNullorEmpty(this.selectedReason)) {
				this.errorMessage = `A reason needs to be selected`;
				return;
			}
			this.errorMessage = ``;
			this.dispatchEvent(new CustomEvent(`action-success`, { detail: { successMessage: `Your Policy Pause benefit has been successfully activated` } }));
		}


	}

	async _reasonSelected(e) {
		this.selectedReason = e.detail.new.code;
		this.errorMessage = ``;
		this.policyPauseDocumentDetails = await this.fetchLifePolicyPauseAgreementDetails(false, this.policy, ACTION_TYPE.ACTIVATE)
	}

	/**
	 * dispatch cancel click event
	 * @returns {void}
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`));
	}

	_showAgreement() {
		console.log(`in show agreement`)
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
			
			<capitec-modal header= "${this.isActivate ? `Activate Voluntary Policy Pause` : `Cancel Voluntary Policy Pause`}" style="--theme-modal-alert-m-l-xl-width: 500px; --theme-modal-header-color: black;"> 
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
		${this._renderAgreementDialog()}
				${this.isActivate ? html`
					<div style="padding-bottom: 10px; ${this.selectedReason ? `height: 280px;` : `height: 180px;`} ">
						
						<p>Select a reason for activating pause on policy <b>${this.policy.contractReference}</b>?</p>
						<div>
							<capitec-select style="padding-top: 20px;"
								label="Select Reason" 
								.items="${this.reasons}" 
								display-field="text"
								id-field="code"
								.error="${this.errorMessage}"
								@value-change = "${(e) => this._reasonSelected(e)}">
							</capitec-select>
						</div>

						${!isNullorEmpty(this.selectedReason) ? html`

							
							<div>
								<horizon-product-tile class="view-document" type="default" label="Policy Pause Agreement" subtitle="Life Cover" detail="" icon="" @click="${() => this._showAgreement()}">
									<capitec-label slot="detail" type="strong" label="View Document" >
									</capitec-label>
								</horizon-product-tile>
							</div>
							<ul>
								<li>Your Voluntary policy pause benefit will be <b>activated</b> from <b>startDate</b> and will expire on <b>endDate</b>.</li>
								<li>Your next collection date will be <b>collectionDate</b>.</li>
							</ul>
						` : html``}
					</div>
				`: html`
					<div style="padding-bottom: 10px; height: 200px;">
						<p>Your Voluntary policy pause will be <b>deactivated</b> and your next collection date will be on the <b>date</b>.</p>
						<div>
							<horizon-product-tile class="view-document" type="default" label="Policy Pause Agreement" subtitle="Life Cover" detail="" icon="" @click="${() => this._showAgreement()}">
								<capitec-label slot="detail" type="strong" label="View Document" >
								</capitec-label>
							</horizon-product-tile>
						</div>
					</div>
				`}
			`
			;
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

			<capitec-button slot="footer" type="primary" label="Confirm" class="capitec-button-small"
				@click="${() => this._confirmPolicyPauseClick()}">
			</capitec-button>

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

window.customElements.define(`horizon-insure-life-vpp-dialog`, LifeVppDialog);
