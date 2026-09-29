import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

/**
 * A generic status tracker component for displaying sequential stages with completion states.
 * Renders a vertical timeline with completed, active, and upcoming stages.
 *
 * ```js
 * import 'app/components/common/HorizonStatusTracker';
 * ```
 *
 * ```html
 * <horizon-status-tracker 
 *    title="Track your claim"
 *    .stages="${stages}"
 *    .stageLabel="${(status) => this.getLabel(status)}">
 * </horizon-status-tracker>
 * ```
 *
 * @export
 * @class HorizonStatusTracker
 * @extends {Component}
 */
export class HorizonStatusTracker extends Component {
	// #region INITIALIZE

	constructor() {
		super();
		this.title = ``;
		this.stages = [];
		this.stageLabel = null;
		this.activeIndex = null;
		this.outstandingDocs = [];
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} title - The tracker title/heading.
	 * @property {Array} stages - Array of stage objects with structure:
	 *   { status: String, message: Array, isStageCompleted: Boolean }
	 * @property {Function} stageLabel - Callback function to convert status to display label.
	 *   Receives (status) and returns String. If not provided, status is used as-is.
	 * @property {Number} activeIndex - Optional override for active stage index.
	 *   If not set, activeIndex is auto-calculated from isStageCompleted flags.
	 * @property {Array} outstandingDocs - Array of outstanding documents to display when
	 *   active stage is CHECKING_DOCUMENTS. Structure: { documentCode: String, documentName: String, documentStatus: String }
	 *
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			title: { type: String },
			stages: { type: Array, state: true },
			stageLabel: { type: Function },
			activeIndex: { type: Number },
			outstandingDocs: { type: Array }
		};
	}

	// #endregion PROPERTIES

	// #region PRIVATE METHODS

	/**
	 * Calculate the active stage index.
	 * First incomplete stage, or last stage if all complete.
	 *
	 * @private
	 * @param {Array} stages - The stages array.
	 * @returns {Number} The active stage index.
	 */
	_getActiveIndex(stages) {
		if (this.activeIndex !== null && this.activeIndex !== undefined) {
			return this.activeIndex;
		}

		const firstIncompleteIndex = stages?.findIndex(stage => !stage?.isStageCompleted) ?? -1;

		if (firstIncompleteIndex < 0) {
			return (stages?.length ?? 1) - 1;
		}

		if (firstIncompleteIndex > 0 && !isNullorEmpty(stages[firstIncompleteIndex]?.message)) {
			return firstIncompleteIndex;
		}

		return firstIncompleteIndex;
	}

	/**
	 * Get the message to display for a given active index.
	 *
	 * @private
	 * @param {Array} stages - The stages array.
	 * @param {Number} activeIndex - The current active index.
	 * @returns {String} The message text, or empty string.
	 */
	_getMessage(stages, activeIndex) {
		const nextStage = stages?.[activeIndex];
		const activeStage = stages?.[activeIndex];

		if (!isNullorEmpty(nextStage?.message)) {
			return nextStage.message.join(` `);
		}

		if (!isNullorEmpty(activeStage?.message)) {
			return activeStage.message.join(` `);
		}

		return ``;
	}

	/**
	 * Get the display label for a stage status.
	 *
	 * @private
	 * @param {String} status - The stage status.
	 * @returns {String} The display label.
	 */
	_getStageLabel(status) {
		if (typeof this.stageLabel === `function`) {
			return this.stageLabel(status);
		}

		return `${status || ``}`;
	}

	/**
	 * Check if outstanding documents should be displayed.
	 *
	 * @private
	 * @param {Number} activeIndex - The current active stage index.
	 * @returns {Boolean} True if docs should be displayed.
	 */
	_shouldShowOutstandingDocs(activeIndex) {
		const activeStage = this.stages?.[activeIndex];
		return !isNullorEmpty(this.outstandingDocs) &&
			activeStage?.status === `CHECKING_DOCUMENTS`;
	}

	// #endregion PRIVATE METHODS

	// #region RENDERING

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
				:host {
					display: block;
					--tracker-success-color: var(--theme-status-success-background, #70AF00);
				}

				.tracker-section {
					padding: 16px 15px 8px;
				}

				.tracker-title {
					margin-bottom: 12px;
					--horizon-label-text-font-size: 16px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-text-color: #3A3A3A;
				}

				.tracker-card {
					background: #FFFFFF;
					border: 1px solid #E7E7E7;
					border-radius: 12px;
					padding: 18px 20px;
				}

				.tracker-step {
					display: flex;
					align-items: flex-start;
					gap: 14px;
				}

				.tracker-indicator-column {
					display: flex;
					flex-direction: column;
					align-items: center;
					align-self: stretch;
					flex: 0 0 18px;
				}

				.tracker-indicator {
					width: 18px;
					height: 18px;
					border-radius: 50%;
					border: 2px solid #D3D7D8;
					background: #FFFFFF;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.tracker-step.completed .tracker-indicator {
					background: var(--tracker-success-color);
					border-color: var(--tracker-success-color);
				}

				.tracker-step.active .tracker-indicator {
					border-color: var(--tracker-success-color);
				}

				.tracker-check {
					color: #FFFFFF;
					font-size: 11px;
					font-weight: 700;
					line-height: 1;
				}

				.tracker-check-active {
					color: var(--tracker-success-color);
					font-size: 11px;
					font-weight: 700;
					line-height: 1;
				}

				.tracker-line {
					width: 2px;
					min-height: 28px;
					background: #E5E5E5;
					margin: 4px 0;
				}

				.tracker-line-tail {
					flex: 1 1 auto;
				}

				.tracker-content {
					padding-bottom: 16px;
				}

				.tracker-label {
					color: #3A3A3A;
					font-size: 16px;
					font-weight: 600;
					line-height: 20px;
				}

				.tracker-step.upcoming .tracker-label {
					color: #C9C9C9;
				}

				.tracker-message-row {
					display: flex;
					align-items: center;
					gap: 10px;
					margin-top: 34px;
				}

				.tracker-message-dot {
					width: 18px;
					height: 18px;
					border-radius: 50%;
					background: var(--theme-alert-banner-warning-background-color, #F9EBDD);
					flex: 0 0 18px;
				}

				.tracker-message {
					color: #8A8F91;
					font-size: 14px;
					line-height: 18px;
				}

				.tracker-docs-section {
					margin-top: 16px;
				}

				.tracker-docs-list {
					list-style: none;
					padding: 0;
					margin: 0;
				}

				.tracker-doc-item {
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 10px 0;
					color: #5F7377;
					font-size: 14px;
					line-height: 18px;
				}

				.tracker-doc-dot {
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background: #B0B5B8;
					flex: 0 0 8px;
				}
			`
		];
	}

	/**
	 * Main render point for component.
	 *
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		if (isNullorEmpty(this.stages)) {
			return html``;
		}

		const activeIndex = this._getActiveIndex(this.stages);
		const activeMessage = this._getMessage(this.stages, activeIndex);
		return html`
			<div class="tracker-section">
				${!isNullorEmpty(this.title) ? html`
					<capitec-label class="tracker-title" label="${this.title}" type="default"></capitec-label>
				` : html``}

					${this.stages.map((stage, index) => {
			const isCompleted = stage?.isStageCompleted && index < activeIndex;
			const isActive = index === activeIndex;
			const isUpcoming = index > activeIndex;

			return html`
							<div class="tracker-step ${isCompleted ? `completed` : ``} ${isActive ? `active` : ``} ${isUpcoming ? `upcoming` : ``}">
								<div class="tracker-indicator-column">
									<div class="tracker-indicator">
										${isCompleted ? html`<span class="tracker-check">&#10003;</span>` :
					isActive ? html`<span class="tracker-check-active">&#10003;</span>` : html``}
									</div>
									${isActive && !isNullorEmpty(activeMessage) ? html`<div class="tracker-line"></div><span class="tracker-message-dot"></span>` : html``}
									${index < this.stages.length - 1 ? html`<div class="tracker-line tracker-line-tail"></div>` : html``}
								</div>
								<div class="tracker-content">
									<div class="tracker-label">${this._getStageLabel(stage?.status)}</div>
									${isActive && !isNullorEmpty(activeMessage) ? html`
										<div class="tracker-message-row">
											<span class="tracker-message">${activeMessage}</span>
										</div>
									` : html``}
									${isActive && this._shouldShowOutstandingDocs(activeIndex) ? html`
										<div class="tracker-docs-section">
											<ul class="tracker-docs-list">
												${this.outstandingDocs.map(doc => html`
													<li class="tracker-doc-item">
														<span>${doc?.documentName || doc?.documentCode || ``}</span>
													</li>
												`)}
											</ul>
										</div>
									` : html``}
								</div>
							</div>
						`;
		})}
			</div>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-status-tracker`, HorizonStatusTracker);

/**
 * @example
 * // Basic usage with default status labels
 * <horizon-status-tracker 
 *    title="Track your claim"
 *    .stages="${this.claimSummary?.claimTracking}"
 *    .outstandingDocs="${this.claimSummary?.outstandingDocs}">
 * </horizon-status-tracker>
 *
 * @example
 * // With custom label function
 * <horizon-status-tracker 
 *    title="Track your shipment"
 *    .stages="${this.shipmentStages}"
 *    .stageLabel="${(status) => this._getShipmentLabel(status)}"
 *    .outstandingDocs="${this.shipmentDocs}">
 * </horizon-status-tracker>
 *
 * @example
 * // With explicit active index override
 * <horizon-status-tracker 
 *    title="Process steps"
 *    .stages="${this.processStages}"
 *    .activeIndex="${2}"
 *    .outstandingDocs="${this.requiredDocs}">
 * </horizon-status-tracker>
 */