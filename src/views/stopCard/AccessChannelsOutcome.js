import { css, html } from 'platform/elements';
import { ACCESS_CHANNELS_TYPE } from 'app/constants/AccessChannels';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { NavigationContext } from 'platform/core';
import { SUSPEND_CHANNELS_EVENTS } from 'app/constants/telemetry/events/AccessChannels';
import { ViewBase } from 'app/views/common/ViewBase';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

const MAX_RETRY = 3;

export class AccessChannelsOutcome extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.result = [];
		this.retryReq = {};
		this.retryCount = 0;
		this.endCallContext = `QuickTransactionSuccess`;
		this.toastDetail = ``;
		this.toastHeader = ``;
		this.toastType = ``;
		this.cards = [];
		this.alertStopcard = false;
		this.stopcardLater = false;

		this.navigationContext = NavigationContext.getInstance();

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), () => true);
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			alertStopcard: { type: Boolean, attribute: false }
		};
	}
	
	get incidentDescription() {
		let desc = ``;

		if (this.unsuspendedChannels.length > 0) {
			desc = `\nUnsuspended channels: ${this._formatLabel(this.unsuspendedChannels)}`;
		}
		desc = `${desc}${this.stopcardLater ? `\n\nNote: Card(s) not stopped` : ``}`;

		return `Suspended channels: ${this._formatLabel(this.suspendedChannels)}${desc}`;
	}

	get channelName() {
		return {
			app: `APP`,
			inetbanking: `Internet Banking`,
			ussd: `USSD`
		};
	}

	get showTryAgain() {
		return this.retryCount < MAX_RETRY && this.result.some(item => !item.status) ? `Try Again` : ``;
	}

	get unsuspendedChannels() {
		return this.result.filter(item => !item.status).map(item => this.channelName[item.channel]);
	}

	get suspendedChannels() {
		return this.result.filter(item => item.status).map(item => this.channelName[item.channel]);
	}

	get screenDetails() {
		return this.horizonStore.getScreenDetails();
	}

	get hasCards() {
		return this.cards?.length > 0;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this._initialise();
		
		this._telemetry.startSpan(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS_OUTCOME, {
			SuspendChannels: this.suspendedChannels.join(`, `),
			UnsuspendChannels: this.unsuspendedChannels.join(`, `),
			Result: this.toastDetail
		});
		this._updateIncidentState();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		
		await this._telemetry.endSpan(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS_OUTCOME, {}, true, true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS_OUTCOME_DONE, {});
		await this._telemetry.endSpan(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS_OUTCOME, {}, true, true);

		this.horizonStore.clearReturnScreen();
		this.horizonStore.clearScreenDetails();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	async _tryAgain() {
		this.retryCount++;
		await this._telemetry.logEvent(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS_OUTCOME_TRY_AGAIN, {});

		const returnValue = await this.accessChannelService.suspendChannels(this.retryReq);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to suspend channels`, `AccessChannelsOutcome._tryAgain`, returnValue.correlationId);
			return;
		}
		this._updateScreenDetails(this.retryReq, returnValue);
	}

	_notNow() {
		this._telemetry.logEvent(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS_OUTCOME_SC_NOT_NOW, {});

		this.stopcardLater = true;
		this.alertStopcard = false;
		this._updateIncidentState();
		this.requestUpdate();
	}

	_stopCard() {
		this._telemetry.logEvent(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS_OUTCOME_SC_CONTINUE, {});

		this.alertStopcard = false;
		this.horizonRouter.navigateToStopCard(`ac`);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		if (this.showTryAgain) {
			this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
		} else {
			this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
		}
		
		this.horizonIncidentManager.setDescription(this.incidentDescription);
	}

	_formatLabel(str) {
		return str.join(`, `).replace(/, ([^,]*)$/, ` and $1`);
	}

	_updateScreenDetails(request, response) {
		const screenDetails = this.horizonStore.getScreenDetails();
		
		const updatedRes = request.channels.map(item => {
			const channelName = ACCESS_CHANNELS_TYPE[item];
			const channelRes = response.result[channelName];

			if (channelRes.status) {
				this.retryReq[channelName] = null;
				const index = request.channels.indexOf(channelName.toUpperCase());
				this.retryReq.channels.splice(index, 1);
			}

			return {
				channel: channelName,
				status: channelRes.status
			};
		});
		const suspendChannels = this.result.filter(item => item.status);
		screenDetails.result = [...suspendChannels, ...updatedRes];
		screenDetails.request = this.retryReq;
		
		this.horizonStore.setScreenDetails(screenDetails);
		this._initialise();
		this._updateIncidentState();
		this.requestUpdate();
	}

	async _initialise() {
		const screenDetails = this.horizonStore.getScreenDetails();
		this.result = screenDetails.result;
		this.retryReq = screenDetails.request;
		
		this._setToastInfo();

		/**
		 * Publishing the event to refresh AC menu
		 * Subscribed by: Accecc channels right bar
		 */
		this.eventAggregator.publish(`horizon-access-channels-reload`, {});

		const { pathParams } = this.navigationContext.current;
		if (pathParams.context === `ac`) {
			await this._getCards();
			this.alertStopcard = this.hasCards;
		}
	}

	_header() {
		let header = ``;

		if (this.result.every(item => !item.status)) {
			header = `Access channels not suspended`;
		} else if (this.result.some(item => !item.status)) {
			header = `Access channels partially suspended`;
		} else {
			header = `Access channels suspended`;
		}
		return header;
	}

	_setToastInfo() {
		this.toastDetail = this._header();

		if (this.suspendedChannels.length === 0) {
			this.toastType = `error`;
			this.toastHeader = `Unsuccessful`;
		} else if (this.unsuspendedChannels.length === 0) {
			this.toastType = `success`;
			this.toastHeader = `Successful`;
		} else {
			this.toastType = `warning`;
			this.toastHeader = `Warning`;
		}
	}

	async _getCards() {
		this.cards = this.screenDetails && this.screenDetails?.cards;
		// If its not null or undefined, return.
		if (!isNullorEmpty(this.cards)) {
			return;
		}

		const returnValue = await this.cardService.identifyCaller(
								this.callerInformation,
								this.currentIncident
							);

		if (returnValue.succeeded) {
			const screenDetails = this.screenDetails;
			screenDetails.cards = returnValue.result && returnValue.result.cards;

			this.horizonStore.setScreenDetails(screenDetails);
			this.cards = screenDetails.cards;
			return true;
		}

		this.logger.log(`error`, `Unable to get cards`, `_getCards`, returnValue.correlationId);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-success-screen {
					--horizon-button-group-margin-top: 30px;
				}
				section[slot="detail"] {
					width: auto;
					margin-bottom: 0px;
				}
				.noContent {
					--horizon-success-icon-display: none;
				}
				capitec-modal[type="onboard"] {
					--theme-modal-body-padding: 24px;
					--theme-modal-footer-padding: 0px;
				}
				capitec-modal[type="onboard"] > capitec-content-box[slot="body"] {
					border: none;
				}
				capitec-label[type="subtitle"] {
					text-align: center;
				}
				capitec-button {
					--theme-button-padding-top: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 22px;
					--theme-button-padding-right: 22px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSuccessScreen()}

			${super._webTemplate()}
			${this._renderRelatedOptions()}
			${this._renderAlertStopCard()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen
				class="${this.suspendedChannels.length === 0 ? `noContent` : ``}"
				header="${this._header()}" 
				image="/images/verifyCaller/verify-client.svg"
				left="${this.showTryAgain}"
				right="Done"
				toast="${this.toastDetail}"
				toastHeader="${this.toastHeader}"
				toastType="${this.toastType}"
				@left-click=${() => this._tryAgain()}
				@right-click=${() => this._doneClick()}
				?subContent="${true}">
					${this._renderDetail()}
					${this._renderSubContent()}
			</horizon-success-screen>
		`;
	}

	_renderDetail() {
		return this.suspendedChannels.length > 0
		? html`
			<section slot="detail">
				<span>
					${this._formatContent(this.suspendedChannels)} ${this.suspendedChannels.length > 1 ? `were` : `was`} suspended.
				</span>
			</section>`
		: html``;
	}

	_renderSubContent() {
		return this.unsuspendedChannels.length > 0
		? html`
			<capitec-icon slot="sub-content" size="medium" icon="status/error-trans"></capitec-icon>
			<span slot="sub-content">
				${this._formatContent(this.unsuspendedChannels)} ${this.unsuspendedChannels.length > 1 ? `were` : `was`} not suspended.
			</span>`
		: html``;
	}

	_formatContent(arr) {
		const lastElemIndex = arr.length - 1;
		const lastBeforeElemIndex = arr.length - 2;

		return arr.length === 1
		? arr.map(item => html`<b>${item}</b>`)
		: arr.map((item, index) => {
			if (index === lastElemIndex) {
				return html`and <b>${item}</b>`;
			} else if (index === lastBeforeElemIndex) {
				return html`<b>${item}</b> `;
			}

			return html`<b>${item}</b>, `;
		});
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}

	_renderAlertStopCard() {
		return this.alertStopcard
		? html`
			<capitec-modal type="onboard">
				<capitec-content-box slot="body" layout="vertical" halign="center" valign="center" noPadding>
					<capitec-image src="platform/illustrations/debicheck.svg"></capitec-image>
					<capitec-label type="title" label="Stop Card(s)"></capitec-label>
					<capitec-label type="subtitle" label="Does the client wish to stop their physical or virtual card as part of this process?"></capitec-label>
					<capitec-group layout="horizontal">
						<capitec-button
							label="Not Now"
							@click="${() => this._notNow()}">
						</capitec-button>
						<capitec-button
							type="primary"
							label="Stop Card"
							@click="${() => this._stopCard()}">
						</capitec-button>
					</capitec-group>
				</capitec-content-box>
			</capitec-modal>`
		: html``;
	}
}

customElements.define(`horizon-access-channels-outcome`, AccessChannelsOutcome);