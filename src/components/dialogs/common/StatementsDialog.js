import { Component, css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { EventAggregator, NavigationContext } from 'platform/core';
import 'platform/components/popups/Modal';

/**
 * View and email statements based on account selection and date range.
 * This component will be called from the favourites screen statements option as well as related options component. (TODO)
 * 
 * Events Raised 
 * -------------
 * date range selction
 * cancel
 * send
 *  
 * @export
 * @class StatementsDialog
 * @extends {Component}
 */
export class StatementsDialog extends Component {

    // --------------
    // INITIALISATION
    // --------------

    constructor() {

        super();

        this.currentStep = 1;
        this.horizonStore = HorizonStore.getInstance();
		this.state = this.horizonStore.recoverState();
		this.navigationContext = NavigationContext.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		
		this.callerInformation = this.state.callerInformation;
        this.landingPageInfo = this.state.landingPageInfo;
		this.accountInformation = this.state.leftBarButtonConfig.detail;

		//TODO: Remove unused 
		this.availableSavings = "R" + this.accountInformation.savingsAccount;
		this.availableSavingsPlans = "R" + this.accountInformation.savingsPlan;
		this.availableCredit = "R" + this.accountInformation.credit;
		this.savingsPlans = null;
		this.savingsPlansSelected = false;
		this.periodSelected = false;
		this.showDatePicker = false;
		this.showCalendar = false;
		this.showHide = "hide";
		this.range;
		this.startDate;
		this.endDate;
		this.email = "";
		this.confirmEmail = "";
		this.emailError = "";
		this.confirmError = "";
		this.displayDialog = "open";
		this.displayPDF = false;
		this.statementsHeader = "Statements";
		this.accountSelected = "savingsAccount";
		this.savingsPlanSelected = null;
		this.statementPeriod;
		this.statmentDays;
		this.infoOrError = "info";
		this.focusTransact = "";
		this.focusSave = "";
		this.focusCredit = "";
		this.savingsPlanFocus = "";
		this.firstPeriod = "";
		this.choosePeriodFocus = "";
		this.nextSend = "Next";

        this._accountSelectionChanged();
        this._updateStep(this.currentStep);
        this._changePeriodSelection();


        this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), (ex) => this._sendingError(ex));

    }

    static get properties() {
        return {
            currentStep: { type: Number },
            availableSavings: { type: Number },
            accountSelect: { type: String },
            availableSavingsPlans: { type: Number },
            availableCredit: { type: Number },
            infoBannerMessage: { type: String },
            savingsPlans: { type: Object },
            period: { type: Object },
            showDatePicker: { type: Boolean },
            showCalendar: { type: Boolean },
            startDate: { type: String },
            endDate: { type: String },
            range: { type: Number },
            showHide: { type: String },
            email: { type: String },
            emailError: { type: String },
            confirmError: { type: String },
            displayDialog: { type: String },
            displayPDF: { type: String },
            statementsHeader: { type: String },
            infoOrError: { type: String }
        };
    }


    // --------------
    // EVENT HANDLERS
    // --------------

    connectedCallback() {
        //Holding values
        super.connectedCallback();
    }

    _cancel() {
        this.dispatchEvent(new CustomEvent(`cancel`, {}));
    }

    _clearErrors() {
        this.infoOrError = "info";
        this.emailError = "";
        this.confirmError = "";
    }

    _updateStep(e) {
        this.currentStep = e;
        if (this.currentStep == 2) {
            this.infoOrError = "info";
            this.infoBannerMessage = "A fee will be charged for email statements";
        } else {
            this.infoBannerMessage = "Did you know you can email statements from the app for free?";
        }

        if (this.currentStep > 1) {
            this.showHide = "show";
        } else {
            this.showHide = "hide";
        }
    }

    _navigateSteppers(e, btn) {
        console.log(e)
        if (this.currentStep == 1 && e.type == "click") {
            if (btn == "next") {
                if (this.accountSelected == null) {
                    this.infoOrError = "error";
                    this.errorBannerMessage = "Select an account."
                } else {
                    this.showHide = "show";
                    this.infoOrError = "info";
                    this.currentStep++;
                }
            } else if (btn == "cancel") {
                this.displayDialog = "close";
            }
        } else if (this.currentStep == 2 && e.type == "click") {
            if (btn == "next") {
                if (!this.periodSelected || !this.showDatePicker || !this.showCalendar) {
                    this.infoOrError = "error";
                    this.errorBannerMessage = "Select a statement period."
                } else {
                    this.infoOrError = "info";
                    this.nextSend = "Send";
                    this.currentStep++;
                }
            } else if (btn == "back") {
                this.currentStep--;
            } else if (btn == "cancel") {
                this.displayDialog = "close";
            }
        } else if (this.currentStep == 3 && e.type) {
            if (btn == "next") {
                if (this.email.length == 0) {
                    this.infoOrError = "error";
                    this.errorBannerMessage = "Complete all fields."
                } else {
                    this.displayDialog = "close";
                    //send statement service call
					this._sendStatement();
                }
            } else if (btn == "back") {
                this.currentStep--;
            } else if (btn == "cancel") {
                this.displayDialog = "close";
            }
        }
    }


    _formatDate(dateToFormat) {
        var tempdate = dateToFormat.toISOString().slice(0, 10);
        return tempdate;
    }


   async _sendStatement() {
            const state = {
                //still to fill these in
            };

            this.horizonStore.saveState(state);

            const statement = {
                "emailAddress": this.email,
                "cifNumber": this.callerInformation.cifNumber,
                "accountNumber": this.landingPageInfo.account_number,
                "accountType": this.accountSelected,
                "statementDateRange": {
                    "dateRange": {
                        "startDate": this._formatDate(this.startDate),
                        "endDate": this._formatDate(this.endDate)
                    },
                    "presetInterval": ""
                }
            };

            const returnValue = await this.quickTransactionService.sendStatement(statement);

            if (returnValue.succeeded) {
                //TODO: Ramesh to add navigation to successfull page
               this.horizonRouter.navigateToStatementSent();
            } else {
                //TODO: Unsuccessful page nav
               this.horizonRouter.navigateToStatementNotSent();
            }
        }
    

    //value of account selction
    _accountSelectionChanged(e, name) {
        //account and sub account selection under savings plans
        //get card and account details
        if (e) {
            if (name !== null || name !== undefined) {
                this.infoOrError = "info";
            }

            if (name == "savingsAccount") {
                this.focusTransact = "transactFocus";
                this.focusSave = "";
                this.focusCredit = "";

                this.accountSelected = name;
                console.log(this.accountSelected)
            }

            if (name == "savingsPlan") {
                this.focusSave = "saveFocus";
                this.focusTransact = "";
                this.focusCredit = "";

				this.savingsPlansSelected = name;
				this.accountSelected = name;
				console.log(this.accountSelected)
				this._renderSavingsPlanSelection();
			} else {
				this.savingsPlansSelected = false;
			} 
	
			if (name == "credit") {
				this.focusCredit = "creditFocus";
				this.focusSave = "";
				this.focusTransact = "";

				this.accountSelected = name;
				console.log(this.accountSelected)
			}
		} else {
			if (this.accountSelected == "savingsAccount") {
				this.focusTransact = "transactFocus";
				this.focusSave = "";
				this.focusCredit = "";

				console.log(this.accountSelected)
			}
		}

        //TODO: Loop through clients savings plans
        this.savingsPlans = [
            {
                value: 1,
                name: "Name",
                amount: "R " + "546844.25"
            },
            {
                value: 2,
                name: "Name 1",
                amount: "R " + "504.25"
            }
        ]
    };

    _savingsPlanChanged(e, savingsPlan) {
        console.log(e)
        if (e) {
            this.savingsPlanSelected = savingsPlan;
            this.savingsPlanFocus = "savingsPlanFocus";
        }
    }

    _changeDateRange(days) {
        this.startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        this.endDate = new Date();
        this.range = days;
    }

    _periodChange(e, days) {
        var currentDays = days;
        this.statementPeriod = days / 30 + " months (" + days + " days)";
        this.statmentDays = "Last " + days + " days";
        console.log(this.periodSelected)
        if (e.detail.new !== e.detail.old) {
            this.showCalendar = false;
        }
        if (e.currentTarget.checked) {
            this.showDatePicker = true;
            this._changePeriodSelection(currentDays);
        }
    }

    //change message according to the step in the statements roadmap
    _changePeriodSelection(period) {
        this.infoOrError = "info";
        if (period == "30") {
            this.periodSelected = "30";
            this.firstPeriod = "choosePeriodFocus";
            this.secondPeriod = "";
            this.thirdPeriod = "";
            this.forthPeriod = "";
            this._changeDateRange(30);
        } else if (period == "90") {
            this.periodSelected = "90";
            this.secondPeriod = "choosePeriodFocus";
            this.firstPeriod = "";
            this.thirdPeriod = "";
            this.forthPeriod = "";
            this._changeDateRange(90);
        } else if (period == "180") {
            this.periodSelected = "180";
            this.thirdPeriod = "choosePeriodFocus"
            this.firstPeriod = "";
            this.secondPeriod = "";
            this.forthPeriod = "";
            this._changeDateRange(180);
        } else if (period == "270") {
            this.periodSelected = "270";
            this.forthPeriod = "choosePeriodFocus";
            this.firstPeriod = "";
            this.secondPeriod = "";
            this.thirdPeriod = "";
            this._changeDateRange(270);
        }


    }

    _calendarSelectionChange(e) {
        var newDate = e.detail.new.date;
        var dateDiff = this.range;
        var rangeDiff = (this.endDate.getTime() - newDate.getTime()) / (1000 * 3600 * 24);
        var roundedRangeDiff = Math.floor(rangeDiff);

        console.log(rangeDiff)

        if (roundedRangeDiff > dateDiff) {
            this.infoOrError = "error";
            this.errorBannerMessage = "Out of range."
        }
        if (roundedRangeDiff == dateDiff || roundedRangeDiff < dateDiff) {
            this.infoOrError = "info";
        }
    }

    _showDateRange(e) {
        this.showCalendar = e.currentTarget.checked;
    }

    _emailFormatCheck(e) {
        var regCheck = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (e.detail.new.length > 1) {
            if (regCheck.test(e.detail.new)) {
                this.email = e.detail.new;
                console.log(e.detail.new);
                return true;
            } else {
                this.emailError = "Invalid email format";
                return false;
            }
        } else if (e.detail.new.length < 1 || e.detail.new !== e.detail.old) {
            this.emailError = "";
        } else {
            this.infoOrError = "info";
        }
    }
    _emailInput(e) {
        if (e) {
            this.infoOrError = "info";
        }
    }

	_confirmEmailMatch(e) {
		if(e.detail.new.length > 1) {
			this.confirmEmail = e.detail.new;
			if(this.confirmEmail !== this.email) {
				this.confirmError = "Emails do not match";
			} else {
				this.confirmError = "";

            }
        } else {
            this.confirmError = "";
        }
    }

	async _viewPDF() {
		this.displayPDF = true;
		this.statementsHeader = "View Document";

		// const returnValue = await this.quickTransactionService.viewStatement();
		// console.log(returnValue);
	}

    _closePDF() {
        this.displayPDF = false;
        this.statementsHeader = "Statements";
    }

    _sendingError(exception) {
        return true;
    }

    static get styles() {
        return [
            super.styles,
            css`
			.statementsModal {
				height: 930px;
				width: 976px;
			}
			capitec-modal {
				--theme-modal-header-height: 64px;
				--theme-modal-header-font-size: 18px;
				--theme-modal-header-padding-left: 16px;
				--theme-modal-header-color: #3A3A3A;
				--theme-modal-header-background-color: #F7F7F7;
			}
			div[slot="footer"] {
				padding-left: 16px;
				width: 976px;
				left: 0;
				right: 0;
			}
			.open {
				display: block;
			}
			.close {
				display: none;
			}
			.body {
				height: 785px;
				width: 976px;
				background-color: #FFFFFF;
			}
			.accountSelect {
				height: 64px;
				width: 944px;
				margin-bottom: 8px;
				margin-left: 16px;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
			}
			.accountSelectIcon {
				width: 24px;
				height: 24px;
				float: left;
				margin-left: 16px;
				margin-top: 20px;
				margin-bottom: 20px;
			}
			.accountSelectLabel {
				text-align: left;
				color: #3A3A3A;
				font-size: 16;
				font-weight: bold;
				margin-left: 56px;
				margin-top: 11px;
				line-height: 20px;
			}
			.accountSelectSub {
				text-align: left;
				color: #3A3A3A;
				font-size: 14px;
				margin-left: 56px;
				line-height: 20px;
				margin-top: 2px;
			}
			
			capitec-alert-banner {
				height: 48px;
				width: 944px;
				margin: 18px;
				--theme-alert-banner-info-background-color: #DAF2F4;
				--theme-alert-banner-info-color: #05829B;
				--theme-alert-banner-unsuccessful-red-color: #C83B37;
				--theme-alert-banner-unsuccessful-red-background-color: #F7E2E1
			}
			
			.chooseText {
				margin: 18px;
				text-align: left;
				font-size: 18px;
				line-height: 24px;
				font-weight: 900;
				color: #3A3A3A;
			}
			.savingsPlans, .period {
				height: 64px;
				width: 944px;
				margin: 8px;
				margin-left: 15.5px;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
				display: inline-block;
			}
			.savingsPlanLabel, .periodLabel {
				width: 300px; 
				text-align: left; 
				margin-left: 56px;
				margin-top: 7px;
				margin-bottom: 11px;
			}
			.radioBtn {
				width: 30px;
				float: left;
				margin-top: 20px;
				margin-bottom: 20px;
				margin-left: 17px;
			}
			.periodRadioGroup {
				width: 100%;
				display: inline-block;
			}
			.choosePeriod {
				width: 23%;
				height: 65px;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
				display: inline-block;
				margin-top: 2px;
				margin-left: 14px;
			}
			.choosePeriod:hover {
				border: 2px solid #009DE0;
				border-radius: 4px;
			}
			.choosePeriodFocus {
				border: 2px solid #009DE0;
				border-radius: 4px;
			}
			.choosePeriodLabel{
				text-align: left; 
				margin-left: 56px;
			}
			.period {
				margin-bottom: 0;
			}
			.topLabel {
				font-weight: bold;
				line-height: 20px;
				text-align: left;
				color: #3A3A3A;
				font-size: 16px;
				margin-top: 11px;
			}
			.bottomLabel {
				line-height: 20px;
				text-align: left;
				color: #3A3A3A;
				font-size: 14px;
				margin-top: 2px;
				margin-bottom: 11px;
			}
			.datePicker {
				margin-left: 15.5px;
			}
			.calendar, .rangePicker {
				height: 303px;
				margin-left: 16px;
				--theme-calendar-calendar-width: 345px;
				--theme-date-time-picker-host-max-width: 690px;
			}
			.calendarHeader {
				display: none;
			}
			.email {
				width: 944px;
				height: 48px;
				margin-left: 15.5px;
				text-align: left;
			}
			.seperator {
				width: 944px;
				border: 1px solid #E1E1E1;
				margin-bottom: 30px;
				margin-top: 30px;
			}
			.viewPDFbtn {
				float: right;
				margin-top: -45px;
				margin-right: 15.5px;

			}
			.docLabel {
				text-align: left;
				margin-left: 15.5px;
				line-height: 20px;
			}
			.viewDocument {
				margin-left: 15.5px;
				width: 944px;
				height: 64px;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
			}
			.labelSpace {
				margin-top: 11px;
				width: 472px;
			}
			.show {
				display: block;
				left: 0;
				float: left;
			}
			.hide {
				left: 0;
				display: none;
				float: left;
			}
			capitec-button {
				margin: 16px;
				float: right;
			}

			.pdfView {
				width: 832px;
				height: 996px;
				z-index: 99;
			}
			capitec-group {
				height: 70px;
				display: inline-block;
			}
			.transact:hover {
				border: 2px solid #009DE0;
				border-radius: 4px;
			}
			.save:hover {
				border: 2px solid #00486D;
				border-radius: 4px;
			}
			.credit:hover {
				border: 2px solid #C83C37;
				border-radius: 4px;
			}
			.savingsPlans:hover {
				border: 2px solid #009DE0;
				border-radius: 4px;
			}
			.transactFocus {
				border: 2px solid #009DE0;
				border-radius: 4px;
			}
			.saveFocus {
				border: 2px solid #00486D;
				border-radius: 4px;
			}
			.creditFocus {
				border: 2px solid #C83C37;
				border-radius: 4px;
			}
			.savingsPlanFocus {
				border: 2px solid #009DE0;
				border-radius: 4px;
			}
			.fromTo {
				line-height: 20px;
				color: #3A3A3A;
				text-align: left;
				font-size: 14px;
				margin-top: 16px;
				margin-left: 20px;
				margin-bottom: 4px;
				font-weight: bold;
			}
			.left {
				float: left;
				width: 100px;
				padding: 0;
			}
			.right {
				float: right;
				width: 300px;
			}
			`
        ]
    };

    _webTemplate() {
        return html`
			<capitec-modal class="statementsModal ${this.displayDialog}" type="free" header="${this.statementsHeader}">
			${
            this.displayPDF ?
                this._renderPDFViewer() :
                this._renderStatementsModal()
            }
			</capitec-modal>
		`
    }

    _renderStatementsModal() {
        return html`
		<div slot="body" class="body">
		<capitec-stepper
		layout="horizontal"
		.steps="${[{ title: 'Choose Account' }, { title: "Choose Period" }, { title: "Specify Email and View Documents" }]}"
		active-step-number="${this.currentStep}"
		@step-click="${(e) => this._updateStep(e)}"
		></capitec-stepper>

${
            this.infoOrError === "error" ?
                html`<capitec-alert-banner class="alert error" type="unsuccessful-red" closable>
		<p><b>Notify:</b> ${this.errorBannerMessage}</p>
		</capitec-alert-banner>`:

                html`<capitec-alert-banner class="alert info" type="info" closable>
		<p><b>Notify client:</b> ${this.infoBannerMessage}</p>
		</capitec-alert-banner>`

            }
		

		${
            this.currentStep == 1 ?
                this._renderAccountSelection() :
                this.currentStep == 2 ?
                    this._renderChoosePeriod() :
                    this._renderSpecifyEmail()
            }
	</div>
	<div slot="footer">
			<div class="left">
				<capitec-button class="${this.showHide}" type="clear" label="Back" @click="${(e) => this._navigateSteppers(e, `back`)}"></capitec-button>
			</div>
			<div class="right">
				<capitec-button class="nextBtn" type="primary" label="${this.nextSend}" @click="${(e) => this._navigateSteppers(e, `next`)}"></capitec-button>
				<capitec-button class="cancelBtn" type="clear" label="Cancel" @click="${() => this._cancel()}"></capitec-button>
			</div>
	</div>
		`
	}
	_renderAccountSelection() {
		return html`
			<capitec-label class="chooseText" type="subtitle" label="Choose an Account"></capitec-label>
			<div class="accountSelect transact ${this.focusTransact}" @click="${(e) => this._accountSelectionChanged(e, `savingsAccount`)}">
				<img src="src/images/statement/transact@1x.png" class="accountSelectIcon"/>
				<capitec-label class="accountSelectLabel" label="Savings Account" type="subtitle"></capitec-label>
				<p class="accountSelectSub">Available balance<b> ${ this.availableSavings}</b></p>
			</div>
			<div class="accountSelect save ${this.focusSave}" @click="${(e) => this._accountSelectionChanged(e, `savingsPlan`)}">
				<img src="src/images/statement/savings@1x.png" class="accountSelectIcon"/>
				<capitec-label class="accountSelectLabel" label="Savings Plans" type="subtitle"></capitec-label>
				<p class="accountSelectSub">Available balance<b> ${ this.availableSavingsPlans}</b></p>
			</div>
			<div class="accountSelect credit ${this.focusCredit}" type="credit" subtitle="Available balance " @click="${(e) => this._accountSelectionChanged(e, `credit`)}">
				<img src="src/images/statement/credit@1x.png" class="accountSelectIcon"/>
				<capitec-label class="accountSelectLabel" label="Credit Card" type="subtitle"></capitec-label>
				<p class="accountSelectSub">Available balance<b> ${ this.availableCredit}</b></p>
			</div>

			<div>
				${
					this.savingsPlansSelected ?
					this._renderSavingsPlanSelection():
					html``
				}
			</div>
		`
    }

	_renderSavingsPlanSelection() {
		return html`
			<capitec-label class="chooseText" type="subtitle" label="Choose a Savings Plan"></capitec-label>
			${this.savingsPlans.map(item => html`
				<capitec-radio-group>
					<div class="savingsPlans ${this.savingsPlanFocus}">
						<div class="radioBtn">
							<capitec-radio @click="${(e) => this._savingsPlanChanged(e, item.name)}">
							</capitec-radio>
						</div>
						<div class="periodLabel">
							<capitec-label class="topLabel" label="${item.name}"></capitec-label>
							<capitec-label label="Available balance: ${item.amount}"></capitec-label>
						</div>
					</div>
				</capitec-radio-group>
			`)}
		`
    }

    _renderChoosePeriod() {
        return html`
			<capitec-label class="chooseText" type="subtitle" label="Choose Period"></capitec-label>
				<capitec-radio-group class="periodRadioGroup">
				<capitec-group layout="grid" rows="auto" column="auto">
					<div class="choosePeriod ${this.firstPeriod}">
						<div class="radioBtn">
							<capitec-radio @value-change="${(e) => this._periodChange(e, 30)}">
							</capitec-radio>
						</div>
						<div class="choosePeriodLabel">
							<capitec-label class="topLabel" label="1 month"></capitec-label>
							<capitec-label class="bottomLabel" label="Last 30 days"></capitec-label>
						</div>
					</div>
					<div class="choosePeriod ${this.secondPeriod}">
						<div class="radioBtn">
							<capitec-radio @value-change="${(e) => this._periodChange(e, 90)}">
							</capitec-radio>
						</div>
						<div class="choosePeriodLabel">
							<capitec-label class="topLabel" label="3 months"></capitec-label>
							<capitec-label class="bottomLabel" label="Last 90 days"></capitec-label>
						</div>
					</div>
					<div class="choosePeriod ${this.thirdPeriod}">
						<div class="radioBtn">
							<capitec-radio @value-change="${(e) => this._periodChange(e, 180)}">
							</capitec-radio>
						</div>
						<div class="choosePeriodLabel">
							<capitec-label class="topLabel" label="6 months"></capitec-label>
							<capitec-label class="bottomLabel" label="Last 180 days"></capitec-label>
						</div>
					</div>
					<div class="choosePeriod ${this.forthPeriod}">
						<div class="radioBtn">
							<capitec-radio @value-change="${(e) => this._periodChange(e, 270)}">
							</capitec-radio>
						</div>
						<div class="choosePeriodLabel">
							<capitec-label class="topLabel" label="9 months"></capitec-label>
							<capitec-label class="bottomLabel" label="Last 270 days"></capitec-label>
						</div>
					</div>
				</capitec-group>
				</capitec-radio-group>

					${ this.showDatePicker ?
						this._renderPeriodSelected() :
						html ``
					}
		`
    }

	_renderPeriodSelected() {
		return html `
		<capitec-label class="chooseText" type="subtitle" label="Choose date range"></capitec-label>
		<capitec-radio-group>
					<div class="period">
						<div class="radioBtn">
							<capitec-radio @value-change="${(e) => this._showDateRange(e)}" ?checked="${this.showCalendar}">
							</capitec-radio>
						</div>
						<div class="savingsPlanLabel">
							<capitec-label class="topLabel" label="Choose date range"></capitec-label>
							<capitec-label label="Up to ${this.periodSelected} days"></capitec-label>
						</div>
					</div>
				</capitec-radio-group>

				${
            this.showCalendar ?
                html`
					<capitec-label class="fromTo" label="From and To Date" type="strong"></capitec-label>
					<capitec-date-time-picker
							class="calendar"
							type="range"
							mode="date"
							inputType="calendar"
							startDate= ${this.startDate}
							endDate= ${this.endDate}
							maxDate= ${this.endDate}
							outputType="string"
							@value-change="${(e) => this._calendarSelectionChange(e)}">
					</capitec-date-time-picker>
					` :
                html``
            }
				
		`
    }

    _renderSpecifyEmail() {
        return html`
		<capitec-label class="chooseText" type="subtitle" label="Enter email address"></capitec-label>
		<capitec-text-field class="email" label="Email address" value="${this.email}" error="${this.emailError}" @value-changed="${(e) => this._emailInput(e)}" @value-change="${(e) => this._emailFormatCheck(e)}" @key-input="${() => this._clearErrors()}"></capitec-text-field>
		
		<capitec-label class="chooseText" type="subtitle" label="Confirm email address"></capitec-label>
		<capitec-text-field class="email" label="Email address" value="${this.confirmEmail}" error="${this.confirmError}" @value-changed="${(e) => this._emailInput(e)}" @value-change="${(e) => this._confirmEmailMatch(e)}" @key-input="${() => this._clearErrors()}"></capitec-text-field>

		<hr class="seperator">

		<capitec-label class="chooseText" type="subtitle" label="View document"></capitec-label>
		<div class="viewDocument">
			<div class="labelSpace">
				<capitec-label class="docLabel" label="${this.statementPeriod}" type="subtitle"></capitec-label>
				<capitec-label class="docLabel" label="${this.statmentDays}"></capitec-label>
			</div>
			<capitec-button class="viewPDFbtn" type="clear" label="View Document" @click="${() => this._viewPDF()}"></capitec-button>
		</div>

		`
    }

    _renderPDFViewer() {
        return html`
			<div slot="body" class="body">
			
			</div>
				<capitec-button slot="footer" type="primary" label="Close" class="pdfClose" @click="${this._closePDF}"></capitec-button>

		`
    }

}

window.customElements.define(`horizon-statements-dialog`, StatementsDialog);