import { HIGH_RISK_TRANSACTIONS, LOW_RISK_TRANSACTIONS } from 'app/constants/Common';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { ACCOUNT_STATUS } from 'app/constants/Credit';
import { CreditService } from 'app/services/CreditService';
import { HorizonStore } from 'app/store/HorizonStore';
import { NavigationContext } from 'platform/core';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { capitalizeString } from 'app/utils/channelServiceUtilities';
import { html } from 'platform/elements';

import 'app/components/savingsAccount/DebiCheckMandates';
import 'app/components/dialogs/quickTransactions/ApproveDebiCheckMandate';
import 'app/dialogs/statements/Statements';

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
		this.isPending = false;

		this.navigationContext = NavigationContext.getInstance();
		this.horizonStore = HorizonStore.getInstance();


		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.creditService = new CreditService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
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

		const returnValue = await this.savingsAccountService.debiCheckMandates(this.callerInformation.cifNumber, () => true);

		if (returnValue.succeeded) {
			// landingPageInfo returns null sometimes - go get account number from ClientProducts
			await this._getClientProducts(() => this._debiCheckServiceError());

			// eslint-disable-next-line no-extra-parens
			this.debiCheckMandates = (returnValue.result && returnValue.result.mandateSummaryList) || [];

			this.endCallContext = `DebiCheck`;
			this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
		} else {
			this.logger.log(`error`, `Unable to load debi check mandates`, `_debiCheck`, returnValue.correlationId);
			this._debiCheckServiceError();
		}
	}

	async _getStatements() {
		const clientSavingsProductDetails = await this._getClientProducts();
		const clientCreditProductDetails = await this._getClientCreditProducts();

		const clientProductDetails = [...clientSavingsProductDetails, ...clientCreditProductDetails?.accessFacilitySummaryList, ...clientCreditProductDetails?.creditCardSummaryList, ...clientCreditProductDetails?.loanAccountSummaryList];

		if (clientProductDetails) {
			this.clientProducts = clientProductDetails.map(item => {
									const productInfo = ACCOUNT_INTCAT_ENUM[item.accountType || item.productTypeCode][item.interestCategory] || 
														ACCOUNT_INTCAT_ENUM[item.accountType || item.productTypeCode];

									return {
										'accountNumber': item.accountNumber,
										'accountName': capitalizeString(item.accountName || item.productTypeDescription),
										'accountType': item.accountType || item.productTypeCode,
										'accountOpenDate': item.accountOpenDate || item.openDate,
										'name': productInfo.name,
										'type': productInfo.type,
										'category': productInfo.category,
										'subCategory': productInfo.subCategory,
										'icon': productInfo.icon,
										'customIcon': productInfo.customIcon,
										'order': productInfo.order,
										'choosePeriod': productInfo.choosePeriod
									};
								}).sort((x, y) => x.order - y.order);
			this.renderMode = RENDER_MODE.STATEMENTS;
		}
	}

	async _mandateActionClick (event) {

		const screenDetails = this.horizonStore.getScreenDetails();

		this.mandateInfo = event.detail.mandateInfo;
		this.mandateId = this.mandateInfo.mandateId;
		this.registerId = this.mandateInfo.registerId;
		
		const declineAction = (scrDetails) => this._declineMandate(scrDetails);
		const approveAction = (scrDetails) => this._approveMandate(scrDetails);
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

	_declineMandate(screenDetails) {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_DECLINE_MANDATE, {
			"screen": TelemetryScreen.DEBICHECK,
			"next-screen": TelemetryScreen.DECLINE_DEBICHECK
		});

		screenDetails.isApproved = false;
		screenDetails.mandateId = this.mandateInfo.mandateName;
		this.horizonStore.setScreenDetails(screenDetails);

		this.renderMode = RENDER_MODE.DEBI_CHECK_DECLINE;
	}

	async _approveMandate(screenDetails) {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
			"screen": TelemetryScreen.DEBICHECK,
			"next-screen": TelemetryScreen.APPROVE_DEBICHECK
		});

		screenDetails.isApproved = true;
		screenDetails.mandateId = this.mandateInfo.mandateName;
		this.horizonStore.setScreenDetails(screenDetails);

		await this._getAgreement();
		this.renderMode = RENDER_MODE.DEBI_CHECK_APPROVE;
	}

	async _viewMandate(event) {
		
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_VIEW_MANDATE, {
			"screen": TelemetryScreen.DEBICHECK,
			"next-screen": TelemetryScreen.VIEWINFO
		});
		await super.createAndClassifySubsIncident();

		this.isPending = event.detail.isPending;
		this.renderMode = RENDER_MODE.DEBI_CHECK_VIEW_INFO;
	}

	async _declineDebiCheckMandate(event) {
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_DECLINE_MANDATE_CONFIRM, {
			"screen": TelemetryScreen.DECLINE_DEBICHECK,
			"next-screen": TelemetryScreen.DEBICHECK_OUTCOME
		});

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

	async _getClientProducts(customErrHandler = null) {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			status: `OPEN`
		};
		const returnValue = await this.quickTransactionService.getClientProducts(request, customErrHandler);

		if (returnValue.succeeded) {

			const primarySavings = returnValue.result.savingsProducts.filter(item => item.accountType === 300);
			this.accountNumber = primarySavings[0].accountNumber;
		

			return returnValue.result.savingsProducts;
		}
		return [];
	}

	async _getClientCreditProducts(customErrHandler = null) {

		const returnValue = await this.creditService.creditOverview(this.callerInformation.cifNumber, ACCOUNT_STATUS.ALL, customErrHandler);

		if (returnValue.succeeded) {
			return returnValue.result;
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
			middleName: this.clientDetails.middleName.trim(),
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
			termsAndConditionsConfirmation: accepted,
			documentId: this.clientDetails.data.documentId
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
		const returnValue = await this.savingsAccountService.debiCheckAuthenticate(
			this.callerInformation.cifNumber,
			this.callerInformation.title,
			this.callerInformation.lastName,
			this.debiCheckDetails,
			this.mandateInfo,
			accepted
		);
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
			registerId: this.registerId,
			mandateId: this.mandateId,
			mandateReferenceNumber: this.debiCheckDetails.mandateReference,
			cifNumber: this.callerInformation.cifNumber
		};

		const returnValue = await this.savingsAccountService.debiCheckAgreement(agreementRequest, () => true);

		if (returnValue.succeeded && returnValue.result) {
			this.clientDetails = returnValue.result;
		} else {
			this.logger.log(`error`, `Unable to get debi check agreement`, `_getAgreement`, returnValue.correlationId);
			this._debiCheckServiceError();
		}
	}

	_backToLandingPage() {
		this._setIncidentNotstarted();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_setIncidentNotstarted() {
		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.NOT_STARTED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
		}
	}

	_setIncidentDone() {
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _unloadDebiCheck(eventName, screenName) {

		/**
		 * Debi check mandates are viewed but view/approve/decline is not selected.
		 * Navigating away will still be considered as viewed and classified.
		 */
		 await super.classifyIncident(() => this._toggleBusyFlag());

		 this.endCallContext = `LandingPage`;
		 this._setIncidentDone();
		 this._telemetryEndSpan(eventName, screenName);
	}

	_shouldDisable(need) {
		// add this verification method in the verify caller component to check if the client has done ita 
		const verificationMethod = this.callerInformation.verificationMethod;
		const verificationStatus = this.callerInformation.verificationStatus;

		return verificationStatus === `verified`
				? verificationMethod === `XDS` && HIGH_RISK_TRANSACTIONS.includes(need)
				: !LOW_RISK_TRANSACTIONS.includes(need);
	}

	async _getMandateDetails() {
		const returnValue = await this.savingsAccountService.debiCheckDetails(this.callerInformation.cifNumber, this.mandateId, this.registerId, () => true);
		
		if (!returnValue.succeeded || !returnValue.result) {
			this.logger.log(`error`, `Unable to load debi check mandate details`, `_getMandateDetails`, returnValue.correlationId);
			this._debiCheckServiceError();
		}
		return returnValue.result;
	}

	_debiCheckServiceError() {
		this.horizonRouter.navigateToDebiCheckServiceError();
		return true;
	}

	/**
	 * Function updates the need based on account selected in statements
	 * so as to classify incident accordingly
	 * 
	 * @param {object} event - event raised by statements dialog
	 * @returns {void}
	 */
	async _statementsAccConfirmed(event) {
		const need = `statements-${event.detail.subCategory || event.detail.account}`;

		await super._inicidentManager_(need, () => this._toggleBusyFlag());
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

	_webTemplate(type = ``) {
		return html`
			${this._renderStatementsModal(type)}
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
					?isPending=${this.isPending}
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
					@cancel="${() => this._cancelMandateAction(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE_CANCECL, TelemetryScreen.APPROVE_DEBICHECK)}"
					@approve="${(event) => this._approveDebiCheckMandate(event)}">
				</horizon-approve-debicheck-mandate>`
			: html``;
	}

	_renderStatementsModal(type) {
		return this.renderMode === RENDER_MODE.STATEMENTS
			? html`
				<horizon-statements
					.cifNumber="${this.callerInformation.cifNumber}"
					.title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					.clientProducts="${this.clientProducts}"
					type="${type}"
					@cancel="${() => this._cancelStatements()}"
					@account-selected="${(event) => this._statementsAccConfirmed(event)}">
				</horizon-statements>`
			: html``;
	}
}