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

			capitec-title-bar {
				--theme-label-title-font-size: 18px;
			}

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
				height: 20px;
				width: 288px;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				--theme-label-subtitle-font-size: 16px;
				--theme-label-subtitle-font-weight: 500;
				letter-spacing: 0;
				line-height: 20px;
				text-align: center;
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
			}
			.access-card{
				height:320px;
				width:320px;
				background-color: #F5F5F5;
				padding: 20px 0px 0px 0px;
				border: none!important;
				
			}
			.access-header{
				height:60px;
				padding: 0px 0px 0px 20px;
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
			}

			.box-items{
				height: auto;
				align-items: center;
				padding: 24px 24px 24px 24px;
			}
			.box-label{
				font-size:22px;
				font-weight:600;
				line-height: 15px;
			}
			capitec-group {
				height: 306px;
			}
			.box-image {
				height: 108px;
 				width: 108px;
				 --theme-layout-gap-spacing: 22px;
			}
			.box-icon{
				align-self:flex-end;
				padding:0px 30px 0px 0px;
				cursor:pointer;
			}`
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
				<capitec-title-bar type="default" label="Client Insights">
					<capitec-spacer></capitec-spacer>
					<capitec-icon size="small" icon="system/notify"></capitec-icon>
				</capitec-title-bar>

				<capitec-group layout="vertical" halign="center" valign="center" gap="clear">
			
						<img class="box-image" src="images/landingPageImages/marketing.svg"/>
						<capitec-label class="insights-subtitle" type="subtitle" label="Client insights coming soon..."></capitec-label>

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
		return this.accessChannels.map(access => html`<capitec-content-box class="box-items" layout="vertical" halign="center" valign="center" gap="none">
							<capitec-label class="box-label" label="${access}"></capitec-label>
							<capitec-icon class="box-icon" 
											size="small" 
											icon="system/more-action"
											@click="${() => this.showAlert = true}">
							</capitec-icon>
							<capitec-label class="subtitle" label="Active"></capitec-label>
						</capitec-content-box>`);
	}

	renderAccessChannelError() {
		if (this.showAlert) {
			return html`<horizon-access-channel-error @on-OK="${() => this.showAlert = false}"></horizon-access-channel-error>`;
		}
	}
}

window.customElements.define(`access-component`, AccessMenuBar);