import { Component, css, html } from 'platform/elements';
import { getTabIndex, isHidden, isNullorEmpty } from 'app/utils/channelServiceUtilities';

import { CallHandleService } from 'app/services/CallHandleService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import 'app/components/dialogs/common/ConfirmCallerDetails';
import 'app/components/common/HorizonSelect';

import 'app/components/common/CallerDialog';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = Object.freeze({
	STOP_CARD_SEARCH: 0,
	END_CALL: 1
});

const HEADER_LABEL = `Search Caller Details`;

const ERROR_MESSAGES = {
	SYSTEM_ERROR: `System error. Please try again later`,
	REQUIRED_FIELDS_EMPTY: {
		ALERT_BANNER: `All fields are required`,
		SEARCH_TEXT: `This is a Required field`,
		SEARCH_OPTION: `Choose an Identification Method`
	},
	NOT_FOUND: {
		0: {
			ALERT_BANNER: `The ID/Passport number not found. This is not a valid ID/Passport number`,
			FIELD_ERROR: `ID/Passport number not found`
		},
		1: {
			ALERT_BANNER: `The foreign passport number not found. This is not a valid foreign passport number`,
			FIELD_ERROR: `Foreign passport number not found`
		},
		2: {
			ALERT_BANNER: `The account number not found. This is not a valid account number`,
			FIELD_ERROR: `Account number not found`
		},
		3: {
			ALERT_BANNER: `The reference number not found. This is not a valid reference number`,
			FIELD_ERROR: `Reference number not found`
		},
		4: {
			ALERT_BANNER: `The cellphone number not found. This is not a verified Capitec number`,
			FIELD_ERROR: `Cellphone number not found`
		}
	}
};

// ToDO: Below const need to be removed, once channelService fix the issue on contract.
const REGEX_PATTERNS = {
	0: {
		PATTERN: /^[0-9]{13}$/,
		ERR_MESSAGE: `ID Number must be 13 characters long`,
		ALERT_BANNER: `Incorrect ID/Passport number`
	},
	1: {
		PATTERN: /^/,
		ERR_MESSAGE: ``
	},
	2: {
		PATTERN: /^[0-9]{10}$/,
		ERR_MESSAGE: `Account number must be 10 characters long`,
		ALERT_BANNER: `Incorrect Account number`
	},
	3: {
		PATTERN: /^[0-9]{8}$/,
		ERR_MESSAGE: `Either it is Alphanumeric or not equal to 8 digits`,
		ALERT_BANNER: `Incorrect Reference number`
	},
	4: {
		PATTERN: /^[0-9]{10}$/,
		ERR_MESSAGE: `Cellphone Number must be 10 characters long`,
		ALERT_BANNER: `Incorrect Capitec cellphone number`
	}
};


/**
 * Horizon Stop Card Search Dialog for Stop Card
 *
 * Events Raised 
 * -------------
 * other-need-selected
 * client-identified
 * 
 * @export
 * @class StopCardSearchCaller
 * @extends {Component}
 */
