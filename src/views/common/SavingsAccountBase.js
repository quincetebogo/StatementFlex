import { HIGH_RISK_TRANSACTIONS, LOW_RISK_TRANSACTIONS } from 'app/constants/Common';
import { HorizonStore } from 'app/store/HorizonStore';
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
        this.landingPageInfo = {};
        this.callerInformation = {};
        this.clientDetails = {};
        this.mandateId = ``;
        this.registerId = ``;
        this.accountNumber = null;
        this.isPending = ``;

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
        const state = this.horizonStore.recoverState();
        this.callerInformation = this.horizonStore.getCallerInformation();
        this.landingPageInfo = state.landingPageInfo;
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
			// landingPageInfo returns null sometimes - go get account number from ClientProducts
			await this._getClientProducts();

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

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.mandateId = event.detail.mandateInfo.mandateName;
		
		const declineAction = (evt, scrDetails) => this._declineMandate(evt, scrDetails);
		const approveAction = (evt, scrDetails) => this._approveMandate(evt, scrDetails);
		const viewAction = (evt) => this._viewMandate(evt);

		const mandateActions = {
			'debi-check-approve': approveAction,
			'debi-check-decline': declineAction,
			'debi-check-viewInfo': viewAction
		};
		const action = `debi-check-${event.detail.action}`;

		if (mandateActions[action]) {
			await super._inicidentManager_(action, () => this._toggleBusyFlag());
			this._refreshIncidentDetails();

			this.debiCheckDetails = await this._getMandateDetails();
			return mandateActions[action](event, screenDetails);
		}
	}

	_declineMandate(event, screenDetails) {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_DECLINE_MANDATE, {
			"screen": TelemetryScreen.DEBICHECK,
			"next-screen": TelemetryScreen.DECLINE_DEBICHECK
		});

		this.mandateInfo = event.detail.mandateInfo;
		screenDetails.isApproved = false;
		this.horizonStore.setScreenDetails(screenDetails);

            this.renderMode = RENDER_MODE.DEBI_CHECK_DECLINE;
            return;

        }

	async _approveMandate(event, screenDetails) {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
			"screen": TelemetryScreen.DEBICHECK,
			"next-screen": TelemetryScreen.APPROVE_DEBICHECK
		});

		this.mandateInfo = event.detail.mandateInfo;
		screenDetails.isApproved = true;
		this.horizonStore.setScreenDetails(screenDetails);

		await this._getAgreement();
		this.renderMode = RENDER_MODE.DEBI_CHECK_APPROVE;
        return;
	}

	_viewMandate(event) {
		
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_VIEW_MANDATE, {
			"screen": TelemetryScreen.DEBICHECK,
			"next-screen": TelemetryScreen.VIEWINFO
		});

		this.isPending = event.detail.isPending;
		this.renderMode = RENDER_MODE.DEBI_CHECK_VIEW_INFO;
	}

	async _declineDebiCheckMandate(event) {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_DECLINE_MANDATE_CONFIRM, {
			"screen": TelemetryScreen.DECLINE_DEBICHECK,
			"next-screen": TelemetryScreen.DEBICHECK_OUTCOME
		});

		this.mandateId = event.detail.mandateId;

		await this._authenticateMandate(false);
		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	async _approveDebiCheckMandate(event) {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
			"screen": TelemetryScreen.APPROVE_DEBICHECK,
			"next-screen": TelemetryScreen.DEBICHECK_OUTCOME
		});

		await this._confirmAgreement(true);
		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	_closeViewMandateInfo() {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_VIEW_MANDATE_CLOSE, {
			"screen": TelemetryScreen.VIEWINFO,
			"next-screen": TelemetryScreen.DEBICHECK
		});

		this._setIncidentDone();
		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	async _cancelMandateAction(eventName, currScreen) {
		this._telemetry.logEvent(eventName, {
			"screen": currScreen,
			"next-screen": TelemetryScreen.DEBICHECK
		});

		await super._inicidentManager_(`debi-check-viewInfo`, () => this._toggleBusyFlag());
		this._refreshIncidentDetails();

		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	_exitDebiCheck() {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_EXIT, {
			"screen": TelemetryScreen.DEBICHECK,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.renderMode = RENDER_MODE.MAIN_PAGE;
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

			const primarySavings = returnValue.result.savingsProducts.filter(item => item.accountType === 300);
			this.accountNumber = primarySavings[0].accountNumber;
		

			return returnValue.result.savingsProducts;
		}
		return [];
	}

	async _confirmAgreement(accepted) {
		const name = this.callerInformation.name.split(` `);
		const agreementInfo = {
			cifNumber: this.callerInformation.cifNumber,
			mandateRef: this.debiCheckDetails.mandateReference,
			title: name[0],
			firstName: this.callerInformation.firstName,
			surname: this.callerInformation.lastName,
			middleName: this.clientDetails.middleName,
			identificationNumber: this.callerInformation.southAfricanIDNumber,
			residentialAddress: this.clientDetails.residentialAddress,
			postalAddress: this.clientDetails.postalAddress,
			cellphone: this.incomingCallDetails.incomingTelephoneNumber,
			homeNumber: this.clientDetails.homeNumber,
			workNumber: this.clientDetails.workNumber,
			savingsAccountNumber: this.accountNumber,
			cardNumber: this.clientDetails.cardNumber,
			contractReference: this.debiCheckDetails.contractReference,
			instalmentAmount: this.mandateInfo.amount,
			frequency: this.mandateInfo.collectionDate.frequency.toString(),
			firstCollectionDate: this.debiCheckDetails.firstCollectionDate,
			collectionDayFrequencyWording: this.mandateInfo.collectionDayFrequency,
			ultimateDebtorName: this.clientDetails.accountShortName,
			debitAccountName: this.clientDetails.accountShortName,
			accountConfirmation: accepted,
			instalmentConfirmation: accepted,
			permissionToDebit: accepted,
			termsAndConditionsConfirmation: accepted
		};

		const returnValue = await this.savingsAccountService.debiCheckConfirmAgreement(agreementInfo);
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `debi-check-viewInfo`);

		if (returnValue.succeeded) {
			this.horizonRouter.navigateToDebiCheckSuccess();
		} else {
			this.horizonRouter.navigateToDebiCheckFailed();
		}
	}

	async _authenticateMandate(accepted) {
		const returnValue = await this.savingsAccountService.debiCheckAuthenticate(this.callerInformation.cifNumber, this.debiCheckDetails.mandateReference, this.debiCheckDetails.debtorAccountNumber, accepted);
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `debi-check-viewInfo`);
		
		if (returnValue.succeeded) {
			this.horizonRouter.navigateToDebiCheckSuccess();
		} else {
			this.horizonRouter.navigateToDebiCheckFailed();
		}
	}

	async _getAgreement() {
		const name = this.callerInformation.name.split(` `);

		const agreementRequest = {
			title: name[0],
			firstName: this.callerInformation.firstName,
			surname: this.callerInformation.lastName,
			identificationNumber: this.callerInformation.southAfricanIDNumber,
			savingsAccountNumber: this.accountNumber,
			registerId: this.mandateInfo.registerId,
			mandateId: this.mandateInfo.mandateId,
			mandateReferenceNumber: this.debiCheckDetails.mandateReference,
			cifNumber: this.callerInformation.cifNumber
		};

		const returnValue = await this.savingsAccountService.debiCheckAgreement(agreementRequest);

		if (returnValue.succeeded && returnValue.result) {
			this.clientDetails = returnValue.result;
		} else {
			this.horizonRouter.navigateToDebiCheckFailed();
		}
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

	async _unloadDebiCheck(eventName, screenName) {

		/**
		 * Debi check mandates are viewed but view/approve/decline is not selected.
		 * Navigating away will still be considered as viewed and classified.
		 */
		 await super.classifyIncident(() => this._toggleBusyFlag());

		 this._setIncidentDone();
		 this._telemetryEndSpan(eventName, screenName);
	}

	_shouldDisable(need) {
		const verificationMethod = this.callerInformation.verificationMethod;
		
		// TODO: Enable the logic once ITA accept/reject code is done
		// return verificationMethod === (`unverified` && !LOW_RISK_TRANSACTIONS.includes(need)) || (verificationMethod === `XDS` && HIGH_RISK_TRANSACTIONS.includes(need));

		return false;
	}

	async _getMandateDetails() {
		const returnValue = await this.savingsAccountService.debiCheckDetails(this.callerInformation.cifNumber, event.detail.mandateInfo.mandateId, event.detail.mandateInfo.registerId);
		
		if (!returnValue.succeeded || !returnValue.result) {
			this.horizonRouter.navigateToSystemError();
			return false;
		}
		return returnValue.result;
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
					@unloading="${() => this._unloadDebiCheck(QuickTransactionEvents.DEBICHECK, TelemetryScreen.DEBICHECK)}">
				</debi-check-mandates>`
			: html``;
	}

	_renderDebiCheckViewMandateInfo() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_VIEW_INFO
			? html`
				<horizon-viewinfo-debicheck
					.debiCheckDetails=${this.debiCheckDetails}
					.isPending=${this.isPending}
					@viewed="${() => this._closeViewMandateInfo()}"
				></horizon-viewinfo-debicheck>`
			: html``;
	}

	_renderDebiCheckDeclineMandate() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_DECLINE
			? html`
				<horizon-decline-debicheck-mandate
					mandateId=${this.mandateInfo.mandateId}
					@cancel="${() => this._cancelMandateAction(QuickTransactionEvents.DEBICHECK_DECLINE_MANDATE_CANCEL, TelemetryScreen.DECLINE_DEBICHECK)}"
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
					.clientDetails=${this.clientDetails}
					.accountNumber = "${this.accountNumber}"
					@cancel="${() => this._cancelMandateAction(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE_CANCECL, TelemetryScreen.APPROVE_DEBICHECK)}"
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