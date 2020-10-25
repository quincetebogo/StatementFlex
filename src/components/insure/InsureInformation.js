import { Component, css, html } from 'platform/elements';
import { EventAggregator, NavigationContext, Router } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';

import 'platform/components/layouts/Layout';
import 'platform/components/containers/Expander';
import 'platform/components/popups/Toast';
import 'platform/components/containers/TabGroup';
import 'platform/components/data/Table';
import 'platform/components/navigation/AppRouter';

import 'app/components/dialogs/insure/CalculatePremium';
import 'app/components/dialogs/insure/NonAdvisoryDisclaimer';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/insure/AssignReasonDialog';
import 'app/components/dialogs/insure/AssignReasonSelected';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	CALCULATE_PREMIUM: 1,
	DISCLAIMER: 2,
	END_CALL: 3,
	SELECT_ASSIGN_REASON: 4,
	ASSIGN: 5,
	VERIFY_NOW: 6
};

const RENDER_BANNER = {
	NON_CLIENT: 0,
	UNVERIFIED_PROSPECTIVE_CLIENT: 1,
	VERIFIED_PROSPECTIVE_CLIENT: 2
};

/**
 * The InsureInformation comopnent displays information on insurance products. The component is used by 
 * the non-client, unverified prospective client  and verified prospective client views.
 * 
 * @export
 * @class InsureInformation
 * @extends {Component}
 */