export class StopCardSearchCaller extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		RegExp();

		this.errMessage = {
			identificationMethods: ``,
			searchFieldText: ``
		};

		this.incomingCallDetails = null;
		this.renderMode = -1;

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._handleSearchClientException(ex));

		this.isBusy = false;
		this.alertBannerMessage = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} incomingCallDetails - Incoming call information
	 * 
	 * @readonly
	 * @static
	 * @memberof SearchClientDetailsComponent
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			isBusy: { type: Boolean },
			errMessage: { type: Object },
			renderMode: { type: Number },
			alertBannerMessage: { type: String },
			identificationMethods: { type: Object }
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
		this.voiceReferenceNumber = this.incomingCallDetails.voiceReferenceNumber;

		this.ivrOption = this.incomingCallDetails.ivrOption;
		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;

		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;

		this._loadSearchOptions();

		this.isUnverifiedNumber = true; // this.unverifiedCaller.isUnverifiedNumber;
		this.renderMode = RENDER_MODE.STOP_CARD_SEARCH;
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
				incomingTelephoneNumber: this.incomingTelephoneNumber,
				voiceReferenceNumber: this.voiceReferenceNumber,
				incidentNo: this.incidentReferenceNumber,
				agentTelephoneNumber: this.agentTelephoneNumber,
				ivrOption: this.ivrOption.value,
				identificationMethod: this.identificationMethods.value,
				searchValue: this.searchFieldText
			};

			const returnValue = await this.callHandleService.searchCaller(searchClient);
			const identifiedClient = returnValue.result;

			if (returnValue.succeeded && identifiedClient) {
				this._raiseOnClientIdentified(identifiedClient);
			} else if (returnValue.succeeded && !identifiedClient) {
				this.errMessage.searchFieldText = ERROR_MESSAGES.NOT_FOUND[this.identificationMethods.value].FIELD_ERROR;
				this.alertBannerMessage = ERROR_MESSAGES.NOT_FOUND[this.identificationMethods.value].ALERT_BANNER;
				return true;
			} else {
				this.alertBannerMessage = ERROR_MESSAGES.SYSTEM_ERROR;
			}
		}
	}

	_onNeedChanged(e) {
		this.ivrOption.value = e.detail.new;
		this.incomingCallDetails.ivrOptionCode = e.detail.new;

		if (this.ivrOption.value !== `StopCard`) {
			this.dispatchEvent(new CustomEvent(`other-need-selected`, {
				detail: {
					incomingCallDetails: this.incomingCallDetails
				}
			}));
		}
	}

	_onEndCall() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_raiseOnClientIdentified(identifiedClient) {
		this.dispatchEvent(new CustomEvent(`client-identified`, {
			detail: {
				identifiedClient: identifiedClient,
				incomingCallDetails: this.incomingCallDetails
			}
		}));
	};

	async _loadSearchOptions() {
		const clientInfo = {
			"incomingTelephoneNumber": this.incomingCallDetails.incomingTelephoneNumber,
			"voiceReferenceNumber": this.incomingCallDetails.voiceReferenceNumber,
			"ivrOptionCode": this.ivrOption.value,
			"incidentReferenceNumber": this.incidentReferenceNumber,
			"agentTelephoneNumber": this.agentTelephoneNumber
		};

		const returnValue = await this.callHandleService.searchOptions(clientInfo);
		const options = returnValue.result;

		if (returnValue.succeeded) {
			this.identificationMethodsList = options.identificationMethods;
			if (this.identificationMethodsList !== undefined) {
				this.identificationMethods = this.extractIdentificationMethods(this.identificationMethodsList);
			}
		}
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
			this.alertBannerMessage = ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY.ALERT_BANNER;
			return false;
		}

		const REGEX_PATTERN = REGEX_PATTERNS[this.identificationMethods.value].PATTERN;
		const ERR_MESSAGE = REGEX_PATTERNS[this.identificationMethods.value].ERR_MESSAGE;
		const ALERT_BANNER_ERR = REGEX_PATTERNS[this.identificationMethods.value].ALERT_BANNER;

		if (!RegExp(REGEX_PATTERN, `g`).test(this.searchFieldText)) {
			this.errMessage.searchFieldText = ERR_MESSAGE;
			this.alertBannerMessage = ALERT_BANNER_ERR;
			return false;
		}

		return true;
	}

	isRequiredFieldsEmpty() {

		this.errMessage.searchFieldText = isNullorEmpty(this.searchFieldText) ? ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY.SEARCH_TEXT : ``;
		this.errMessage.identificationMethods = isNullorEmpty(this.identificationMethods.value) ? ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY.SEARCH_OPTION : ``;

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
		this.horizonRouter.navigateToSystemError();
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
					height: inherit;
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
			case RENDER_MODE.STOP_CARD_SEARCH:
				return html`
					<horizon-caller-dialog .incomingCallDetails="${this.incomingCallDetails}" .headerLabel="${HEADER_LABEL}"
						@on-end-call="${() => this._onEndCall()}" @on-need-changed="${(event) => this._onNeedChanged(event)}">
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
			<capitec-group layout="vertical" gap="none" halign="stretch" valign="top"
				class="search-fields ${this.alertBannerMessage ? `override-margin-top` : ``}">
				<div class="search-field-row">
					<capitec-select id="identificationMethods" error="${this.errMessage.identificationMethods}"
						label="Choose identification method" class="id-options"
						.items="${this.identificationMethods !== undefined ? this.identificationMethods.possibleValues : [{ displayText: `ID Number` }]}"
						id-field="key" display-field="displayText" @value-changed="${(e) => this._valueChanged(e)}"
						tabindex="${getTabIndex(this.identificationMethods)}" ?hidden=${isHidden(this.identificationMethods)}>
					</capitec-select>
					</capitec-select>
				</div>
				<div class="search-field-row">
					<capitec-text-field id="searchFieldText" type="search" keyboardMode="numeric" label="Search"
						error="${this.errMessage.searchFieldText}" focussed hint="" @key-input="${(e) => this._onKeyPress(e)}"
						@value-changed="${(e) => this._valueChanged(e)}" value="">
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
				<capitec-button id="id-search-button" type="primary" @click="${(e) => this._onSearchClick(e)}"
					label="Search Client">
				</capitec-button>
			</capitec-group>`;
	}

	renderEndCallModal() {
		return html`
			<horizon-end-call-session @cancel="${() => this.renderMode = RENDER_MODE.STOP_CARD_SEARCH}"
				.incomingCallDetails="${this.incomingCallDetails}">
			</horizon-end-call-session>`;
	}
}

window.customElements.define(`horizon-stop-card-search-caller`, StopCardSearchCaller);