import { Component, css, html } from 'platform/elements';

class InsureEmailPlanSuccess extends Component {

	static get styles() {
		return [
			super.styles,
			css`
				.plan-sent-card{
					min-height: 100vh;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 20px;
				}

				.title{
					font-weight: bold;
				}
			`
		]
	}

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_webTemplate() {
		return html`
		<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear">
			<capitec-card class="plan-sent-card">
				<div>
					<capitec-image src="platform/illustrations/send-documents.svg"></capitec-image>
				</div>
				<capitec-label type="title" class="title" label="Funeral plan sent"></capitec-label>
		
				<div>
					<capitec-icon size="small" icon="status/success" style="display: inline-block;"></capitec-icon>
					<span>Your funeral plan document for policy number ?????? has been emailed to ??????</span>
				</div>
		
				<capitec-group layout="horizontal">
					<capitec-button data-automation-id="stop-card-confirm-cancel" @click="${() => this._back()}"
						label="View Plan">
					</capitec-button>
					<capitec-button data-automation-id="stop-card-confirm-confirm" @click="${() => this._back()}"
						id="id-confirm-button" type="primary" label="Done">
					</capitec-button>
				</capitec-group>
			</capitec-card>
		</capitec-content-box>`;
	}
}

window.customElements.define(`insure-email-plan-success`, InsureEmailPlanSuccess);