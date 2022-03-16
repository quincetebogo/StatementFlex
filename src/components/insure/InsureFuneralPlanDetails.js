import { Component, css, html } from 'platform/elements';

import 'app/components/dialogs/insure/InsureEmailFuneralPlan';
import 'app/components/insure/InsureEmailPlanSuccess';

// Funeral plan details render modes
const RENDER_MODE = {
	DEFAULT: 0,
	EMAIL_PLAN_SUCCESS: 1,
};

/**
 * Component for Funeral Plan Details
 * @class InsureFuneralPlanDetails
 * @extends {Component}
 */
class InsureFuneralPlanDetails extends Component {

	constructor() {
		super();
		this.renderMode = RENDER_MODE.DEFAULT;

		// Email
		this.showEmailDialog = false;
		this.email = ``;
		this.confirmEmail = ``;

		// Main life stub data
		this._mainLife = {
			policyNumber: `ABC01`,
			effectiveDate: `01 Feb 2019`,
			coverAmount: `12 Jan 1997`,
			totalPremium: 88.50,
			arrears: 36000.99,
			status: `Active`
		};

		// Payout beneficiaries stub data
		this._payoutBeneficiaries = [
			{
				nameSurname: `Steward Griffin`,
				relationship: `Son`,
				dateOfBirth: `12 Jan 1997`,
				benefitPayout: 36000.99
			},
			{
				nameSurname: `Megatron Griffin`,
				relationship: `Daughter`,
				dateOfBirth: `16 June 1993`,
				benefitPayout: 29000
			}
		];

		// Lives assured stub data
		this._livesAssured = [
			{
				nameSurname: `Peter Griffin`,
				relationship: `Father`,
				dateOfBirth: `12 Feb 1968`,
				benefitPayout: 16000.99
			},
			{
				nameSurname: `Louis Griffin`,
				relationship: `Mother`,
				dateOfBirth: `6 June 1972`,
				benefitPayout: 24000
			}
		];
	}

	/**
	 * Back to Main Insure view
	 */
	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	/**
	 * Open dialog, 'email plan'
	 */
	_openEmailPlanModal() {
		this.showEmailDialog = true;
		this.requestUpdate();
	}

	/**
	 * Close dialog, 'email plan'
	 */
	_exitEmailPlanModal() {
		this.showEmailDialog = false;
		this.requestUpdate();
	}

	/**
	 * Back to sub view from 'email success' component
	 */
	_exitEmailSuccess() {
		this.renderMode = RENDER_MODE.DEFAULT;
		this.requestUpdate();
	}

