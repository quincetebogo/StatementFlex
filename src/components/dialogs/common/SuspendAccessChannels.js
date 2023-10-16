import { ACCESS_CHANNELS_REASONS, ACCESS_CHANNELS_TYPE, CHANNEL_TYPE } from 'app/constants/AccessChannels';
import { Component, css, html } from 'platform/elements';
import { ACCESS_CHANNEL_STATUS } from 'app/productControls/AccessChannels/src/Constants';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { formatDate } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonExpander';
import 'platform/components/popups/Modal';

const IB_TOKEN_TYPE = {
	SOFT: `Soft Token`,
	HARD: `Hard Token`
};

/**
 * A dialog that prompts the agent to select active channels to suspend
 *
 * @export
 * @class SuspendAccessChannels
 * @extends {Component}
 */

export class SuspendAccessChannels extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.accessChannels = {};
		this.channels = [];
		this.tokenType = ``;
		this.alertSuspendChannels = false;
		this.confirmSuspendChannels = false;
		this.notNowToSuspendChannels = false;
		this.need = ``;
		this.context = ``;
		this.isBusy = false;

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		
		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), () => true);
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			context: { type: String },
			cifNumber: { type: String },
			accessChannels: { type: Object },
			suspendChannels: { type: Object },
			alertSuspendChannels: { type: Boolean, attribute: false },
			confirmSuspendChannels: { type: Boolean, attribute: false },
			isBusy: { type: Boolean, attribute: false }
		};
	}

	get selectedACs() {
		return this.channels.filter(item => item.selected && !item.disabled).length;
	}
	
	get channelIcons() {
		const app = `system/cards-action`;
		const inet = `system/access-action`;
		const ussd = `system/call-outbound-action`;

		return {
			[ACCESS_CHANNELS_TYPE.APP]: app,
			[ACCESS_CHANNELS_TYPE.INTERNET_BANKING]: inet,
			[ACCESS_CHANNELS_TYPE.USSD]: ussd
		};
	}

	get selectedReasonAcs() {
		return this.channels.filter(item => item.selected && Boolean(item.reason)).length;
	}

	get ussd() {
		return this.channels.find(item => item.channel === ACCESS_CHANNELS_TYPE.USSD);
	}

	get internetBanking() {
		return this.channels.find(item => item.channel === ACCESS_CHANNELS_TYPE.INTERNET_BANKING);
	}
	
	get app() {
		return this.channels.find(item => item.channel === ACCESS_CHANNELS_TYPE.APP);
	}

	get expandedTiles() {
		return this.channels.filter(x => x.expanded).length;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_selectAllToSuspend(e) {
		this.channels = this.channels.map(item => {
			item.selected = e.detail.new;
			if (!item.disabled) {
				item.expanded = e.detail.new;
			}
			return item;
		});
		this.requestUpdate();
	}

	_cancelSuspendChannels() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_expanded(item, e) {
		item.expanded = true;
		this.requestUpdate();
	}

	_collapsed(item, e) {
		item.expanded = false;
		this.requestUpdate();
	}

	_channelSelected(event, index) {
		this.channels[index].selected = event.detail.new;
		this.channels[index].expanded = event.detail.new;

		if (this.channels[index].channel === ACCESS_CHANNELS_TYPE.APP && this.tokenType === IB_TOKEN_TYPE.SOFT && this.internetBanking?.status === ACCESS_CHANNEL_STATUS.ACTIVE) {
			const ibIndex = this.channels.findIndex(item => item.channel === ACCESS_CHANNELS_TYPE.INTERNET_BANKING);
			this.channels[ibIndex].selected = event.detail.new;
		}

		if (!event.detail.new) {
			this.channels[index].reason = ``;
		}

		this.channels = this.channels.map(c => {
										if (c.selected && Boolean(c.reason)) {
											c.expanded = false;
										}
										return c;
									});
		this.requestUpdate();
	}

	_suspendReasonSelected(event, item, key = null) {
		const index = this.channels.findIndex(x => x.channel === item.channel);
		this.channels[index].reason = key || event.currentTarget.label;

		this.requestUpdate();
	}

	async _confirmSuspend() {
		const request = await this._formatSuspendChannelsRequest();
		const returnValue = await this.suspendChannels(request, this.need);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to suspend channels`, `SuspendAccessChannels._confirmSuspend`, returnValue.correlationId);
		}

		this._updateScreenDetails(request, returnValue.result);
		this.dispatchEvent(new CustomEvent(`suspended`, {}));
		this.horizonRouter.navigateToAccessChannelsOutcome(this.context);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		this.dispatchEvent(new CustomEvent(`onLoad`, {}));
		// Coverting result into Channels array
		this.channels.push({ ...this.accessChannels.app, channel: ACCESS_CHANNELS_TYPE.APP, label: `App` });
		this.channels.push({ ...this.accessChannels.internetBanking, channel: ACCESS_CHANNELS_TYPE.INTERNET_BANKING, label: `Internet Banking` });
		this.channels.push({ ...this.accessChannels.ussd, channel: ACCESS_CHANNELS_TYPE.USSD, label: `USSD` });

		this.tokenType = this.internetBanking?.tokenType;
		this.channels = this.channels
							.filter(x => x.status === ACCESS_CHANNEL_STATUS.ACTIVE)
							.map(item => {
								item.selected = false;
								item.disabled = this.tokenType === IB_TOKEN_TYPE.SOFT && item.channel === ACCESS_CHANNELS_TYPE.INTERNET_BANKING;
								item.reason = ``;
								item.expanded = false;

								return item;
							});
	}

	async _formatSuspendChannelsRequest() {
		const request = {
			channels: this.channels.filter(item => item.selected && !item.disabled).map(item => CHANNEL_TYPE[item.channel]),
			app: null,
			inetbanking: null,
			ussd: null
		};
		this.need = request.channels.length > 1 ? `suspend-channels` : ``;

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.APP])) {
			request.app = {
				reason: this.app?.reason,
				userRegNo: this.app?.userRegNo
			};
			this.need = this.need || `suspend-app`;
		}

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.INTERNET_BANKING]) && this.tokenType !== IB_TOKEN_TYPE.SOFT) {
			const returnValue = await this.accessChannelService.internetBankingLanding(this.internetBanking?.userRegNo);

			if (returnValue.succeeded && returnValue.result) {
				const tokens = returnValue.result?.tokens;

				request.inetbanking = {
					cif: this.cifNumber,
					tokenSerialNo: tokens.filter(t => t.tokenType !== IB_TOKEN_TYPE.SOFT).map(t => t.tokenSerialNo),
					reason: this.internetBanking?.reason
				};
			} else {
				this.logger.log(`error`, `Failed to load tokens to suspend internet banking`, `_formatSuspendChannelsRequest`, returnValue.correlationId);
			}
			this.need = this.need || `suspend-token`;
		}

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.USSD])) {
			request.ussd = {
				msisdn: this.accessChannels.msisdn,
				cif: `0${this.cifNumber}`,
				reason: ACCESS_CHANNELS_REASONS.DEFAULT
			};
			this.need = this.need || `cancel-ussd`;
		}
		return request;
	}

	_updateScreenDetails(request, response) {
		const screenDetails = {};
		screenDetails.result = request.channels.map(item => {
			const channelRes = response && response[item.toLowerCase()];

			return {
				channel: item.toLowerCase(),
				status: channelRes?.status || false
			};
		});

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.APP]) && response?.app?.status) {
			request.app = null;
			const index = request.channels.indexOf(CHANNEL_TYPE.app);
			request.channels.splice(index, 1);
		}

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.INTERNET_BANKING]) && response?.inetbanking?.status) {
			request.inetbanking = null;
			const index = request.channels.indexOf(CHANNEL_TYPE.internetBanking);
			request.channels.splice(index, 1);
		}

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.USSD]) && response?.ussd?.status) {
			request.ussd = null;
			const index = request.channels.indexOf(CHANNEL_TYPE.ussd);
			request.channels.splice(index, 1);
		}

		screenDetails.request = request;
		this.horizonStore.setScreenDetails(screenDetails);
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal[type="form"] {
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-body-padding: 0px;
					--theme-modal-form-m-l-xl-width: 515px;
					--theme-modal-footer-padding: 10px 16px 10px 0px;
				}
				capitec-modal[type="form"] > capitec-content-box {
					height: 541px;
				}
				horizon-alert-banner {
					width: 100%;
					--theme-toast-icon-margin: 0px 13px 0px 15px;
				}
				capitec-button {
					--theme-button-padding-top: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 22px;
					--theme-button-padding-right: 22px;
				}
				horizon-label {
					--horizon-label-text-height: 16px;
					--horizon-label-text-font-size: 16px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-text-line-height: 16px;
					--horizon-label-value-font-size: 13px;
					--horizon-label-value-font-weight: 500;
					--horizon-label-value-height: 14px;
					--horizon-label-value-line-height: 14px;
					--horizon-label-value-margin-top: 6px;
				}
				.channelInfoLbl {
					width: 225px;
				}
				.channelStatusLbl {
					width: 120px;
					--horizon-label-value-color: #70AF00;
					--horizon-label-text-font-weight: 400;
					--horizon-label-value-font-weight: 600;
				}
				capitec-check {
					--theme-check-width: 20px;
					--theme-check-height: 20px;
					--theme-check-label-spacing: 8px;
				}
				capitec-radio-group {
					--theme-radio-group-label-font-weight: 600;
					--theme-radio-label-font-weight: 400;
					--theme-radio-group-label-margin-bottom: 0px;
					--theme-layout-gap-spacing: 6px;
				}
				capitec-radio-group > capitec-radio {
					--theme-radio-width: 20px;
					--theme-radio-height: 20px;
				}
				horizon-expander {
					--theme-expander-width: 483px;
					--theme-expander-height: 218px;
					--theme-expander-header-height: 64px;
					--theme-expander-header-padding: 0px 0px 0px 16px;
					--theme-expander-indicator-right-margin: 0px 16px 0px 0px;
				}
				horizon-expander.disabled {
					filter: grayscale(100%);
				}
				capitec-group[slot="custom-header"] {
					width: 375px;
				}
				capitec-check.ac-tile {
					--theme-check-label-spacing: 0px;
				}
				capitec-content-box[slot="content"] {
					--theme-container-padding-top: 8px;
					--theme-container-padding-bottom: 8px;
					border: 1px solid rgb(225, 225, 225);
					border-top: 0px;
				}
				.noPaddingRight {
					padding-right: 0px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="form" header="Stop Access Channels">
				<capitec-content-box slot="body" halign="right" class="${this.expandedTiles > 1 ? `noPaddingRight` : ``}">
					${this.tokenType === IB_TOKEN_TYPE.SOFT
						? html`
							<horizon-alert-banner
								type="info"
								header="Note: "
								label="Suspending App will suspend Internet Banking soft token.">
							</horizon-alert-banner>`
						: html``
					}
					<capitec-check
						label="Select all"
						@value-change="${(e) => this._selectAllToSuspend(e)}">
					</capitec-check>
					${this._renderActiveAccessChannels()}
				</capitec-content-box>
				<capitec-button slot="footer" label="Cancel" @click="${() => this._cancelSuspendChannels()}">
				</capitec-button>
				<capitec-button slot="footer" 
					type="primary"
					label="Stop Channels"
					@click="${() => this._confirmSuspend()}"
					?disabled="${this.selectedACs === 0 || this.selectedACs !== this.selectedReasonAcs}">
				</capitec-button>
			</capitec-modal>
			${this._renderLoadingIndicator()}
		`;
	}

	_renderActiveAccessChannels() {
		return this.channels.filter(item => item.status === ACCESS_CHANNEL_STATUS.ACTIVE)
							.map((item, index) => html`
								<horizon-expander
									class="${item.disabled ? `disabled` : ``}"
									expandButtonAlignment="right"
									icon="${this.channelIcons[item.channel]}"
									?expanded="${item.expanded}"
									?disabled="${!item.selected}"
									@expand="${(e) => this._expanded(item, e)}"
									@collapse="${(e) => this._collapsed(item, e)}">
										<capitec-group slot="custom-header" layout="horizontal" valign="center">
											<horizon-label
												class="channelInfoLbl"
												label="${item.label}"
												value="Last used ${formatDate(item.dateLastUsed, `dd mmm yyyy`)}">
											</horizon-label>
											<horizon-label
												class="channelStatusLbl"
												label="Status"
												value="${item.status}">
											</horizon-label>
											<capitec-check
												class="ac-tile"
												?checked="${item.selected}" 
												?disabled="${item.disabled}"
												@value-change="${(event) => this._channelSelected(event, index)}">
											</capitec-check>
										</capitec-group>
										${this._renderSuspendReasons(item)}
								</horizon-expander>
							`);
	}

	_renderSuspendReasons(item) {
		const app = () => this._renderAppReasons(item);
		const inetBanking = () => this._renderIBReasons(item);
		const ussd = () => this._renderUssdReasons(item);
		
		return {
			[ACCESS_CHANNELS_TYPE.APP]: app,
			[ACCESS_CHANNELS_TYPE.INTERNET_BANKING]: inetBanking,
			[ACCESS_CHANNELS_TYPE.USSD]: ussd
		}[item.channel]();
	}

	_renderAppReasons(item) {
		return html`
			<capitec-content-box slot="content">
				<capitec-radio-group label="Choose a reason">
					<capitec-radio 
						label="Lost"
						?checked="${item.reason === `Lost`}"
						@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
					</capitec-radio>
					<capitec-radio 
						label="Stolen"
						?checked="${item.reason === `Stolen`}"
						@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
					</capitec-radio>
					<capitec-radio 
						label="Cancelled remote banking"
						?checked="${item.reason === `ServiceCanceled`}"
						@value-changed="${(event) => this._suspendReasonSelected(event, item, `ServiceCanceled`)}">
					</capitec-radio>
					<capitec-radio 
						label="Faulty"
						?checked="${item.reason === `Faulty`}"
						@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
					</capitec-radio>
				</capitec-radio-group>
			</capitec-content-box>`;
	}

	_renderUssdReasons(item) {
		return html`
			<capitec-content-box
				slot="content">
					<capitec-radio-group label="Choose a reason">
						<capitec-radio 
							label="Do not use service enough"
							?checked="${item.reason === `Do not use service enough`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Changing to remote/internet banking"
							?checked="${item.reason === `Changing to remote/internet banking`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Mobile banking too expensive"
							?checked="${item.reason === `Mobile banking too expensive`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Mobile banking too complicated"
							?checked="${item.reason === `Mobile banking too complicated`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Need more functions"
							?checked="${item.reason === `Need more functions`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Lack of support"
							?checked="${item.reason === `Lack of support`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Closing account"
							?checked="${item.reason === `Closing account`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
					</capitec-radio-group>
			</capitec-content-box>`;
	}

	_renderIBReasons(item) {
		return html`
			<capitec-content-box
				slot="content">
					<capitec-radio-group label="Choose a reason">
						<capitec-radio
							label="Stolen"
							?checked="${item.reason === `Stolen`}"
							@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Lost"
							?checked="${item.reason === `Lost`}"
							@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Faulty"
							?checked="${item.reason === `Faulty`}"
							@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio 
							label="Service cancellation"
							?checked="${item.reason === `ServiceCanceled`}"
							@value-changed="${(event) => this._suspendReasonSelected(event, item, `ServiceCanceled`)}">
						</capitec-radio>
					</capitec-radio-group>
			</capitec-content-box>`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
		? html`
			<capitec-loading-indicator
				data-automation-id="suspend-channels-loading-indicator">
			</capitec-loading-indicator>`
		: html``;
	}
}
window.customElements.define(`horizon-suspend-access-channels`, SuspendAccessChannels);