import { Component, css, html } from 'platform/elements';
import { HorizonStore } from '../../store/HorizonStore';
import 'platform/components';
import '../dialogs/AccessChannelError';

export class AccessMenuBar extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.confirmedCaller = null;
		this.clientProfileDetails = null;
		this.showAlert = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			showAlert: { type: Boolean },
			clientProfileDetails: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.confirmedCaller = HorizonStore.getInstance().recoverState();
		this.clientProfileDetails = this.confirmedCaller && this.confirmedCaller.clientProfileDetails;
		this.clientAccess = this.clientProfileDetails && this.clientProfileDetails.clientAccess;

		this.accessChannels = this.clientAccess ? Object.keys(this.clientAccess) : [];
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			.insights{
				width: 320px;
				height: auto;
				padding: 0px 0px 0px 0px;
			}
			.insights-card{
				height:370px;
				width:320px
			}
			.insights-subtitle{
				height: 10px;
				color: #4E6066;
				font-family: Hind Vadodara;
				font-size:  14px;
				line-height: 0px;
				text-align: left;
				padding-top:24px;
			}

			.insights-label{
				height: 24px;
				width: 114px;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}

			.access-group {
				height: auto;
				width: auto;
				padding: 24px 0px 0px 0px;
			}
			.access-header{
				height:60px;
				padding: 0px 0px 0px 20px;
			}

			.header-icon{
				padding:0px 20px 0px 0px;
			}

			#notify-icon {
				padding-left: 145px;
			}

			.header-label{
				height: auto;
				width: auto;
				padding-left: 16px;
				--theme-label-default-font-size: 18px;
				--theme-label-default-font-weight: 600;
				--theme-layout-gap-spacing: 18px;
			}

			.box-items{
				height: auto;
				align-items: center;
				padding: 24px 24px 24px 24px;
			}
			.box-image {
				height: 152px;
 				width: 210px;
			}
			horizon-product-tile {
				--theme-product-tile--height: 72px;
				--theme-product-tile-border-radius: 4px;
				--theme-product-tile-colour-border-radius: 4px 0 0 4px;
				--theme-product-tile-default-border-left: 4px solid #009DE0;
				--theme-product-tile-hover-shadow: none;
				--theme-product-tile-focus-shadow: none;
			}
		`
		];
	}

	render() {
		return html`
			<section class="insights">
				<div>
					${this.renderClientInsights()}
				</div>
				<div>
					${this.renderAccessChannelTabs()}
				</div>
			</section>
			${this.renderAccessChannelError()}`;
	}

	renderClientInsights() {
		return html`
			<capitec-card class="insights-card">
				<capitec-group layout="vertical" halign="stretch" valign="top" gap="line">
					<capitec-content-box class="access-header" layout="horizontal" halign="left" valign="center" gap="none" >
							<capitec-label class="insights-label" label="Client Insights"></capitec-label>
							<capitec-icon class="header-icon" id="notify-icon" size="small" icon="system/notify"></capitec-icon>
					</capitec-content-box>
					<capitec-content-box class="box-items" layout="vertical" halign="stretch" valign="top" gap="none">
						<img class="box-image" src="images/landingPageImages/marketing.svg"/>
						<capitec-label class="insights-subtitle" label="Client insights coming soon..."></capitec-label>
					</capitec-content-box>
					<!-- <hr> -->
				</capitec-group>
			</capitec-card>`;
	}

	renderAccessChannelTabs() {
		return html`
			<capitec-group class="access-group" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-label class="header-label" label="Access Channels"></capitec-label>

				<horizon-product-tile 
					type="default"
					label="App & Online Banking"
					subtitle="active"
					detail=""
					icon="system/access"
					style="width: 320px; margin-bottom: 16px;">
				</horizon-product-tile>

				<horizon-product-tile 
					type="default"
					label="USSD"
					subtitle="active"
					detail=""
					icon="system/cellphone"
					style="width: 320px; margin-bottom: 16px;">
				</horizon-product-tile>

				<horizon-product-tile 
					type="default"
					label="Notifications"
					subtitle="active"
					detail=""
					icon="system/messages"
					style="width: 320px;">
				</horizon-product-tile>

			</capitec-group>
		`;
	}

	renderAccessChannelError() {
		if (this.showAlert) {
			return html`<horizon-access-channel-error @on-OK="${() => this.showAlert = false}"></horizon-access-channel-error>`;
		}
	}
}

window.customElements.define(`access-component`, AccessMenuBar);