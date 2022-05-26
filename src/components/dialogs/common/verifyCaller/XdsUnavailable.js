import { Component, css, html } from 'platform/elements';


export class XdsUnavailable extends Component {

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
				#notification-status-box > capitec-group > capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-info-border: none;
				}
				#notification-status-box > capitec-group > capitec-alert-banner[type="error"] {
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					--theme-alert-banner-unsuccessful-red-border: none;
					--theme-alert-banner-margin-bottom: 0px;
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
					font-family: "Hind Vadodara";
					text-align: center;
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin-bottom: 10px;
				}
				.failed-client {
					margin-bottom: 29px;
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
					<capitec-alert-banner type="error">
						<b>Notify client: </b> You've been blocked for failing the security Questions 
					</capitec-alert-banner>
					<capitec-group layout="vertical" 
						halign="center"
						valign="top" 
						gap="clear"
						id="notification-status-error-group">
						<img src="/images/errorBlocks.svg" class="warning-svg connection-error-svg"/>
						<div class="notification-info failed-client">
							<b>Security questions are currently unavailable.</b> <br>
							${this.canPush
								? `Skip verification to continue with limited transactions or verify via the App/USSD.`
								: `Skip verification to continue with limited transactions`
							}
						</div>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}
}

window.customElements.define(`horizon-xds-unavailable`, XdsUnavailable);