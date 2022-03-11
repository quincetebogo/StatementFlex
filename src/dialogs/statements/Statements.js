import { Component, html } from 'platform/elements';
import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { Logger, NavigationContext } from 'platform/core';
import { base64ToBlobUrl, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'app/components/dialogs/common/StatementsDialog';

/**
 * 
 * 
 * @export
 * @class Statements
 * @extends {Component}
 */
export class Statements extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();
		
		this.logger = Logger.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this._telemetry = HorizonTelemetry.instance;
		this.taxCertificateDetails = null;

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), () => true);
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {string} cifNumber The client's CIF number
	 * @property {Array} clientProducts Contains list of products that the client has.
	 * @property {string} type Contains the type of account
	 * @readonly
	 * @static
	 * @memberof Statements
	 */
	 static get properties() {
		return {
			cifNumber: { type: String },
			clientProducts: { type: Array },
			accountType: { type: String, attribute: `type` }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_send(e) {
		
	}

	_cancel() {
		
	}

	_viewPDF() {
		
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<horizon-statements-dialog
				.cifNumber="${this.cifNumber}"
				.clientProducts="${this.clientProducts}"
				type="${this.type}"
				@cancel="${() => this._cancelStatements()}"
				@send="${() => this._send()}"
				@view="${() => this._view()}"
				@account-selected="${(event) => this._statementsAccConfirmed(event)}">
			</horizon-statements-dialog>
		`;
	}
}
customElements.define(`horizon-statements`, Statements);