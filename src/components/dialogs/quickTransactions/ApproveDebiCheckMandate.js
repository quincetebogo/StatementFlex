import { Component, css, html } from 'platform/elements';
import { convertCentsToRand, formatCurrency, getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'app/components/dialogs/common/DiscardChanges';
import { mandateInfo } from '../../../mocks/DebiCheckMockData';

const MESSAGE = `Confirm the following information to approve the DebiCheck mandate.`;
const WARNING_MESSAGE = ` DebiCheck will not be approved and will result in expired mandates.`;

const ORANGE = "#D4781C";
const NO = 0;
const YES = 1;
const UNANSWERED = 2;
const QUESTIONS = [
    { color: "black", accepted: UNANSWERED },
    { color: "black", accepted: UNANSWERED },
    { color: "black", accepted: UNANSWERED },
    { color: "black", accepted: UNANSWERED }
];

export class ApproveDebiCheckMandate extends Component {

    // --------------
    // INITIALISATION
    // --------------

    constructor() {
        super();
        this.mandateId = ``; //mandateInfo.mandateReference
        this.referenceNumber = ``; //mandateInfo.contractReference
        this.fullName = ``;
        this.installmentAmount = 0; //mandateSummaryList.amount
        this.firstCollectionDate = new Date();//mandateInfo.firstCollectionDate  .substring(0, 10);
        this.collectionDateFrequency = ``;//mandateSummaryList.collectionDate.frequency
        this.accountNumber = ``;
        this.shortName = ``;
        this.today = new Date().toISOString().substr(0, 10);
        this.emailAddress = ``;
        this.alertType = `info`;
        this.approve = false;
        this.showDiscardChangesModal = false;
        this._telemetry = HorizonTelemetry.instance;
        this.horizonStore = HorizonStore.getInstance();

    }

    // ----------
    // PROPERTIES
    // ----------

	/**
	 * @property {String} mandateInfo - Info to be used when referencing the mandate.
	 *
	 * @readonly
	 * @static
	 * @memberof AcceptDebiCheckMandate
	 */
    static get properties() {
        return {
            mandateInfo: { type: Object },
            debiCheckDetails: { type: Object },
            showDiscardChangesModal: { type: Boolean, attribute: false },
            accountNumber: { type: Number },
            clientDetails: { type: Object }
        };
    }


    async _initialise() {

        this._clearAll();

        this.mandateReference = this.debiCheckDetails.mandateReference;
        this.referenceNumber = this.debiCheckDetails.contractReference;
        const callerInformation = this.horizonStore.getCallerInformation();

        this.fullName = this.titleCase(callerInformation.name);

        //TODO: Remove hardcoded data once endpoints are activated


        this.shortName =   this.clientDetails.accountShortName;
        this.emailAddress =  this.clientDetails.emailAddress;
        this.installmentAmount = formatCurrency(convertCentsToRand(this.mandateInfo.amount));
        this.firstCollectionDate = isNullorEmpty(this.debiCheckDetails) ? new Date() : new Date(this.debiCheckDetails.firstCollectionDate).toISOString().substr(0, 10);
        this.collectionDateFrequency = this.mandateInfo.collectionDayFrequency;
        this.today = new Date().toISOString().substr(0, 10);
		this.agreementText = /*this.clientDetails.data.data;*/ ( "PCFET0NUWVBFIEhUTUwgUFVCTElDICItLy9XM0MvL0RURCBIVE1MIDQuMDEgVHJhbnNpdGlvbmFsLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw0L2xvb3NlLmR0ZCI+CjxodG1sIGxhbmc9ImVuLVVTIj4KPGhlYWQ+Cjx0aXRsZT4xMzRfRGViaWNoZWNrX0EmTV9QYXltZW50X0luc3RydWN0aW9uczwvdGl0bGU+CjwhLS0gT3BlblRleHQgRXhzdHJlYW0gVmVyc2lvbiAxNi42LjAgNjQtYml0IChEQkNTKS0tPgo8IS0tIENyZWF0aW9uRGF0ZTogOS8yOC8yMDIxIDEwOjU3OjAyIC0tPgo8IS0tIEZvcjogUmVnaXN0ZXJlZCB0byBDQVBURUMgICAtLT4KPG1ldGEgaHR0cC1lcXVpdj0iQ29udGVudC1UeXBlIiBjb250ZW50PSJ0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgiLz4KPHN0eWxlPgpAbWVkaWEgKG1heC13aWR0aDogNDgwcHgpCnsKdGFibGUge3dpZHRoOjEwMCU7fQppbWcge21heC13aWR0aDoxMDAlOyBoZWlnaHQ6IGF1dG8gIWltcG9ydGFudDt9CnRhYmxlLkVYX1JFU1BPTlNJVkVfVEFCTEVfNDgwIHtkaXNwbGF5OmJsb2NrO30KdGFibGUuRVhfUkVTUE9OU0lWRV9UQUJMRV80ODAgPiB0Ym9keSB7ZGlzcGxheTpibG9jazt9CnRhYmxlLkVYX1JFU1BPTlNJVkVfVEFCTEVfNDgwID4gdGJvZHkgPiB0ciB7ZGlzcGxheTpibG9jazt9CnRhYmxlLkVYX1JFU1BPTlNJVkVfVEFCTEVfNDgwID4gdGJvZHkgPiB0ciA+IHRoIHtkaXNwbGF5OmJsb2NrO30KdGFibGUuRVhfUkVTUE9OU0lWRV9UQUJMRV80ODAgPiB0Ym9keSA+IHRyID4gdGQge2Rpc3BsYXk6YmxvY2s7fQp0YWJsZS5FWF9SRVNQT05TSVZFX1RBQkxFXzQ4MCB0YWJsZSB7dGFibGUtbGF5b3V0OiBhdXRvICFpbXBvcnRhbnQ7fQouRVhfUkVTUE9OU0lWRV9ISURFX0NFTExfNDgwIHtkaXNwbGF5Om5vbmUgIWltcG9ydGFudDt9Cn0KPC9zdHlsZT4KPC9oZWFkPgo8Ym9keSAgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6I0ZGRkZGRjsgIGJhY2tncm91bmQtY29sb3I6ICNGRkZGRkY7IGZvbnQtZmFtaWx5OiBmbGFtYTsiPgo8dGFibGUgd2lkdGg9IjEwMCUiIGNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgYmdjb2xvcj0iI0ZGRkZGRiI+PHRyPjx0ZCBhbGlnbj0iY2VudGVyIiBiZ2NvbG9yPSIjRkZGRkZGIj4KPHRhYmxlIGNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjQ5OSIgcm9sZT0icHJlc2VudGF0aW9uIiAgY2xhc3M9IkVYX1JFU1BPTlNJVkVfVEFCTEVfNDgwIiAKc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7IHRhYmxlLWxheW91dDogZml4ZWQ7Ij48dHI+PHRkIGNsYXNzPSJFWF9SRVNQT05TSVZFX0hJREVfQ0VMTF80ODAiIAp3aWR0aD0iNDk5IiBoZWlnaHQ9IjAiPjwvdGQ+CjwvdHI+Cjx0cj48dGQgdmFsaWduPSJtaWRkbGUiIGFsaWduPSJjZW50ZXIiPjx0YWJsZSBpZD0iYWdyZWVtZW50LWNsYXVzZXMtdGFibGUiIGNlbGxwYWRkaW5nPSIwIiAKY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSI0OTkiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgY29sc3Bhbj0iMiIgCndpZHRoPSIxNzIiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIApjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSIxMDAlIiAgc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7Ij48dHI+PHRkIAogc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuICBzdHlsZT0iZm9udC1mYW1pbHk6ICdBcmlhbCcsIHNlcmlmOyBmb250LXNpemU6IDEycHg7IGxpbmUtaGVpZ2h0OiAxNHB4OyBmb250LXdlaWdodDogYm9sZDsgY29sb3I6IzAwMDAwMDsiPk1hbmRhdGUgClJlZmVyZW5jZSBOdW1iZXI6PC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPHRkIHdpZHRoPSIzMDciICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIApjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSIxMDAlIiAgc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7Ij48dHI+PHRkIAogc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuICBzdHlsZT0iZm9udC1mYW1pbHk6ICdBcmlhbCcsIHNlcmlmOyBmb250LXNpemU6IDEycHg7IGxpbmUtaGVpZ2h0OiAxNHB4OyBmb250LXdlaWdodDogYm9sZDsgY29sb3I6IzAwMDAwMDsiPjIyMDE3MDk8L3NwYW4+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8dHI+PHRkIGNvbHNwYW49IjMiIHdpZHRoPSI0ODkiIGhlaWdodD0iNTUiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIApjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSIxMDAlIiAgc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7Ij48dHI+PHRkIAogc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsgcGFkZGluZy1ib3R0b206IDExcHg7IGxpbmUtaGVpZ2h0OiAxN3B4OyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdBcmlhbCcsIHNlcmlmOyBmb250LXNpemU6IDEycHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjojMDAwMDAwOyI+VGhhbmsgCnlvdSwgTVIuIFdlIGNvbmZpcm0gdGhhdCB5b3UsIE1SIE5hbSBTdXIsIDk1MDgzMDUwMzEwODMsIGFncmVlIHRvIHRoZSBmb2xsb3dpbmc6PC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg5IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKIHN0eWxlPSJtYXJnaW4tdG9wOiAwOyBtYXJnaW4tYm90dG9tOiAwOyBmb250LXNpemU6IDA7Ij48c3BhbiAgc3R5bGU9ImZvbnQtZmFtaWx5OiAnQXJpYWwnLCBzZXJpZjsgZm9udC1zaXplOiAxMnB4OyBsaW5lLWhlaWdodDogMTRweDsgY29sb3I6IzAwMDAwMDsiPjEuMSAKVGhpcyBjYWxsIGlzIHRvIGNvbmZpcm0geW91ciBEZWJpQ2hlY2sgbWFuZGF0ZSBhbmQgdGhlIHBheW1lbnRzIHlvdSBtdXN0IG1ha2UgCnVuZGVyIHRoZSBjcmVkaXQgYWdyZWVtZW50LCBjb250cmFjdCByZWZlcmVuY2UgbnVtYmVyIDE1NDQ3ODY0MzEwMDAxPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg5IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKIHN0eWxlPSJtYXJnaW4tdG9wOiAwOyBtYXJnaW4tYm90dG9tOiAwOyBmb250LXNpemU6IDA7Ij48c3BhbiAgc3R5bGU9ImZvbnQtZmFtaWx5OiAnQXJpYWwnLCBzZXJpZjsgZm9udC1zaXplOiAxMXB4OyBsaW5lLWhlaWdodDogMTNweDsgY29sb3I6IzAwMDAwMDsiPjEuMiAKUGxlYXNlIG5vdGUgdGhhdCB5b3VyIGluc3RhbG1lbnQgb2YgUjE5Jm5ic3A7MTg4LjAwIHdpbGwgYmUgZGVkdWN0ZWQgZnJvbSB5b3VyIApub21pbmF0ZWQgYmFuayBhY2NvdW50IG9uIHRoZSBNTlRIIG9yIGlmIHlvdXIgc2FsYXJ5IG9yIHdhZ2UgaXMgcGFpZCBiZWZvcmUgdGhhdCwgCm9uIGFuIGVhcmxpZXIgZGF0ZSwgd2l0aCBhIGxhc3QgYW1vdW50IG9mIFIxOSZuYnNwOzE4OC4wMCwgdG8gc2F0aXNmeSB5b3VyIG9ibGlnYXRpb25zIAp1bmRlciB0aGUgYWdyZWVtZW50IHdlIG5vdyBtYWtlLiA8L3NwYW4+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8dHI+PHRkIGNvbHNwYW49IjMiIHdpZHRoPSI0ODkiIGhlaWdodD0iMTMiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIApjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSIxMDAlIiAgc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7Ij48dHI+PHRkIAogc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuICBzdHlsZT0iZm9udC1mYW1pbHk6ICdBcmlhbCcsIHNlcmlmOyBmb250LXNpemU6IDExcHg7IGxpbmUtaGVpZ2h0OiAxM3B4OyBjb2xvcjojMDAwMDAwOyI+MS4zJm5ic3A7Jm5ic3A7VGhlIApzdGFydGluZyBkYXRlIG9mIHRoaXMgaW5zdGFsbWVudCBpcyA8L3NwYW4+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8dHI+PHRkIGNvbHNwYW49IjMiIHdpZHRoPSI0ODkiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIApjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSIxMDAlIiAgc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7Ij48dHI+PHRkIAogc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuICBzdHlsZT0iZm9udC1mYW1pbHk6ICdBcmlhbCcsIHNlcmlmOyBmb250LXNpemU6IDExcHg7IGxpbmUtaGVpZ2h0OiAxM3B4OyBjb2xvcjojMDAwMDAwOyI+MS40Jm5ic3A7Jm5ic3A7RG8gCnlvdSB1bmRlcnN0YW5kIGFuZCBhY2NlcHQgdGhhdCB0aGUgZGF0ZSB0aGF0IHdlIHdpbGwgY29sbGVjdCB0aGUgaW5zdGFsbWVudHMgZnJvbSAKeW91IHdpbGwgZWl0aGVyIGJlIG9uIHRoZSBNTlRILCBvciBhbiBlYXJsaWVyIGRhdGUsIGRlcGVuZGluZyBvbiB3aGVuIHlvdXIgc2FsYXJ5IApvciB3YWdlIGlzIHBhaWQuIERvIHlvdSB1bmRlcnN0YW5kIGFuZCBhY2NlcHQgdGhpcz8gPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg5IiBoZWlnaHQ9IjIzIiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKaWQ9ImV4LXRhYmxlMSIgY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iNDkwIiAgY2xhc3M9ImFncmVlbWVudC1xdWVzdGlvbi1yYWRpbyIgCiBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTs7Ij48dHI+PHRkIHdpZHRoPSI0ODAiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIAogc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7OyI+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8dHI+PHRkIGNvbHNwYW49IjMiIHdpZHRoPSI0ODkiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIApjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSIxMDAlIiAgc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7Ij48dHI+PHRkIAogc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuICBzdHlsZT0iZm9udC1mYW1pbHk6ICdBcmlhbCcsIHNlcmlmOyBmb250LXNpemU6IDExcHg7IGxpbmUtaGVpZ2h0OiAxM3B4OyBjb2xvcjojMDAwMDAwOyI+MS41IApUaGUgcGF5bWVudHMgd2lsbCBiZSBtYWRlIGJ5IGVhcmx5IGRlYml0IG9yZGVyIGFnYWluc3QgeW91ciBub21pbmF0ZWQgYWNjb3VudCAKbnVtYmVyIDExMjExMTA5NDkgd2l0aCBDYXBpdGVjIEJhbmsgTGltaXRlZCwgYWJicmV2aWF0ZWQgc2hvcnQgbmFtZSBTQVZJTkdTIEFDQ09VTlQuIApEbyB5b3UgYWdyZWUgd2l0aCB0aGlzPzwvc3Bhbj48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgY29sc3Bhbj0iMyIgd2lkdGg9IjQ4OSIgaGVpZ2h0PSIyOSIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmlkPSJleC10YWJsZTIiIGNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjQ5MCIgIGNsYXNzPSJhZ3JlZW1lbnQtcXVlc3Rpb24tcmFkaW8iIAogc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7OyI+PHRyPjx0ZCB3aWR0aD0iNDgwIiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiAKIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OzsiPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg5IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKIHN0eWxlPSJtYXJnaW4tdG9wOiAwOyBtYXJnaW4tYm90dG9tOiAwOyBmb250LXNpemU6IDA7Ij48c3BhbiAgc3R5bGU9ImZvbnQtZmFtaWx5OiAnQXJpYWwnLCBzZXJpZjsgZm9udC1zaXplOiAxMXB4OyBsaW5lLWhlaWdodDogMTNweDsgY29sb3I6IzAwMDAwMDsiPjEuNiAKVGhlIHBlcm1pc3Npb24gZm9yIHRoZSBiYW5rIHRvIGNvbGxlY3QgaW5zdGFsbWVudHMgaW4gdGhlIGNyZWRpdCBhZ3JlZW1lbnQgd2lsbCAKYWxzbyBhcHBseSB0byB0aGUgYWdyZWVtZW50IHdlIG5vdyBtYWtlLiBEbyB5b3UgdW5kZXJzdGFuZCBhbmQgYWNjZXB0IHdoYXQgSSBoYXZlIApyZWFkIHRvIHlvdT88L3NwYW4+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8dHI+PHRkIGNvbHNwYW49IjMiIHdpZHRoPSI0ODkiIGhlaWdodD0iMjMiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIAppZD0iZXgtdGFibGUzIiBjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSI0OTAiICBjbGFzcz0iYWdyZWVtZW50LXF1ZXN0aW9uLXJhZGlvIiAKIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOzsiPjx0cj48dGQgd2lkdGg9IjQ4MCIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgCiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDs7Ij48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCB2YWxpZ249Im1pZGRsZSIgYWxpZ249ImxlZnQiPjx0YWJsZSBpZD0iZGlzY2xhaW1lci1jbGF1c2VzLXRhYmxlIiBjZWxscGFkZGluZz0iMCIgCmNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iNDk4IiAgc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7Ij48dHI+PHRkIGNvbHNwYW49IjMiIAp3aWR0aD0iNDg4IiBoZWlnaHQ9IjI2IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKIHN0eWxlPSJtYXJnaW4tdG9wOiAwOyBtYXJnaW4tYm90dG9tOiAwOyBmb250LXNpemU6IDA7IHBhZGRpbmctYm90dG9tOiAxMXB4OyBsaW5lLWhlaWdodDogMTdweDsiPjxzcGFuIAogc3R5bGU9ImZvbnQtZmFtaWx5OiAnQXJpYWwnLCBzZXJpZjsgZm9udC1zaXplOiAxMnB4OyBmb250LXdlaWdodDogYm9sZDsgY29sb3I6IzAwMDAwMDsiPlRoYW5rIAp5b3UsIE1SLiBXZSBjb25maXJtIHRoYXQgeW91IGFncmVlIHRvIHRoZSBmb2xsb3dpbmc6IDwvc3Bhbj48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgY29sc3Bhbj0iMyIgd2lkdGg9IjQ4OCIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCiBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gIHN0eWxlPSJmb250LWZhbWlseTogJ0FyaWFsJywgc2VyaWY7IGZvbnQtc2l6ZTogMTFweDsgbGluZS1oZWlnaHQ6IDEzcHg7IGNvbG9yOiMwMDAwMDA7Ij4xLjcgCkRvIHlvdSBoZXJlYnkgYXV0aG9yaXNlIHRoZSBiYW5rIHRvIGRlYml0IHlvdXIgYWNjb3VudD8gPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg4IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKaWQ9ImV4LXRhYmxlNCIgY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iNDg5IiAgY2xhc3M9ImFncmVlbWVudC1xdWVzdGlvbi1yYWRpbyIgCiBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTs7Ij48dHI+PHRkIHdpZHRoPSI0NzkiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIAogc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7OyI+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8dHI+PHRkIGNvbHNwYW49IjMiIHdpZHRoPSI0ODgiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIApjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSIxMDAlIiAgc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7Ij48dHI+PHRkIAogc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuICBzdHlsZT0iZm9udC1mYW1pbHk6ICdBcmlhbCcsIHNlcmlmOyBmb250LXNpemU6IDExcHg7IGxpbmUtaGVpZ2h0OiAxM3B4OyBjb2xvcjojMDAwMDAwOyI+MS44IApQbGVhc2Ugbm90ZSB0aGF0IGlmIHdl4oCZcmUgdW5hYmxlIHRvIGNvbGxlY3QgYW55IGluc3RhbG1lbnQocykgZnJvbSB5b3VyIGFjY291bnQgCmluIGFjY29yZGFuY2Ugd2l0aCB3aGF0IHdlIGhhdmUgYWdyZWVkIHRvIG9uIHRoaXMgY2FsbCwgdGhlbiBzdWNoIHBheW1lbnQocykgbWF5IApiZSBzdWJqZWN0IHRvIGEgdHJhY2tpbmcgcHJvY2Vzcywgd2hlcmVieSB3ZSB3aWxsIGF0dGVtcHQgdG8gY29sbGVjdCB0aGUgaW5zdGFsbWVudChzKSAKZnJvbSB5b3VyIGFjY291bnQgb3ZlciBhIHRyYWNraW5nIHBlcmlvZC4gPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg4IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKIHN0eWxlPSJtYXJnaW4tdG9wOiAwOyBtYXJnaW4tYm90dG9tOiAwOyBmb250LXNpemU6IDA7Ij48c3BhbiAgc3R5bGU9ImZvbnQtZmFtaWx5OiAnQXJpYWwnLCBzZXJpZjsgZm9udC1zaXplOiAxMXB4OyBsaW5lLWhlaWdodDogMTNweDsgY29sb3I6IzAwMDAwMDsiPjEuOSAKSWYgeW91IGhhdmUgYW4gaXNzdWUgd2l0aCBhbnkgZGViaXQgb3JkZXIgbWFkZSBhZ2FpbnN0IHlvdXIgYWNjb3VudCwgeW91IG1heSBkaXNwdXRlIApzdWNoIGRlYml0IG9yZGVyIGluIGFjY29yZGFuY2Ugd2l0aCB0aGUgZGlzcHV0YWJpbGl0eSBydWxlcyBvZiB0aGUgUGF5bWVudHMgQXNzb2NpYXRpb24gCm9mIFNvdXRoIEFmcmljYS4gPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg4IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKIHN0eWxlPSJtYXJnaW4tdG9wOiAwOyBtYXJnaW4tYm90dG9tOiAwOyBmb250LXNpemU6IDA7Ij48c3BhbiAgc3R5bGU9ImZvbnQtZmFtaWx5OiAnQXJpYWwnLCBzZXJpZjsgZm9udC1zaXplOiAxMXB4OyBsaW5lLWhlaWdodDogMTNweDsgY29sb3I6IzAwMDAwMDsiPjEuMTAgCllvdSBjb25maXJtIHRoYXQgYWxsIHRoZSBkZXRhaWxzIHlvdSBoYXZlIHByb3ZpZGVkIG9uIHRoaXMgY2FsbCBhcmUgY29ycmVjdDwvc3Bhbj48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgY29sc3Bhbj0iMyIgd2lkdGg9IjQ4OCIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCiBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gIHN0eWxlPSJmb250LWZhbWlseTogJ0FyaWFsJywgc2VyaWY7IGZvbnQtc2l6ZTogMTFweDsgbGluZS1oZWlnaHQ6IDEzcHg7IGNvbG9yOiMwMDAwMDA7Ij4xLjExIApXcml0dGVuIGNvbmZpcm1hdGlvbiBvZiB3aGF0IHdlIGFncmVlZCB0b2RheSB3aWxsIGJlIHNlbnQgYnkgZW1haWwgdG86IDwvc3Bhbj48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgY29sc3Bhbj0iMyIgd2lkdGg9IjQ4OCIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCiBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gIHN0eWxlPSJmb250LWZhbWlseTogJ0FyaWFsJywgc2VyaWY7IGZvbnQtc2l6ZTogMTFweDsgbGluZS1oZWlnaHQ6IDEzcHg7IGNvbG9yOiMwMDAwMDA7Ij4xLjEyIApQbGVhc2Ugbm90ZSB0aGF0IHRoZSBNYW5kYXRlIFJlZmVyZW5jZSBOdW1iZXIgaXMgMjIwMTcwOTwvc3Bhbj48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgY29sc3Bhbj0iMyIgd2lkdGg9IjQ4OCIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCiBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gIHN0eWxlPSJmb250LWZhbWlseTogJ0FyaWFsJywgc2VyaWY7IGZvbnQtc2l6ZTogMTFweDsgbGluZS1oZWlnaHQ6IDEzcHg7IGNvbG9yOiMwMDAwMDA7Ij4xLjEzIApEYXRlOiAyOC8wOS8yMDIxPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+PC90cj48L3RhYmxlPgo8L2JvZHk+CjwvaHRtbD4K");
    }

    // -------------------
    // LIFECYCLE OVERRIDES
    // -------------------

    connectedCallback() {
        super.connectedCallback();

        this._telemetry.startSpan(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
            "screen": TelemetryScreen.APPROVE_DEBICHECK
        });

        this._initialise();
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this._telemetry.endSpan(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
            "screen": TelemetryScreen.APPROVE_DEBICHECK
        });
    }

    // --------------
    // EVENT HANDLERS
    // --------------

    _cancelClick() {

        this.showDiscardChangesModal = QUESTIONS.some(question => { return question.accepted !== UNANSWERED });

        if (!this.showDiscardChangesModal) {
            this._clearAll();
            this.dispatchEvent(new CustomEvent(`cancel`));
        }       
    }

    _cancelDiscardModal() {
        this.showDiscardChangesModal = false;
        this._telemetry.logEvent(QuickTransactionEvents.DISCARD_CHANGES_CANCEL, {
            "screen": TelemetryScreen.DISCARD_CHANGES,
            "next-screen": TelemetryScreen.DEBICHECK
        });
    }

    _approveClick() {
        this.mandateId = this.mandateInfo.mandateId;
        this.dispatchEvent(new CustomEvent(`approve`, {
            detail: { mandateId: this.mandateId }
        }));
    }

    _checkAccepted() {
        for (let i = 0; i < QUESTIONS.length; i++) {
            if (QUESTIONS[i].accepted == UNANSWERED) {
                return true;
            } else if (QUESTIONS[i].accepted == NO) {
                return true;
            }
        }
        if (!this.approve) {
            return true;
        }
        return false;
    }

    _checkWarning() {
        let returnVal = false;
        QUESTIONS.forEach(key => {
            if (key.accepted == NO) {
                returnVal = true;
            }
        });
        return returnVal;
    }

    _collapseExpander() {
        for (var i = 0; i < 3; i++) {
            if (QUESTIONS[i].accepted !== YES) {
                return true;
            }
        }
        return false;
    }

    _agree(row, val) {
        this.alertType = 'info';
        if (val == YES) {
            QUESTIONS[row].color = "black";
            QUESTIONS[row].accepted = YES;
        } else if (val == NO) {
            QUESTIONS[row].color = ORANGE;
            QUESTIONS[row].accepted = NO;
        }
        //this.requestUpdate();
    }

    _toggleAgreementsAccept(e) {
        this.approve = !this.approve;
        this.requestUpdate();
    }

    _clearAll() {
        QUESTIONS.forEach(question => {
            question.color = 'black';
            question.accepted = UNANSWERED;
        });
    }

    _getFullDate(shortDate) {        
        if (shortDate) {
            const day = shortDate.toString().substr(8, 3);
            const monthNum = parseInt(shortDate.toString().substr(5, 2));
            const month = getMonthName(monthNum - 1);
            const year = shortDate.toString().substr(0, 4);

            return `${day} of ${month} ${year}`;
        }
    }

    titleCase(str) {
        return str.split(' ')
            .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
            .join(' ');
    }

    static get styles() {
        return [
            super.styles,
            css`
                capitec-modal {
					width: 808px;
					height: 882px;

					--theme-modal-free-max-width: 808px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 8px 16px 8px 0px;                    
                }

                .main-cb {
                    height: 754px;
                    border-bottom: 1px solid rgb(225, 225, 225);

                	--theme-container-padding-left: 16px;
                	--theme-container-padding-top: 16px;
                	--theme-container-padding-right: 16px;
                	--theme-container-padding-bottom: 0px;    
                }

				capitec-expander-group {
					width: 776px;

					--theme-expander-border: none;
					--theme-expander-header-height: 48px;
				}

				capitec-expander-group > capitec-expander {
					border: 1px solid #E1E1E1;
					border-radius: 4px;
                    margin-bottom: 8px;

					--theme-expander-indicator-width: 13px;			
					--theme-expander-header-font-size: 16px;
					--theme-expander-header-font-weight: 600;
					--theme-expander-header-font-color: #3A3A3A;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-left: 0px;
					--theme-expander-height: auto;
					--theme-expander-width: 776px;
				}
                capitec-expander-group > capitec-expander[expanded] {
					// --theme-expander-width: 763px;
                    box-shadow: 0px 6px 10px 0.25px rgba(0,0,0,0.07);

                    --theme-expander-border-radius: 5px;
                    --theme-expander-background-color: #F7F7F7;
                }

				capitec-expander-group > capitec-expander > capitec-content-box {
                    --theme-container-padding-right: 16px;
                    --theme-container-padding-top: 16px;
                    background-color: #FFFFFF;  
                    border-radius: 4px;
                }

                capitec-label{
                    height: 20px;
                    width: 81px;
                    color: #3A3A3A;
                    font-family: "Hind Vadodara";
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0;
                    line-height: 20px;
                }
                capitec-alert-banner{
                    font-family: "Hind Vadodara";
                    letter-spacing: 0;
                    line-height: 20px;
					width: 776px;
                
                    --theme-alert-banner-height: 48px;
                    --theme-alert-banner-font-size: 14px;
	                --theme-alert-banner-info-font-color: #3A3A3A;
	                --theme-alert-banner-warning-font-color: #3A3A3A;
	                --theme-alert-banner-unsuccessful-red-font-color: #3A3A3A;
                }

				capitec-check {
					padding-left: 16px;

					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
				}
				capitec-card {
					justify-content: center;
					margin-bottom: 13px;

					--theme-card-min-height: 48px;
				}
			    .agreement-content {
                    --theme-container-padding-left: 16px;
					--theme-container-padding-bottom: 16px;
			    	color: #3A3A3A;
			    	font-family: "Hind Vadodara";
			    	font-size: 16px;
                    border-top: 1px solid #E1E1E1;            
			    }
			    .agreement-content > ol {
			    	margin: 0px;
			    	padding-left: 20px;
                    margin-bottom: 40px;
			    }
			    .agreement-content > ol > li {
			    	padding-left: 15px;
                    margin-bottom: 14px; 
			    }
                .declaration-content{
                    border-top: 1px solid #E1E1E1;
			    	padding-bottom: 0px;
			    	color: #3A3A3A;
			    	font-family: "Hind Vadodara";
			    	font-size: 16px;
                    --theme-container-padding-left: 16px;
			    }
			    .declaration-content > ol {
			    	margin: 0px;
			    	padding-left: 20px;
                    margin-bottom: 40px;
			    }
                .declaration-content > ol > li {
			    	padding-left: 10px;
                    margin-bottom: 14px; 
                    margin-top: 8px;
			    }
                .cb-yesno{
                    margin-top:14px;
                }    
                div[slot="footer"]{
                    padding-right: 8px;
                    width: 808px;
                    margin-right: -12px;
                }
                `
        ];
    }

    _mobileTemplate() {
        _webTemplate();
    }

    _webTemplate() {
        return html`
            <capitec-modal type="free" header-align="left" header="Approve DebiCheck Mandate">
				<div slot="body">				
					<capitec-content-box class="main-cb">
						${this._renderAgreementsAlertBanner()}
						${this._renderAgreementOriginal()}
						${this._renderDiscardChangesModal()}
					</capitec-content-box>
				</div>

				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
        `;
    }

    _renderAgreementsAlertBanner() {
        return html`
            <capitec-alert-banner
            type="${this._checkWarning() ? `warning` : this.alertType}" 
            data-automation-id="debi-check-agreement-alert-banner"
            closable>
				<capitec-group layout="horizontal"  valign="top" gap="none" class="alert-banner">
					<capitec-label
                    label="Notify client: "
					type="default">                    
					</capitec-label>
					${this._checkWarning() ? WARNING_MESSAGE : MESSAGE}
				</capitec-group>
			</capitec-alert-banner>
        `;
    }

	myFunction(index, value){
		if(value == 'YES'){
		console.log(index + " my other function");
		}else if (value == 'NO') {
			console.log("no " + index);
		}
	}

	firstUpdated() {

		var agree = this.shadowRoot.getElementById("agree");
		var declare = this.shadowRoot.getElementById("declare");

		var Base64 = {
			_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
			decode:function(e){
				var t="";
				var n,r,i;var s,o,u,a;
				var index=0;
				e=e.replace(/[^A-Za-z0-9+/=]/g,"");
		
				while(index < e.length){
					s = this._keyStr.indexOf(e.charAt(index++));
					o = this._keyStr.indexOf(e.charAt(index++));
					u = this._keyStr.indexOf(e.charAt(index++));
					a = this._keyStr.indexOf(e.charAt(index++));
					n = s<<2|o>>4;
					r = (o&15)<<4|u>>2;
					i = (u&3)<<6|a;
					t = t + String.fromCharCode(n);
			
					if(u!=64){
						t = t+String.fromCharCode(r)
					}					
					if(a!=64){
						t = t + String.fromCharCode(i)
					}
				}		
				t = Base64._utf8_decode(t);		
				return t
			},
			_utf8_decode:function(e){
				var t="";
				var n=0;
				var r=0;
				var c2=0;
				var c3=0;
		
				while(index<e.length){
					r = e.charCodeAt(n);
					if(r < 128){
						t +=String.fromCharCode(r);
						index++
					} else if(r>191&&r<224){
						c2 = e.charCodeAt(n+1);
						t +=String.fromCharCode((r&31)<<6|c2&63);
						index +=2;
					} else{
						c2 = e.charCodeAt(n+1);
						c3 = e.charCodeAt(n+2);
						t +=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);
						index +=3;
					}
				}				
				return t
			}
		};

		const dec = Base64.decode(this.agreementText);

		var parser = new DOMParser();
		var htmlDoc = parser.parseFromString(dec, 'text/html');

		let radios = htmlDoc.documentElement.getElementsByClassName("agreement-question-radio");

		for (let index = 0; index < radios.length; index++) {
			radios[index].innerHTML = `
				<tbody>
					<tr>
						<td>
							<input type='radio' value='Yes' name='yesRadio${index}' id='yes' onchange="${this.myFunction(index, 'YES')}"/>
							<label for='yes'>Yes</label>
							<input type='radio' value='No' name='yesRadio${index}' id='no'" onclick="${this.myFunction(index, 'NO')}"/>
							<label for='no'>No</label>	
						</td>
					</tr>
				</tbody>
			`;

			htmlDoc.documentElement.getElementsByClassName("agreement-question-radio")[0].addEventListener("click", this.myFunction(1, 'NO'));

			// if(radios[index].checked){
			// 		console.log("checked "+index);
			// }		
		}




		let firstExpander = htmlDoc.getElementById("agreement-clauses-table");
		let secondExpander = htmlDoc.getElementById("disclaimer-clauses-table");

		agree.appendChild(firstExpander);
		declare.appendChild (secondExpander);
	}
	

    _renderAgreementOriginal() {
        return html`
            <capitec-expander-group modeset="single">
				<capitec-expander
				expandbuttonalignment="left"
				label="Agreement"
                .expanded=${this._collapseExpander()}>
					<capitec-content-box 
            		data-automation-id="debi-check-agreement-terms-and-conditions"
            		class="agreement-content"
					id="agree">
					</capitec-content-box>					
				</capitec-expander>

				<capitec-expander
				expandbuttonalignment="left"
				label="Declaration"
                .expanded=${!this._collapseExpander()}>
				${this._renderDeclarationContent()}
				</capitec-expander>
			</capitec-expander-group>
        `;
    }


    _renderDeclarationContent() {
        return html`
			<capitec-content-box  
            data-automation-id="debi-check-agreement-declaration"
            class="declaration-content">
			<div id="declare"></div>                   
				<capitec-card>
					<capitec-check
						label="Please confirm that you agree to these terms and conditions and that you are bound by them?"
						@value-change="${(e) => this._toggleAgreementsAccept(e)}">
					</capitec-check>
				</capitec-card>
			</capitec-content-box>            
        `;
    }

    // _renderYesNo(row) {
    //     return html`
	// 		<div class="cb-yesno">            
    //         	<capitec-radio-group>
	// 				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
	// 					<capitec-radio
    //                         data-automation-id="debi-check-agreement-check-yes"
	// 						class="radio-btn-yes"
	// 						label="Yes"
	// 						@value-change="${(e) => this._agree(e, row, YES)}">
	// 					</capitec-radio>
	// 					<capitec-radio
    //                         data-automation-id="debi-check-agreement-check-no"							
    //                         class="radio-btn-no"
	// 						label="No"
	// 						@value-change="${(e) => this._agree(e, row, NO)}">
	// 					</capitec-radio>
	// 				</capitec-group>
	// 			</capitec-radio-group>
	// 		</div>            
    //     `;
    // }


    _renderFooter() {
        return html`
            <capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button
                    data-automation-id="debi-check-agreement-cancel"
					@click="${(e) => this._cancelClick(e)}"
					label="Cancel">
				</capitec-button>
				<capitec-button
                    data-automation-id="debi-check-agreement-approve"
					type="primary"
					@click="${(e) => this._approveClick(e)}"
					label="Approve"
                    .disabled="${this._checkAccepted()}">
				</capitec-button>
			</capitec-group>
        `;
    }

    _renderDiscardChangesModal() {
        if (this.showDiscardChangesModal) {
            return html`
				<horizon-discard-changes
					@on-cancel="${() => this._cancelDiscardModal()}"
					@on-confirm="${() => this.dispatchEvent(new CustomEvent(`cancel`))}">
				</horizon-discard-changes>`
        }

        return html``;
    }
}

window.customElements.define(`horizon-approve-debicheck-mandate`, ApproveDebiCheckMandate);