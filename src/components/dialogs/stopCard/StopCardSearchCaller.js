/*
 *       Horizon Stop Card Search Dialog for Stop Card
 *
 */
import { Component, css, html } from 'platform/elements';
import { getTabIndex, isHidden, isNullorEmpty } from 'app/utils/channelServiceUtilities';

import { CallHandleService } from 'app/services/CallHandleService';
import { CardService } from 'app/services/CardService';
import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

import 'app/components/dialogs/common/ConfirmCallerDetails';
import 'app/components/common/HorizonSelect';
import 'app/components/dialogs/common/SearchCaller'; // TODO: Get rid of direct access to Insure Search caller (actually generic search caller)

import 'app/components/common/HorizonCallerDialog';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	SEARCH_CALLER: 0,
	END_CALL: 1,
	INSURE_SEARCH_CALLER: 2
};

const HEADER_LABEL = `Search Caller Details`;

const ERROR_MESSAGES = {
	REQUIRED_FIELDS_EMPTY: `All fields are required`,
	0: `Incorrect ID/Passport number`,
	1: `Incorrect foreign passport number`,
	2: `Incorrect account number`,
	3: `Incorrect reference number`,
	4: `Incorrect Capitec cellphone number`
};

// ToDO: Below const need to be removed, once channelService fix the issue on contract.
const REGEX_PATTERNS = {
	0: {
		PATTERN: /^[0-9]{13}$/,
		ERR_MESSAGE: `ID Number must be 13 characters long`
	},
	1: {
		PATTERN: /^/,
		ERR_MESSAGE: ``
	},
	2: {
		PATTERN: /^[0-9]{10}$/,
		ERR_MESSAGE: `Account number must be 10 characters long`
	},
	3: {
		PATTERN: /^[0-9]{8}$/,
		ERR_MESSAGE: `Either it is Alphanumeric or not equal to 8 digits`
	},
	4: {
		PATTERN: /^[0-9]{10}$/,
		ERR_MESSAGE: `Cellphone Number must be 10 characters long`
	}
};

