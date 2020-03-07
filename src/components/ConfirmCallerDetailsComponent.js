import { Component, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import 'platform/components/popups/Modal';
import 'platform/components/data/Table';
import 'platform/components/layouts/Spacer';
import 'platform/components/core/Icon';

import './AddCallerDetailsComponent';
import { isDisabled, isHidden, getTabIndex } from '../utils/channelServiceUtilities';

class ConfirmCallerDetailsComponent extends Component {

	constructor() {
		super();
		this.router = Router.getInstance();

		this.confirmedCaller = null;
		this.addCallerDetails = false;
	}

	static get properties() {
		return {
			confirmedCaller: { type: Object },
			addCallerDetails: { type: Boolean }
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
				.grid-container{
					grid-row-gap: 0px;
					grid-column-gap: 0px;
					width:690;
					margin:0px;
					padding:0px;
				}
				.main{
					height: 375px;
				}
				.populatedText{
					padding: 8px;
					height: 64px;	
					width: 690x;
					border-bottom: 1px solid #dfdfdf;
				}

				.footer-bar{
					width: 678px;
					height: 64px;
					margin: 0px;
					padding: 0px;
					border-top: : 1px solid #dfdfdf;
				}

				.horizon-call{
					display: flex;
					flex-direction: row;
					margin: 0px;					
				}

				.horizon-add-caller-details-div{
					display: flex;					
					flex-direction: row;
					width: 648px;
					height: 56px;
					margin-top: 24px;
					margin-left:21.6px;
					margin-right:18.6px;
					background: #DAF5F3;
				}

				.ref-call{
					text-align:left;
					padding-left: 24px;
					padding-top: 8px;
					padding-bottom: 8px;
					width:232px;
					height:64px;
					border: 0px;
					margin: 0px;
				}

				.ivr-option{
					width: 223px;
					height: 64px; 
					text-align:left;
					border: 0px;
					padding: 8px;
					border-left: 1px solid #dfdfdf;
					border-right: 0px;
					border-top: 0px;
					border-bottom: 0px;
					margin: 0px;
				}

				.incoming-call{
					width:232px;
					height:64px;
					text-align:left;
					padding-left: 24px;
					padding-top: 8px;
					padding-bottom: 8px;
					border-left: 1px solid #dfdfdf;
					border-right: 0px;
					border-top: 0px;
					border-bottom: 0px;
					margin: 0px;
				}

				.client-avatar{
					display: grid;
					grid: 'avatar clientdetails';
					height: 200px; 
					width: 433px;
					border: 0px 0px 1px 0px;
					margin-top: 24px;
					margin-bottom: 0px;
					margin-right: 0px;
				}

				.client-info{
					display: grid;
					grid-template-columns: 213px 213px;
					padding-left: 20px;
					text-align: left;
					height: 200px;
					width: 400px; 
				}
				.add-caller{
				background-color: #4330;
				}
				
				.image{
					width: 200px;
					height: 200px;
					align: left;
					padding: 0px 0px 0px 24px;
					margin: 0px 0px 0px 24px;
					background: gainsboro;
				}
        
				.fullname{
					//  width: 200px;
					//  margin: 0px;
					text-align: left;
					padding: 0px 0px 16px 0px ;
					vertical-align: middle;
					color: #003652;	
					font-family: "Hind Vadodara";	
					font-size: 18px;	
					font-weight: 600;	
					line-height: 27px;
					//transform: translate(-8.0%);
				}

				#ref-number{
					height: 21px;
					width: 112px;
					color: #4E6066;	
					font-family: "Hind Vadodara";	
					font-size: 14px;	
					line-height: 21px;
				}
        
				#incoming-num{
					height: 27px;	
					width: 104px;	
					color: #003652;	
					font-family: "Hind Vadodara";	
					font-size: 18px;	
					font-weight: 600;	
					line-height: 27px;
				}
        
				#label-value{
					color: #003652;	
					font-family: "Hind Vadodara";	
					font-size: 18px;	
					font-weight: 600;	
					line-height: 27px;
				}
        
				#label-ivr{
					width: 192px;
					//height: 64px;
					color: #003652;	
					font-family: "Hind Vadodara";	
					font-size: 18px;	
					font-weight: 600;	
					line-height: 27px;
				}
				.items{
					font-size: 18px;	
					font-weight: 600;	
					line-height: 27px;
				}
				#label-text{
					height: 30px;
					width: 123px;	
					color: #003652;	
					font-family: "Hind Vadodara";	
					font-size: 18px;	
					font-weight: 600;
					line-height: 30px;
				}

				#action-bar{
					background: #DAF5F3;
					height: 56px;	
					width: 690px;
					margin: 16px 16px 16px 24px;
					align: center;
				}

				#action-icon{
					margin: 0px 0px 0px 0px;
					color: #08A6B5;
					align: center;
					padding: 18px 4px 18px 32px;
				}
				#action-label{
					margin:1px 0px 0px 0px;
					color: #08A6B5;
					font-family: "Hind Vadodara";	
					font-weight: 800;
					align: center;
					padding: 18px 0px 18px 8px;
				}

				#action-display{
					margin: 0px 0px 0px 0px;
					color: #08A6B5;
					font-family: "Hind Vadodara";	
					font-weight: 500;
					align: center;
					padding: 18px 0px 18px 0px;
				}

				#id-confirm-button {
					width: 105px;
				}

				#id-search-client-button {
					margin-left : 12px;
				}

				.footer{
					width: 742px;
					margin:0px;
					padding:0px;
					border-top: 1px solid #dfdfdf; 
				}
				u{
					color: #08A6B5;
				}
				.icon{
					align: center;
					padding: 18px 0px 18px 48px;
					color:  #08A6B5;
				}
			`];
	}

	onStopCardSelect() {
		let cardStop = document.getElementById("label-ivr");
		console.log(cardStop.childNodes.length);
	}

	onConfirmClick() {
		this.router.navigateByPath(`/client/profile`);
	}

	getLanguagePreference() {
		let languagePreference = this.confirmedCaller.callerInformation.languagePreference.value;
		if (languagePreference === null) {
			languagePreference = '';
		}
		return languagePreference;
	}
	getVerifiedTelephoneNumber() {
		let verifiedCellphone = this.confirmedCaller.callerInformation.verifiedTelephoneNumber.value;


		if (verifiedCellphone === null) {
			verifiedCellphone = '';
		}
		return verifiedCellphone;

	}

	render() {
		if (this.addCallerDetails != true) {
			return html`
			<capitec-modal 
					type="free" 
					header="Confirm Caller Details" 
					header-align="left">
  				<div slot="body" class="main">
					${this.renderCallInformation()}
					${this.renderAddCallerDetails()}
					${this.renderConfirmedCaller()}
				</div>
				${this.renderFooter()}
			</capitec-modal>
		`;
		}
		else {
			return html`${this.renderAddCallerDetailsModal()}`;
		}
	}

	renderCallInformation() {
		return html`
			<capitec-group layout = "grid" class="grid-container" >
				<capitec-action-bar class="populatedText" tabindex="-1">
					<div class="horizon-call">
						<div class="ref-call">
							<capitec-label 
								id="ref-number" 
								label="Reference Number"
								tabindex="-1">
							</capitec-label>
							<capitec-label id="label-value"
								label="${this.confirmedCaller.voiceReferenceNumber.value}"
								tabindex="${getTabIndex(this.confirmedCaller.voiceReferenceNumber)}"
								?hidden=${isHidden(this.confirmedCaller.voiceReferenceNumber)}>
							</capitec-label>
						</div>
						<div class="ivr-option">
							<capitec-select
								id="label-ivr"
								label="ivr option selected" 
								display-field="value"
								.items="${this.confirmedCaller.ivrOption.possibleValues}"
								.value="${this.confirmedCaller.ivrOption.possibleValues[0]}"
								tabindex="${getTabIndex(this.confirmedCaller.ivrOption)}"
								?hidden=${isHidden(this.confirmedCaller.ivrOption)}>
							</capitec-select>
						</div>
						<div class="incoming-call">
							<capitec-label 
								id="ref-number" 
								label="Incoming Number"
								tabindex="-1">
							</capitec-label>
							<capitec-label id="incoming-num"
								label="${this.confirmedCaller.incomingTelephoneNumber.value}"
								tabindex="${getTabIndex(this.confirmedCaller.incomingTelephoneNumber)}"
								?hidden=${isHidden(this.confirmedCaller.incomingTelephoneNumber)}>
							</capitec-label>
						</div>
					</div >
				</capitec-action-bar >
			</capitec-group >`;
	}

	renderAddCallerDetails() {
		return html`
			<div class="horizon-add-caller-details-div">
				<capitec-icon 
					size="default" 
					icon="system/info" 
					id="action-icon"
					tabindex="-1">
				</capitec-icon>
				<u>
					<capitec-label
						id="action-label"
						label="Add Caller Details"
						tabindex="${getTabIndex(this.confirmedCaller.addCallerDetailsButton)}"
						?hidden=${isHidden(this.confirmedCaller.addCallerDetailsButton)}
						@click="${() => this.addCallerDetails = true}">
				</u>
				<p id="action-display">&nbsp;if the caller is calling on another client's behalf</p>
			</div>`;
	}

	renderConfirmedCaller() {
		return html`
			<div class="client-avatar">
				<capitec-avatar 
					class="image" 
					shape = "none" 
					value = ""
					tabindex="-1">
				</capitec-avatar>
				<div class="client-info">
					<capitec-label class="fullname"
						id="label-value"
						label="${this.confirmedCaller.callerInformation.name.value}" 
						tabindex="${getTabIndex(this.confirmedCaller.callerInformation.name)}"
						?hidden=${isHidden(this.confirmedCaller.callerInformation.name)}>
					</capitec-label>
					<div></div>
					<div>
						<capitec-label 
							label="ID Number"
							tabindex="-1"
							?hidden=${isHidden(this.confirmedCaller.callerInformation.southAfricanIDNumber)}>
						</capitec-label>
						<capitec-label 
							id="label-text"
							label="${this.confirmedCaller.callerInformation.southAfricanIDNumber.value}"
							tabindex="${getTabIndex(this.confirmedCaller.callerInformation.southAfricanIDNumber)}"
							?hidden=${isHidden(this.confirmedCaller.callerInformation.southAfricanIDNumber)}>
						</capitec-label>
						</div><div>
						<capitec-label 
							label="Verified Cellphone Number"
							tabindex="-1"
							?hidden=${isHidden(this.confirmedCaller.callerInformation.verifiedTelephoneNumber)}>
						</capitec-label>
						<capitec-label 
							id="label-text"
							label="${this.getVerifiedTelephoneNumber()}"
							tabindex="${getTabIndex(this.confirmedCaller.callerInformation.verifiedTelephoneNumber)}"
							?hidden=${isHidden(this.confirmedCaller.callerInformation.verifiedTelephoneNumber)}>
						</capitec-label>
					</div>
				<div>
					<capitec-label 
						label="Lives In"
						tabindex="-1">
						?hidden=${isHidden(this.confirmedCaller.callerInformation.livesIn)}>
					</capitec-label>
					<capitec-label 
						id="label-text"
						label="${this.confirmedCaller.callerInformation.livesIn.value}"
						tabindex="${getTabIndex(this.confirmedCaller.callerInformation.livesIn)}"
						?hidden=${isHidden(this.confirmedCaller.callerInformation.livesIn)}>
					</capitec-label>
				</div>
				<div>
					<capitec-label 
						label="Language Preference"
						?hidden=${isHidden(this.confirmedCaller.callerInformation.languagePreference)}>
						tabindex="-1">
					</capitec-label>
					<capitec-label 
						id="label-text" 
						label="${this.getLanguagePreference()}"
						tabindex="${getTabIndex(this.confirmedCaller.callerInformation.languagePreference)}"
						?hidden=${isHidden(this.confirmedCaller.callerInformation.languagePreference)}>
					</capitec-label>
				</div>
				<div>
					<capitec-label 
						label="Birthday"
						?hidden=${isHidden(this.confirmedCaller.callerInformation.birthdate)}>
						tabindex="-1">
					</capitec-label>
					<capitec-label id="label-text"
						label="${this.confirmedCaller.callerInformation.birthdate.value}"
						tabindex="${getTabIndex(this.confirmedCaller.callerInformation.birthdate)}"
						?hidden=${isHidden(this.confirmedCaller.callerInformation.birthdate)}>
					</capitec-label>
				</div>
				<div>
				</div>
			</div >
		</div > `;
	}

	renderFooter() {
		return html`
			<capitec-action-bar 
					slot = "footer" 
					class="footer-bar" >
				<capitec-button
					id="id-search-client-button"
					type="clear"
					label="Search Client"
					?hidden=${isHidden(this.confirmedCaller.searchClientButton)}
					.disabled="${isDisabled(this.confirmedCaller.searchClientButton)}"
					tabindex="${getTabIndex(this.confirmedCaller.searchClientButton)}"
					@click="${() => console.log('on clicked search client')}">
				</capitec-button>				
				<capitec-spacer tabindex="-1"></capitec-spacer>
				<capitec-button 
					type="clear"
					label="End Call Session" 
					?hidden=${isHidden(this.confirmedCaller.endCallSessionButton)}
					.disabled="${isDisabled(this.confirmedCaller.endCallSessionButton)}"
					tabindex="${getTabIndex(this.confirmedCaller.endCallSessionButton)}"
					@click="${() => console.log('on end call button')}">
				</capitec-button>	
				<capitec-button 
					id="id-confirm-button"
					type="primary"
					label="Confirm" 
					?hidden=${isHidden(this.confirmedCaller.confirmButton)}
					.disabled="${isDisabled(this.confirmedCaller.confirmButton)}"
					tabindex="${getTabIndex(this.confirmedCaller.confirmButton)}"
					@click="${() => this.onConfirmClick()}">
				</capitec-button>
			</capitec-action-bar>`;
	}

	renderAddCallerDetailsModal() {
		if (this.addCallerDetails) {
			return html`
				<client-add-caller
					@on-back="${() => {
					console.log('on back received');
					this.addCallerDetails = false
				}
				}">
				</client-add-caller>
		 `;
		}

		return html``;
	}
}

window.customElements.define(`confirm-caller-component`, ConfirmCallerDetailsComponent)