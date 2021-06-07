import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountBase } from 'app/views/common/SavingsAccountBase';
import { isWellFormedSouthAfricanID,isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { EndCallCauseCode } from 'app/utils/endCallCauseCode';

import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/dialogs/quickTransactions/TapToPayAgreement';
import 'app/components/dialogs/quickTransactions/DeclineDebiCheckMandate';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/quickTransactions/CardLimitsLanding';
import 'app/components/quickTransactions/SearchOtherNeed';
import 'app/components/dialogs/quickTransactions/ViewInfoDebiCheck';
import 'app/components/dialogs/quickTransactions/ProofOfAccount';
import 'app/components/quickTransactions/TapToPayLanding';
import 'app/components/dialogs/common/Feedback';


const SAVINGS_ACCOUNT_TYPE = 300;
const orgUnit = `Client Care`;

const ERROR_LIST = {
	SYSTEM_ERROR: `System error. Please try again`
};

const FEEDBACK_OPTIONS = [
	{
		key: 0,
		value: `Need fulfilled`
	},
	{
		key: 2,
		value: `Need was assigned/handed off`
	},
	{
		key: 1,
		value: `Need incomplete`
	}
];


/**
 * The Quick Transactions Favourites Landing Page View
 *
 * @export
 * @class Favourites
 * @extends {SavingsAccountBase}
 */
export class Favourites extends SavingsAccountBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// private properites
		this.verificationToastDisplayed = this.callerInformation.verificationToastDisplayed;

		this.isLoading = true;

		// private variables
		this.alertBannerMessage = ``;
		this.category = ``;
		this.need = ``;
		this.issue = ``;
		this.landingPageInfo = null;
		this.curOptionEvent = null;
		this.cards = [];
		this.selectedFeedback = [];
		this.feedbackOptions = [];

		this.endCallCauseCode = EndCallCauseCode.getInstance();

		this.returnToSub = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._performAction(e.option));
	
		this.cardService = new CardService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isLoading: { attribute: false },
			verificationToastDisplayed: { attribute: false },
			incidentDetails: { type: Object },
			incomingCallDetails: { type: Object },
			alertBannerMessage: { attribute: false },
			selectedFeedback: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.incidentRecId = this.incidentDetails.incidentRecId;
		this.feedbackOptions = FEEDBACK_OPTIONS;
		 

		// Telemetry 
		HorizonTelemetry.instance.screenLoadFulfillNeed({
			screen: TelemetryScreen.FAVOURITES
			// debiChecksOutstanding: this.pendingMandateCount
		});

		this._updateReturnToScreen();
		this._initialise();
		this._performAction = async (option) => {

			const stopCard = () => this._stopCard();
			const debiCheck = () => this._debiCheck();
			const updateCardLimits = () => this._updateCardLimits();
			const tapToPay = () => this._tapToPay();
			const statements = () => this._getStatements();
			const taxCertificates = () => this._taxCertificates();
			const proofOfAccount = () => this._proofOfAccount();
			const searchOtherNeed = () => this._searchOtherNeed();

			const actions = {
				'stop-card': stopCard,
				'debi-check': debiCheck,
				'update-card-limits': updateCardLimits,
				'tap-to-pay': tapToPay,
				'statements': statements,
				'tax-certificate': taxCertificates,
				'proof-of-account': proofOfAccount,
				'search-other-need': searchOtherNeed
			};

			if (actions[option]) {
				await super._inicidentManager_(option, () => this._toggleBusyFlag());
				this._refreshIncidentDetails();
				return actions[option]();
			}

			/**
			 * When verify now on mini profile is selected, we dont need to perform any action
			 * Returning true for such case
			 */
			return true;
		};
	}

	disconnectedCallback() {
		// Telemetry unload Favourites
		HorizonTelemetry.instance.screenUnloadNeedFulfilled({
			screen: TelemetryScreen.FAVOURITES
		});
		
		this.returnToSub.dispose();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_handleChannelServiceError() {
		this.alertBannerMessage = ERROR_LIST.SYSTEM_ERROR;
	}

	async _done(event) {
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			const incidentDetails = this.horizonStore.getIncidentDetails();
			const ivrOptionCode = incomingCallDetails.ivrOptionCode;
			const selectedOption = FEEDBACK_OPTIONS.find(item => item.key ===  event.detail);
			const strackIncidentInfo =await this._incidentStatus(this.incidentDetails.incidentRecId) || {};
			const resolution = this._getResolution(strackIncidentInfo.resolution, selectedOption);

			const closeIncidentRequest = {
				incidentRecId: incidentDetails.incidentRecId,
				reason: event.detail,
				resolution: this._formatLineBreaks(resolution),
				causeCode: strackIncidentInfo.causeCode || this.endCallCauseCode.getCauseCode(`LandingPage`, ivrOptionCode, selectedOption.value)
			};

			const returnValue =await this.incidentManagementService.closeIncident(closeIncidentRequest);
			
			if (returnValue.succeeded) {
				// Navigate to favourites landing page
				this._updateIncidentState();
				this._searchOtherNeedDone();
			}
			else {
				this.alertBannerMessage = ERROR_LIST.SYSTEM_ERROR;
			}

	}

	_getResolution(resolution, selectedOption) {
		return resolution ? `${resolution || ``}\n${selectedOption.value}` : `${selectedOption.value}`;
	}

	_formatLineBreaks(value) {
		return value.replaceAll(`\n`, `%0D%0A`);
	}

	_updateIncidentState() {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.CLOSED;
		incidentDetails.feedback = this.selectedFeedback;

		this.horizonStore.setIncidentDetails(incidentDetails);
	}
	

	async _clientVerified(event) {
		super._clientVerified(event);

		// re-initialise the page when the verification status changes
		// verificationStatus is on the this.callerInformation object
		await this._initialise();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		if (this.curOptionEvent) {
			const optionSelected = this.curOptionEvent.detail.option;
			this.curOptionEvent = null;
			await this._performAction(optionSelected);
		}
	}

	async _onFavouritesOptionClick(e) {
		// Getting hold of event to perform continue action if client decides to do verification
		this.curOptionEvent = e;

		if (e.detail.stopPropagation) {
			this._unavailableOption();
		} else {
			await this._performAction(e.detail.option);
		}
	}

	_debiCheckToMainPage() {

		/**
		 * This is supposed to happen in debicheck success screen
		 * TODO: This should be to success screen when decline or approve is ready
		 */
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_searchOtherNeedDone() {
		this._refreshIncidentDetails();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {

		if (this.callerInformation.verificationStatus !== `non-client` && isWellFormedSouthAfricanID(this.callerInformation.southAfricanIDNumber)) {
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				isCallerVerified: this.callerInformation.verificationStatus === `verified`
			};

			 const returnValue = await this.quickTransactionService.favouritesLanding(landingRequest);
			 
			 if (returnValue.succeeded) {
				this.isLoading = false;
				this.landingPageInfo = returnValue.result;
			 }
		} else {
			// minimal object for the Favourites landing page component
			this.isLoading = false;
			this.landingPageInfo = { 
				savingsAccountProductDescription: ``,
				savingsPlanProductDescription: ``,
				insureProductDescription: ``,
				creditProductDescription: ``,
				savingsAccountProductAmount: ``,
				savingsPlanProductAmount: ``,
				insureProductAmount: ``,
				creditProductAmount: ``,
				pendingMandateCount: 0 
			};
		}

		this.verificationStatus = this.callerInformation.verificationStatus;
		// Now we can update the information on the product buttons
		this._updateLeftBar();
		this._performReturnToScreen();
	}

	_updateLeftBar() {
		let subtitle = null;
		let detail = null;

		if (this.landingPageInfo) {
			subtitle = {
				savingsAccount: this.landingPageInfo.savingsAccountProductDescription,
				savingsPlan: this.landingPageInfo.savingsPlanProductDescription,
				insure: this.landingPageInfo.insureProductDescription,
				credit: this.landingPageInfo.creditProductDescription
			};

			detail = {
				savingsAccount: this.landingPageInfo.savingsAccountProductAmount,
				savingsPlan: this.landingPageInfo.savingsPlanProductAmount,
				insure: this.landingPageInfo.insureProductAmount,
				credit: this.landingPageInfo.creditProductAmount
			};
		}

		this.horizonStore.setCallerInformation(this.callerInformation);

		const state = {
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: subtitle ? subtitle : ``,
				detail: detail ? detail : ``
            },
            landingPageInfo: this.landingPageInfo
		};

		this.horizonStore.saveState(state);
	}

	_shouldToastDisplay() {
		if (this.verificationToastDisplayed) {
			return false;
		} 

		this.callerInformation.verificationToastDisplayed = true;
		this.horizonStore.setCallerInformation(this.callerInformation);

		this.verificationToastDisplayed = true;
		return true;
	}


	async _stopCard() {

		// Telemetry for selecting Stop Card button
		HorizonTelemetry.instance.selectStopCard({
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.STOP_CARD
		});

		const confirmedCaller = {
			idNumber: this.callerInformation.southAfricanIDNumber,
			incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
			voiceReferenceNumber: this.incomingCallDetails.voiceReferenceNumber,
			ivrOptionCode: `StopCard`,
			incidentReferenceNumber: this.incidentDetails.incidentReferenceNumber,
			incidentRecId: this.incidentDetails.incidentRecId,
			agentTelephoneNumber: this.incomingCallDetails.agentTelephoneNumber,
			nonClientFullName: this.callerInformation.nonClientFullName,
			nonClientCellPhone: this.callerInformation.nonClientCellPhone,
			nonClientIDNumber: this.callerInformation.nonClientIDNumber,
			nonClientRelationship: this.callerInformation.nonClientRelationship
		};

		const returnValue = await this.cardService.identifyCaller(confirmedCaller);

		if (returnValue.succeeded) {
			this.incomingCallDetails.ivrOptionCode = `StopCard`;
			this.incomingCallDetails.ivrOption.value = `StopCard`;

			const screenDetails = this.horizonStore.getScreenDetails();
			screenDetails.cards = returnValue.result && returnValue.result.cards;

			this.horizonStore.setCallerInformation(this.callerInformation);
			this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
			this.horizonStore.setScreenDetails(screenDetails);

			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	async _updateCardLimits() {

		// Telemetry select Update Card Limits
		HorizonTelemetry.instance.selectUpdateCardLimits({
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.UPDATE_CARD_LIMITS
		});

		const returnValue = await this.quickTransactionService.cardLimitsLanding(this.callerInformation.cifNumber);
			 
		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.UPDATE_CARD_LIMITS;
		}
	}

	async _tapToPay() {

		// Telemetry select Tap to Pay
		HorizonTelemetry.instance.selectTapToPay({
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.TAP_TO_PAY
		});

		const returnValue = await this.quickTransactionService.tapToPayLanding(this.callerInformation.cifNumber);
			 
		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.TAP_TO_PAY;
		}
	}

	_taxCertificates() {
		// TODO: Functionality to generate tax certificate comes here

		// Telemetry Tax Certificate
		HorizonTelemetry.instance.selectTaxCertificate({
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.TAX_CERTIFICATE
		});
	}

	async _proofOfAccount() {
		// Telemetry
		HorizonTelemetry.instance.selectProofOfAccount({
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.PROOF_OF_ACCOUNT
		});
		
		// Temporary fix to get the account number using statements CS call as the account number field 
		// for Favourites landing page(landingPageInfo) is returned as null which is required on Proof of Account screen.
		// TODO : The function _getClientProducts() and filtering should be removed once the Account Number on landingPageInfo is received Properly.
		const clientProductDetails = await this._getClientProducts();
		
		if (clientProductDetails) {
			const primarySavingsProduct = clientProductDetails.find(item => item.accountType === SAVINGS_ACCOUNT_TYPE);

			this.landingPageInfo.accountNumber = primarySavingsProduct.accountNumber;
			this.landingPageInfo.accountOpenedDate = primarySavingsProduct.accountOpenDate;
			this.renderMode = RENDER_MODE.PROOF_OF_ACCOUNT;
		}
	}
	

	_unavailableOption() {
		this.renderMode = RENDER_MODE.ALERT_MODAL;
	}

	_searchOtherNeed() {
		this.renderMode = RENDER_MODE.SEARCH_OTHER_NEED;

		// Telemetry Search Other need
		HorizonTelemetry.instance.selectSearchOtherNeed({
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.SEARCH_OTHER_NEED
		});
		this._getCategories();
	}

	async _onLaunchStrackClick(event) {
		const incidentRecId=this.incidentDetails.incidentRecId;
		const strackIncidentInfo = await this._incidentStatus(incidentRecId) || {};
		const continueUpdate = isNullorEmpty(strackIncidentInfo.category) && isNullorEmpty(strackIncidentInfo.subCategory) && isNullorEmpty(strackIncidentInfo.issue);
		if (continueUpdate) {
			await this._classifyIncident(event,incidentRecId);
		} else {
			this.logger.log(`error`, `Incident:${this.incidentDetails.incidentReferenceNumber} has been already categorized at STrack.`, `_onLaunchStrackClick`);

			this.horizonRouter.navigateToStrack(incidentRecId);
			this.renderMode = RENDER_MODE.FEEDBACK;
		}
	}

	async _getCategories() {
		const returnValue = await this.incidentManagementService.otherNeedCategories(orgUnit);

		if (returnValue.succeeded && returnValue.result) {
			this.categories = returnValue.result.categories.map(item => item.category);
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Categories`, `_getCategories`, returnValue.result);
		}
		this.requestUpdate();
	}

	async _getSubCategories(event) {
		const returnValue = await this.incidentManagementService.otherNeedSpecificNeed(orgUnit, event.detail.category);

		if (returnValue.succeeded && returnValue.result) {
			this.needs = returnValue.result.needs.map(item => item.need);
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Issue Type`, `_searchSpecificNeed`, returnValue.result);
		}
		this.requestUpdate();
	}

	

	async _getIssues(event) {
		const returnValue = await this.incidentManagementService.otherNeedIssueType(orgUnit, event.detail.category, event.detail.need);

		if (returnValue.succeeded && returnValue.result) {
			this.issues = returnValue.result.issues;
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Issue Type`, `_searchSpecificNeed`, returnValue.result);
		}
		this.requestUpdate();
	}

	async _classifyIncident(event,incidentRecId) {
		const request = {
			incidentRecId: incidentRecId,
			ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
			needAction: `SEARCH_OTHER_NEED`,
			incidentCategorization: {
				category: `${event.detail.category}`,
				need: `${event.detail.need}`,
				issue: `${event.detail.issue}`
			}
		};
		const result = await this.incidentManagementService.classifyIncident(request);

		if (result.succeeded) {
			this.horizonRouter.navigateToStrack(incidentRecId);
			this.renderMode = RENDER_MODE.FEEDBACK;
		} else {
			this.logger.log(`error`, `Unable to categorize incident on STrack`, `_onLaunchStrackClick`);
		}
	}

	async _incidentStatus(incidentRecId) {
		const returnValue = await this.incidentManagementService.incidentStatus(incidentRecId);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get incident status.`, `_incidentStatus`, returnValue.correlationId);
			return null;
		}
		return returnValue.result;
	}

	// ----
	// RENDERING
	// ---------

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			.favourites{
				width: 100%;
				height: 100%;
			}

			capitec-content-box {
				width: 100%;
				height: var(--horizon-panel-height, 888px);
			}
			`
		];
	}

	_webTemplate() {
		return html`
			${this._renderFavouritesLandingPage()}
			${this._renderUpdateCardLimits()}

			${this._renderAlertModal()}
			${this._renderTapToPay()}
			${this._renderSearchOtherNeed()}
			${this._renderProofOfAccount()}
			${this._renderFeedback()}

			${super._webTemplate()}
		`;
	}

	_renderFavouritesLandingPage() {
		switch (this.renderMode) {
			case RENDER_MODE.MAIN_PAGE:
			case RENDER_MODE.PROOF_OF_ACCOUNT:
			case RENDER_MODE.STATEMENTS:
			case RENDER_MODE.VERIFY_NOW:
			case RENDER_MODE.END_CALL:
			case RENDER_MODE.ALERT_MODAL:
				return html`
					<horizon-favourite-transactions 
						class="favourites"
						.landingPageInfo="${this.landingPageInfo}"
						.incomingCallDetails="${this.incomingCallDetails}"
						.callerInformation="${this.callerInformation}"
						.verificationStatus="${this.callerInformation.verificationStatus}"
						?displayVerificationStatusToast="${this._shouldToastDisplay()}"
						@verify-click="${() => super._verifyClick()}"
						@option-click="${(e) => this._onFavouritesOptionClick(e)}">
					</horizon-favourite-transactions>`;
			default:
				return html``;
		}
	}

	_renderAlertModal() {
		if (this.renderMode === RENDER_MODE.ALERT_MODAL) {
			return html`
				<horizon-client-not-verified
					@cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"
					@verify-now="${() => super._verifyClick()}">
				</horizon-client-not-verified>
			`;
		}
	}

	_renderUpdateCardLimits() {
		return this.renderMode === RENDER_MODE.UPDATE_CARD_LIMITS
			? html`
				<horizon-card-limits-landing
					.cards="${this.cards}"
					@back="${() => this._backToLandingPage()}">
				</horizon-card-limits-landing>`
			: html``;
	}

	_renderProofOfAccount() {
		return this.renderMode === RENDER_MODE.PROOF_OF_ACCOUNT
			? html`
				<horizon-proof-of-account
					@cancel="${() => this._backToLandingPage()}"
					.callerInformation="${this.callerInformation}"
					.landingPageInfo="${this.landingPageInfo}"
					></horizon-proof-of-account>`
			: html``;
    }

	_renderTapToPay() {
		return this.renderMode === RENDER_MODE.TAP_TO_PAY 
		? html` 
			<horizon-tap-to-pay-landing
				.cards="${this.cards}"
				@back="${() => this._backToLandingPage()}"
			></horizon-tap-to-pay-landing>
		` : html``;
	}
  
	_renderSearchOtherNeed() {
		
		return this.renderMode === RENDER_MODE.SEARCH_OTHER_NEED || this.renderMode === RENDER_MODE.FEEDBACK
			? html`
				<search-other-need
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.categories="${this.categories || []}"
					.needs="${this.needs || []}"
					.issues="${this.issues || []}"
					@launch-strack="${(event)=>this._onLaunchStrackClick(event)}"
					@get-sub-categories="${(event)=>this._getSubCategories(event)}"
					@get-issues="${(event)=>this._getIssues(event)}"
					@back="${() => this._backToLandingPage()}"
					@done="${() => this._searchOtherNeedDone()}">
				</search-other-need>`
			: html``; 
	}

	_renderFeedback() {
		return this.renderMode === RENDER_MODE.FEEDBACK
			? html`
				<horizon-feedback 
					@done="${(event) => this._done(event)}">
				</horizon-feedback>`
			: html``;
	}
}

customElements.define(`horizon-favourites`, Favourites);