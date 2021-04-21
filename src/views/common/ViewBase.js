import { View, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';
import { RENDER_MODE } from 'app/views/common/RenderModes';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyCaller';
import 'app/components/savingsAccount/DebiCheckMandates';
import 'app/components/dialogs/common/StatementsDialog';


/**
 * A Base class for view components to collect common functionality used across most views
 * 
 * This base class will contain the following common code
 * 
 *    - support for ending a call: added
 *    - support for verifying a caller: added
 *    - support for assigning/handing off a call
 *    - restoration of common state information: added
 *    - incident management
 *    - toggling isBusy support: added
 *    - possibly support for updating the left menu bar
 *    - possibly support for updating access channels
 *    - possibly support for updating client insights
 *
 * @export
 * @class ViewBase
 * @extends {View}
 */
export class ViewBase extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();

		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.isReassigned = this.horizonStore.getIsIncidentReassigned();

		this.isBusy = false;
		this.endCallContext = `LandingPage`;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// --------------
	// PROPERTIES
	// --------------
	static get properties() {
		return {
			callerInformation: { attribute: false },
		    incomingCallDetails: { attribute: false },
			verificationStatus: { attribute: false },

			renderMode: { attribute: false },
			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.verifySub = this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyClick());
		this.assignSub = this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._assignIncidentClick());


		super.connectedCallback();
	}

	disconnectedCallback() {
		this.endCallSub.dispose();
		this.verifySub.dispose();
		this.assignSub.dispose();
		
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_verifyClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	_skipVerification(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_verificationCancelled(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.verificationStatus = this.callerInformation.verificationStatus;

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_clientVerified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.verificationStatus = this.callerInformation.verificationStatus;
	}

	_assignIncidentClick() {
        this.horizonRouter.navigateToStrack(this.incidentDetails.incidentRecId);
	}

	_endCallClick() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_cancelEndCallClick() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}


	async _debiCheck() {
		const returnValue = await this.savingsAccountService.debiCheckMandates(this.callerInformation.cifNumber);

		if (returnValue.succeeded) {
			this.debiCheckMandates = (returnValue.result && returnValue.result.mandateSummaryList) || [];
			this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
		} 
	}

	async _getStatements() {
		const clientProductDetails = await this._getClientProducts();
		if (clientProductDetails) {
			this.clientProducts = clientProductDetails;
			this.renderMode = RENDER_MODE.STATEMENTS;
		}
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

	async _mandateActionClick (event) {
		if (event.detail.action === `decline`) {
			this.mandateId = event.detail.mandateId;
			this.renderMode = RENDER_MODE.DEBI_CHECK_DECLINE;
		} else if (event.detail.action === `approve`) {
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
		this.mandateId = event.detail.mandateId;

		const returnValue = await this.savingsAccountService.debiCheckDecline(this.callerInformation.cifNumber, mandateReferenceNumber, debtorAccountNumber);

		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderVerifyNowModal()}
			${this._renderEndCallSessionModal()}
			${this._renderLoadingIndicator()}
			`; 
	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`
				<horizon-verify-caller
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					@skip="${(e) => this._skipVerification(e)}"
					@cancel="${(e) => this._verificationCancelled(e)}"
					@verified="${(e) => this._clientVerified(e)}">
				</horizon-verify-caller>`;
		}
		return html``;
	}

	_renderEndCallSessionModal() {
		return this.renderMode === RENDER_MODE.END_CALL
			? html`
				<horizon-end-call-session
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.isReassigned="${this.isReassigned}"
					endCallContext=${this.endCallContext}
					@cancel="${() => this._cancelEndCallClick()}">
				</horizon-end-call-session>`
			: html``;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}

	_renderDebiCheckMandates() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_PAGE||
		this.renderMode === RENDER_MODE.DEBI_CHECK_DECLINE ||
		this.renderMode === RENDER_MODE.DEBI_CHECK_VIEW_INFO
			? html`
				<debi-check-mandates
					.debiCheckMandates="${this.debiCheckMandates}"
					@action="${(event) => this._mandateActionClick(event)}"
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"></debi-check-mandates>
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
				@cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
			</horizon-statements-dialog>`
		: html``;
	}
}