import { Component, css, html } from 'platform/elements';
import { ClientProfileService } from 'app/services/ClientProfileService';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { IDCallerEvents } from 'app/constants/telemetry/events/IdentifyCaller';
import { SEARCH_OPTIONS } from 'app/constants/SearchOptions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

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
	STRACK_ERROR: `Take note: A system error has occured. Please go to STrack to search for client.`,
	REQUIRED_FIELDS_EMPTY: {
		ALERT_BANNER: `All fields are required`,
		SEARCH_TEXT: `This is a Required field`,
		SEARCH_OPTION: `Choose an Identification Method`
	},
	NOT_FOUND: {
		0: {
			ALERT_BANNER: `ID/Passport number not found. This is not a valid ID/Passport number`,
			FIELD_ERROR: `ID/Passport number not found`
		},
		1: {
			ALERT_BANNER: `Foreign passport number not found. This is not a valid foreign passport number`,
			FIELD_ERROR: `Foreign passport number not found`
		},
		2: {
			ALERT_BANNER: `Account number not found. This is not a valid account number`,
			FIELD_ERROR: `Account number not found`
		},
		3: {
			ALERT_BANNER: `Reference number not found. This is not a valid reference number`,
			FIELD_ERROR: `Reference number not found`
		},
		4: {
			ALERT_BANNER: `Cellphone number not found. This is not a verified Capitec number`,
			FIELD_ERROR: `Cellphone number not found`
		}
	}
};

