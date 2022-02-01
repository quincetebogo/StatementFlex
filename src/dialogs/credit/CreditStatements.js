import { css, html } from 'platform/elements';
import { DateTime } from 'luxon';
import { getMonthName } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { StatementsDialog } from 'app/components/dialogs/common/StatementsDialog';

import 'app/components/common/StepperModal';
import 'app/components/common/HorizonPDFViewer';
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

export class CreditStatementsDialog extends StatementsDialog {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.notifyMessage = ` A fee will be charged for email statements.`;
		this.filteredDate = [];
		this.sixMonths = [];
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
		this.currPage = 0;
		this.totalPages = 0;
		this.startDate = DateTime.local(2001, 1);
		this.endDate =this.today;		

		this.horizonRouter = HorizonRouter.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		const dateConverter = (value) => {
			const date = value && value !== `null` ? new Date(value) : null;

			if (date) {
				const dateTime = DateTime.fromJSDate(date);
				// const dateTime = new Date(date);

				return dateTime.isValid ? dateTime : null;
			}

			return null;
		};
		return {
			checkAll: { type: String },
			checkBox: { type: Array },
			filterDate: { type: Array },
			errorMessage: { type: String },
			navigatePDF: { type: Object },
			currPage: { type: Number },
			encodedPDF: { type: String },
			startDate: { type: String, converter: dateConverter },
			endDate: { type: String, converter: dateConverter }
		};
	}
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

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
			super.errorMessage = `Choose period`;
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
	}

	async _navigate(step){
		let datesSelected = this._getAllDates();
		if(step==="next"){
			this.currPage < datesSelected.length ? this.currPage++ : this.currPage;			
			 this.encodedPDF = await this.navigatePDF(datesSelected[this.currPage-1]);
		}else{
			this.currPage > 1 ? this.currPage-- : this.currPage;
			this.encodedPDF = await this.navigatePDF(datesSelected[this.currPage-1]);
		}
	}

	async _viewPDF(date){
		//TODO: PDF viewer with arrows
		let selectedDates = this._getAllDates();
		this.currPage = selectedDates.indexOf(date) + 1;
		this.encodedPDF = await this.navigatePDF(this.currPage);
		super.renderMode = RENDER_MODE.PDF;
	}

	_sendStatement() {
	
		// TO DO: Navigation to success or failure screens based on CS call response.
	
		this.horizonRouter.navigateToCreditStatementSuccess();
		//this.horizonRouter.navigateToCreditStatementUnsuccess();
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {

		for (let index = 0; index < 6; index++) {
			this.checkBox[index] = false;
		}

		let accOpened = 6;
		const currDate = new Date();
		let minDate = DateTime.local().minus({ months: 6 }).toJSDate();

		if(this.startDate > minDate){
			//start date is less than 6 months
			let diff = DateTime.local().diff(this.startDate, ["months"]);
			accOpened = Math.ceil(diff.toObject().months);
		}

		for (let month = 0; month < accOpened; month++) {
			this.sixMonths[month] = `${getMonthName(currDate.getMonth())} ${currDate.getFullYear()}`;
			currDate.setMonth(currDate.getMonth() - 1);
		}			
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

	_clearErrors() {
		super.errorMessage = ``;
	}

	_datePicked(e) {
		this._clearErrors();
		const selectedMonth = e.detail.month;
		const selectedYear = e.detail.year;

		this.filteredDate[this.filteredDate.length] = `${selectedMonth} ${selectedYear}`;
		this.filteredDate = [...new Set(this.filteredDate)];

		this.requestUpdate();
	}

	_cancelPDF(){
		super.renderMode = RENDER_MODE.EMAIL;
	}

	_getAllDates(){
		let datesSelected = this.filteredDate.concat(this.checkBox.map((item, index) =>item === true ? this.sixMonths[index] : ``));
		//removes duplicates and empty values
		datesSelected = [...new Set(datesSelected.filter((item) => item!== ``))];
		//sort according to date from latest date
		datesSelected.sort((a, b) => new Date(b) - new Date(a));
		return datesSelected;
	}

	
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			
				bb-stepper-modal  {              
					--theme-modal-header-color: #FFFFFF;
					--theme-modal-header-background-color: #E61414;
					--theme-wizard-modal-max-width: 990px;
					--theme-wizard-modal-max-height: 960px;
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
					margin-right: 0px;
					line-height: 20px;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
				}
				.alertLabel{
					margin-right: 0px;
					color: #3A3A3A;
					font-size: 14px;				
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
				.line{
					width: 955px;
					border: 0.5px solid #E1E1E1;
					margin-bottom: 17px;
					margin-top: 0px;
				}
				.seperator{
					width: 955px;
				}
				capitec-chip{
					width: 110px;
					height: 32px;
					margin-left: 8px;
					margin-bottom: 8px;
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
		switch(super.renderMode){
			case RENDER_MODE.PDF:
				return html`${this._renderPDFViewer()}`;
			case RENDER_MODE.EMAIL:
			default:
				return html`${this._renderModal()}`;
		}		
	}

	_renderModal(){
		return html`
			<bb-stepper-modal
				header="Statements"
				.steps="${STATEMENTS_STEPS}"
				current-active-step="${super.currentStep}">
					<div slot="step">
						<capitec-content-box
							class="main-cb"
							layout="vertical"
							gap="clear"
							?noScroll="${false}">
								${this._renderAlertBanner()}
								${this._renderChoosePeriod()}
								${this._renderEmailClient()}
						</capitec-content-box>
					</div>
					<div slot="footer">
						${this._renderFooter()}
					</div>
			</bb-stepper-modal>`;
	}

	_renderAlertBanner() {
		if (super.errorMessage) {
			return html`
				<capitec-alert-banner
					type="unsuccessful-red">
						<p><b>Notify:</b> ${super.errorMessage}</p>
				</capitec-alert-banner>`;
		}

		return html`
			<capitec-alert-banner
				type="warning">
					<capitec-group layout="horizontal" class="alert-banner-group">
					<capitec-label type="strong" class="alertLabel" label="Notify client:"></capitec-label>
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
		return super.currentStep === 0
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
					label="${month}"
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
			<hr class="line">
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
				minDate="${this.startDate.toString()}"
				@value-changed="${e => this._datePicked(e)}">
			</horizon-month-calendar>
		
			${this._renderFilter()}
		`;

	}

	_renderFilter() {
		if (this.filteredDate.length > 0) {
			return html`
				<capitec-group 
					class="chip-group" 
					layout="horizontal" 
					wrap="true">
						<capitec-label class="filter-label" label = "Active filters:"></capitec-label>
						${this.filteredDate.map(item => this._renderChips(item))}
				</capitec-group>
			`;
		}
		return html``;
	}

	_renderEmailClient() {
		// TODO Add code for email section and PDF viewer	
		let datesSelected = this._getAllDates();			
		
		return super.currentStep === 1 && super.renderMode === RENDER_MODE.EMAIL
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
			@value-changed="${(e) => super._emailFormatCheck(e)}"
			@input="${(e) => super._inputEmail(e)}">
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
			@value-changed="${(e) => super._emailFormatCheck(e)}"
			@input="${(e) => super._inputEmail(e)}">
		</capitec-text-field>
	
		<hr class="seperator">

		<capitec-label
			type="subtitle"
			label="View document">
		</capitec-label>

		${datesSelected.map(item => this._renderViewDocument(item))}`
		: html``;
	}

		_renderViewDocument(item) {
		return super.currentStep === 1 && super.renderMode === RENDER_MODE.EMAIL
		? html`
		<horizon-product-tile
			class="view-document"
			type="default"
			label="${item}"
			subtitle="Last 30 days">
				${this._renderViewDocumnetLink(item)}
		</horizon-product-tile> `
		: html ``;
	}	

	_renderViewDocumnetLink(item) {
		return html`
			<capitec-label
				slot="detail"
				type="strong"
				label="View Document"
				class="viewDocumentLink"				
				@click="${() => this._viewPDF(item)}">
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

	_renderPDFViewer(){
		let datesSelected = this._getAllDates();
		return html`
			<horizon-pdf-viewer
			header="Settlement Quote: "
			totalPages="${datesSelected.length}"
			currPage="${this.currPage}"
			dateSelected="${datesSelected[this.currPage-1]}"
			encodedPDF="${this.encodedPDF}"
			@cancel="${()=>this._cancelPDF()}"
			@next="${() => this._navigate("next")}"
			@previous="${() => this._navigate("previous")}">

			</horizon-pdf-viewer>
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
						@click="${(e) => super._back()}"
						?hidden="${super.currentStep === 0 || super.renderMode === RENDER_MODE.PDF}">
					</capitec-button> 
					<capitec-spacer></capitec-spacer>
					<capitec-button
						data-automation-id="statements-dialog-cancel"
						type="secondary"
						label="Cancel"
						@click="${() => super._cancel()}"
						?hidden="${super.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						data-automation-id="statements-dialog-next"
						type="primary"
						label="Next"
						@click="${() => this._next()}"
						?hidden="${super.currentStep === 1 || super.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						data-automation-id="statements-dialog-send"
						type="primary"
						label="Send"
						@click="${() => this._sendStatement()}"
						?hidden="${super.currentStep !== 1 || super.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						data-automation-id="statements-dialog-close"
						type="primary"
						label="Close"
						@click="${() => super._close()}"
						?hidden="${super.renderMode !== RENDER_MODE.PDF}">
					</capitec-button>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`horizon-credit-statements-dialog`, CreditStatementsDialog);