	/**
	 * Send email action
	 */
	_sendEmailPlan() {
		// Send email here

		// on success, show view
		this.renderMode = RENDER_MODE.EMAIL_PLAN_SUCCESS;
		this.showEmailDialog = false;
		this.requestUpdate();
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
				.beneficiary-card{
					display: flex;
					justify-content: start;
					gap: 60px;
					border-radius: 5px;
					padding: 20px;
					border: 1px solid lightgray;
				}

				.stronger {
					font-weight: bold;
				}

				.status-active{
					color: #95dd15;
				}
				.status-not-active{
					color: #a5132a;
				}
			`
		];
	}

	/**
	 * Set label color based on status
	 * @returns {string} css class of status
	 */
	_statusColor(status) {
		if (status == `Active`) {
			return `status-active`
		}
		return `status-not-active`
	}

	/**
	 * Render main life card.
	 * 
	 * @returns {html} The html content of the component.
	*/
	_renderMainLife() {
		return html`
			<capitec-label type="subtitle" label="Main life" class="stronger" style="padding: 10px;"></capitec-label>
			<div class="beneficiary-card" style="margin-bottom: 10px;">
				<capitec-group layout="vertical" valign="center" halign="left" gap="none"
					style="border-right: 1px solid lightgray; padding-right: 20px;">
					<capitec-label type="subtitle" label="Policy number">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="${this._mainLife.policyNumber}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Effective date">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="${this._mainLife.effectiveDate}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Cover amount">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="R${this._mainLife.coverAmount}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Premium">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="R${this._mainLife.totalPremium}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Arrears">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="R${this._mainLife.arrears}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Status">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger ${this._statusColor(this._mainLife.status)}"
						label="${this._mainLife.status}">
					</capitec-label>
				</capitec-group>
			</div>`;
	}

	/**
	 * Render card list for payout beneficiaries.
	 * 
	 * @returns {html} The html content of the component.
	*/
	_renderPayoutBeneficiaries() {
		return html`
			<capitec-label type="subtitle" class="stronger" label="Payout Beneficiaries" style="padding: 10px;">
			</capitec-label>
			${this._payoutBeneficiaries.map(beneficiary => html`
			<div class="beneficiary-card" style="margin-bottom: 10px;">
				<capitec-group layout="vertical" valign="center" halign="left" gap="none"
					style="border-right: 1px solid lightgray; padding-right: 20px;">
					<capitec-label type="subtitle" label="Name & Surname">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="${beneficiary.nameSurname}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Relationship">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="${beneficiary.relationship}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Date of birth">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="${beneficiary.dateOfBirth}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Benefit payout">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="R${beneficiary.benefitPayout}"></capitec-label>
				</capitec-group>
			</div>
			`)}
		`;
	}

	/**
	 * Render card list for lives assured.
	 * 
	 * @returns {html} The html content of the component.
	*/
	_renderLivesAssured() {
		return html`
			<capitec-label type="subtitle" class="stronger" label="Lives Assured (${this._livesAssured.length})"
				style="padding: 10px;">
			</capitec-label>
			${this._livesAssured.map(lifeAssured => html`
			<div class="beneficiary-card" style="margin-bottom: 10px;">
				<capitec-group layout="vertical" valign="center" halign="left" gap="none"
					style="border-right: 1px solid lightgray; padding-right: 20px;">
					<capitec-label type="subtitle" label="Name & Surname">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="${lifeAssured.nameSurname}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Relationship">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="${lifeAssured.relationship}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Date of birth">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="${lifeAssured.dateOfBirth}"></capitec-label>
				</capitec-group>
			
				<capitec-group layout="vertical" valign="center" halign="left" gap="none">
					<capitec-label type="subtitle" label="Benefit payout">
					</capitec-label>
					<capitec-label type="subtitle" class="stronger" label="R${lifeAssured.benefitPayout}"></capitec-label>
				</capitec-group>
			</div>
			`)}
		`;
	}

	/**
	 * Controls funeral plan details sub views
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderFuneralPlanComponents() {
		if (this.renderMode === RENDER_MODE.DEFAULT) {
			return html`
			<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-title-bar type="insure"
					style="margin-bottom: 0px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
					<capitec-icon size="title" icon="system/back-white" @click="${() => this._back()}" data-automation-id="????">
					</capitec-icon>
					<capitec-label label="Funeral Plan" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-button label="Email Plan" type="white" @click="${() => this._openEmailPlanModal()}"></capitec-button>
					<capitec-button label="Update Plan" type="white"></capitec-button>
				</capitec-title-bar>
				<capitec-card style="padding: 20px;">
					${this._renderMainLife()}
					<capitec-spacer></capitec-spacer>
					${this._renderPayoutBeneficiaries()}
					<capitec-spacer></capitec-spacer>
					${this._renderLivesAssured()}
				</capitec-card>
			</capitec-content-box>
			${this._renderEmailPlanModal()}
			`;
		}

	}

	/**
	 * Render 'email plan' dialog
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderEmailPlanModal() {
		if (this.showEmailDialog === true) {
			return html`
				<insure-email-plan-modal @confirmSend="${(e) => this._sendEmailPlan(e)}"
					@cancelSend="${(e) => this._exitEmailPlanModal(e)}"></insure-email-plan-modal>
			`;
		}
	}

	/**
	 * Render email sent success component
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderEmailPlanSuccess() {
		if (this.renderMode === RENDER_MODE.EMAIL_PLAN_SUCCESS) {
			return html`
				<insure-email-plan-success @back="${(e) => this._exitEmailSuccess(e)}"></insure-email-plan-success>
			`;
		}
	}

	/**
	 * Generates the component template for desktop mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
		${this._renderFuneralPlanComponents()}
		${this._renderEmailPlanSuccess()}
		`;
	}
}

window.customElements.define(`insure-funeral-plan-details`, InsureFuneralPlanDetails);