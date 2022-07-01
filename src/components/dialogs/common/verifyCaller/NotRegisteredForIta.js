import { Component, css, html } from 'platform/elements';

export class NotRegisteredForIta extends Component {
	// ----------
	// PROPERTIES
	// ----------
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
				#notification-status-box > capitec-group > horizon-alert-banner {
					--theme-toast-horizontal-title-margin-right: 4px;
				}
				.notification-info {
					color: #545D60;
					font-family: "Hind Vadodara Regular";
					text-align: center;
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
					margin-bottom: 18px;
					text-align: center;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group layout="vertical" halign="stretch" valign="top" gap="clear">
					<horizon-alert-banner
						type="warning"
						header="Notify: "
						label="The client isn't registered for Remote Banking.">
					</horizon-alert-banner>
					<capitec-group layout="vertical" 
						halign="center"
						valign="top" 
						gap="clear"
						id="notification-status-error-group">
						<img src="/images/verifyCaller/verifyClient.svg" class="remote-connection-warning-svg"/>
						<div class="notification-info">
							<b>Verify client</b>
							<br>
							I will now ask you a few security questions to access your account.
							<br>
							These questions relate to your personal profile and only you will know the correct answers.
						</div>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}

}

window.customElements.define(`horizon-not-registered-for-ita`, NotRegisteredForIta);