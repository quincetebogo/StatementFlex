import { Component, css, html } from 'platform/elements';

class InsureEmailPlanModal extends Component {

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`cancelSend`, {}));
	}

	_onSendClick() {
		this.dispatchEvent(new CustomEvent(`confirmSend`, {}));
	}

	static get styles() {
		return [
			super.styles,
			css`
				.modal-body-label{
					padding: 10px 10px 10px 10px;
					font-weight: bold;
				}

				.modal-body-textfield{
					padding: 10px 10px 10px 10px;
				}

			`
		];
	}

	_renderBody() {
		return html`
		<capitec-label type="subtitle" label="Enter email address" class="modal-body-label">
		</capitec-label>
		<capitec-text-field class="modal-body-textfield" id="email" data-automation-id="???" label="Email address"
			oncopy="return false" onpaste="return false" oncut="return false" value="${this.email}">
		</capitec-text-field>
		</capitec-text-field>
		<capitec-label class="modal-body-label" type="subtitle" label="Confirm email address">
		</capitec-label>
		<capitec-text-field class="modal-body-textfield" id="confirmEmail" data-automation-id="???" label="Email address"
			oncopy="return false" onpaste="return false" oncut="return false" value="${this.confirmEmail}">
		</capitec-text-field>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button data-automation-id="stop-card-confirm-cancel" label="Cancel"
					@click="${() => this._onCancelClick()}">
				</capitec-button>
			
				<capitec-button data-automation-id="stop-card-confirm-confirm" id="id-confirm-button" type="primary" label="Send"
					@click="${() => this._onSendClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

	_webTemplate() {
		return html`
		<capitec-modal data-automation-id="????" type="form" style="font-weight: bold;" header="Email funeral plan (????)"
			header-align="left">
			<div slot="body" class="modal-body">
				${this._renderBody()}
			</div>
			<div slot="footer">
				${this._renderFooter()}
			</div>
		</capitec-modal>`;
	}
}

window.customElements.define(`insure-email-plan-modal`, InsureEmailPlanModal);