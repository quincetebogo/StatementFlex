import { Component, css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { getMonthName } from 'app/utils/channelServiceUtilities';

import 'app/components/dialogs/common/DiscardChanges';

const MESSAGE = `Confirm the following information to approve the DebiCheck mandate.`;
const WARNING_MESSAGE = ` DebiCheck will not be approved and will result in expired mandates.`;

const ORANGE = `#D4781C`;
const NO = 0;
const YES = 1;
const UNANSWERED = 2;
const QUESTIONS = [
	{ accepted: UNANSWERED },
	{ accepted: UNANSWERED },
	{ accepted: UNANSWERED },
	{ accepted: UNANSWERED }
];

export class ApproveDebiCheckMandate extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.mandateId = ``; // mandateInfo.mandateReference
		this.alertType = `info`;
		this.approve = false;
		this.showDiscardChangesModal = false;
		this._telemetry = HorizonTelemetry.instance;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {String} mandateInfo - Info to be used when referencing the mandate.
	 *
	 * @readonly
	 * @static
	 * @memberof AcceptDebiCheckMandate
	 */
	static get properties() {
		return {
			mandateInfo: { type: Object },
			debiCheckDetails: { type: Object },
			clientDetails: { type: Object },
			showDiscardChangesModal: { state: true }
		};
	}


	_initialise() {
		this._clearAll();

		this.mandateReference = this.debiCheckDetails.mandateReference;
		this.agreementText = this.clientDetails.data.data;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		ineum(`page`, `Approve DebiCheck Dialog`);
		this._telemetry.startSpan(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
			"screen": TelemetryScreen.APPROVE_DEBICHECK
		});

		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
			"screen": TelemetryScreen.APPROVE_DEBICHECK
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancelClick() {

		this.showDiscardChangesModal = QUESTIONS.some(question => question.accepted !== UNANSWERED);

		if (!this.showDiscardChangesModal) {
			this._clearAll();
			this.dispatchEvent(new CustomEvent(`cancel`));
		}
	}

	_cancelDiscardModal() {
		this.showDiscardChangesModal = false;
		this._telemetry.logEvent(QuickTransactionEvents.DISCARD_CHANGES_CANCEL, {
			"screen": TelemetryScreen.DISCARD_CHANGES,
			"next-screen": TelemetryScreen.DEBICHECK
		});
	}

	_approveClick() {
		this.mandateId = this.mandateInfo.mandateId;
		this.dispatchEvent(new CustomEvent(`approve`, {
			detail: { mandateId: this.mandateId }
		}));
	}

	_checkAccepted() {
		for (let i = 0; i < QUESTIONS.length; i++) {
			if (QUESTIONS[i].accepted === UNANSWERED) {
				return true;
			} else if (QUESTIONS[i].accepted === NO) {
				return true;
			}
		}
		if (!this.approve) {
			return true;
		}
		return false;
	}

	_checkWarning() {
		let returnVal = false;
		QUESTIONS.forEach(key => {
			if (key.accepted === NO) {
				returnVal = true;
			}
		});
		return returnVal;
	}

	_collapseExpander() {
		for (let i = 0; i < 3; i++) {
			if (QUESTIONS[i].accepted !== YES) {
				return true;
			}
		}
		return false;
	}

	_toggleAgreementsAccept(e) {
		this.approve = !this.approve;
		this.requestUpdate();
	}

	_clearAll() {
		QUESTIONS.forEach(question => {
			question.color = `black`;
			question.accepted = UNANSWERED;
		});
	}

	_getFullDate(shortDate) {
		if (shortDate) {
			const day = shortDate.toString().substr(8, 3);
			const monthNum = parseInt(shortDate.toString().substr(5, 2), 10);
			const month = getMonthName(monthNum - 1);
			const year = shortDate.toString().substr(0, 4);

			return `${day} of ${month} ${year}`;
		}
	}

	titleCase(str) {
		return str.split(` `)
			.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
			.join(` `);
	}

	static get styles() {
		return [
			super.styles,
			css`
					/* Allow text selection for agreement and declaration content */
					.agreement-content, .declaration-content {
					user-select: text; /* Allow text selection */
				}
				capitec-modal {
					width: 808px;
					height: 882px;

					--theme-modal-free-max-width: 808px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 8px 16px 8px 0px;
				
				}
				
				.main-cb {
					height: 754px;
					border-bottom: 1px solid rgb(225, 225, 225);

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;    
				}

				capitec-expander-group {
					width: 776px;

					--theme-expander-border: none;
					--theme-expander-header-height: 48px;
				}

				capitec-expander-group > capitec-expander {
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					margin-bottom: 8px;

					--theme-expander-indicator-width: 13px;
					--theme-expander-header-font-size: 16px;
					--theme-expander-header-font-weight: 600;
					--theme-expander-header-font-color: #3A3A3A;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-left: 0px;
					--theme-expander-height: auto;
					--theme-expander-width: 776px;
				}
				capitec-expander-group > capitec-expander[expanded] {
					// --theme-expander-width: 763px;
					box-shadow: 0px 6px 10px 0.25px rgba(0,0,0,0.07);

					--theme-expander-border-radius: 5px;
					--theme-expander-background-color: #F7F7F7;
				}

				capitec-expander-group > capitec-expander > capitec-content-box {
					--theme-container-padding-right: 16px;
					--theme-container-padding-top: 16px;
					background-color: #FFFFFF;  
					border-radius: 4px;
				}

				capitec-label{
					height: 20px;
					width: 81px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
				}
				horizon-alert-banner{
					font-family: "Hind Vadodara";
					letter-spacing: 0;
					line-height: 20px;
					width: 776px;
				
					--theme-alert-banner-font-size: 14px;
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-alert-banner-warning-font-color: #3A3A3A;
					--theme-alert-banner-unsuccessful-red-font-color: #3A3A3A;
				}

				capitec-check {
					padding-left: 16px;

					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
				}
				capitec-card {
					justify-content: center;
					margin-bottom: 13px;

					--theme-card-min-height: 48px;
				}
				.agreement-content {
					--theme-container-padding-left: 16px;
					--theme-container-padding-bottom: 16px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
					border-top: 1px solid #E1E1E1;
				}
				.agreement-content > ol {
					margin: 0px;
					padding-left: 20px;
					margin-bottom: 40px;
				}
				.agreement-content > ol > li {
					padding-left: 15px;
					margin-bottom: 14px; 
				}
				.declaration-content{
					border-top: 1px solid #E1E1E1;
					padding-bottom: 0px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
					--theme-container-padding-left: 16px;
				}
				.declaration-content > ol {
					margin: 0px;
					padding-left: 20px;
					margin-bottom: 40px;
				}
				.declaration-content > ol > li {
					padding-left: 10px;
					margin-bottom: 14px; 
					margin-top: 8px;
				}
				.cb-yesno{
					margin-top:14px;
				}    
				div[slot="footer"]{
					padding-right: 8px;
					width: 808px;
					margin-right: -12px;
				}
				`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Approve DebiCheck Mandate">
				<div slot="body">
					<capitec-content-box class="main-cb">
						${this._renderAgreementsAlertBanner()}
						${this._renderAgreementOriginal()}
						${this._renderDiscardChangesModal()}
					</capitec-content-box>
				</div>

				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderAgreementsAlertBanner() {
		return html`
			<horizon-alert-banner
				type="${this._checkWarning() ? `warning` : this.alertType}" 
				data-automation-id="debi-check-agreement-alert-banner"
				closable
				header="Notify client: "
				label="${this._checkWarning() ? WARNING_MESSAGE : MESSAGE}">
			</horizon-alert-banner>
		`;
	}


	firstUpdated() {
		const agree = this.shadowRoot.getElementById(`agree`);
		const declare = this.shadowRoot.getElementById(`declare`);

		const dec = decodeURIComponent(escape(window.atob(this.agreementText)));

		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(dec, `text/html`);

		const radios = htmlDoc.documentElement.getElementsByClassName(`agreement-question-radio`);

		for (let index = 0; index < radios.length; index++) {
			radios[index].innerHTML = `
				<tbody>
					<tr>
						<td>
							<input type='radio' value='Yes' name='yesRadio${index}' id='yes${index}'/>
							<label for='yes${index}'>Yes</label>
							<input type='radio' value='No' name='yesRadio${index}' id='no${index}' />
							<label for='no${index}'>No</label>
						</td>
					</tr>
				</tbody>
			`;

			htmlDoc.getElementById(`no${index}`).addEventListener(`click`, () => {
				QUESTIONS[index].accepted = NO;
				this.requestUpdate();
			});

			htmlDoc.getElementById(`yes${index}`).addEventListener(`click`, () => {
				QUESTIONS[index].accepted = YES;
				this.requestUpdate();
			});

		}

		const firstExpander = htmlDoc.getElementById(`agreement-clauses-table`);
		firstExpander.style.width = `100%`;
		const secondExpander = htmlDoc.getElementById(`disclaimer-clauses-table`);
		secondExpander.style.width = `100%`;

		agree.appendChild(firstExpander);
		declare.appendChild(secondExpander);

	}


	_renderAgreementOriginal() {
		return html`
			<capitec-expander-group modeset="single">
				<capitec-expander
					expandbuttonalignment="left"
					label="Agreement"
					.expanded=${this._collapseExpander()}>
					<capitec-content-box 
						data-automation-id="debi-check-agreement-terms-and-conditions"
						class="agreement-content"
						id="agree">
					</capitec-content-box>
				</capitec-expander>
	
				<capitec-expander
					expandbuttonalignment="left"
					label="Declaration"
					.expanded=${!this._collapseExpander()}>
					${this._renderDeclarationContent()}
				</capitec-expander>
			</capitec-expander-group>
		`;
	}


	_renderDeclarationContent() {
		return html`
			<capitec-content-box  
				data-automation-id="debi-check-agreement-declaration"
				class="declaration-content">
				<div id="declare"></div>
				<capitec-card>
					<capitec-check
						label="Please confirm that you agree to these terms and conditions and that you are bound by them?"
						@value-change="${(e) => this._toggleAgreementsAccept(e)}">
					</capitec-check>
				</capitec-card>
			</capitec-content-box>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button
					data-automation-id="debi-check-agreement-cancel"
					@click="${(e) => this._cancelClick(e)}"
					label="Cancel">
				</capitec-button>
				<capitec-button
					data-automation-id="debi-check-agreement-approve"
					type="primary"
					@click="${(e) => this._approveClick(e)}"
					label="Approve"
					.disabled="${this._checkAccepted()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderDiscardChangesModal() {
		if (this.showDiscardChangesModal) {
			return html`
				<horizon-discard-changes
					@on-cancel="${() => this._cancelDiscardModal()}"
					@on-confirm="${() => this.dispatchEvent(new CustomEvent(`cancel`))}">
				</horizon-discard-changes>`;
		}

		return html``;
	}
}

window.customElements.define(`horizon-approve-debicheck-mandate`, ApproveDebiCheckMandate);