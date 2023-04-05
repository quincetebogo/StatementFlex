import { Component, css, html } from 'platform/elements';

const DISPUTE_TRANS_STEPS = [
	{
		title: `Questions`
	},
	{
		title: `Declaration`
	}
];

/**
 * Verifying client via Knowledge Based Authentication (KBA)
 * 
 * Events Raised
 * -------------
 * cancel - should return to caller 
 * skip - should return to caller which should then navigate to the appropriate landing page
 * verify - should navigate to landing page with appropriate verification status
 * 
 * @export
 * @class VerifyByKBA
 * @extends {Component}
 */
export class Disputes extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.disputeCurState = 1;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} transactionDetails Transaction to dispute
	 * 
	 */
	static get properties() {
		return {
			transactionDetails: { type: Object },
			disputeQuestions: { type: Object },
			getNextQuestion: { type: Object },
			disputeCurState: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancel() {

	}

	_restartQuestions() {

	}

	_next() {

	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// N/A

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// N/A

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css``
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					${this._renderModalHeader()}
				</div>
				<div slot="body">
					${this._renderModalContent()}
				</div>
				<div slot="footer">
					${this._renderModalfooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderModalHeader() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-icon
					size="small"
					icon="status/warning-trans">
				</capitec-icon>
				<capitec-label label="Dispute Transaction"></capitec-label>
			</capitec-group>
		`;
	}

	_renderModalContent() {
		return html`
			<capitec-stepper
				layout="horizontal"
				.steps="${DISPUTE_TRANS_STEPS}"
				active-step-number="${this.disputeCurState}">
			</capitec-stepper>
			${this._renderDisputeTranInfo()}
			${this._renderQuestionsContent()}
		`;
	}

	_renderDisputeTranInfo() {
		return html`
			<capitec-title-bar type="default" class="dispute-tran-info">
				<horizon-label
					label="Transaction date"
					value = "02 Dec 2022">
				</horizon-label>
				<horizon-label
					label="Description"
					value = "POS Purchase Spar Cape Town">
				</horizon-label>
				<horizon-label
					label="Card number"
					value = "6373 **** **** 1926">
				</horizon-label>
				<horizon-label
					label="Amount"
					value = "-R5000.00">
				</horizon-label>
				<horizon-label
					label="Card status"
					value = "Active">
				</horizon-label>
			</capitec-title-bar>
		`;
	}

	_renderQuestionsContent() {
		return this.disputeCurState === 1
		? html`
			<capitec-content-box layout="vertical" gap="clear">
				<horizon-alert-banner
					type="info"
					header="Notify client: "
					label="All questions must be answered to complete the dispute request.">
				</horizon-alert-banner>

				<capitec-group layout="horizontal" gap="none">
					<capitec-label type="subtitle" label="Questions"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label type="subtitle" label="Client feedback"></capitec-label>
				</capitec-group>
			</capitec-content-box>

			${this._renderQuestions()}`
		: html``;
	}

	_renderQuestions() {
		return html`
			<capitec-card>
				<capitec-content-box class="question-box">
					<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
							<capitec-label type="subtitle" label="Q1"></capitec-label>

							<capitec-label label="Did the Card Holder or other authorised client participate in the transaction?">
							</capitec-label>

							<capitec-spacer></capitec-spacer>

							<capitec-radio-group>
								<capitec-group layout="horizontal" gap="clear">
									<capitec-radio label="No">
									</capitec-radio>
									<capitec-radio label="Yes">
									</capitec-radio>
								</capitec-group>
							</capitec-radio-group>
					</capitec-group>
				</capitec-content-box>
			</capitec-card>`;
	}

	_renderModalfooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center" class="buttonBroup">
				<capitec-button
					data-automation-id="dispute-cancel"
					label="Cancel"
					@click="${() => this._cancel()}">
				</capitec-button>
				<capitec-button
					data-automation-id="dispute-restart-qus"
					label="Restart Questions"
					@click="${() => this._restartQuestions()}">
				</capitec-button>
				<capitec-button
					data-automation-id="dispute-next"
					label="Next"
					@click="${() => this._next()}">
				</capitec-button>
			</capitec-group>
		`;
	 }
}

window.customElements.define(`horizon-disputes`, Disputes);