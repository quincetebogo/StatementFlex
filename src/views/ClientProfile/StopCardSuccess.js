import { View, html, css } from 'platform/elements';
// import 'platform/components/layouts/Group'
// import 'platform/components/containers/Card';

import { HorizonViewManager } from '../../HorizonViewManager';
import '../../components/Common/HorizonOptionButton'

export class StopCardSuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}


	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------	

	connectedCallback() {
		super.connectedCallback();
	}

	static get styles() {
		return [
			super.styles,
			css`
				.title-bar-text {
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 36px;
			  	}			

				.horizon-notify-client{
					display: flex;
					flex-direction: row;
					width: 100%;
					height: 64px;
					background-color: rgba(8,166,181,0.15);
				}

				#action-icon{
					margin-left: 24px;
				}	
				
				#action-display{
					margin-top:20px;
					height: 24px;
					width: 774px;
					color: #08A6B5;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;					
				}	
				
				.card-image {
					margin-top: 41px;
				}
				
				.card-stopped {
					margin-top:36px;
					height: 36px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 36px;
					text-align: center;
				  }		
				  
				  .stop-card-text {
					height: 48px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
				  }	
				  
				  .related-options {
					height: 32px;
					width: 100%;
					border-top: 1px solid #dfdfdf;"
					border-bottom: 1px solid #dfdfdf;"
				  }

				  .related-options-text{
					  margin: 0px 0px 0px 24px;
					  padding: 0px 0px 0px 0px;
				  }

				  .options-group{
					  margin:24px 0px 62px 24px;
				  }

				  .button-margin{
					  margin-right:16px;
				  }
			`];
	}

	render() {
		return html`
		<capitec-card>
			<capitec-group layout="vertical" gap="none" style="width:100%;">
				${this.renderTitleBar()}
				${this.renderNotifyClient()}
				${this.renderGraphic()}
				<p class="card-stopped">Card Stopped</p>
				<p class="stop-card-text">Remind the client that they will need to visit a branch for a new card.</p>
				${this.renderRelatedOptions()}
				${this.renderOptionsButtons()}
			</capitec-group>
		</capitec-card>`;
	}

	/*
*/

	renderTitleBar() {
		return html`
			<capitec-title-bar 
				class="title-bar-text"
				type="clear" 
				label="Stop Card" >
			</capitec-title-bar>`;
	}

	renderNotifyClient() {
		return html`
			<div class="horizon-notify-client">
				<img src="../../images/info.svg" id="action-icon"/>
				<p id="action-display">&nbsp;See related options to assist if the client needs to stop their Remote Banking (app/USSD) channels</p>
			</div>`;
	}

	renderGraphic() {
		return html`<img class="card-image" src="../../images/cardStop/cards.svg"/>`;
	}

	renderRelatedOptions() {
		return html`
		<div class="related-options">
			<p class="related-options-text">Related Options</p>
		</div>`;
	}

	renderOptionsButtons() {
		return html`
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<horizon-option-button class="button-margin" label="Remote Banking Channels" img-src="../../../images/access.svg"></horizon-option-button>
				<horizon-option-button class="button-margin"label="Card Skimming Case" img-src="../../../images/cards.svg"></horizon-option-button>
				<horizon-option-button class="button-margin"label="ATM Withdrawal Dispute" img-src="../../../images/atm.svg"></horizon-option-button>
				<horizon-option-button class="button-margin"label="Find A Branch" img-src="../../../images/atm.svg"></horizon-option-button>
			</capitec-group>
			`;
	}
}

customElements.define(`horizon-summary-success`, StopCardSuccess);
