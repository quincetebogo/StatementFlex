import { html } from 'platform/elements';

/**
 * This mixin allows common functions to display alert banner
 * This mixin provides the code that is common between Favourites & Credit landing pages
 *
 * 
 */

export const alertBannerMixin = {

	renderAlertBanner() {
		const unverified = () => this._renderUnverifiedAlertBanner();
		const failed = () => this._renderFailedAlertBanner();
		const verified = () => this._renderVerifiedAlertBanner();

		const verificationStatuses = {
			'unverified': unverified,
			'failed': failed,
			'verified': verified
		};

		if (verificationStatuses[this.verificationStatus]) {
			return verificationStatuses[this.verificationStatus]();
		}
	},

	_renderUnverifiedAlertBanner() {
		return html`
			<capitec-alert-banner
				class="verificatoin-status"
				data-automation-id="favourite-transactions-unverified-alert-banner"
				type="warning">
				<capitec-group layout="horizontal" class="alert-banner-group">
					<capitec-label type="strong" label="Notify client:"></capitec-label>
					<capitec-label type="default"
						label="For added security we will need to go through verification to proceed with additional transactions.">
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-hyperlink 
						data-automation-id="favourite-transactions-verify"
						label="Verify Now"
						@click="${() => this._verifyClick()}">
					</capitec-hyperlink>
				</capitec-group>
			</capitec-alert-banner>`;
	},

	_renderFailedAlertBanner() {
		return html`
			<capitec-alert-banner
				class="verificatoin-status"
				data-automation-id="favourite-transactions-failed-verification-alert-banner"
				type="unsuccessful-red"
				label="Notify client: I'm not able to access your account since you couldn't be verified. Can we guide you on the App? Alternatively please visit your nearest branch.">
			</capitec-alert-banner>`;
	},

	_renderVerifiedAlertBanner() {
		return !this.callerInformation.hasDigitalChannels
			? this._renderNoDigitalHighRiskTransAlertBanner()
			: this._renderHighRiskTransAlertBanner();
	},

	_renderNoDigitalHighRiskTransAlertBanner() {
		return this.callerInformation.verificationMethod === `SQ`
			? html`
				<capitec-alert-banner
					class="verificatoin-status"
					data-automation-id="favourite-transactions-high-risk-trans-alert-banner"
					type="warning">
						<capitec-group layout="horizontal" class="alert-banner-group">
							<capitec-label type="strong" label="Notify client:"></capitec-label>
							<capitec-label type="default"
								label="For added security get the remote banking App to perform additional transactions, alternatively, visit your nearest branch.">
							</capitec-label>
							<capitec-spacer></capitec-spacer>
						</capitec-group>
				</capitec-alert-banner>`
			: html``;
	},

	_renderHighRiskTransAlertBanner() {
		return this.callerInformation.verificationMethod === `SQ`
			? html`
				<capitec-alert-banner
					class="verificatoin-status"
					data-automation-id="favourite-transactions-high-risk-trans-alert-banner"
					type="warning">
						<capitec-group layout="horizontal" class="alert-banner-group">
							<capitec-label type="strong" label="Notify client:"></capitec-label>
							<capitec-label type="default"
								label="For added security, we will be sending a push notification to access additional transactions.">
							</capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-hyperlink
								data-automation-id="high-risk-transactions-verify"
								label="Verify Now"
								@click="${() => this._verifyClick()}">
							</capitec-hyperlink>
						</capitec-group>
				</capitec-alert-banner>`
			: html``;
	}
};