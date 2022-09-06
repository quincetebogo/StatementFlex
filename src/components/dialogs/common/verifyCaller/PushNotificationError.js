import { Component, css, html } from 'platform/elements';

export class PushNotificationError extends Component {

	// ----------
	// PROPERTIES
	// ----------
	static get properties() {
		return {
			itaTimeout: { type: Boolean },
			itaRejected: { type: Boolean },
			itaSystemError: { type: Boolean }
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
				#notification-status-box > capitec-group > horizon-alert-banner {
					--theme-toast-horizontal-title-margin-right: 4px;
				}
				#notification-status-box > capitec-group > horizon-alert-banner[type="error"] {
					--theme-alert-banner-unsuccessful-red-border: none;
					--theme-alert-banner-margin-bottom: 0px;
				}
				#notification-status-group > capitec-label {
					font-family: "Hind Vadodara Medium";
					line-height: 24px;
					margin: 0;
					margin-bottom: 30px;

					--theme-label-title-font-size: 15px;
				}
				.ita-timeout-svg {
					height: 152px;
					width: 210px;
					margin: 18px 0px 20px 0px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		let message = ``;
		let instruction = ``;
		let bannerType = `error`;

		message = this.itaSystemError ? `The push notification didn't send due to a system error` : message;
		message = this.itaRejected ? `You rejected the push notification` : message;
		message = this.itaTimeout ? `You didn't accept the push notification in time.` : message;

		instruction = this.itaSystemError || this.itaTimeout || this.itaRejected ? `You can try again or choose another option` : instruction;

		bannerType = this.itaTimeout || this.itaRejected ? `warning` : bannerType;

		return html`
			<capitec-content-box id="notification-status-box">
				<capitec-group 
					layout="vertical" 
					halign="stretch" 
					valign="top" 
					gap="clear">
					<horizon-alert-banner 
						type="${bannerType}"
						header="Notify: "
						label="${message}">
					</horizon-alert-banner>
					<capitec-group layout="vertical"
						halign="center"
						valign="top"
						gap="clear"
						id="notification-status-group">
						${this.itaSystemError
						   ? html`<img src="/images/common/connection-error.svg" class="ita-timeout-svg"/>`
						   : html`<img src="/images/common/ita-timeout.svg" class="ita-timeout-svg"/>`
						}
						<capitec-label 
							type="title"
							label="${instruction}">
						</capitec-label>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>`;
	}
}

window.customElements.define(`horizon-push-notication-error`, PushNotificationError);