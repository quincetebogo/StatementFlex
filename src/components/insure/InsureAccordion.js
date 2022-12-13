import { Component, css, html } from 'platform/elements';

class InsureAccordion extends Component {

	
	// #region INITIALISATION

	constructor() {
		super();
		this.expanded = false;
	}

	// #endregion INITIALISATION

	// #region PROPERTIES

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {Object} policy - Policy details
	 * @property {Boolean} inArrears - Policy details
	 * @property {Object} cardOptions - 
	*/
	static get properties() {
		return {
			policy: { type: Object },
			inArrears: { type: Boolean },
			cardOptions: { type: Object }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @ignore
	 * @returns {void}
	 */
	connectedCallback() {
		// Ensure the component is setup correctly.
		super.connectedCallback();

		// Listen for child label change events.
		this.addEventListener(`animationend`, this._animationCompleted);
	}

	/**
	 * Clean-up the component once removed from the DOM.
	 * @ignore
	 * @returns {void}
	 */
	disconnectedCallback() {
		// Stop listening for child label change events.
		this.removeEventListener(`animationend`, this._animationCompleted);

		// Ensure the component is cleaned up correctly.
		super.disconnectedCallback();
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS

	/**
	 * Handles component click events.
	 * @ignore
	 * @param {MouseEvent} event - The event details.
	 * @returns {void}
	 */
	_clickExpander(event) {
		// Prevent the event from bubbling up.
		event.stopPropagation();

		// Ignore the click event if the item is disabled.
		if (this.disabled) {
			return;
		}

		// Toggle the expanded state of the item.
		if (this.expanded) {
			this.collapse();

		} else {
			this.expand();
		}
	}

	/**
	 * Cleans up component animations upon completion.
	 *
	 * @ignore
	 * @param {AnimationEvent} event - The event details.
	 * @returns {void}
	 */
	_animationCompleted() {
		// Remove the expanding animation, if set.
		if (this.hasAttribute(`expanding`)) {
			this.removeAttribute(`expanding`);
			this.expanded = true;
		}

		// Remove the collapsing animation, if set.
		if (this.hasAttribute(`collapsing`)) {
			this.removeAttribute(`collapsing`);
			this.expanded = false;
		}
	}

	// #endregion EVENT HANDLERS 

	// #region PUBLIC METHODS

	/**
	 * Expand the item to show it's content.
	 *
	 * @fires expand When the item is expanded.
	 * @returns {void}
	 */
	expand() {
		// Ignore the request to expand if the component is already expanded.
		if (this.expanded === true || this.hasAttribute(`expanding`)) {
			return;
		}

		// Trigger the expanding animation.
		this.removeAttribute(`collapsing`);
		this.setAttribute(`expanding`, ``);
	}

	/**
	 * Collapse the item to hide it's content.
	 *
	 * @fires expand When the item is collapsed.
	 * @returns {void}
	 */
	collapse() {
		// Ignore the request to collapse if the component is already collapsed.
		if (this.expanded === false || this.hasAttribute(`collapsing`)) {
			return;
		}

		// Trigger the collapsing animation.
		this.removeAttribute(`expanding`);
		this.setAttribute(`collapsing`, ``);
	}

	// #endregion PUBLIC METHODS

	// #region PRIVATE METHODS

	/**
	 * dispatch policy number click event
	 * @returns {void}
	 */
	_clickPolicyNumber() {
		this.dispatchEvent(new CustomEvent(`clickedViewPlan`, {}));
	}
	
	/**
	 * dispatch event for action card click
	 * @param {*} actionCard action card
	 * @returns {void}
	 */
	_clickActionCard(actionCard) {
		this.dispatchEvent(new CustomEvent(`clickedRouteCard`, { detail: { route: actionCard.route } }));
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
				.insure-accordion{
					width: 100%;
				}
				.overview{
					width: 100%;
					display: flex;
					justify-content: space-around;
					padding: 20px;

					border-left: 1px solid  rgba(191,186,186,0.35);
					border-right: 1px solid  rgba(191,186,186,0.35);
					border-top: 1px solid  rgba(191,186,186,0.35);
				}
				.details-container{
					width: 100%;
					background: whitesmoke;
					padding: 5px;
					box-shadow: 0px 2px 0px 0px rgba(191,186,186,0.25);
					-webkit-box-shadow: 0px 2px 0px 0px rgba(191,186,186,0.25);
					-moz-box-shadow: 0px 2px 0px 0px rgba(191,186,186,0.25);
					border-top: 1px solid  rgba(191,186,186,0.65);
				}
				.details{
					width: 100%;
					display: flex;
					justify-content: space-around;
					background: whitesmoke;
					padding: 15px;
					gap: 10px;
				}
				.action-card{
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 10px;
				}
				.label{
					font-weight: bold;
				}

				.status-good{
					color: #70af00;
				}

				.details-heading{
					padding:10px;
				}

				/** ANIMATIONS */

				:host {
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: stretch;
					width: var(--theme-expander-width, 100%);
					background-color: var(--theme-expander-background-color, white);
				}

				:host([expanded]) {
					max-height: unset;
					height: var(--theme-expander-height, 100%);
				}

				:host([expanded].styled) {
					box-shadow: var(--theme-expander-box-shadow, 0px 1px black);
				}

				:host([expanding].styled) {
					box-shadow: var(--theme-expander-box-shadow, 0px 1px black);
				}

				/** ANIMATIONS */

				:host([noanimate]) {
					animation-duration: 0s;
				}

				:host([expanding]) {
					animation: expand 0.5s;
					animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
					animation-fill-mode: forwards;
				}

				:host([expanding]) > .header > .indicator {
					transition: all 0.15s linear 0s;
					transform: rotate(180deg);
				}

				:host([collapsing]) > .header > .indicator {
					transition: all 0.15s linear 0s;
					transform: none;
				}

				:host([expanding]) > .content {
					transition: padding linear 0.2s;
					//padding-top: var(--theme-container-padding-top, 10px);
					//padding-bottom: var(--theme-container-padding-bottom, 10px);
				}

				:host([expanding],[noPadding]) > .content {
					transition: padding linear 0.2s;
					padding-top: var(--theme-container-no-padding-top, 0px);
					padding-bottom: var(--theme-container-no-padding-bottom, 0px);
				}

				:host([collapsing]) > .content {
					overflow: hidden;
				}

				/* Hide scrollbar for Chrome, Safari and Opera */
				:host([collapsing]) > .content::-webkit-scrollbar {
					display: none;
				}

				/* Hide scrollbar for IE and Edge */
				:host([collapsing]) > .content {
					-ms-overflow-style: none;
				}

				:host([collapsing]) {
					animation: collapse 0.5s;
					animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
					animation-fill-mode: forwards;
				}


				@keyframes expand {
					0% {
						max-height: var(--theme-expander-header-height, 50px);
						height: var(--theme-expander-header-height, 50px);
					}
					99% {
						max-height: var(--theme-expander-expanding-max-height, 100vh);
						height: var(--theme-expander-height, 200px);
					}
					100% {
						max-height: unset;
						height: var(--theme-expander-height, 200px);
					}
				}

				@keyframes collapse {
					0% {
						max-height: var(--theme-expander-height, 200px);
						overflow: hidden;
					}
					100% {
						max-height: var(--theme-expander-header-height, 50px);
						overflow: hidden;
					}
				}
			`
		];
	}

	/**
	 * Render the top (overview) section of the accordion
	 * @returns {html} The html content of the component.
	 */
	_renderOverviewSection() {
		return html`
		<div class="overview">
			${this._renderArrearsIndicator()}
		
			<capitec-group layout="vertical" valign="center" halign="left" gap="none">
				<capitec-label type="subtitle" label="Policy Number">
				</capitec-label>
				<capitec-hyperlink @click="${(e) => this._clickPolicyNumber()}" type="strong" label="${this.policy.policyNumber}"></capitec-hyperlink>
			</capitec-group>
		
			<capitec-group layout="vertical" valign="center" halign="left" gap="none">
				<capitec-label type="subtitle" label="Effective Date">
				</capitec-label>
				<capitec-label type="strong" class="label" label="${this.policy.effectiveDate}"></capitec-label>
			</capitec-group>
		
			<capitec-group layout="vertical" valign="center" halign="left" gap="none">
				<capitec-label type="subtitle" label="Debit Order Date">
				</capitec-label>
				<capitec-label type="strong" class="label" label="${this.policy.debitOrderDate}"></capitec-label>
			</capitec-group>
		
			<capitec-group layout="vertical" valign="center" halign="left" gap="none">
				<capitec-label type="subtitle" label="Cover Amount">
				</capitec-label>
				<capitec-label type="strong" class="label" label="R${this.policy.coverAmount}"></capitec-label>
			</capitec-group>
		
			<capitec-group layout="vertical" valign="center" halign="left" gap="none">
				<capitec-label type="subtitle" label="Total Premium">
				</capitec-label>
				<capitec-label type="strong" class="label" label="R${this.policy.totalPremium}"></capitec-label>
			</capitec-group>
		
			<capitec-group layout="vertical" valign="center" halign="left" gap="none">
				<capitec-label type="subtitle" label="Status">
				</capitec-label>
				<capitec-label type="strong" class="label ${this.policy.status === `Active` ? `status-good` : ``}"
					label="${this.policy.status}"></capitec-label>
			</capitec-group>
			<capitec-icon size="smaller" icon="system/chevron-down-action" @click="${(e) => this._clickExpander(e)}">
			</capitec-icon>
		</div>`;
	}

	/**
	 * Render the bottom (details) section of the accordion
	 * @returns {html} The html content of the component.
	 */
	_renderDetailsSection() {
		return html`
		<div class="details-container">
			<capitec-label type="Default" class="label details-heading" label="Choose an option"></capitec-label>
			<div class="details">
				${this.cardOptions.map(actionCard => html` 
					${this._renderActionCard(actionCard)}
				`)}
			</div>
		</div>`;
	}

	/**
	 * Render action card in accordion
	 * @param {Object} actionCard Options for card and submenus
	 * @returns {html} The html content of the component.
	 */
	_renderActionCard(actionCard) {
		if (actionCard.type === `menu`) {
			return html`
			<capitec-card class="action-card">
				<capitec-overflow-menu label="Menu">
					${actionCard.subMenu.map(subMenu => html`
						<capitec-overflow-menu-item icon="${subMenu.icon}" label="${subMenu.label}"></capitec-overflow-menu-item>
					`)}
				</capitec-overflow-menu>
			</capitec-card>`;
		}
		return html`
		<capitec-card elevated class="action-card" @click="${() => this._clickActionCard(actionCard)}" >
			<capitec-icon size="${actionCard.iconSize}" icon="${actionCard.icon}"></capitec-icon>
			<capitec-label type="Default" label="${actionCard.label}">
			</capitec-label>
		</capitec-card>`;
	}

	/**
	 * Renders an arrears icon if policy in arrears
	 * @returns {html} The html content of the component.
	 */
	_renderArrearsIndicator() {
		return html`<capitec-group layout="vertical" valign="center" halign="left" gap="none">
		${this.inArrears === true ? html`<capitec-icon size="medium" icon="system/info-action"></capitec-icon>` 
		: html`<span style="display: inline-block; width: 32px;"></span>`}
		</capitec-group>`;
	}

	/**
	 * Generates the component template for desktop mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<div class="insure-accordion">
				${this._renderOverviewSection()}
				${this._renderDetailsSection()}
			</div>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-accordion`, InsureAccordion);