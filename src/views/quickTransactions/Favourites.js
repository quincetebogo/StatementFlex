import { css, html } from 'platform/elements';
import { isNullorEmpty, isWellFormedSouthAfricanID } from 'app/utils/channelServiceUtilities';
import { EndCallCauseCode } from 'app/utils/endCallCauseCode';
import { FEEDBACK_OPTIONS } from 'app/constants/SearchOtherNeed';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountBase } from 'app/views/common/SavingsAccountBase';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';
import { tapToPayMixin } from 'app/views/tapToPay/TapToPayMixin';

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

		this.agreementResult = ``;
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
		this._telemetry = HorizonTelemetry.instance;

		this.returnToSub = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._performAction(e.option));

		Object.assign(Favourites.prototype, tapToPayMixin);
	}

    // --------------
    // PROPERTIES
    // --------------

    static get properties() {
        return {
            isLoading: { attribute: false },
            verificationToastDisplayed: { attribute: false }
		};
	}

    // -------------------
    // LIFECYCLE OVERRIDES
    // -------------------

    connectedCallback() {
        super.connectedCallback();
		this.incidentRecId = this.incidentDetails.incidentRecId;
		this.feedbackOptions = FEEDBACK_OPTIONS;
		 

		this._telemetry.startSpan(QuickTransactionEvents.FULFILL_NEED, {
			"screen": TelemetryScreen.FAVOURITES
		});

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
		this._telemetry.logEvent(QuickTransactionEvents.SEARCH_OTHER_NEED_DONE, {
			"launch-strack-feedback": event.detail.selectedFeedback
		});

		const incidentDetails = this.horizonStore.getIncidentDetails();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		const selectedOption = FEEDBACK_OPTIONS.find(item => item.key === event.detail);
		const options = {
			clientNeed: null,
			endCallReason: selectedOption,
			causeCodeByContext: this.endCallCauseCode.getCauseCode(`LandingPage`, incomingCallDetails.ivrOptionCode, selectedOption.value)
		};

		const isSuccess = await super.closeIncident(options, () => this._toggleBusyFlag());
		
		if (isSuccess) {
			// Navigate to favourites landing page
			incidentDetails.needStatus = super.HORIZON_NEED_STATUS.CLOSED;
			incidentDetails.feedback = selectedOption.key;

			this.horizonStore.setIncidentDetails(incidentDetails);
			this._searchOtherNeedDone();
		} else {
			this.alertBannerMessage = ERROR_LIST.SYSTEM_ERROR;
		}
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

	async _getPermanentLimits(request) {
		const returnValue = await this.quickTransactionService.getPermanentLimits(request, () => true);

		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Unable to retrieve permanent card limits`, `_getPermanentLimits`, returnValue.correlationId);
		this.horizonRouter.navigateToSystemError();
		return null;
	}

	async _updatePermanentLimits(updateRequest) {
		updateRequest.cardLimits.permanentCashAmountLimit *= 100;
		updateRequest.cardLimits.permanentPurchaseAmountLimit *= 100;
		updateRequest.cardLimits.permanentCnpAmountLimit *= 100;
		updateRequest.cardLimits.tempCashAmountLimit *= 100;
		updateRequest.cardLimits.tempPurchaseAmountLimit *= 100;
		updateRequest.cardLimits.tempCnpAmountLimit *= 100;

		const returnValue = await this.quickTransactionService.updatePermanentLimits(updateRequest, () => true);

		if (returnValue.succeeded) {
			return true;
		}

		this.logger.log(`error`, `Unable to update permanent card limits`, `_updatePermanentLimits`, returnValue.correlationId);
		this.horizonRouter.navigateToSystemError();

		return null;
	}

	async _getTemporaryLimits(request) {
		const returnValue = await this.quickTransactionService.getTemporaryLimits(request, () => true);

		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Unable to get temporary card limits`, `_getTemporaryLimits`, returnValue.correlationId);
		this.horizonRouter.navigateToSystemError();

		return null;
	}

	async _updateTemporaryLimits(updateRequest) {
		updateRequest.cardLimits.permanentCashAmountLimit *= 100;
		updateRequest.cardLimits.permanentPurchaseAmountLimit *= 100;
		updateRequest.cardLimits.permanentCnpAmountLimit *= 100;
		updateRequest.cardLimits.tempCashAmountLimit *= 100;
		updateRequest.cardLimits.tempPurchaseAmountLimit *= 100;
		updateRequest.cardLimits.tempCnpAmountLimit *= 100;

		const returnValue = await this.quickTransactionService.updateTemporaryLimits(updateRequest, () => true);

		if (returnValue.succeeded) {
			return true;
		}

		this.logger.log(`error`, `Unable to update temporary card limits`, `_updateTemporaryLimits`, returnValue.correlationId);

		return null;
	}

	async _getCardLimitsAgreement(agreementRequest) {
		agreementRequest.cardDetails.permanentCashAmountLimit *= 100;
		agreementRequest.cardDetails.permanentPurchaseAmountLimit *= 100;
		agreementRequest.cardDetails.permanentCnpAmountLimit *= 100;
		agreementRequest.cardDetails.tempCashAmountLimit *= 100;
		agreementRequest.cardDetails.tempPurchaseAmountLimit *= 100;
		agreementRequest.cardDetails.tempCnpAmountLimit *= 100;

		const returnValue = await this.quickTransactionService.getCardLimitsAgreement(agreementRequest, () => this._createIncidentOnError());
		
		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Unable to get card limits agreement`, `_getCardLimitsAgreement`, returnValue.correlationId);

		return null;
	}

	_updateLimitsResult(eventData) {
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.limitDetails = eventData.detail.limitDetails;
		this.horizonStore.setScreenDetails(screenDetails);
		
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `update-card-limits`);

		if (eventData.detail.success) {
			this.horizonRouter.navigateToCardLimitUpdateSuccess();
		} else {
			this.logger.log(`error`, eventData.detail.failureReason);
			this.horizonRouter.navigateToCardLimitUpdateFailed();
		}
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
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_STOP_CARD, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.STOP_CARD
		});

		const returnValue = await this.cardService.identifyCaller(this.callerInformation, this.incomingCallDetails, this.incidentDetails);

		if (returnValue.succeeded) {

			const screenDetails = this.horizonStore.getScreenDetails();
			screenDetails.cards = returnValue.result && returnValue.result.cards;
			this.horizonStore.setScreenDetails(screenDetails);

			this.horizonStore.setCallerInformation(this.callerInformation);
			this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);

			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	async _updateCardLimits() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_UPDATE_CARD_LIMITS, {
			"screen": TelemetryScreen.FAVOURITES,
            "next-screen": TelemetryScreen.CARD_LIMITS_LANDING
		});

		const returnValue = await this.quickTransactionService.cardLimitsLanding(this.callerInformation.cifNumber, this.incidentDetails.incidentRecId);
			 
		if (returnValue.succeeded) {
			this.cards = returnValue.result.cards;

			this.cards.forEach(card => {
				card.cardLimits.permanentCashAmountLimit /= 100;
				card.cardLimits.maxPermanentCashAmountLimit /= 100;
				card.cardLimits.permanentPurchaseAmountLimit /= 100;
				card.cardLimits.maxPermanentPurchaseAmountLimit /= 100;
				card.cardLimits.permanentCnpAmountLimit /= 100;
				card.cardLimits.maxPermanentCnpAmountLimit /= 100;
				card.cardLimits.tempCashAmountLimit /= 100;
				card.cardLimits.maxTemporaryCashAmountLimit /= 100;
				card.cardLimits.tempPurchaseAmountLimit /= 100;
				card.cardLimits.maxTemporaryPurchaseAmountLimit /= 100;
				card.cardLimits.tempCnpAmountLimit /= 100;
				card.cardLimits.maxTemporaryCnpAmountLimit /= 100;

				if (card.linkedCardLimits) {
					card.linkedCardLimits.permanentCashAmountLimit /= 100;
					card.linkedCardLimits.maxPermanentCashAmountLimit /= 100;
					card.linkedCardLimits.permanentPurchaseAmountLimit /= 100;
					card.linkedCardLimits.maxPermanentPurchaseAmountLimit /= 100;
					card.linkedCardLimits.permanentCnpAmountLimit /= 100;
					card.linkedCardLimits.maxPermanentCnpAmountLimit /= 100;
					card.linkedCardLimits.tempCashAmountLimit /= 100;
					card.linkedCardLimits.maxTemporaryCashAmountLimit /= 100;
					card.linkedCardLimits.tempPurchaseAmountLimit /= 100;
					card.linkedCardLimits.maxTemporaryPurchaseAmountLimit /= 100;
					card.linkedCardLimits.tempCnpAmountLimit /= 100;
					card.linkedCardLimits.maxTemporaryCnpAmountLimit /= 100;
				} 
			});

			this.renderMode = RENDER_MODE.UPDATE_CARD_LIMITS;
		}
	}

    _taxCertificates() {
        // TODO: Functionality to generate tax certificate comes here

		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_TAX_CERTIFICATE, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE
		});
	}

	async _proofOfAccount() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_PROOF_OF_ACCOUNT, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.PROOF_OF_ACCOUNT
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
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_SEARCH_OTHER_NEED, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.SEARCH_OTHER_NEED
		});

		this.renderMode = RENDER_MODE.SEARCH_OTHER_NEED;
		this._getCategories();
		
	}

	async _onLaunchStrackClick(event) {
		this._telemetry.logEvent(QuickTransactionEvents.SEARCH_OTHER_NEED_LAUNCH_STRACK, {
			"screen": TelemetryScreen.SEARCH_OTHER_NEED,
			"next-screen": TelemetryScreen.FAVOURITES,
			"client-need": event.detail.category,
			"specific-need": event.detail.need,
			"issue-type": event.detail.issue
		});

		const incidentCategorization = {
			category: `${event.detail.category}`,
			need: `${event.detail.need}`,
			issue: `${event.detail.issue}`
		};

		await super.createAndClassifySubsIncident(incidentCategorization);

		this.horizonRouter.navigateToStrack(this.incidentDetails.incidentRecId);
		this.renderMode = RENDER_MODE.FEEDBACK;
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

	async _createIncidentOnError() {
		await super.createAndClassifySubsIncident();
		return true;
	}

	// ---------
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
					.getPermanentLimits="${request => this._getPermanentLimits(request)}"
					.getTemporaryLimits="${request => this._getTemporaryLimits(request)}"
					.cifNumber="${this.callerInformation.cifNumber}"
					.voiceRecordingReference=${this.incomingCallDetails.voiceReferenceNumber}
					.getCardLimitsAgreement ="${renderRequest => this._getCardLimitsAgreement(renderRequest)}"

					.updatePermanentLimits ="${renderRequest => this._updatePermanentLimits(renderRequest)}"
					.updateTemporaryLimits ="${renderRequest => this._updateTemporaryLimits(renderRequest)}"
					@back="${() => this._backToLandingPage()}"
					@result=${eventData => this._updateLimitsResult(eventData)}>
				</horizon-card-limits-landing>`
            : html``;
    }

    _renderProofOfAccount() {
        return this.renderMode === RENDER_MODE.PROOF_OF_ACCOUNT
            ? html`
				<horizon-proof-of-account
					.callerInformation="${this.callerInformation}"
					.landingPageInfo="${this.landingPageInfo}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-proof-of-account>`
			: html``;
    }

	_renderSearchOtherNeed() {
		return this.renderMode === RENDER_MODE.SEARCH_OTHER_NEED || this.renderMode === RENDER_MODE.FEEDBACK
			? html`
				<horizon-search-other-need
					.categories="${this.categories || []}"
					.needs="${this.needs || []}"
					.issues="${this.issues || []}"
					@loading="${() => this._telemetryStartSpan(QuickTransactionEvents.SEARCH_OTHER_NEED, TelemetryScreen.SEARCH_OTHER_NEED)}"
					@unloading="${() => this._telemetryEndSpan(QuickTransactionEvents.SEARCH_OTHER_NEED, TelemetryScreen.SEARCH_OTHER_NEED)}"
					@launch-strack="${(event) => this._onLaunchStrackClick(event)}"
					@get-sub-categories="${(event) => this._getSubCategories(event)}"
					@get-issues="${(event) => this._getIssues(event)}"
					@back="${() => this._backToLandingPage()}"
					@done="${() => this._searchOtherNeedDone()}">
				</horizon-search-other-need>`
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