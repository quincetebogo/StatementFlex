import { Component, css, html, live } from 'platform/elements';
import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/dialogs/common/EndCallSession';

/**
 * Search Other Need component
 *
 * Events Raised
 * -------------
 * back
 * done
 * 
 * @export
 * @class SearchOtherNeed
 * @extends {Component}
 */

export class SearchOtherNeed extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Private properties
		this.isBusy = false;
		this.renderMode = -1;

		// Private Variables
		this.category = ``;
		this.need = ``;
		this.issue = ``;
		this.solution = ``;
		this.categories = null;
		this.needs = null;
		this.issues = null;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 *
	 * @readonly
	 * @static
	 * @memberof SearchOtherNeed
	 */
	static get properties() {
		return {

			renderMode: { attribute: false },
			isBusy: { attribute: false },
			category: { attribute: false },
			need: { attribute: false },
			issue: { attribute: false },
			solution: { attribute: false },
			categories: { type: Array },
			needs: { type: Array },
			issues: { type: Array }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._loading();
		this.issuesWithSolution = this.issues;
		this.issues = this.issues.map(item => item.issue);

	}

	disconnectedCallback() {
		this._unloading();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		// initate back to favourite transactions page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}
	

	_categoryChanged(e) {
		if (e.detail.new !== null) {
			this.category = e.detail.new;
			this.need = ``;
			this.issue = ``;
			this.solution = ``;
			
			this.dispatchEvent(new CustomEvent(`get-sub-categories`, { detail: { category: this.category } }));
		}
	}

	_subCategoryChanged(e) {
		if (e.detail.new !== null) {
			this.need = e.detail.new;
			this.issue = ``;
			this.solutionDisplay = false;

			this.dispatchEvent(new CustomEvent(`get-issues`, { detail: { category: this.category, need: this.need } }));
		}
	}

	_issueChanged(e) {
		this.issue = e.currentTarget.value.issue;
		this.solution = this.issues.find(item => item.issue === this.issue).solution;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_loading() {
		this.dispatchEvent(new CustomEvent(`loading`));
	}

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	_launchStrack() {
		this.dispatchEvent(new CustomEvent(`launch-strack`, { detail: { category: this.category, need: this.need, issue: this.issue } }));
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
					height: var(--horizon-panel-height, 888px);
					width: var(--horizon-center-panel-width, 1064px);
					--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
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
					margin-right: 15px;
				}
				capitec-group > capitec-title-bar {
					--theme-titlebar-min-height: 33px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
					--theme-layout-gap-spacing: 0px;
					--theme-layout-gap-line-color: none;
				}
				capitec-content-box {
					height: 655px;
				}
				.otherneed-action-bar {
					height: 56px;
					--theme-actionbar-padding: 8px 16px 8px 16px;
					--theme-actionbar-min-height: 64px;
					--theme-actionbar-item-gap: 15px;
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
				#id-button-group {
					justify-content: right;
					padding: 16px;
				}
				#button-right {
					margin-right: 16px;
				}
				.solution-heading {
					--theme-label-subtitle-font-color: #3E4547;
					--theme-label-subtitle-font-size: 16px;
					--theme-label-subtitle-font-weight: 600;
 					letter-spacing: 0;
 					line-height: 20px;
				}
				.solution-content {
					line-height: 20px;
					--theme-label-default-font-color: #3A3A3A;
					--theme-label-default-font-size: 15px;
					letter-spacing: 0;
				}
				.strack-solution-content {
					display: inline;
					line-height: 20px;
					--theme-label-default-font-color: #3A3A3A;
					--theme-label-default-font-size: 15px;
					letter-spacing: 0;
				}
				.bullet-group {
					margin-left: 20px;
				}
				/* No Results CSS */
				.find-need-image-group {
					margin-top: 92px;
				}
				.find-need {
					--theme-layout-gap-spacing: 13px;
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-strong-font-color: #3A3A3A;
				}
				.strack-button {
					padding-right: 16px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderOtherNeeds()}
			${this._renderLoadingIndicator()}
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	_renderOtherNeeds() {
		return html`
			<capitec-card class="other-need">
				${this._renderTitleBar()}

				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
					${this._renderActionBar()}
				</capitec-group>
				
				<capitec-group layout="vertical" gap="line" halign="center" valign="center">
					${this._renderNoResults()}
				</capitec-group>
				
				<capitec-group layout="vertical" gap="line" halign="right" valign="bottom">
					${this._renderSolution()}
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
				<capitec-label
					label="Other Need"
					type="title">
				</capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderActionBar() {
		return html`
			<capitec-action-bar class="otherneed-action-bar">
				<capitec-select
					label="Search client need"
					.items="${this.categories}"
					display-field="category"
					id-field="category"
					value="${live(this.category)}"
					?hidden="${false}"
					@value-changed="${(e) => this._categoryChanged(e)}"
					searchable>
				</capitec-select>

				<capitec-select
					label="Choose specific need"
					.items="${this.needs}"
					display-field="need"
					id-field="need"
					value="${live(this.need)}"
					?hidden="${isNullorEmpty(this.category)}"
					@value-changed="${(e) => this._subCategoryChanged(e)}"
					searchable>
				</capitec-select>
				
				<capitec-select
					label="Choose issue type"
					.items="${this.issues}"
					display-field="issue"
					id-field="issue"
					value="${live(this.issue)}"
					?hidden="${isNullorEmpty(this.need)}"
					@value-changed="${(e) => this._issueChanged(e)}"
					searchable>
				</capitec-select>
			</capitec-action-bar>
		`;
	}

	_renderSolution() {
		return !isNullorEmpty(this.solution) 
			? html`
				<capitec-title-bar
					type="default"
					label="Solution">
				</capitec-title-bar>

				<capitec-content-box>
					<capitec-label
						class="solution-heading"
						type="default"
						label="${this.solution}">
					</capitec-label>
				</capitec-content-box>
				
				<capitec-group layout="vertical" gap="line" halign="right" valign="bottom">
					<capitec-button
						class="strack-button"
						type="primary"
						label="Launch STrack"
						@click="${() => this._launchStrack()}">
					</capitec-button>
				</capitec-group>`
			: html``;
	}

	_renderNoResults() {
		return isNullorEmpty(this.solution)
			? html`
				<capitec-group
					class="find-need-image-group"
					layout="vertical"
					halign="center"
					valign="center"
					gap="clear">
						<img 
							src="/images/common/search.svg"
							class="search-icon" />
						<capitec-label
							class="find-need"
							label="Find other need"
							type="strong">
						</capitec-label>
						<capitec-label
							class="find-need-second"
							label="Search a client need not currently on Horizon"
							type="strong">
						</capitec-label>
				</capitec-group>`
			: html``;
	}
}

customElements.define(`horizon-search-other-need`, SearchOtherNeed);