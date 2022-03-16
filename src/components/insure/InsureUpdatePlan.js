import { Component, css, html } from 'platform/elements';
import { Router } from 'platform/core';

class InsureUpdatePlan extends Component {

	constructor() {
		super();
		this._router = Router.getInstance();
	}

	_back() {
		this._router.navigateByPath(`/landing`);
	}

	_lodgeClaim() {
		this._router.navigateByPath(`/insure-lodge-claim`);
	}

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

			
			.notif-container{
				background: #daf2f4;
				padding: 15px;
				display: flex;
				justify-content: start;
			}
			.notif-container > .content {
				padding-left: 10px;
			}
			.notif-container > .content .title {
				font-weight: bold;
			}
			`
		];
	}

	/**
	 * Render Premium tab
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderPremiumTab() {
		return html`
		<capitec-tab label="Premium & Cover Amount">
			Premium & Cover Amount
		</capitec-tab>
		`
	}

	/**
	 * Render Beneficiaries tab
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderBeneficiariesTab() {
		return html`
			<capitec-tab label="Beneficiaries">
				Beneficiaries
			</capitec-tab>
			`
	}

	/**
	 * Render notification component for 'Your responsibility & our accountability'
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderYROANotification() {
		return html`
		<div class="notif-container">
			<div class="icon">
				<capitec-icon icon="status/info-trans" size="default"></capitec-icon>
			</div>
			<div class="content">
				<label class="title">Notify:</label>
				<label class="detail">
					I agree to
					<strong>Your Responsibility & Our Accountability</strong>
					agreement declaration
				</label>
			</div>
		</div>`
	}

	/**
	 * Render Beneficiaries tab
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDebitOrderTab() {
		return html`
			<capitec-tab label="Debit Order Details">
				${this._renderYROANotification()}
				<capitec-label type="subtitle" class="stronger" label="Collection Account" style="padding: 10px;">
				</capitec-label>
			</capitec-tab>
			`
	}

	/**
	 * Generates the component template for desktop mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-title-bar type="insure"
					style="margin-bottom: 0px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
					<capitec-icon size="title" icon="system/back-white" @click="${() => this._back()}" data-automation-id="????">
					</capitec-icon>
					<capitec-label label="Update Plan" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-button label="Email Plan" type="white"></capitec-button>
					<capitec-button label="Update Plan" type="white"></capitec-button>
				</capitec-title-bar>
				<capitec-card style="padding: 20px; min-height: 100vh;">
					<capitec-tab-group>
			
						${this._renderPremiumTab()}
						${this._renderBeneficiariesTab()}
						${this._renderDebitOrderTab()}
			
					</capitec-tab-group>
				</capitec-card>
			</capitec-content-box>`;
	}
}

window.customElements.define(`insure-update-plan`, InsureUpdatePlan);