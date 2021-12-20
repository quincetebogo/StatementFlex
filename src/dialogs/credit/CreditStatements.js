import { Component, css, html } from 'platform/elements';
import { Configuration } from 'platform/Configuration';
import { DateTime } from 'luxon';
import { getMonthName } from 'app/utils/channelServiceUtilities';

import 'app/components/common/StepperModal';
import 'app/components/common/HorizonMonthCalendar';

/* To add dialog to class
import 'app/components/dialogs/common/CreditStatements';


<horizon-credit-statements-dialog
@cancel="${()=> this._backToLandingPage()}">
</horizon-credit-statements-dialog>
 */


const STATEMENTS_STEPS = [
	{
		title: `Choose Period` 
	},
	{
		title: `Specify Email and View Documents`
	}
];

const RENDER_MODE = Object.freeze({
	EMAIL: 0,
	PDF: 1
});

export class CreditStatementsDialog extends Component {

	constructor() {
		super();

		this.currentStep = 0;
		this.renderMode = RENDER_MODE.EMAIL;
		this.notifyMessage = ` A fee will be charged for email statements.`;
		this.errorMessage = ``;
		this.filteredDate = [];
		this.sixMonths = [];
		this.rows = 0;
		this.columns = 0;
		this.checkAll = false;
		this.checkBox = [];
		this.isChecked = false;
		this.today = new DateTime.now();
		this.email = ``;
		this.confirmEmail = ``;
		this.mailClientError = {
			email: ``,
			confirmEmail: ``
		};
		this.encodedPDF = ``;

		this._configuration = Configuration.getInstance();
	}

	static get properties() {
		return {
			checkAll: { type: String },
			checkBox: { type: Array },
			filterDate: { type: Array },
			errorMessage: { type: String }
		};
	}

	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	_initialise() {

		for (let index = 0; index < 6; index++) {
			this.checkBox[index] = false;
		}

		const currDate = new Date();

		// account opened date if not 6 months
		for (let month = 0; month < 6; month++) {
			this.sixMonths[month] = getMonthName(currDate.getMonth());
			currDate.setMonth(currDate.getMonth() - 1);
		}
		this.rows = 0;
		this.columns = 0;
	}

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_next() {
		let dateSelected = false;
		for (let index = 0; index < this.checkBox.length; index++) {
			if (this.checkBox[index]) {
				dateSelected = true;
			}
		}

		if (this.filteredDate.length > 0) {
			dateSelected = true;
		}

		if (!dateSelected) {
			this.errorMessage = `Choose period`;
		} else {
			this.currentStep++;
		}
		this.requestUpdate();
	}

	_back() {
		this.currentStep--;
		this.requestUpdate();
	}

	_viewFees() {

		this.dispatchEvent(new CustomEvent(`view-fees`, {}));

		// Place in product control where class gets called
		// const fees = await this._configuration.getSetting(`otherSystemsURL.fees`);
		// window.open(`${fees}`);
	}

	_clearFilter(filterDate) {
		const index = this.filteredDate.indexOf(filterDate);

		if (index > -1) {
			this.filteredDate.splice(index, 1);
		}
		this.requestUpdate();
	}

	_checkBox(e, index) {
		this._clearErrors();

		if (this.checkBox[index] === true) {
			this.checkBox[index] = false;
		} else {
			this.checkBox[index] = true;
		}

		if (this.checkBox.every(val => val === true)) {
			this.checkAll = false;
			this.isChecked = true;
			console.log(`checked`);
		} else if (this.checkBox.every(val => val === false)) {
			this.checkAll = false;
			this.isChecked = false;
		} else {
			this.checkAll = true;
			this.isChecked = false;
		}
		this.requestUpdate();
	}

	_selectAll() {
		this._clearErrors();
		this.checkAll = false;

		if (this.checkBox.every(val => val === true)) {
			for (let index = 0; index < 6; index++) {
				this.checkBox[index] = false;
			}
		} else {
			this.isChecked = true;
			for (let index = 0; index < 6; index++) {
				this.checkBox[index] = true;
			}
		}

		this.requestUpdate();
	}

	_emailFormatCheck(e) {
		
		this[e.currentTarget.id] = e.detail.new;

		if (e.detail.new.length > 0) {
			if (!EMAIL_REGEX.test(e.detail.new)) {
				this.errorMessage = `Invalid email format`;
				this.mailClientError.email = `Invalid email format`;
				this.mailClientError.confirmEmail = `Invalid email format`;
			} else {
				this.errorMessage = ``;
				this.mailClientError[e.currentTarget.id] = ``;
			}
		}
		if (!this._confirmEmailMatch()) {
			this.errorMessage = `Emails don't match`;
			this.mailClientError.email = `Emails don't match`;
				this.mailClientError.confirmEmail = `Emails don't match`;
		}
		this.requestUpdate();
	}

