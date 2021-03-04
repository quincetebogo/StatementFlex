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

			.back-ground-card{
				height:300px;
				border: none!important;
				background-color :rgb(244, 244, 244);
			}
			.access-card{
				height:320px;
				width:320px;
				background-color: rgb(244, 244, 244);
				padding: 20px 0px 0px 0px;
				border: none!important;
				
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
				height: 24px;
				width: 141px;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}

			#access-label {
				background-color: #4E6066;
				height:52px;
				width: 320x;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				background-color: #F7F7F7;
				padding-left: 16px;
				border-bottom: 0px;
				margin-bottom: 4px;
			}

			.box-items{
				height: auto;
				align-items: center;
				padding: 24px 24px 24px 24px;
			}
			.access-box-items {
				height: auto;
				padding: 0px;
			}
			.box-label{
				font-size:22px;
				font-weight:600;
				line-height: 15px;
			}
			
			.box-image {
				height: 152px;
 				width: 210px;
			}
			.box-icon{
				align-self:flex-end;
				padding:0px 30px 0px 0px;
				cursor:pointer;
			}
			.tile-favourites {
				width: 100%;
				padding: 0px;
				border-width: 0px;
				margin-bottom: 16px;
			}
			.product {
				width: var(--theme-product-tile-colour-display-width, 57px);
				display: inline-flex;
				align-items: center;
				justify-content: center;
			}

			.tile-container {
				display: inline-flex;
				flex-direction: row;
				box-sizing: border-box;
				height: var(--theme-product-tile--height, 80px);
				background-color: transparent;
				padding: 0px;
				width: 100%;
				position: relative;
				background-color: white;
			}
			.rectangle {
				height: 72px;
				width: 4px;
				border-radius: 4px 0 0 4px;
				background-color: #009DE0;
			}
			.heading {
				align-self: center;
			}

			capitec-icon {
				height: 26px;
				width: 26px;
			}
			.label-title {
				font-weight: 600;
				--theme-label-strong-font-size: 18px;
			}
			.active-title {
				--theme-label-strong-font-size: 15px;
				text-align: left;
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
					${this.renderAccessExpander()}
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

	renderAccessExpander() {
		return html`
			<capitec-card class="access-card">
				<capitec-card class="back-ground-card"> 
					<capitec-group layout="vertical" halign="stretch" valign="top" gap="line">
						<capitec-content-box class="access-header" id="access-label" layout="horizontal" halign="left" valign="center" gap="none">
							<!-- <capitec-icon class="header-icon" 
										  size="medium" 
										  icon="system/unlock-files-action">
							</capitec-icon> -->
							<capitec-label class="header-label" label="Access Channels"></capitec-label>
						</capitec-content-box>
						${this.renderAccessChannels()}
					</capitec-group>
				</capitec-card>
			</capitec-card>`;
	}

	renderAccessChannels() {
		return html`
			<capitec-content-box class="access-box-items" layout="vertical" halign="stretch" valign="top" gap="none">
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
			</capitec-content-box>`;
	}

	renderAccessChannelError() {
		if (this.showAlert) {
			return html`<horizon-access-channel-error @on-OK="${() => this.showAlert = false}"></horizon-access-channel-error>`;
		}
	}
}

window.customElements.define(`access-component`, AccessMenuBar);