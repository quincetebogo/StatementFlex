import { View, css, html } from 'platform/elements';

const FEEDBACK_OPTIONS = {
    FULFILLED: 0,
    ASSIGNED: 1,
    INCOMPLETE: 2
};

export class Feedback extends View {
   /*
    * INITIALIZATION
    */
    constructor() {
        super();

        //VARIABLES
        this.alertBannerMessage = ``;
        this.selectedFeedback = -1;
    }

    // ----------
    // PROPERTIES
    // ----------

    static get properties() {
        return {
            alertBannerMessage: { attribute: false },
            selectedFeedback: { attribute: false }
        };
    }


   /*
    * LIFECYCLE OVERRIDES
    */
    connectedCallback() {
        super.connectedCallback();
        this.selectedFeedback = -1;
    }

    /*
     * EVENT HANDLERS
     */

    _doneClick() {
        if (this.selectedFeedback == -1) {
            this.alertBannerMessage = "Please choose an option:";
        }
        else {
            console.log(this.selectedFeedback);
            //TODO: Should be navigated to favourites landing page
            this.horizonRouter.navigateToQuickTransactionFavourites();

        }
    }

    _onValueChanged(e) {
        if (e.detail.new && e.currentTarget.id === `id-fulfilled`) {
            this.selectedFeedback = FEEDBACK_OPTIONS.FULFILLED;
        } else if (e.detail.new && e.currentTarget.id === `id-assigned`) {
            this.selectedFeedback = FEEDBACK_OPTIONS.ASSIGNED;
        } else if (e.detail.new && e.currentTarget.id === `id-incomplete`) {
            this.selectedFeedback = FEEDBACK_OPTIONS.INCOMPLETE;
        }
        this.alertBannerMessage = ``;
    }

    _isNullorEmpty(fieldValue) {
        return fieldValue === `` || fieldValue === null || fieldValue === undefined;
    }

   /*
    * RENDERING
    */

    static get styles() {
    return [
        super.styles,
        css`

			div[slot="footer"]{
				margin-right:4px;
			}
			.feedback-label{
				height: 24px;
				width: 275px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin-top: 16px;
				margin-bottom: 16px;
			}
			.body-class{
				width: 531px;
				height: 273px;
				margin-left:16px;
				margin-right: 16px;	
			}

			capitec-radio{
				margin: 12px 0px 12px 16px;	
			}

			.radio-button-container{
				height: 48px;
				padding: 0px;
				margin: 4px 0px 4px 0px;
				box-sizing: border-box;
				border-style: solid;
				border-width: thin;
				border-radius: 5px;
				border-color: lightgrey;
			}
			capitec-modal {
				width: 531px;
				height: 721px;
				--theme-modal-header-padding-left: 16px;
                --theme-modal-header-color: #3A3A3A;
                --theme-modal-header-background-color: #F7F7F7;
                --theme-modal-header-padding-top: 20px;
                --theme-modal-header-padding-bottom: 20px;
			}

			.err-body{
				width: 531px;
				height: 290px;
				margin-left:16px;
				margin-right: 16px;	
			}

			.alert-banner{
				margin-top:16px;
				height:48px;
			}

			.label-err-message{
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
			}
			`];
    }

    _mobileTemplate() {
        _webTemplate();
    }

    _webTemplate() {
        return html`
		<capitec-modal type="free" header-align="left" header="Give Feedback">
			<div slot="body" class="${this.alertBannerMessage ? `err-body` : `body-class`} ">
				${this._renderAlertBanner()}
				${this._renderRadioButtons()}
			</div>
			<div slot="footer" class="footer-class">
				${this._renderFooter()}
			</div>
		</capitec-modal>
          `;
    }

    _renderAlertBanner() {
        if (!this._isNullorEmpty(this.alertBannerMessage)) {
            return html`
		<capitec-alert-banner type="unsuccessful-red" class="alert-banner">
			<capitec-group layout="horizontal">
				<capitec-label label="${this.alertBannerMessage}" class="label-err-message"></capitec-label>
			</capitec-group>
		
		</capitec-alert-banner>
		 	`;
        } else {
            return html``;
        }
    }

    _renderRadioButtons() {
        return html`
		<capitec-label class="feedback-label" label="What was the outcome on STrack?" tabindex="-1"> </capitec-label>
		<capitec-radio-group>
			<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
				<capitec-radio id="id-fulfilled" @value-change="${(e) => this._onValueChanged(e)}" label="Need fulfilled">
				</capitec-radio>
			</capitec-group>
			<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
				<capitec-radio id="id-assigned" @value-change="${(e) => this._onValueChanged(e)}"
					label="Need was assigned/handed off">
				</capitec-radio>
			</capitec-group>
			<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
				<capitec-radio id="id-incomplete" @value-change="${(e) => this._onValueChanged(e)}" label="Need incomplete">
				</capitec-radio>
			</capitec-group>
		</capitec-radio-group>
		`
    }

    _renderFooter() {
        return html`
		<capitec-button id="id-done-button" type="primary" label="Done" @click="${(e) => this._doneClick(e)}">
		</capitec-button>
		`
    }

}
customElements.define(`horizon-feedback`, Feedback);