	_inputEmail(e) {
		this.mailClientError[e.currentTarget.id] = ``;
		this.mailClientError.email = ``;
		this.mailClientError.confirmEmail = ``;
		this.errorMessage = ``;
	}

	_clearErrors() {
		this.errorMessage = ``;
	}


	_datePicked(e) {
		this._clearErrors();
		const selectedMonth = e.detail.month;
		const selectedYear = e.detail.year;

		if (this.filteredDate.includes(`${selectedMonth} ${selectedYear}`)) {
			return;
		}

		this.filteredDate[this.filteredDate.length] = `${selectedMonth} ${selectedYear}`;

		this.requestUpdate();
	}

	static get styles() {
		return [
			super.styles,
			css`
			
				bb-stepper-modal  {              
					--theme-modal-header-height: 64px;
					--theme-modal-header-font-size: 18px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #FFFFFF;
					--theme-modal-header-background-color: #E61414;
					--theme-stepper-inner-step-container-width: 324px;
					--theme-stepper-step-title-font-style: Hind Vadodara SemiBold;
					--theme-stepper-step-title-font-size: 15px;
					--theme-stepper-step-title-max-width: 328px;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-wizard-modal-max-width: 990px;
					--theme-wizard-modal-max-height: 960px;
					--theme-wizard-modal-header-padding: 18.5px 16px;
					--theme-modal-footer-padding: 0px;
				}
				div[slot="step"] {
					height: 100%;

					--theme-layout-gap-spacing: 0px;
				}
				div[slot="footer"] {
					
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
				}

				.main-cb {
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}
				.main-cb > capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-layout-gap-spacing: 15px;
				}
				capitec-hyperlink{
					--theme-hyperlink-color: ##3A3A3A;
				}
				capitec-label[type="subtitle"]{
					line-height: 24px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 16px;

				}
				capitec-label[type="strong"]{
					font-weight: 600;
					margin-right: 0px;
				}
	
				.checktrue{
					height: 56px;
					width: 220px;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
					margin-right: 16px;
					margin-bottom: 16px;
				}
				.checkfalse{
					height: 56px;
					width: 220px;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					background-color: #FFFFFF;
					margin-right: 16px;
					margin-bottom: 16px;
				}
				.months{
					line-height: 20px;
					margin-top:16px;
					margin-left:16px;
					--theme-check-label-spacing: 13px;
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.choose-period{
					margin-bottom:16px;
					margin-right:-10px;
				}
				.choose-period-header{
					margin-bottom:16px;
				}
				.choose-period-header > capitec-check{
					margin-right:10px;
				}
				.seperator {
					width: 941px;
					border: 0.5px solid #E1E1E1;
					margin-bottom: 17px;
					// margin-top: 16px;
				}
				capitec-chip{
					width: 110px;
					height:32px;
					margin-left:8px;
				}
				.filter-label{
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 30px;
				}
				.chip-group{
					margin-top:14px;
				}
				horizon-month-calendar{
					width:320px;
				}
			
			`
		];
	}

	_webTemplate() {
		return html`
			<bb-stepper-modal
				header="Statements"
				.steps="${STATEMENTS_STEPS}"
				current-active-step="${this.currentStep}">
					<div slot="step">
						${this._renderContent()}
					</div>
					<div slot="footer">
						${this._renderFooter()}
					</div>
			</bb-stepper-modal>`;
	}

	_renderContent() {
		switch (this.renderMode) {
			case RENDER_MODE.PDF:
				return html`${this._renderPDFViewer()}`;
			case RENDER_MODE.EMAIL:
			default:
				return html`
					<capitec-content-box
						class="main-cb"
						layout="vertical"
						gap="clear"
						?noScroll="${false}">
							${this._renderAlertBanner()}
							${this._renderChoosePeriod()}
							${this._renderEmailClient()}
					</capitec-content-box>
				`;
		}
	}

	_renderAlertBanner() {
		if (this.errorMessage) {
			return html`
				<capitec-alert-banner
					type="unsuccessful-red">
						<p><b>Notify:</b> ${this.errorMessage}</p>
				</capitec-alert-banner>`;
		}

		return html`
			<capitec-alert-banner
				type="warning">
					<capitec-group layout="horizontal" class="alert-banner-group">
					<capitec-label type="strong" label="Notify client:"></capitec-label>
					<capitec-label type="default"
						label=${this.notifyMessage}>
					</capitec-label>
					<capitec-spacer style="width: 430px;"></capitec-spacer>
					<capitec-hyperlink 
						label="View fees"
						@click="${() => this._viewFees()}">
					</capitec-hyperlink>
				</capitec-group>
			</capitec-alert-banner>
			`;
	}

