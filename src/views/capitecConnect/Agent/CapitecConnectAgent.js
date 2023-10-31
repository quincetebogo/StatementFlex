import { Component, View, css, html, unsafeCSS } from 'platform/elements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { SavingsService } from 'app/services/SavingsService';
import SecurityContext from 'platform/SecurityContext';
import { formatPhoneNumber } from "../../../utils/channelServiceUtilities";
import './Recharges';
// import { CapitecConnectService } from 'app/services/CapitecConnectService';
/**
 * Capitec Connect Agent View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectAgent
 */
export class CapitecConnectAgent extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.savingsService = new SavingsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));

		// private properites
		this.loading = true;

		// Static variables
		this.dateRanges = [
			{ value: `30`, text: `30 Days` },
			{ value: `60`, text: `60 Days` },
			{ value: `90`, text: `90 Days` }
		];

		this.availableFilters = [`All`, `Airtime`, `Minutes`, `Data`, `SMS`];

		// State variables
		this.searchValue = ``;
		this.activeFilters = {
			selectedDate: this.dateRanges[0],
			searchValue: ``,
			bundleType: [`All`]
		};

		this.selectedReversal = null;

		this.showConfirmModal = false;
		this.showSuccessModal = false;
		this.showFailureModal = false;

		this.totalEscalatedReversals = 10;
		this.totalPendingReversals = 10;
		this.totalCompletedReversals = 10;
	}

	static get properties() {
		return {
			selectedReversal: { type: Object },
			showConfirmModal: { type: Boolean },
			reversalAction: { type: String },
			selectedDate: { type: Object },
			searchValue: { type: String },
			activeFilters: { type: Array },
			totalEscalatedReversals: { type: Number },
			totalPendingReversals: { type: Number },
			totalCompletedReversals: { type: Number }
		};
	}

	async searchRecharges(renderSet, filters, isEscalationDetails = false) {
		var mockArgs = {},
			pgArgs = {},
			queryArgs = {};

		if (this.isArray(filters.bundleType) && filters.bundleType.filter(e => e !== `All`).length) {
			queryArgs.bundleTypes = filters.bundleType.filter(e => e !== `All`).map(e => {
				e = e.toUpperCase();
				return e;
			});
		}

		filters.searchValue = this.formatCellphoneNumber(filters.searchValue, true);
		this.activeFilters.searchValue = filters.searchValue;

		if (filters.searchValue) {
			queryArgs.msisdn = filters.searchValue;
		}

		if (filters.cif) {
			queryArgs.cif = filters.cif;
		}

		queryArgs.transactionDate = {
			startDate: this.getDateInPast(filters.selectedDate.value),
			endDate: this.getDateInPast(-1) // for tomorrow's date so that we include today's records
		};

		pgArgs = {
			page: typeof this.currentPageIndex === `number` ? this.currentPageIndex - 1 : 1, // -1 because we start from 0
			sort: [`transactionDate,desc`],
			size: typeof this.numOfPagingRows === `number` ? this.numOfPagingRows : 10
		};

		mockArgs = {
			startAtIndex: this.numOfPagingRows * (this.currentPageIndex - 1),
			maxResults: typeof this.numOfPagingRows === `number` ? this.numOfPagingRows : 10
		};

		return this.capitecConnectService.rechargeHistory(queryArgs, pgArgs, mockArgs, isEscalationDetails);
	}

	async lock () {
		alert(`lock`);
	}

	async unlock () {
		alert(`unlock`);
	}

	async actionReversal (selectedReversal, reason, comment) {
		return this.capitecConnectService.escalateForReversal(
			selectedReversal.transactionReference,
			reason,
			comment
		);
	}

	static get styles() {
		return [
			super.styles,
			css`
				.product-info{
					width: 100%;
					height: var(--horizon-panel-height, 888px);
				}
				.content{
					width: 100%;
					height: 788px;
				}
				capitec-title-bar {
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 12px 16px;
				}
				.transact {
					--theme-type-primary-background: linear-gradient(135deg, #126D9B 0%, #0985C5 54.69%, #298EA7 100%);
				}
				.save {
					--theme-type-primary-background: linear-gradient(135deg, #002A3F 0%, #00537D 52.97%, #024D73 100%);
				}
				.credit {
					--theme-type-primary-background: linear-gradient(90deg, #B62825 0%, #E61414 100%);
				}
				.insure {
					--theme-type-primary-background: linear-gradient(315deg, #70838C 0%, #667F8C 47.52%, #41525B 100%);
				}
				.liveBetter {
					--theme-type-primary-background: url(/images/liveBetter/lbb-bg-1092x64.png);
				}
				#id-more-info {
					margin: 43px auto 8px auto;
					color: #3A3A3A;
					font-size: 24px;
					font-weight: 600;
				}
				.insights-subtitle{
					color: #3A3A3A;
					font-size: 15px;
					line-height: 20px;
					text-align: center;
					max-width: 684px;
					margin-bottom: 32px;
				}
				.benefits-button {
					height: 48px;
					width: 146px;
					--theme-button-primary-border-width: 0px;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-bottom: 14px;
				}
				table tbody tr td:nth-child(4) {
					color: blue;
					text-align: center;
				}
			`
		];
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderProductInfo()}
		`;
	}

	_renderProductInfo() {
		return html`
			<capitec-card class="product-info">
				<capitec-title-bar
					data-automation-id="cnet-product-info-title-bar"
					class="transact"
					type="primary">
						${this._renderIcon()}
						<capitec-label
							data-automation-id="cnet-product-info-title"
							label="Capitec Connect"
							type="title">
						</capitec-label>
				</capitec-title-bar>
					
				<capitec-group class= "content" layout="grid" gap="none" columns="auto" rows="auto">
					<capitec-tab-group>
						<capitec-tab label="Recharge History" layout="vertical" halign="left">
							<horizon-capitec-connect-agent-recharges
								style="width:100%"
								.searchRecharges="${this.searchRecharges}"
								.getEscalationDetail="${this.getEscalationDetail}"
								.lock="${this.lock}"
								.unlock="${this.unlock}"
								.actionReversal="${this.actionReversal}"
								></horizon-capitec-connect-agent-recharges>
						</capitec-tab>
					</capitec-tab-group>
				</capitec-group>
		</capitec-card>`;
	}

	_renderIcon() {
		return html`
				<img src="/images/liveBetter/capitec-connect-white.svg"/>`;
	}

}

customElements.define(`horizon-capitec-connect-agent`, CapitecConnectAgent);
