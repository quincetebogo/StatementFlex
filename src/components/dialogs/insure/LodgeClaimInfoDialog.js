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
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	static get properties() {
		return {};
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
	_onConfirmClick() {
		this.dispatchEvent(new CustomEvent(`confirm`, {}));
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
				`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-modal type="form" header="How To Claim">
				<div slot="body" data-automation-id="insure-lodge-claim-info-dialog-body" id="dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-lodge-claim-info-dialog-footer">
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
		<capitec-content-box class="body-box">
			<capitec-label class="bullet-heading-large" id="label" label="Ways to claim" type="subtitle"></capitec-label>
			<capitec-group layout="vertical" gap="none" halign="left" valign="center">
				<li class="bullet-label">Email FuneralClaims@capitecbank.co.za</li>
				<li class="bullet-label">Visit a branch</li>
				<li class="bullet-label">Call our 24hr client care centre on 0860 10 20 43</li>
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
		
			<capitec-label class="bullet-heading" id="label" label="Voluntary Premium Pause" type="subtitle"></capitec-label>
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
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button class="button" slot="footer" type="primary" label="Done" @click="${() => this._onConfirmClick()}"
				data-automation-id="insure-lodge-claim-info-dialog-agree">
			</capitec-button>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`insure-lodge-claim-info-dialog`, LodgeClaimInfoDialog);

/**
 * Send confirm dialog event to consuming component when 'Confirm' is clicked
 *
 * @example
 * <insure-lodge-claim-info-dialog ... @confirm="${this._handler}"></insure-lodge-claim-info-dialog>
 *
 * @event LodgeClaimInfoDialog#confirm
 * @type {Object} - N/A
 */