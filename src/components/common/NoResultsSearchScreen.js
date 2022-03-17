import { Component, css, html } from 'platform/elements';

/**
 * Generic screen for a search that returns no results. 
 * 
 * @export 
 * @class NoResultsSearch
 * @extends {Component}
 */
export class NoResultsSearchScreen extends Component {

	// --------------
	// INITIALISATION
	// --------------
	
	constructor() {
		super();

		this.label = `No Results Found`;
		this.imageSource = `platform/illustrations/history.svg`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
	}

	// ----------
	// PROPERTIES
	// ----------
	
	/**
	 * @property {String} [label=`No Results Found`] (Optional) Text used in the label that is displayed
	 * @property {String} [imageSource=`platform/illustrations/history.svg`] (Optional) Path to the image wanted to display 
	 * 
	 * @readonly
	 * @static
	 * @memberof NoResultsSearch
	 */
	static get properties() {
		return {
			label: { type: String },
			imageSource: { type: String }
		};
	}
	
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.no-result-group {
					width: 1062px;
					margin-top: 130px;
				}
			`
		];
	}

	_webTemplate() {
		return html`
			<capitec-group
				class="no-result-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<img
						src=${this.imageSource}
						class="document-icon"/>
				<capitec-label
					class="no-results"
					label=${this.label}
					type="strong">
				</capitec-label>
			</capitec-group>
		`;
	}
}

window.customElements.define(`horizon-no-results-search-screen`, NoResultsSearchScreen);