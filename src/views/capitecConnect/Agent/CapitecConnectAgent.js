import { css, html } from 'platform/elements';
import { formatCellphoneNumber, isArray } from 'app/utils/capitecConnectUtils';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { ViewBase } from 'app/views/common/ViewBase';

import './Recharges';
import './Advances';
import './AdvancesRepayments';
import './Devices';

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
export class CapitecConnectAgent extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
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
			`
		];
	}

	async getRecords(filters, type = false) {
		var mockArgs = {},
			pgArgs = {},
			queryArgs = {};

		queryArgs.search = {
			qry: filters.searchValue,
			type: filters.searchType.value
		};

		if (isArray(filters.bundleType) && filters.bundleType.filter(e => e !== `All`).length) {
			queryArgs.bundleTypes = filters.bundleType.filter(e => e !== `All`).map(e => {
				e = e.toUpperCase();
				return e;
			});
		}

		if (filters.cif) {
			queryArgs.cif = filters.cif;
		}

		if (typeof type === 'string') {
			queryArgs.type = type.toUpperCase();
		}

		queryArgs.transactionDate = {
			startDate: filters.dateRange.from,
			endDate: filters.dateRange.to
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

		if (queryArgs.search.qry) {
			switch (queryArgs.search.type) {
				case "msisdn":
					queryArgs.msisdn = queryArgs.search.qry;

					filters.searchValue = formatCellphoneNumber(filters.searchValue, true);

					if (filters.searchValue.length > 9) {
						queryArgs.msisdn = filters.searchValue;
					} else {
						delete queryArgs.msisdn;
					}
					break;
				case "transactionReference":
				case "amount":
				case "accountNumber":
					queryArgs[queryArgs.search.type] = queryArgs.search.qry;
					break;
				case "productName":
					queryArgs.bundleTypes = [queryArgs.search.qry];
					break;
				default:
					break;
			}
		}

		return this.capitecConnectService.rechargeHistory(queryArgs, pgArgs, mockArgs);
	}

	async getAdvanceBalances(filters) {
		var queryArgs = {};

		queryArgs.search = {
			qry: filters.searchValue,
			type: filters.searchType.value
		};

		if (filters.cif) {
			queryArgs.cif = filters.cif;
		}

		if (queryArgs.search.qry && queryArgs.search.type === "msisdn") {
			queryArgs.msisdn = queryArgs.search.qry;

			filters.searchValue = formatCellphoneNumber(filters.searchValue, true);

			if (filters.searchValue.length > 9) {
				queryArgs.msisdn = filters.searchValue;
			} else {
				delete queryArgs.msisdn;
			}
		}

		return this.capitecConnectService.advanceBalances(queryArgs);
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderProductInfo()}
			${super._webTemplate()}
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
								.searchRecharges="${this.getRecords}"
								.getAdvanceBalances="${this.getAdvanceBalances}"
								></horizon-capitec-connect-agent-recharges>
						</capitec-tab>
						<capitec-tab label="Advances" layout="vertical" halign="left">
							<horizon-capitec-connect-agent-advances
								style="width:100%"
								.searchAdvances="${this.getRecords}"
								.getAdvanceBalances="${this.getAdvanceBalances}"
							></horizon-capitec-connect-agent-advances>
						</capitec-tab>
						<capitec-tab label="Advances Repayment" layout="vertical" halign="left">
							<horizon-capitec-connect-agent-advances-repayments
								style="width:100%"
								.searchAdvances="${this.getRecords}"
								.getAdvanceBalances="${this.getAdvanceBalances}"
							></horizon-capitec-connect-agent-advances-repayments>
						</capitec-tab>
						<capitec-tab label="Devices" layout="vertical" halign="left">
							<horizon-capitec-connect-agent-devices
								style="width:100%"
								.searchDevices="${this.getRecords}"
        						.getAdvanceBalances="${this.getAdvanceBalances}"
							></horizon-capitec-connect-agent-devices>
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