	_renderChoosePeriod() {
		return this.currentStep === 0
			? html`
				<capitec-group
					class="choose-period-header"
					layout="horizontal">
						<capitec-label
							type="subtitle"
							label="Choose a period (last 6 months)">
						</capitec-label>
						<capitec-spacer style="width: 410px;"></capitec-spacer>
						<capitec-check
							label="Select all"
							?indeterminate="${this.checkAll}"
							?checked="${this.isChecked}"
							@value-change="${e => this._selectAll()}">
						</capitec-check>
				</capitec-group>

				<capitec-group 
					class="choose-period" 
					layout="horizontal"
					gap="clear"
					wrap="true">
						${this.sixMonths.map((item, index) => this._renderMonths(item, index))}
				</capitec-group>
				${this._renderChooseMonth()}`
			: html``;
	}

	_renderMonths(month, index) {
			return html`
			<div class="check${this.checkBox[index]}"> 
				<capitec-check
					class="months"
					label="${month} ${this.today.year}"
					@value-changed=${(e) => this._checkBox(e, index)}
					?checked="${this.checkBox[index]}">
				</capitec-check>
			</div>
		`;
	}

	_renderChooseMonth() {
		// set minDate and maxDate for calendar for accountOpened and accountClosed dates
		// minDate="${DateTime.local(2019, 7).toString()}"

		return html`
			<hr class="seperator">
			<capitec-label
				type="subtitle"
				label="Choose other dates">
			</capitec-label>

			<horizon-month-calendar
				style="padding-bottom:16px;"
				type="single"
				mode="date"
				inputType="calendar"
				outputType="string"
				@value-changed="${e => this._datePicked(e)}">
			</horizon-month-calendar>
		
			${this._renderFilter()}
		`;

	}

	_renderFilter() {
		if (this.filteredDate.length > 0) {
			return html`
				<capitec-group class="chip-group" layout="horizontal">
					<capitec-label class="filter-label" label = "Active filters:"></capitec-label>
					${this.filteredDate.map(item => this._renderChips(item))}
				</capitec-group>
			`;
		}
		return html``;
	}

	_renderEmailClient() {
		// TODO Add code for email section and PDF viewer
		return this.currentStep === 1 && this.renderMode === RENDER_MODE.EMAIL
		? html`
		<capitec-label
			type="subtitle"
			label="Enter email address">
		</capitec-label>

		<capitec-text-field
			id="email"
			label="Email address"
			oncopy="return false"
			onpaste="return false"
			oncut="return false"
			value="${this.email}"
			error="${this.mailClientError.email}"
			@value-changed="${(e) => this._emailFormatCheck(e)}"
			@input="${(e) => this._inputEmail(e)}">
		</capitec-text-field>

		<capitec-label
			class="chooseText"
			type="subtitle"
			label="Confirm email address">
		</capitec-label>
		<capitec-text-field
			id="confirmEmail"
			label="Email address"
			oncopy="return false" 
			onpaste="return false"
			oncut="return false"
			value="${this.confirmEmail}"
			error="${this.mailClientError.confirmEmail}"
			@value-changed="${(e) => this._emailFormatCheck(e)}"
			@input="${(e) => this._inputEmail(e)}">
		</capitec-text-field>
	
		<hr class="seperator">

		<capitec-label
			type="subtitle"
			label="View document">
		</capitec-label>

		<!--add dates to list then list.map((item) => this._renderViewDocument(item)) and label="item"-->
		<horizon-product-tile
			class="view-document"
			type="default"
			label="Sep 2021"
			subtitle="Last 30 days">
				${this._renderViewDocumnetLink()}
		</horizon-product-tile>
	`
		: html``;
	}

	_renderViewDocumnetLink() {
		return html`
			<capitec-label
				slot="detail"
				type="strong"
				label="View Document"
				@click="${() => this._viewPDF()}">
			</capitec-label>
		`;
	}

	_renderChips(chip) {
		return html`
			<capitec-chip
				label="${chip}"
				@remove="${() => this._clearFilter(chip)}"
				closable>
			</capitec-chip>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-content-box
				class="footer"
				layout="horizontal"
				gap="clear"
				halign="left"
				valign="center">
					<capitec-button
						data-automation-id="statements-dialog-back"
						type="clear"
						label="Back"
						@click="${(e) => this._back()}"
						?hidden="${this.currentStep === 0 || this.renderMode === RENDER_MODE.PDF}">
					</capitec-button> 
					<capitec-spacer></capitec-spacer>
					<capitec-button
						data-automation-id="statements-dialog-cancel"
						type="secondary"
						label="Cancel"
						@click="${() => this._cancel()}"
						?hidden="${this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						data-automation-id="statements-dialog-next"
						type="primary"
						label="Next"
						@click="${() => this._next()}"
						?hidden="${this.currentStep === 1 || this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						data-automation-id="statements-dialog-send"
						type="primary"
						label="Send"
						@click="${() => this._sendStatement()}"
						?hidden="${this.currentStep !== 1 || this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						data-automation-id="statements-dialog-close"
						type="primary"
						label="Close"
						@click="${() => this._close()}"
						?hidden="${this.renderMode !== RENDER_MODE.PDF}">
					</capitec-button>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`horizon-credit-statements-dialog`, CreditStatementsDialog);