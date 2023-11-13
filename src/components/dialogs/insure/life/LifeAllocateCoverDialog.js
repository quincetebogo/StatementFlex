import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { LIFE_POCKET_TYPES } from 'app/constants/InsureCommon';
import { formatCurrency } from 'app/productControls/utilities/Currency';

/**
 * @export
 * @class LifeAllocateCoverDialog
 * @extends {Component}
 */
class LifeAllocateCoverDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		this.isNewOffer = false;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			isNewOffer: { type: Boolean, state: true }
		};
	}

	// #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES


	// #region PRIVATE METHODS

	_calculatePocketInstalment(type) {
		const pocket = this.policy.pockets.find(p => p.pocketType === type);
		return pocket.premium;
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * back event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_backClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`, {}));
	}

	// #endregion EVENT HANDLERS

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
				${INSURE_CSS}
			
				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
				}

				#offer-details{
					min-height: 100px; 
					width: 100%;
					display: flex; 
					justify-content: space-evenly; 
					align-items: center;
					padding-bottom: 10px;
				}

				.offer-details-cell{
					text-align: center;
				}

				.offer-details-value{
					font-weight: bold;
					font-size: 20px;
				}

				#split-money{
					width: 100%;
					border-top: 1px solid lightgrey;
					padding-top: 20px;
				}

				#pocket-details{
					background-color: #FAF9FF;
					width: 100%;
					padding: 15px 15px 5px 15px;
					margin-top: 20px;
					border-radius: 16px;
					border: 1px solid #E1E1E1;
					display: flex;
					flex-direction: column;
				}

				.pocket-details-card{
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					box-shadow: 0px 1px 3px 0px #00000026;
					background-color: #FFF;
					padding: 14px 24px;
					border-radius:  5px;
					margin-bottom:15px;
				}

				.pocket-details-input{
					width: 180px;
				}

				.pocket-details-label{
					margin-right: 15px;
				}

				`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-modal type="form" header="Allocate Money" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto; z-index: 4000;">
				<div slot="body" style="width: 1000px; padding-top:0px;">
					${this._renderDialogBody()}
				</div>
				<div slot="footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
			<div id="offer-details">
				${this.isNewOffer === true ? html`
					<div class="offer-details-cell">
						<div>New offer cover amount</div>
						<div class="offer-details-value">${formatCurrency(3000000)}</div>
					</div>
				` : html``}
				<div class="offer-details-cell">
					<div>Current cover amount</div>
					<div class="offer-details-value">${formatCurrency(2000000)}</div>
				</div>
				<div class="offer-details-cell">
					<div>Available</div>
					<div class="offer-details-value">${formatCurrency(2000000)}</div>
				</div>
				<div class="offer-details-cell">
					<div>Remaining</div>
					<div class="offer-details-value">${formatCurrency(1000000)}</div>
				</div>
			</div>
			<!-- <div id="split-money">
				<capitec-toggle label="Split the amount equally between pockets"></capitec-toggle>
			</div> -->
			<div id="pocket-details">
				<div class="pocket-details-card">
					<div>
						<capitec-icon icon="/insure_monthly_pocket" size="large"></capitec-icon>
						<!-- <capitec-label type="strong"
							class="pocket-type-label ${pocketBadgeColorClass(pocketItem?.pocketType)}"
							.label="${pocketBadgeLabel(pocketItem?.pocketType)}">
						</capitec-label> -->
					</div>
					<div style="display: flex;">
						<capitec-text-field class="pocket-details-input pocket-details-label" label="Cover amount"></capitec-text-field>
						<horizon-label
							class="pocket-details-label"
							label="You pay"
							value="${formatCurrency(this._calculatePocketInstalment(LIFE_POCKET_TYPES.MONTHLY))}">
						</horizon-label>
						<capitec-text-field class="pocket-details-input" label="They get"></capitec-text-field>
					</div>
				</div>
				<div class="pocket-details-card">
					<capitec-icon icon="/insure_once_off_pocket" size="large"></capitec-icon>
					<div style="display: flex;">
						<horizon-label
							class="pocket-details-label"
							label="You pay"
							value="${formatCurrency(this._calculatePocketInstalment(LIFE_POCKET_TYPES.ONCEOFF))}">
						</horizon-label>
						<capitec-text-field class="pocket-details-input" label="They get"></capitec-text-field>
					</div>
				</div>
				<div class="pocket-details-card">
					<capitec-icon icon="/insure_education_pocket" size="large"></capitec-icon>
					<div style="display: flex;">
						<horizon-label
							class="pocket-details-label"
							label="You pay"
							value="${formatCurrency(this._calculatePocketInstalment(LIFE_POCKET_TYPES.EDUCATION))}">
						</horizon-label>
						<capitec-text-field class="pocket-details-input" label="They get"></capitec-text-field>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button class="capitec-button-small" slot="footer" type="clear" label="Back" @click="${() => this._backClick()}"></capitec-button>
				<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Save" ></capitec-button>
		`;
	}

	// #endregion RENDERING


}

window.customElements.define(`horizon-insure-life-allocate-cover-dialog`, LifeAllocateCoverDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-allocate-cover-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-allocate-cover-dialog>
 *
 * @event LifeAllocateCoverDialog#close-modal
 * @type {Object} - N/A
 */