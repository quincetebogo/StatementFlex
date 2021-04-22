import { css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { NavigationContext } from 'platform/core';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { ViewBase } from 'app/views/common/ViewBase';
import { isWellFormedSouthAfricanID } from 'app/utils/channelServiceUtilities';

import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/dialogs/common/StatementsDialog';
import 'app/components/savingsAccount/DebiCheckMandates';
import 'app/components/dialogs//quickTransactions/DeclineDebiCheckMandate';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/quickTransactions/CardLimitsLanding';
import 'app/components/quickTransactions/SearchOtherNeed';
import 'app/components/dialogs/quickTransactions/ViewInfoDebiCheck';
import 'app/components/dialogs/quickTransactions/ProofOfAccount';
import 'app/components/quickTransactions/TapToPayLanding';

const SAVINGS_ACCOUNT_TYPE = 300;

/**
 * The Quick Transactions Favourites Landing Page View
 *
 * @export
 * @class Favourites
 * @extends {ViewBase}
 */
export class Favourites extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.horizonRouter = HorizonRouter.getInstance();
		this.navigationContext = NavigationContext.getInstance();

		// Recover information from state
		const state = this.horizonStore.recoverState();
    		
		// When returning from the success screen, check which page we should display
		if (state.returnTo && state.returnTo.mode === `mandate`) {
			this._debiCheck();
		} else {
			this.renderMode = RENDER_MODE.MAIN_PAGE;
		}
		
		// private properites
		this.verificationToastDisplayed = this.callerInformation.verificationToastDisplayed;

		this.isLoading = true;

		// private variables
		this.landingPageInfo = null;
		this.debiCheckMandates = {};
		this.curOptionEvent = null;
		this.cards = [];
		this.debiCheckDetails = {};
		this.clientProducts = [];

		// Subscribe to shell events
		this.returnToSub = this.eventAggregator.subscribe(`horizon-returnTo-screen`, (option) => this._performAction(option)());
		
		this.cardService = new CardService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.savingsAccountService = new SavingsAccountService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
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

		this._initialise();
		this._performAction = (option) => {

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
				super._inicidentManager_(option, () => this._toggleBusyFlag());
				return actions[option];
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


	async _clientVerified(event) {
		super._clientVerified(event);

		// re-initialise the page when the verification status changes
		// verificationStatus is on the this.callerInformation object
		await this._initialise();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		if (this.curOptionEvent) {
			const optionSelected = this.curOptionEvent.detail.option;
			this.curOptionEvent = null;
			this._performAction(optionSelected)();
		}
	}

	_mainPage() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
    }

	async _onFavouritesOptionClick(e) {
		// Getting hold of event to perform continue action if client decides to do verification
		this.curOptionEvent = e;

		if (e.detail.stopPropagation) {
			this._unavailableOption();
		} else {
			await this._performAction(e.detail.option)();
		}
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

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
		this.verificationStatus = this.callerInformation.verificationStatus;
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

		// Now we can update the information on the product buttons
		this._updateLeftBar();
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

	async _stopCard() {
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

			this.horizonStore.setCallerInformation(this.callerInformation);
			this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);

			this.horizonStore.saveState({
				clientProfileDetails: returnValue.result
			});


			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	async _debiCheck() {
		const returnValue = await this.savingsAccountService.debiCheckMandates(this.callerInformation.cifNumber);

		if (returnValue.succeeded) {
			// eslint-disable-next-line no-extra-parens
			this.debiCheckMandates = (returnValue.result && returnValue.result.mandateSummaryList) || [];
			this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
		} else {
			// Todo: Handle error scenario
		}
	}

	async _updateCardLimits() {
		const returnValue = await this.quickTransactionService.cardLimitsLanding(this.callerInformation.cifNumber);
			 
		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.UPDATE_CARD_LIMITS;
		}
	}

	async _tapToPay() {
		const returnValue = await this.quickTransactionService.tapToPayLanding(this.callerInformation.cifNumber);
			 
		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.TAP_TO_PAY;
		}
	}

	async _getStatements() {
		const clientProductDetails = await this._getClientProducts();

		if (clientProductDetails) {
			this.clientProducts = clientProductDetails;
			this.renderMode = RENDER_MODE.STATEMENTS;
		}
	}

	_taxCertificates() {
		// TODO: Functionality to generate tax certificate comes here
	}

	async _proofOfAccount() {
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
		// TODO: Navigation to search other needs page 
		this.renderMode = RENDER_MODE.SEARCH_OTHER_NEED;
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

			${this._renderDebiCheckMandates()}
			${this._renderDebiCheckDeclineMandate()}
			${this._renderDebiCheckViewMandateInfo()}

			${this._renderAlertModal()}
            ${this._renderTapToPay()}
			${this._renderSearchOtherNeed()}      
            ${this._renderProofOfAccount()}
			${this._renderStatementsModal()}

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
					.verificationStatus="${this.verificationStatus}"
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

	// Renders the main debi-check mandates display
	_renderDebiCheckMandates() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_PAGE ||
			this.renderMode === RENDER_MODE.DEBI_CHECK_DECLINE ||
			this.renderMode === RENDER_MODE.DEBI_CHECK_VIEW_INFO
			? html`
				<debi-check-mandates
					.debiCheckMandates="${this.debiCheckMandates}"
					@action="${(event) => this._mandateActionClick(event)}"
					@back="${() => this._debiCheckToMainPage()}">
				</debi-check-mandates>`
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

	_renderDebiCheckViewMandateInfo() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_VIEW_INFO
		? html`
			<horizon-viewinfo-debicheck
				.debiCheckDetails=${this.debiCheckDetails}
				@viewed="${() => this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE}"
			></horizon-viewinfo-debicheck>`
		: html``;
	}

	_renderUpdateCardLimits() {
		return this.renderMode === RENDER_MODE.UPDATE_CARD_LIMITS
			? html`
				<horizon-card-limits-landing
					.cards="${this.cards}"
					@back="${() => this._mainPage()}">
				</horizon-card-limits-landing>`
			: html``;
	}

	_renderProofOfAccount() {
		return this.renderMode === RENDER_MODE.PROOF_OF_ACCOUNT
			? html`
				<horizon-proof-of-account
					@cancel="${() => this._mainPage()}"
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
				@back="${() => this._mainPage()}"
			></horizon-tap-to-pay-landing>
		` : html``;
	}
  
	_renderSearchOtherNeed() {
		return this.renderMode === RENDER_MODE.SEARCH_OTHER_NEED
			? html`
				<search-other-need
					.incidentDetails="${this.incidentDetails}"
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</search-other-need>`
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

customElements.define(`horizon-favourites`, Favourites);