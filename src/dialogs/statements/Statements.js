import { Component, html } from 'platform/elements';
import { Configuration, Logger, NavigationContext } from 'platform/core';
import { ACCOUNT_TYPES } from 'app/constants/Common';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/constants/Statements';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { base64ToBlobUrl } from 'app/utils/channelServiceUtilities';
import { CreditService } from 'app/services/CreditService';

import 'app/components/dialogs/common/StatementsDialog';

/**
 * Statements dialog is used to view/send statements from the Quick transaction & corresponding product screens.
 * 
 * Event Raised
 * -------------
 * cancel
 * account-selected
 * 
 * @export
 * @class Statements
 * @extends {Component}
 */
export class Statements extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();

		this.isBusy = false;

		this.configuration = Configuration.getInstance();
		this.logger = Logger.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this._telemetry = HorizonTelemetry.instance;
		this.taxCertificateDetails = null;
		this.selectedDatesList = [];
		this._telemetryEventsImport();

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), () => true);
		this.creditService = new CreditService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {string} cifNumber The client's CIF number
	 * @property {Array} clientProducts Contains list of products that the client has.
	 * @property {string} type Contains the type of account
	 * @property {string} availableMonthlyStatementsList Contains all the avaliable statements a client has for a particular product type and specific account number
	 * @readonly
	 * @static
	 * @memberof Statements
	 */
	 static get properties() {
		return {
			cifNumber: { type: String },
			clientProducts: { type: Array },
			creditOptionType: { type: String },
			accountType: { type: String, attribute: `type` },
			availableMonthlyStatementsList: {type: Array},
			isBusy: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		// Fetching the telemetry events object at runtime based on product type
		// const type = this.type || `Default`;
		const { STATEMENT_EVENTS } = await this.telemetryEvents[this.accountType]();

		this.telemetryEvent = STATEMENT_EVENTS;
		this._onLoading();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(this.telemetryEvent.STATEMENTS_POP);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_statementsAccConfirmed(event) {
		this.dispatchEvent(new CustomEvent(`account-selected`, {
			detail: {
				account: event.detail.account,
				subCategory: event.detail.subCategory
			}
		}));
	}

	async _cancel() {
		await this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_CANCEL, {
			"screen": TelemetryScreen.STATEMENTS
		});
		await this._telemetry.endSpan(this.telemetryEvent.STATEMENTS_POP, {}, false, false);

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	async _next(event) 
	{
		
		switch (event.detail?.stepper) 
		{
			case RENDER_MODE.CHOOSE_ACCOUNT:
				this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_ACCOUNT_NEXT, {
					"account-type": event.detail.accountName
				});
				break;
			case RENDER_MODE.CHOOSE_PERIOD:
				await this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_PERIOD_NEXT, {
					"screen": TelemetryScreen.STATEMENTS,
					"period": event.detail.periodSelected || null,
					"start-date": event.detail.fromDate || null,
					"end-date": event.detail.toDate || null,
					"month-interval": event.detail.selectedMonths
				});
				break;
			default:
				break;
		}
	}

	_back() {
		this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_BACK);
	}

	_send(productType, request) {
		switch (productType) {
			case ACCOUNT_TYPES.CREDIT:
				return this._sendCreditStatement(request);
			default:
				return this._sendStatement(request);
		}
	}

	_viewPDF(productType, request) {
		switch (productType) {
			case ACCOUNT_TYPES.CREDIT:
				return this._viewCreditStatement(request);
			default:
				return this._viewStatement(request);
		}
	}

	_closePDF() {
		this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_CLOSE_PDF);
	}

	async _viewFees() {
		const fees = await this.configuration.getSetting(`otherSystemsURL.fees`);
		window.open(`${fees}`);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_telemetryEventsImport() {
		this.telemetryEvent = {};
		this.telemetryEvents = {
			[ACCOUNT_TYPES.SAVINGS_ACCOUNT]: () => import(`app/constants/telemetry/events/SavingsAccount`),
			[ACCOUNT_TYPES.LBB]: () => import(`app/constants/telemetry/events/LiveBetter`),
			[ACCOUNT_TYPES.CREDIT]: () => import(`app/constants/telemetry/events/Credit`),
			'': () => import(`app/constants/telemetry/events/QuickTransactions`) // Default
		};
	}

	async _onLoading() {
		await this._telemetry.startSpan(this.telemetryEvent.STATEMENTS);
		await this._telemetry.startSpan(this.telemetryEvent.STATEMENTS_POP);
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _viewStatement(request) {
		const statement = {
			"cifNumber": this.cifNumber,
			"accountNumber": `${request.accountNumber}`,
			"accountType": `${request.accountType}`,
			"statementDateRange": {
				"dateRange": {},
				"presetInterval": `${request.dateInterval}`
			}
		};

		if (request.startDate && request.endDate) {
			statement.statementDateRange.dateRange = {
				"startDate": request.startDate,
				"endDate": request.endDate
			};
		}

		await this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_VIEW_PDF, {
			'cifNumber': statement.cifNumber,
			'accountNumber': statement.accountNumber,
			'accountType': statement.accountType,
			'dateRange': !request.startDate && !request.endDate ? `` : `${request.startDate}-${request.endDate}`,
			'statement-period': statement.statementDateRange.parseInterval
		});

		const returnValue = await this.quickTransactionService.viewStatement(statement, () => this._createIncidentOnError());
		
		if (returnValue.succeeded) {
			return base64ToBlobUrl(returnValue.result.statementData);
		} else if (this.accountType === ACCOUNT_TYPES.LBB) {
			this.horizonRouter.navigateToliveBetterSystemError();
		} else {
			this.logger.log(`error`, `Unable to view statments due to a system error`, `_viewPDF`, returnValue.correlationId);
			return null;
		}
	}

	async _viewCreditStatement(request) 
	{
		let dateSelected = request.month;
		var returnValue ;
		if (this.creditOptionType == `Credit card` || this.creditOptionType == `Access facility`)
		{
			let statementInfo = this.findStatement(dateSelected);
			returnValue = this.getflexStatement(this.creditOptionType , statementInfo);
			if (returnValue!=null)
			{
				return returnValue;
			}
			return null;
		}
		else if (this.creditOptionType==`Term Loan`)
		{	
			if (request.dateInterval) 
			{
				//let today = new Date().toISOString().slice(0, 10);
				let today = `2021-09-11`
				let fromRange =this.getFromDateFromSetDate(request.dateInterval);
				returnValue = await this.creditService.fixedStatement(request.accountNumber,fromRange,today,``);
			}
			returnValue = await this.creditService.fixedStatement(request.accountNumber,request.startDate,request.endDate,``);
			if (returnValue.succeeded)
			{
				let data = returnValue.result.content.data ;
				return base64ToBlobUrl(data);
			}else {
				this.logger.log(`error`, `Unable to view statments due to a system error`, `_viewPDF`, returnValue.correlationId);
				return null;
			}
		}
		return null;

	}
	async getflexStatement(creditOptionType ,statementInfo )
	{
		if (statementInfo!=null)
		{
			var returnValue;
			if (creditOptionType == `Credit card`)
			{
				returnValue = await this.creditService.flexibleStatement(statementInfo.accountNumber,`CreditCard`,statementInfo.statementId);
				
			} else if (this.accountType==`Access facility`)
			{
				returnValue = await this.creditService.flexibleStatement(statementInfo.accountNumber,`AccessFacility`,statementInfo.statementId);
			} 
			if (returnValue.succeeded)
			{
				let data = returnValue.result.content.data ;
				return base64ToBlobUrl(data);
			}else {
				this.logger.log(`error`, `Unable to view statments due to a system error`, `_viewPDF`, returnValue.correlationId);
				return null;
			}
		}
		return null;
	}

	_handleChannelServiceError(ex) {
		this.errorMessage = `System error. Please try again.`;
		this.errorCount++;

		if (this.errorCount > 2) {
			this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
			this.horizonStore.setCallerInformation(this.callerInformation);
			this.horizonRouter.navigateToSystemError();
		}
		return true;
	}

	findStatement(dateSelected)
	{
		const dateinfo = dateSelected.split("/");
		let i = 0;
		let flag = false;
		while (i < this.availableMonthlyStatementsList.length && flag ==false)
		{
			
			const monthlyStatement = this.availableMonthlyStatementsList[i];
			const statementDateArray = monthlyStatement.statementDate.split("-");
			if (statementDateArray[0]==dateinfo[1] && statementDateArray[1]==dateinfo[0])
			{
				flag = true;
				return monthlyStatement;
			}
			i = i+1;
		}
		return null;
	}

	async _sendStatement(request) {
		const statement = {
			"emailAddress": request.emailAddress,
			"cifNumber": this.cifNumber,
			"accountNumber": `${request.accountNumber}`,
			"accountType": `${request.accountType}`,
			"statementDateRange": {
				"dateRange": {},
				"presetInterval": `${request.dateInterval}`
			},
			"title": `Mrs`,
			"lastName": `PRETORIUS`
		};

		if (request.startDate && request.endDate) {
			statement.statementDateRange.dateRange = {
				"startDate": request.startDate,
				"endDate": request.endDate
			};
		}

		await this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_SEND, {
			'screen': TelemetryScreen.STATEMENTS,
			'email-address': statement.emailAddress,
			'dateRange': !request.startDate && !request.endDate ? `` : `${request.startDate}-${request.endDate}`,
			'statement-period': statement.statementDateRange.parseInterval,
			'next-screen': TelemetryScreen.STATEMENTS_OUTCOME
		});

		const returnValue = await this.quickTransactionService.sendStatement(statement);
		this._updateScreenDetails(request);
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `statements`);

		if (returnValue.succeeded) {
			this.horizonRouter.navigateToStatementSuccessful();
		} else {
			this.horizonRouter.navigateToStatementUnsuccessful();
		}
	}

	async _sendCreditStatement(request) 
	{
		let flag = false;
		var returnValue;
		if (this.creditOptionType == `Credit card` || this.creditOptionType == `Access facility`)
		{
			for (let i = 0; i < request.monthInterval.length; i++)
			{
				let dateSelected = request.monthInterval[i];
				let statementInfo = this.findStatement(dateSelected);
				let statementDetails = [{
					statementId : statementInfo.statementId,
					statementDate: statementInfo.statementDate}
				];
				if (this.creditOptionType == `Credit card`){
					 returnValue = await this.creditService.flexibleStatementEmail(`CreditCard`,request.accountNumber , request.emailAddress ,statementDetails);
				}else{
					 returnValue = await this.creditService.flexibleStatementEmail(`AccessFacility`,request.accountNumber , request.emailAddress ,statementDetails);
				}
				if (returnValue.succeeded) 
				{
					flag = true;
				}
			}
		}else if (this.creditOptionType==`Term Loan`)
		{
			if (request.dateInterval) 
			{
				let today = new Date().toISOString().slice(0, 10);
				let fromRange = this.getFromDateFromSetDate(request.dateInterval);
				returnValue = await this.creditService.fixedStatementEmail(request.accountNumber,request.emailAddress,today,fromRange);	
			}
			else
			{
				returnValue = await this.creditService.fixedStatementEmail(request.accountNumber,request.emailAddress,request.startDate,request.endDate);
			}

			if (returnValue.succeeded) 
			{
				flag = true;
			}
		}
		this._updateScreenDetails(request);
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `statements`);
		if (flag) {
			this.horizonRouter.navigateToCreditStatementSuccess();
		} else {
			this.horizonRouter.navigateToCreditStatementUnsuccess();
		}

		
	}

	getFromDateFromSetDate(interval)
	{
		 
		switch(interval)
		{
			case "ONE_MONTH":
				return this.getDateRange(`1`);
				break;
			case "THREE_MONTH":
				return this.getDateRange(`3`);
				break;
			case "SIX_MONTH":
				return this.getDateRange(`6`);
				break;
			case "NINE_MONTH":
				return this.getDateRange(`9`);
				break;	
		}
	}

	getDateRange (item)
	{
		//let currentdate = new Date();
		let currentdate = `2021-09-11`
		switch (item)
		{
			case "1":
				return new Date(currentdate.setMonth(currentdate.getMonth()-1)).toISOString().slice(0, 10);
			case "3":
				return new Date(currentdate.setMonth(currentdate.getMonth()-3)).toISOString().slice(0, 10);
			case "6":
				return new Date(currentdate.setMonth(currentdate.getMonth()-6)).toISOString().slice(0, 10);
			case "9":
				return new Date(currentdate.setMonth(currentdate.getMonth()-9)).toISOString().slice(0, 10);
		}
		
	}

	async _createIncidentOnError() {
		await super.createAndClassifySubsIncident(() => this._toggleBusyFlag());
		return true;
	}

	_updateScreenDetails(request) {
		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.emailAddress = request.emailAddress;
		screenDetails.accountNumber = request.accountNumber;
		screenDetails.accountType = request.accountName;
		screenDetails.telemetryEvent = this.telemetryEvent;

		this.horizonStore.setScreenDetails(screenDetails);
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderLoadingIndicator()}
			<horizon-statements-dialog
				.clientProducts="${this.clientProducts}"
				type="${this.accountType}"
				@cancel="${() => this._cancel()}"
				@back="${() => this._back()}"
				@next="${(event) => this._next(event)}"
				.viewStatement="${(productType, request) => this._viewPDF(productType, request)}"
				.sendStatement="${(productType, request) => this._send(productType, request)}"
				@close-pdf="${() => this._closePDF()}"
				@account-selected="${(event) => this._statementsAccConfirmed(event)}"
				@view-fees="${() => this._viewFees()}">
			</horizon-statements-dialog>
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
}
customElements.define(`horizon-statements`, Statements);