const REGEX_PATTERNS = {
	0: {
		PATTERN: /^(^[MDAT]([0-9]{8})|[0-9]{13})$/,
		ERR_MESSAGE: `An ID Number must be 13 digits long, a passport number must be 9 characters`,
		ALERT_BANNER: `Incorrect ID/Passport number`
	},
	1: {
		PATTERN: /^\S+$/,
		FIELD_ERROR: `Incorrect Passport number`,
		ALERT_BANNER: `Incorrect Passport number`
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

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
		this._telemetry = HorizonTelemetry.getInstance();

		RegExp();

		this.errMessage = {
			identificationMethods: ``,
			searchFieldText: ``
		};

		this.incomingCallDetails = null;
		this.renderMode = -1;

		this.clientProfileService = new ClientProfileService(() => this._toggleBusyFlag(), (ex) => this._handleAddNonClientException(ex));

		this.isBusy = false;
		this.alertBannerMessage = ``;
		this.identificationMethods = { "key": ``, "value": ``, "identificationType": `` };
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} incomingCallDetails - Incoming call information
	 * @property {Object} incidentDetails - Incident details
	 * 
	 * @readonly
	 * @static
	 * @memberof SearchClientDetailsComponent
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			incidentDetails: { type: Object },

			isBusy: { attribute: false },
			errMessage: { attribute: false },
			renderMode: { attribute: false },
			alertBannerMessage: { attribute: false },
			identificationMethods: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._telemetry.startSpan(IDCallerEvents.SEARCH_CLIENT, {
			"screen": TelemetryScreen.SEARCH_CLIENT
		});

		// We can enter this dialog in two ways
		//    1. From the Confirm Caller Dialog that the caller is not associated with the verified phone number
		//    2. From the Landing Page after receiving an unverified call

		// Setup references into the incoming model. The following sets up references to 
		// fields commmon to both incoming models
		this.voiceReferenceNumber = this.incomingCallDetails.voiceReferenceNumber;

		this.ivrOption = this.incomingCallDetails.ivrOption;
		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;

		this.incidentReferenceNumber = this.incidentDetails.incidentReferenceNumber;
		this.incidentRecId = this.incidentDetails.incidentRecId;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;

		this.searchOptions = SEARCH_OPTIONS;
		
		this.isUnverifiedNumber = true; // this.unverifiedCaller.isUnverifiedNumber;
		this.renderMode = RENDER_MODE.STOP_CARD_SEARCH;
		this.searchFieldText = null;
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(IDCallerEvents.SEARCH_CLIENT, {
			"screen": TelemetryScreen.SEARCH_CLIENT
		});
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
			this[e.currentTarget.id] = e.detail.new;
		} else {
			this[e.currentTarget.id] = e.detail.new;
		}
		this.clearErrors();
	}

	async _onSearchClick(e) {

		if (this.validateFields()) {
			console.log(`service call`);
			this._telemetry.logEvent(IDCallerEvents.SEARCH_CLIENT_SEARCH_CLICK, {
				"screen": TelemetryScreen.SEARCH_CLIENT,
				"next-screen": TelemetryScreen.CONFIRM_CALLER,
				"id-method": this.identificationMethods.value,
				"id-data": this.searchFieldText
			});
			const searchClient = {
				identificationMethod: this.identificationMethods.key,
				searchValue: this.searchFieldText
			};

			const returnValue = await this.clientProfileService.searchCaller(searchClient);
			const identifiedClient = returnValue.result;

			if (returnValue.succeeded && identifiedClient && identifiedClient.callerInformation) {
				this._raiseOnClientIdentified(identifiedClient);
			} else if (returnValue.succeeded && !(identifiedClient && identifiedClient.callerInformation)) {
				this.errMessage.searchFieldText = ERROR_MESSAGES.NOT_FOUND[this.identificationMethods.key].FIELD_ERROR;
				this.alertBannerMessage = ERROR_MESSAGES.NOT_FOUND[this.identificationMethods.key].ALERT_BANNER;
				return true;
			} else if (this.incidentReferenceNumber === null) {
				this.alertBannerMessage = ERROR_MESSAGES.STRACK_ERROR;
				} else {
				this.alertBannerMessage = ERROR_MESSAGES.SYSTEM_ERROR;
				}
		}
	}

	_onNeedChanged(e) {
		this.ivrOption.value = e.detail.new;
		this.incomingCallDetails.ivrOptionCode = e.detail.new;

		this.horizonIncidentManager.setCurrentNeed(this.incomingCallDetails.ivrOptionCode);

		if (this.ivrOption.value !== `StopCard`) {
			this.dispatchEvent(new CustomEvent(`other-need-selected`, {
				detail: {
					incomingCallDetails: this.incomingCallDetails,
					incidentDetails: this.incidentDetails
				}
			}));
		}
	}

	_onEndCall() {
		this._telemetry.logEvent(IDCallerEvents.SEARCH_CLIENT_END_CALL_CLICK, {
			"screen": TelemetryScreen.SEARCH_CLIENT,
			"next-screen": TelemetryScreen.END_CALL
		});
		
		this.renderMode = RENDER_MODE.END_CALL;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_raiseOnClientIdentified(identifiedClient) {
		const confirmedCaller = {
			cifNumber: identifiedClient.callerInformation.cifNumber,
			birthdate: identifiedClient.callerInformation.birthdate,
			languagePreference: identifiedClient.callerInformation.languagePreference,
			livesIn: identifiedClient.callerInformation.livesIn,
			name: identifiedClient.callerInformation.name,
			title: identifiedClient.callerInformation.title,
			southAfricanIDNumber: identifiedClient.callerInformation.southAfricanIDNumber,
			verifiedTelephoneNumber: identifiedClient.callerInformation.verifiedTelephoneNumber,
			firstName: identifiedClient.callerInformation.firstName,
			middleName1: identifiedClient.callerInformation.middleName1,
			middleName2: identifiedClient.callerInformation.middleName2,
			middleName3: identifiedClient.callerInformation.middleName3,
			lastName: identifiedClient.callerInformation.lastName,
			initials: identifiedClient.callerInformation.initials,
			gender: identifiedClient.callerInformation.gender,
			identifiedBy: this.identificationMethods.identificationType
		};

		this.dispatchEvent(new CustomEvent(`client-identified`, {
			detail: { 
				incomingCallDetails: this.incomingCallDetails,
				incidentDetails: this.incidentDetails,
				confirmedCaller: confirmedCaller 
			}
		}));
	};

	validateFields() {
		const isRequiredFieldsEmpty = this.isRequiredFieldsEmpty();
		if (isRequiredFieldsEmpty) {
			this.alertBannerMessage = ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY.ALERT_BANNER;
			return false;
		}

		const REGEX_PATTERN = REGEX_PATTERNS[this.identificationMethods.key].PATTERN;
		const ERR_MESSAGE = REGEX_PATTERNS[this.identificationMethods.key].ERR_MESSAGE;
		const ALERT_BANNER_ERR = REGEX_PATTERNS[this.identificationMethods.key].ALERT_BANNER;

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
		this.alertBannerMessage = ERROR_MESSAGES.SYSTEM_ERROR;
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
					line-height: 12px;
				}
				.search-fields{
					margin-top: 26px;
				}
				#identificationMethods{
					margin-top: 8px;
				}
				#searchFieldText{
					margin-top: 32px;
				}
				horizon-alert-banner{
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					
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
					<horizon-caller-dialog
						data-automation-id="stop-card-search-caller-dialog"
						.incomingCallDetails="${this.incomingCallDetails}"
						.incidentDetails="${this.incidentDetails}"
						.isNeedSelectable=${true}
						headerLabel="${HEADER_LABEL}"
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
			default:
		}
	}

	renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator data-automation-id="cards-search-caller-loading-indicator"></capitec-loading-indicator>`;
	}

	renderSearchClientDetails() {
		return html`
		<capitec-content-box class="search-box">
			<capitec-label 
				class="search-label" 
				label="Search existing client">
			</capitec-label>
			${this.renderAlertBanner()}
			<capitec-group layout="vertical" 
							gap="none" 
							halign="stretch" 
							valign="top"
							class="search-fields ${this.alertBannerMessage ? `override-margin-top` : ``}">
					<capitec-select 
						id="identificationMethods" 
						data-automation-id="stop-card-search-caller-identification-methods"
						error="${this.errMessage.identificationMethods}"
						label="Choose identification method" 
						class="id-options"
						.items="${this.searchOptions !== undefined ? this.searchOptions : [{ displayText: `ID Number` }]}"
						id-field="key" 
						display-field="value" 
						@value-changed="${(e) => this._valueChanged(e)}"
						tabindex="5"
						autofocus>
					</capitec-select>
					<capitec-text-field 
						id="searchFieldText" 
						data-automation-id="stop-card-search-caller-value"
						type="search" 
						keyboardMode="numeric" 
						label="Search"
						error="${this.errMessage.searchFieldText}" 
						focussed 
						hint="" 
						@key-input="${(e) => this._onKeyPress(e)}"
						@value-changed="${(e) => this._valueChanged(e)}" 
						value=""
						tabindex="6">
					</capitec-text-field>
			</capitec-group>
		</capitec-content-box>`;
	}

	renderAlertBanner() {
		if (!isNullorEmpty(this.alertBannerMessage)) {
			return html`
				<horizon-alert-banner 
					data-automation-id="stop-card-search-caller-alert"
					type="error" 
					label="${this.alertBannerMessage}" 
					closable
					@click="${() => this.alertBannerMessage = ``}">
				</horizon-alert-banner>
			`;
		}
		return html``;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button 
					id="id-search-button" 
					data-automation-id="stop-card-search-search-client"
					type="primary" 
					@click="${(e) => this._onSearchClick(e)}"
					label="Search Client"
					tabindex="7">
				</capitec-button>
			</capitec-group>`;
	}

	renderEndCallModal() {
		return html`
			<horizon-end-call-session 
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				endCallContext="ConfirmClient"
				@cancel="${() => this.renderMode = RENDER_MODE.STOP_CARD_SEARCH}">
			</horizon-end-call-session>`;
	}
}

window.customElements.define(`horizon-stop-card-search-caller`, StopCardSearchCaller);