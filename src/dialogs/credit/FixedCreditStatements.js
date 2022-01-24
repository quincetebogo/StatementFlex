import { css, html } from 'platform/elements';
import { DateTime } from 'luxon';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { StatementsDialog } from 'app/components/dialogs/common/StatementsDialog';

import 'app/components/common/StepperModal';
import 'app/components/common/HorizonPDFViewer';
import 'app/components/common/HorizonMonthCalendar';

/* To add dialog to class
import 'app/components/dialogs/common/FixedCreditStatements';

<horizon-fixed-credit-statements-dialog
@cancel="${()=> this._backToLandingPage()}">
</horizon-fixed-credit-statements-dialog>
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
const TIME_PERIOD = {
	ONE_MONTH: {
		value: `ONE_MONTH`,
		label: `1 month`,
		range: 30
	},
	THREE_MONHTS: {
		value: `THREE_MONTH`,
		label: `3 months`,
		range: 90
	},
	SIX_MONTHS: {
		value: `SIX_MONTH`,
		label: `6 months`,
		range: 180
	},
	NINE_MONTHS: {
		value: `NINE_MONTH`,
		label: `9 months`,
		range: 270
	}
};

export class FixedCreditStatementsDialog extends StatementsDialog {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.notifyMessage = ` A fee will be charged for email statements.`;
		this.filteredDate = [];
		this.today = new DateTime.now();
		this.email = ``;
		this.confirmEmail = ``;
		this.encodedPDF = ``;
		this.currPage = 0;
		this.totalPages = 0;
		this.periodSelected = ``;
		this._summary = {
			dateRangeLabel: ``,
			detail: ``
		};
		this.mailClientError = {
			email: ``,
			confirmEmail: ``
		};
		this.horizonRouter = HorizonRouter.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			errorMessage: { type: String },
			navigatePDF: { type: Object },
			currPage: { type: Number },
			encodedPDF: { type: String }
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
		if (this.periodSelected === `` && !this._customDateRange) {
			super.errorMessage = `Choose Period`;
			super.calendarErrorMessage = `Required`;
			return ;
		} else if (this._customDateRange && (this.fromDate === `dd mm yyyy` || this.toDate === `dd mm yyyy`)) {
			super.errorMessage = `Choose Period`;
			super.calendarErrorMessage = `Required`;
			return ;
		}
		super._getSummary();
		this.currentStep++;
	}

	_back() {
		this.currentStep--;
		this.requestUpdate();
	}

	_viewFees() {
		this.dispatchEvent(new CustomEvent(`view-fees`, {}));
	}

	async _navigate(step){
		if(step==="next"){
			this.currPage < datesSelected.length ? this.currPage++ : this.currPage;			
			this.encodedPDF = await this.navigatePDF(datesSelected[this.currPage-1]);
		}else{
			this.currPage > 1 ? this.currPage-- : this.currPage;
			this.encodedPDF = await this.navigatePDF(datesSelected[this.currPage-1]);
		}
	}

	async _viewPDF(date){
		this.encodedPDF = await this.navigatePDF(this.currPage);
		super.renderMode = RENDER_MODE.PDF;
	}

	_sendStatement() {
	
		// TO DO: Navigation to success or failure screens based on CS call response.
		this.horizonRouter.navigateToCreditStatementSuccess();
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		const currDate = new Date();
	}

	_clearErrors() {
		super.errorMessage = ``;
	}

	_cancelPDF(){
		super.renderMode = RENDER_MODE.EMAIL;
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
			</bb-stepper-modal>
			${super._renderLoadingIndicator()}`;
	}

	_renderContent() {
		switch (this.renderMode) {
			case RENDER_MODE.PDF:
				return html`${super._renderPDFViewer()}`;
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

	// _webTemplate() {
	// 	switch(super.renderMode){
	// 		case RENDER_MODE.PDF:
	// 			return html`${this._renderPDFViewer()}`;
	// 		case RENDER_MODE.EMAIL:
	// 		default:
	// 			return html`${this._renderModal()}`;
	// 	}		
	// }

	// _renderModal(){
	// 	return html`
	// 		<bb-stepper-modal
	// 			header="Statements"
	// 			.steps="${STATEMENTS_STEPS}"
	// 			current-active-step="${super.currentStep}">
	// 				<div slot="step">
	// 					<capitec-content-box
	// 						class="main-cb"
	// 						layout="vertical"
	// 						gap="clear"
	// 						?noScroll="${false}">
	// 							${this._renderAlertBanner()}
	// 							${this._renderChoosePeriod()}
	// 							${this._renderEmailClient()}
	// 					</capitec-content-box>
	// 				</div>
	// 				<div slot="footer">
	// 					${this._renderFooter()}
	// 				</div>
	// 		</bb-stepper-modal>`;
	// }

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
			<capitec-label
				type="subtitle"
				label="Choose Period">
			</capitec-label>

			<capitec-group
				class="choose-period"
				layout="horizontal">
					<horizon-product-tile
						type="radio-button"
						label="1 month"
						subtitle="Last 30 days"
						detail=""
						@click="${(e) => super._choosePeriod(`ONE_MONTH`)}"
						?selected="${this.periodSelected === TIME_PERIOD.ONE_MONTH.value}">
					</horizon-product-tile>
					<horizon-product-tile
						type="radio-button"
						label="3 months"
						subtitle="Last 90 days"
						detail=""
						@click="${(e) => super._choosePeriod(`THREE_MONHTS`)}"
						?selected="${this.periodSelected === TIME_PERIOD.THREE_MONHTS.value}">
					</horizon-product-tile>
					<horizon-product-tile
						type="radio-button"
						label="6 months"
						subtitle="Last 180 days"
						detail=""
						@click="${(e) => super._choosePeriod(`SIX_MONTHS`)}"
						?selected="${this.periodSelected === TIME_PERIOD.SIX_MONTHS.value}">
					</horizon-product-tile>
					<horizon-product-tile
						type="radio-button"
						label="9 months"
						subtitle="Last 270 days"
						detail=""
						@click="${(e) => super._choosePeriod(`NINE_MONTHS`)}"
						?selected="${this.periodSelected === TIME_PERIOD.NINE_MONTHS.value}">
					</horizon-product-tile>
			</capitec-group>
			${super._renderPeriodSelected()}`
			: html``;
	}
	_renderEmailClient() {
		// TODO Add code for email section and PDF viewer			
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

		<horizon-product-tile
			class="view-document"
			type="default"
			label="${this._summary.dateRangeLabel}"
			subtitle="${this._summary.detail}">
				${super._renderViewDocumnetLink()}
		</horizon-product-tile>`
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
				${super._renderViewDocumnetLink(item)}
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
				@click="${() => super._viewPDF(item)}">
			</capitec-label>
		`;
	}

	_renderPDFViewer(){
		return html`
			<horizon-pdf-viewer
			header="Settlement Quote: Credit Card"
			currPage="${this.currPage}"
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
						type="clear"
						label="Back"
						@click="${(e) => super._back()}"
						?hidden="${super.currentStep === 0 || super.renderMode === RENDER_MODE.PDF}">
					</capitec-button> 
					<capitec-spacer></capitec-spacer>
					<capitec-button
						type="secondary"
						label="Cancel"
						@click="${() => super._cancel()}"
						?hidden="${super.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						type="primary"
						label="Next"
						@click="${() => this._next()}"
						?hidden="${super.currentStep === 1 || super.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						type="primary"
						label="Send"
						@click="${() => this._sendStatement()}"
						?hidden="${super.currentStep !== 1 || super.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						type="primary"
						label="Close"
						@click="${() => super._close()}"
						?hidden="${super.renderMode !== RENDER_MODE.PDF}">
					</capitec-button>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`horizon-fixed-credit-statements-dialog`, FixedCreditStatementsDialog);