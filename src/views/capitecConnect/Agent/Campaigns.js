import { css, html } from 'platform/elements';
import { CapitecConnectService } from 'app/services/CapitecConnectService';
import { ViewBase } from 'app/views/common/ViewBase';
import { DateTime } from 'luxon';
import { formatDate, getTimeFromDate, compareDates, getDateInPast, incrementDate, sortObjectsByDateDescending, formatCellphoneNumber, isArray, isJson, toTitleCase, formatAmount } from 'app/utils/capitecConnectUtils';

/**
 * Capitec Connect Agent View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class CapitecConnectCampaigns
 */
export class CapitecConnectCampaigns extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.capitecConnectService = new CapitecConnectService(() => super._toggleBusyFlag());

		// Static variables
		this.searchTypes = [
			{ value: `msisdn`, text: `MSISDN` },
			{ value: `amount`, text: `Amount` },
			{ value: `accountNumber`, text: `Account Number` }
		];

		this.pagingRows = [10, 20, 50];
		this.numOfPagingRows = this.pagingRows[0];
		this.currentPageIndex = 1;

		// State variables
		this.searchValue = ``;
		this.activeFilters = {
			searchType: this.searchTypes[0],
			searchValue: ``,
			dateRange: {
				from: getDateInPast(30),
				to: getDateInPast(0)
			}
		};

		this.showTable = false;

		this.clientCif = ``;
	}

	connectedCallback() {
		super.connectedCallback();

		/*
			When a client has called in. We get their CIF number. i.e. If they are "connected" to Horizon
		*/
		this.clientCif = this.callerInformation?.cif;

		if (this.callerInformation?.cifNumber) {
			this.clientCif = this.callerInformation?.cifNumber;
		}

		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	static get properties() {
		return {
			activeFilters: { type: Object },
			showTable: { type: Boolean },
			callerInformation: { type: Object },
			clientCif: { type: String },
			searchValue: { type: String }
		};
	}

	static get styles() {
		return [
			super.styles,
			css`
				.custom-flex-size {
					flex: 1;
				}
			`
		];
	}

	_initialise() {
		// this.clientCif = "281783047";

		this.showTable = true;
	}

	_filterSearchboxClick(value) {
		this.activeFilters.searchValue = ``;

		this.onFilter();
		return;
	}

	getPredefinedDateRanges() {
		return [
			{ text: `Last 30 days`, value: { startDate: getDateInPast(30), endDate: getDateInPast(0) } },
			{ text: `Last 60 days`, value: { startDate: getDateInPast(60), endDate: getDateInPast(0) } },
			{ text: `Last 90 days`, value: { startDate: getDateInPast(90), endDate: getDateInPast(0) } }
		];
	}

	async _retrieveCampaigns(renderSet) {
		this.renderSet = renderSet;
		this.numOfPagingRows = this.renderSet.numOfPagingRows;
		this.currentPageIndex = this.renderSet.currentPageIndex;
		this.searchValue = this.renderSet.searchValue;

		try {
			/*
				When a client has called in. We get their CIF number. i.e. If they are "connected" to Horizon
			*/
			let filters = this.activeFilters;

			// if (this.clientCif) {
			// 	filters.cif = this.clientCif;
			// } else {
			// 	return {
			// 		pagedItems: [],
			// 		totalCount: 0
			// 	};
			// }

			const response = await this.getCampaigns(filters);

			var r = response.result.content;

			if (r.length > 0) {
				r = r.map(e => {
					e.friendlyDate = formatDate(e.campaignStartDate) + ' ' + getTimeFromDate(e.campaignStartDate);
					return e;
				});
			}

			response.result.content = r;

			this.showTable = response.result.totalElements !== 0;

			return {
				pagedItems: response.result?.content || [],
				totalCount: response.result.totalElements // for pagination reasons this is not the returned resultset's length
			};
		} catch (error) {
			this.showTable = false;

			return {
				pagedItems: [],
				totalCount: 0
			};
		}
	}

	async _dateChanged(e) {

		/**
		 * 1. When dates are not selected on the date time picker, new value dispatched would be null.
		 *    In such case, data refresh can be skipped.
		 * 2. Sometimes start date/ end date could be null when one of its not selected, for which
		 *    either before 90 days or after 90 days set accordingly.
		 */

		if (!e.detail.new.startDate && !e.detail.new.endDate) {
			return false;
		} else if (!e.detail.new.endDate) {
			e.detail.new.endDate = e.detail.old.endDate?.split('T')[0] || getDateInPast(0);
		} else if (!e.detail.new.startDate) {
			e.detail.new.startDate = incrementDate(e.detail.new.endDate.split('T')[0], -30);
		}

		const currentDateTime = DateTime.local();
		const fromDate = DateTime.fromISO(e.detail.new.startDate);
		let toDate = DateTime.fromISO(e.detail.new.endDate);

		let from,
			to;

		if (toDate.diff(fromDate, [`days`]).days > 90) {
			toDate = fromDate.plus({ days: 90 });

			if (toDate > currentDateTime) {
				from = e.detail.new.startDate;
				to = getDateInPast(0);
			} else {
				from = e.detail.new.startDate;
				to = e.detail.new.endDate;

				const calendar = this.shadowRoot.querySelector(`#calendarRange`);
				if (calendar) {
					calendar._placeholderEndDate = toDate;
				}
			}
		} else {
			from = e.detail.new.startDate || getDateInPast(30);
			to = e.detail.new.endDate || incrementDate(from, 30);
		}

		Object.keys(e.detail).forEach(d => {
			Object.keys(e.detail[d]).forEach(x => {
				if (e.detail[d][x] !== null && e.detail[d][x].indexOf("T") > -1) {
					e.detail[d][x] = e.detail[d][x].split('T')[0]
				}
			});
		});

		this.activeFilters.dateRange = {
			from: from.split('T')[0],
			to: to.split('T')[0]
		}

		return this.onFilter();
	}

	onFilter() {
		this.showTable = false;
		// this.requestUpdate();

		setTimeout(() => {
			this.showTable = true;
			this.requestUpdate();
		}, 100);
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._render()}
		`;
	}

	/* RENDERS:start */
	_render() {
		return html`
			<capitec-content-box noPadding style="width:CALC(var(--horizon-center-panel-width) - 30px); height:CALC(var(--horizon-panel-height) - 180px)" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-button-bar align="left">
					<capitec-date-time-picker
						id="calendarRange" 
						class="custom-flex-size" 
						label="Choose a start and end date"
						startDate="${this.activeFilters.dateRange.from}"
						endDate="${this.activeFilters.dateRange.to}"
						maxDate="${getDateInPast(0)}"
						type="range"
						mode="date"
						inputType="calendar"
						outputType="string"
						.predefinedRanges="${this.getPredefinedDateRanges()}"
						@apply-clicked="${(e) => this._dateChanged(e)}"
						data-automation-id="connect-campaigns-date-filter">
					</capitec-date-time-picker>

					<capitec-button
						type="primary"
						label="Search"
						@click="${() => this.onFilter()}">
					</capitec-button>
				</capitec-button-bar>

				<capitec-button-bar align="left">
					<capitec-label type="strong" label="Active Filters:"></capitec-label>
					${this.activeFilters.searchValue ? html`<capitec-chip closable @remove="${this._filterSearchboxClick}" label="${this.activeFilters.searchType.text}: ${this.activeFilters.searchValue}"></capitec-chip>` : null}
					${this.activeFilters.dateRange.to !== null && this.activeFilters.dateRange.from !== null ?
				html`<capitec-chip label="${formatDate(this.activeFilters.dateRange.from)} - ${formatDate(this.activeFilters.dateRange.to)}"></capitec-chip>` :
				null
			}
				</capitec-button-bar>

				${this.showTable ? html`
					<capitec-table style="" 
							displayMode="Paging" 
							groupField="month"
							numOfPagingRows="${this.numOfPagingRows}"
							pagingRows="[${this.pagingRows.join(`,`)}]"
							.dataHandler="${(renderSet) => this._retrieveCampaigns(renderSet)}"
							expandable="right" 
							.expandRenderer="${(item) => this._expandRenderer(item)}">
						<capitec-table-column label="Campaign Name" field="campaignName"></capitec-table-column>
						<capitec-table-column label="Campaign ID" field="campaignId"></capitec-table-column>
						<capitec-table-column label="Start date" field="friendlyDate"></capitec-table-column>
						<capitec-table-column label="Notification Channel" field="notificationTypeDescription" .renderer="${this._renderTag}"></capitec-table-column>
					</capitec-table>
					`
				: html`
					<capitec-table>
						<capitec-table-column label="Campaign Name"></capitec-table-column>
						<capitec-table-column label="Campaign ID"></capitec-table-column>
						<capitec-table-column label="Start date"></capitec-table-column>
						<capitec-table-column label="Notification Channel"></capitec-table-column>
					</capitec-table>
					<capitec-content-box>
						<capitec-label align="center" type="default" label="No campaign data found."></capitec-label>
					</capitec-content-box>
				`}
			</capitec-content-box>
		`;
	}

	_renderTag(item, fieldName, value) {
		return html`<capitec-tag label="${value.toUpperCase()}" type="info"></capitec-tag>`;
	}

	_renderBeneficiaryName(item, fieldName, value) {
		return value[0]?.beneficiaryName;
	}

	_expandRenderer(item) {
		return html`
			<capitec-spacer></capitec-spacer>

			<capitec-group layout="grid" gap="clear">
				<div row="1" column="1" colspan="5">
					<capitec-label type="strong" label="SVM Campaign Information"></capitec-label>
				</div>

				<div row="2" column="1" colspan="5">
					<capitec-label label="Qualification criteria:"></capitec-label>
					<capitec-label type="strong" label="A customer recharged for R10 in the last 7 days"></capitec-label>
				</div>

				<div row="3" column="1">
					<capitec-label label="Resource type"></capitec-label>
					<capitec-label type="strong" label="Data"></capitec-label>
				</div>
				<div row="3" column="2">
					<capitec-label label="Product description"></capitec-label>
					<capitec-label type="strong" label="1GB data bundle"></capitec-label>
				</div>
				<div row="3" column="3">
					<capitec-label label="Valid for"></capitec-label>
					<capitec-label type="strong" label="7 days"></capitec-label>
				</div>
				<div row="3" column="4">
					<capitec-label label="Start date"></capitec-label>
					<capitec-label type="strong" label="21/12/2024 16:00"></capitec-label>
				</div>
				<div row="3" column="5">
					<capitec-label label="End date"></capitec-label>
					<capitec-label type="strong" label="21/12/2024 16:00"></capitec-label>
				</div>

				<div row="4" column="1">
					<capitec-label label="Notification channel"></capitec-label>
					<capitec-label type="strong" label="SMS"></capitec-label>
				</div>
			</capitec-group>
		`;
	}

	_renderIcon() {
		return html`
				<img src="/images/liveBetter/capitec-connect-white.svg"/>`;
	}
	/* RENDERS:end */
}

customElements.define(`horizon-capitec-connect-agent-campaign-info`, CapitecConnectCampaigns);
