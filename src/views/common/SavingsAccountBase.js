import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
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

		this.horizonRouter = HorizonRouter.getInstance();

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
		// Telemetry for Alert Checks
		HorizonTelemetry.instance.debiCheckAlert({
			screen: TelemetryScreen.FAVOURITES
		});

		// Telemetry
		HorizonTelemetry.instance.selectDebiCheck({
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: null /** TelemetryScreen.DEBI_CHECK */,
			selectedOption: this.selectedOption
		});

		const returnValue = await this.savingsAccountService.debiCheckMandates(this.callerInformation.cifNumber);
		
		if (returnValue.succeeded) {
			// eslint-disable-next-line no-extra-parens
			this.debiCheckMandates = (returnValue.result && returnValue.result.mandateSummaryList) || [];
			this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
		} else {
			// Todo: Handle error scenario
		}
	}

	async _getStatements() {

		// Telemetry Statements
		HorizonTelemetry.instance.selectStatements({
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
			this.mandateId = event.detail.mandateId;
			this.renderMode = RENDER_MODE.DEBI_CHECK_DECLINE;
		} else if (event.detail.action === `approve`) {

			// Telemetry for accepting DebiCheck
			HorizonTelemetry.instance.debiCheckAlertAccept({
				screen: TelemetryScreen.FAVOURITES
			});

			const state = {
				returnTo: {
					route: this.navigationContext.current.route.path,
					mode: ``
				}
			};
			this.horizonStore.saveState(state);
			this.horizonRouter.navigateToDebiCheckSuccess();
		} else if (event.detail.action === `viewInfo`) {
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
		// Telemetry for dismissing DebiCheck
		HorizonTelemetry.instance.debiCheckAlertDismiss({
			screen: TelemetryScreen.FAVOURITES
		});

		this.mandateId = event.detail.mandateId;

		const returnValue = await this.savingsAccountService.debiCheckDecline(this.callerInformation.cifNumber, mandateReferenceNumber, debtorAccountNumber);

		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
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
					.debiCheckMandates="${this.debiCheckMandates}"
					@action="${(event) => this._mandateActionClick(event)}"
					@back="${() => this._setIncidentDone()}">
				</debi-check-mandates>`
			: html``;
	}

	_renderDebiCheckViewMandateInfo() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_VIEW_INFO
			? html`
				<horizon-viewinfo-debicheck
					.debiCheckDetails=${this.debiCheckDetails}
					@viewed="${() => this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE}"
				></horizon-viewinfo-debicheck>`
			: html``;
	}

	_renderDebiCheckDeclineMandate() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_DECLINE 
			? html`
				<horizon-decline-debicheck-mandate
					mandateId=${this.mandateId}
					@cancel="${() => this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE}"
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