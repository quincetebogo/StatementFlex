import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'platform/components/popups/Modal';
import 'app/components/common/HorizonEmailInput';
import 'app/components/common/HorizonPDFViewer';

const ERROR_MESSAGE = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Enter the correct email address`
};

/**
 * Dialog for viewing and emailing documents. 
 * 
 * @export
 * @class ViewAndEmailDocuments
 * @extends Component
 */
export class ViewAndEmailDocuments extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.selectedDocumentToViewIndex = null;
		this.viewPDF = false;
		this.emailAccountsList = [];
		this.email = ``;
		this.confirmEmail = ``;
		this.encodedPDF = ``;
		this.alertBannerMessage = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {Array} emailAccountsList - List of selected accounts details to send proof of payment
	 * @property {String} encodedPDF - Encoded string representation of PDF to be view 
	 * 
	 * @callback loadDocumentContent 
	 * @returns {encodedPDF} - Specified (by some form of ID) PDF to load
	 * 
	 */
	static get properties() {
		return {
			emailAccountsList: { type: Array },
			encodedPDF: { type: String },
			loadDocumentContent: { type: Object },

			selectedDocumentToViewIndex: { state: false },
			viewPDF: { state: false },
			alertBannerMessage: { state: true }
		};
	}

	// ----------------
	// LIFECYCLE EVENTS
	// ----------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _onViewDocumentClick(index) {
		this.selectedDocumentToViewIndex = index;
		this.viewPDF = true;
		this.encodedPDF = await this.loadDocumentContent(this.emailAccountsList[this.selectedDocumentToViewIndex]);
	}

	async _onNextPDFClick() {
		this.selectedDocumentToViewIndex += this.selectedDocumentToViewIndex < this.emailAccountsList.length ? 1 : 0;
		this.encodedPDF = await this.loadDocumentContent(this.emailAccountsList[this.selectedDocumentToViewIndex]);
		this.requestUpdate();
	}

	async _onPreviousPDFClick() {
		this.selectedDocumentToViewIndex -= this.selectedDocumentToViewIndex > 0 ? 1 : 0;
		this.encodedPDF = await this.loadDocumentContent(this.emailAccountsList[this.selectedDocumentToViewIndex]);
		this.requestUpdate();
	}

	_onSendPDFClick(e) {
		const isEmailInputValid = this._validateEmailAddress();

		if (!isEmailInputValid) {
			return;
		}

		this.dispatchEvent(new CustomEvent(`send-email`, {
			detail: {
				documentData: this.encodedPDF,
				email: this.confirmEmail
			}
		}));
	}

	_onCancelSendPDFClick(e) {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_clearAlerts() {
		this.alertBannerMessage = ``;
	}

	_emailValueChanged(e) {
		this.email = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.alertBannerMessage = ERROR_MESSAGE.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_MISMATCH;
		}
	}

	_closePDFViewer() {
		this.viewPDF = false;
		this.dispatchEvent(new CustomEvent(`close-pdf`, {}));
	}
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_REQUIRED;
		}

		return isNullorEmpty(this.alertBannerMessage);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					height: auto;
					--theme-modal-body-padding: 23px 16px;
					--theme-modal-header-padding-left: 24px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-footer-padding: 8px 16px;
					--theme-modal-header-background-color: #F7F7F7;
				}
				capitec-label[label="View Document(s)"] {
					line-height: 24px;
					padding-bottom: 16px;
					padding-top: 16px;
				}
				capitec-label[label="View Document"] {
					line-height: 20px;
					cursor: pointer;
					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
				capitec-label[type="subtitle"] {
					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
				}
				capitec-alert-banner {
					padding-bottom: 24px;
				}
				capitec-alert-banner > capitec-label {
					margin: 16px 0px 16px 0px;
					--theme-label-font-size: 18px;
					--theme-label-font-family: Hind Vadodara;
				}
				horizon-product-tile {
					width: 100%;
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-heading-margin-left: 6px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-radio-disabled-border-color: #E1E1E1;
					--theme-radio-disabled-background-color: #F7F7F7;
				}
				.view-document {
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-detail-top: 20px;
					--theme-product-tile-detail-right: 16px;
					--theme-product-tile-subtitle-font-size: 14px;
				}
				.seperator {
					border: 1px solid #E1E1E1;
					width: 100%;
				}
				capitec-content-box {
					height: 200px;
				}
				horizon-email-input {
					--theme-layout-gap-spacing: 0px;
				}
				horizon-pdf-viewer {
					--theme-horizon-pdf-modal-header-width: auto;
				}
			`
		];
	}

	_webTemplate() {
		return !this.viewPDF ? html`
			<capitec-modal type="form" header="Proof of Payment">
				<div slot="body">
					
					${this._renderAlertBanner()}
					<horizon-email-input
						labelOne="Enter email address"
						labelTwo="Confirm Email"
						email="${this.email}"
						confirmEmail="${this.confirmEmail}"
						?showRequiredError="${this.alertBannerMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
						@value-changed="${(e) => this._emailValueChanged(e)}"
						.callBack="${() => this._clearAlerts()}">
					</horizon-email-input>

					<hr class="seperator">
					
					<capitec-label
						label="View Document(s)"
						type="subtitle">
					</capitec-label>
					
					<capitec-content-box layout="vertical" noPadding>
						${this.emailAccountsList.map((document, index) => this._renderDocumentTiles(document, index))}
					</capitec-content-box>
				</div>
				<capitec-button slot="footer" type="secondary" label="Cancel" @click="${(e) => this._onCancelSendPDFClick(e)}"></capitec-button>
				<capitec-button slot="footer" type="primary" label="Send" @click="${(e) => this._onSendPDFClick(e)}"></capitec-button>
			</capitec-modal>`
		: html`
			<horizon-pdf-viewer
				header="${`${this.emailAccountsList[this.selectedDocumentToViewIndex].title}: Proof of payment`}"
				encodedPDF="${this.encodedPDF}"
				totalPages="${this.emailAccountsList.length}"
				currPage="${this.selectedDocumentToViewIndex + 1}"
				@cancel="${() => this._closePDFViewer()}"
				@next="${() => this._onNextPDFClick()}"
				@previous="${() => this._onPreviousPDFClick()}">
			</horizon-pdf-viewer>`;
	}

	_renderAlertBanner() {
		return this.alertBannerMessage 
		? html`
			<capitec-alert-banner type="unsuccessful-red">
				<capitec-group layout="horizontal">
					<capitec-label
						type="subtitle"
						label="Notify:">
					</capitec-label>
					<capitec-label
						label="${this.alertBannerMessage}">
					</capitec-label>
				</capitec-group>
			</capitec-alert-banner>`
		: html``;
	}


	_renderDocumentTiles(document, index) {
		return html`
			<horizon-product-tile
				class="view-document"
				type="default"
				label="${document.title}"
				subtitle="${document.subtitle}">
				<capitec-label
					slot="detail"
					type="strong"
					label="View Document"
					@click="${() => this._onViewDocumentClick(index)}">
				</capitec-label>
			</horizon-product-tile>
		`;
	}

}

window.customElements.define(`horizon-view-and-send-document`, ViewAndEmailDocuments);

/**
 * When the send button is clicked.
 * 
 * @example <horizon-view-and-send-document... @send-email="${this._handler}"></horizon-view-and-send-document>
 * 
 * @event ViewAndEmailDocuments#send-email
 * @type {Object}
 * @property {Array} documents - List of documents to be sent
 * @property {String} email - Email that the documents will be sent to
 */

/**
 * When the cancel button is clicked.
 * 
 * @example <horizon-view-and-send-document... @cancel="${this._handler}"></horizon-view-and-send-document>
 * 
 * @event ViewAndEmailDocuments#cancel
 * @type {Object} - N/A
 */