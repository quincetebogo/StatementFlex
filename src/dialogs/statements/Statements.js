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

		this._telemetryEventsImport();

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), () => true);
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {string} cifNumber The client's CIF number
	 * @property {Array} clientProducts Contains list of products that the client has.
	 * @property {string} type Contains the type of account
	 * @readonly
	 * @static
	 * @memberof Statements
	 */
	 static get properties() {
		return {
			cifNumber: { type: String },
			clientProducts: { type: Array },
			accountType: { type: String, attribute: `type` },

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
			[ACCOUNT_TYPES.SAVINGS_PLAN]: () => import(`app/constants/telemetry/events/SavingsPlan`),
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

	async _viewCreditStatement(request) {
		// TODO: Credit view statement comes here
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

	async _sendCreditStatement(request) {
		
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