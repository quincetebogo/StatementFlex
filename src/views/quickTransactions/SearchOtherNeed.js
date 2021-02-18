import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/dialogs/common/EndCallSession';
/**
 * Search Other Need component
 *
 * Events Raised
 * -------------
 * back
 * 
 * @export
 * @class SearchOtherNeed
 * @extends {View}
 */

 export class SearchOtherNeed extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.solutionDisplay = false;
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.someObject = { code: 'AL', text: 'Alabama' };
this.dataObjects = [
	this.someObject,
	{ code: 'AK', text: 'Alaska' },
	{ code: 'OK', text: 'Oklahoma' },
	{ code: 'NM', text: 'New Mexico' },
	{ code: 'NY', text: 'New York' },
	{ code: 'TX', text: 'Texas' },
	{ code: 'TN', text: 'Tennessee' },
	{ code: 'NJ', text: 'New Jersey' }
];

	}
	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} searchOtherNeed Contains list of other needs
	 *
	 * @readonly
	 * @static
	 * @memberof SearchOtherNeed
	 */
	static get properties() {
		return {
			searchOtherNeed: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		//initate back to favourite transactions page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}
// ---------
	// RENDERING
	// ---------
	
	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				.other-need {
					height: 888px;
					width: 1064px;
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					border-radius: 5px;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				capitec-card > capitec-group:first-child {
					--theme-layout-gap-spacing: 0px;
				}
				capitec-title-bar {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-padding: 0px 0px 0px 16px;
				}
				capitec-title-bar > capitec-icon {
					cursor: pointer;
					margin-right: 34px;
				}
				.otherneed-action-bar {
					height: 56px;
					--theme-actionbar-padding: 4px 16px 4px 16px;
					--theme-actionbar-min-height: 56px;
					--theme-actionbar-item-gap: 8px;
				}
				.otherneed-action-bar > capitec-text-field {
					height: 49px;
					width: 333px;
					--theme-input-label-font-color: #969B9D;
				}
				.otherneed-action-bar > capitec-select {
					height: 49px;
					width: 333px;
					--theme-input-label-font-color: #969B9D;
				}
				/* No Results CSS */
				.search-icon {
					margin-top: 282px;
				}
				.find-need {
					margin-top: 13px;
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
			`
		];
	}
	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="other-need">
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
				${this._renderTitleBar()}
				${this._renderActionBar()}
					<capitec-content-box>
						${this._renderNoResults()}
					</capitec-content-box>
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar type="default">
				<capitec-icon 
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Other Need" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	// render search 
	_renderActionBar() {
		//add if statement to render next text boxes/drop downs
		return html`
			<capitec-action-bar class="otherneed-action-bar">
				<capitec-text-field 
					label="Search client need"
					type="search"
					keyboardMode="alpha-numeric"
					@input="${(e) => this._filterByText(e)}"
					@value-changed="${(e) => this._filterByText(e)}">
				</capitec-text-field>
				<capitec-select 
					label="Choose specific need" 
					.items="${this.dataObjects}"
					display-field="text"
					id-field="code"
					.value="Search specific need"
					searchable>
				</capitec-select>
				<capitec-select 
					label="Choose issue type" 
					.items="${this.dataObjects}"
					display-field="text"
					id-field="code"
					.value="Search specific need"
					searchable>
				</capitec-select>
			</capitec-action-bar>
		`;
	}

	_renderNoResults() {
		/* if (this._hasIncidentToDisplay()) {
			return html ``;
		} */
		if (this.solutionDisplay){
			return html`
			<capitec-group layout="vertical" halign="center" valign="top" gap ="none">
				<img src="/images/common/search.svg" class="search-icon"/>
				<capitec-label 
					class="find-need"
					label="Find other need"
					type="strong"></capitec-label>
			</capitec-group>
			`;
		}
		else {
				return html`
				<capitec-group layout="vertical" halign="center" valign="top" gap ="none">
				<img src="/images/common/search.svg" class="search-icon"/>
				<capitec-label 
					class="find-need"
					label="Find other need"
					type="strong"></capitec-label>
				</capitec-group>
				`;
		}
	}
 }
 
customElements.define(`search-other-need`, SearchOtherNeed);