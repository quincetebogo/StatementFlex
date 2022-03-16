import { Component, css, html } from 'platform/elements';
import { Router } from 'platform/core';

class InsureBenefits extends Component {

	constructor() {
		super();
		this._router = Router.getInstance();
	}

	_back() {
		this._router.navigateByPath(`/landing`);
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
				#insure-header{
					display: flex;
					width: 100%;
					justify-content: space-between;
					padding: 10px;
					color: #FFF;
					background: linear-gradient(315deg, #70838C 0%, #667F8C 47.52%, #41525B 100%);
				}

				.beneficiary-card{
					display: flex;
					justify-content: start;
					gap: 60px;
					border-radius: 5px;
					padding: 20px;
					border: 1px solid lightgray;
				}

			`
		];
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
				<capitec-label label="Benefits" type="title"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button label="View Benefits" type="white"></capitec-button>
			</capitec-title-bar>
			<capitec-card style="padding: 20px;">
		
				<div class="beneficiary-card">
					<capitec-group layout="vertical" valign="center" halign="left" gap="none"
						style="border-right: 1px solid lightgray; padding-right: 20px;">
						<capitec-label type="subtitle" label="Benefit type">
						</capitec-label>
						<capitec-label type="strong" class="label" label="?????"></capitec-label>
					</capitec-group>
		
					<capitec-group layout="vertical" valign="center" halign="left" gap="none">
						<capitec-label type="subtitle" label="Reason">
						</capitec-label>
						<capitec-label type="strong" class="label" label="?????"></capitec-label>
					</capitec-group>
		
					<capitec-group layout="vertical" valign="center" halign="left" gap="none">
						<capitec-label type="subtitle" label="Effective date">
						</capitec-label>
						<capitec-label type="strong" class="label" label="?????"></capitec-label>
					</capitec-group>
		
					<capitec-group layout="vertical" valign="center" halign="left" gap="none">
						<capitec-label type="subtitle" label="End date">
						</capitec-label>
						<capitec-label type="strong" class="label" label="?????"></capitec-label>
					</capitec-group>
		
					<capitec-group layout="vertical" valign="center" halign="left" gap="none">
						<capitec-label type="subtitle" label="Status">
						</capitec-label>
						<capitec-label type="strong" class="label" label="?????"></capitec-label>
					</capitec-group>
				</div>
			</capitec-card>
		</capitec-content-box>

		
		`;
	}
}

window.customElements.define(`view-insure-benefits`, InsureBenefits);