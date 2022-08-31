import { Component, css, html } from 'platform/elements';

export class PushNotificationStatus extends Component {

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * 
	 */
	 static get properties() {
		return {
			timeLimit: { type: Number },
			warningThreshold: { type: Number },
			alertThreshold: { type: Number },
			timeLeft: { type: Number },
			tickCallback: { type: Object }
		};
	}

	_itaTimeout() {
		this.dispatchEvent(new CustomEvent(`time-expired`, {}));
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
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-info-border: none;
				}
				#notification-status-group > capitec-label {
					line-height: 24px;
					margin: 0;
					margin-bottom: 30px;

					--theme-label-title-font-size: 15px;
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
				.timer-bold {
					font-weight: 700;
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
			<capitec-group
				layout="vertical"
				halign="stretch" 
				valign="top"
				gap="clear">
					${this._renderHeaderLabels()}
					${this._renderCountdown()}
					${this._renderLabels()}
			</capitec-group>
		</capitec-content-box>`;
	}

	_renderHeaderLabels() {
		return this.timeLeft < 16 && this.timeLeft > 0
		? html`
			<horizon-alert-banner
				type="warning"
				header="Notify client: "
				label="Your time is about to run out.">
			</horizon-alert-banner>`
		: html`
			<horizon-alert-banner
				type="info"
				header="Notify client: "
				label="A push notification was sent to your phone, you need to accept to continue.">
			</horizon-alert-banner>`;
	}

	_renderCountdown() {
		return html`
		<capitec-group 
			layout="vertical"
			halign="center"
			valign="top"
			gap="clear"
			id="notification-status-group">
			<horizon-countdown
				time-limit="${this.timeLimit}"
				warning-threshold="${this.warningThreshold}"
				alert-threshold="${this.alertThreshold}"
				.tickCallback="${(timeLeft) => this.tickCallback(timeLeft)}"
				@time-expired="${() => this._itaTimeout()}">
			</horizon-countdown>
		</capitec-group>`;
	}

	_renderLabels() {
		if (this.timeLeft < 16 && this.timeLeft > 0) {
			return html`
			<capitec-group layout="vertical"
					halign="center"
					valign="top"
					gap="clear"
					id="notification-status-group">
				<div class="notification-info">
					<b>There are <span class="timer-bold">${this.timeLeft} seconds</span> left.</b>
				</div>
				<capitec-label type="title" label="You'll need to try again if the timer runs out.">
				</capitec-label>
			</capitec-group>`;
		} 

		return html`
		<capitec-group layout="vertical"
				halign="center"
				valign="top"
				gap="clear"
				id="notification-status-group">

			<div class="notification-info">
				There are <span class="timer-bold">${this.timeLeft} seconds</span> left.
			</div>
			<capitec-label 
				type="title"
				label= "Check your verified cellphone to accept.">
			</capitec-label>
		</capitec-group>`;
	}
}

window.customElements.define(`horizon-push-notication-status`, PushNotificationStatus);