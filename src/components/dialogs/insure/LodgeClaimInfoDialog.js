import { Component, css, html } from 'platform/elements';
import { LodgeClaimEvents } from 'app/constants/telemetry/events/Insure';

/**
 * Lodge Claim Info Dialog will be used to show instructions on how to 'Lodge a claim'
 * 
 * Events Raised 
 * -------------
 * confirm
 *  
 * @export
 * @class LodgeClaimInfoDialog
 * @extends {Component}
 */
class LodgeClaimInfoDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		this.selectedInsureTabIndex = 0;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	static get properties() {
		return {
			selectedInsureTabIndex: { type: Number, state: true }
		};
	}

	// #endregion PROPERTIES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.telemetryEvents = LodgeClaimEvents;
		await this._telemetry.startSpan(this.telemetryEvents.LODGE_CLAIM_INFO, {});
	}

	// #region EVENT HANDLERS

	/**
	 * Confirm event from dialog footer, closes modal, no navigation or actions
	 * @returns {void} 
	 */
	_confirmClick() {
		this.dispatchEvent(new CustomEvent(`confirm`, {}));
	}

	/**
	 * @returns {String} Dialog title
	 */
	_getDialogTitle() {
		if (this.selectedInsureTabIndex === 0) {
			return `How To Claim | Funeral Cover`;
		} else if (this.selectedInsureTabIndex === 1) {
			return `How To Claim | Life Cover`;
		} 
		return `How To Claim`;
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

				.notification > capitec-toast{
					--theme-toast-height: 80px;
					position: relative;
				}

				.notification {
					margin-bottom: 30px;
				}

				.expander{
					margin-bottom: 20px;
					
				}

				.select{
					margin-bottom: 20px;
					width: 60%;
				}

				.button {
					width: 140px;
				}

				.death-claim{
					padding: 5px;
				}

				#dialog-body{
					height: 370px;
				}

				.bullet-heading{
					font-weight: bold;
					margin-top: 10px;
				}

				.bullet-heading-large{
					padding-top: 10px;
					font-weight: bold;
					font-size: 18px;
					margin-bottom: 10px;
				}

				.bullet-label{
					padding-left: 16px;
				}

				.subtext-paragraph{
					padding: 0px;
					margin: 0px;
					margin-bottom: 5px;
				}

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
					--theme-modal-form-m-l-xl-width: 515px;
				}

				.body-box{
					width: 1020px;
				}

				td {
					vertical-align: top;
					padding-right: 20px;
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
			<capitec-modal type="free" .header="${this._getDialogTitle()}" style="--theme-modal-header-color: black;">
				<div slot="body" data-automation-id="horizon-insure-lodge-claim-info-dialog-body" id="dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="horizon-insure-lodge-claim-info-dialog-footer">
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
		switch (this.selectedInsureTabIndex) {
			case 0:
				return this._renderFuneralClaimInfo();
			case 1:
				return this._renderLifeClaimInfo();
			case 2:
				return this._renderCombineClaimInfo();
			default:
				return this._renderCombineClaimInfo();
		}
	}

	/**
	 * Render modal body section for funeral and life combined
	 * @returns {html} The html content of the component.
	 */
	_renderCombineClaimInfo() {
		return html`
			<capitec-content-box class="body-box">
				<table>
					<tr>
						<td >
							<capitec-label class="bullet-heading-large" id="label" label="Ways to claim | Funeral Plan" type="subtitle"></capitec-label>
						</td>
						<td>
							<capitec-label class="bullet-heading-large" id="label" label="Ways to claim | Life Cover" type="subtitle"></capitec-label>
						</td>
					</tr>
					<tr>
						<td >
							<capitec-group layout="vertical" gap="none" halign="left" valign="center">
								<li class="bullet-label">Email FuneralClaims@capitecbank.co.za</li>
								<li class="bullet-label">Visit a branch</li>
								<li class="bullet-label">WhatsApp us on 067 418 9565</li>
							</capitec-group>
						</td>
						<td>
							<capitec-group layout="vertical" gap="none" halign="left" valign="center">
								<li class="bullet-label">Email InsuranceClaims@capitec.com</li>
								<li class="bullet-label">Visit a branch</li>
								<li class="bullet-label">WhatsApp us on 067 418 9565</li>
							</capitec-group>
						</td>
					</tr>
					<tr>
						<td >
							<capitec-label id="label" label="Documents needed" type="subtitle" class="bullet-heading-large"></capitec-label>
							<p class="subtext-paragraph">Once all documents are received, your claim will be processed and the money paid
								into your Capitec account immediately after your claim is approved.
							</p>
						</td>
						<td>
							<capitec-label id="label" label="Documents needed" type="subtitle" class="bullet-heading-large"></capitec-label>
							<p class="subtext-paragraph">Once all documents are received, your claim will be processed and the money paid into your Capitec account immediately after your claim is approved.
							</p>
						</td>
					</tr>

					<tr>
						<td >
							<capitec-label class="bullet-heading-large" id="label" label="Death claims" type="subtitle"></capitec-label>
							<capitec-label class="bullet-heading" id="label" label="Natural Death claims" type="subtitle"></capitec-label>
						
							<p class="subtext-paragraph">Original or certified copy of:</p>
						</td>
						<td>
							<capitec-label class="bullet-heading-large" id="label" label="Death claims" type="subtitle"></capitec-label>
							<capitec-label class="bullet-heading" id="label" label="Natural Death claims" type="subtitle"></capitec-label>
							<p class="subtext-paragraph">Original or certified copy of:</p>
						</td>
					</tr>

					<tr>
						<td >
							<ul>
								<li class="bullet-label">The valid identity document of the person logging the claim (the claimant)</li>
								<li class="bullet-label">The valid identity document of the beneficiary, as well as their banking details (e.
									bank name, bank account number and branch code if the beneficiary is not a Capitec Bank account holder)</li>
								<li class="bullet-label">The death certificate</li>
								<li class="bullet-label">Either of the following forms, fully completed:</li>
						
								<ul>
									<li class="bullet-label">BI-1663/DHA – 1663 form: This is a notification of death or stillbirth completed by
										the Department of Home Affairs</li>
									<li class="bullet-label">BI-1680/DHA - 1680 form: This is a Death Report issued by the police or other
										parties
										authorised by the Department of Home Affairs after a death has been registered</li>
									<li class="bullet-label">Any other documents or reports which we need to assess the validity of the claim
									</li>
								</ul>
							</ul>
						</td>
						<td>
							<ul>
								<li class="bullet-label">The ID document of the person lodging the claim</li>
								<li class="bullet-label">Banking details of the beneficiary (if the beneficiary is not a Capitec Bank account holder)</li>
								<li class="bullet-label">Death Certificate</li>
								<li class="bullet-label">Either of the following forms:</li>
								<ul>
									<li class="bullet-label">BI-1663/DHA 1663 form: This is a Notification of death form</li>
									<li class="bullet-label">BI-1680/DHA-1680 form: This is a Death Report</li>
								</ul>
							</ul>
						</td>
					</tr>

					<tr>
						<td >
							<capitec-label class="bullet-heading" id="label" label="Accidental Death claims" type="subtitle"></capitec-label>
							<p class="subtext-paragraph">In addition to the above documents:</p>
							<ul>
								<li class="bullet-label">A police report with the details of the cause of death</li>
							</ul>
						</td>
						<td>
							<capitec-label class="bullet-heading" id="label" label="Accidental Death" type="subtitle"></capitec-label>
							<p class="subtext-paragraph">In addition to the documents required for Natural death</p>
							<ul>
								<li class="bullet-label">A police report with the details of the cause of death</li>
							</ul>
						</td>
					</tr>

					<tr>
						<td >
							<capitec-label class="bullet-heading-large" id="label" label="Benefit activations" type="subtitle"></capitec-label>
							<p class="subtext-paragraph">The following documents are required to activate the below benefits on your Funeral
								Plan.</p>
						</td>
						<td>
							<capitec-label class="bullet-heading-large" id="label" label="Benefit activations" type="subtitle"></capitec-label>
							<p class="subtext-paragraph">The following documents are required to activate the below benefits on your Life Cover policy.</p>
						</td>
					</tr>

					<tr>
						<td >
							<capitec-label class="bullet-heading" id="label" label="Newborn Premium Waiver" type="subtitle"></capitec-label>
							<ul>
								<li class="bullet-label">An unabridged birth certificate</li>
							</ul>
						</td>
						<td>
							<capitec-label class="bullet-heading" id="label" label="Newborn Premium Waiver" type="subtitle"></capitec-label>
							<ul>
								<li class="bullet-label">An unabridged birth certificate</li>
							</ul>
						</td>
					</tr>

					<tr>
						<td >
							<capitec-label class="bullet-heading" id="label" label="Voluntary Policy Pause" type="subtitle"></capitec-label>
							<ul>
								<li class="bullet-label">A reason as to why you want to activate the benefit, no additional documents required
								</li>
							</ul>
						</td>
						<td>
							<capitec-label class="bullet-heading" id="label" label="Voluntary Policy Pause" type="subtitle"></capitec-label>
							<ul>
								<li class="bullet-label">A reason as to why you want to activate the benefit, no additional documents required.</li>
							</ul>
						</td>
					</tr>

					<tr>
						<td >
							<capitec-label class="bullet-heading" id="label" label="Waiting Period Waiver" type="subtitle"></capitec-label>
							<ul>
								<li class="bullet-label">Policy schedule of previous policy showing that the cover was in force at the time of
									the Capitec policy acceptance
								</li>
								<li class="bullet-label">Letter of proof of cancellation or lapse of previous policy after the Capitec policy
									acceptance date
								</li>
							</ul>
						</td>
						<td>
							<capitec-label class="bullet-heading" id="label" label="Waiting Period Waiver" type="subtitle"></capitec-label>
							<ul>
								<li class="bullet-label">Policy Schedule of the previous policy showing that the cover was in force at least 31 days before the Capitec policy acceptance.</li>
								<li class="bullet-label">Proof of cancellation or lapse of the previous policy.</li>
							</ul>
						</td>
					</tr>
				</table>
			</capitec-content-box>
		`;
	}

	/**
	 * Render modal body section for funeral content
	 * @returns {html} The html content of the component.
	 */
	_renderFuneralClaimInfo() {
		return html`
			<capitec-content-box class="body-box">
				<capitec-label class="bullet-heading-large" id="label" label="Ways to claim" type="subtitle"></capitec-label>
				<capitec-group layout="vertical" gap="none" halign="left" valign="center">
					<li class="bullet-label">Email FuneralClaims@capitecbank.co.za</li>
					<li class="bullet-label">Visit a branch</li>
					<li class="bullet-label">WhatsApp us on 067 418 9565</li>
				</capitec-group>
			
				<capitec-label id="label" label="Documents needed" type="subtitle" class="bullet-heading-large"></capitec-label>
				<p class="subtext-paragraph">Once all documents are received, your claim will be processed and the money paid
					into your Capitec account immediately after your claim is approved.
				</p>
			
				<capitec-label class="bullet-heading-large" id="label" label="Death claims" type="subtitle"></capitec-label>
				<capitec-label class="bullet-heading" id="label" label="Natural Death claims" type="subtitle"></capitec-label>
			
				<p class="subtext-paragraph">Original or certified copy of:</p>
			
				<ul>
					<li class="bullet-label">The valid identity document of the person logging the claim (the claimant)</li>
					<li class="bullet-label">The valid identity document of the beneficiary, as well as their banking details (e.
						bank name, bank account number and branch code if the beneficiary is not a Capitec Bank account holder)</li>
					<li class="bullet-label">The death certificate</li>
					<li class="bullet-label">Either of the following forms, fully completed:</li>
			
					<ul>
						<li class="bullet-label">BI-1663/DHA – 1663 form: This is a notification of death or stillbirth completed by
							the Department of Home Affairs</li>
						<li class="bullet-label">BI-1680/DHA - 1680 form: This is a Death Report issued by the police or other
							parties
							authorised by the Department of Home Affairs after a death has been registered</li>
						<li class="bullet-label">Any other documents or reports which we need to assess the validity of the claim
						</li>
					</ul>
				</ul>
			
				<capitec-label class="bullet-heading" id="label" label="Accidental Death claims" type="subtitle"></capitec-label>
				<p class="subtext-paragraph">In addition to the above documents:</p>
				<ul>
					<li class="bullet-label">A police report with the details of the cause of death</li>
				</ul>
			
				<capitec-label class="bullet-heading-large" id="label" label="Benefit activations" type="subtitle"></capitec-label>
				<p class="subtext-paragraph">The following documents are required to activate the below benefits on your Funeral
					Plan.</p>
			
			
				<capitec-label class="bullet-heading" id="label" label="Newborn Premium Waiver" type="subtitle"></capitec-label>
				<ul>
					<li class="bullet-label">An unabridged birth certificate</li>
				</ul>
			
				<capitec-label class="bullet-heading" id="label" label="Voluntary Policy Pause" type="subtitle"></capitec-label>
				<ul>
					<li class="bullet-label">A reason as to why you want to activate the benefit, no additional documents required
					</li>
				</ul>
			
				<capitec-label class="bullet-heading" id="label" label="Waiting Period Waiver" type="subtitle"></capitec-label>
				<ul>
					<li class="bullet-label">Policy schedule of previous policy showing that the cover was in force at the time of
						the Capitec policy acceptance
					</li>
					<li class="bullet-label">Letter of proof of cancellation or lapse of previous policy after the Capitec policy
						acceptance date
					</li>
				</ul>
			</capitec-content-box>
		`;
	}

	/**
	 * Render modal body section for life content
	 * @returns {html} The html content of the component.
	 */
	_renderLifeClaimInfo() {
		return html`
			<capitec-content-box class="body-box">
				<capitec-label class="bullet-heading-large" id="label" label="Ways to claim" type="subtitle"></capitec-label>
				<capitec-group layout="vertical" gap="none" halign="left" valign="center">
					<li class="bullet-label">Email InsuranceClaims@capitec.com</li>
					<li class="bullet-label">Visit a branch</li>
					<li class="bullet-label">WhatsApp us on 067 418 9565</li>
				</capitec-group>
			
				<capitec-label id="label" label="Documents needed" type="subtitle" class="bullet-heading-large"></capitec-label>
				<p class="subtext-paragraph">Once all documents are received, your claim will be processed and the money paid into your Capitec account immediately after your claim is approved.
				</p>
			
				<capitec-label class="bullet-heading-large" id="label" label="Death claims" type="subtitle"></capitec-label>
				<capitec-label class="bullet-heading" id="label" label="Natural Death claims" type="subtitle"></capitec-label>
				<p class="subtext-paragraph">Original or certified copy of:</p>
			
				<ul>
					<li class="bullet-label">The ID document of the person lodging the claim</li>
					<li class="bullet-label">Banking details of the beneficiary (if the beneficiary is not a Capitec Bank account holder)</li>
					<li class="bullet-label">Death Certificate</li>
					<li class="bullet-label">Either of the following forms:</li>
					<ul>
						<li class="bullet-label">BI-1663/DHA 1663 form: This is a Notification of death form</li>
						<li class="bullet-label">BI-1680/DHA-1680 form: This is a Death Report</li>
					</ul>
				</ul>
			
				<capitec-label class="bullet-heading" id="label" label="Accidental Death" type="subtitle"></capitec-label>
				<p class="subtext-paragraph">In addition to the documents required for Natural death</p>
				<ul>
					<li class="bullet-label">A police report with the details of the cause of death</li>
				</ul>
			
				<capitec-label class="bullet-heading-large" id="label" label="Benefit activations" type="subtitle"></capitec-label>
				<p class="subtext-paragraph">The following documents are required to activate the below benefits on your Life Cover policy.</p>
			
				<capitec-label class="bullet-heading" id="label" label="Newborn Premium Waiver" type="subtitle"></capitec-label>
				<ul>
					<li class="bullet-label">An unabridged birth certificate</li>
				</ul>
			
				<capitec-label class="bullet-heading" id="label" label="Voluntary Policy Pause" type="subtitle"></capitec-label>
				<ul>
					<li class="bullet-label">A reason as to why you want to activate the benefit, no additional documents required.</li>
				</ul>
			
				<capitec-label class="bullet-heading" id="label" label="Waiting Period Waiver" type="subtitle"></capitec-label>
				<ul>
					<li class="bullet-label">Policy Schedule of the previous policy showing that the cover was in force at least 31 days before the Capitec policy acceptance.</li>
					<li class="bullet-label">Proof of cancellation or lapse of the previous policy.</li>
				</ul>
			</capitec-content-box>
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button class="button" slot="footer" type="primary" label="Done" @click="${() => this._confirmClick()}"
				data-automation-id="horizon-insure-lodge-claim-info-dialog-agree">
			</capitec-button>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-lodge-claim-info-dialog`, LodgeClaimInfoDialog);

/**
 * Send confirm dialog event to consuming component when 'Confirm' is clicked
 *
 * @example
 * <horizon-insure-lodge-claim-info-dialog ... @confirm="${this._handler}"></horizon-insure-lodge-claim-info-dialog>
 *
 * @event LodgeClaimInfoDialog#confirm
 * @type {Object} - N/A
 */