export class StopCardSearchCaller extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();

		RegExp();

		this.errMessage = {
			identificationMethods: ``,
			searchFieldText: ``
		};

		this.unverifiedCaller = null;
		this.incomingCallDetails = null;
		this.renderMode = -1;

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), null);
		this.cardService = new CardService(() => this._toggleBusyFlag(), null);

		this.isBusy = false;
		this.alertBannerMessage = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} unverifiedCaller  - Incoming caller without a verified telephone number
	 * @property {Object} incomingCallDetails - Incoming call information
	 * 
	 * @readonly
	 * @static
	 * @memberof SearchClientDetailsComponent
	 */
	static get properties() {
		return {
			unverifiedCaller: { type: Object },
			incomingCallDetails: { type: Object },
			isBusy: { type: Boolean },
			errMessage: { type: Object },
			renderMode: { type: Number },
			alertBannerMessage: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// We can enter this dialog in two ways
		//    1. From the Confirm Caller Dialog that the caller is not associated with the verified phone number
		//    2. From the Landing Page after receiving an unverified call

		// Setup references into the incoming model. The following sets up references to 
		// fields commmon to both incoming models
		this.voiceReferenceNumber = this.unverifiedCaller.voiceReferenceNumber;

		this.ivrOption = this.unverifiedCaller.ivrOption;
		this.incomingTelephoneNumber = this.unverifiedCaller.incomingTelephoneNumber;

		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;

		this.incomingCallDetails.ivrOption = this.unverifiedCaller.ivrOption;

		if (this.callHandleService.isConfirmedCaller(this.unverifiedCaller)) {
			// We are coming from the confirmed user dialog
			this._loadSearchOptions();

			this.isUnverifiedNumber = this.unverifiedCaller.isUnverifiedNumber;
		} else {
			// We are coming from the landing page/Desktop Agent event.
			this.identificationMethodsList = this.unverifiedCaller.identificationMethods;
			this.identificationMethods = this.extractIdentificationMethods(this.identificationMethodsList);
		}
		this.renderMode = RENDER_MODE.SEARCH_CALLER;
		this.searchFieldText = null;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onKeyPress(e) {
		if (e.detail.new !== ``) {
			this.errMessage[e.currentTarget.id] = ``;
			this.alertBannerMessage = ``;
		}
	}

	_valueChanged(e) {
		if (typeof e.detail.new === `object`) {
			this[e.currentTarget.id].value = e.detail.new.key;
		} else {
			this[e.currentTarget.id] = e.detail.new;
		}
		this.clearErrors();
	}

	async _onSearchClick(e) {
		if (this.validateFields()) {
			console.log(`service call`);

			const searchClient = {
				incomingTelephoneNumber: this.unverifiedCaller.incomingTelephoneNumber.value,
				voiceReferenceNumber: this.unverifiedCaller.voiceReferenceNumber.value,
				incidentNo: this.incidentReferenceNumber,
				agentTelephoneNumber: this.agentTelephoneNumber,
				ivrOption: this.ivrOption.value,
				identificationMethod: this.identificationMethods.value,
				searchValue: this.searchFieldText
			};

			const returnValue = await this.cardService.searchCaller(searchClient, (ex) => this._handleSearchClientException(ex));
			const identifiedClient = returnValue.result;

			if (returnValue.succeeded && identifiedClient) {
				this._raiseOnClientIdentified(identifiedClient);
			} else {
				// TODO: check error handling for when the error is a service call failure
				this.alertBannerMessage = ERROR_MESSAGES[this.identificationMethods.value];
				return true;
			}
		}
	}

	_onNeedChanged(e) {
		this.ivrOption.value = e.detail.new;
		this.incomingCallDetails.ivrOptionCode = e.detail.new;

		if (this.ivrOption.value === `Insure`) {
			this.renderMode = RENDER_MODE.INSURE_SEARCH_CALLER;
		}
	}

	_onNonClientCapturedInsure(event) {
		this.dispatchEvent(new CustomEvent(`non-client-captured`, {
			detail: event.detail
		}));
	}

	_onClientIdentfiedInsure(data) {
		this._raiseOnClientIdentified(data.detail.identifiedClient);
	}

	_onEndCall() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_raiseOnClientIdentified(identifiedClient) {
		this.dispatchEvent(new CustomEvent(`on-client-identified`, {
			detail: {
				identifiedClient: identifiedClient,
				incomingCallDetails: this.incomingCallDetails
			}
		}));
	};

	_loadSearchOptions() {
		const clientInfo = {
			"incomingTelephoneNumber": this.incomingTelephoneNumber.value,
			"voiceReferenceNumber": this.voiceReferenceNumber.value,
			"ivrOptionCode": this.ivrOption.value,
			"incidentReferenceNumber": this.incidentReferenceNumber,
			"agentTelephoneNumber": this.agentTelephoneNumber
		};

		this.cardService.searchOptions(clientInfo, null)
			.then((returnValue) => {
				const options = returnValue.result;

				if (returnValue.succeeded) {
					this.identificationMethodsList = options.identificationMethods;
					if (this.identificationMethodsList !== undefined) {
						this.identificationMethods = this.extractIdentificationMethods(this.identificationMethodsList);
					}
				} else {
					// TODO: Handle error when searchOptions call failes
				}
			});
	}

	extractIdentificationMethods(identificationMethods) {

		identificationMethods.possibleValues = identificationMethods.possibleValues.map(identificationMethod => {

			Object.assign(identificationMethod, identificationMethod.value);
			delete identificationMethod.value;
			return identificationMethod;
		});
		return identificationMethods;
	}

	validateFields() {
		const isRequiredFieldsEmpty = this.isRequiredFieldsEmpty();
		if (isRequiredFieldsEmpty) {
			this.alertBannerMessage = ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY;
			return false;
		}

		const REGEX_PATTERN = REGEX_PATTERNS[this.identificationMethods.value].PATTERN;
		const ERR_MESSAGE = REGEX_PATTERNS[this.identificationMethods.value].ERR_MESSAGE;

		if (!RegExp(REGEX_PATTERN, `g`).test(this.searchFieldText)) {
			this.errMessage.searchFieldText = ERR_MESSAGE;
			this.alertBannerMessage = ERROR_MESSAGES[this.identificationMethods.value];
			return false;
		}

		return true;
	}

	isRequiredFieldsEmpty() {

		this.errMessage.searchFieldText = isNullorEmpty(this.searchFieldText) ? `This is a Required field` : ``;
		this.errMessage.identificationMethods = isNullorEmpty(this.identificationMethods.value) ? `Choose an Identification Method` : ``;

		return this.errMessage.identificationMethods || this.errMessage.searchFieldText;
	}

	clearErrors() {
		this.errMessage.searchFieldText = ``;
		this.errMessage.identificationMethods = ``;
		this.alertBannerMessage = ``;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_handleSearchClientException(exception) {
		const event = {
			from: `UI-CS`,
			status: `error`,
			message: ``
		};

		if (exception instanceof TypeError) {
			event.message = exception.message;
		} else if (exception instanceof HttpStatusError) {
			if (exception.status === 412 || exception.status === 400) {
				this.alertBannerMessage = ERROR_MESSAGES[this.identificationMethods.value];
				return true;
			}
			event.message = `${exception.status}: ${exception.message}`;
		} else {
			event.message = `UNEXPECTED ERROR: ${exception.message}`;
		}

		this.eventAggregator.publish(`horizon-status-bar-update`, event);
		return true;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

				.main{
					width: 690px;
					height: 485px;
					border-radius: 4px;
				}

				.search-box{
					height: 310px;
					padding: 21px 17px 0px 16px;
				}
				.search-label{
					height: 24px;
					width: 170px;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					color: #3E4547;
					line-height: 24px;
					margin: 0px;
				}
				.id-options{
					text-align: justify;
					line-height: 12px
				}
				.search-fields{
					margin-top: 26px;
				}
				.search-field-row{
					height: 72px;
					margin-top: 8px;
				}
				capitec-alert-banner{
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					
					margin: 20px 0px 0px 0px;
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
					
				}
				.override-margin-top{
					margin-top: 16px;
				}

				#id-search-button {
					--theme-button-padding-top: 12px;
				}`
		];
	}

	render() {
		switch (this.renderMode) {
			case RENDER_MODE.SEARCH_CALLER:
				return html`
					<horizon-caller-dialog 
							.incomingCallDetails="${this.incomingCallDetails}" 
							.headerLabel="${HEADER_LABEL}"
							@on-end-call="${() => this._onEndCall()}" 
							@on-need-changed="${(event) => this._onNeedChanged(event)}">
						<div slot="body" class="main">
							${this.renderSearchClientDetails()}
							${this.renderLoadingIndicator()}
						</div>
						<div slot="footer">
							${this.renderFooter()}
						</div>
					</horizon-caller-dialog>`;
			case RENDER_MODE.END_CALL:
				return html`${this.renderEndCallModal()}`;
			case RENDER_MODE.INSURE_SEARCH_CALLER:
				return html`${this.renderInsureSearchModal()}`;
			default:
		}
	}

	renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	renderSearchClientDetails() {
		return html`
		<capitec-content-box class="search-box">
			<capitec-label class="search-label" label="Search existing client"></capitec-label>
			${this.renderAlertBanner()}
			<capitec-group 
					layout="vertical" 
					gap="none" 
					halign="stretch" 
					valign="top"
					class="search-fields ${this.alertBannerMessage ? `override-margin-top` : ``}">
				<div class="search-field-row">
					<capitec-select 
						id="identificationMethods" 
						error="${this.errMessage.identificationMethods}"
						label="Choose identification method" 
						class="id-options"
						.items="${this.identificationMethods !== undefined ? this.identificationMethods.possibleValues : [{ displayText: `ID Number` }]}"
						@value-changed="${(e) => this._valueChanged(e)}" 
						tabindex="${getTabIndex(this.identificationMethods)}"
						?hidden=${isHidden(this.identificationMethods)} 
						id-field="key" 
						display-field="displayText">
					</capitec-select>
				</div>
				<div class="search-field-row">
					<capitec-text-field 
						id="searchFieldText" 
						type="search" 
						keyboardMode="numeric" 
						label="Search"
						error="${this.errMessage.searchFieldText}" 
						focussed 
						hint="" 
						@key-input="${(e) => this._onKeyPress(e)}"
						@value-changed="${(e) => this._valueChanged(e)}" 
						value="">
					</capitec-text-field>
				</div>
			</capitec-group>
		</capitec-content-box>`;
	}

	renderAlertBanner() {

		if (!isNullorEmpty(this.alertBannerMessage)) {
			return html`
				<capitec-alert-banner type="error" label="${this.alertBannerMessage}" closable></capitec-alert-banner>
			`;
		}
		return html``;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button 
					id="id-search-button" 
					type="primary" 
					@click="${(e) => this._onSearchClick(e)}"
					label="Search Client">
				</capitec-button>
			</capitec-group>`;
	}

	renderEndCallModal() {
		return html`
			<horizon-end-call-session 
				@on-cancel="${() => this.renderMode = RENDER_MODE.SEARCH_CALLER}"
				.incomingCallDetails="${this.incomingCallDetails}">
			</horizon-end-call-session>`;
	}

	renderInsureSearchModal() {
		return html`
			<horizon-search-caller 
				.unverifiedCaller="${this.unverifiedCaller}"
				.incomingCallDetails="${this.incomingCallDetails}"
				@on-non-client-captured="${event => this._onNonClientCapturedInsure(event)}"
				@on-client-identified="${(data) => this._onClientIdentfiedInsure(data)}">
			</horizon-search-caller>`;
	}
}

window.customElements.define(`horizon-stop-card-search-caller`, StopCardSearchCaller);