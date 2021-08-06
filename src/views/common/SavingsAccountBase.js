import { NavigationContext } from 'platform/core';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { ViewBase } from 'app/views/common/ViewBase';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';
import { html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/savingsAccount/DebiCheckMandates';
import 'app/components/dialogs/common/StatementsDialog';
import 'app/components/dialogs/quickTransactions/ApproveDebiCheckMandate';

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

		this.debiCheckDetails = {};
		this.clientProducts = null;
        this.debiCheckMandates = [];
        this.incomingCallDetails = {};
        this.incidentRecId = ``;

        this.navigationContext = NavigationContext.getInstance();
        this.horizonStore = HorizonStore.getInstance();


		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));


	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
        super.connectedCallback();
        this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
        this.incidentDetails = this.horizonStore.getIncidentDetails();
        this.incidentRecId = this.incidentDetails.incidentRecId;
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
				"next-screen": TelemetryScreen.APPROVE_DEBICHECK
			});


            this.mandateInfo = event.detail.mandateInfo;

            const returnValue = await this.savingsAccountService.debiCheckDetails(this.callerInformation.cifNumber, event.detail.mandateInfo.mandateId, event.detail.mandateInfo.registerId);

            if (returnValue.succeeded && returnValue.result) {
                this.debiCheckDetails = returnValue.result;
                this.renderMode = RENDER_MODE.DEBI_CHECK_APPROVE;
            } else {
                this.horizonRouter.navigateToSystemError();
            }

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

    //TODO: remove comment when enpoint is avail
    async _approveDebiCheckMandate(event) {
        //Hasn't been promoted to dev yet...'
        //const request = {
        //    incidentRecId: this.incidentRecId,
        //    ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
        //    needAction: 'DEBI_CHECK_APPROVE',
        //    incidentCategorization: null
        //};
        //const returnValue = await this.incidentManagementService.classifyIncident(request);

        //if (!returnValue.succeeded) {
        //    this.logger.log(`error`, `Failed to classify incident. Agent may have to manually categorize at STrack.`, `_approveDebiCheckMandate`, returnValue.correlationId);
        //}



        this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
            "screen": TelemetryScreen.APPROVE_DEBICHECK,
            "next-screen": TelemetryScreen.DEBICHECK_OUTCOME
		});


		//const returnValue = await this.savingsAccountService.debiCheckDecline(this.callerInformation.cifNumber, mandateReferenceNumber, debtorAccountNumber);

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

    _cancelApproveMandate() {
        this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE_CANCECL, {
            "screen": TelemetryScreen.APPROVE_DEBICHECK,
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
			${this._renderDebiCheckApproveMandate()}
			${this._renderDebiCheckViewMandateInfo()}

			${super._webTemplate()}
		`;
	}

	_renderDebiCheckMandates() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_PAGE ||
            this.renderMode === RENDER_MODE.DEBI_CHECK_DECLINE ||
            this.renderMode === RENDER_MODE.DEBI_CHECK_APPROVE ||
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

    _renderDebiCheckApproveMandate() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_APPROVE 
			? html`
				<horizon-approve-debicheck-mandate
					.mandateInfo="${this.mandateInfo}"
					.debiCheckDetails=${this.debiCheckDetails}
					@cancel="${() => this._cancelApproveMandate()}"
					@approve="${(event) => this._approveDebiCheckMandate(event)}">
				</horizon-approve-debicheck-mandate>`
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