import { Component, css, html } from 'platform/elements';


export class XdsAttemptFailed extends Component {

	static get properties() {
		return {
			canPush: { type: Boolean }
		};
	}
	
	static get styles() {
		return [
			super.styles,
			css`

			#notification-status-box {
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 17px;
					--theme-container-padding-bottom: 12px;
					--theme-container-padding-left: 16px;
					--theme-container-margin-bottom: 0px;
					height: auto;
				}
				#notification-status-box > capitec-group {
					--theme-layout-gap-spacing: 16px;
				}
				#notification-status-group > capitec-label {
					line-height: 24px;
					margin: 0;
					margin-bottom: 30px;

					--theme-label-title-font-size: 15px;
				}
				#notification-status-error-group > capitec-label {
					line-height: 24px;
					margin: 0;
					margin-bottom: 26px;

					--theme-label-title-font-size: 15px;
				}
				.connection-error-svg {
					height: 152px;
					width: 210px;
					margin: 18px 0px 13px 0px;
				}
				.notification-info {
					color: #545D60;
					font-family: "Hind Vadodara Medium";
					text-align: center;
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin-bottom: 10px;
				}
			`
		];
	}


	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate () {
		return html`
		<capitec-content-box id="notification-status-box">
			<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
				<horizon-alert-banner
					type="warning"
					header="Notify client: "
					label="You didn't pass the security questions.">
				</horizon-alert-banner>
				<capitec-group layout="vertical" 
					halign="center"
					valign="top" 
					gap="clear"
					id="notification-status-error-group">
					<img src="/images/warning.svg" class="warning-svg connection-error-svg"/>
					<div class="notification-info">
						Your first attempt was unsuccessful. <br>
						${this.canPush 
							? html`You can try again or verify by accepting the push notification.` 
							: html`You can try security questions again or skip verification`
						}
					</div>
				</capitec-group>
			</capitec-group>
		</capitec-content-box>`;
	}
}

window.customElements.define(`horizon-xds-attempt-failed`, XdsAttemptFailed);