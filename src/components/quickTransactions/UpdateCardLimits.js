import { Component, css, html } from 'platform/elements';

import 'app/components/common/CardArt';

/**
 * This component implements the update card limits for Quick Transactions
 *
 * Events Raised 
 * -------------
 * back
 * 
 * @export
 * @class UpdateCardLimits
 * @extends {Component}
 */
export class UpdateCardLimits extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// private properites
		this.primaryCards = [];
		this.supplementaryCards = [];
		this.virtualCards = [];
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 *
	 * @property {Object} cards Object contains the list of client's card
	 *
	 * @readonly
	 * @static
	 * @memberof UpdateCardLimits
	 */
	static get properties() {
		return {
			cards: { type: Object }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.primaryCards = this.cards.filter(card => card.isSupplementaryCard == false);
		this.supplementaryCards = this.cards.filter(card => card.isSupplementaryCard == true && card.isContactlessCard == false);
		this.virtualCards = this.cards.filter(card => card.isSupplementaryCard == true && card.isContactlessCard == true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// N/A

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
				.center-section {
					height: 888px;
					width: 1064px;
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					border-radius: 5px;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				capitec-title-bar > capitec-icon {
					cursor: pointer;
					margin-right: 34px;
				}
				.cards-list-cb {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
				}
				.card-title {
					line-height: 24px;
					margin-left: 8px;

					--theme-label-default-font-size: 24px;
					--theme-label-default-font-weight: 600;
					--theme-label-font-color: #3E4547;
				}
				.cards-list-cb > capitec-group, .supplementary-cards-group, .virtual-cards-group {
					--theme-layout-gap-spacing: 16px;
				}
				.card-group, .supplementary-virtual-cards {
					--theme-layout-gap-spacing: 24px;
				}
				horizon-card-art {
					width: 330px;
					height: 305px;
					background-color: #FFFFFF;
				}
			`
		]
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card class="center-section">
				${this._renderTitleBar()}
			
				<capitec-content-box class="cards-list-cb">
					<capitec-group layout="vertical" halign="left" valign="top" gap="clear">
						${this._renderPrimaryCardGroup()}

						<capitec-group class="supplementary-virtual-cards"
									   layout="horizontal"
									   halign="left"
									   valign="top"
									   gap="clear">
								${this._renderSupplementaryCardGroup()}
								${this._renderVirtualCardGroup()}
						</capitec-group>

					</capitec-group>
				</capitec-content-box>

			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="title-bar">
				<capitec-icon 
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Update Card Limits" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderPrimaryCardGroup() {
		return html`
			<!-- Primary Card title -->
			<capitec-label label="Primary card" type="strong" class="card-title">
			</capitec-label>
			<!-- Primary Card Group Rendering -->
			<capitec-group class="card-group"
						   valign="top"
						   halign="left"
						   gap="clear"
						   layout="horizontal"
						   grow="horizontal">
				${this._renderPrimaryCards()}
			</capitec-group>
		`;
	}

	_renderPrimaryCards() {
		return this.primaryCards.map((card, index) => {

			return html`
				<horizon-card-art id="primaryCard-widget-${index}"
								  .card="${card}">
				</horizon-card-art>
			`;
		})
	}

	_renderSupplementaryCardGroup() {
		return html`
			<capitec-group class="supplementary-cards-group"
						   layout="vertical"
						   halign="left"
						   valign="top"
						   gap="clear">
				<!-- Supplementary Card title -->
				<capitec-label label="Supplementary cards" type="strong" class="card-title"></capitec-label>
				
				<!-- Supplementary Card Group Rendering -->
				<capitec-group class="card-group"
							   layout="horizontal"
							   halign="left"
							   valign="top"
							   gap="clear"
							   grow="horizontal">
					${this._renderSupplementaryCards()}
				</capitec-group>
			</capitec-group>
		`;
	}

	_renderSupplementaryCards() {
		return this.supplementaryCards.map((card, index) => {

			return html`
				<horizon-card-art id="supplementaryCard-widget-${index}"
								  .card="${card}">
				</horizon-card-art>
			`;
		})
	}

	_renderVirtualCardGroup() {
		return html`
			<capitec-group class="virtual-cards-group"
						   layout="vertical"
						   halign="left"
						   valign="top"
						   gap="clear">
				<!-- Virtual Card title -->
				<capitec-label label="Virtual card" type="strong" class="card-title"></capitec-label>
				
				<!-- Virtual Card Group Rendering -->
				<capitec-group class="card-group"
							   layout="horizontal"
							   halign="left"
							   valign="top"
							   gap="clear"
							   grow="horizontal">
					${this._renderVirtualCards()}
				</capitec-group>
			</capitec-group>
		`;
	}

	_renderVirtualCards() {
		return this.virtualCards.map((card, index) => {

			return html`
				<horizon-card-art id="virtualCard-widget-${index}"
								  .card="${card}">
				</horizon-card-art>
			`;
		})
	}
}

customElements.define(`horizon-update-card-limits`, UpdateCardLimits);