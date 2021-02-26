import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/Feedback';

const RENDER_MODE = Object.freeze({
    FEEDBACK : 0
});
/**
 * Search Other Need component
 *
 * Events Raised
 * -------------
 * back
 * 
 * @export
 * @class SearchOtherNeed
 * @extends {View}
 */

 export class SearchOtherNeed extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.solutionDisplay = false;
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.chooseNeed = true;
		this.chooseIssue = true;
		this.solutionDisplay = false;
		this.someObject = { code: 'AL', text: 'Alabama' };
		this.searchObject = [
			{code: 'ATM', text: 'ATM' },
			{code: 'Category 2', text: 'Category 2' },
			{code: 'Category 3', text: 'Category 3' },
			{code: 'Category 4', text: 'Category 4' },
			{code: 'Category 5', text: 'Category 5' }
		]
		this.specificNeedObjects =
		[
			{code: 'Option 1', text: 'Option 1' },
			{code: 'Option 2', text: 'Option 2' },
			{code: 'Option 3', text: 'Option 3' },
			{code: 'Option 4', text: 'Option 4' }
		]
		this.issueTypeObjects =
	[
		{code: 'Option 1', text: 'Unauthorized transaction - ATM Retain...' },
			{code: 'Option 2', text: 'Capitec ATM - Cash did not dispense' },
			{code: 'Option 3', text: 'Capitec ATM - Cash dispensed short' },
			{code: 'Option 4', text: 'CF not available at the ATM' }
	]