export class InsureInformation extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.router = Router.getInstance();
		this.eventAggregator = EventAggregator.getInstance();

		this.eventAggregator.subscribe(`platform-navigation-context-updated`, () => this._onNavigationContextUpdated());
		this.horizonStore = HorizonStore.getInstance();
		this.benefitScreen = true;
		this.coverScreen = false;
		this.claimScreen = false;
		this.index = 0;
		this.renderMode = RENDER_MODE.DISCLAIMER;
		this.renderAlertBanner = 0;
		this.displayMode = ``;
		this.records = [
			{ columnOne: `Policyholder`, columnTwo: `R100 000` },
			{ columnOne: `Spouse(18 - 64)`, columnTwo: `R100 000` },
			{ columnOne: `Children (newborn - 5 years)`, columnTwo: `R20 000 each*` },
			{ columnOne: `Children (6 - 13 years)`, columnTwo: `R50 000 each*` },
			{ columnOne: `Children (14 years and older)`, columnTwo: `R60 000 each*` },
			{ columnOne: `Parents (26 - 85 years)`, columnTwo: `R50 000 each*` },
			{ columnOne: `Extended Family (0 - 85 years)`, columnTwo: `R20 000 each*` }
		];
		this.displayNotification = true;
		this.displayToast = true;
		this.isReassigned = false;

		const state = this.horizonStore.recoverState();

		this.incomingCallDetails = state.incomingCallDetails;
		this.nonClient = state.nonClient;
	}

	// ----------
	// PROPERTIES
	// ----------
	static get properties() {
		return {
			benefitScreen: { type: Boolean },
			coverScreen: { type: Boolean },
			claimScreen: { type: Boolean },
			renderMode: { type: Number },
			renderAlertBanner: { type: Number },
			displayMode: { type: String },
			displayNotification: { type: Boolean },
			displayCoverNotification: { type: Boolean },
			displayClaimNotification: { type: Boolean },
			displayToast: { type: Boolean },
			assignReason: { type: Number }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a
	connectedCallback() {
		super.connectedCallback();

		if (this.displayMode === `non-client`) {
			this.renderAlertBanner = RENDER_BANNER.NON_CLIENT;

			this.eventAggregator.publish(
				`mini-client-profile`,
				{
					name: `${this.nonClient.firstName} ${this.nonClient.surname}`,
					idNumber: ``,
					phoneNumber: this.nonClient.cellphone,
					livesIn: ``,
					languagePreference: ``,
					birthday: ``,
					isConfirmed: false
				}
			);

			this.eventAggregator.publish(
				`horizon-update-left-hand-bar`,
				{
					clientType: this.displayMode,
					isProfileButtonVisible: false,
					isDocumentsButtonVisible: false,
					subtitle: {
						savingsAccount: `Active`,
						savingsPlan: `Active`,
						insure: `Active`,
						credit: `Rethink credit, realise dreams`
					},
					detail: {
						savingsAccount: ``,
						savingsPlan: ``,
						insure: ``,
						credit: ``
					}
				}
			);

		} else if (this.displayMode === `unverified-prospective`) {
			this.eventAggregator.publish(
				`horizon-update-left-hand-bar`,
				{
					clientType: this.displayMode,
					isProfileButtonVisible: false,
					isDocumentsButtonVisible: false,
					subtitle: {
						savingsAccount: `Active`,
						savingsPlan: `Active`,
						insure: `One plan, more cover`,
						credit: `Rethink credit, realise dreams`
					},
					detail: {
						savingsAccount: ``,
						savingsPlan: ``,
						insure: ``,
						credit: ``
					}
				}
);
			this.renderAlertBanner = RENDER_BANNER.UNVERIFIED_PROSPECTIVE_CLIENT;
		} else if (this.displayMode === `verified-prospective`) {
			this.eventAggregator.publish(
				`horizon-update-left-hand-bar`,
				{
					clientType: this.displayMode,
					isProfileButtonVisible: true,
					isDocumentsButtonVisible: true,
					subtitle: {
						savingsAccount: `Active`,
						savingsPlan: `Active`,
						insure: `Active`,
						credit: `Rethink credit, realise dreams`
					},
					detail: {
						savingsAccount: ``,
						savingsPlan: ``,
						insure: ``,
						credit: ``
					}
				}
		);
			this.renderAlertBanner = RENDER_BANNER.VERIFIED_PROSPECTIVE_CLIENT;
		}

		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._onAssignIncident());
		this.eventAggregator.subscribe(`verify-now-click`, () => this._onVerifyNowClick());

		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			}
		);

		this.displayNotification = true;
		this.displayCoverNotification = true;
		this.displayClaimNotification = true;

		window.setTimeout(() => this._onToggleToastDisplay(), 3000);
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------
	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onNavigationContextUpdated() {
		// Access the current route's information and log its name, e.g. "screen-one"
		console.log(`Current screen is [${NavigationContext.getInstance().current.route.name}]`);
	};

	_onCalculatePremium() {
		this.renderMode = RENDER_MODE.CALCULATE_PREMIUM;
	}

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onCancelEndCall() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onCloseClick() {
		console.log(`closable button clicked`);
		this.displayNotification = false;
	}

	_onCloseCover() {
		console.log(`closable cover alert clicked`);
		this.displayCoverNotification = false;
	}

	_onCloseClaimAlert() {
		console.log(`closable claim alert clicked`);
		this.displayClaimNotification = false;
	}

	_onToggleToastDisplay() {
		this.displayToast = false;
	}

	_onAssignIncident() {
		this.renderMode = RENDER_MODE.SELECT_ASSIGN_REASON;
	}

	_onCancelSelectAssignReason() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onAssignReasonSelected(e) {
		this.assignReason = e.detail.reason;
		this.renderMode = RENDER_MODE.ASSIGN;
	}

	_onCancelAssign() {
		console.log(`Cancel assign received`);
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onAssign() {
		this.isReassigned = true;
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onVerifyNowClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}
	
	_onCalculatedPremium(e) {
		if (e.detail.assign) {
			this.assignReason = e.detail.assignReason;
			this.renderMode = RENDER_MODE.ASSIGN;
		} else {
			this.renderMode = RENDER_MODE.MAIN_PAGE;
		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			.card{
				height: 876px;
				width: 100%;
			}
			p{
				margin: 0px 0px 0px 0px;
			
			}
			ul{
				height: auto;
				width: 975px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
				margin-top: 8px;
			}
			.info-banner{
				width:100%;
				background-color: #DAF2F4;
				color: #05829B;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 500;
				letter-spacing: 0;
				line-height: 20px;
				--theme-alert-banner-info-border: none;
			}
			.benefit-content{
				height: 100%;
				width: 100%;
			  }
			.calculate-button{
				border: 1px solid white; 
				color: white;
			}
			.label{
				height: 24px;
				width: 265px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin-bottom: 0px;
			}
			.text-area{
				height: 120px;
				width: 1032px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
			}
			.waiver-label{
				height: 24px;
				width: 160px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.waiver-text-area{
				height: 48px;
				width: 1015px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
			}
			.accidental-label{
				height: 24px;
				width: 232px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.accidental-text-area{
				height: 48px;
 				width: 1015px;
  				color: #545D60;
  				font-family: "Hind Vadodara";
 				font-size: 15px;
  				letter-spacing: 0;
  				line-height: 24px;
			}
			.voluntary-label{
				height: 24px;
				width: 162px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.voluntary-text-area{
				height: 48px;
				width: 1015px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
			}
			.newborn-label{
				height: 24px;
				width: 187px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.newborn-text-area{
				height: 48px;
				width: 1015px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
			}
			.premium-label{
				height: 24px;
 				width: 164px;
 				color: #3E4547;
 				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
  				letter-spacing: 0;
  				line-height: 24px;
			}
			.premium-text-area{
				height: 48px;
				width: 1015px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
  				line-height: 24px;
			}
			.burial-label{
				height: 24px;
				width: 133px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.burial-text-area{
				height: 24px;
  				width: 1015px;
  				color: #545D60;
  				font-family: "Hind Vadodara";
  				font-size: 15px;
  				letter-spacing: 0;
 				line-height: 24px;
			}
			.text{
				height: auto;
  				width: 967px;
  				color: #545D60;
  				font-family: "Hind Vadodara";
  				font-size: 15px;
  				letter-spacing: 0;
				line-height: 24px;
				margin-bottom: 16px;
			}
			.life-label{
				height: 24px;
				width: 100%;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.table{
				height: 384px;
				width: 1016px;
				background-color: #FFFFFF;
				margin: 0px;
				border-radius: 5px;
				border: 1px solid #E1E1E1;
				--theme-data-table-border-last-row: none;
			}
			.cover-banner{
				height: 56px;
				width: 1032px;
				color: #08A6B5;
				background-color: rgba(8,166,181,0.15);
				--theme-alert-banner-info-border: none;
				box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				box-sizing: border-box;
			}
			.expander{
				width: auto;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 29px;
			}
			.married-text{
				height: 48px;
				width: 975px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin-top: 0px;
				margin-bottom: 0px;
			}
			.relationship-column{
				height: 464px;
				width: 186px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 29px;
			}
			.claim-label{
				height: 24px;
				width: auto;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin-bottom: 0px;
			}
			capitec-label[column="1"]{
				width: 157px;
				margin: 0px;
				height: auto;
				width: auto;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 29px;
				--theme-label-default-font-weight: 600;
				margin: 10px 0px 10px 0px;
			}
			capitec-expander-group > capitec-expander{
                height: 554px;
            }
            .expander > capitec-label {
                margin: 0px;
            } 
            
            capitec-label[column="2"] {
                width: 500px;
			}
			.documents-claim-label{
				height: 24px;
				width: 1002px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 500;
				letter-spacing: 0;
				line-height: 24px;
				margin-bottom: 10px;
				margin-top: 10px;
			}
			.unverfied-caller-alert{
				height: 48px;
				width: 1032px;
				background-color: rgba(212,120,28,0.1);
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 21px;
				--theme-alert-banner-warning-border: none;
				--theme-alert-banner-height: 48px;
				margin-bottom: 13px;
			}
			.warning-toast{
				--theme-toast-warning-background-color: #f7d3b0;
				--theme-toast-warning-color:#D4781C;
			}
			.toast{
				position: absolute;
				top : 170px;
				left: 790px;
				width : 383px;
				height: 64px;
				z-index: 201;
				left: calc(50.8% - 200px);
				justify-content: center;
				align-items: center;
			}`
		];
	}


	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
		
			<capitec-card class="card">
				<capitec-title-bar class="title-bar" type="insure">
					<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
					<capitec-label label="Insure" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-button class="calculate-button" type="white" label="Calculate Premium"
						@click="${() => this._onCalculatePremium()}">
					</capitec-button>
				</capitec-title-bar>
				<capitec-tab-group class="tabs">
					<capitec-tab label="Benefits">
						${this._renderBenefitContent()}
					</capitec-tab>
					<capitec-tab label="Cover">
						${this._renderCoverContent()}
					</capitec-tab>
					<capitec-tab label="Claim">
						${this._renderClaimContent()}
					</capitec-tab>
				</capitec-tab-group>
			</capitec-card>
			${this._renderDislaimer()}
			${this._renderCalculatePremium()}
			${this._renderEndCallSessionDialog()}
			${this._renderSelectAssignReason()}
			${this._renderAssign()}
			${this._renderVerifyNowModal()}
		`;
	}

	_renderBenefitContent() {
		return html`
				${this._renderNonClientBanner()}
				${this._renderUnverifiedProspectiveClientBanner()}
				${this._renderVerifiedProspectiveClientBanner()}
				<capitec-group class="group">
					<capitec-label class="label" label="What makes our funeral plan unique?" type="strong">
					</capitec-label>
					<ul class="text-area">
						<li>High cover for you and up to 21 dependants all on one plan</li>
						<li>Personalise your plan – only pay what you can afford</li>
						<li>Get lower premiums when you apply on the app</li>
						<li>No automatic annual premium increases – putting you in control</li>
						<li>Simplified claims proccess </li>
					</ul>
					<capitec-label class="waiver-label" label="Waiting Period Waiver" type="strong">
					</capitec-label>
					<p class="waiver-text-area">If you switch from a funeral policy with any other registered insurer and
						that policy’s waiting period is over, we’ll waive your waiting period for
						natural death for the same lives assured and related cover amounts as your previous policy.
					</p>
					<capitec-label class="accidental-label" label="Double Accidental Death Benefit" type="strong">
					</capitec-label>
					<p class="accidental-text-area">
						From day one, the funeral payout is doubled if a life assured dies from unnatural causes.
						For children, this is limited to the maximum cover amounts as prescribed by law.
					</p>
					<capitec-label class="voluntary-label" label="Voluntary Policy Pause" type="strong">
					</capitec-label>
					<p class="voluntary-text-area">Pause your plan for up to 6 months without any monthly premium payments and with no
						cover.
						You can restart your plan any time in the 6-month period to reactivate your cover and premium,
						and get the same full benefits of the plan.</p>
					<capitec-label class="newborn-label" label="Newborn Premium Waiver" type="strong">
					</capitec-label>
					<p class="newborn-text-area">If you apply, you get full cover for up to 6 months without any monthly premium
						payments as
						soon as the policyholder or spouse (also a life assured) gives birth or adopts a child.</p>
					<capitec-label class="premium-label" label="Death Premium Waiver" type="strong">
					</capitec-label>
					<p class="premium-text-area">If the policyholder dies 12 months after policy inception, the remaining life assureds
						on the
						funeral plan will continue to receive full cover for a further 6 months from the date of the
						policyholder's death without any monthly premium payments.</p>
					<capitec-label class="burial-label" label="Burial Repatriation" type="strong">
					</capitec-label>
					<p class="burial-text-area">Repatriation of mortal remains of those covered, to the funeral home of choice closest
						to the place of burial.</p>
				</capitec-group>
		`;
	}

	_renderCoverContent() {
		return html`
				${this._renderCoverBanner()}
				<capitec-label class="life-label" label="Life Assured Categories" type="Title"></capitec-label>
				<p class="text">Get cover for yourself, one spouse and up to 4 parents, 8 children and 8 extended family members – all
					on one plan.</p>
				
				<capitec-table class="table" .items="${this.records}" displayMode="Full">
					<capitec-table-column label="Relationship Types" field="columnOne"></capitec-table-column>
					<capitec-table-column label="Maximum Cover" field="columnTwo" align="right"></capitec-table-column>
				</capitec-table>
				
				<capitec-label class="life-label" type="Subtitle" label="Spouse"></capitec-label>
				<p class="married-text">The person you are married to who is not older than 64 years of age at the cover start date.
					Married for purposes of this contract is when 2 people are:</p>
				<ul>
					<li>Married according to the laws of any sovereign country</li>
					<li>Married according to customary/tribal law</li>
					<li>Married under any religion practised in South Africa</li>
					<li>Living together and financially dependant on one another for at least 6 months</li>
					<li>Party to a civil union in terms of Civil Union Act (2006)</li>
				</ul>
				
				<p class="text">When you have more than one spouse, or if your spouse falls outside the maximum age requirement for a
					spouse, then the additional spouses can be covered as extended family members. </p>
				
				<capitec-label class="life-label" type="Subtitle" label="Parent"></capitec-label>
				<p class="text">Your biological parents, parents-in-law, legal guardians if you are an adopted child and your
					stepparents who are under the age of 86 at the cover start date. Where you have more than 4 parents, additional
					parents can be covered as extended family members.</p>
				<capitec-label class="life-label" type="Subtitle" label="Child"></capitec-label>
				<p class="text">Your child, your spouse’s child or your legally adopted child, stepchild or where you/your spouse are
					the child’s legal guardian. A child must be unmarried and below the age of 25 years.</p>
				
				<capitec-label class="life-label" type="Subtitle" label="Extended Family"></capitec-label>
				<capitec-label class="life-label" type="Subtitle" label="We consider extended family member to be:"></capitec-label>
				
				<capitec-label class="life-label" type="Subtitle " label="Spouse"></capitec-label>
				<p class="text">Where you have more than one spouse, or if your spouse's age falls outside the 18 – 64 years
					requirement, then the additional...</p>
				<capitec-label class="life-label" type="Subtitle" label="Parent"></capitec-label>
				<p class="text">Where you have more than 4 parents, then the additional parents, if they are 85 years or younger, can be
					covered as extended family members.</p>
				<capitec-label class="life-label" type="Subtitle" label="Child"></capitec-label>
				<p class="text">Where you have more than 8 children, or the child falls outside the age requirements of 25 years or
					younger, then the additional children can be covered as extended family members.</p>
				
				<capitec-expander-group modeset="single">
					<capitec-expander label="Relationship to you">
						<capitec-group layout="grid" rows="uniform" columns="auto" gap="none" class="expander">
							<capitec-label label="Brother:" row="1" column="1"></capitec-label>
							<capitec-label row="1" column="2" label="Your parents’ male child"></capitec-label>
							<capitec-label label="Sister:" row="2" column="1"></capitec-label>
							<capitec-label row="2" column="2" label="Your parents’ female child"></capitec-label>
							<capitec-label label="Nephew:" row="3" column="1"></capitec-label>
							<capitec-label row="3" column="2" label="The male child of your brother or sister"></capitec-label>
							<capitec-label label="Niece:" row="4" column="1"></capitec-label>
							<capitec-label row="4" column="2" label="The female child of your brother or sister"></capitec-label>
							<capitec-label label="Brother-in-law:" row="5" column="1"></capitec-label>
							<capitec-label row="5" column="2" label="The male person married to the child of your parents"></capitec-label>
							<capitec-label label="Sister-in-law:" row="6" column="1"></capitec-label>
							<capitec-label row="6" column="2" label="The female person married to the child of your parents"></capitec-label>
							<capitec-label label="Son-in-law:" row="7" column="1"></capitec-label>
							<capitec-label row="7" column="2" label="The male person married your the child"></capitec-label>
							<capitec-label label="Daughter-in-law:" row="8" column="1"></capitec-label>
							<capitec-label row="8" column="2" label="The female person married your the child"></capitec-label>
							<capitec-label label="Aunt:" row="9" column="1"></capitec-label>
							<capitec-label row="9" column="2" label="The sister of your father or mother, or your uncle’s female spouse"></capitec-label>
							<capitec-label label="Uncle:" row="10" column="1"></capitec-label>
							<capitec-label row="10" column="2" label="The brother of your father or mother, or your aunt’s male spouse"></capitec-label>
							<capitec-label label="First cousin:" row="11" column="1"></capitec-label>
							<capitec-label row="11" column="2" label="The child of your aunt or uncle as defined above"></capitec-label>
							<capitec-label label="First cousin' child:" row="12" column="1"></capitec-label>
							<capitec-label row="12" column="2" label="The child of your first cousin as defined above"></capitec-label>
							<capitec-label label="Grandparent:" row="13" column="1"></capitec-label>
							<capitec-label row="13" column="2" label="Your parents’ parent"></capitec-label>
							<capitec-label label="Great-grandparent:" row="14" column="1"></capitec-label>
							<capitec-label row="14" column="2" label="Your parents’ grandparent"></capitec-label>
							<capitec-label label="Grandchild:" row="15" column="1"></capitec-label>
							<capitec-label row="15" column="2" label="Your child’s child"></capitec-label>
							<capitec-label label="Great-grandchild:" row="16" column="1"></capitec-label>
							<capitec-label row="16" column="2" label="Greatgrandchild who is your grandchild’s child"></capitec-label>
						</capitec-group>
					</capitec-expander>
				
					<capitec-expander label="Relationship to your spouse">
						<capitec-group layout="grid" rows="uniform" columns="auto" gap="none" class="expander">
							<capitec-label label="Brother:" row="1" column="1"></capitec-label>
							<capitec-label row="1" column="2" label="Your spouse’s male child"></capitec-label>
							<capitec-label label="Sister:" row="2" column="1"></capitec-label>
							<capitec-label row="2" column="2" label="Your spouse’s female child"></capitec-label>
							<capitec-label label="Nephew:" row="3" column="1"></capitec-label>
							<capitec-label row="3" column="2" label="The male child of your spouse’s brother or sister"></capitec-label>
							<capitec-label label="Niece:" row="4" column="1"></capitec-label>
							<capitec-label row="4" column="2" label="The female child of your spouse’s brother or sister"></capitec-label>
							<capitec-label label="Brother-in-law:" row="5" column="1"></capitec-label>
							<capitec-label row="5" column="2" label="The male person married to the child of your spouse’s parents"></capitec-label>
							<capitec-label label="Sister-in-law:" row="6" column="1"></capitec-label>
							<capitec-label row="6" column="2" label="The female person married to the child of your spouse’s parents"></capitec-label>
							<capitec-label label="Son-in-law:" row="7" column="1"></capitec-label>
							<capitec-label row="7" column="2" label="The male person married your spouse’s child"></capitec-label>
							<capitec-label label="Daughter-in-law:" row="8" column="1"></capitec-label>
							<capitec-label row="8" column="2" label="The female person married your spouse’s child"></capitec-label>
							<capitec-label label="Aunt:" row="9" column="1"></capitec-label>
							<capitec-label row="9" column="2" label="The sister of your spouse’s father or mother, or your spouse’s uncle’s female spouse"></capitec-label>
							<capitec-label label="Uncle:" row="10" column="1"></capitec-label>
							<capitec-label row="10" column="2" label="The brother of your spouse’s father or mother, or your spouse’s aunt’s male spouse"></capitec-label>
							<capitec-label label="First cousin:" row="11" column="1"></capitec-label>
							<capitec-label row="11" column="2" label="The child of your spouse’s aunt or uncle as defined above"></capitec-label>
							<capitec-label label="First cousin' child:" row="12" column="1"></capitec-label>
							<capitec-label row="12" column="2" label="The child of your first cousin as defined above"></capitec-label>
							<capitec-label label="Grandparent:" row="13" column="1"></capitec-label>
							<capitec-label row="13" column="2" label="Your spouse’s parents’ parent"></capitec-label>
							<capitec-label label="Great-grandparent:" row="14" column="1"></capitec-label>
							<capitec-label row="14" column="2" label="Your spouse’s parents’ grandparent"></capitec-label>
							<capitec-label label="Grandchild:" row="15" column="1"></capitec-label>
							<capitec-label row="15" column="2" label="Your spouse’s child’s child"></capitec-label>
							<capitec-label label="Great-grandchild:" row="16" column="1"></capitec-label>
							<capitec-label row="16" column="2" label="Greatgrandchild who is your spouse’s grandchild’s child"></capitec-label>
						</capitec-group>
					</capitec-expander>
				</capitec-expander-group>
		`;
	}

	_renderClaimContent() {
		return html`
			${this._renderClaimAlert()}
			<capitec-label class="claim-label" type="Subtitle" label="Ways to claim"></capitec-label>
			<ul>
				<li>Email FuneralClaims@capitecbank.co.za</li>
				<li>Visit a branch</li>
			</ul>
			<capitec-label class="claim-label" type="Subtitle" label="Documents needed"></capitec-label>
			<p class="documents-claim-label">Once all documents are received, your claim will be processed and the money paid into
				your Capitec account immediately after your claim is approved.</p>
			<capitec-label class="claim-label" type="Subtitle" label="Natural Death claims"> </capitec-label>
			<ul>
				<li>Original or certified copy of the death certificate</li>
				<li>Fully completed BI-1663/BI-1680 or DHA-1663/DHA-1680 form BI-1663/BI-1680:</li>
				<li>This is a notification of death or stillbirth completed by the Department of Home Affairs</li>
				<li>DHA-1663/DHA-1680: This is a Death Report that will be issued after a death has been registered</li>
				<li>The valid identity document of the claimant</li>
				<li>The valid identity document of the beneficiary</li>
				<li>Beneficiary’s bank, bank account number and branch code if the beneficiary is not a Capitec Bank accountholder
				</li>
				<li>Any other documents/reports which we need to assess the validity of the claim</li>
			</ul>
			<capitec-label class="claim-label" type="Subtitle" label="In addition to the above documents, for"></capitec-label>
			<capitec-label class="claim-label" type="Subtitle" label="Accidental Death claims"></capitec-label>
			<ul>
				<li>A police report with the deatils of the cause of death</li>
			</ul>
			<capitec-label class="claim-label" type="Subtitle" label="Newborn Premium Waiver claims"></capitec-label>
			<ul>
				<li>An unabridged birth certificate</li>
			</ul>
			<capitec-label class="claim-label" type="Subtitle" label="Voluntary Premium Pause claims"></capitec-label>
			<ul>
				<li>A reason as to why you want to activate the benefit, no additional documents required</li>
			</ul>
			<capitec-label class="claim-label" type="Subtitle" label="Waiting Period Waiver"></capitec-label>
			<ul>
				<li>Policy schedule of previous policy showing that the cover was in force at the time of the Capitec policy
					acceptance</li>
			</ul>
			
		`;
	}

	_renderDislaimer() {
		if (this.renderMode === RENDER_MODE.DISCLAIMER) {
			return html`<horizon-non-advisory-disclaimer 
				@click="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
			</horizon-non-advisory-disclaimer>`;
		}
	}

	_renderCalculatePremium() {
		if (this.renderMode === RENDER_MODE.CALCULATE_PREMIUM) {
			return html`
				<horizon-calculate-premium 
					.incomingCallDetails="${this.incomingCallDetails}"
					@cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"
					@done="${(e) => this._onCalculatedPremium(e)}">
				</horizon-calculate-premium>`;
		}
		return html``;
	}

	_renderNonClientBanner() {
		if (this.renderAlertBanner === RENDER_BANNER.NON_CLIENT && this.displayNotification) {
			return html`
				<capitec-alert-banner class="info-banner" type="info" closable @click="${() => this._onCloseClick()}">
					All Capitec Funeral Plan are subject to terms and conditions, including limitiations and exclusions.
				</capitec-alert-banner>`;
		}
		return html``;
	}

	_renderCoverBanner() {
		if (this.displayCoverNotification) {
			return html`
				<capitec-alert-banner class="cover-banner" type="info" closable @click="${() => this._onCloseCover()}">
					*Legal maximum child cover. The total amount payable in the event of the death of a child is restricted by
					legislation. The restriction is
					<br>&nbsp; applicable to the life (ID) across all insurers and their recorded policies.
				</capitec-alert-banner>`;
		}
		return html``;
	}

	_renderClaimAlert() {
		if (this.displayClaimNotification) {
			return html`
				<capitec-alert-banner class="info-banner" type="info" closable @click="${() => this._onCloseClaimAlert()}">
					All Capitec Funeral Plan are subject to terms and conditions, including limitiations and exclusions.
				</capitec-alert-banner>`;
		}
		return html``;
	}

	_renderUnverifiedProspectiveClientBanner() {
		if (this.renderAlertBanner === RENDER_BANNER.UNVERIFIED_PROSPECTIVE_CLIENT && this.displayNotification) {
			return html`
				${this._renderUnverifiedToast()}
				<capitec-alert-banner class="unverfied-caller-alert" type="warning" closable @click="${() => this._onCloseClick()}">
					Client has not been verified, so you are only able to see limited information.
					<capitec-hyperlink href="#" label="Verify Now">
					</capitec-hyperlink>
				</capitec-alert-banner>`;
		}
		return html``;
	}

	_renderVerifiedProspectiveClientBanner() {
		if (this.renderAlertBanner === RENDER_BANNER.VERIFIED_PROSPECTIVE_CLIENT && this.displayNotification) {
			return html`
				${this._renderVerifiedToast()}
				<capitec-alert-banner class="info-banner" type="info" closable @click="${() => this._onCloseClick()}">
					All Capitec Funeral Plan are subject to terms and conditions, including limitiations and exclusions.
				</capitec-alert-banner>`;
		}
		return html``;
	}

	_renderVerifiedToast() {
		if (this.renderAlertBanner === RENDER_BANNER.VERIFIED_PROSPECTIVE_CLIENT && this.displayToast) {
			return html`
				<capitec-toast class="toast" type="success" header="Successful" detail="Client has been verified">
				</capitec-toast>`;
		}
		return html``;
	}

	_renderUnverifiedToast() {
		if (this.renderAlertBanner === RENDER_BANNER.UNVERIFIED_PROSPECTIVE_CLIENT && this.displayToast) {
			return html`
				<capitec-toast class="toast" type="warning" header="Not Verified" detail="Only limited information will be display">
				</capitec-toast>
				`;
		}
		return html``;
	}

	_renderEndCallSessionDialog() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session 
					@on-cancel="{${() => this._onCancelEndCall()}}"
					.incomingCallDetails="${this.incomingCallDetails}" 
					.isReassigned="${this.isReassigned}">
				</horizon-end-call-session>`;
		}
		return html``;
	}

	_renderSelectAssignReason() {
		if (this.renderMode === RENDER_MODE.SELECT_ASSIGN_REASON) {
			return html`
				<horizon-insure-assign-reason 
					@on-assign-reason=${(e) => this._onAssignReasonSelected(e)}
					@on-cancel=${() => this._onCancelSelectAssignReason()}>
				</horizon-insure-assign-reason>`;
		}
		return html``;
	}

	_renderAssign() {
		if (this.renderMode === RENDER_MODE.ASSIGN) {
			return html`
				<horizon-assign-reason-selected 
					.selectedReason="${this.assignReason}" 
					@on-cancel=${() => this._onCancelAssign()}>
				</horizon-assign-reason-selected>`;
		}
		return html``;
	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`<horizon-verify-caller .incomingCallDetails=${this.incomingCallDetails}></horizon-verify-caller>`;
		}
		return html``;
	}
}

window.customElements.define(`horizon-insure-information`, InsureInformation);