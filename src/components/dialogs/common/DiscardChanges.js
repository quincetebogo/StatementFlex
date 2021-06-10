import { Component, css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';
import 'platform/components/popups/Modal';


export class DiscardChanges extends Component {
	// --------------
	// INITIALISATION
	// --------------
	constructor() {
        super();
        this._telemetry = HorizonTelemetry.instance;
    }

    connectedCallback() {
        this._telemetry.startSpan(QuickTransactionEvents.DISCARD_CHANGES, {
            "screen": TelemetryScreen.DISCARD_CHANGES
        });
    }

    disconnectedCallback() {
        this._telemetry.endSpan(QuickTransactionEvents.DISCARD_CHANGES, {
            "screen": TelemetryScreen.DISCARD_CHANGES
        });
    }

	// --------------
	// EVENT HANDLERS
	// --------------
	_onCancelClick() {
		console.log(`dispatch new event`);
		this.dispatchEvent(new CustomEvent(`on-cancel`, {
			detail: {}
		}));
	}

	_onConfirmClick() {
		console.log(`dispatch new event`);
		this.dispatchEvent(new CustomEvent(`on-confirm`, {
			detail: {}
        }));

        this._telemetry.logEvent(QuickTransactionEvents.DISCARD_CHANGES_CONFIRM, {
            "screen": TelemetryScreen.DISCARD_CHANGES,
            "next-screen": TelemetryScreen.CARD_LIMITS_LANDING
        });
	}

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
			capitec-modal {
				height: 326px;
				width: 376;
				border-radius: 4px;
				--theme-modal-header-padding-top: 32px;
				--theme-modal-header-padding-bottom: 32px;
				--theme-modal-header-padding-right: 31px;
				--theme-modal-header-padding-left: 31px;
				--theme-modal-header-background-color: #F9EBDD;
				--theme-modal-footer-padding: 0px 16px 17px 0px;
			}

			div[slot="header"] {
				width: 376px;
				height: auto;
				--theme-modal-header-height: 64px;
				position: absolute;
				display: flex;
				align-items: center;
				left: -350px;
				top: -11px;
			}

			div[slot="header"] > span {
				height: 24px;
				width: 100%;
				color: #FFFFFF;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				padding-left: 15px;
			}

			div[slot="body"] {
				width: 376px;
				height: 198px;
			}

			.modal-content-box {
				width: 376px;
				height: 198px;
				--theme-container-padding-top: 16px;
				--theme-container-padding-bottom: 0px;
				--theme-container-padding-left: 16px;
				--theme-container-padding-right: 17px;
			}

			.header-text {
				padding-left: 16px;
				height: 24px;
				width: 300px;
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}

			capitec-content-box > p {
				height: 96px;
				width: 340px;
				color: #4E6066;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 500;
				letter-spacing: 0;
				margin: 0px;
			}

			.status-icon {
				height: var(--theme-icon-size-default,24px);
				width: 24px;
				margin-right: 0px;
			}

			capitec-button {
				height: 44px;
				border-radius: 5px;
				--theme-button-height: 20px;
				--theme-button-width: 41px;
				--theme-button-color: #FFFFFF;
				--theme-button-font-family: "Hind Vadodara";
				--theme-button-font-size: 16px;
				--theme-button-font-weight: 600;
				--theme-button-letter-spacing: 0;
				--theme-button-line-height: 20px;
				--theme-button-text-align: center;
				--theme-button-padding-top: 10px;
				--theme-button-padding-right: 22px;
				--theme-button-padding-bottom: 10px;
				--theme-button-padding-left: 22px;
			}
		`
];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
		<capitec-modal type="free" header-align="left">
			<div slot="header">
				<span>
					<capitec-group layout="horizontal">
						<img class="status-icon" src="/images/statusIcons/horizon-warning-trans.svg"/>
						<capitec-label class="header-text" label="Discard Changes"></capitec-label>
					</capitec-group>
				</span>
			</div>
			<div class="modal-content-box" slot="body">
				${this._renderWarningMessage()}
			</div>
			<div slot="footer">
				${this._renderFooter()}
			</div>
		</capitec-modal>
		`;
	}

	_renderWarningMessage() {
		return html`
		<capitec-content-box class="message-text">
			<p>Are you sure you want to discard the changes you have made?</p>
		</capitec-content-box>
		`;
	}

	_renderFooter() {
		return html`
		
				<capitec-button type="clear" label="Cancel" @click="${() => this._onCancelClick()}">
				</capitec-button>
				<capitec-button id="id-confirm-button" type="primary" label="Confirm" @click="${() => this._onConfirmClick()}">
				</capitec-button>
		
			`;
	}
}
window.customElements.define(`horizon-discard-changes`, DiscardChanges);