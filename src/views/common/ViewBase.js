import { AVAILABLE_FEATURES_BY_ROLE, HIGH_RISK_TRANSACTIONS, LOW_RISK_TRANSACTIONS } from 'app/constants/Common';
import { EventAggregator, Logger } from 'platform/core';
import { View, css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { ClientProfileService } from 'app/services/ClientProfileService';
import { EXCEPTIONAL_ENDCALL_CONTEXTS } from 'app/constants/EndCallReasons';
/* Removed during incident management refactor
import { HORIZON_NEED_STATUS } from 'app/constants/IncidentManager';
*/
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { IDCallerEvents } from 'app/constants/telemetry/events/IdentifyCaller';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { LandingPageEvents } from 'app/constants/telemetry/events/LandingPage';
import { PayShapService } from 'app/services/PayShapService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { RoleManager } from 'app/shell/RoleManager';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/verifyCaller/VerifyCaller';
import 'app/components/dialogs/common/AddCallerDetails';

const TOOLTIP_CAPITEC_CONNECT = `Your role does not allow you to make use of this functionality.`;
const TOOLTIP_NEED_ITA_VERIFICATION = `Digitally Verify client (ITA) to use this feature.`;
const TOOLTIP_NEED_SQ_VERIFICATION = `Verify client to use this feature`;

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
		this.clientProfileService = new ClientProfileService(() => this._toggleBusyFlag(), () => true);
		this.payShapService = new PayShapService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));

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

		// incidentState check removed during incident management refactor
		this.endCallContext = /* this.horizonIncidentManager.incidentState === HORIZON_NEED_STATUS.INPROGRESS && */ !EXCEPTIONAL_ENDCALL_CONTEXTS.includes(this.endCallContext)
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
		this.toastDetailVAS = `Consent management update complete. You can change the settings anytime.`;
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
		await this.horizonIncidentManager.createAndClassifySubIncident(() => this._toggleBusyFlag(), incidentCategorization, classify);
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
			? verificationMethod === `SQ` && HIGH_RISK_TRANSACTIONS[this.roleManager.orgUnit]?.includes(need)
			: !LOW_RISK_TRANSACTIONS.includes(need);
	}

	_setIncidentNotstarted() {
		/* Removed during incident management refactor
	
		if (this.horizonIncidentManager.incidentState !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.NOT_STARTED;
		}
	*/
	}

	_isIncidentReassigned() {
		return this.horizonIncidentManager.isReassigned;
	}

	_currentIncidentRef() {
		return this.currentIncident ? this.currentIncident.toString() : ``;
	}

	async _updatePreferences(language, cif) {
		const returnValue = await this.clientProfileService.updatePreferredLanguage(language, cif);

		/* Removed during inicident management refactor
		this.horizonIncidentManager.incidentState = returnValue.succeeded 
														? super.HORIZON_NEED_STATUS.COMPLETED 
														: super.HORIZON_NEED_STATUS.FAILED;
		*/

		return returnValue.succeeded;
	}

	// Show tooltip when a particular option is disabled
	_showTooltip(need) {
		const availableFeatures = AVAILABLE_FEATURES_BY_ROLE[this.roleManager.orgUnit];
		const availableByVerification = !this._shouldDisable(need);

		if (availableFeatures?.length > 0) {
			return !(availableFeatures.includes(need) && availableByVerification);
		}
		return !availableByVerification;
	}

	_shouldDisableByRole(need) {
		const disableByVerification = this._shouldDisable(need);
		const disableByRole = this._showTooltip(need);

		return disableByVerification || disableByRole;
	}

	_getTooltipMessage(need) {
		const isHighRiskTransaction = HIGH_RISK_TRANSACTIONS[this.roleManager.orgUnit]?.includes(need);
		const byRole = {
			'Capitec Connect': TOOLTIP_CAPITEC_CONNECT

		};

		const byVerificationStatus = {
			'non-client': ``, // For a non-client we do not show any option buttons on the screen, can use this space in future to show tooltip
			'unverified': isHighRiskTransaction ? TOOLTIP_NEED_ITA_VERIFICATION : TOOLTIP_NEED_SQ_VERIFICATION // Agent is given access to perform only Low risk transaction when unverified
		};

		const byVerificationType = {
			'SQ': TOOLTIP_NEED_ITA_VERIFICATION, // Agent is restricted to perform High risk transactions 
			'ITA': `` // Agent is given access to all the available needs on ITA verification 
		};

		const message = byRole[this.roleManager.orgUnit] ||
			(this.callerInformation.verificationStatus === `verified`
				? byVerificationType[this.callerInformation.verificationMethod]
				: byVerificationStatus[this.callerInformation.verificationStatus]);

		return message;
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
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					incidentRefNumber="${this._currentIncidentRef()}"
					?incidentCreated="${this.horizonIncidentManager.isAnIncidentCreated}"
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
				incidentRefNumber="${this._currentIncidentRef()}"
				?incidentCreated="${this.horizonIncidentManager.isAnIncidentCreated}"

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