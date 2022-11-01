import { EventAggregator, Logger } from 'platform/core';
import { HIGH_RISK_TRANSACTIONS, LOW_RISK_TRANSACTIONS } from 'app/constants/Common';
import { View, css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { EXCEPTIONAL_ENDCALL_CONTEXTS } from 'app/constants/EndCallReasons';
import { HORIZON_NEED_STATUS } from 'app/constants/IncidentManager';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { IDCallerEvents } from 'app/constants/telemetry/events/IdentifyCaller';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { LandingPageEvents } from 'app/constants/telemetry/events/LandingPage';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { RoleManager } from 'app/shell/RoleManager';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/verifyCaller/VerifyCaller';
import 'app/components/dialogs/common/AddCallerDetails';


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
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.roleManager = RoleManager.getInstance();
		this.logger = Logger.getInstance();
		this._telemetry = HorizonTelemetry.instance;

		this.cardService = new CardService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));

		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.isBusy = false;
		this.endCallContext = `LandingPage`;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.showEndCall = false;
		this.showAddCallerDetails = false;
		this.showVerifyCallerDialog = false;
		this.displayVASToast = false;
		this.toastDetailVAS = ``;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			callerInformation: { state: true },
			incomingCallDetails: { state: true },
			verificationStatus: { state: true },

			renderMode: { state: true },
			isBusy: { state: true },
			showEndCall: { state: true },
			showAddCallerDetails: { state: true },
			showVerifyCallerDialog: { state: true },
			displayVASToast: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.verifySub = this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyClick());
		this.verifyInBranchSub = this.eventAggregator.subscribe(`horizon-verified-in-branch-click`, () => this._verifiedInBranch());
		this.assignSub = this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._assignIncidentClick());
		this.addCallerDetailsSub = this.eventAggregator.subscribe(`horizon-add-caller-details`, () => this._addCallerDetails());
		this.vasToast = this.eventAggregator.subscribe(`horizon-accepted-vas`, () => this._toastVAS());

		/**
		 * Subscribing to keep the incident details variable in line with state
		 * Use case: When performing an action on access channels/ insights, updating the incident details state
		 * is not reflected here.
		 */
		this.stateChanged = this.horizonStore.stateChangedProperties.subscribe(changes => {
			if (changes && changes.stateChanges?.callerInformation) {
				this._getCallerInformation();
			}
		});

		super.connectedCallback();
	}

	disconnectedCallback() {
		this.endCallSub.dispose();
		this.verifySub.dispose();
		this.verifyInBranchSub.dispose();
		this.assignSub.dispose();
		this.addCallerDetailsSub.dispose();
		this.vasToast.dispose();
		this.stateChanged.unsubscribe();
	
		super.disconnectedCallback();
	}

	get currentIncident() {
		return this.horizonIncidentManager.currentIncident;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_verifyClick() {
		this.showVerifyCallerDialog = true;
	}

	_verifiedInBranch() {
		this.callerInformation.verificationStatus = `verified`;
		this.callerInformation.verificationMethod = `ITA`;
		this.callerInformation.verificationAttempts.itaAttempts += 1;

		this.horizonStore.setCallerInformation(this.callerInformation);
	}

	_skipVerification(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;

		this.showVerifyCallerDialog = false;
	}

	_verificationCancelled(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.verificationStatus = this.callerInformation.verificationStatus;

		this.showVerifyCallerDialog = false;
	}

	_clientVerified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.verificationStatus = this.callerInformation.verificationStatus;

		this.showVerifyCallerDialog = false;
	}

	_assignIncidentClick() {
		this.horizonRouter.navigateToStrack(this.currentIncident);
	}

	_endCallClick() {
		this._telemetry.logEvent(LandingPageEvents.END_CALL, {});
		this.showEndCall = !this.showEndCall;
		this.endCallContext = this.horizonIncidentManager.incidentState === HORIZON_NEED_STATUS.INPROGRESS && !EXCEPTIONAL_ENDCALL_CONTEXTS.includes(this.endCallContext)
								? `QuickTransactionsInProgress`
								: this.endCallContext;
	}

	_cancelEndCallClick() {
		this.showEndCall = !this.showEndCall;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_handleChannelServiceError() {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	_toastVAS() {
		this._toggleVASToastDisplay();
		this.toastDetailVAS = `Value added services complete, you can update anytime.`;
		window.setTimeout(() => this._toggleVASToastDisplay(), 3000);
	}

	_toggleVASToastDisplay() {
		this.displayVASToast = !this.displayVASToast;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_getCallerInformation() {
		this.callerInformation = this.horizonStore.getCallerInformation();
	}

	_addCallerDetails() {
		this._telemetry.logEvent(LandingPageEvents.ADD_CALLER_DETAILS, {});
		this._telemetry.startSpan(IDCallerEvents.IDENTIFY_CALLER, {});

		this.showAddCallerDetails = !this.showAddCallerDetails;
	}

	_addCallerDetailsCancelled(event) {
		this._telemetry.endSpan(IDCallerEvents.IDENTIFY_CALLER, {});

		this.showAddCallerDetails = !this.showAddCallerDetails;
	}

	async _addCallerDetailsConfirmed(event) {
		this._telemetry.endSpan(IDCallerEvents.IDENTIFY_CALLER, {});
		
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;

		const currentIncident = this.currentIncident;

		if (!currentIncident) {
			this.logger.log(`error`, `There is no incident available against which to record then non-client details`, `_addCallerDetailsConfirmed`);
			return;
		}

		const nonClientDetails = {
			firstName: this.callerInformation.nonClientFirstName,
			surname: this.callerInformation.nonClientSurName,
			cellPhone: this.callerInformation.nonClientCellPhone
		};

		const returnValue = await this.incidentManagementService.updateIncidentNonClientDetails(currentIncident, nonClientDetails);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update non-client details on incident due to a system error`, `_addCallerDetailsConfirmed`, returnValue.correlationId);
			return;
		}

		this.horizonStore.setCallerInformation(this.callerInformation);
		this.showAddCallerDetails = !this.showAddCallerDetails;
	}

	_telemetryStartSpan(eventName, screenName) {
		this._telemetry.startSpan(eventName, {
			"screen": screenName
		});
	}

	_telemetryEndSpan(eventName, screenName) {
		this._telemetry.endSpan(eventName, {
			"screen": screenName
		});
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	async createAndClassifySubIncident(incidentCategorization, classify) {
		await super.createAndClassifySubIncident(() => this._toggleBusyFlag(), incidentCategorization, classify);
	}

	_performReturnToScreen() {
		const returnToScreen = this.horizonStore.getReturnToScreen();

		if (returnToScreen && returnToScreen.optionalData) {
			this.eventAggregator.publish(`horizon-return-to-screen`, { option: returnToScreen.optionalData });
		}

		this.horizonStore.clearReturnScreen();
	}

	_shouldDisable(need) {
		// add this verification method in the verify caller component to check if the client has done ita 
		const verificationMethod = this.callerInformation.verificationMethod;
		const verificationStatus = this.callerInformation.verificationStatus;

		return verificationStatus === `verified`
				? verificationMethod === `SQ` && HIGH_RISK_TRANSACTIONS.includes(need)
				: !LOW_RISK_TRANSACTIONS.includes(need);
	}

	_isIncidentReassigned() {
		return this.horizonIncidentManager.isReassigned;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				#VASToast {
					position: absolute;
					justify-content: center;
					align-items: center;
					top: var(--horizon-toast-top);
					left: calc(50% - 200px);
					z-index: 809;
										
					--theme-toast-min-width: 560px;
				}
			`
		];
	}

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
			${this._renderAddCallerDetailsModal()}
			${this._renderVASToast()}
		`; 
	}

	_renderVerifyNowModal() {
		return this.showVerifyCallerDialog 
			? html`
				<horizon-verify-caller
					incidentRefNumber="${this.currentIncident.toString()}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					@skip="${(e) => this._skipVerification(e)}"
					@cancel="${(e) => this._verificationCancelled(e)}"
					@verified="${(e) => this._clientVerified(e)}">
				</horizon-verify-caller>`
			: html``;
	}

	_renderEndCallSessionModal() {
		return this.showEndCall
			? html`
				<horizon-end-call-session
					.incomingCallDetails="${this.incomingCallDetails}"
					.isReassigned="${this._isIncidentReassigned()}"
					.callerInformation="${this.callerInformation}"
					endCallContext=${this.endCallContext}
					@cancel="${() => this._cancelEndCallClick()}">
				</horizon-end-call-session>`
			: html``;
	}
	
	_renderAddCallerDetailsModal() {
		return this.showAddCallerDetails ? html`
			<horizon-add-caller-details
				.callerInformation="${this.callerInformation}"
				.incomingCallDetails="${this.incomingCallDetails}"
				incidentRefNumber="${this.currentIncident.toString()}"
				@cancel="${(e) => this._addCallerDetailsCancelled(e)}"
				@confirm=${(e) => this._addCallerDetailsConfirmed(e)}>
			</horizon-add-caller-details>`
		: html``;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator data-automation-id="view-base-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

	_renderVASToast() {
		return this.displayVASToast
			? html`
				<capitec-toast
					id="VASToast"
					type="success"
					header="Successful"
					detail="${this.toastDetailVAS}"
					closable>
				</capitec-toast>`
		 	: html``;
	}
}