import { Component, css, html } from 'platform/elements';

const RENDER_MODE = {
	HOW_TO_CLAIM: 0
};

export class HowToClaim extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.HOW_TO_CLAIM;
	}

	// --------------
	// EVENT HANDLERS

	_back() {
		this.dispatchEvent(new CustomEvent(`close-solution`, {}));
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

			.howtoclaim-info {
				width: 100%;
				height: 876px;
				padding: 0px 0px 0px 0px;
				text-align: left;
				line-height: 40px;
				align-items: flex-start;
				background-color: white;
				border-radius: none;
			}

			.content {
				width: 100%;
				height:705px;
				--theme-container-padding-top: 15px;
				--theme-container-padding-bottom: 0px;
			}

			#label {
				width: auto;
				height: 24px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin: 0px 0px 6px 0px;
			}

			.additional-documents {
				width: auto;
				height: 24px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin: 0px 0px 14px 0px;
			}

			horizon-alert-banner {
				width: 1032px;
				margin: 0px 0px 24px 0px;
				--theme-alert-banner-info-border: 0px;
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-font-weight: 500;
			}

			.inner-content {
				padding: 0px;
				margin-left: 8px;
				height: 732px;
			}

			.bullet-label {
				height: 24px;
				width: auto;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
				margin: 0px;
			}

			.bullet-label-claim {
				height: 24px;
				width: auto;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
				margin: 0px 0px 8px 0px;
			}

			.bullet-label-voluntary-claim {
				height: 24px;
				width: auto;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
				margin: 0px 0px 14px 0px;
			}

			.death-claim {
				height: 192px;
				width: 962px;
				border: 0px;
				margin: 0px 0px 18px 0px;
			}

			.ways-claim {
				height: 48px;
				width: 964px;
			}

			.document-needed {
				height: 24px;
				width: 1002px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 500;
				letter-spacing: 0;
				line-height: 24px;
				margin: 4px 0px 14px 0px;
			}

			capitec-group {
				margin: 4px 0px 10px 0px;
			}

			capitec-title-bar{
				padding-left: 15px;
			}

			capitec-title-bar > img {
				cursor: pointer;
				height: 26px;
				width: 26px;
				margin: 5px 10px 5px 5px; 
			}

		`
];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="howtoclaim-info">
				<capitec-title-bar type="insure">
					<img class="left-arrow-icon" src="/images/insure/left-arrow.svg" @click="${() => this._back()}"/>
					<capitec-label label="How to Claim" type="title"></capitec-label>
				</capitec-title-bar>

				<capitec-content-box class="content">

					<horizon-alert-banner 
										label="All Capitec Funeral Plan benefits are subject to terms and conditions, including limitations and exclusions." 
										type="info">
					</horizon-alert-banner>

					<capitec-content-box class="inner-content">

						<capitec-label class="ways-claim" id="label" label="Ways to claim" type="subtitle"></capitec-label>
						<capitec-group layout="vertical" gap="none" halign="left" valign="center">
							<li class="bullet-label"> Email FuneralClaims@capitecbank.co.za </li>
							<li class="bullet-label"> Visit a branch </li>
						</capitec-group>

						<capitec-label id="label" label="Documents needed" type="subtitle"></capitec-label>
						<p class="document-needed"> Once all documents are received, your claim will be processed and the money paid into your Capitec account immediately after your claim is approved. </p>

						<capitec-label class="label" id="label" label="Natural Death claims" type="subtitle"></capitec-label>
						<capitec-card class="death-claim">
							<li class="bullet-label"> Original or certified copy of the death certificate </li>
							<li class="bullet-label"> Fully completed BI-1663/BI-1680 or DHA-1663/DHA-1680 form BI-1663/BI-1680: </li>
							<li class="bullet-label"> This is a notification of death or stillbirth completed by the Department of Home Affairs </li>
							<li class="bullet-label"> DHA-1663/DHA-1680: This is a Death Report that will be issued after a death has been registered </li>
							<li class="bullet-label"> The valid identity document of the claimant </li>
							<li class="bullet-label"> The valid identity document of the beneficiary </li>
							<li class="bullet-label"> Beneficiary’s bank, bank account number and branch code if the beneficiary is not a Capitec Bank accountholder </li>
							<li class="bullet-label"> Any other documents/reports which we need to assess the validity of the claim </li>
						</capitec-card>

						<capitec-label class="additional-documents" label="In addition to the above documents, for" type="subtitle"></capitec-label>

						<capitec-label id="label" label="Accidental Death claims" type="subtitle"></capitec-label>
							<li class="bullet-label-claim"> A police report with the deatils of the cause of death </li>

						<capitec-label id="label" label="Newborn Premium Waiver claims" type="subtitle"></capitec-label>
							<li class="bullet-label-claim"> An unabridged birth certificate </li>

						<capitec-label id="label" label="Voluntary Premium Pause claims" type="subtitle"></capitec-label>
							<li class="bullet-label-voluntary-claim"> A reason as to why you want to activate the benefit, no additional documents required </li>

						<capitec-label id="label" label="Waiting Period Waiver" type="subtitle"></capitec-label>
						<capitec-group layout="vertical" gap="none" halign="left" valign="center">
							<li class="bullet-label"> Policy schedule of previous policy showing that the cover was in force at the time of the Capitec policy acceptance </li>
							<li class="bullet-label"> Letter of proof of cancellation or lapse of previous policy after the Capitec policy acceptance date </li>
						</capitec-group>

					</capitec-content-box>

				</capitec-content-box>
			</capitec-card>
		`;
	}
}

window.customElements.define(`horizon-how-to-claim`, HowToClaim);