import { Component, html } from 'platform/elements';
import { Configuration, Logger, NavigationContext } from 'platform/core';
import { RENDER_MODE, TIME_PERIOD } from 'app/constants/Statements';
import { ACCOUNT_TYPES } from 'app/constants/common';
import { CreditService } from 'app/services/CreditService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { PRODUCTS } from 'app/constants/Credit';
import { SavingsService } from 'app/services/SavingsService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { base64ToBlobUrl } from 'app/utils/channelServiceUtilities';
import { creditMixin } from 'app/views/credit/CreditMixin';

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

		this.selectedProduct = {};
		this.availableMonthlyStatements = [];
		this.ccsStatus = false;

		this._telemetryEventsImport();

		this.savingsService = new SavingsService(() => this._toggleBusyFlag(), () => this._handleChannelServiceError());
		this.creditService = new CreditService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));

		Object.assign(Statements.prototype, creditMixin);
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {string} cifNumber The client's CIF number
	 * @property {Array} clientProducts Contains list of products that the client has.
	 * @property {string} type Contains the type of account
	 * @property {string} title client's title (Mr/ Mrs)
	 * @property {string} lastName client's last name
	 * @property {string} registeredEmailId Client's registered email ID
	 * @readonly
	 * @static
	 * @memberof Statements
	 */
	 static get properties() {
		return {
			cifNumber: { type: String },
			clientProducts: { type: Array },
			lastName: { type: String },
			accountType: { 
				type: String, 
				attribute: `type`
			},
			title: { 
				type: String,
				attribute: `client-title`
			},
			registeredEmailId: { type: String },
			isBusy: { state: true },
			ccsStatus: { state: true }
		};
	}

	get creditDateInterval() {
		return {
			[TIME_PERIOD.ONE_MONTH.value]: 1,
			[TIME_PERIOD.THREE_MONHTS.value]: 2,
			[TIME_PERIOD.SIX_MONTHS.value]: 3,
			[TIME_PERIOD.NINE_MONTHS.value]: 4
		};
	}

	get creditProducts() {
		return {
			[PRODUCTS.CREDIT_CARD]: `CreditCard`,
			[PRODUCTS.ACCESS_FACILITY]: `AccessFacility`,
			[PRODUCTS.TERM_LOAN]: `TermLoan`
		};
	}

	get statementAsOption() {
		return this.accountType ? `statements-${this.accountType}` : `statements`;
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

	async _statementsAccConfirmed(event) {
		this.selectedProduct = this.clientProducts.find(item => item.accountNumber === event.detail.accountNumber);
		this.availableMonthlyStatements = [];

		this.dispatchEvent(new CustomEvent(`account-selected`, {
			detail: {
				account: event.detail.account,
				subCategory: event.detail.subCategory
			}
		}));

		const creditPermissions = () => this._creditCheckPermissions(event.detail.accountNumber, event.detail.name);
		const postActions = {
			[ACCOUNT_TYPES.CREDIT]: creditPermissions
		};

		if (postActions[event.detail.account]) {
			await postActions[event.detail.account]();
		}
	}

	async _cancel() {
		await this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_CANCEL, {
			"screen": TelemetryScreen.STATEMENTS
		});
		await this._telemetry.endSpan(this.telemetryEvent.STATEMENTS_POP, {}, false, false);

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	async _next(event) {
		
		switch (event.detail?.stepper) {
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
				await this._getAvailableMonthlyStatements(); // This is specifically for flexible credit
				break;
			default:
				break;
		}
	}

	_back() {
		this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_BACK);
	}

	_send(request) {
		switch (this.selectedProduct.category) {
			case ACCOUNT_TYPES.CREDIT:
				return this._sendCreditStatement(request);
			default:
				return this._sendStatement(request);
		}
	}

	_viewPDF(request) {
		switch (this.selectedProduct.category) {
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
			[ACCOUNT_TYPES.SAVINGS_PLAN]: () => import(`app/constants/telemetry/events/SavingsPlan`),
			'': () => import(`app/constants/telemetry/events/QuickTransactions`) // Default
		};
	}

	async _onLoading() {
		await this._telemetry.startSpan(this.telemetryEvent.STATEMENTS);
		await this._telemetry.startSpan(this.telemetryEvent.STATEMENTS_POP);

		if (this.accountType) {
			[this.selectedProduct] = this.clientProducts;
		}
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

		const returnValue = await this.savingsService.viewStatement(statement, () => this._createIncidentOnError());
		
		if (returnValue.succeeded) {
			return base64ToBlobUrl(returnValue.result.statementData);
		} else if (this.accountType === ACCOUNT_TYPES.LBB) {
			this.horizonRouter.navigateToliveBetterSystemError();
		} else {
			this.logger.log(`error`, `Unable to view statments due to a system error`, `_viewPDF`, returnValue.correlationId);
			return null;
		}
	}

	async _viewCreditStatement(request) {

		if (request.accountType === `FLEXIBLE_CREDIT`) {
		
			const statementInfo = this.findStatement(request.month);
			const result = await this.getflexStatement(this.creditProducts[this.selectedProduct.name], statementInfo);

			return result;
		} else if (request.accountType === `FIXED_TERM_CREDIT`) {

			const returnValue = await this.creditService.fixedStatement(request.accountNumber, request.startDate, request.endDate, this.creditDateInterval[request.dateInterval]);

			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Unable to view statments due to a system error`, `_viewCreditStatement`, returnValue.correlationId);
				return null;
			}
			return base64ToBlobUrl(returnValue.result.content.data);
		}
		return null;
	}

	async _getAvailableMonthlyStatements() {

		if (this.availableMonthlyStatements.length === 0 && [PRODUCTS.CREDIT_CARD, PRODUCTS.ACCESS_FACILITY].includes(this.selectedProduct.name)) {
			
			const returnValue = await this.creditService.flexibleStatementList(this.selectedProduct.accountNumber, this.creditProducts[this.selectedProduct.name]);

			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Unable to get available monthly statements for ${this.selectedProduct.name}`, `_getAvailableMonthlyStatements`, returnValue.correlationId);
				return false;
			}

			this.availableMonthlyStatements = returnValue.result.monthlyStatements;
		}
	}

	async getflexStatement(type, statementInfo) {
		if (!statementInfo?.accountNumber) {
			return null;
		}

		const returnValue = await this.creditService.flexibleStatement(statementInfo.accountNumber, type, statementInfo.statementId); 

		if (returnValue.succeeded) {
			return base64ToBlobUrl(returnValue.result?.content?.data);
		}
		
		this.logger.log(`error`, `Unable to view statments due to a system error`, `_viewPDF`, returnValue.correlationId);
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

	findStatement(monthSelected) {
		const [month, year] = monthSelected.split(`/`);

		return this.availableMonthlyStatements.find(item => {
			const statementDate = new Date(item.statementDate);
			return parseInt(month, 10) === statementDate.getMonth() + 1 && parseInt(year, 10) === statementDate.getFullYear();
		});
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
			"title": this.title,
			"lastName": this.lastName
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

		const returnValue = await this.savingsService.sendStatement(statement);
		this._updateScreenDetails(request);

		this.horizonStore.setReturnScreen(this.navigationContext.current.route, this.statementAsOption);
		
		if (returnValue.succeeded) {
			this.horizonRouter.navigateToStatementSuccessful();
		} else {
			this.horizonRouter.navigateToStatementUnsuccessful();
		}
	}

	async _sendCreditStatement(request) {
		let returnValue;

		if (request.accountType === `FLEXIBLE_CREDIT`) {

			const statementDetails = request.monthInterval.map(item => this.findStatement(item))
														  .filter(item => item);
			statementDetails.map(item => {
				const data = {};
				data.statementId = item.statementId;
				data.statementDate = item.statementDate;

				return data;
			});
			returnValue = await this.creditService.flexibleStatementEmail(this.creditProducts[this.selectedProduct.name], request.accountNumber, request.emailAddress, this.cifNumber, this.title, this.lastName, statementDetails);
		} else if (request.accountType === `FIXED_TERM_CREDIT`) {

			returnValue = await this.creditService.fixedStatementEmail(request.accountNumber, request.emailAddress, request.startDate, request.endDate, this.creditDateInterval[request.dateInterval], this.cifNumber, this.title, this.lastName);
		}

		this._updateScreenDetails(request);
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `statements`);
		
		if (returnValue?.succeeded) {
			this.horizonRouter.navigateToCreditStatementSuccess();
		} else {
			this.horizonRouter.navigateToCreditStatementUnsuccess();
		}
	}

	async _createIncidentOnError() {
		await super.createAndClassifySubsIncident(() => this._toggleBusyFlag());
		return true;
	}

	_updateScreenDetails(request) {
		const screenDetails = this.horizonStore.getScreenDetails();

		// Inc description
		screenDetails.productName = this.selectedProduct.name;
		screenDetails.period = !request.startDate && !request.endDate ? `${request.dateInterval}` : `${request.startDate} to ${request.endDate}`;
		screenDetails.productType = this.selectedProduct.category;
		screenDetails.monthRange = request.monthInterval.join(`,`);
		screenDetails.emailAddress = request.emailAddress;
		screenDetails.accountNumber = request.accountNumber;
		screenDetails.accountName = request.accountName;
		screenDetails.telemetryEvent = this.telemetryEvent;

		this.horizonStore.setScreenDetails(screenDetails);
	}

	async _creditCheckPermissions(accNum, productType) {
		const { ccsStatus } = await this._checkCreditPermisions(`statements`, this.cifNumber, accNum, productType);
		this.ccsStatus = ccsStatus;

		this.clientProducts = this.clientProducts.filter(item => {
			if (item.accountNumber === accNum) {
				item.ccsStatus = this.ccsStatus;
			}
			return item;
		});
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
				registeredEmailId="${this.registeredEmailId}"
				@cancel="${() => this._cancel()}"
				@back="${() => this._back()}"
				@next="${(event) => this._next(event)}"
				.viewStatement="${(request) => this._viewPDF(request)}"
				.sendStatement="${(request) => this._send(request)}"
				@close-pdf="${() => this._closePDF()}"
				@account-selected="${(event) => this._statementsAccConfirmed(event)}"
				@view-fees="${() => this._viewFees()}">
			</horizon-statements-dialog>
			${this._renderCcsModal()}
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="statements-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

	_renderCcsModal() {
		return this.ccsStatus
		? html`
			<horizon-warn-dialog
				content="Unable to perform this transaction as there is a CCS status on this account."
				@on-okay="${() => this.ccsStatus = false}">
			</horizon-warn-dialog>`
		: html``;
	}
}

customElements.define(`horizon-statements`, Statements);