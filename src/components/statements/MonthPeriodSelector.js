import { Component, css, html } from 'platform/elements';
import { getMonthName } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonExpanderNoAnimations';
import 'app/components/common/HorizonMonthCalendar';

export class MonthPeriodSelector extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.lastSixMonths = [];
		this.selectedPredefinedMonths = [];
		this.selectedCustomMonths = [];
		this.checkedAll = false;
		this.maxDate = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {string} accountOpenDate - account opened date
	 * @readonly
	 * @static
	 * @memberof MonthPeriodSelector
	 */
	static get properties() {
		return {
			accountOpenDate: { type: String },
			value: { type: Array },

			checkedAll: { type: Boolean, state: true }
		};
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

	_selectedMonth(event, item) {

		if (event.detail.new) {
			this.selectedPredefinedMonths.push(item.key);
		} else {
			const index = this.selectedPredefinedMonths.findIndex(month => month === item.key);
			this.selectedPredefinedMonths.splice(index, 1);
		}

		this._dispatchValueChanged();
	}

	_selectAll() {
		this.selectedPredefinedMonths = [];

		if (!this.checkedAll) {
			this.selectedPredefinedMonths = this.lastSixMonths.filter(item => !item.disabled)
															  .map(item => item.key);
		}

		this.checkedAll = !this.checkedAll;
		this._dispatchValueChanged();
	}

	_customMonthSelected(event) {
		const selectedMonth = `${event.detail.month}/${event.detail.year}`;
		if (this.selectedCustomMonths.includes(selectedMonth)) {
			return true;
		}
		
		this.selectedCustomMonths.push(selectedMonth);

		this._dispatchValueChanged();
		this.requestUpdate();
	}

	_clearFilter(key) {
		const indexToRemove = this.selectedCustomMonths.findIndex(item => item === key);
		this.selectedCustomMonths.splice(indexToRemove, 1);

		this._dispatchValueChanged();
		this.requestUpdate();
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		for (let month = 1; month <= 6; month++) {
			
			const accOpenedDate = new Date(this.accountOpenDate);
			const date = new Date();
			const prevMonth = date.getMonth() - 1;
			date.setMonth(prevMonth - month);

			this.lastSixMonths.push({
				index: month,
				key: `${date.getMonth() + 1}/${date.getFullYear()}`,
				value: `${getMonthName(date.getMonth())} ${date.getFullYear()}`,
				disabled: accOpenedDate > date
			});
		}

		// Retrieving selected predefined & custom months from value
		this.selectedPredefinedMonths = this.lastSixMonths.filter(item => this.value.includes(item.key))
														  .map(month => month.key);
		this.selectedCustomMonths = this.value.filter(item => !this.selectedPredefinedMonths.includes(item));
		this.checkedAll = this.lastSixMonths.every(item => this.selectedPredefinedMonths.includes(item.key));

		// Determining Max month for month selector
		const todaysDate = new Date();
		this.maxDate = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), 0).toISOString();
	}

	_getChipLable(key) {
		const [first, second] = key.split(`/`);
		return `${getMonthName(first - 1)} ${second}`;
	}

	_dispatchValueChanged() {
		this.dispatchEvent(new CustomEvent(`value-changed`, {
			detail: {
				months: [...new Set([...this.selectedPredefinedMonths, ...this.selectedCustomMonths])]
			}
		}));
	}
	
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-content-box {
					--theme-layout-gap-spacing: 16px;
				}
				.choose-period-header {
					--theme-layout-gap-spacing: 0px;
				}
				capitec-label[type="subtitle"] {
					line-height: 24px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
				}
				horizon-expander-noanime {
					width: 217px;
					margin-top: 16px;

					--theme-layout-gap-spacing: 15px;
					--theme-expander-header-height: 56px;
				}
				.line{
					width: 100%;
					border: 0.5px solid #E1E1E1;
				}
				horizon-month-calendar{
					width:320px;
				}
			`
		];
	}

	_webTemplate() {
		return html`
			<capitec-content-box
				layout="vertical"
				halign="stretch"
				valign="top"
				gap="clear"
				noPadding>
					${this._renderLastSixMonths()}
					${this._renderOtherDates()}
			</capitec-content-box>
		`;
	}

	_renderLastSixMonths() {
		return html`
			<capitec-group
				class="choose-period-header"
				layout="horizontal">
					<capitec-label
						type="subtitle"
						label="Choose a period (last 6 months)">
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-check
						label="Select all"
						?indeterminate="${this.checkedAll}"
						@value-change="${e => this._selectAll()}"
						?disabled="${this.lastSixMonths.every(item => item.disabled)}">
					</capitec-check>
			</capitec-group>

			<capitec-group 
				class="choose-period" 
				layout="horizontal"
				gap="clear"
				wrap="true">
					${this.lastSixMonths.map((item) => this._renderMonths(item))}
			</capitec-group>
		`;
	}

	_renderMonths(item) {
		return html`
			<horizon-expander-noanime
				data-automation-id="month-period-selector"
				expandButtonAlignment="right"
				inputType="Checkbox"
				@value-change="${(e) => this._selectedMonth(e, item)}"
				?selected="${this.selectedPredefinedMonths.includes(item.key)}"
				?disabled="${item.disabled}"
				label="${item.value}">
			</horizon-expander-noanime>`;
	}

	_renderOtherDates() {
		// set minDate and maxDate for calendar for accountOpened and accountClosed dates

		return html`
			<hr class="line">
			<capitec-label
				type="subtitle"
				label="Choose other dates">
			</capitec-label>

			<horizon-month-calendar
				type="single"
				mode="date"
				inputType="calendar"
				outputType="string"
				minDate="${this.accountOpenDate.toString()}"
				maxDate="${this.maxDate}"
				@value-changed="${e => this._customMonthSelected(e)}">
			</horizon-month-calendar>

			${this._renderSelectedCustomMonths()}
		`;
	}

	_renderSelectedCustomMonths() {
		return this.selectedCustomMonths.length > 0
		? html`
			<capitec-group 
				class="chip-group" 
				layout="horizontal" 
				wrap="true">
					<capitec-label class="filter-label" label = "Active filters:"></capitec-label>
					${this.selectedCustomMonths.map(item => this._renderChips(item))}
			</capitec-group>`
		: html``;
	}

	_renderChips(item) {
		return html`
			<capitec-chip
				label="${this._getChipLable(item)}"
				@remove="${() => this._clearFilter(item)}"
				closable>
			</capitec-chip>
		`;
	}
}

window.customElements.define(`horizon-month-period-selector`, MonthPeriodSelector);