import { Component, html, css } from 'platform/elements';
import { HorizonStore } from '../../store/HorizonStore';
import 'platform/components';
import '../../components/dialogs/AccessChannelError';

export class AccessComponent extends Component {

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
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.confirmedCaller = HorizonStore.getInstance().recoverState();
		this.clientProfileDetails = this.confirmedCaller && this.confirmedCaller.clientProfileDetails;
		this.clientAccess = this.clientProfileDetails && this.clientProfileDetails.clientAccess;
		this.accessChannels = Object.keys(this.clientAccess);
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
			}
			.subtitle {
				height: 10px;
				color: #4E6066;
				font-family: Hind Vadodara;
				font-size:  15px;
				line-height: 14px;
				text-align: left;
			}
			.back-ground-card{
				height:300px;
			}
			.access-card{
				height:320px;
				width:320px;
				background-color: #F5F5F5;
				padding: 20px 0px 0px 0px;
			}
			.access-header{
				height:60px;
				padding: 0px 0px 0px 20px;
			}
			.header-icon{
				padding:0px 20px 0px 0px;
			}
			.header-label{
				font: 600 18px/30px Hind Vadodara;
				line-height:50px
			}
			.box-items{
				height:50px;
				padding: 0px 0px 0px 20px;
			}
			.box-label{
				font-size:22px;
				font-weight:600;
				line-height: 15px;
			}
			.box-icon{
				align-self:flex-end;
				padding:0px 30px 0px 0px;
				cursor:pointer;
			}

			`];
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
						<capitec-icon class="header-icon" size="small" icon="system/info"></capitec-icon>	
						<capitec-label class="header-label" label="Client Insights"></capitec-label>
					</capitec-content-box>	
					<capitec-content-box class="box-items" layout="vertical" halign="stretch" valign="top" gap="none">
						<capitec-label class="box-label" label="Incomplete Credit Estimate"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label class="insights-subtitle" label="Reference no. 0987865463"></capitec-label>
					</capitec-content-box>
					<hr>
				</capitec-group>
			</capitec-card>`;
	}

	renderAccessExpander() {
		return html`
			<capitec-card class="access-card">
				<capitec-card class="back-ground-card"> 
					<capitec-group layout="vertical" halign="stretch" valign="top" gap="line">
						<capitec-content-box class="access-header" layout="horizontal" halign="left" valign="center" gap="none">
							<capitec-icon class="header-icon" 
										  size="medium" 
										  icon="system/unlock-files-action">
							</capitec-icon>	
							<capitec-label class="header-label" label="Access"></capitec-label>
						</capitec-content-box>
						${this.renderAccessChannels()}
					</capitec-group>
				</capitec-card>
			</capitec-card>`;
	}

	renderAccessChannels() {
		return this.accessChannels.map(access => {
			return html`<capitec-content-box class="box-items" layout="vertical" halign="stretch" valign="top" gap="none">
							<capitec-label class="box-label" label="${access}"></capitec-label>
							<capitec-icon class="box-icon" 
											size="small" 
											icon="system/more-action"
											@click="${() => this.showAlert = true}">
							</capitec-icon>
							<capitec-label class="subtitle" label="Active"></capitec-label>
						</capitec-content-box>`
		})
	}

	renderAccessChannelError() {
		if (this.showAlert) {
			return html`<horizon-access-channel-error @on-OK="${() => this.showAlert = false}"></horizon-access-channel-error>`;
		}
	}
}

window.customElements.define(`access-component`, AccessComponent);