this.dataObjects = [
	this.someObject,
	{ code: 'AK', text: 'Alaska' },
	{ code: 'OK', text: 'Oklahoma' },
	{ code: 'NM', text: 'New Mexico' },
	{ code: 'NY', text: 'New York' },
	{ code: 'TX', text: 'Texas' },
	{ code: 'TN', text: 'Tennessee' },
	{ code: 'NJ', text: 'New Jersey' }
        ];

        this.incomingCallDetails = this.state.incomingCallDetails;
        this.strackURL = `http://strackdevnlb.int.capinet/HEAT/?Scope=SelfService&CommandId=Open&Tab=Incident%23&ItemId=$incidentRecId&frameless=false`
        this.incidentRecId = incomingCallDetails.incidentRecId; // "76E4F06B294147D2A295FE5AA02C9138"

	}
	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} searchOtherNeed Contains list of other needs
	 *
	 * @readonly
	 * @static
	 * @memberof SearchOtherNeed
	 */
	static get properties() {
        return {
            incomingCallDetails: {type: Object},
			searchOtherNeed: { type: Object },
			chooseNeed: {type: Boolean},
			chooseIssue: {type: Boolean},
			solutionDisplay: {type: Boolean}
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		//initate back to favourite transactions page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// PRIVATE METHODS
	_searchOtherNeed(e){
		this.chooseNeed = false;
		if (e = null) {
			this.chooseNeed = true;
		}
	}
	_searchSpecificNeed(e) {
		this.chooseIssue = false;
	}
	_chooseIssueType(e) {
		this.solutionDisplay = true;
	}

	_onLaunchStrackClick() {
        this.strackURL = this.strackURL.replace("$incidentRecId", this.incidentRecId);
        window.open(this.strackURL);
        this.renderMode = RENDER_MODE.FEEDBACK;
	}
// ---------
	// RENDERING
	// ---------
	
	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				.other-need {
					height: 888px;
					width: 1064px;
					box-sizing: border-box;
					border: 1px solid #E1E1E1;
					border-radius: 5px;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				capitec-card > capitec-group:first-child {
					--theme-layout-gap-spacing: 0px;
				}
				capitec-title-bar {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-padding: 0px 0px 0px 16px;
				}
				capitec-title-bar > capitec-icon {
					cursor: pointer;
					margin-right: 34px;
				}
				capitec-group > capitec-title-bar {
					--theme-titlebar-min-height: 20px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
					padding-top: 3px;
					padding-bottom:3px;
					border-top: 0px solid #E1E1E1;
				}
				capitec-content-box{
					height: 645px;
				}
				.otherneed-action-bar {
					height: 56px;
					--theme-actionbar-padding: 8px 16px 8px 16px;
					--theme-actionbar-min-height: 64px;
					--theme-actionbar-item-gap: 8px;
				}
				.otherneed-action-bar > capitec-text-field {
					height: 49px;
					width: 333px;
					--theme-input-label-font-color: #969B9D;
				}
				.otherneed-action-bar > capitec-select {
					height: 49px;
					width: 333px;
					--theme-input-label-font-color: #969B9D;
				}
				#id-button-group {
					justify-content: right;
					padding: 16px;
				}
				#button-right {
					margin-right: 16px;
				}
				.solution-heading {
 					color: #3E4547;
 					font-size: 16px;
 					font-weight: 600;
 					letter-spacing: 0;
 					line-height: 20px;
				}
				.solution-content {
					line-height: 20px;
					color: #3A3A3A;
					font-size: 15px;
					letter-spacing: 0;
				}
				.strack-heading {
					margin-left: -10px;
					font-size: 15px;
					font-weight: 600;
					line-height: 20px;
				}
				.strack-solution-content {
					display: inline;
					line-height: 20px;
					color: #3A3A3A;
					font-size: 15px;
					letter-spacing: 0;
				}
				/* No Results CSS */
				.search-icon {
					margin-top: 92px; 
					/* change to capitec group */
				}
				.find-need {
					margin-top: 13px;
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.strack-button {
					padding-right: 16px;
				}
			`
		];
	}
	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="other-need">
			<capitec-title-bar type="default">
				<capitec-icon 
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Other Need" type="title"></capitec-label>
			</capitec-title-bar>
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
				
				${this._renderActionBar()}
				</capitec-group>
				
				<capitec-group layout="vertical" gap="line" halign="center" valign="center">
				
				${this._renderNoResults()}
				</capitec-group>
				<capitec-group layout="vertical" gap="line" halign="right" valign="bottom">
				
				${this._renderSolution()}
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar type="default">
				<capitec-icon 
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Other Need" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	// render search 
	_renderActionBar() {
		//add if statement to render next text boxes/drop downs
		// must have a hidden property for the text field
		//create an object 3 properties- hidden object should set to false when properties are populated
		//@input="${(e) => this._searchOtherNeed(e)}"
		return html`
			<capitec-action-bar class="otherneed-action-bar">
				<capitec-text-field 
					label="Search client need"
					.items="${this.searchObject}"
					display-field="text"
					id-field="code"
					type="search"
					keyboardMode="alpha-numeric"
					@value-changed="${(e) => this._searchOtherNeed(e)}">
				</capitec-text-field>
				<capitec-select 
					label="Choose specific need" 
					.items="${this.specificNeedObjects}"
					display-field="text"
					id-field="code"
					.value="Search specific need"
					?hidden = ${this.chooseNeed}
					@value-changed="${(e) => this._searchSpecificNeed(e)}"
					searchable>
				</capitec-select>
				<capitec-select 
					label="Choose issue type" 
					.items="${this.issueTypeObjects}"
					display-field="text"
					id-field="code"
					.value="Search specific need"
					?hidden = ${this.chooseIssue}
					@value-changed="${(e) => this._chooseIssueType(e)}"
					searchable>
				</capitec-select>
			</capitec-action-bar>
		`;
	}

	_renderSolution() {
		if (this.solutionDisplay) {
		return html`
		
		<capitec-title-bar type="default" label="Solution"></capitec-title-bar>
			<capitec-content-box>
				<capitec-label class="solution-heading" type="subtitle" label="Minimum Information Needed"></capitec-label>
			
					<capitec-group layout="vertical" gap="none" halign="left" valign="top">
						<capitec-label class="solution-content" type="default" 
						label="Client ID number"></capitec-label> 
						<capitec-label class="solution-content" type="default" halign="left" 
						label="Savings account number"></capitec-label>
						<capitec-label class="solution-content" type="default" halign="left" 
						label="Amount of Disputed transaction/s"></capitec-label>
						<capitec-label class="solution-content" type="default" halign="left" 
						label="Transaction Date range"></capitec-label>
						<capitec-label class="solution-content" type="default" halign="left" 
						label="Transaction time"></capitec-label>
						<capitec-label class="solution-content" type="default" halign="left" 
						label="Client preferred method of contact along with contact information"></capitec-label>
						<capitec-label class="solution-content" type="default" halign="left" 
						label="Masked Card number"></capitec-label>
					</capitec-group>
				<capitec-label class="solution-heading" type="subtitle" label="Background"></capitec-label>
					<capitec-group layout="vertical" gap="none" halign="left" valign="top">
						<capitec-label class="solution-content" type="default" 
						label="This is when a Capitec Bank client/cardholder does a withdrawal at a foreign MasterCard (overseas) ATM and the cash either does not dispense at all or only part of the requested amount dispensed."></capitec-label> 
					</capitec-group>

			
				<capitec-label class="solution-heading" type="subtitle" label="Steps"></capitec-label>
			
				<capitec-label class="strack-heading" type="subtitle" label="STrack-info"></capitec-label>
					<capitec-group layout="vertical" gap="none" halign="left" valign="top">
						<li><capitec-label class="strack-solution-content" type="default" label="Complete client savings account number in Client ID field."></capitec-label></li>
						<li><capitec-label class="strack-solution-content" type="default" halign="left" label="Complete the details in the Incident Detail Tab"></capitec-label></li>
						<li><capitec-label class="strack-solution-content" type="default" halign="left" label="Capture the minimum information and the reason for the cardholders dispute in the description box"></capitec-label></li>
					</capitec-group>
				<capitec-label class="strack-heading" type="subtitle" label="2.	Hand Off"></capitec-label>
					<capitec-group layout="vertical" gap="none" halign="left" valign="top">
						<li><capitec-label class="strack-solution-content" type="default" halign="left" label="Hand off the incident to Card disputes."></capitec-label></li>
						<li><capitec-label class="strack-solution-content" type="default" halign="left" label="Inform the client that this enquiry can take up to 5 days to investigate."></capitec-label></li>
						<li><capitec-label class="strack-solution-content" type="default" halign="left" label="Inform client that Card Disputes will contact client with feedback."></capitec-label></li>
						<li><capitec-label class="strack-solution-content" type="default" halign="left" label="Provide the client with the Incident Number and end the call."></capitec-label></li>
					</capitec-group>
			</capitec-content-box>
		<capitec-group layout="vertical" gap="line" halign="right" valign="bottom">
			<capitec-button class="strack-button" type="primary" label="Launch STrack" @click="${() => this._sTrackClick()}">
			</capitec-button>
		</capitec-group>
		`;
		}
	}

	_renderNoResults() {
		 if (this.solutionDisplay) {
			return html ``;
		} 
		else{
				return html`
				<capitec-group layout="vertical" halign="center" valign="center" gap ="clear"  >
				<img src="/images/common/search.svg" class="search-icon"  />
				<capitec-label 
					class="find-need"
					label="Find other need"
					type="strong"
					></capitec-label>
				<capitec-label
					class="find-need-second"
					label="Search a client need not currently on Horizon"
					type="strong"
					 >
				</capitec-label>
				</capitec-group>
				`;
     }
	}

     _renderFeedback() {
         if (this.renderMode === RENDER_MODE.FEEDBACK) {
             return html`
         <horizon-feedback>

         </horizon-feedback>
         `;
         }
         return html``;
     }

 }
 
customElements.define(`search-other-need`, SearchOtherNeed);