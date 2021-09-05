import { NavigationContext } from 'platform/core';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { html } from 'platform/elements';

import 'app/components/savingsAccount/DebiCheckMandates';
import 'app/components/dialogs/common/StatementsDialog';

/**
 * A sub-base class of viewbase for Favourites & Savings account landing pages 
 * to collect common functionality used by those views
 * 
 * This sub-base class will contain the following common code
 * 
 *    - debi check mandates: added
 *    - statements: added
 *    - handling of back to landing page from component
 *    - mandate action click (View), in future it support approve/decline: added
 *    - incident management
 *
 * @export
 * @class SavingsAccountBase
 * @extends {ViewBase}
 */
export class SavingsAccountBase extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.navigationContext = NavigationContext.getInstance();

		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));

		this.debiCheckDetails = {};
		this.clientProducts = null;
		this.debiCheckMandates = {};
	}

	// --------------
	// PROPERTIES
	// --------------

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
	
	async _debiCheck() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_DEBI_CHECK, {
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.DEBICHECK
		});

		const returnValue = await this.savingsAccountService.debiCheckMandates(this.callerInformation.cifNumber);
		
		if (returnValue.succeeded) {
			await super.createAndClassifySubsIncident();
			
			// eslint-disable-next-line no-extra-parens
			this.debiCheckMandates = (returnValue.result && returnValue.result.mandateSummaryList) || [];
			this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
		} else {
			// Todo: Handle error scenario
		}
	}

	async _getStatements() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_STATEMENTS, {
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.STATEMENTS
		});

		const clientProductDetails = await this._getClientProducts();
		
		if (clientProductDetails) {
			this.clientProducts = clientProductDetails;
			this.renderMode = RENDER_MODE.STATEMENTS;
		}
	}

	async _mandateActionClick (event) {
		if (event.detail.action === `decline`) {
			this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_DECLINE_MANDATE, {
				"screen": TelemetryScreen.DEBICHECK,
				"next-screen": TelemetryScreen.DECLINE_DEBICHECK
			});

			this.mandateId = event.detail.mandateId;
			this.renderMode = RENDER_MODE.DEBI_CHECK_DECLINE;
		} else if (event.detail.action === `approve`) {
			this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
				"screen": TelemetryScreen.DEBICHECK,
				"next-screen": TelemetryScreen.DEBICHECK
			});

			const screenDetails = this.horizonStore.getScreenDetails();
			screenDetails.mandateId = event.detail.mandateId;
			this.horizonStore.setScreenDetails(screenDetails);

			this.horizonStore.setReturnScreen(this.navigationContext.current.route, `debi-check`);

			this.horizonRouter.navigateToDebiCheckSuccess();
		} else if (event.detail.action === `viewInfo`) {
			this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_VIEW_MANDATE, {
				"screen": TelemetryScreen.DEBICHECK,
				"next-screen": TelemetryScreen.VIEWINFO
			});

			const returnValue = await this.savingsAccountService.debiCheckDetails(this.callerInformation.cifNumber, event.detail.mandateId, event.detail.registerId);
			
			if (returnValue.succeeded && returnValue.result) {
				this.debiCheckDetails = returnValue.result;
				this.renderMode = RENDER_MODE.DEBI_CHECK_VIEW_INFO;
			} else {
				this.horizonRouter.navigateToSystemError();
			}
		}
	}

	async _declineDebiCheckMandate(event) {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_DECLINE_MANDATE_CONFIRM, {
			"screen": TelemetryScreen.DECLINE_DEBICHECK,
			"next-screen": TelemetryScreen.DEBICHECK_OUTCOME
		});

		this.mandateId = event.detail.mandateId;

		const returnValue = await this.savingsAccountService.debiCheckDecline(this.callerInformation.cifNumber, mandateReferenceNumber, debtorAccountNumber);

		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	_closeViewMandateInfo() {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_VIEW_MANDATE_CLOSE, {
			"screen": TelemetryScreen.VIEWINFO,
			"next-screen": TelemetryScreen.DEBICHECK
		});

		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	_cancelDeclineMandate() {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_DECLINE_MANDATE_CANCEL, {
			"screen": TelemetryScreen.DECLINE_DEBICHECK,
			"next-screen": TelemetryScreen.DEBICHECK
		});

		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	_exitDebiCheck() {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_EXIT, {
			"screen": TelemetryScreen.DEBICHECK,
			"next-screen": TelemetryScreen.FAVOURITES
		});
		this._setIncidentDone();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}


	async _getClientProducts() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			status: `OPEN`
		};
		const returnValue = await this.quickTransactionService.getClientProducts(request);

		if (returnValue.succeeded) {
			return returnValue.result.savingsProducts;
		}
		return [];
	}

	_backToLandingPage() {
		
		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.NOT_STARTED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
		}
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_setIncidentDone() {
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_performReturnToScreen() {
		const returnToScreen = this.horizonStore.getReturnToScreen();
		
		if (returnToScreen && returnToScreen.optionalData) {
			this.eventAggregator.publish(`horizon-return-to-screen`, { option: returnToScreen.optionalData });
		}

		this.horizonStore.clearReturnScreen();
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderStatementsModal()}
			${this._renderDebiCheckMandates()}
			${this._renderDebiCheckDeclineMandate()}
			${this._renderDebiCheckViewMandateInfo()}

			${super._webTemplate()}
		`;
	}

	_renderDebiCheckMandates() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_PAGE ||
				this.renderMode === RENDER_MODE.DEBI_CHECK_DECLINE ||
				this.renderMode === RENDER_MODE.DEBI_CHECK_VIEW_INFO
			? html`
				<debi-check-mandates
					.debiCheckMandates = "${this.debiCheckMandates}"
					@action="${(event) => this._mandateActionClick(event)}"
					@back="${() => this._exitDebiCheck()}"
					@loading="${() => this._telemetryStartSpan(QuickTransactionEvents.DEBICHECK, TelemetryScreen.DEBICHECK)}"
					@unloading="${() => this._telemetryEndSpan(QuickTransactionEvents.DEBICHECK, TelemetryScreen.DEBICHECK)}">
				</debi-check-mandates>`
			: html``;
	}

	_renderDebiCheckViewMandateInfo() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_VIEW_INFO
			? html`
				<horizon-viewinfo-debicheck
					.debiCheckDetails=${this.debiCheckDetails}
					@viewed="${() => this._closeViewMandateInfo()}"
				></horizon-viewinfo-debicheck>`
			: html``;
	}

	_renderDebiCheckDeclineMandate() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_DECLINE 
			? html`
				<horizon-decline-debicheck-mandate
					mandateId=${this.mandateId}
					@cancel="${() => this._cancelDeclineMandate()}"
					@decline="${(event) => this._declineDebiCheckMandate(event)}">
				</horizon-decline-debicheck-mandate>`
			: html``;
	}

	_renderStatementsModal() {
		return this.renderMode === RENDER_MODE.STATEMENTS 
			? html`
				<horizon-statements-dialog
					.callerInformation="${this.callerInformation}"
					.clientProducts="${this.clientProducts}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-statements-dialog>`
			: html``;
	}
}